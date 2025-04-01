import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Shield, AlertTriangle, Search, Clock, Globe, Navigation, Flame, Ambulance } from 'lucide-react';
import axios from 'axios';
import { useThemeStore } from '../store/theme';

// Function to get address from coordinates
const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    return response.data.display_name;
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Location not available';
  }
};

// Function to get user's location
const getUserLocation = async (setLocation, setLoading, setError) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', latitude, longitude);
        
        // Get the address for the coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setLocation({ 
          latitude, 
          longitude,
          address: extractEnglishName(address)
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location services.');
        setLoading(false);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
    setError('Geolocation is not supported by this browser.');
    setLoading(false);
  }
};

// Function to calculate distance between two coordinates using the Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Function to fetch specific types of emergency centers
const fetchSpecificCenters = async (location, setCenters, setLoading, setError) => {
  if (!location) return;
  const { latitude, longitude } = location;
  
  // Calculate bounding box (approximately 3km x 3km)
  const latDiff = 0.03; // roughly 3km
  const lonDiff = 0.03;
  const boundingBox = `${longitude - lonDiff},${latitude - latDiff},${longitude + lonDiff},${latitude + latDiff}`;
  
  const types = [
    { amenity: 'hospital', name: 'Hospital' },
    { amenity: 'police', name: 'Police Station' },
    { amenity: 'fire_station', name: 'Fire Station' }
  ];
  
  let allCenters = [];

  try {
    for (const type of types) {
      console.log(`Fetching ${type.name} centers near ${latitude}, ${longitude}`);
      
      // Try different radii until we find at least one center
      const radii = [5000, 10000, 15000, 20000]; // 5km, 10km, 15km, 20km
      let centers = [];
      
      for (const radius of radii) {
        console.log(`Trying ${radius/1000}km radius for ${type.name}...`);
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&amenity=${type.amenity}&bounded=1&viewbox=${boundingBox}&radius=${radius}&limit=20`);
        
        centers = response.data
          .filter(center => {
            const distance = calculateDistance(latitude, longitude, parseFloat(center.lat), parseFloat(center.lon));
            console.log(`Distance to ${center.display_name}: ${distance} km`);
            return distance <= radius/1000; // Convert radius to km for comparison
          })
          .map(center => ({
            ...center,
            type: type.name,
            distance: calculateDistance(latitude, longitude, parseFloat(center.lat), parseFloat(center.lon))
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);

        if (centers.length > 0) {
          console.log(`Found ${centers.length} ${type.name} centers within ${radius/1000}km`);
          break; // Stop if we found at least one center
        }
      }
      
      allCenters = [...allCenters, ...centers];
    }

    // Sort all centers by distance
    allCenters.sort((a, b) => a.distance - b.distance);
    setCenters(allCenters);
  } catch (error) {
    console.error('Error fetching specific centers:', error);
    setError('Failed to fetch nearby emergency centers.');
  } finally {
    setLoading(false);
  }
};

// Function to extract English name from display_name
const extractEnglishName = (displayName) => {
  if (!displayName) return 'Unknown Location';
  
  // Split by commas and take the first part (usually the main name)
  const parts = displayName.split(',');
  // Remove any non-English characters and extra spaces
  return parts[0]
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

export function EmergencyContacts() {
  const [location, setLocation] = useState(null);
  const [emergencyCenters, setEmergencyCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCenters, setFilteredCenters] = useState([]);

  useEffect(() => {
    getUserLocation(setLocation, setLoading, setError);
  }, []);

  useEffect(() => {
    if (location) {
      fetchSpecificCenters(location, setEmergencyCenters, setLoading, setError);
    }
  }, [location]);

  // Filter centers based on search term
  useEffect(() => {
    if (!emergencyCenters.length) {
      setFilteredCenters([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredCenters(emergencyCenters);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = emergencyCenters.filter(center => {
      const displayName = extractEnglishName(center.display_name).toLowerCase();
      const type = (center.type || '').toLowerCase();
      
      return displayName.includes(lowercasedSearch) || 
             type.includes(lowercasedSearch);
    });
    
    setFilteredCenters(filtered);
  }, [searchTerm, emergencyCenters]);

  const openDirections = (destination) => {
    if (!destination || !location) return;
    
    const origin = `${location.latitude},${location.longitude}`;
    const dest = `${destination.lat},${destination.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div>Loading nearby emergency centers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      {/* Header Section with Gradient */}
      <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-500 to-blue-600'} p-8 text-white`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Emergency Contacts</h1>
              <p className="text-blue-100">Quick access to emergency services and nearby help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location and Guidelines Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {location && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-6`}>
              <div className="flex items-center space-x-4">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'} p-3 rounded-xl`}>
                  <MapPin className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Your Location</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>{location.address}</p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                    Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-red-50'} p-6`}>
            <div className="flex items-center space-x-4">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-3 rounded-xl`}>
                <AlertTriangle className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-red-900'}`}>Emergency Guidelines</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-red-700'}`}>Stay calm and provide clear information about your location and situation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Services Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-6`}>
            <div className="flex items-start space-x-4">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'} p-3 rounded-xl`}>
                <Shield className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'} truncate`}>Police Emergency</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>For immediate police assistance</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Availability: 24/7</span>
              <span>Response: &lt; 5 mins</span>
            </div>
            <a
              href="tel:100"
              className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition group shadow-md hover:shadow-lg"
            >
              <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              <span className="font-semibold">100</span>
            </a>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-red-50'} p-6`}>
            <div className="flex items-start space-x-4">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-3 rounded-xl`}>
                <Flame className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-red-900'} truncate`}>Fire & Rescue</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-red-700'}`}>For fire emergencies and rescue operations</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Availability: 24/7</span>
              <span>Response: &lt; 5 mins</span>
            </div>
            <a
              href="tel:101"
              className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition group shadow-md hover:shadow-lg"
            >
              <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              <span className="font-semibold">101</span>
            </a>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-6`}>
            <div className="flex items-start space-x-4">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-green-100'} p-3 rounded-xl`}>
                <Ambulance className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-green-900'} truncate`}>Ambulance Service</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-green-700'}`}>For emergency medical assistance</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Availability: 24/7</span>
              <span>Response: &lt; 5 mins</span>
            </div>
            <a
              href="tel:108"
              className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition group shadow-md hover:shadow-lg"
            >
              <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              <span className="font-semibold">108</span>
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Centers and Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nearest Emergency Centers</h2>
              <div className="relative mt-2 sm:mt-0">
                <input
                  type="text"
                  placeholder="Search centers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`w-full sm:w-56 pl-8 pr-8 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:ring-blue-500' 
                      : 'bg-white border-gray-200 text-gray-700 placeholder-gray-500 focus:ring-blue-400'
                  } border`}
                />
                <Search className={`absolute left-2.5 top-2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-2.5 top-2 text-xs rounded-full p-0.5 ${
                      isDarkMode ? 'bg-gray-700 text-gray-300 hover:text-gray-100' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading nearby emergency centers...</p>
              </div>
            ) : location ? (
              <div className="space-y-4">
                {Array.isArray(filteredCenters) && filteredCenters.length > 0 ? (
                  filteredCenters.map((center, index) => (
                    <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} hover:border-blue-100 transition-all duration-200`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            center.type === 'Hospital' ? isDarkMode ? 'bg-gray-600' : 'bg-green-100' :
                            center.type === 'Police Station' ? isDarkMode ? 'bg-gray-600' : 'bg-blue-100' :
                            isDarkMode ? 'bg-gray-600' : 'bg-red-100'
                          }`}>
                            {center.type === 'Hospital' ? <Ambulance className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /> :
                             center.type === 'Police Station' ? <Shield className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} /> :
                             <Flame className={`h-5 w-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{extractEnglishName(center.display_name)}</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{center.type || 'Unknown Type'}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {center.distance.toFixed(1)} km
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <MapPin className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          <span className="truncate">{extractEnglishName(center.display_name)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {center.lat && center.lon && (
                            <button
                              onClick={() => openDirections({ lat: center.lat, lng: center.lon })}
                              className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                                isDarkMode 
                                  ? 'text-blue-400 hover:text-blue-300 bg-blue-900 bg-opacity-50 hover:bg-opacity-70' 
                                  : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
                              }`}
                            >
                              <Navigation className="h-4 w-4 mr-1.5" />
                              Get Directions
                            </button>
                          )}
                          <a
                            href={`tel:${center.type === 'Hospital' ? '108' : center.type === 'Police Station' ? '100' : '101'}`}
                            className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                              isDarkMode 
                                ? 'text-green-400 hover:text-green-300 bg-green-900 bg-opacity-50 hover:bg-opacity-70' 
                                : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                            }`}
                          >
                            <Phone className="h-4 w-4 mr-1.5" />
                            Call Now
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                      {searchTerm ? 'No emergency centers match your search' : 'No emergency centers found nearby'}
                    </p>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please enable location services to find nearby emergency centers</p>
            )}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Emergency Tips</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className={`flex items-start space-x-3 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-2 rounded-full flex-shrink-0`}>
                  <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keep important documents in a waterproof container</p>
              </div>
              <div className={`flex items-start space-x-3 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-2 rounded-full flex-shrink-0`}>
                  <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Have an emergency kit ready with essential supplies</p>
              </div>
              <div className={`flex items-start space-x-3 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-2 rounded-full flex-shrink-0`}>
                  <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Know your evacuation routes and meeting points</p>
              </div>
              <div className={`flex items-start space-x-3 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-2 rounded-full flex-shrink-0`}>
                  <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keep emergency contact numbers saved offline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyContacts;