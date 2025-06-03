// Authentication service
import httpClient from "../utils/httpClient"
import { API_ENDPOINTS } from "../utils/constants"

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await httpClient.get(API_ENDPOINTS.AUTH.PROFILE)
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await httpClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData)
    return response.data
  },

  // Logout user (client-side)
  logout: () => {
    localStorage.removeItem("token")
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token")
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("token")
  },

  // Store token
  setToken: (token) => {
    localStorage.setItem("token", token)
  },
}
