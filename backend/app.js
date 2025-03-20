import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/routes.js';
import connectDB from './config/connect.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use Consolidated Routes
app.use('/api', routes);

connectDB(process.env.MONGODBURL)

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
