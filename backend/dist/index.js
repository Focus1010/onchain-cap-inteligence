"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const tokens_1 = require("./routes/tokens");
const health_1 = require("./routes/health");
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || '3001');
const fastify = (0, fastify_1.default)({
    logger: true,
});
// Register CORS
async function registerCors() {
    await fastify.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
}
// Request logging hook
fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
});
fastify.addHook('onSend', async (request, reply, payload) => {
    const startTime = request.startTime;
    if (startTime) {
        const duration = Date.now() - startTime;
        console.log(`${request.method} ${request.url} - ${reply.statusCode} - ${duration}ms`);
    }
});
// Error handler
fastify.setErrorHandler((error, request, reply) => {
    console.error('Error:', error);
    reply.status(500).send({
        error: 'Internal server error',
        details: error.message,
    });
});
// Register routes
async function registerRoutes() {
    await registerCors();
    await fastify.register(health_1.healthRoutes);
    await fastify.register(tokens_1.tokenRoutes);
}
// Start server
async function start() {
    try {
        await registerRoutes();
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
    }
    catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map