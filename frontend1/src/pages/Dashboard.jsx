/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { AlertTriangle, Users, MessageSquare, Bell } from "lucide-react";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";
import { GOOGLE_MAPS_CONFIG } from "../utils/googleMapsConfig";
import { useThemeStore } from "../store/theme";

const BACKEND_URL = "http://localhost:5000/api/auth/dashboard";
const ALERTS_URL = "http://localhost:5000/api/auth/reports";
const VOLUNTEERS_URL = "http://localhost:5000/api/volunteers";
const RESOURCES_URL = "http://localhost:5000/api/resources";

const getRelativeTime = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Add this function to get marker icon based on severity
// Update the getMarkerIcon function to handle undefined google object
const getMarkerIcon = (severity) => {
  if (!window.google) return null;

  const baseConfig = {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 10,
    strokeWeight: 2,
    fillOpacity: 1,
  };

  switch (severity) {
    case "critical":
      return { ...baseConfig, fillColor: "#EF4444", strokeColor: "#B91C1C" };
    case "high":
      return { ...baseConfig, fillColor: "#F97316", strokeColor: "#C2410C" };
    case "medium":
      return { ...baseConfig, fillColor: "#FBBF24", strokeColor: "#B45309" };
    case "low":
      return { ...baseConfig, fillColor: "#34D399", strokeColor: "#047857" };
    default:
      return { ...baseConfig, fillColor: "#9CA3AF", strokeColor: "#4B5563" };
  }
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Map component separated to prevent reloading
// Add geocodeAddress function at the top with other utility functions
const geocodeAddress = async (address) => {
  try {
    console.log("Attempting geocoding for:", address);
    const geocoder = new window.google.maps.Geocoder();
    const result = await new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          resolve(results[0].geometry.location);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
    return {
      lat: result.lat(),
      lng: result.lng(),
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Update the EmergencyMap component to include geocoding
const EmergencyMap = React.memo(
  ({ selectedIncident, setSelectedIncident, location, alerts }) => {
    const [map, setMap] = useState(null);
    const [geocodedAlerts, setGeocodedAlerts] = useState([]);
    const [isApiReady, setIsApiReady] = useState(false);

    // Add an effect to check if Google Maps API is ready
    useEffect(() => {
      if (window.google && window.google.maps) {
        setIsApiReady(true);
      }
    }, []);

    // Update the geocoding effect in EmergencyMap component
    useEffect(() => {
      const geocodeAlerts = async () => {
        console.log("Starting geocoding process...", {
          isApiReady,
          alertsLength: alerts.length,
        });
        if (!isApiReady || !alerts.length) return;

        try {
          const geocoded = await Promise.all(
            alerts.map(async (alert) => {
              console.log("Processing alert:", alert);
              // Check if location contains numbers and comma for coordinate format
              if (alert.location.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/)) {
                const [lat, lng] = alert.location
                  .split(",")
                  .map((coord) => parseFloat(coord.trim()));
                console.log("Parsed coordinates:", { lat, lng });
                return { ...alert, coordinates: { lat, lng } };
              } else {
                console.log("Calling geocodeAddress for:", alert.location);
                const coordinates = await geocodeAddress(alert.location);
                console.log("Received coordinates:", coordinates);
                return { ...alert, coordinates };
              }
            })
          );
          const validAlerts = geocoded.filter((alert) => alert.coordinates);
          console.log("Processed alerts:", validAlerts);
          setGeocodedAlerts(validAlerts);
        } catch (error) {
          console.error("Error during geocoding:", error);
        }
      };

      geocodeAlerts();
    }, [alerts, isApiReady]);

    const onLoad = React.useCallback(
      (map) => {
        const bounds = new window.google.maps.LatLngBounds();

        if (location) {
          bounds.extend(
            new window.google.maps.LatLng(location.latitude, location.longitude)
          );
        }

        // Add alert locations to bounds
        alerts.forEach((alert) => {
          // Parse location string to coordinates (assuming format: "lat,lng")
          const [lat, lng] = alert.location
            .split(",")
            .map((coord) => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend(new window.google.maps.LatLng(lat, lng));
          }
        });

        if (location || alerts.length > 0) {
          map.fitBounds(bounds);
        }

        setMap(map);
      },
      [location, alerts]
    );

    const onUnmount = React.useCallback(() => {
      setMap(null);
    }, []);

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={
          location
            ? { lat: location.latitude, lng: location.longitude }
            : { lat: 20, lng: 0 }
        }
        zoom={location ? 10 : 2}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {location && (
          <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            label="You"
          />
        )}

        {geocodedAlerts.map((alert) => (
          <Marker
            key={alert._id}
            position={alert.coordinates}
            onClick={() => setSelectedIncident(alert)}
            icon={getMarkerIcon(alert.severity)}
          />
        ))}

        {selectedIncident && selectedIncident.coordinates && (
          <InfoWindow
            position={selectedIncident.coordinates}
            onCloseClick={() => setSelectedIncident(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">
                {selectedIncident.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedIncident.description}
              </p>
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-500">
                  Severity: {selectedIncident.severity}
                </span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  }
);

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();

  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  const [dashboardData, setDashboardData] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    activeIncidents: 0,
    responseTeamMembers: 0,
    openRequests: 0,
  });

  // Add handleClick function definition
  const handleClick = () => {
    navigate("/report-disaster");
  };

  // Fetch all required data for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.token) return;

      try {
        // Fetch alerts (active incidents)
        const alertsResponse = await axios.get(ALERTS_URL + "/get-report", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const alertsData = Array.isArray(alertsResponse.data)
          ? alertsResponse.data
          : alertsResponse.data.reports
          ? alertsResponse.data.reports
          : [];
        setAlerts(alertsData);

        // Fetch volunteer stats (response team)
        const volunteersResponse = await axios.get(`${VOLUNTEERS_URL}/stats`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        // Fetch resource requests
        const resourcesResponse = await axios.get(`${RESOURCES_URL}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        // Update stats with real data
        setStats({
          activeIncidents: alertsData.length,
          responseTeamMembers: volunteersResponse.data?.activeVolunteers || 0,
          openRequests:
            resourcesResponse.data?.filter((r) => r.status === "requested")
              .length || 0,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Add this effect to monitor alerts state changes
  useEffect(() => {
    console.log("Current alerts state:", alerts);
  }, [alerts]);

  // Move the early return after all useEffect declarations
  if (!user) return null;

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(userLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(
            "Unable to get your location. Please enable location services."
          );
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      console.log("User location:", location); // This will run only when location updates
    }
  }, [location]);

  return (
    <div className="h-full flex">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <div className="grid grid-cols-12 gap-6 h-full p-6">
          {/* Left Column - Stats and Alerts */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div
              className={`relative overflow-hidden rounded-2xl ${
                isDarkMode
                  ? "bg-gray-800"
                  : "bg-gradient-to-br from-blue-600 to-blue-700"
              } shadow-lg p-6 text-white`}
            >
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Emergency Hub</h1>
                  <div
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-blue-700/50" : "bg-white/20"
                    }`}
                  >
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </div>
                <p
                  className={`mt-2 ${
                    isDarkMode ? "text-blue-100" : "text-white"
                  }`}
                >
                  Emergency Response Command Center
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 border ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Active Incidents
                    </p>
                    <h3
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {loading ? "..." : stats.activeIncidents}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-blue-900/50" : "bg-blue-100"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-6 w-6 ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 border ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Active Volunteers
                    </p>
                    <h3
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {loading ? "..." : stats.responseTeamMembers}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-blue-900/50" : "bg-blue-100"
                    }`}
                  >
                    <Users
                      className={`h-6 w-6 ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 border ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Resource Requests
                    </p>
                    <h3
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {loading ? "..." : stats.openRequests}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      isDarkMode ? "bg-green-900/50" : "bg-green-100"
                    }`}
                  >
                    <MessageSquare
                      className={`h-6 w-6 ${
                        isDarkMode ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg overflow-hidden border ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <div
                className={`p-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Recent Alerts
                  </h2>
                  <Link
                    to="/alerts"
                    className={`text-sm font-medium ${
                      isDarkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {alerts
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 3)
                  .map((alert) => (
                    <div key={alert._id} className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-xl ${
                          alert.severity === "critical"
                            ? isDarkMode
                              ? "bg-red-900/50"
                              : "bg-red-100"
                            : alert.severity === "high"
                            ? isDarkMode
                              ? "bg-orange-900/50"
                              : "bg-orange-100"
                            : alert.severity === "medium"
                            ? isDarkMode
                              ? "bg-yellow-900/50"
                              : "bg-yellow-100"
                            : isDarkMode
                            ? "bg-green-900/50"
                            : "bg-green-100"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.severity === "critical"
                              ? isDarkMode
                                ? "text-red-400"
                                : "text-red-600"
                              : alert.severity === "high"
                              ? isDarkMode
                                ? "text-orange-400"
                                : "text-orange-600"
                              : alert.severity === "medium"
                              ? isDarkMode
                                ? "text-yellow-400"
                                : "text-yellow-600"
                              : isDarkMode
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {alert.title}
                        </h3>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          } mt-1`}
                        >
                          {alert.description.length > 60
                            ? `${alert.description.substring(0, 60)}...`
                            : alert.description}
                        </p>
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          } mt-1 block`}
                        >
                          {getRelativeTime(alert.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                {alerts.length === 0 && (
                  <div
                    className={`text-center ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } py-4`}
                  >
                    No recent alerts
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map and Resources */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg overflow-hidden border ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <div
                className={`p-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Emergency Incident Map
                  </h2>
                  <button
                    onClick={handleClick}
                    className="inline-flex items-center px-4 py-2 rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Incident
                  </button>
                </div>
              </div>
              <div className="h-[600px] relative">
                {isLoaded ? (
                  <EmergencyMap
                    selectedIncident={selectedIncident}
                    setSelectedIncident={setSelectedIncident}
                    location={location}
                    alerts={alerts}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div
                      className={`${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Loading map...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-6 border ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                Resource Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Critical Incidents
                    </span>
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {loading
                        ? "..."
                        : `${
                            alerts.filter((a) => a.severity === "critical")
                              .length
                          }/${alerts.length}`}
                    </span>
                  </div>
                  <div
                    className={`h-2 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    } rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${
                          alerts.length
                            ? (alerts.filter((a) => a.severity === "critical")
                                .length /
                                alerts.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Resource Fulfillment
                    </span>
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {loading
                        ? "..."
                        : `${
                            stats.openRequests
                              ? Math.round(
                                  (1 -
                                    stats.openRequests /
                                      (stats.openRequests + 5)) *
                                    100
                                )
                              : 100
                          }%`}
                    </span>
                  </div>
                  <div
                    className={`h-2 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    } rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${
                          stats.openRequests
                            ? Math.round(
                                (1 -
                                  stats.openRequests /
                                    (stats.openRequests + 5)) *
                                  100
                              )
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Volunteer Coverage
                    </span>
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {loading
                        ? "..."
                        : `${Math.min(
                            stats.responseTeamMembers,
                            alerts.length
                          )}/${Math.max(alerts.length, 1)}`}
                    </span>
                  </div>
                  <div
                    className={`h-2 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    } rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          alerts.length
                            ? Math.min(
                                100,
                                (stats.responseTeamMembers /
                                  Math.max(alerts.length, 1)) *
                                  100
                              )
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
