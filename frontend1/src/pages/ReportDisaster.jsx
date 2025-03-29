import React, { useState, useEffect } from "react";
import { Camera, MapPin, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import Autocomplete from "react-google-autocomplete";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from '../utils/googleMapsConfig';
import { useThemeStore } from '../store/theme';

const BACKEND_URL = "http://localhost:5000/api/auth/reports";
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function ReportDisaster() {
  const { isDarkMode } = useThemeStore();
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    severity: "",
    images: [],
  });

  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  const [imagePreview, setImagePreview] = useState([]);
  const [reports, setReports] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      console.log("user", user.token);
      const response = await fetch(`${BACKEND_URL}/get-report`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result);
            setImagePreview([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    setFormData({ ...formData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      console.log("Unauthorized: Please log in first.");
      return;
    }
    setIsSubmitting(true);
    const formDataToSend = new FormData();

    // Add current timestamp to the form data
    const currentTime = new Date().toISOString();

    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        Array.from(formData.images).forEach((file) =>
          formDataToSend.append("images", file)
        );
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append the current timestamp
    formDataToSend.append("createdAt", currentTime);

    try {
      const response = await fetch(`${BACKEND_URL}/submit-report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formDataToSend,
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        console.log("Report submitted successfully!");
        setFormData({
          type: "",
          title: "",
          description: "",
          location: "",
          severity: "",
          images: [],
        });
        setImagePreview([]);
        fetchReports();
      } else {
        console.log(result.error || "Failed to submit report.");
      }
    } catch (error) {
      console.log("Error submitting report. Try again.",error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-red-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-gray-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header Section */}
        <div className={`relative overflow-hidden rounded-t-3xl shadow-2xl p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-red-600 via-red-500 to-red-400'}`}>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-6">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white/20'} p-4 rounded-full shadow-inner`}>
                <AlertTriangle className={`h-10 w-10 ${isDarkMode ? 'text-red-400' : 'text-white'}`} />
              </div>
              <div>
                <h1 className={`text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  Report Emergency
                </h1>
                <p className={`mt-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-red-50'} opacity-90`}>
                  Your report helps save lives. Please provide accurate details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-b-3xl shadow-2xl p-10 border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Type and Severity Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className={`text-sm font-semibold block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Emergency Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full rounded-xl shadow-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-red-500 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50' 
                      : 'border-gray-200 hover:border-red-300 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50'
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="landslide">Landslide</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className={`text-sm font-semibold block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Severity Level
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className={`w-full rounded-xl shadow-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-red-500 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50' 
                      : 'border-gray-200 hover:border-red-300 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50'
                  }`}
                >
                  <option value="">Select Severity</option>
                  <option value="low" className="text-green-600">Low</option>
                  <option value="medium" className="text-yellow-600">Medium</option>
                  <option value="high" className="text-orange-600">High</option>
                  <option value="critical" className="text-red-600">Critical</option>
                </select>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label className={`text-sm font-semibold block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full rounded-xl shadow-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:border-red-500 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50' 
                    : 'border-gray-200 hover:border-red-300 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50'
                }`}
                placeholder="Brief title of the emergency"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-3">
              <label className={`text-sm font-semibold block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full rounded-xl shadow-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:border-red-500 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50' 
                    : 'border-gray-200 hover:border-red-300 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50'
                }`}
                placeholder="Detailed description of the situation"
              ></textarea>
            </div>

            {/* Location Input */}
            <div className="space-y-3">
              <label className={`text-sm font-semibold block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Location
              </label>
              <div className="flex rounded-xl shadow-sm overflow-hidden">
                <span className={`inline-flex items-center px-4 border border-r-0 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <MapPin className={`h-5 w-5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                </span>
                {isLoaded ? (
                  <Autocomplete
                    apiKey={VITE_GOOGLE_MAPS_API_KEY}
                    onPlaceSelected={(place) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: place.formatted_address,
                      }));
                    }}
                    options={{
                      types: ["geocode"],
                    }}
                    defaultValue={formData.location}
                    className={`flex-1 rounded-r-xl transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:border-red-500 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50' 
                        : 'border-gray-200 hover:border-red-300 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50'
                    }`}
                    style={{ width: "100%" }}
                    placeholder="Search for a location"
                  />
                ) : (
                  <input
                    type="text"
                    className={`flex-1 rounded-r-xl ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-200'
                    }`}
                    placeholder="Loading location search..."
                    disabled
                  />
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className={`text-sm font-semibold block ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload Images
              </label>
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'border-red-900 bg-gray-700/50 hover:bg-gray-700' 
                    : 'border-red-100 bg-red-50/30 hover:bg-red-50/50'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className={`w-12 h-12 ${isDarkMode ? 'text-red-400' : 'text-red-400'}`} />
                    <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-500'}`}>
                      Click or drag images here
                    </p>
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-red-400' : 'text-red-400'}`}>
                      Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>

              {/* Image Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden">
                    <img
                      src={src}
                      className="h-24 w-full object-cover transition-transform group-hover:scale-110"
                      alt={`Preview ${index + 1}`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = imagePreview.filter(
                            (_, i) => i !== index
                          );
                          setImagePreview(newPreviews);
                        }}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-xl flex items-center justify-center space-x-3 ${
                isSubmitting
                  ? isDarkMode 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6" />
                  <span>Submit Emergency Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportDisaster;
