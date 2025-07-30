import { PrismaClient } from "@prisma/client";
import * as Minio from "minio";
import { z } from "zod";
import crypto from "crypto";

const prisma = new PrismaClient();

// Validation schemas
export const createBucketSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid bucket name format"),
  region: z.string().default("us-east-1"),
  public: z.boolean().default(false),
});

export const uploadFileSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export type CreateBucketInput = z.infer<typeof createBucketSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;

export class StorageService {
  private minioClient: Minio.Client;
  private endpoint: string;
  private port: number;

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT || "localhost";
    this.port = parseInt(process.env.MINIO_PORT || "9000");

    this.minioClient = new Minio.Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    });
  }

  async isMinioRunning(): Promise<boolean> {
    try {
      await this.minioClient.listBuckets();
      return true;
    } catch (error) {
      console.error("MinIO is not running:", error);
      return false;
    }
  }

  async createBucket(userId: string, data: CreateBucketInput) {
    // Check user's bucket limit
    const userBucketCount = await prisma.bucket.count({
      where: { userId },
    });

    const maxBuckets = parseInt(process.env.MAX_BUCKETS_PER_USER || "10");
    if (userBucketCount >= maxBuckets) {
      throw new Error(`Maximum ${maxBuckets} buckets allowed per user`);
    }

    // Generate unique bucket name with user prefix
    const uniqueBucketName = `${userId.slice(-8)}-${data.name}`;

    // Check if bucket already exists
    const existingBucket = await prisma.bucket.findUnique({
      where: { name: uniqueBucketName },
    });

    if (existingBucket) {
      throw new Error("Bucket with this name already exists");
    }

    try {
      // Create bucket in MinIO
      await this.minioClient.makeBucket(uniqueBucketName, data.region);

      // Set bucket policy if public
      if (data.public) {
        const policy = this.generatePublicReadPolicy(uniqueBucketName);
        await this.minioClient.setBucketPolicy(
          uniqueBucketName,
          JSON.stringify(policy)
        );
      }

      // Save bucket metadata in database
      const bucket = await prisma.bucket.create({
        data: {
          name: uniqueBucketName,
          displayName: data.name,
          region: data.region,
          public: data.public,
          userId,
        },
      });

      return {
        ...bucket,
        endpoint: `http://${this.endpoint}:${this.port}`,
        url: data.public
          ? `http://${this.endpoint}:${this.port}/${uniqueBucketName}`
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  async getUserBuckets(userId: string) {
    const buckets = await prisma.bucket.findMany({
      where: { userId },
      include: {
        _count: {
          select: { objects: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get bucket stats from MinIO
    const bucketsWithStats = await Promise.all(
      buckets.map(async (bucket) => {
        try {
          const objects = [];
          const stream = this.minioClient.listObjects(bucket.name, "", true);

          for await (const obj of stream) {
            objects.push(obj);
          }

          const totalSize = objects.reduce(
            (sum, obj) => sum + (obj.size || 0),
            0
          );

          return {
            ...bucket,
            objectCount: objects.length,
            totalSize,
            endpoint: `http://${this.endpoint}:${this.port}`,
            url: bucket.public
              ? `http://${this.endpoint}:${this.port}/${bucket.name}`
              : undefined,
          };
        } catch (error) {
          return {
            ...bucket,
            objectCount: 0,
            totalSize: 0,
            endpoint: `http://${this.endpoint}:${this.port}`,
            url: bucket.public
              ? `http://${this.endpoint}:${this.port}/${bucket.name}`
              : undefined,
          };
        }
      })
    );

    return bucketsWithStats;
  }

  async uploadFile(
    userId: string,
    bucketName: string,
    data: UploadFileInput,
    fileBuffer: Buffer
  ) {
    // Verify bucket ownership
    const bucket = await prisma.bucket.findFirst({
      where: { name: bucketName, userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found");
    }

    try {
      // Upload to MinIO
      const uploadResult = await this.minioClient.putObject(
        bucketName,
        data.key,
        fileBuffer,
        fileBuffer.length,
        {
          "Content-Type": data.contentType || "application/octet-stream",
          ...data.metadata,
        }
      );

      // Save object metadata in database
      const object = await prisma.storageObject.create({
        data: {
          key: data.key,
          bucketId: bucket.id,
          size: fileBuffer.length,
          contentType: data.contentType || "application/octet-stream",
          etag: uploadResult.etag,
          metadata: data.metadata || {},
        },
      });

      return {
        ...object,
        url: bucket.public
          ? `http://${this.endpoint}:${this.port}/${bucketName}/${data.key}`
          : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(userId: string, bucketName: string, key: string) {
    // Verify bucket ownership
    const bucket = await prisma.bucket.findFirst({
      where: { name: bucketName, userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found");
    }

    try {
      const stream = await this.minioClient.getObject(bucketName, key);
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      // Get object metadata
      const stat = await this.minioClient.statObject(bucketName, key);

      return {
        buffer,
        contentType:
          stat.metaData["content-type"] || "application/octet-stream",
        size: stat.size,
        lastModified: stat.lastModified,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  async listObjects(userId: string, bucketName: string, prefix?: string) {
    // Verify bucket ownership
    const bucket = await prisma.bucket.findFirst({
      where: { name: bucketName, userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found");
    }

    try {
      const objects = [];
      const stream = this.minioClient.listObjects(
        bucketName,
        prefix || "",
        false
      );

      for await (const obj of stream) {
        objects.push({
          key: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          etag: obj.etag,
          url: bucket.public
            ? `http://${this.endpoint}:${this.port}/${bucketName}/${obj.name}`
            : undefined,
        });
      }

      return objects;
    } catch (error: any) {
      throw new Error(`Failed to list objects: ${error.message}`);
    }
  }

  async deleteObject(userId: string, bucketName: string, key: string) {
    // Verify bucket ownership
    const bucket = await prisma.bucket.findFirst({
      where: { name: bucketName, userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found");
    }

    try {
      // Delete from MinIO
      await this.minioClient.removeObject(bucketName, key);

      // Delete from database
      await prisma.storageObject.deleteMany({
        where: {
          bucketId: bucket.id,
          key,
        },
      });

      return { message: "Object deleted successfully" };
    } catch (error: any) {
      throw new Error(`Failed to delete object: ${error.message}`);
    }
  }

  async deleteBucket(userId: string, bucketName: string) {
    // Verify bucket ownership
    const bucket = await prisma.bucket.findFirst({
      where: { name: bucketName, userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found");
    }

    try {
      // Check if bucket is empty
      const objects = [];
      const stream = this.minioClient.listObjects(bucketName, "", true);

      for await (const obj of stream) {
        objects.push(obj);
      }

      if (objects.length > 0) {
        throw new Error("Bucket is not empty. Delete all objects first.");
      }

      // Delete bucket from MinIO
      await this.minioClient.removeBucket(bucketName);

      // Delete from database
      await prisma.bucket.delete({
        where: { id: bucket.id },
      });

      return { message: "Bucket deleted successfully" };
    } catch (error: any) {
      throw new Error(`Failed to delete bucket: ${error.message}`);
    }
  }

  async generatePresignedUrl(
    userId: string,
    bucketName: string,
    key: string,
    expiry: number = 3600
  ) {
    // Verify bucket ownership
    const bucket = await prisma.bucket.findFirst({
      where: { name: bucketName, userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found");
    }

    try {
      const url = await this.minioClient.presignedGetObject(
        bucketName,
        key,
        expiry
      );
      return { url, expiresIn: expiry };
    } catch (error: any) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  private generatePublicReadPolicy(bucketName: string) {
    return {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
  }
}
