// Wishlist service
import httpClient from "../utils/httpClient"
import { API_ENDPOINTS } from "../utils/constants"

export const wishlistService = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await httpClient.get(API_ENDPOINTS.WISHLIST.BASE)
    return response.data
  },

  // Add trip to wishlist
  addToWishlist: async (tripId) => {
    const response = await httpClient.post(API_ENDPOINTS.WISHLIST.ADD(tripId))
    return response.data
  },

  // Remove trip from wishlist
  removeFromWishlist: async (tripId) => {
    const response = await httpClient.delete(API_ENDPOINTS.WISHLIST.REMOVE(tripId))
    return response.data
  },

  // Check if trip is in wishlist
  checkWishlistStatus: async (tripId) => {
    const response = await httpClient.get(API_ENDPOINTS.WISHLIST.CHECK(tripId))
    return response.data
  },
}
