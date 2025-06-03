// Home page with improved structure and fixed styling
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Search, MapPin, DollarSign, Users, Filter, ChevronDown } from "lucide-react"
import { tripService } from "../services"
import { debounce } from "../utils/helpers"
import TripCard from "../components/TripCard"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Home = () => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    country: "",
    minCost: "",
    maxCost: "",
    sortBy: "createdAt",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch trips on component mount and when filters change
  useEffect(() => {
    fetchTrips()
  }, [filters])

  // Debounced search when search term changes
  useEffect(() => {
    if (searchTerm !== "") {
      debounce(fetchTrips, 500)()
    }
  }, [searchTerm])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        country: searchTerm || filters.country,
        page: 1,
        limit: 12,
      }

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await tripService.getAllTrips(params)
      setTrips(response.trips || [])
    } catch (error) {
      console.error("Error fetching trips:", error)
      toast.error("Failed to load trips")
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTrips()
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      country: "",
      minCost: "",
      maxCost: "",
      sortBy: "createdAt",
    })
    setSearchTerm("")
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white section-spacing overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto container-padding text-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Share Your Travel Stories
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto"
          >
            Connect with fellow travelers, share real experiences, costs, and tips. Build a community of authentic
            travel stories.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Join TravelBuddy
            </Link>
            <Link
              to="/create-trip"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Share Your Trip
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose TravelBuddy?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from real travelers, not marketing content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real Cost Breakdowns</h3>
              <p className="text-gray-600">
                Get detailed cost information for transport, accommodation, food, and activities from actual travelers.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Experiences</h3>
              <p className="text-gray-600">
                Read genuine travel stories, tips, and mistakes to avoid from people who've been there.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Connect with like-minded travelers, ask questions, and get personalized advice.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by country or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button type="submit" className="btn-primary px-8">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
              </div>
            </form>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="e.g., Japan"
                      value={filters.country}
                      onChange={(e) => handleFilterChange("country", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Cost ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minCost}
                      onChange={(e) => handleFilterChange("minCost", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Cost ($)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={filters.maxCost}
                      onChange={(e) => handleFilterChange("maxCost", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                      className="input-field"
                    >
                      <option value="createdAt">Newest First</option>
                      <option value="likes">Most Liked</option>
                      <option value="totalCost">Cost: Low to High</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={clearFilters} className="text-gray-600 hover:text-gray-800 font-medium">
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Trips Section */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Travel Experiences</h2>
            <span className="text-gray-600">
              {trips.length} {trips.length === 1 ? "trip" : "trips"} found
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or be the first to share a trip!</p>
              <Link to="/create-trip" className="btn-primary">
                Share Your First Trip
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white section-spacing">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Share Your Adventure?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Help fellow travelers by sharing your experiences, costs, and tips. Your story could inspire someone's next
            adventure!
          </p>
          <Link
            to="/create-trip"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
          >
            Share Your Trip Experience
          </Link>
        </div>
      </section>
    </motion.div>
  )
}

export default Home
