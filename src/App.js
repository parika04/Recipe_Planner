import { useState, useEffect } from 'react';
import AuthContext from './components/AuthContext';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import * as authAPI from './api/auth';
import * as favoritesAPI from './api/favorites';
import * as mealPlanAPI from './api/mealPlan';


const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [favorites, setFavorites] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [resetToken, setResetToken] = useState(null);

  // Load favorites and meal plan from backend
  const loadUserData = async () => {
    try {
      const [favoritesData, mealPlanData] = await Promise.all([
        favoritesAPI.getFavorites(),
        mealPlanAPI.getMealPlan()
      ]);
      setFavorites(favoritesData);
      setMealPlan(mealPlanData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      // If unauthorized, clear storage and redirect to login
      if (err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCurrentView('login');
      }
    }
  };

  useEffect(() => {
    // Check if there's a reset token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      // Clear URL parameters for security
      window.history.replaceState({}, document.title, window.location.pathname);
      setResetToken(tokenFromUrl);
      setCurrentView('reset-password');
      return;
    }

    // Check for stored auth token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('home');
      loadUserData();
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('token', res.token); // Save JWT
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
    setCurrentView('home');
    // Load user's favorites and meal plan
    await loadUserData();
  };

  const register = async (name, email, password) => {
    await authAPI.register(name, email, password);
    setCurrentView('login');
  };

  const handleForgotPasswordSubmit = async (email) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send password reset email');
        } else {
          const text = await response.text();
          // Handle 404 (user doesn't exist)
          if (response.status === 404) {
            throw new Error('User does not exist');
          }
          throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
        }
      }

      return await response.json();
    } catch (err) {
      // Re-throw with more context if it's a network error
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }
      throw err;
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
    setFavorites([]);
    setMealPlan({});
  };

  const addToFavorites = async (recipe) => {
    // Check if user is logged in
    if (!user) {
      throw new Error('You must be logged in to add favorites');
    }

    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Session expired. Please log in again.');
    }

    // Check if already exists
    if (favorites.find(fav => fav.idMeal === recipe.idMeal)) {
      return; // Already favorited, no need to add
    }

    // Save previous state for rollback
    const previousFavorites = favorites;
    
    try {
      // Optimistically update UI
      setFavorites([...favorites, recipe]);
      
      // Sync with backend
      await favoritesAPI.addFavorite(recipe);
    } catch (err) {
      console.error('Failed to add favorite:', err);
      // Revert optimistic update on error
      setFavorites(previousFavorites);
      
      // If token-related error, clear storage and redirect
      if (err.message.includes('token') || err.message.includes('authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCurrentView('login');
      }
      
      throw err; // Re-throw so calling component can handle it
    }
  };

  const removeFromFavorites = async (recipeId) => {
    // Save previous state for rollback
    const previousFavorites = favorites;
    
    try {
      // Optimistically update UI
      setFavorites(favorites.filter(fav => fav.idMeal !== recipeId));
      
      // Sync with backend
      await favoritesAPI.removeFavorite(recipeId);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      // Revert optimistic update on error
      setFavorites(previousFavorites);
      throw err;
    }
  };

  const addToMealPlan = async (recipe, date) => {
    // Check if user is logged in
    if (!user) {
      throw new Error('You must be logged in to add to meal plan');
    }

    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Session expired. Please log in again.');
    }

    // Save previous state for rollback
    const previousMealPlan = mealPlan;
    
    try {
      // Optimistically update UI
      setMealPlan({
        ...mealPlan,
        [date]: [...(mealPlan[date] || []), recipe]
      });
      
      // Sync with backend
      await mealPlanAPI.addToMealPlan(recipe, date);
    } catch (err) {
      console.error('Failed to add to meal plan:', err);
      // Revert optimistic update on error
      setMealPlan(previousMealPlan);
      
      // If token-related error, clear storage and redirect
      if (err.message.includes('token') || err.message.includes('authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCurrentView('login');
      }
      
      throw err;
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      favorites,
      addToFavorites,
      removeFromFavorites,
      mealPlan,
      addToMealPlan
    }}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {!user ? (
          currentView === 'reset-password' ? (
            <ResetPasswordPage 
              token={resetToken}
              onBackToLogin={() => {
                setResetToken(null);
                setCurrentView('login');
              }} 
            />
          ) : currentView === 'login' ? (
            <LoginPage
              onSwitchToRegister={() => setCurrentView('register')}
              onForgotPassword={() => setCurrentView('forgot-password')}
            />
          ) : currentView === 'register' ? (
            <RegisterPage onSwitchToLogin={() => setCurrentView('login')} />
          ) : currentView === 'forgot-password' ? (
            <ForgotPasswordPage
              onBackToLogin={() => setCurrentView('login')}
              onSubmit={handleForgotPasswordSubmit}
            />
          ) : null
        ) : (
          <MainApp currentView={currentView} setCurrentView={setCurrentView} />
        )}
      </div>


    </AuthContext.Provider>
  );
};
export default App;
