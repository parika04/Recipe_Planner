import React, { useState, useContext } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import AuthContext from './AuthContext';
import mockAPI from '../mockAPI'; 
import RecipeModal from './RecipeModal';

const FavoritesView = () => {
  const { favorites, removeFromFavorites } = React.useContext(AuthContext);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const handleRecipeClick = async (recipe) => {
    try {
      const details = await mockAPI.getRecipeDetails(recipe.idMeal);
      setSelectedRecipe(details);
      setShowRecipeModal(true);
    } catch (error) {
      console.error('Failed to load recipe details:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Your Favorite Recipes</h2>
        <div className="text-gray-600">
          {favorites.length} recipe{favorites.length !== 1 ? 's' : ''}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
          <p className="text-gray-500">Start adding recipes to your favorites to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((recipe) => (
            <div key={recipe.idMeal} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => handleRecipeClick(recipe)}
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 cursor-pointer" onClick={() => handleRecipeClick(recipe)}>
                  {recipe.strMeal}
                </h4>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleRecipeClick(recipe)}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View Recipe
                  </button>
                  <button
                    onClick={() => removeFromFavorites(recipe.idMeal)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRecipeModal && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setShowRecipeModal(false)}
        />
      )}
    </div>
  );
};

export default FavoritesView;
