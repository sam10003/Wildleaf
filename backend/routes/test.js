import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Backend is up and running!' });
});

export default router;