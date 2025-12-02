// app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

//models
import Canon from './models/Canon_list.js';

//routes
import IUCN from './routes/test.js'
import authRoutes from './routes/login/authRoutes.js';
import userRoutes from './routes/login/userRoutes.js';
import trashRoutes from './routes/trash/trashRoutes.js';

dotenv.config();

const app = express();

// Global Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS
const front = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = Array.isArray(front) ? front : String(front).split(',').map(s => s.trim());
// Add production IP to allowed origins
allowedOrigins.push('http://52.203.48.52');
allowedOrigins.push('http://52.203.48.52:80');
allowedOrigins.push('http://52.203.48.52:443');
allowedOrigins.push('https://52.203.48.52');
allowedOrigins.push('https://52.203.48.52:443');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Allow origins that match the production IP pattern (for flexibility)
    if (origin.includes('52.203.48.52')) return callback(null, true);
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use('/IUCN',IUCN);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/trash', trashRoutes);

// General error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
