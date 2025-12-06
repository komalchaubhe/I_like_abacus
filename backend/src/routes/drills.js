import express from 'express';

const router = express.Router();

// Class and level presets for number generation
const CLASS_PRESETS = {
  1: { min: 1, max: 50, digits: 2 },
  2: { min: 10, max: 100, digits: 2 },
  3: { min: 50, max: 500, digits: 3 },
  4: { min: 100, max: 1000, digits: 3 },
  5: { min: 500, max: 5000, digits: 4 },
  6: { min: 1000, max: 10000, digits: 4 },
  7: { min: 5000, max: 50000, digits: 5 },
  8: { min: 10000, max: 100000, digits: 5 }
};

const LEVEL_MULTIPLIERS = {
  1: 0.5,  // Easier
  2: 0.75,
  3: 1.0,  // Normal
  4: 1.25,
  5: 1.5   // Harder
};

// Generate random problem based on class and level
router.post('/generate', (req, res) => {
  try {
    const { class: classNum = 1, level = 1 } = req.body;

    const preset = CLASS_PRESETS[classNum] || CLASS_PRESETS[1];
    const multiplier = LEVEL_MULTIPLIERS[level] || 1.0;

    const adjustedMin = Math.floor(preset.min * multiplier);
    const adjustedMax = Math.floor(preset.max * multiplier);

    const number = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin;

    res.json({
      number,
      class: classNum,
      level,
      digits: preset.digits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check answer - converts abacus state to number and compares
router.post('/check', (req, res) => {
  try {
    const { abacusState, expectedNumber } = req.body;

    if (!abacusState || expectedNumber === undefined) {
      return res.status(400).json({ error: 'Abacus state and expected number are required' });
    }

    // Convert abacus state to number
    // abacusState is an array of rods, each rod has beads
    // Each rod represents a digit place (ones, tens, hundreds, etc.)
    let calculatedNumber = 0;

    for (let i = 0; i < abacusState.length; i++) {
      const rod = abacusState[i];
      const placeValue = Math.pow(10, i);
      
      // Calculate value from beads
      // Upper bead (value 5) is boolean, lower beads (value 1 each) is count (0-4)
      const upperBead = rod.upperBead || false;
      const lowerBeads = rod.lowerBeads || 0;
      const digitValue = (upperBead ? 5 : 0) + lowerBeads;
      
      calculatedNumber += digitValue * placeValue;
    }

    const isCorrect = calculatedNumber === expectedNumber;

    res.json({
      isCorrect,
      calculatedNumber,
      expectedNumber,
      difference: Math.abs(calculatedNumber - expectedNumber)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

