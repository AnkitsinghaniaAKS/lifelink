const express = require('express');
const Patient = require('../models/Patient');
const Donor = require('../models/Donor');
const { protect } = require('../middleware/auth');
const { findCompatibleDonors } = require('../utils/bloodCompatibility');
const router = express.Router();

// Create patient request
router.post('/request', protect, async (req, res) => {
  try {
    const { bloodType, phone, hospital, urgency } = req.body;
    
    const patient = await Patient.create({
      user: req.user._id,
      bloodType,
      phone,
      hospital,
      urgency
    });
    
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get compatible donors for blood type
router.get('/donors/:bloodType', async (req, res) => {
  try {
    const { bloodType } = req.params;
    const compatibleBloodTypes = findCompatibleDonors(bloodType);
    
    const donors = await Donor.find({ 
      bloodType: { $in: compatibleBloodTypes },
      isAvailable: true 
    }).populate('user', 'name email');
    
    res.json({
      requestedBloodType: bloodType,
      compatibleBloodTypes,
      donors,
      totalDonors: donors.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all patient requests
router.get('/requests', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;