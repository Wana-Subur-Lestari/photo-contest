import axios from 'axios';

const API_BASE = 'https://photo-contest-api-production.up.railway.app/api';
// const API_BASE = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

//contest status
export const getContestStatus = () => api.get('/contest/status');

// Auth
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Photos
export const getPhotos = () => api.get('/photos');
export const getPhoto = (id) => api.get(`/photos/${id}`);

// Rankings
export const submitRankings = (rankings) => api.post('/rankings', rankings);
export const getMyRankings = () => api.get('/rankings/my');
export const getRankingStatus = () => api.get('/rankings/status');

// Leaderboard
export const getLeaderboard = () => api.get('/leaderboard');

// Admin
export const uploadPhoto = (photoData) => api.post('/admin/photos', photoData);
export const deletePhoto = (id) => api.delete(`/admin/photos/${id}`);

export default api;