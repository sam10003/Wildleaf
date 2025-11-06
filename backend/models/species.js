import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema({
  gbifId: { type: Number, unique: true },
  scientificName: String,
  rank: String,
  status: String,
  kingdom: String,
  phylum: String,
  class: String,
  order: String,
  family: String,
  genus: String,
  lastFetched: { type: Date, default: Date.now }
});

export default mongoose.model('Species', speciesSchema);