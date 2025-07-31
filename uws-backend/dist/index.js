import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { config } from "dotenv";
// Load environment variables
config();
const fastify = Fastify({
    logger: {
        level: "info",
        transport: {
            target: "pino-pretty",
        },
    },
});
// Register plugins
async function registerPlugins() {
    // CORS
    await fastify.register(cors, {
        origin: ["http://localhost:3000"], // Your Next.js app
        credentials: true,
    });
    // Multipart support for file uploads
    await fastify.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
    });
    // JWT
    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET || "your-secret-key",
    });
    // Debug: Log the JWT secret being used
    console.log("JWT Secret:", process.env.JWT_SECRET || "using default secret");
    // Swagger documentation
    await fastify.register(swagger, {
        swagger: {
            info: {
                title: "Mini Cloud Provider API",
                description: "API for mini cloud provider",
                version: "1.0.0",
            },
            host: "localhost:8000",
            schemes: ["http"],
            consumes: ["application/json"],
            produces: ["application/json"],
        },
    });
    await fastify.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "full",
            deepLinking: false,
        },
    });
}
// Register routes
async function registerRoutes() {
    // Health check
    fastify.get("/health", async (request, reply) => {
        return { status: "ok", timestamp: new Date().toISOString() };
    });
    // API routes
    fastify.register(async function (fastify) {
        // Import routes
        const { default: authRoutes } = await import("./routes/auth.js");
        const { default: appRoutes } = await import("./routes/apps.js");
        const { default: storageRoutes } = await import("./routes/storage.js");
        const { default: computeRoutes } = await import("./routes/compute.js");
        // Authentication routes
        fastify.register(authRoutes, { prefix: "/api/auth" });
        // App management routes
        fastify.register(appRoutes, { prefix: "/api/apps" });
        // Storage routes (S3-compatible)
        fastify.register(storageRoutes, { prefix: "/api/storage" });
        // Compute routes
        fastify.register(computeRoutes, { prefix: "/api/compute" });
    });
}
// Start server
async function start() {
    try {
        await registerPlugins();
        await registerRoutes();
        const port = parseInt(process.env.PORT || "8000");
        const host = process.env.HOST || "0.0.0.0";
        await fastify.listen({ port, host });
        console.log(`🚀 Server running at http://${host}:${port}`);
        console.log(`📚 API Documentation available at http://${host}:${port}/docs`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await fastify.close();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await fastify.close();
    process.exit(0);
});
start();
//# sourceMappingURL=index.js.map