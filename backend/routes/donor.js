const express = require('express');
const Donor = require('../models/Donor');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Register as donor
router.post('/register', protect, async (req, res) => {
  try {
    const { bloodType, phone, address, age } = req.body;
    
    const donor = await Donor.create({
      user: req.user._id,
      bloodType,
      phone,
      address,
      age
    });
    
    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all available donors
router.get('/', async (req, res) => {
  try {
    const { bloodType } = req.query;
    const filter = { isAvailable: true };
    if (bloodType) filter.bloodType = bloodType;
    
    const donors = await Donor.find(filter).populate('user', 'name email');
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update availability (simplified)
router.put('/availability/:id', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;