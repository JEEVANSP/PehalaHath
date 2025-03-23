import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { AlertTriangle, Users, MessageSquare, Bell } from 'lucide-react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';

const BACKEND_URL = "http://localhost:5000/api/auth/dashboard";
const ALERTS_URL = "http://localhost:5000/api/auth/reports";
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Add this function to get marker icon based on severity
// Update the getMarkerIcon function to handle undefined google object
const getMarkerIcon = (severity) => {
  if (!window.google) return null;

  const baseConfig = {
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: 10,
    strokeWeight: 2,
    fillOpacity: 1
  };

  switch (severity) {
    case 'critical':
      return { ...baseConfig, fillColor: '#EF4444', strokeColor: '#B91C1C' };
    case 'high':
      return { ...baseConfig, fillColor: '#F97316', strokeColor: '#C2410C' };
    case 'medium':
      return { ...baseConfig, fillColor: '#FBBF24', strokeColor: '#B45309' };
    case 'low':
      return { ...baseConfig, fillColor: '#34D399', strokeColor: '#047857' };
    default:
      return { ...baseConfig, fillColor: '#9CA3AF', strokeColor: '#4B5563' };
  }
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Map component separated to prevent reloading
// Add geocodeAddress function at the top with other utility functions
const geocodeAddress = async (address) => {
  try {
    const geocoder = new window.google.maps.Geocoder();
    const result = await new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
    return {
      lat: result.lat(),
      lng: result.lng()
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Update the EmergencyMap component to include geocoding
const EmergencyMap = React.memo(({ selectedIncident, setSelectedIncident, location, alerts }) => {
  const [map, setMap] = useState(null);
  const [geocodedAlerts, setGeocodedAlerts] = useState([]);
  const [isApiReady, setIsApiReady] = useState(false);

  // Add an effect to check if Google Maps API is ready
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsApiReady(true);
    }
  }, []);

  // Update the geocoding effect to wait for API and alerts
  useEffect(() => {
    const geocodeAlerts = async () => {
      console.log('Starting geocoding process...', { isApiReady, alertsLength: alerts.length });
      if (!isApiReady || !alerts.length) return;

      try {
        const geocoded = await Promise.all(
          alerts.map(async (alert) => {
            console.log('Processing alert:', alert);
            if (alert.location.includes(',')) {
              const [lat, lng] = alert.location.split(',').map(coord => parseFloat(coord.trim()));
              return { ...alert, coordinates: { lat, lng } };
            } else {
              const coordinates = await geocodeAddress(alert.location);
              console.log('Geocoded coordinates for', alert.location, ':', coordinates);
              return { ...alert, coordinates };
            }
          })
        );
        const validAlerts = geocoded.filter(alert => alert.coordinates);
        console.log('Processed alerts:', validAlerts);
        setGeocodedAlerts(validAlerts);
      } catch (error) {
        console.error('Error during geocoding:', error);
      }
    };

    geocodeAlerts();
  }, [alerts, isApiReady]);

  const onLoad = React.useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    
    if (location) {
      bounds.extend(new window.google.maps.LatLng(location.latitude, location.longitude));
    }

    // Add alert locations to bounds
    alerts.forEach(alert => {
      // Parse location string to coordinates (assuming format: "lat,lng")
      const [lat, lng] = alert.location.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend(new window.google.maps.LatLng(lat, lng));
      }
    });

    if (location || alerts.length > 0) {
      map.fitBounds(bounds);
    }

    setMap(map);
  }, [location, alerts]);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={location ? { lat: location.latitude, lng: location.longitude } : { lat: 20, lng: 0 }}
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
            <h3 className="font-semibold text-gray-900">{selectedIncident.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedIncident.description}</p>
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-500">Severity: {selectedIncident.severity}</span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
});


export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Add handleClick function definition
  const handleClick = () => {
    navigate("/report-disaster");
  };

  // Add this useEffect to fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(ALERTS_URL + '/get-report', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        console.log("Raw response data:", response.data);
        const alertsData = Array.isArray(response.data) ? response.data : 
                         response.data.reports ? response.data.reports : [];
        console.log("Processed alerts data:", alertsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    if (user?.token) {
      fetchAlerts();
    }
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
            longitude: position.coords.longitude
          };
          setLocation(userLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
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
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="grid grid-cols-12 gap-6 h-full p-6">
          {/* Left Column - Stats and Alerts */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Emergency Hub</h1>
                <AlertTriangle className="h-8 w-8" />
              </div>
              <p className="mt-2 text-blue-100">Emergency Response Command Center</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Incidents</p>
                    <h3 className="text-2xl font-bold text-gray-900">15</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Response Teams</p>
                    <h3 className="text-2xl font-bold text-gray-900">42</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Open Requests</p>
                    <h3 className="text-2xl font-bold text-gray-900">23</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
                  <Link to="/alerts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Emergency Alert</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Emergency response teams dispatched...
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Map and Resources */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Emergency Incident Map</h2>
                  <button onClick={handleClick} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
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
                    alerts={alerts} // Add this line
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading map...</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Emergency Vehicles</span>
                    <span className="font-medium text-gray-900">8/10 Available</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Medical Supplies</span>
                    <span className="font-medium text-gray-900">65% Remaining</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Response Teams</span>
                    <span className="font-medium text-gray-900">12/15 Active</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
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