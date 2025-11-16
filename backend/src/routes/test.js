import express from 'express';
import Canon from '../models/Canon_list.js';

const router = express.Router();

router.get('/:index', async (req, res) => {
  const index = parseInt(req.params.index,10);
  if (isNaN(index) || index < 0) {
    return res.status(400).json({ message: 'Nuh uh'});
  }
  
  try {
    const name = await Canon.findOne().skip(index);
    if (!name){ return res.status(404).json({ message: 'cant find' });}
    res.json(name);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server failed' });
  }
});

export default router;
