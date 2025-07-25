import React, { useContext } from 'react';
import { ChefHat, LogOut, Heart, Clock } from 'lucide-react';
import AuthContext from './AuthContext';
import RecipeSearch from './RecipeSearch';
import FavoritesView from './FavoritesView';
import MealPlanView from './MealPlanView';

const MainApp = ({ currentView, setCurrentView }) => {
  const { user, logout } = React.useContext(AuthContext);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-800">Recipe Planner</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'home' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                Search Recipes
              </button>
              <button
                onClick={() => setCurrentView('favorites')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'favorites' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Favorites
              </button>
              <button
                onClick={() => setCurrentView('meal-plan')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'meal-plan' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Meal Plan
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Hello, {user.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && <RecipeSearch />}
        {currentView === 'favorites' && <FavoritesView />}
        {currentView === 'meal-plan' && <MealPlanView />}
      </main>
    </div>
  );
};
export default MainApp;
