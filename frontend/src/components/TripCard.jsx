// Trip card component for displaying trip previews
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Calendar, Heart, User } from "lucide-react"

const TripCard = ({ trip, showActions = false }) => {
  const totalCost =
    trip.costs?.transport + trip.costs?.accommodation + trip.costs?.food + trip.costs?.activities + trip.costs?.other ||
    0

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Trip Image */}
      <div className="aspect-ratio-16-9 relative overflow-hidden">
        <img
          src={trip.images?.[0]?.url || "/placeholder.svg?height=200&width=300"}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium text-gray-900">
            ${totalCost}
          </div>
        </div>
      </div>

      {/* Trip Content */}
      <div className="p-6">
        {/* Title and Location */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            <Link to={`/trip/${trip._id}`} className="hover:text-primary-600 transition-colors duration-200">
              {trip.title}
            </Link>
          </h3>
          <div className="flex items-center space-x-4 text-gray-600 text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>
                {trip.location?.city}, {trip.location?.country}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{trip.duration?.days} days</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{trip.description}</p>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="font-medium text-gray-900">${trip.costs?.transport || 0}</p>
            <p className="text-gray-600">Transport</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="font-medium text-gray-900">${trip.costs?.accommodation || 0}</p>
            <p className="text-gray-600">Stay</p>
          </div>
        </div>

        {/* Author and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              {trip.author?.profilePicture ? (
                <img
                  src={trip.author.profilePicture || "/placeholder.svg"}
                  alt={trip.author.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <span className="text-sm text-gray-600">{trip.author?.firstName || trip.author?.username}</span>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Heart className={`w-4 h-4 ${trip.isLikedByUser ? "fill-current text-red-500" : ""}`} />
              <span>{trip.likeCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TripCard
