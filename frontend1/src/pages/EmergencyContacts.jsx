import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Shield, AlertTriangle, Search, Clock, Globe, Navigation } from 'lucide-react';
import axios from 'axios';

export function EmergencyContacts() {
  const [location, setLocation] = useState(null);
  const [emergencyCenters, setEmergencyCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          await fetchNearbyEmergencyCenters(userLocation);
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

  const fetchNearbyEmergencyCenters = async (userLocation) => {
    try {
      const response = await axios.post('/api/emergency/nearby-centers', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });

      setEmergencyCenters(response.data.centers);
    } catch (error) {
      console.error('Error fetching emergency centers:', error);
      setError('Failed to fetch nearby emergency centers');
    } finally {
      setLoading(false);
    }
  };

  const openDirections = (destination) => {
    if (!destination || !location) return;
    
    const origin = `${location.latitude},${location.longitude}`;
    const dest = `${destination.lat},${destination.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
  };

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
            <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">Emergency Response Center</h3>
              <p className="text-gray-600 text-sm">For immediate emergency assistance</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Availability: 24/7</span>
            <span>Response: &lt; 5 mins</span>
          </div>
          <a
            href="tel:911"
            className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition group"
          >
            <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            <span className="font-semibold">911</span>
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">Emergency Response Center</h3>
              <p className="text-gray-600 text-sm">For immediate emergency assistance</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Availability: 24/7</span>
            <span>Response: &lt; 5 mins</span>
          </div>
          <a
            href="tel:911"
            className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition group"
          >
            <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            <span className="font-semibold">911</span>
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">Emergency Response Center</h3>
              <p className="text-gray-600 text-sm">For immediate emergency assistance</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Availability: 24/7</span>
            <span>Response: &lt; 5 mins</span>
          </div>
          <a
            href="tel:911"
            className="flex items-center justify-center w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition group"
          >
            <Phone className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            <span className="font-semibold">911</span>
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
              {emergencyCenters.map((center, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        center.type === 'hospital' ? 'bg-blue-100' :
                        center.type === 'fire' ? 'bg-red-100' :
                        'bg-green-100'
                      }`}>
                        {center.type === 'hospital' ? <Phone className="h-5 w-5 text-blue-600" /> :
                         center.type === 'fire' ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                         <Shield className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{center.name}</h3>
                        <p className="text-sm text-gray-600">{center.distance} away</p>
                        {center.rating && (
                          <p className="text-sm text-yellow-600">★ {center.rating}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      center.status === 'Open' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {center.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {center.address}
                    </p>
                    <div className="flex space-x-4">
                      <a
                        href={`tel:${center.phone}`}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {center.phone}
                      </a>
                      {center.location && (
                        <button
                          onClick={() => openDirections(center.location)}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Get Directions
                        </button>
                      )}
                    </div>
                    {center.website && (
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Visit Website
                      </a>
                    )}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-medium">Opening Hours:</span>
                      </div>
                      <div className="ml-5">
                        {center.openingHours.map((hours, idx) => (
                          <p key={idx} className="text-xs">{hours}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
