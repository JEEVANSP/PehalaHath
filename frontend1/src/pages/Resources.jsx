import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  X,
  Clock,
  Mail,
  User,
  AlertCircle,
  MapPin,
  Shield,
  Phone
} from "lucide-react";
import Autocomplete from "react-google-autocomplete";
import { backendService } from "../services/backendService";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useThemeStore } from "../store/theme";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "../utils/googleMapsConfig";

const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function Resources() {
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userResources, setUserResources] = useState([]);
  const [newResource, setNewResource] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    location: "",
    status: "requested",
    description: "",
    urgency: "medium",
    providedBy: {
      id: user?.id || "",
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "volunteer",
      phone:user?.phone || ""
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      await loadResources();
      if (user?.id) {
        await loadUserResources();
      }
    };

    fetchData();
  }, [user?.id]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const data = await backendService.getAllResources();
      setResources(data);
      console.log("All resources:", resources);
    } catch (error) {
      toast.error("Failed to load resources");
      console.error("Error loading resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserResources = async () => {
    if (!user?.id) return; // Guard clause to prevent calling with no user

    try {
      console.log("Loading user resources for user ID:", user.id);
      const data = await backendService.getUserRequestedResources(
        user.id,
        user.token
      ); // Add token
      console.log("User resources data received:", data);
      setUserResources(Array.isArray(data) ? data : []); // Ensure data is an array
    } catch (error) {
      console.error("Error loading user resources:", error);
      setUserResources([]); // Set empty array on error
      toast.error("Failed to load your requested resources");
    }
  };

  // Replace the existing useJsApiLoader call
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  // Remove the manual script loading useEffect
  // Delete or comment out this useEffect block
  /*
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
  */

  const handleMarkAsAllocated = async (userId, resourceId) => {
    try {
      // First check if user is authenticated
      if (!user || !user.token) {
        toast.error("Please login to update resource status");
        return;
      }

      await backendService.updateResourceAllocation(
        userId,
        resourceId,
        user.token
      );
      toast.success("Resource marked as allocated");

      // Reload both resources lists
      await loadResources();
      if (user?.id) {
        await loadUserResources();
      }
    } catch (error) {
      console.error("Error updating resource status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update resource status"
      );
    }
  };

  const handleViewDetails = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleAddResource = () => {
    setIsAddResourceModalOpen(true);
  };

  const handleDeleteResource = async (userId, resourceId) => {
    try {
      if (!user || !user.token) {
        toast.error("Please login to delete resource");
        return;
      }
      await backendService.deleteAllocatedResource(
        userId,
        resourceId,
        user.token
      );
      toast.success("Resource deleted successfully");
      await loadResources();
      if (user?.id) {
        await loadUserResources();
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error(error.response?.data?.message || "Failed to delete resource");
    }
  };

  const handleCloseAddResourceModal = () => {
    setIsAddResourceModalOpen(false);
    setNewResource({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      location: "",
      status: "requested",
      description: "",
      urgency: "medium",
      providedBy: {
        id: user?.id || "",
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "volunteer",
        phone: user?.phone || ""
      },
    });
  };

  const renderUserRequestedResources = () => (
    <div
      className={`mt-8 rounded-lg shadow overflow-hidden ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h2
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Your Requested Resources
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {userResources.map((resource) => (
          <div
            key={resource._id}
            className="p-6 flex items-center justify-between"
          >
            <div>
              <h3
                className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {resource.name}
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {resource.description}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    resource.status === "allocated"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {resource.status}
                </span>
              </div>
            </div>
            {resource.status === "requested" && (
              <button
                onClick={() =>
                  handleMarkAsAllocated(resource.providedBy.id, resource._id)
                }
                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Mark as Allocated
              </button>
            )}
            {resource.status === "allocated" &&
              user?.id === resource.providedBy.id && (
                <button
                  onClick={() =>
                    handleDeleteResource(resource.providedBy.id, resource._id)
                  }
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              )}
          </div>
        ))}
        {userResources.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            You haven't requested any resources yet
          </div>
        )}
      </div>
    </div>
  );

  const handleSubmitNewResource = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to request resources");
      return;
    }

    try {
      const resourceToAdd = {
        ...newResource,
        timestamp: new Date().toISOString(),
        status: "requested",
        providedBy: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      };

      const savedResource = await backendService.createResourceRequest(
        resourceToAdd
      );
      setResources((prevResources) => [...prevResources, savedResource]);
      toast.success("Resource request submitted successfully");
      handleCloseAddResourceModal();
    } catch (error) {
      toast.error("Failed to submit resource request");
      console.error("Error submitting resource request:", error);
    }
  };

  // Filter resources based on search term, category, and status
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || resource.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div
      className={`p-6 max-w-7xl mx-auto ${
        isDarkMode ? "text-gray-100" : "text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Resource Management
        </h1>
        <button
          onClick={handleAddResource}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          disabled={!user}
        >
          <Plus className="h-5 w-5 mr-2" />
          {user ? "Request Resource" : "Login to Request"}
        </button>
      </div>

      {/* Add User Requested Resources Section */}
      {user && renderUserRequestedResources()}

      {/* Filters */}
      <div
        className={`mb-6 p-4 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm`}
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  className={`h-5 w-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Categories</option>
              <option value="medical">Medical</option>
              <option value="food">Food</option>
              <option value="shelter">Shelter</option>
              <option value="clothing">Clothing</option>
              <option value="equipment">Equipment</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="requested">Requested</option>
              <option value="allocated">Allocated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div
        className={`rounded-lg shadow overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="min-w-full divide-y divide-gray-200">
          <div className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <div
              className={`grid grid-cols-6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              <div className="col-span-2">Resource</div>
              <div>Quantity</div>
              <div>Location</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
          </div>

          <div
            className={`divide-y ${
              isDarkMode ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {isLoading ? (
              <div
                className={`px-6 py-4 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Loading resources...
              </div>
            ) : filteredResources.length === 0 ? (
              <div
                className={`px-6 py-4 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No resources found
              </div>
            ) : (
              // In the resources list mapping, update the key prop
              filteredResources.map((resource) => (
                <div
                  key={resource._id || resource.id} // Update the key to use _id (MongoDB) or fallback to id
                  className={`grid grid-cols-6 px-6 py-4 items-center ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="col-span-2">
                    <div
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {resource.name}
                    </div>
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {resource.category}
                    </div>
                  </div>
                  <div
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    {resource.quantity} {resource.unit}
                  </div>
                  <div
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    {resource.location}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        resource.status === "available"
                          ? "bg-green-100 text-green-800"
                          : resource.status === "requested"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {resource.status}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => handleViewDetails(resource)}
                      className="text-red-600 hover:text-red-900"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      {isModalOpen && selectedResource && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
          onClick={handleCloseModal}
        >
          <div
            className={`relative top-10 mx-auto p-6 border w-[500px] shadow-2xl rounded-xl ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedResource.name}
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {selectedResource.category}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className={`${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-500"
                } transition-colors`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Urgency
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                      style={{ textTransform: "capitalize" }}
                    >
                      {selectedResource.urgency}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <Package className="h-5 w-5 text-blue-400" />
                  <div>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Quantity
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedResource.quantity} {selectedResource.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <MapPin className="h-5 w-5 text-green-400" />
                <div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Location
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedResource.location}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-2 p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <Clock className="h-5 w-5 text-purple-400" />
                <div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Added
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {new Date(selectedResource.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } mb-1`}
                >
                  Description
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedResource.description}
                </p>
              </div>

              <div
                className={`border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } pt-5`}
              >
                <h4
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } mb-3`}
                >
                  {selectedResource.status === "available"
                    ? "Provided By"
                    : "Requested By"}
                </h4>
                <div className="space-y-3">
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <User className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Name
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedResource.providedBy.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <Mail className="h-5 w-5 text-orange-400" />
                    <div>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Email
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedResource.providedBy.email}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <Shield className="h-5 w-5 text-teal-400" />
                    <div>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Role
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                        style={{ textTransform: "capitalize" }}
                      >
                        {selectedResource.providedBy.role}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <Phone className="h-5 w-5 text-blue-400" />
                    <div>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Phone
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedResource.providedBy.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddResourceModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
          onClick={handleCloseAddResourceModal}
        >
          <div
            className={`relative top-10 mx-auto p-6 border w-[500px] shadow-2xl rounded-xl ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Request New Resource
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } mt-1`}
                >
                  Fill in the details to request a new resource
                </p>
              </div>
              <button
                onClick={handleCloseAddResourceModal}
                className={`${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-500"
                } transition-colors`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewResource} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Resource Name
                </label>
                <input
                  type="text"
                  value={newResource.name}
                  onChange={(e) =>
                    setNewResource((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Category
                </label>
                <select
                  value={newResource.category}
                  onChange={(e) =>
                    setNewResource((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="medical">Medical</option>
                  <option value="food">Food</option>
                  <option value="shelter">Shelter</option>
                  <option value="clothing">Clothing</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newResource.quantity}
                    onChange={(e) =>
                      setNewResource((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-1`}
                  >
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newResource.unit}
                    onChange={(e) =>
                      setNewResource((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin
                      className={`h-5 w-5 ${
                        isDarkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  {isLoaded ? (
                    <Autocomplete
                      apiKey={VITE_GOOGLE_MAPS_API_KEY}
                      onPlaceSelected={(place) => {
                        if (place && place.formatted_address) {
                          setNewResource((prev) => ({
                            ...prev,
                            location: place.formatted_address,
                          }));
                        }
                      }}
                      options={{
                        types: [
                          "establishment",
                          // "school",
                          // "hospital",
                          // "university",
                          // "point_of_interest",
                        ],
                        componentRestrictions: { country: "in" },
                      }}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Search for location, school, college, hospital, or establishment"
                      defaultValue={newResource.location}
                    />
                  ) : (
                    <input
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Loading location search..."
                      disabled
                    />
                  )}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Description
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="3"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Urgency Level
                </label>
                <select
                  value={newResource.urgency}
                  onChange={(e) =>
                    setNewResource((prev) => ({
                      ...prev,
                      urgency: e.target.value,
                    }))
                  }
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseAddResourceModal}
                  className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Request Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;
