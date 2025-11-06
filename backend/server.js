// server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

// Import your Mongoose models
import Species from './models/species.js';
import Occurrence from './models/occurrence.js';
import Dataset from './models/dataset.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wildleaf';

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      dbName: 'wildleaf',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear collections on startup for fresh testing
    await Promise.all([
      Species.deleteMany({}),
      Occurrence.deleteMany({}),
      Dataset.deleteMany({}),
    ]);
    console.log('Cleared MongoDB collections');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();