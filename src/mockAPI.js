const mockAPI = {
  login: async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password) {
      return { token: 'mock-token', user: { id: 1, name: 'John Doe', email } };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (name && email && password) {
      return { token: 'mock-token', user: { id: 1, name, email } };
    }
    throw new Error('Registration failed');
  },
  
  searchRecipes: async (ingredient) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },
  
  getRecipeDetails: async (id) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  }
};

export default mockAPI;