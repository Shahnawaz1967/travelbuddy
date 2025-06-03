// Create trip page component
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, X, Lightbulb, AlertTriangle } from "lucide-react"
import { tripAPI } from "../utils/api"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: {
      country: "",
      city: "",
    },
    duration: {
      days: 1,
    },
    costs: {
      transport: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      other: 0,
      currency: "USD",
    },
    tips: [""],
    mistakes: [""],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Title is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        break
      case 2:
        if (!formData.location.country.trim()) newErrors["location.country"] = "Country is required"
        if (!formData.location.city.trim()) newErrors["location.city"] = "City is required"
        if (formData.duration.days < 1) newErrors["duration.days"] = "Duration must be at least 1 day"
        break
      case 3:
        // Cost validation is optional, but should be non-negative
        Object.keys(formData.costs).forEach((key) => {
          if (key !== "currency" && formData.costs[key] < 0) {
            newErrors[`costs.${key}`] = "Cost cannot be negative"
          }
        })
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      // Clean up tips and mistakes arrays
      const cleanedData = {
        ...formData,
        tips: formData.tips.filter((tip) => tip.trim() !== ""),
        mistakes: formData.mistakes.filter((mistake) => mistake.trim() !== ""),
      }

      const response = await tripAPI.createTrip(cleanedData)
      toast.success("Trip shared successfully!")
      navigate(`/trip/${response.data.trip._id}`)
    } catch (error) {
      console.error("Error creating trip:", error)
      toast.error("Failed to create trip")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Trip Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input-field ${errors.title ? "border-red-500" : ""}`}
                placeholder="e.g., Amazing 7 days in Tokyo"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Trip Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className={`input-field resize-none ${errors.description ? "border-red-500" : ""}`}
                placeholder="Share your travel experience, what made it special, highlights of your trip..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className={`input-field ${errors["location.country"] ? "border-red-500" : ""}`}
                  placeholder="e.g., Japan"
                />
                {errors["location.country"] && (
                  <p className="mt-1 text-sm text-red-600">{errors["location.country"]}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className={`input-field ${errors["location.city"] ? "border-red-500" : ""}`}
                  placeholder="e.g., Tokyo"
                />
                {errors["location.city"] && <p className="mt-1 text-sm text-red-600">{errors["location.city"]}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                Trip Duration (Days) *
              </label>
              <input
                type="number"
                id="days"
                name="duration.days"
                value={formData.duration.days}
                onChange={handleChange}
                min="1"
                className={`input-field ${errors["duration.days"] ? "border-red-500" : ""}`}
                placeholder="7"
              />
              {errors["duration.days"] && <p className="mt-1 text-sm text-red-600">{errors["duration.days"]}</p>}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="mb-4">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                name="costs.currency"
                value={formData.costs.currency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="transport" className="block text-sm font-medium text-gray-700 mb-2">
                  Transport
                </label>
                <input
                  type="number"
                  id="transport"
                  name="costs.transport"
                  value={formData.costs.transport}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation
                </label>
                <input
                  type="number"
                  id="accommodation"
                  name="costs.accommodation"
                  value={formData.costs.accommodation}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="800"
                />
              </div>

              <div>
                <label htmlFor="food" className="block text-sm font-medium text-gray-700 mb-2">
                  Food & Drinks
                </label>
                <input
                  type="number"
                  id="food"
                  name="costs.food"
                  value={formData.costs.food}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="300"
                />
              </div>

              <div>
                <label htmlFor="activities" className="block text-sm font-medium text-gray-700 mb-2">
                  Activities & Tours
                </label>
                <input
                  type="number"
                  id="activities"
                  name="costs.activities"
                  value={formData.costs.activities}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="400"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="other" className="block text-sm font-medium text-gray-700 mb-2">
                  Other Expenses
                </label>
                <input
                  type="number"
                  id="other"
                  name="costs.other"
                  value={formData.costs.other}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-primary-800 font-medium">
                Total Cost: {formData.costs.currency}{" "}
                {(
                  Number(formData.costs.transport) +
                  Number(formData.costs.accommodation) +
                  Number(formData.costs.food) +
                  Number(formData.costs.activities) +
                  Number(formData.costs.other)
                ).toFixed(2)}
              </p>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            {/* Travel Tips */}
            <div>
              <div className="flex items-center mb-4">
                <Lightbulb className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Travel Tips</h3>
              </div>
              <p className="text-gray-600 mb-4">Share helpful tips for future travelers</p>

              {formData.tips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleArrayChange("tips", index, e.target.value)}
                    className="flex-1 input-field"
                    placeholder="e.g., Book JR Pass in advance for better prices"
                  />
                  {formData.tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("tips", index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addArrayItem("tips")}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add another tip</span>
              </button>
            </div>

            {/* Common Mistakes */}
            <div>
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Mistakes to Avoid</h3>
              </div>
              <p className="text-gray-600 mb-4">Help others avoid common pitfalls</p>

              {formData.mistakes.map((mistake, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={mistake}
                    onChange={(e) => handleArrayChange("mistakes", index, e.target.value)}
                    className="flex-1 input-field"
                    placeholder="e.g., Don't exchange money at the airport - rates are terrible"
                  />
                  {formData.mistakes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("mistakes", index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addArrayItem("mistakes")}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add another mistake</span>
              </button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const stepTitles = ["Basic Information", "Location & Duration", "Cost Breakdown", "Tips & Advice"]

  return (
    <div className="min-h-screen bg-gray-50 section-spacing">
      <div className="max-w-4xl mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Share Your Travel Experience</h1>
          <p className="text-gray-600 text-lg">Help fellow travelers by sharing your journey, costs, and insights</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {stepTitles.map((title, index) => (
              <div key={index} className={`flex items-center ${index < stepTitles.length - 1 ? "flex-1" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > index + 1
                      ? "bg-green-500 text-white"
                      : currentStep === index + 1
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > index + 1 ? "✓" : index + 1}
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {stepTitles.map((title, index) => (
              <span key={index} className={currentStep === index + 1 ? "font-medium text-primary-600" : ""}>
                {title}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Trip</span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTrip
