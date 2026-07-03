import app from './app';
import env from './core/config/environment';
import connectDB from './core/config/db';
import logger from './core/utils/logger';

const startServer = async () => {
  // Connect Database
  await connectDB();

  const port = env.PORT || 3000;

  const server = app.listen(port, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${port}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    logger.error('Shutting down server...');
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error('Shutting down server...');
    process.exit(1);
  });
};

startServer();
