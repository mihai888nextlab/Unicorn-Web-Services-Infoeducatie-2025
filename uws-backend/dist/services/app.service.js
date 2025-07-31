import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
// Validation schemas
export const createAppSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().optional(),
    memoryLimit: z.number().min(128).max(2048).default(512), // MB
    cpuLimit: z.number().min(0.1).max(4).default(1), // CPU cores
    envVars: z.record(z.string()).default({}),
});
export const updateAppSchema = createAppSchema.partial();
export class AppService {
    // Generate URL-friendly slug from app name
    generateSlug(name, userId) {
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        // Add user ID suffix to ensure uniqueness
        const userSuffix = userId.slice(-6);
        return `${baseSlug}-${userSuffix}`;
    }
    async createApp(userId, data) {
        // Check user's app limit
        const userAppCount = await prisma.app.count({
            where: { userId },
        });
        const maxApps = parseInt(process.env.MAX_APPS_PER_USER || "10");
        if (userAppCount >= maxApps) {
            throw new Error(`Maximum ${maxApps} apps allowed per user`);
        }
        // Generate unique slug
        const slug = this.generateSlug(data.name, userId);
        // Check if slug already exists
        const existingApp = await prisma.app.findUnique({
            where: { slug },
        });
        if (existingApp) {
            throw new Error("App with this name already exists");
        }
        // Create app
        const app = await prisma.app.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                userId,
                memoryLimit: data.memoryLimit,
                cpuLimit: data.cpuLimit,
                envVars: data.envVars,
            },
            include: {
                user: {
                    select: { email: true, name: true },
                },
                _count: {
                    select: { deployments: true },
                },
            },
        });
        return app;
    }
    async getUserApps(userId) {
        const apps = await prisma.app.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { deployments: true },
                },
                deployments: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        status: true,
                        url: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return apps.map((app) => ({
            ...app,
            latestDeployment: app.deployments[0] || null,
            deployments: undefined, // Remove the deployments array, keep only latest
        }));
    }
    async getAppById(appId, userId) {
        const app = await prisma.app.findFirst({
            where: {
                id: appId,
                userId, // Ensure user owns this app
            },
            include: {
                deployments: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                _count: {
                    select: { deployments: true },
                },
            },
        });
        if (!app) {
            throw new Error("App not found");
        }
        return app;
    }
    async updateApp(appId, userId, data) {
        // Verify ownership
        const existingApp = await prisma.app.findFirst({
            where: { id: appId, userId },
        });
        if (!existingApp) {
            throw new Error("App not found");
        }
        // If name is being updated, generate new slug
        let updateData = { ...data };
        if (data.name && data.name !== existingApp.name) {
            updateData.slug = this.generateSlug(data.name, userId);
            // Check if new slug conflicts
            const slugExists = await prisma.app.findUnique({
                where: { slug: updateData.slug },
            });
            if (slugExists && slugExists.id !== appId) {
                throw new Error("App with this name already exists");
            }
        }
        const app = await prisma.app.update({
            where: { id: appId },
            data: updateData,
            include: {
                _count: {
                    select: { deployments: true },
                },
            },
        });
        return app;
    }
    async deleteApp(appId, userId) {
        // Verify ownership
        const app = await prisma.app.findFirst({
            where: { id: appId, userId },
        });
        if (!app) {
            throw new Error("App not found");
        }
        // TODO: Stop any running containers before deletion
        // This will be implemented when we add Docker integration
        await prisma.app.delete({
            where: { id: appId },
        });
        return { message: "App deleted successfully" };
    }
    async getAppBySlug(slug) {
        const app = await prisma.app.findUnique({
            where: { slug },
            include: {
                user: {
                    select: { email: true, name: true },
                },
                deployments: {
                    where: { status: "RUNNING" },
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        return app;
    }
    async updateEnvVars(appId, userId, envVars) {
        const app = await prisma.app.findFirst({
            where: { id: appId, userId },
        });
        if (!app) {
            throw new Error("App not found");
        }
        const updatedApp = await prisma.app.update({
            where: { id: appId },
            data: { envVars },
        });
        return updatedApp;
    }
}
//# sourceMappingURL=app.service.js.map