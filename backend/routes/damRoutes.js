import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint to fetch dam water levels
router.get('/dam-levels', async (req, res) => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/amith-vp/Kerala-Dam-Water-Levels/main/live.json');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching dam data:', error);
    res.status(500).json({ error: 'Failed to fetch dam water levels data' });
  }
});

export default router;