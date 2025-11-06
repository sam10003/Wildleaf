import express from 'express';
import fetch from 'node-fetch';
import Dataset from '../../models/dataset.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    // Check if it's already in MongoDB
    let record = await Dataset.findOne({ query: new RegExp(`^${q}$`, 'i') });
    if (record) {
      console.log(`Found dataset search for '${q}' in MongoDB`);
      return res.json(record);
    }

    // Fetch from Python service if not found
    const response = await fetch(`http://127.0.0.1:6000/dataset?q=${encodeURIComponent(q)}`);
    if (!response.ok) throw new Error(`Python service returned ${response.status}`);
    const data = await response.json();

    if (!data?.results?.length) {
      return res.status(404).json({ message: 'No datasets found' });
    }

    // Store in MongoDB
    const newDataset = new Dataset({
      query: q,
      results: data.results,
    });

    await newDataset.save();
    console.log(`Saved dataset search '${q}' to MongoDB`);

    res.json(newDataset);
  } catch (err) {
    console.error('Error fetching datasets:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;