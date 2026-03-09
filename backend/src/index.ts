import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rpcConnection } from './lib/rpc';
import { HealthResponse } from './types';
import tokenRoutes from './routes/token';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private port: number;
  private startTime: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    this.startTime = Date.now();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] // Add your frontend domain in production
        : ['http://localhost:3000', 'http://localhost:5173'], // Development origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      const method = req.method;
      const url = req.url;
      const ip = req.ip || req.connection.remoteAddress;
      
      console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
      
      // Add response time logging
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);
      });
      
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const uptime = Date.now() - this.startTime;
      const response: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000) // uptime in seconds
      };
      
      res.json(response);
    });

    // API info endpoint
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

    // API routes
    this.app.use('/api/token', tokenRoutes);

    // 404 handler for undefined routes
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

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);

      // Don't send error details in production
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

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      // Test RPC connection before starting server (optional for demo)
      console.log('Testing RPC connection...');
      const isRpcConnected = await rpcConnection.testConnection();
      
      if (!isRpcConnected) {
        console.warn('⚠️  RPC connection failed, but starting server anyway for demo');
        console.warn('   Set up real ALCHEMY_API_KEY in .env for full functionality');
      } else {
        console.log('✅ RPC connection successful');
      }

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 CHR Backend API Server running on port ${this.port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(`📖 API info: http://localhost:${this.port}/api`);
        console.log(`⏰ Started at: ${new Date().toISOString()}`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Close server, database connections, etc.
  setTimeout(() => {
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  }, 5000); // 5 seconds to complete ongoing requests
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
const server = new Server();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
