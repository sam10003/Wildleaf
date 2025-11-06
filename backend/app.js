// app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import testRouter from './routes/test.js';
import speciesRouter from './routes/gbif/species.js';
import occurrencesRouter from './routes/gbif/occurrences.js';
import datasetRouter from './routes/gbif/dataset.js';

dotenv.config();

const app = express();

// Global Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS
const front = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = Array.isArray(front) ? front : String(front).split(',').map(s => s.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Routes
app.use('/test', testRouter);
app.use('/api/gbif', speciesRouter);
app.use('/api/gbif', occurrencesRouter);
app.use('/api/gbif', datasetRouter);

export default app;