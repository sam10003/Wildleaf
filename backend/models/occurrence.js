import mongoose from 'mongoose';

const occurrenceSchema = new mongoose.Schema({
  taxonKey: { type: String, required: true },
  country: { type: String },
  limit: { type: Number },
  results: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.model('Occurrence', occurrenceSchema);