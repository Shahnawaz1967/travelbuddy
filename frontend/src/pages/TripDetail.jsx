// Trip detail page component
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Calendar, DollarSign, Heart, User, ArrowLeft, Lightbulb, AlertTriangle, Share2 } from "lucide-react"
import { tripAPI, wishlistAPI } from "../utils/api"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import CommentSection from "../components/CommentSection"
import toast from "react-hot-toast"

const TripDetail = () => {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchTripDetails()
    if (isAuthenticated) {
      checkWishlistStatus()
    }
  }, [id, isAuthenticated])

  const fetchTripDetails = async () => {
    try {
      setLoading(true)
      const response = await tripAPI.getTripById(id)
      const tripData = response.data
      setTrip(tripData)
      setIsLiked(tripData.isLikedByUser || false)
      setLikeCount(tripData.likeCount || 0)
    } catch (error) {
      console.error("Error fetching trip:", error)
      toast.error("Failed to load trip details")
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.checkWishlistStatus(id)
      setIsInWishlist(response.data.isInWishlist)
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like trips")
      return
    }

    try {
      const response = await tripAPI.likeTrip(id)
      setIsLiked(response.data.isLiked)
      setLikeCount(response.data.likeCount)
    } catch (error) {
      console.error("Error liking trip:", error)
      toast.error("Failed to like trip")
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save trips")
      return
    }

    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(id)
        setIsInWishlist(false)
        toast.success("Removed from wishlist")
      } else {
        await wishlistAPI.addToWishlist(id)
        setIsInWishlist(true)
        toast.success("Added to wishlist")
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Failed to update wishlist")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: trip.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const totalCost =
    trip.costs.transport + trip.costs.accommodation + trip.costs.food + trip.costs.activities + trip.costs.other

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto container-padding py-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to trips</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto container-padding py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Trip Images */}
            {trip.images && trip.images.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
                <div className="aspect-ratio-16-9 rounded-xl overflow-hidden mb-4">
                  <img
                    src={trip.images[selectedImage]?.url || "/placeholder.svg?height=400&width=600"}
                    alt={trip.images[selectedImage]?.caption || trip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {trip.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {trip.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                          selectedImage === index ? "border-primary-500" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image.url || "/placeholder.svg?height=80&width=80"}
                          alt={image.caption || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Trip Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {trip.location.city}, {trip.location.country}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{trip.duration.days} days</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isLiked
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likeCount}</span>
                  </button>

                  {isAuthenticated && (
                    <button
                      onClick={handleWishlist}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        isInWishlist
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600"
                      }`}
                      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current" : ""}`} />
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    title="Share trip"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{trip.description}</p>
            </motion.div>

            {/* Cost Breakdown */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Cost Breakdown
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">${trip.costs.transport}</p>
                  <p className="text-gray-600">Transport</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">${trip.costs.accommodation}</p>
                  <p className="text-gray-600">Accommodation</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">${trip.costs.food}</p>
                  <p className="text-gray-600">Food</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">${trip.costs.activities}</p>
                  <p className="text-gray-600">Activities</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">${trip.costs.other}</p>
                  <p className="text-gray-600">Other</p>
                </div>
                <div className="text-center p-4 bg-primary-100 rounded-lg">
                  <p className="text-2xl font-bold text-primary-900">${totalCost}</p>
                  <p className="text-primary-700">Total</p>
                </div>
              </div>
            </motion.div>

            {/* Tips and Mistakes */}
            {(trip.tips?.length > 0 || trip.mistakes?.length > 0) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              >
                {trip.tips?.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Travel Tips
                    </h3>
                    <ul className="space-y-2">
                      {trip.tips.map((tip, index) => (
                        <li key={index} className="text-green-800 flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trip.mistakes?.length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Mistakes to Avoid
                    </h3>
                    <ul className="space-y-2">
                      {trip.mistakes.map((mistake, index) => (
                        <li key={index} className="text-orange-800 flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <CommentSection tripId={id} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-6 sticky top-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Author</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {trip.author.profilePicture ? (
                    <img
                      src={trip.author.profilePicture || "/placeholder.svg"}
                      alt={trip.author.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {trip.author.firstName && trip.author.lastName
                      ? `${trip.author.firstName} ${trip.author.lastName}`
                      : trip.author.username}
                  </p>
                  <p className="text-gray-600 text-sm">@{trip.author.username}</p>
                </div>
              </div>
              {trip.author.bio && <p className="text-gray-700 text-sm">{trip.author.bio}</p>}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TripDetail
