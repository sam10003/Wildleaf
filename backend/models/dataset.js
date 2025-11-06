import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  query: { type: String, required: true },
  results: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.model('Dataset', datasetSchema);