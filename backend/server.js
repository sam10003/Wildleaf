// imports
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

// mongoose models
import Species from './models/species.js';
import Occurrence from './models/occurrence.js';
import Dataset from './models/dataset.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wildleaf';
const NODE_ENV = process.env.NODE_ENV || 'development'; 
//node_env is for defining the way it will run like

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
    if (process.env.NODE_ENV === 'development') {
      await Promise.all([
        //here we would clean the db as a white slate
        //Species.deleteMany({}),
        //Occurrence.deleteMany({}),
        //Dataset.deleteMany({}),
      ]);
      console.log('Cleared MongoDB collections');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('.server: Failed to start server:', err);
    process.exit(1);
  }
})();
