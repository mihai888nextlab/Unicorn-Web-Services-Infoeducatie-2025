import { AuthService } from "../services/auth.service";
const authService = new AuthService();
// Create middleware factory that takes fastify instance
export function createAuthMiddleware(fastify) {
    async function authenticateJWT(request, reply) {
        console.log("=== AUTHENTICATE JWT CALLED ===");
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            console.log("Received token:", token?.substring(0, 20) + "...");
            if (!token) {
                console.log("No token found");
                return reply.code(401).send({ error: "No token provided" });
            }
            // Verify JWT token using fastify instance
            console.log("About to verify token...");
            const decoded = fastify.jwt.verify(token);
            console.log("Decoded token:", decoded);
            console.log("About to lookup user:", decoded.userId);
            try {
                const user = await authService.getUserById(decoded.userId);
                console.log("Found user:", user.email);
                request.user = user;
                console.log("Middleware completed successfully");
            }
            catch (userError) {
                console.error("User lookup error:", userError.message);
                return reply.code(401).send({ error: "User not found" });
            }
        }
        catch (error) {
            console.error("JWT verification error:", error);
            return reply.code(401).send({ error: "Invalid token" });
        }
    }
    async function authenticateApiKey(request, reply) {
        try {
            const apiKey = request.headers["x-api-key"];
            if (!apiKey) {
                return reply.code(401).send({ error: "No API key provided" });
            }
            const user = await authService.validateApiKey(apiKey);
            request.user = user;
        }
        catch (error) {
            return reply.code(401).send({ error: "Invalid API key" });
        }
    }
    // Middleware that accepts either JWT or API key
    async function authenticate(request, reply) {
        console.log("=== AUTHENTICATE MIDDLEWARE CALLED ===");
        console.log("Headers:", request.headers.authorization);
        const hasJWT = request.headers.authorization?.startsWith("Bearer ");
        const hasApiKey = request.headers["x-api-key"];
        console.log("Has JWT:", hasJWT);
        console.log("Has API Key:", hasApiKey);
        if (hasJWT) {
            console.log("Calling authenticateJWT");
            return authenticateJWT(request, reply);
        }
        else if (hasApiKey) {
            console.log("Calling authenticateApiKey");
            return authenticateApiKey(request, reply);
        }
        else {
            console.log("No authentication provided");
            return reply.code(401).send({ error: "Authentication required" });
        }
    }
    return { authenticate, authenticateJWT, authenticateApiKey };
}
//# sourceMappingURL=auth.middleware.js.map