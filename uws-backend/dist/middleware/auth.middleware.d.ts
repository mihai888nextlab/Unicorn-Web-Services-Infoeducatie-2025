import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
declare module "fastify" {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            name: string | null;
        };
    }
}
export declare function createAuthMiddleware(fastify: FastifyInstance): {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
    authenticateJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
};
//# sourceMappingURL=auth.middleware.d.ts.map