import express from 'express';
import fetch from 'node-fetch';
import Species from '../../models/species.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    // Check if it's already in MongoDB
    let record = await Species.findOne({ scientificName: new RegExp(`^${q}$`, 'i') });
    if (record) {
      console.log(`Found ${q} in MongoDB`);
      return res.json(record);
    }

    // Fetch from Python service if not found
    const response = await fetch(`http://127.0.0.1:6000/species?q=${encodeURIComponent(q)}`);
    if (!response.ok) throw new Error(`Python service returned ${response.status}`);
    const data = await response.json();

    if (!data?.results?.length) {
      return res.status(404).json({ message: 'Species not found in GBIF' });
    }

    const gbifData = data.results[0]; // take first match

    // Store in MongoDB
    const newSpecies = new Species({
      gbifId: gbifData.key,
      scientificName: gbifData.scientificName,
      rank: gbifData.rank,
      status: gbifData.taxonomicStatus,
      kingdom: gbifData.kingdom,
      phylum: gbifData.phylum,
      class: gbifData.class,
      order: gbifData.order,
      family: gbifData.family,
      genus: gbifData.genus,
    });

    await newSpecies.save();
    console.log(`Saved ${q} to MongoDB`);

    // Return the stored data
    res.json(newSpecies);

  } catch (err) {
    console.error('Error fetching species:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;