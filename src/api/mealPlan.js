const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (err) {
    console.error('Error accessing localStorage:', err);
    return null;
  }
};

export async function getMealPlan() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/mealplan`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch meal plan');
    } else {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  }
  
  return await response.json();
}

export async function addToMealPlan(recipe, date) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/mealplan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      date,
      recipe
    })
  });
  
  if (!response.ok) {
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to add to meal plan');
    } else {
      const text = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
    }
  }
  
  return await response.json();
}

export async function removeFromMealPlan(date, recipeId) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/mealplan/${date}/${recipeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to remove from meal plan');
    } else {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  }
  
  return await response.json();
}

