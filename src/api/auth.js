const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/auth${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export async function register(name, email, password) {
  return await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export async function login(email, password) {
  return await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}
