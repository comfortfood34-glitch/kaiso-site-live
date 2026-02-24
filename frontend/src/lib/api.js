import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get restaurant configuration
export const getConfig = async () => {
  const response = await api.get('/config');
  return response.data;
};

// Get availability for a specific date
export const getAvailability = async (date) => {
  const response = await api.get(`/reservations/availability/${date}`);
  return response.data;
};

// Create a new reservation
export const createReservation = async (reservationData) => {
  const response = await api.post('/reservations', reservationData);
  return response.data;
};

// Get all reservations (admin)
export const getReservations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.status) params.append('status', filters.status);
  
  const response = await api.get(`/reservations?${params.toString()}`);
  return response.data;
};

// Get reservation by cancel token
export const getReservationByToken = async (token) => {
  const response = await api.get(`/reservations/by-token/${token}`);
  return response.data;
};

// Cancel reservation by token
export const cancelReservation = async (token) => {
  const response = await api.post(`/reservations/cancel/${token}`);
  return response.data;
};

// Admin cancel reservation by ID
export const adminCancelReservation = async (reservationId) => {
  const response = await api.delete(`/reservations/${reservationId}`);
  return response.data;
};

// Get reservation stats
export const getReservationStats = async () => {
  const response = await api.get('/reservations/stats');
  return response.data;
};

export default api;
