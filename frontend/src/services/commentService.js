// Comment service
import httpClient from "../utils/httpClient"
import { API_ENDPOINTS } from "../utils/constants"

export const commentService = {
  // Get comments for a trip
  getTripComments: async (tripId) => {
    const response = await httpClient.get(API_ENDPOINTS.COMMENTS.BY_TRIP(tripId))
    return response.data
  },

  // Create new comment
  createComment: async (commentData) => {
    const response = await httpClient.post(API_ENDPOINTS.COMMENTS.BASE, commentData)
    return response.data
  },

  // Update comment
  updateComment: async (id, commentData) => {
    const response = await httpClient.put(API_ENDPOINTS.COMMENTS.BY_ID(id), commentData)
    return response.data
  },

  // Delete comment
  deleteComment: async (id) => {
    const response = await httpClient.delete(API_ENDPOINTS.COMMENTS.BY_ID(id))
    return response.data
  },

  // Like/unlike comment
  likeComment: async (id) => {
    const response = await httpClient.post(API_ENDPOINTS.COMMENTS.LIKE(id))
    return response.data
  },
}
