import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors('*'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

app.listen(3000, '192.168.1.82', () =>
  console.log('Server running on port 3000')
);
