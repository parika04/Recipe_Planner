const RecipeAPI = {
  
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

export default RecipeAPI;