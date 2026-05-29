const API_BASE_URL = 'http://192.168.0.223:5000/api';

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');

// Helper function to set auth token
const setToken = (token) => localStorage.setItem('token', token);

// Helper function to remove auth token
const removeToken = () => localStorage.removeItem('token');

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || getAuthHeaders();

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (name, email, password, role) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    setToken(data.token);
    return data;
  },

  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    return data;
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },

  logout: () => {
    removeToken();
  }
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return await apiRequest('/users');
  },
  getBasic: async () => {
    return await apiRequest('/users/basic');
  },

  getById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },

  create: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Todos API
export const todosAPI = {
  getAll: async () => {
    return await apiRequest('/todos');
  },

  getById: async (id) => {
    return await apiRequest(`/todos/${id}`);
  },

  create: async (todoData) => {
    return await apiRequest('/todos', {
      method: 'POST',
      body: JSON.stringify(todoData)
    });
  },

  update: async (id, todoData) => {
    return await apiRequest(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todoData)
    });
  },

  toggle: async (id) => {
    return await apiRequest(`/todos/${id}/toggle`, {
      method: 'PATCH'
    });
  },

  addAttachment: async (id, attachmentData) => {
    return await apiRequest(`/todos/${id}/attachment`, {
      method: 'POST',
      body: JSON.stringify(attachmentData)
    });
  },

  deleteAttachment: async (id, attachmentId) => {
    return await apiRequest(`/todos/${id}/attachment/${attachmentId}`, {
      method: 'DELETE'
    });
  },

  delete: async (id) => {
    return await apiRequest(`/todos/${id}`, {
      method: 'DELETE'
    });
  }
};

// Groups API
export const groupsAPI = {
  getAll: async () => {
    return await apiRequest('/groups');
  },

  getById: async (id) => {
    return await apiRequest(`/groups/${id}`);
  },

  create: async (groupData) => {
    return await apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },

  update: async (id, groupData) => {
    return await apiRequest(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/groups/${id}`, {
      method: 'DELETE'
    });
  }
};

export { getToken, setToken, removeToken };
