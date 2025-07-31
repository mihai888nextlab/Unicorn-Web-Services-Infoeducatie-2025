import { z } from "zod";
export declare const createBucketSchema: z.ZodObject<{
    name: z.ZodString;
    region: z.ZodDefault<z.ZodString>;
    public: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    region: string;
    public: boolean;
}, {
    name: string;
    region?: string | undefined;
    public?: boolean | undefined;
}>;
export declare const uploadFileSchema: z.ZodObject<{
    key: z.ZodString;
    contentType: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    contentType?: string | undefined;
    metadata?: Record<string, string> | undefined;
}, {
    key: string;
    contentType?: string | undefined;
    metadata?: Record<string, string> | undefined;
}>;
export type CreateBucketInput = z.infer<typeof createBucketSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export declare class StorageService {
    private minioClient;
    private endpoint;
    private port;
    constructor();
    isMinioRunning(): Promise<boolean>;
    createBucket(userId: string, data: CreateBucketInput): Promise<{
        endpoint: string;
        url: string | undefined;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        region: string;
        public: boolean;
        displayName: string;
    }>;
    getUserBuckets(userId: string): Promise<{
        objectCount: number;
        totalSize: any;
        endpoint: string;
        url: string | undefined;
        _count: {
            objects: number;
        };
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        region: string;
        public: boolean;
        displayName: string;
    }[]>;
    uploadFile(userId: string, bucketName: string, data: UploadFileInput, fileBuffer: Buffer): Promise<{
        url: string | undefined;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        etag: string;
        contentType: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        bucketId: string;
        size: number;
    }>;
    getFile(userId: string, bucketName: string, key: string): Promise<{
        buffer: Buffer<ArrayBuffer>;
        contentType: any;
        size: number;
        lastModified: Date;
    }>;
    listObjects(userId: string, bucketName: string, prefix?: string): Promise<{
        key: any;
        size: any;
        lastModified: any;
        etag: any;
        url: string | undefined;
    }[]>;
    deleteObject(userId: string, bucketName: string, key: string): Promise<{
        message: string;
    }>;
    deleteBucket(userId: string, bucketName: string): Promise<{
        message: string;
    }>;
    generatePresignedUrl(userId: string, bucketName: string, key: string, expiry?: number): Promise<{
        url: string;
        expiresIn: number;
    }>;
    private generatePublicReadPolicy;
}
//# sourceMappingURL=storage.service.d.ts.map