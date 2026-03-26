import axios from 'axios';

const rawUrl = process.env.REACT_APP_BACKEND_URL || '';
const API_BASE_URL = `${rawUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Public endpoints
export const getConfig = async () => (await api.get('/config')).data;
export const getAvailability = async (date) => (await api.get(`/availability/${date}`)).data;
export const createReservation = async (data) => (await api.post('/reservations', data)).data;
export const getWhatsAppMessage = async (params) => {
  const query = new URLSearchParams(params).toString();
  return (await api.get(`/whatsapp-message?${query}`)).data;
};

// Admin endpoints (with basic auth)
const adminAuth = (username, password) => ({
  auth: { username, password }
});

export const adminGetReservations = async (filters, username, password) => {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.status) params.append('status', filters.status);
  return (await api.get(`/admin/reservations?${params.toString()}`, adminAuth(username, password))).data;
};

export const adminUpdateReservation = async (id, data, username, password) => {
  return (await api.patch(`/admin/reservations/${id}`, data, adminAuth(username, password))).data;
};

export const adminGetStats = async (username, password) => {
  return (await api.get('/admin/stats', adminAuth(username, password))).data;
};

export const adminUpdateConfig = async (data, username, password) => {
  return (await api.post('/admin/config', data, adminAuth(username, password))).data;
};

export const adminAddBlackout = async (data, username, password) => {
  return (await api.post('/admin/blackout', data, adminAuth(username, password))).data;
};

export const adminRemoveBlackout = async (date, username, password) => {
  return (await api.delete(`/admin/blackout/${date}`, adminAuth(username, password))).data;
};

export const adminGetBlackouts = async (username, password) => {
  return (await api.get('/admin/blackout', adminAuth(username, password))).data;
};

export const adminExportCSV = async (dateFrom, dateTo, username, password) => {
  const response = await api.get(`/admin/export?date_from=${dateFrom}&date_to=${dateTo}`, {
    ...adminAuth(username, password),
    responseType: 'blob'
  });
  return response.data;
};

export const adminCreateReservation = async (data, username, password) => {
  return (await api.post('/admin/reservations', data, adminAuth(username, password))).data;
};

// WhatsApp endpoints
export const getWhatsAppStatus = async (username, password) => {
  return (await api.get('/admin/whatsapp/status', adminAuth(username, password))).data;
};

export const resetWhatsApp = async (username, password) => {
  return (await api.post('/admin/whatsapp/reset', {}, adminAuth(username, password))).data;
};

export const reconnectWhatsApp = async (username, password) => {
  return (await api.post('/admin/whatsapp/reconnect', {}, adminAuth(username, password))).data;
};

// Analytics endpoints
export const trackEvent = async (eventData) => {
  try {
    await api.post('/analytics/track', eventData);
  } catch (e) { /* silent fail */ }
};

export const getAnalyticsStats = async (period, username, password) => {
  return (await api.get(`/analytics/stats?period=${period}`, adminAuth(username, password))).data;
};

export default api;
