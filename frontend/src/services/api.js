import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const getUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

export const getUserLists = async (userId) => {
  const response = await api.get(`/users/${userId}/lists/`);
  return response.data;
};

// SOP Lists API
export const getLists = async () => {
  const response = await api.get('/lists/');
  return response.data;
};

export const getList = async (id) => {
  console.log(`🔍 Frontend: Fetching list with ID: ${id}`);
  const response = await api.get(`/lists/${id}`);
  console.log(`📋 Frontend: Received list data:`, response.data);
  return response.data;
};

export const createList = async (listData) => {
  const response = await api.post('/lists/create/', listData);
  return response.data;
};

export const updateList = async (id, listData) => {
  const response = await api.put(`/lists/${id}/update/`, listData);
  return response.data;
};

export const deleteList = async (id) => {
  await api.delete(`/lists/${id}/delete/`);
};

// SOP Items API
export const toggleItemCheck = async (itemId) => {
  const response = await api.post(`/items/${itemId}/toggle/`);
  return response.data;
};

export default api; 