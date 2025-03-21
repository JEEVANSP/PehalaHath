import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/routes.js';
import connectDB from './config/connect.js';
import mongoose from 'mongoose';
import emergencyRoutes from './routes/emergency.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use Consolidated Routes
app.use('/api', routes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODBURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/emergency', emergencyRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
