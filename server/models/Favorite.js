const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipeId: { 
    type: String, 
    required: true 
  },
  recipeData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can't favorite the same recipe twice
FavoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);

