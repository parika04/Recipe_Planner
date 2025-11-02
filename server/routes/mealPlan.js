const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
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

// GET all meal plans for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const mealPlans = await MealPlan.find({ userId: req.user.id });
    
    // Convert to object format: { "YYYY-MM-DD": [recipes], ... }
    const mealPlanObject = {};
    mealPlans.forEach(plan => {
      mealPlanObject[plan.date] = plan.recipes;
    });

    res.json(mealPlanObject);
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// POST add recipe to meal plan for a specific date
router.post('/', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const { date, recipe } = req.body;

    if (!date || !recipe) {
      return res.status(400).json({ message: 'Date and recipe are required' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Find or create meal plan for this date
    let mealPlan = await MealPlan.findOne({ 
      userId: req.user.id, 
      date 
    });

    if (mealPlan) {
      // Check if recipe already exists for this date
      const recipeExists = mealPlan.recipes.some(r => r.idMeal === recipe.idMeal);
      if (recipeExists) {
        return res.status(400).json({ message: 'Recipe already in meal plan for this date' });
      }
      
      mealPlan.recipes.push(recipe);
      await mealPlan.save();
    } else {
      mealPlan = new MealPlan({
        userId: req.user.id,
        date,
        recipes: [recipe]
      });
      await mealPlan.save();
    }

    res.status(201).json({ message: 'Recipe added to meal plan', mealPlan });
  } catch (err) {
    if (err.code === 11000) {
      // This shouldn't happen with the check above, but handle it just in case
      return res.status(400).json({ message: 'Meal plan entry already exists' });
    }
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// DELETE remove a recipe from meal plan for a specific date
router.delete('/:date/:recipeId', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const { date, recipeId } = req.params;

    const mealPlan = await MealPlan.findOne({
      userId: req.user.id,
      date
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found for this date' });
    }

    mealPlan.recipes = mealPlan.recipes.filter(r => r.idMeal !== recipeId);
    
    // If no recipes left, delete the entire meal plan entry
    if (mealPlan.recipes.length === 0) {
      await MealPlan.findByIdAndDelete(mealPlan._id);
      return res.json({ message: 'Recipe removed from meal plan' });
    }

    await mealPlan.save();
    res.json({ message: 'Recipe removed from meal plan' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// DELETE entire meal plan for a specific date
router.delete('/:date', authMiddleware, async (req, res) => {
  const connectionError = checkMongoConnection(res);
  if (connectionError) return connectionError;

  try {
    const { date } = req.params;

    const mealPlan = await MealPlan.findOneAndDelete({
      userId: req.user.id,
      date
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found for this date' });
    }

    res.json({ message: 'Meal plan deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;

