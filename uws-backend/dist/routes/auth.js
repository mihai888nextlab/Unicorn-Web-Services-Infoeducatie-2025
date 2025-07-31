import { AuthService, registerSchema, loginSchema, } from "../services/auth.service";
import { createAuthMiddleware } from "../middleware/auth.middleware";
const authService = new AuthService();
export default async function authRoutes(fastify) {
    const { authenticate } = createAuthMiddleware(fastify);
    // Register new user
    fastify.post("/register", {
        schema: {
            body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    name: { type: "string" },
                },
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                email: { type: "string" },
                                name: { type: "string" },
                                createdAt: { type: "string" },
                            },
                        },
                        token: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const data = registerSchema.parse(request.body);
            const user = await authService.register(data);
            // Generate JWT token
            const token = fastify.jwt.sign({ userId: user.id });
            return reply.code(201).send({
                user,
                token,
            });
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Login user
    fastify.post("/login", {
        schema: {
            body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                email: { type: "string" },
                                name: { type: "string" },
                            },
                        },
                        token: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const data = loginSchema.parse(request.body);
            const user = await authService.login(data);
            // Generate JWT token
            const token = fastify.jwt.sign({ userId: user.id });
            return reply.send({
                user,
                token,
            });
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Test JWT with your actual token
    fastify.post("/verify-token", async (request, reply) => {
        try {
            const { token } = request.body;
            console.log("Verifying token:", token?.substring(0, 20) + "...");
            const decoded = fastify.jwt.verify(token);
            console.log("Decoded successfully:", decoded);
            return { decoded, valid: true };
        }
        catch (error) {
            console.error("Token verification failed:", error.message);
            return reply.code(400).send({ error: error.message, valid: false });
        }
    });
    // Test JWT generation
    fastify.get("/test-jwt", async (request, reply) => {
        try {
            const testToken = fastify.jwt.sign({ userId: "test-user-id" });
            const decoded = fastify.jwt.verify(testToken);
            return {
                token: testToken,
                decoded: decoded,
                working: true,
            };
        }
        catch (error) {
            return reply.code(500).send({ error: error.message, working: false });
        }
    });
    // Get current user profile
    fastify.get("/me", {
        preHandler: [authenticate],
        schema: {
            response: {
                200: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        name: { type: "string" },
                        createdAt: { type: "string" },
                        _count: {
                            type: "object",
                            properties: {
                                apps: { type: "number" },
                                deployments: { type: "number" },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        return request.user;
    });
    // Create API key
    fastify.post("/api-keys", {
        preHandler: [authenticate],
        schema: {
            body: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                },
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        key: { type: "string" },
                        createdAt: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { name } = request.body;
            const apiKey = await authService.createApiKey(request.user.id, name);
            return reply.code(201).send(apiKey);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
}
//# sourceMappingURL=auth.js.map