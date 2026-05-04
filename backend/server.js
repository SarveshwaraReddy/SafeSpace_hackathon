require('dotenv').config();
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const app = require('./src/app');
const database = require('./src/config/database');
const redisClient = require('./src/config/redis');
const { initializeSocket, getSocketManager } = require('./src/config/socket');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const enableClustering = process.env.ENABLE_CLUSTERING === 'true' && isProduction;


// Serve static files from the "public" directory, allowing clients to access the frontend assets such as HTML, CSS, and JavaScript files. This setup enables the server to deliver the necessary resources for the client-side application to function properly when users access the root URL or any other routes that serve static content. By organizing static assets in a dedicated directory, we can efficiently manage and serve the frontend resources while keeping the server code clean and focused on handling API requests and real-time communication.
app.use(express.static('public'))
// Clustering for horizontal scaling on multi-core systems
if (enableClustering && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  const workerCount = Math.min(numCPUs, parseInt(process.env.MAX_WORKERS) || numCPUs);
  
  logger.info(`Master ${process.pid} setting up ${workerCount} workers`);
  
  // Fork workers
  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }
  
  // Handle worker crashes
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Code: ${code}, Signal: ${signal}`);
    logger.info('Starting a new worker...');
    cluster.fork();
  });
  
  // Handle worker online
  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid} is online`);
  });
  
  // Graceful shutdown for master
  process.on('SIGTERM', () => {
    logger.info('Master received SIGTERM, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });
  
} else {
  // Worker process - start the server
  startServer();
}

async function startServer() {
  try {
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize database connection
    await database.connect();
    logger.info('✅ Database connected successfully');
    
    // Initialize Redis connection
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
    
    // Initialize Socket.IO with Redis adapter for horizontal scaling
    const io = initializeSocket(server);
    const socketManager = getSocketManager();
    
    // Make io and socket manager available globally
    app.set('io', io);
    app.set('socketManager', socketManager);
    
    // Graceful shutdown handling
    let isShuttingDown = false;
    
    const gracefulShutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close Socket.IO connections
          await socketManager.close();
          logger.info('Socket.IO server closed');
          
          // Close database connection
          await database.disconnect();
          logger.info('Database disconnected');
          
          // Close Redis connection
          await redisClient.disconnect();
          logger.info('Redis disconnected');
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
    
    // Start server
    server.listen(PORT, () => {
      const workerInfo = enableClustering ? `Worker ${process.pid}` : 'Single instance';
      logger.info(`🚀 Server started successfully`);
      logger.info(`📡 ${workerInfo} running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔌 WebSocket server ready with Redis adapter`);
      logger.info(`🔄 Horizontal scaling ${enableClustering ? 'enabled' : 'disabled'}`);
      
      // Log memory usage
      const memoryUsage = process.memoryUsage();
      logger.info(`💾 Memory usage: RSS=${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap=${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB/${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
      }
    });
    
    // Export server for testing
    if (process.env.NODE_ENV === 'test') {
      module.exports = server;
    }
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = { startServer };