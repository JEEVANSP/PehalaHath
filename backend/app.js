import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/routes.js';
import connectDB from './config/connect.js';
import emergencyRoutes from './routes/emergency.js';
import volunteerRoutes from './routes/volunteers.js';
import emailRoutes from './routes/emailRoutes.js';
import damRoutes from './routes/damRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use Consolidated Routes
app.use('/api', routes);

// Connect to MongoDB
connectDB(process.env.MONGODBURL);

// Routes
app.use('/api/emergency', emergencyRoutes);
app.use('/api/volunteers',volunteerRoutes);
app.use('/api/email',emailRoutes);
app.use('/api/dams',damRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
