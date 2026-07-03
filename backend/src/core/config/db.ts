import mongoose from 'mongoose';
import { env } from './environment.js';
import logger from '../utils/logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

export default connectDB;
