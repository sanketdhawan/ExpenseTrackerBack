import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import app from './app';
import { connectDB } from './config/db';

// ✅ Render-safe PORT (DO NOT hardcode)
const PORT = process.env.PORT || 10000;

/**
 * ✅ CORS CONFIG
 * Allows Angular (local + future prod)
 */
app.use(
  cors({
    origin: [
      'http://localhost:4200',
      // 'https://your-frontend-domain.onrender.com' // optional, add later
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// ✅ REQUIRED for preflight requests (OPTIONS)
app.options('*', cors());

// Optional safety middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Connect DB → Start Server
 */
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
