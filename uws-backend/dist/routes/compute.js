import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import { ComputeService } from "../services/compute.service.js";
const computeService = new ComputeService();
async function computeRoutes(fastify) {
    const { authenticate } = createAuthMiddleware(fastify);
    // Get all instances for user
    fastify.get("/instances", {
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
                            type: { type: "string" },
                            cpu: { type: "number" },
                            memory: { type: "number" },
                            storage: { type: "number" },
                            status: { type: "string" },
                            ipAddress: { type: "string" },
                            region: { type: "string" },
                            createdAt: { type: "string" },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const instances = await computeService.getUserInstances(request.user.id);
            return instances;
        }
        catch (error) {
            return reply.code(500).send({ error: error.message });
        }
    });
    // Create new instance
    fastify.post("/instances", {
        preHandler: [authenticate],
        schema: {
            body: {
                type: "object",
                required: ["name", "type"],
                properties: {
                    name: { type: "string", minLength: 1, maxLength: 50 },
                    type: { type: "string", enum: ["small", "medium", "large"] },
                    region: { type: "string" },
                },
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        type: { type: "string" },
                        cpu: { type: "number" },
                        memory: { type: "number" },
                        storage: { type: "number" },
                        status: { type: "string" },
                        ipAddress: { type: "string" },
                        region: { type: "string" },
                        createdAt: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const data = request.body;
            const instance = await computeService.createInstance(request.user.id, data);
            return reply.code(201).send(instance);
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Start instance
    fastify.post("/instances/:instanceId/start", {
        preHandler: [authenticate],
        schema: {
            params: {
                type: "object",
                properties: {
                    instanceId: { type: "string" },
                },
                required: ["instanceId"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        status: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { instanceId } = request.params;
            const result = await computeService.startInstance(request.user.id, instanceId);
            return result;
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Stop instance
    fastify.post("/instances/:instanceId/stop", {
        preHandler: [authenticate],
        schema: {
            params: {
                type: "object",
                properties: {
                    instanceId: { type: "string" },
                },
                required: ["instanceId"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        status: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { instanceId } = request.params;
            const result = await computeService.stopInstance(request.user.id, instanceId);
            return result;
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Restart instance
    fastify.post("/instances/:instanceId/restart", {
        preHandler: [authenticate],
        schema: {
            params: {
                type: "object",
                properties: {
                    instanceId: { type: "string" },
                },
                required: ["instanceId"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                        status: { type: "string" },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { instanceId } = request.params;
            const result = await computeService.restartInstance(request.user.id, instanceId);
            return result;
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Delete instance
    fastify.delete("/instances/:instanceId", {
        preHandler: [authenticate],
        schema: {
            params: {
                type: "object",
                properties: {
                    instanceId: { type: "string" },
                },
                required: ["instanceId"],
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
    }, async (request, reply) => {
        try {
            const { instanceId } = request.params;
            const result = await computeService.deleteInstance(request.user.id, instanceId);
            return result;
        }
        catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    // Get instance details
    fastify.get("/instances/:instanceId", {
        preHandler: [authenticate],
        schema: {
            params: {
                type: "object",
                properties: {
                    instanceId: { type: "string" },
                },
                required: ["instanceId"],
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        type: { type: "string" },
                        cpu: { type: "number" },
                        memory: { type: "number" },
                        storage: { type: "number" },
                        status: { type: "string" },
                        ipAddress: { type: "string" },
                        region: { type: "string" },
                        createdAt: { type: "string" },
                        metrics: {
                            type: "object",
                            properties: {
                                cpuUsage: { type: "number" },
                                memoryUsage: { type: "number" },
                                diskUsage: { type: "number" },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { instanceId } = request.params;
            const instance = await computeService.getInstanceDetails(request.user.id, instanceId);
            return instance;
        }
        catch (error) {
            return reply.code(404).send({ error: error.message });
        }
    });
}
export default computeRoutes;
//# sourceMappingURL=compute.js.map