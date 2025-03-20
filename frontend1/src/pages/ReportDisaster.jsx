import React, { useState, useEffect } from "react";
import { Camera, MapPin, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import Autocomplete from "react-google-autocomplete";

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
  
  const [imagePreview, setImagePreview] = useState([]);
  const [reports, setReports] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const {user} = useAuth();

  useEffect(() => {
    if (user?.token) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
        console.log("user",user.token)
      const response = await fetch(`${BACKEND_URL}/get-report`, {
        headers: { "Authorization": `Bearer ${user?.token}` },
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
      Array.from(files).forEach(file => {
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
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        Array.from(formData.images).forEach((file) => formDataToSend.append("images", file));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${BACKEND_URL}/submit-report`, {
        method: "POST",
        headers:{
             "Authorization": `Bearer ${user?.token}`
        },
        body: formDataToSend,
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        console.log("Report submitted successfully!");
        setFormData({ type: "", title: "", description: "", location: "", severity: "", images: [] });
        setImagePreview([]);
        fetchReports();
      } else {
        console.log(result.error || "Failed to submit report.");
      }
    } catch (error) {
        console.log("Error submitting report. Try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-red-50 border-b border-red-100">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Report Emergency</h1>
          </div>
          <p className="mt-2 text-sm text-gray-600">Provide accurate details to help responders.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500">
                <option value="">Select Type</option>
                <option value="earthquake">Earthquake</option>
                <option value="flood">Flood</option>
                <option value="fire">Fire</option>
                <option value="landslide">Landslide</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Severity Level</label>
              <select name="severity" value={formData.severity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500">
                <option value="">Select Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-gray-300 bg-gray-50 text-gray-500">
                <MapPin className="h-5 w-5" />
              </span>
              <Autocomplete
                apiKey={VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={(place) => {
                  setFormData(prev => ({
                    ...prev,
                    location: place.formatted_address
                  }));
                }}
                options={{
                  types: ["geocode"], // Optional: restrict to specific country
                }}
                defaultValue={formData.location}
                className="flex-1 rounded-r-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                style={{ width: "100%" }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Images</label>
            <input type="file" multiple onChange={handleImageChange} className="mt-2" accept="image/*" />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {imagePreview.map((src, index) => <img key={index} src={src} className="h-24 w-24 object-cover rounded-md" />)}
            </div>
          </div>
          
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Submit Report</button>
        </form>
      </div>
    </div>
  );
}