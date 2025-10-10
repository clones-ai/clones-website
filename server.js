import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

const app = express();
const port = process.env.PORT || 8080;

// Request ID and logging middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

app.use(pinoHttp({
  logger,
  customReceivedMessage: (req) => `Request received: ${req.method} ${req.url}`,
  customSuccessMessage: (req, res) => `Request completed: ${req.method} ${req.url} - ${res.statusCode}`,
  customErrorMessage: (req, res) => `Request failed: ${req.method} ${req.url} - ${res.statusCode}`,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      id: req.id,
      userAgent: req.headers['user-agent']
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://umami.clones-ai.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: http://localhost:* wss://relay.walletconnect.org wss://www.walletlink.org; frame-src https://verify.walletconnect.org; object-src 'none'; base-uri 'self';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  const healthData = {
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || 'unknown'
  };
  
  req.log.info({ health: healthData }, 'Health check requested');
  res.status(200).json(healthData);
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (path.endsWith('.splinecode')) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (path.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Handle client-side routing - only for non-asset requests
app.get('*', (req, res) => {
  // Don't handle requests for assets
  if (req.url.startsWith('/assets/') || 
      req.url.endsWith('.js') || 
      req.url.endsWith('.css') || 
      req.url.endsWith('.json') ||
      req.url.endsWith('.svg') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.splinecode') ||
      req.url.endsWith('.webm') ||
      req.url.endsWith('.mp4')) {
    return res.status(404).send('Not found');
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  req.log.error({ err, requestId: req.id }, 'Unhandled error');
  res.status(500).json({ 
    error: 'Internal Server Error',
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  logger.info({ port, env: process.env.NODE_ENV }, 'Server started successfully');
});

// Graceful shutdown handling
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  logger.info({ signal }, 'Received shutdown signal');
  
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }
  
  isShuttingDown = true;
  
  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during server shutdown');
      process.exit(1);
    }
    
    logger.info('Server closed successfully');
    
    // Give ongoing requests time to complete
    setTimeout(() => {
      logger.info('Graceful shutdown completed');
      process.exit(0);
    }, 5000);
  });
  
  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});