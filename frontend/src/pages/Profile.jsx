import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { toast } from "react-hot-toast";
import { User, Mail, Shield, Save, X, Phone } from "lucide-react";
import { useThemeStore } from "../store/theme";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000/api/auth";

export function Profile() {
  const { user, updateUserInfo } = useAuth();
  const { isDarkMode } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    notifications: {
      email: true,
      alertTypes: {
        flood: true,
        earthquake: true,
        fire: true,
        other: true,
      },
    },
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (response.data) {
        setProfileData({
          name: response.data.name || "",
          email: response.data.email || "",
          role: response.data.role || "",
          phone: response.data.phone || "",
          notifications: response.data.notifications || {
            email: true,
            alertTypes: {
              flood: true,
              earthquake: true,
              fire: true,
              other: true,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile information");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(`${BACKEND_URL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data) {
        toast.success("Profile updated successfully");
        updateUserInfo(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } p-8`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className={`mb-8 p-6 rounded-xl shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h1 className="text-2xl font-bold mb-2">My Profile</h1>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            View and manage your personal information
          </p>
        </div>

        {/* Profile Card */}
        <div
          className={`p-6 rounded-xl shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg ${
                isEditing
                  ? `${
                      isDarkMode
                        ? "bg-gray-700 text-red-400"
                        : "bg-gray-100 text-red-600"
                    }`
                  : `${isDarkMode ? "bg-red-600" : "bg-red-600 text-white"}`
              } transition-colors`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Name Field */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="w-full md:w-1/3 mb-2 md:mb-0">
                  <div className="flex items-center">
                    <User
                      className={`h-5 w-5 mr-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <label className="font-medium">Full Name</label>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                  ) : (
                    <p>{profileData.name}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="w-full md:w-1/3 mb-2 md:mb-0">
                  <div className="flex items-center">
                    <Mail
                      className={`h-5 w-5 mr-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <label className="font-medium">Email Address</label>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                  ) : (
                    <p>{profileData.email}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center">
                <div className="w-full md:w-1/3 mb-2 md:mb-0">
                  <div className="flex items-center">
                    <Phone
                      className={`h-5 w-5 mr-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <label className="font-medium">Phone Number</label>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    />
                  ) : (
                    <p>{profileData.phone}</p>
                  )}
                </div>
              </div>

              {/* Role Field */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="w-full md:w-1/3 mb-2 md:mb-0">
                  <div className="flex items-center">
                    <Shield
                      className={`h-5 w-5 mr-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <label className="font-medium">Role</label>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  {isEditing ? (
                    <select
                      name="role"
                      value={profileData.role}
                      onChange={handleChange}
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "border-gray-300 focus:ring-red-500 focus:border-red-500"
                      }`}
                      required
                    >
                      <option value="user">User</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="authority">Authority</option>
                    </select>
                  ) : (
                    <p className="capitalize">{profileData.role}</p>
                  )}
                </div>
              </div>

              <div
                className={`mt-6 p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Email Notification Preferences
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={profileData.notifications?.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          notifications: {
                            ...profileData.notifications,
                            email: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={!isEditing}
                    />
                    <label
                      htmlFor="email-notifications"
                      className={`ml-2 block text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Receive email notifications for alerts
                    </label>
                  </div>

                  {profileData.notifications?.email && (
                    <div className="ml-6 mt-2 space-y-2">
                      <p
                        className={`text-sm font-medium mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Alert types:
                      </p>

                      {["flood", "earthquake", "fire", "other"].map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`alert-type-${type}`}
                            checked={
                              profileData.notifications?.alertTypes?.[type]
                            }
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                notifications: {
                                  ...profileData.notifications,
                                  alertTypes: {
                                    ...profileData.notifications.alertTypes,
                                    [type]: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={!isEditing}
                          />
                          <label
                            htmlFor={`alert-type-${type}`}
                            className={`ml-2 block text-sm capitalize ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
