import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare class AuthService {
    register(data: RegisterInput): Promise<{
        email: string;
        name: string | null;
        id: string;
        createdAt: Date;
    }>;
    login(data: LoginInput): Promise<{
        id: string;
        email: string;
        name: string | null;
    }>;
    getUserById(id: string): Promise<{
        email: string;
        name: string | null;
        id: string;
        createdAt: Date;
        _count: {
            apps: number;
            deployments: number;
        };
    }>;
    createApiKey(userId: string, name: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        key: string;
    }>;
    validateApiKey(key: string): Promise<{
        email: string;
        name: string | null;
        id: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map