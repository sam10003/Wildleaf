// imports
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';


dotenv.config({ path: '../.env'});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wildleaf';
const NODE_ENV = process.env.NODE_ENV || 'development'; 
//node_env is for defining the way it will run like

(async () => {
try {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}
})();
