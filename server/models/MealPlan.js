const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  }, // Format: YYYY-MM-DD
  recipes: [{
    type: mongoose.Schema.Types.Mixed,
    required: true
  }]
}, {
  timestamps: true
});

// Ensure one meal plan entry per user per date
MealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', MealPlanSchema);

