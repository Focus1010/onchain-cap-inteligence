"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
async function healthRoutes(fastify) {
    fastify.get('/health', async () => {
        const response = {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
        return response;
    });
}
//# sourceMappingURL=health.js.map