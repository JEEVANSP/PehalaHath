import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Shield, AlertTriangle, Search, Clock, Globe, Navigation, Flame, Ambulance } from 'lucide-react';
import axios from 'axios';

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

  useEffect(() => {
    getUserLocation(setLocation, setLoading, setError);
  }, []);

  useEffect(() => {
    if (location) {
      fetchSpecificCenters(location, setEmergencyCenters, setLoading, setError);
    }
  }, [location]);

  const openDirections = (destination) => {
    if (!destination || !location) return;
    
    const origin = `${location.latitude},${location.longitude}`;
    const dest = `${destination.lat},${destination.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div>Loading nearby emergency centers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Add User Location Display */}
      {location && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Your Location</h2>
              <p className="text-blue-700 text-sm sm:text-base">{location.address}</p>
              <p className="text-blue-600 text-xs mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-900">Emergency Guidelines</h2>
            <p className="text-red-700 text-sm sm:text-base">Stay calm and provide clear information about your location and situation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">Police Emergency</h3>
              <p className="text-gray-600 text-sm">For immediate police assistance</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Availability: 24/7</span>
            <span>Response: &lt; 5 mins</span>
          </div>
          <a
            href="tel:100"
            className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition group"
          >
            <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            <span className="font-semibold">100</span>
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">Fire & Rescue</h3>
              <p className="text-gray-600 text-sm">For fire emergencies and rescue operations</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Availability: 24/7</span>
            <span>Response: &lt; 5 mins</span>
          </div>
          <a
            href="tel:101"
            className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition group"
          >
            <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            <span className="font-semibold">101</span>
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
              <Ambulance className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">Ambulance Service</h3>
              <p className="text-gray-600 text-sm">For emergency medical assistance</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Availability: 24/7</span>
            <span>Response: &lt; 5 mins</span>
          </div>
          <a
            href="tel:108"
            className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition group"
          >
            <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            <span className="font-semibold">108</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Nearest Emergency Centers</h2>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading nearby emergency centers...</p>
            </div>
          ) : location ? (
            <div className="space-y-4">
              {Array.isArray(emergencyCenters) && emergencyCenters.length > 0 ? (
                emergencyCenters.map((center, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-100 hover:border-blue-100 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          center.type === 'Hospital' ? 'bg-green-100' :
                          center.type === 'Police Station' ? 'bg-blue-100' :
                          'bg-red-100'
                        }`}>
                          {center.type === 'Hospital' ? <Ambulance className="h-5 w-5 text-green-600" /> :
                           center.type === 'Police Station' ? <Shield className="h-5 w-5 text-blue-600" /> :
                           <Flame className="h-5 w-5 text-red-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{extractEnglishName(center.display_name)}</h3>
                          <p className="text-sm text-gray-600">{center.type || 'Unknown Type'}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {center.distance.toFixed(1)} km
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{extractEnglishName(center.display_name)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {center.lat && center.lon && (
                          <button
                            onClick={() => openDirections({ lat: center.lat, lng: center.lon })}
                            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          >
                            <Navigation className="h-4 w-4 mr-1.5" />
                            Get Directions
                          </button>
                        )}
                        <a
                          href={`tel:${center.type === 'Hospital' ? '108' : center.type === 'Police Station' ? '100' : '101'}`}
                          className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
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
                  <div className="bg-gray-50 rounded-lg p-6">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No nearby emergency centers found.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Emergency Tips</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-gray-700 text-sm">Keep important documents in a waterproof container</p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-gray-700 text-sm">Have an emergency kit ready with essential supplies</p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-gray-700 text-sm">Know your evacuation routes and meeting points</p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-gray-700 text-sm">Keep emergency contact numbers saved offline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyContacts;
