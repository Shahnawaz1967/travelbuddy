// Trip service
import httpClient from "../utils/httpClient"
import { API_ENDPOINTS } from "../utils/constants"

export const tripService = {
  // Get all trips with optional filters
  getAllTrips: async (params = {}) => {
    const response = await httpClient.get(API_ENDPOINTS.TRIPS.BASE, { params })
    return response.data
  },

  // Get single trip by ID
  getTripById: async (id) => {
    const response = await httpClient.get(API_ENDPOINTS.TRIPS.BY_ID(id))
    return response.data
  },

  // Create new trip
  createTrip: async (tripData) => {
    const response = await httpClient.post(API_ENDPOINTS.TRIPS.BASE, tripData)
    return response.data
  },

  // Update existing trip
  updateTrip: async (id, tripData) => {
    const response = await httpClient.put(API_ENDPOINTS.TRIPS.BY_ID(id), tripData)
    return response.data
  },

  // Delete trip
  deleteTrip: async (id) => {
    const response = await httpClient.delete(API_ENDPOINTS.TRIPS.BY_ID(id))
    return response.data
  },

  // Like/unlike trip
  likeTrip: async (id) => {
    const response = await httpClient.post(API_ENDPOINTS.TRIPS.LIKE(id))
    return response.data
  },

  // Get trips by user
  getUserTrips: async (userId) => {
    const response = await httpClient.get(API_ENDPOINTS.TRIPS.BY_USER(userId))
    return response.data
  },
}
