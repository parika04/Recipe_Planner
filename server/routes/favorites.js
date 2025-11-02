const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const authMiddleware = require('../middleware/auth');

// Helper to check MongoDB connection
const checkMongoConnection = (res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection not available. Please check your MongoDB connection.' 
    });
  }
  return null;
};

// GET all favorites for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(favorites.map(fav => fav.recipeData));
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// POST add a favorite
router.post('/', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const { recipeId, recipeData } = req.body;

    if (!recipeId || !recipeData) {
      return res.status(400).json({ message: 'Recipe ID and data are required' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ 
      userId: req.user.id, 
      recipeId 
    });

    if (existing) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }

    const favorite = new Favorite({
      userId: req.user.id,
      recipeId,
      recipeData
    });

    await favorite.save();
    res.status(201).json({ message: 'Recipe added to favorites', favorite: favorite.recipeData });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// DELETE remove a favorite
router.delete('/:recipeId', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const { recipeId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.id,
      recipeId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Recipe removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;

