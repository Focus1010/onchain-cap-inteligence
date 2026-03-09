"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const rpc_1 = require("./lib/rpc");
const token_1 = __importDefault(require("./routes/token"));
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3001');
        this.startTime = Date.now();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: process.env.NODE_ENV === 'production'
                ? ['https://yourdomain.com']
                : ['http://localhost:3000', 'http://localhost:5173'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((req, res, next) => {
            const timestamp = new Date().toISOString();
            const method = req.method;
            const url = req.url;
            const ip = req.ip || req.connection.remoteAddress;
            console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);
            });
            next();
        });
    }
    initializeRoutes() {
        this.app.get('/health', (req, res) => {
            const uptime = Date.now() - this.startTime;
            const response = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: Math.floor(uptime / 1000)
            };
            res.json(response);
        });
        this.app.get('/api', (req, res) => {
            res.json({
                name: 'CHR Backend API',
                version: '1.0.0',
                description: 'Onchain Cap Table Intelligence API',
                endpoints: {
                    health: 'GET /health',
                    token: 'GET /api/token/:address',
                    tokenMetadata: 'GET /api/token/:address/metadata',
                    tokenHolders: 'GET /api/token/:address/holders'
                },
                documentation: 'https://github.com/Focus1010/onchain-cap-inteligence'
            });
        });
        this.app.use('/api/token', token_1.default);
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: `Route ${req.originalUrl} not found`,
                availableEndpoints: [
                    'GET /health',
                    'GET /api',
                    'GET /api/token/:address',
                    'GET /api/token/:address/metadata',
                    'GET /api/token/:address/holders'
                ]
            });
        });
    }
    initializeErrorHandling() {
        this.app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            const isDevelopment = process.env.NODE_ENV === 'development';
            res.status(500).json({
                success: false,
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                details: isDevelopment ? {
                    error: err.message,
                    stack: err.stack
                } : undefined
            });
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }
    async start() {
        try {
            console.log('Testing RPC connection...');
            const isRpcConnected = await rpc_1.rpcConnection.testConnection();
            if (!isRpcConnected) {
                console.warn('⚠️  RPC connection failed, but starting server anyway for demo');
                console.warn('   Set up real ALCHEMY_API_KEY in .env for full functionality');
            }
            else {
                console.log('✅ RPC connection successful');
            }
            this.app.listen(this.port, () => {
                console.log(`🚀 CHR Backend API Server running on port ${this.port}`);
                console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🔗 Health check: http://localhost:${this.port}/health`);
                console.log(`📖 API info: http://localhost:${this.port}/api`);
                console.log(`⏰ Started at: ${new Date().toISOString()}`);
            });
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    setTimeout(() => {
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    }, 5000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
const server = new Server();
server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map