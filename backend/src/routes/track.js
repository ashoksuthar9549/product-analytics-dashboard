const express = require('express');
const authenticate = require('../middleware/auth');

const router = express.Router();

// POST /track  — record a feature interaction
router.post('/', authenticate, async (req, res) => {
  // Lazy require: runs AFTER all modules have fully loaded,
  // so Node's module cache is guaranteed to have the real model.
  const { FeatureClick } = require('../models/index');

  try {
    const { feature_name, timestamp } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized — user not identified.' });
    }

    if (!feature_name || !feature_name.trim()) {
      return res.status(400).json({ error: 'feature_name is required.' });
    }

    if (typeof FeatureClick.create !== 'function') {
      console.error('FeatureClick model not loaded correctly:', FeatureClick);
      return res.status(500).json({ error: 'Server model error — please restart.' });
    }

    const click = await FeatureClick.create({
      user_id:      req.user.id,
      feature_name: feature_name.trim(),
      timestamp:    timestamp ? new Date(timestamp) : new Date(),
    });

    return res.status(201).json({
      message: 'Interaction tracked.',
      click: {
        id:           click.id,
        feature_name: click.feature_name,
        timestamp:    click.timestamp,
      },
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Track error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;