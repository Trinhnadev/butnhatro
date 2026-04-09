import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
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

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resendOTP: (data) => api.post('/auth/resend-otp', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Room API
export const roomAPI = {
    getRooms: (params) => api.get('/rooms', { params }),
    getRoom: (id) => api.get(`/rooms/${id}`),
    createRoom: (data) => api.post('/rooms', data),
    updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
    archiveRoom: (id) => api.patch(`/rooms/${id}/archive`),
    unarchiveRoom: (id) => api.patch(`/rooms/${id}/unarchive`),
    deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Booking API
export const bookingAPI = {
    createBooking: (data) => api.post('/bookings', data),
    searchBookings: (phone) => api.get('/bookings/search', { params: { phone } }),
    getBookings: (params) => api.get('/bookings', { params }),
    getMyBookings: () => api.get('/bookings/my'),
    getBooking: (id) => api.get(`/bookings/${id}`),
    updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
    cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
};

// Upload API
export const uploadAPI = {
    uploadImages: (formData) => {
        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    deleteImage: (publicId) => api.delete(`/upload/${publicId}`),
};

export default api;
