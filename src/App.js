import { useState, useEffect } from 'react';
import AuthContext from './components/AuthContext';
import mockAPI from './mockAPI';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegisterPage from './components/RegisterPage';
import * as authAPI from './api/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [favorites, setFavorites] = useState([]);
  const [mealPlan, setMealPlan] = useState({});

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('home');
    }
  }, []);

  const login = async (email, password) => {
  const res = await authAPI.login(email, password);
  localStorage.setItem('token', res.token); // Save JWT
  localStorage.setItem('user', JSON.stringify(res.user));
  setUser(res.user);
  setCurrentView('home');
};

const register = async (name, email, password) => {
  await authAPI.register(name, email, password);
  setCurrentView('login'); // Option 1: redirect to login
  // Or, auto-login: call login(name, email, password) for seamless UX
};


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
    setFavorites([]);
    setMealPlan({});
  };

  const addToFavorites = (recipe) => {
    if (!favorites.find(fav => fav.idMeal === recipe.idMeal)) {
      setFavorites([...favorites, recipe]);
    }
  };

  const removeFromFavorites = (recipeId) => {
    setFavorites(favorites.filter(fav => fav.idMeal !== recipeId));
  };

  const addToMealPlan = (recipe, date) => {
    setMealPlan({
      ...mealPlan,
      [date]: [...(mealPlan[date] || []), recipe]
    });
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
          currentView === 'login' ? (
            <LoginPage onSwitchToRegister={() => setCurrentView('register')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setCurrentView('login')} />
          )
        ) : (
          <MainApp currentView={currentView} setCurrentView={setCurrentView} />
        )}
      </div>
    </AuthContext.Provider>
  );
};
export default App;
