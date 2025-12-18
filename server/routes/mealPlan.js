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
    // If multiple MealPlan documents exist for same date, merge their recipes
    const mealPlanObject = {};
    mealPlans.forEach(plan => {
      if (mealPlanObject[plan.date]) {
        // If date already exists, merge recipes arrays
        mealPlanObject[plan.date] = [...mealPlanObject[plan.date], ...plan.recipes];
      } else {
        // First entry for this date
        mealPlanObject[plan.date] = plan.recipes;
      }
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

    // Find existing meal plan for this date (if any)
    let mealPlan = await MealPlan.findOne({ 
      userId: req.user.id, 
      date 
    });

    if (mealPlan) {
      // Allow multiple entries of the same recipe (e.g., breakfast and dinner)
      mealPlan.recipes.push(recipe);
      await mealPlan.save();
    } else {
      // Create new meal plan entry for this date
      mealPlan = new MealPlan({
        userId: req.user.id,
        date,
        recipes: [recipe]
      });
      await mealPlan.save();
    }

    res.status(201).json({ message: 'Recipe added to meal plan', mealPlan });
  } catch (err) {
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

    // Remove all instances of this recipe (since duplicates are now allowed)
    const initialCount = mealPlan.recipes.length;
    mealPlan.recipes = mealPlan.recipes.filter(r => r.idMeal !== recipeId);
    const removedCount = initialCount - mealPlan.recipes.length;
    
    // If no recipes left, delete the entire meal plan entry
    if (mealPlan.recipes.length === 0) {
      await MealPlan.findByIdAndDelete(mealPlan._id);
      return res.json({ 
        message: removedCount > 1 
          ? `${removedCount} recipe instances removed from meal plan` 
          : 'Recipe removed from meal plan' 
      });
    }

    await mealPlan.save();
    res.json({ 
      message: removedCount > 1 
        ? `${removedCount} recipe instances removed from meal plan` 
        : 'Recipe removed from meal plan' 
    });
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

