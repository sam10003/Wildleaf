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
allowedOrigins.push('http://52.203.48.52');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use('/IUCN',IUCN);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/trash', trashRoutes);

export default app;
