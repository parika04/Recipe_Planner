import React, { useContext } from 'react';
import { Heart } from 'lucide-react';
import AuthContext from './AuthContext';

const RecipeCard = ({ recipe, onClick }) => {
  const { addToFavorites, favorites } = React.useContext(AuthContext);
  const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="w-full h-48 object-cover"
        onClick={onClick}
      />
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2" onClick={onClick}>
          {recipe.strMeal}
        </h4>
        <div className="flex justify-between items-center">
          <button
            onClick={onClick}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            View Recipe
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToFavorites(recipe);
            }}
            className={`p-2 rounded-full ${
              isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            } transition-colors`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
