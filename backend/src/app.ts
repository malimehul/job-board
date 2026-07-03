import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import env from './core/config/environment';
import logger from './core/utils/logger';
import errorHandler from './core/middlewares/error.middleware';
import authRoutes from './modules/auth/routes/auth.routes';
import jobRoutes from './modules/jobs/routes/job.routes';
import applicationRoutes from './modules/applications/routes/application.routes';
import candidateRoutes from './modules/candidate/routes/candidate.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import recruiterRoutes from './modules/recruiter/routes/recruiter.routes';
import { NotFoundError } from './core/errors/AppError';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Customize this in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Request Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Logging Middleware (Morgan)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recruiter', recruiterRoutes);

// Catch-All 404 Route
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
