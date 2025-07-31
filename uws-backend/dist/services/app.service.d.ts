import { z } from "zod";
export declare const createAppSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    memoryLimit: z.ZodDefault<z.ZodNumber>;
    cpuLimit: z.ZodDefault<z.ZodNumber>;
    envVars: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    memoryLimit: number;
    cpuLimit: number;
    envVars: Record<string, string>;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    memoryLimit?: number | undefined;
    cpuLimit?: number | undefined;
    envVars?: Record<string, string> | undefined;
}>;
export declare const updateAppSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    memoryLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    cpuLimit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    envVars: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    memoryLimit?: number | undefined;
    cpuLimit?: number | undefined;
    envVars?: Record<string, string> | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    memoryLimit?: number | undefined;
    cpuLimit?: number | undefined;
    envVars?: Record<string, string> | undefined;
}>;
export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export declare class AppService {
    private generateSlug;
    createApp(userId: string, data: CreateAppInput): Promise<{
        user: {
            email: string;
            name: string | null;
        };
        _count: {
            deployments: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        memoryLimit: number;
        cpuLimit: number;
        envVars: import("@prisma/client/runtime/library").JsonValue;
        slug: string;
    }>;
    getUserApps(userId: string): Promise<{
        latestDeployment: {
            status: import(".prisma/client").$Enums.DeploymentStatus;
            id: string;
            createdAt: Date;
            url: string | null;
        };
        deployments: undefined;
        _count: {
            deployments: number;
        };
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        memoryLimit: number;
        cpuLimit: number;
        envVars: import("@prisma/client/runtime/library").JsonValue;
        slug: string;
    }[]>;
    getAppById(appId: string, userId: string): Promise<{
        deployments: {
            status: import(".prisma/client").$Enums.DeploymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            url: string | null;
            version: string;
            appId: string;
            gitUrl: string | null;
            gitBranch: string | null;
            gitCommit: string | null;
            buildLogs: string | null;
            containerId: string | null;
            port: number | null;
        }[];
        _count: {
            deployments: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        memoryLimit: number;
        cpuLimit: number;
        envVars: import("@prisma/client/runtime/library").JsonValue;
        slug: string;
    }>;
    updateApp(appId: string, userId: string, data: UpdateAppInput): Promise<{
        _count: {
            deployments: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        memoryLimit: number;
        cpuLimit: number;
        envVars: import("@prisma/client/runtime/library").JsonValue;
        slug: string;
    }>;
    deleteApp(appId: string, userId: string): Promise<{
        message: string;
    }>;
    getAppBySlug(slug: string): Promise<({
        user: {
            email: string;
            name: string | null;
        };
        deployments: {
            status: import(".prisma/client").$Enums.DeploymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            url: string | null;
            version: string;
            appId: string;
            gitUrl: string | null;
            gitBranch: string | null;
            gitCommit: string | null;
            buildLogs: string | null;
            containerId: string | null;
            port: number | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        memoryLimit: number;
        cpuLimit: number;
        envVars: import("@prisma/client/runtime/library").JsonValue;
        slug: string;
    }) | null>;
    updateEnvVars(appId: string, userId: string, envVars: Record<string, string>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        memoryLimit: number;
        cpuLimit: number;
        envVars: import("@prisma/client/runtime/library").JsonValue;
        slug: string;
    }>;
}
//# sourceMappingURL=app.service.d.ts.map