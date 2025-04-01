import React, { useState, useEffect } from 'react';
import { Droplet, AlertTriangle, BarChart3, CloudRain, Waves, ArrowDown, ArrowUp } from 'lucide-react';
import axios from 'axios';
import { useThemeStore } from '../store/theme';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '../utils/googleMapsConfig';

export function DamWaterLevels() {
  const { isDarkMode } = useThemeStore();
  const [dams, setDams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDam, setSelectedDam] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 10.8505, lng: 76.2711 }); // Center of Kerala

  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  useEffect(() => {
    fetchDamData();
  }, []);

  const fetchDamData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dams/dam-levels');
      if (response.data && response.data.dams) {
        setDams(response.data.dams);
        console.log('Dam data loaded:', response.data.dams);
      } else {
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching dam data:', error);
      setError('Failed to fetch dam water level data');
    } finally {
      setLoading(false);
    }
  };

  const getWaterLevelStatus = (dam) => {
    if (!dam.data || !dam.data[0]) return 'normal';
    
    const currentLevel = parseFloat(dam.data[0].waterLevel);
    const redLevel = parseFloat(dam.redLevel);
    const orangeLevel = parseFloat(dam.orangeLevel);
    const blueLevel = parseFloat(dam.blueLevel);
    
    if (currentLevel >= redLevel) return 'critical';
    if (currentLevel >= orangeLevel) return 'warning';
    if (currentLevel >= blueLevel) return 'elevated';
    return 'normal';
  };

  const getStatusColor = (status) => {
    if (isDarkMode) {
      switch (status) {
        case 'critical': return 'bg-red-900/30 text-red-300 border-red-800';
        case 'warning': return 'bg-orange-900/30 text-orange-300 border-orange-800';
        case 'elevated': return 'bg-blue-900/30 text-blue-300 border-blue-800';
        case 'normal': return 'bg-green-900/30 text-green-300 border-green-800';
        default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
      }
    } else {
      switch (status) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'elevated': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'normal': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'elevated': return <Waves className="h-5 w-5" />;
      case 'normal': return <Droplet className="h-5 w-5" />;
      default: return <Droplet className="h-5 w-5" />;
    }
  };

  const handleDamClick = (dam) => {
    setSelectedDam(dam);
    if (dam.latitude && dam.longitude) {
      setMapCenter({ lat: parseFloat(dam.latitude), lng: parseFloat(dam.longitude) });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-500 to-blue-600'} p-8 text-white`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dam Water Levels</h1>
              <p className="text-blue-100">Live monitoring of water levels in major dams</p>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-white/20'}`}>
              <Droplet className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Map and Dam List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dam List */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dam Status Overview
            </h2>
            <div className="space-y-3">
              {dams.map((dam) => {
                const status = getWaterLevelStatus(dam);
                const statusClass = getStatusColor(status);
                const currentData = dam.data && dam.data[0];
                
                return (
                  <div 
                    key={dam.id}
                    onClick={() => handleDamClick(dam)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-white'
                    } ${selectedDam?.id === dam.id ? (isDarkMode ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-500') : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {dam.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                            {getStatusIcon(status)}
                            <span className="ml-1">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className={`text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="text-lg font-bold">
                          {currentData ? currentData.waterLevel : 'N/A'} m
                        </div>
                        <div className="text-xs">
                          {currentData ? currentData.storagePercentage : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          {isLoaded ? (
            <div className={`rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={10}
                  options={{
                    styles: isDarkMode ? [
                      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                    ] : [],
                  }}
                >
                  {dams.map((dam) => {
                    if (!dam.latitude || !dam.longitude) return null;
                    
                    const status = getWaterLevelStatus(dam);
                    let markerIcon;
                    
                    switch (status) {
                      case 'critical':
                        markerIcon = { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' };
                        break;
                      case 'warning':
                        markerIcon = { url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png' };
                        break;
                      case 'elevated':
                        markerIcon = { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' };
                        break;
                      default:
                        markerIcon = { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' };
                    }
                    
                    return (
                      <Marker
                        key={dam.id}
                        position={{ lat: parseFloat(dam.latitude), lng: parseFloat(dam.longitude) }}
                        onClick={() => handleDamClick(dam)}
                        icon={markerIcon}
                      />
                    );
                  })}
                  
                  {selectedDam && selectedDam.latitude && selectedDam.longitude && (
                    <InfoWindow
                      position={{ lat: parseFloat(selectedDam.latitude), lng: parseFloat(selectedDam.longitude) }}
                      onCloseClick={() => setSelectedDam(null)}
                    >
                      <div className="p-2 max-w-xs">
                        <h3 className="font-bold text-gray-900">{selectedDam.name}</h3>
                        <p className="text-sm text-gray-700">Water Level: {selectedDam.data?.[0]?.waterLevel || 'N/A'} m</p>
                        <p className="text-sm text-gray-700">Storage: {selectedDam.data?.[0]?.storagePercentage || 'N/A'}</p>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-xl">
              <p>Loading map...</p>
            </div>
          )}

          {/* Selected Dam Details */}
          {selectedDam && (
            <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedDam.name} Dam Details
                </h2>
              </div>
              <div className="p-6">
                {selectedDam.data && selectedDam.data[0] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Current Status
                        </h3>
                        <div className="mt-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Water Level</p>
                            <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {selectedDam.data[0].waterLevel} m
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Storage</p>
                            <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {selectedDam.data[0].storagePercentage}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Flow Information
                        </h3>
                        <div className="mt-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <ArrowDown className="h-3 w-3 inline mr-1" />
                              Inflow
                            </p>
                            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {selectedDam.data[0].inflow} m³/s
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <ArrowUp className="h-3 w-3 inline mr-1" />
                              Outflow
                            </p>
                            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {selectedDam.data[0].totalOutflow} m³/s
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <CloudRain className="h-4 w-4 inline mr-1" />
                          Rainfall
                        </h3>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedDam.data[0].rainfall} mm
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Dam Specifications
                        </h3>
                        <div className="mt-1 space-y-2">
                          <div className="flex justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Reservoir Level (FRL)</p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDam.FRL} m</p>
                          </div>
                          <div className="flex justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Maximum Water Level (MWL)</p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDam.MWL} m</p>
                          </div>
                          <div className="flex justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Storage at FRL</p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDam.liveStorageAtFRL} MCM</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Alert Levels
                        </h3>
                        <div className="mt-1 space-y-2">
                          <div className="flex justify-between">
                            <p className={`text-sm text-red-500`}>Red Alert</p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDam.redLevel} m</p>
                          </div>
                          <div className="flex justify-between">
                            <p className={`text-sm text-orange-500`}>Orange Alert</p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDam.orangeLevel} m</p>
                          </div>
                          <div className="flex justify-between">
                            <p className={`text-sm text-blue-500`}>Blue Alert</p>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDam.blueLevel} m</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Last Updated
                        </h3>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedDam.data[0].date}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data available for this dam</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}