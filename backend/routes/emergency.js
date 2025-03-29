import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/nearby-centers', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      console.error('Missing coordinates');
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    // Hardcoded emergency centers
    const emergencyCenters = [
      {
        name: "Government General Hospital",
        address: "Park Town, Chennai",
        location: {
          lat: 13.0827,
          lng: 80.2707
        },
        type: "hospital",
        distance: "2.5 km",
        status: "Open",
        openingHours: ["24/7"],
        phone: "+91-44-25305000",
        website: "https://www.ggchennai.org",
        rating: "4.5"
      },
      {
        name: "Apollo Hospital",
        address: "Greams Road, Chennai",
        location: {
          lat: 13.0569,
          lng: 80.2425
        },
        type: "hospital",
        distance: "3.1 km",
        status: "Open",
        openingHours: ["24/7"],
        phone: "+91-44-28290200",
        website: "https://www.apollohospitals.com",
        rating: "4.8"
      },
      {
        name: "Fortis Malar Hospital",
        address: "Adyar, Chennai",
        location: {
          lat: 12.9916,
          lng: 80.2339
        },
        type: "hospital",
        distance: "4.2 km",
        status: "Open",
        openingHours: ["24/7"],
        phone: "+91-44-42892222",
        website: "https://www.fortismalar.com",
        rating: "4.3"
      },
      {
        name: "Chennai Central Fire Station",
        address: "Park Town, Chennai",
        location: {
          lat: 13.0827,
          lng: 80.2707
        },
        type: "fire",
        distance: "2.5 km",
        status: "Open",
        openingHours: ["24/7"],
        phone: "+91-44-25305000",
        website: "N/A",
        rating: "N/A"
      },
      {
        name: "Chennai Central Police Station",
        address: "Park Town, Chennai",
        location: {
          lat: 13.0827,
          lng: 80.2707
        },
        type: "police",
        distance: "2.5 km",
        status: "Open",
        openingHours: ["24/7"],
        phone: "+91-44-25305000",
        website: "N/A",
        rating: "N/A"
      }
    ];

    console.log('Total emergency centers found:', emergencyCenters.length);
    res.json({ centers: emergencyCenters });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch emergency centers' });
  }
});

export default router; 