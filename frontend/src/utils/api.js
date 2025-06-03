// API utility functions for making HTTP requests
import axios from "axios"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
}

// Trip API endpoints
export const tripAPI = {
  getAllTrips: (params = {}) => api.get("/trips", { params }),
  getTripById: (id) => api.get(`/trips/${id}`),
  createTrip: (tripData) => api.post("/trips", tripData),
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  likeTrip: (id) => api.post(`/trips/${id}/like`),
  getUserTrips: (userId) => api.get(`/trips/user/${userId}`),
}

// Comment API endpoints
export const commentAPI = {
  getTripComments: (tripId) => api.get(`/comments/trip/${tripId}`),
  createComment: (commentData) => api.post("/comments", commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
}

// Wishlist API endpoints
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (tripId) => api.post(`/wishlist/${tripId}`),
  removeFromWishlist: (tripId) => api.delete(`/wishlist/${tripId}`),
  checkWishlistStatus: (tripId) => api.get(`/wishlist/check/${tripId}`),
}

export default api
