import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., token expired)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
};

// Rooms API
export const roomAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  checkAvailability: (id, checkInDate, checkOutDate) => 
    api.get(`/rooms/${id}/check-availability`, { params: { checkInDate, checkOutDate } }),
};

// Reservations API
export const reservationAPI = {
  getReservations: () => api.get('/reservations'),
  getReservation: (id) => api.get(`/reservations/${id}`),
  getMyReservations: () => api.get('/reservations/me'),
  createReservation: (roomId, reservationData) => 
    api.post(`/reservations/rooms/${roomId}`, reservationData),
  updateReservation: (id, reservationData) => 
    api.put(`/reservations/${id}`, reservationData),
  cancelReservation: (id) => api.delete(`/reservations/${id}`),
};

export default api;
