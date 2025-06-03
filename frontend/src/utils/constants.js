// Application constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CREATE_TRIP: "/create-trip",
  TRIP_DETAIL: "/trip/:id",
  PROFILE: "/profile",
  WISHLIST: "/wishlist",
}

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    PROFILE: "/auth/profile",
  },
  // Trip endpoints
  TRIPS: {
    BASE: "/trips",
    BY_ID: (id) => `/trips/${id}`,
    LIKE: (id) => `/trips/${id}/like`,
    BY_USER: (userId) => `/trips/user/${userId}`,
  },
  // Comment endpoints
  COMMENTS: {
    BASE: "/comments",
    BY_TRIP: (tripId) => `/comments/trip/${tripId}`,
    BY_ID: (id) => `/comments/${id}`,
    LIKE: (id) => `/comments/${id}/like`,
  },
  // Wishlist endpoints
  WISHLIST: {
    BASE: "/wishlist",
    ADD: (tripId) => `/wishlist/${tripId}`,
    REMOVE: (tripId) => `/wishlist/${tripId}`,
    CHECK: (tripId) => `/wishlist/check/${tripId}`,
  },
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
]

export const TOAST_CONFIG = {
  position: "top-right",
  duration: 4000,
  style: {
    background: "#363636",
    color: "#fff",
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: "#4ade80",
      secondary: "#fff",
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fff",
    },
  },
}
