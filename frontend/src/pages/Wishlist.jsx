// Wishlist page component
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, MapPin } from "lucide-react"
import { wishlistAPI } from "../utils/api"
import TripCard from "../components/TripCard"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Wishlist = () => {
  const [wishlistTrips, setWishlistTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await wishlistAPI.getWishlist()
      setWishlistTrips(response.data)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
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
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center"
          >
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            Your Wishlist
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg"
          >
            Trips you've saved for future inspiration
          </motion.p>
        </div>

        {/* Wishlist Content */}
        {wishlistTrips.length > 0 ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Saved Trips</h2>
              <span className="text-gray-600">
                {wishlistTrips.length} {wishlistTrips.length === 1 ? "trip" : "trips"} saved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-xl shadow-sm p-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start exploring trips and save the ones that inspire you for future reference!
              </p>
              <a
                href="/"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <MapPin className="w-5 h-5" />
                <span>Explore Trips</span>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Wishlist
