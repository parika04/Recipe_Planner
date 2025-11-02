import React, { useState } from 'react';
import { Heart, X, Plus } from 'lucide-react';
import AuthContext from './AuthContext';

const RecipeModal = ({ recipe, onClose }) => {
  const { addToFavorites, favorites, addToMealPlan } = React.useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState('');
  const [isAddingToMealPlan, setIsAddingToMealPlan] = useState(false);
  const [mealPlanError, setMealPlanError] = useState('');
  const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);

  const handleAddToFavorites = async () => {
    try {
      await addToFavorites(recipe);
      // Update UI if successful
      // The context will update automatically
    } catch (err) {
      const errorMessage = err.message || 'Failed to add to favorites';
      alert(errorMessage);
      
      // If it's a token/auth error, the App.js will handle the redirect
      // But we can provide more context here
      if (errorMessage.includes('token') || errorMessage.includes('authentication') || errorMessage.includes('log in')) {
        console.warn('Authentication issue detected');
      }
    }
  };

  const handleAddToMealPlan = async () => {
    if (!selectedDate) return;
    
    setIsAddingToMealPlan(true);
    setMealPlanError('');
    
    try {
      await addToMealPlan(recipe, selectedDate);
      alert('Recipe added to meal plan!');
      setSelectedDate(''); // Clear the date input
    } catch (err) {
      setMealPlanError(err.message || 'Failed to add to meal plan');
    } finally {
      setIsAddingToMealPlan(false);
    }
  };

  const getIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
      }
    }
    return ingredients;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{recipe.strMeal}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="w-full rounded-lg shadow-md mb-6"
              />
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToFavorites}
                  disabled={isFavorite}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFavorite
                      ? 'bg-red-100 text-red-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Add to Meal Plan</h3>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddToMealPlan}
                    disabled={!selectedDate || isAddingToMealPlan}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {mealPlanError && (
                  <p className="text-red-600 text-sm mt-2">{mealPlanError}</p>
                )}
              </div>
            </div>
            
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {getIngredients().map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                <div className="prose prose-sm max-w-none">
                  {recipe.strInstructions.split('\n').map((step, index) => (
                    step.trim() && (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {step.trim()}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
