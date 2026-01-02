import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';

const app = express();

/**
 * ✅ CORS MUST BE FIRST
 * This handles browser preflight (OPTIONS)
 */
app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'https://expensetrackerback-2.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// ✅ Explicit preflight handling
app.options('*', cors());

/**
 * ✅ Body parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Routes
 */
app.use('/api/auth', authRoutes);

/**
 * ✅ Health check (useful for Render)
 */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
