import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
const prisma = new PrismaClient();
// Validation schemas
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export class AuthService {
    async register(data) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error("User already exists with this email");
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
        return user;
    }
    async login(data) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        // Check password
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid email or password");
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }
    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                _count: {
                    select: {
                        apps: true,
                        deployments: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async createApiKey(userId, name) {
        // Generate random API key
        const key = `mk_${Math.random()
            .toString(36)
            .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        const apiKey = await prisma.apiKey.create({
            data: {
                name,
                key,
                userId,
            },
            select: {
                id: true,
                name: true,
                key: true,
                createdAt: true,
            },
        });
        return apiKey;
    }
    async validateApiKey(key) {
        const apiKey = await prisma.apiKey.findUnique({
            where: { key },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
        if (!apiKey) {
            throw new Error("Invalid API key");
        }
        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() },
        });
        return apiKey.user;
    }
}
//# sourceMappingURL=auth.service.js.map