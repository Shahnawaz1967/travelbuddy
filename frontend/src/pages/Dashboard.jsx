// Dashboard page component
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { PlusCircle, MapPin, Heart, MessageCircle, Edit, Trash2, Eye } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { tripAPI } from "../utils/api"
import LoadingSpinner from "../components/LoadingSpinner"
import TripCard from "../components/TripCard"
import toast from "react-hot-toast"

const Dashboard = () => {
  const [userTrips, setUserTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalLikes: 0,
    totalComments: 0,
  })

  const { user } = useAuth()

  useEffect(() => {
    fetchUserTrips()
  }, [user])

  const fetchUserTrips = async () => {
    try {
      setLoading(true)
      if (user?._id) {
        const response = await tripAPI.getUserTrips(user._id)
        const trips = response.data
        setUserTrips(trips)

        // Calculate stats
        const totalLikes = trips.reduce((sum, trip) => sum + (trip.likeCount || 0), 0)
        const totalComments = trips.reduce((sum, trip) => sum + (trip.commentCount || 0), 0)

        setStats({
          totalTrips: trips.length,
          totalLikes,
          totalComments,
        })
      }
    } catch (error) {
      console.error("Error fetching user trips:", error)
      toast.error("Failed to load your trips")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      return
    }

    try {
      await tripAPI.deleteTrip(tripId)
      setUserTrips((prev) => prev.filter((trip) => trip._id !== tripId))
      toast.success("Trip deleted successfully")
    } catch (error) {
      console.error("Error deleting trip:", error)
      toast.error("Failed to delete trip")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 section-spacing">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
          >
            Welcome back, {user?.firstName || user?.username}!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg"
          >
            Manage your travel experiences and see how they're inspiring others
          </motion.p>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
                <p className="text-gray-600">Trips Shared</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
                <p className="text-gray-600">Total Likes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
                <p className="text-gray-600">Comments</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/create-trip"
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Share New Trip</span>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Heart className="w-5 h-5" />
              <span>View Wishlist</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </motion.div>

        {/* User's Trips */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Travel Experiences</h2>
            <span className="text-gray-600">
              {userTrips.length} {userTrips.length === 1 ? "trip" : "trips"}
            </span>
          </div>

          {userTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative group"
                >
                  <TripCard trip={trip} showActions={true} />

                  {/* Action Buttons Overlay */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-2">
                      <Link
                        to={`/trip/${trip._id}`}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:bg-white transition-colors duration-200"
                        title="View Trip"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                      <button
                        onClick={() => handleDeleteTrip(trip._id)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:bg-red-50 transition-colors duration-200"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips shared yet</h3>
              <p className="text-gray-600 mb-6">
                Start sharing your travel experiences with the TravelBuddy community!
              </p>
              <Link to="/create-trip" className="btn-primary">
                Share Your First Trip
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard
