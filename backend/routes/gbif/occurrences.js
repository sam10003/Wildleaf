import express from 'express';
import fetch from 'node-fetch';
import Occurrence from '../../models/occurrence.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { taxon_key, country, limit = 5 } = req.query;
  if (!taxon_key) return res.status(400).json({ error: 'Missing query parameter taxon_key' });

  try {
    // Check if it's already in MongoDB
    let record = await Occurrence.findOne({ taxonKey: taxon_key });
    if (record) {
      console.log(`Found occurrences for taxon ${taxon_key} in MongoDB`);
      return res.json(record);
    }

    // Fetch from Python service if not found
    const response = await fetch(
      `http://127.0.0.1:6000/occurrence?taxon_key=${encodeURIComponent(taxon_key)}&country=${encodeURIComponent(
        country || ''
      )}&limit=${limit}`
    );

    if (!response.ok) throw new Error(`Python service returned ${response.status}`);
    const data = await response.json();

    if (!data?.results?.length) {
      return res.status(404).json({ message: 'No occurrences found for this taxon' });
    }

    // Store in MongoDB
    const newOccurrence = new Occurrence({
      taxonKey: taxon_key,
      country,
      limit,
      results: data.results,
    });

    await newOccurrence.save();
    console.log(`Saved occurrences for taxon ${taxon_key} to MongoDB`);

    res.json(newOccurrence);
  } catch (err) {
    console.error('Error fetching occurrences:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;