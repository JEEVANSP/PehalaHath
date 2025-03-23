import React, { useState, useEffect } from "react";
import { Camera, MapPin, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import Autocomplete from "react-google-autocomplete";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from '../utils/googleMapsConfig';

const BACKEND_URL = "http://localhost:5000/api/auth/reports";
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function ReportDisaster() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-t-2xl shadow-lg p-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Report Emergency
              </h1>
              <p className="mt-2 text-red-100">
                Your report helps save lives. Please provide accurate details.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Emergency Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors"
                >
                  <option value="">Select Type</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="landslide">Landslide</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Severity Level
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors"
                >
                  <option value="">Select Severity</option>
                  <option value="low" className="text-green-600">
                    Low
                  </option>
                  <option value="medium" className="text-yellow-600">
                    Medium
                  </option>
                  <option value="high" className="text-orange-600">
                    High
                  </option>
                  <option value="critical" className="text-red-600">
                    Critical
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors"
                placeholder="Brief title of the emergency"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors"
                placeholder="Detailed description of the situation"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Location
              </label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <MapPin className="h-5 w-5 text-red-500" />
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
                    className="flex-1 rounded-r-lg border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                    style={{ width: "100%" }}
                    placeholder="Search for a location"
                  />
                ) : (
                  <input
                    type="text"
                    className="flex-1 rounded-r-lg border-gray-300 focus:border-red-500 focus:ring-red-500 transition-colors"
                    placeholder="Loading location search..."
                    disabled
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">
                Upload Images
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-10 h-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click or drag images here
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
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      className="h-24 w-full object-cover rounded-lg shadow-md"
                      alt={`Preview ${index + 1}`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = imagePreview.filter(
                            (_, i) => i !== index
                          );
                          setImagePreview(newPreviews);
                        }}
                        className="text-white hover:text-red-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-gradient-to-r ${
                isSubmitting
                  ? "from-gray-400 to-gray-500 cursor-not-allowed"
                  : "from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
              } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg flex items-center justify-center space-x-2`}
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
                  <AlertTriangle className="h-5 w-5" />
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
