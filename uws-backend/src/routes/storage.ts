import { FastifyInstance } from "fastify";
import {
  StorageService,
  createBucketSchema,
  uploadFileSchema,
} from "../services/storage.service.js";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

const storageService = new StorageService();

async function storageRoutes(fastify: FastifyInstance) {
  const { authenticate } = createAuthMiddleware(fastify);

  // Create bucket
  fastify.post(
    "/buckets",
    {
      preHandler: [authenticate],
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 3,
              maxLength: 63,
              pattern: "^[a-z0-9][a-z0-9-]*[a-z0-9]$",
            },
            region: { type: "string" },
            public: { type: "boolean" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              displayName: { type: "string" },
              region: { type: "string" },
              public: { type: "boolean" },
              endpoint: { type: "string" },
              url: { type: "string" },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = createBucketSchema.parse(request.body);
        const bucket = await storageService.createBucket(
          request.user!.id,
          data
        );

        return reply.code(201).send(bucket);
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  // List user's buckets
  fastify.get(
    "/buckets",
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                displayName: { type: "string" },
                region: { type: "string" },
                public: { type: "boolean" },
                objectCount: { type: "number" },
                totalSize: { type: "number" },
                endpoint: { type: "string" },
                url: { type: "string" },
                createdAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const buckets = await storageService.getUserBuckets(request.user!.id);
        return buckets;
      } catch (error: any) {
        return reply.code(500).send({ error: error.message });
      }
    }
  );

  // Upload file to bucket
  fastify.post(
    "/buckets/:bucketName/objects",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const { bucketName } = request.params as { bucketName: string };

        // Handle multipart file upload
        const data = await request.file();

        if (!data) {
          return reply.code(400).send({ error: "No file provided" });
        }

        const buffer = await data.toBuffer();
        const key = (data.fields.key?.value as string) || data.filename;

        if (!key) {
          return reply.code(400).send({ error: "File key is required" });
        }

        const uploadData = {
          key,
          contentType: data.mimetype,
          metadata: {},
        };

        const object = await storageService.uploadFile(
          request.user!.id,
          bucketName,
          uploadData,
          buffer
        );

        return reply.code(201).send(object);
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  // List objects in bucket
  fastify.get(
    "/buckets/:bucketName/objects",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            bucketName: { type: "string" },
          },
          required: ["bucketName"],
        },
        querystring: {
          type: "object",
          properties: {
            prefix: { type: "string" },
          },
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                size: { type: "number" },
                lastModified: { type: "string" },
                etag: { type: "string" },
                url: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { bucketName } = request.params as { bucketName: string };
        const { prefix } = request.query as { prefix?: string };

        const objects = await storageService.listObjects(
          request.user!.id,
          bucketName,
          prefix
        );
        return objects;
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );

  // Download file from bucket
  fastify.get(
    "/buckets/:bucketName/objects/:key",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            bucketName: { type: "string" },
            key: { type: "string" },
          },
          required: ["bucketName", "key"],
        },
      },
    },
    async (request, reply) => {
      try {
        const { bucketName, key } = request.params as {
          bucketName: string;
          key: string;
        };

        const file = await storageService.getFile(
          request.user!.id,
          bucketName,
          key
        );

        reply.header("Content-Type", file.contentType);
        reply.header("Content-Length", file.size);
        reply.header("Last-Modified", file.lastModified.toUTCString());

        return reply.send(file.buffer);
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );

  // Delete object
  fastify.delete(
    "/buckets/:bucketName/objects/:key",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            bucketName: { type: "string" },
            key: { type: "string" },
          },
          required: ["bucketName", "key"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { bucketName, key } = request.params as {
          bucketName: string;
          key: string;
        };

        const result = await storageService.deleteObject(
          request.user!.id,
          bucketName,
          key
        );
        return result;
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );

  // Delete bucket
  fastify.delete(
    "/buckets/:bucketName",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            bucketName: { type: "string" },
          },
          required: ["bucketName"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { bucketName } = request.params as { bucketName: string };

        const result = await storageService.deleteBucket(
          request.user!.id,
          bucketName
        );
        return result;
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  // Generate presigned URL for secure access
  fastify.post(
    "/buckets/:bucketName/objects/:key/presigned-url",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            bucketName: { type: "string" },
            key: { type: "string" },
          },
          required: ["bucketName", "key"],
        },
        body: {
          type: "object",
          properties: {
            expiresIn: { type: "number", minimum: 1, maximum: 604800 }, // Max 7 days
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              url: { type: "string" },
              expiresIn: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { bucketName, key } = request.params as {
          bucketName: string;
          key: string;
        };
        const { expiresIn = 3600 } = request.body as { expiresIn?: number };

        const result = await storageService.generatePresignedUrl(
          request.user!.id,
          bucketName,
          key,
          expiresIn
        );

        return result;
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );
}

export default storageRoutes;
