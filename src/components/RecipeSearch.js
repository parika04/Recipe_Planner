import React, { useState } from 'react';
import { Search } from 'lucide-react';
import mockAPI from '../mockAPI'; // We'll prepare this next
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';

const RecipeSearch = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const handleSearch = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    const firstIngredient = ingredients.split(',')[0].trim();
    
    try {
      const results = await mockAPI.searchRecipes(firstIngredient);
      setRecipes(results.slice(0, 12)); // Limit to 12 results
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = async (recipe) => {
    setLoading(true);
    try {
      const details = await mockAPI.getRecipeDetails(recipe.idMeal);
      setSelectedRecipe(details);
      setShowRecipeModal(true);
    } catch (error) {
      console.error('Failed to load recipe details:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setIngredients('');
    setRecipes([]);
    setSelectedRecipe(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          What's in Your Kitchen?
        </h2>
        <p className="text-xl text-gray-600">
          Enter ingredient you want to find delicious recipes for!
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="max-w-2xl mx-auto">
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Enter your ingredient:
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. tomatoes, garlic, onions..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSearch}
              disabled={loading || !ingredients.trim()}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Searching...' : 'Search Recipes'}
            </button>
            
            <button
              onClick={clearSearch}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.idMeal}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setShowRecipeModal(false)}
        />
      )}
    </div>
  );
};

export default RecipeSearch;
