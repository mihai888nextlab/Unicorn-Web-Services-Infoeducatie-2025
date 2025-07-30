import { FastifyInstance } from "fastify";
import {
  AppService,
  createAppSchema,
  updateAppSchema,
} from "../services/app.service";
import { createAuthMiddleware } from "../middleware/auth.middleware";

const appService = new AppService();

export default async function appRoutes(fastify: FastifyInstance) {
  const { authenticate } = createAuthMiddleware(fastify);
  // Get all user's apps
  fastify.get(
    "/",
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
                slug: { type: "string" },
                description: { type: "string" },
                memoryLimit: { type: "number" },
                cpuLimit: { type: "number" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
                _count: {
                  type: "object",
                  properties: {
                    deployments: { type: "number" },
                  },
                },
                latestDeployment: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "string" },
                    status: { type: "string" },
                    url: { type: "string" },
                    createdAt: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const apps = await appService.getUserApps(request.user!.id);
        return apps;
      } catch (error: any) {
        return reply.code(500).send({ error: error.message });
      }
    }
  );

  // Create new app
  fastify.post(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 50 },
            description: { type: "string" },
            memoryLimit: { type: "number", minimum: 128, maximum: 2048 },
            cpuLimit: { type: "number", minimum: 0.1, maximum: 4 },
            envVars: { type: "object" },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              slug: { type: "string" },
              description: { type: "string" },
              memoryLimit: { type: "number" },
              cpuLimit: { type: "number" },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = createAppSchema.parse(request.body);
        const app = await appService.createApp(request.user!.id, data);

        return reply.code(201).send(app);
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  // Get specific app
  fastify.get(
    "/:appId",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            appId: { type: "string" },
          },
          required: ["appId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              slug: { type: "string" },
              description: { type: "string" },
              memoryLimit: { type: "number" },
              cpuLimit: { type: "number" },
              envVars: { type: "object" },
              createdAt: { type: "string" },
              deployments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    status: { type: "string" },
                    version: { type: "string" },
                    url: { type: "string" },
                    createdAt: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { appId } = request.params as { appId: string };
        const app = await appService.getAppById(appId, request.user!.id);

        return app;
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );

  // Update app
  fastify.put(
    "/:appId",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            appId: { type: "string" },
          },
          required: ["appId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 50 },
            description: { type: "string" },
            memoryLimit: { type: "number", minimum: 128, maximum: 2048 },
            cpuLimit: { type: "number", minimum: 0.1, maximum: 4 },
            envVars: { type: "object" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { appId } = request.params as { appId: string };
        const data = updateAppSchema.parse(request.body);

        const app = await appService.updateApp(appId, request.user!.id, data);
        return app;
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  // Delete app
  fastify.delete(
    "/:appId",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            appId: { type: "string" },
          },
          required: ["appId"],
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
        const { appId } = request.params as { appId: string };
        const result = await appService.deleteApp(appId, request.user!.id);

        return result;
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );

  // Update environment variables
  fastify.put(
    "/:appId/env",
    {
      preHandler: [authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            appId: { type: "string" },
          },
          required: ["appId"],
        },
        body: {
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { appId } = request.params as { appId: string };
        const envVars = request.body as Record<string, string>;

        const app = await appService.updateEnvVars(
          appId,
          request.user!.id,
          envVars
        );
        return {
          message: "Environment variables updated",
          envVars: app.envVars,
        };
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );
}
