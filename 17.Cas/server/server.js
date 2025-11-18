import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cors());

// RUTE
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// ERROR HANDLING
app.use(notFoundHandler); // 404
app.use(errorHandler); // Global error handler

// DATABASE CONNECTION I SERVER START
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
