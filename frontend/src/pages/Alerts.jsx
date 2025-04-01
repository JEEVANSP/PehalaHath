import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthProvider";
import { Bell, AlertTriangle, Filter, Search, MapPin, Calendar, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { useThemeStore } from '../store/theme';

const BACKEND_URL = "http://localhost:5000/api/auth/reports";

export function Alerts() {
  const { isDarkMode } = useThemeStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const {user} = useAuth();

  useEffect(() => {
    setTimeout(() => {
      fetchReports();
      setLoading(false);
    }, 1000);
  }, [user]);

  const fetchReports = async () => {
    try {
      console.log("user", user.token);
      const response = await fetch(`${BACKEND_URL}/get-report`, {
        headers: { "Authorization": `Bearer ${user?.token}` },
      });
      const data = await response.json();
      console.log("Fetched reports data:", data);
      
      if (Array.isArray(data)) {
        data.forEach(report => {
          console.log(`Report ${report._id} images:`, report.images);
        });
      }
      
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setAlerts([]);
    }
  };

  const getSeverityColor = (severity) => {
    if (isDarkMode) {
      switch (severity) {
        case 'critical': return 'bg-red-900/30 text-red-300 border-red-800';
        case 'high': return 'bg-orange-900/30 text-orange-300 border-orange-800';
        case 'medium': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
        case 'low': return 'bg-green-900/30 text-green-300 border-green-800';
        default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
      }
    } else {
      switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    (selectedSeverity === 'all' || alert.severity === selectedSeverity) &&
    alert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-red-600'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'} p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className={`relative overflow-hidden rounded-2xl shadow-2xl p-8 mb-8 transform hover:scale-[1.01] transition-transform ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
            : 'bg-gradient-to-r from-red-600 to-red-500'
        }`}>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Global Alert System
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-red-50'} opacity-90`}>
                Stay informed about emergency situations in your area
              </p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/20'} p-4 rounded-full shadow-inner`}>
              <Bell className={`h-10 w-10 ${isDarkMode ? 'text-red-400' : 'text-white'}`} />
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white/80'} backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 flex gap-4 border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} h-5 w-5`} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                  : 'border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              }`}
            />
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className={`px-6 py-3 rounded-xl transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent' 
                : 'border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent'
            } appearance-none`}
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Enhanced Alerts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert._id} 
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white/90'} backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 p-6 border ${
                isDarkMode ? 'border-gray-700 hover:border-red-500/50' : 'border-gray-100 hover:border-red-100'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-xl border ${getSeverityColor(alert.severity)} transform hover:scale-105 transition-transform flex items-center justify-center w-10 h-10`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {alert.title}
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      {alert.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        {alert.location}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAlert(alert)}
                  className={`flex items-center text-sm px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  <span className="mr-2">Details</span>
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden relative flex shadow-2xl`}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedAlert(null)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className={`p-2 rounded-xl border ${getSeverityColor(selectedAlert.severity)} flex items-center justify-center w-10 h-10`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAlert.title}
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      {selectedAlert.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(selectedAlert.createdAt).toLocaleString()}
                      </div>
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedAlert.location}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAlert.images && selectedAlert.images.length > 0 ? (
                  <div>
                    <div className={`flex items-center gap-2 text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <ImageIcon className="h-4 w-4" />
                      <span>Images ({selectedAlert.images.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedAlert.images.map((imageUrl, index) => (
                        <div key={index} className={`relative rounded-lg overflow-hidden group ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <img
                            src={imageUrl}
                            alt={`Alert image ${index + 1}`}
                            className="w-full h-auto max-h-[500px] object-contain transform group-hover:scale-[1.02] transition-transform duration-200"
                            onError={(e) => {
                              console.error(`Failed to load image ${index + 1}:`, imageUrl);
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="flex items-center justify-center h-full p-4 text-red-500">
                                  <p>Failed to load image</p>
                                </div>
                              `;
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image ${index + 1}:`, imageUrl);
                            }}
                          />
                          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Side Panel */}
            <div className={`w-80 border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Alert Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Severity Level
                      </p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                        {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Emergency Type
                      </p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAlert.type.charAt(0).toUpperCase() + selectedAlert.type.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Location
                      </p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAlert.location}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                        Reported At
                      </p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(selectedAlert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Emergency Guidelines
                  </h3>
                  <div className="space-y-3">
                    <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Stay away from the affected area and follow local authorities' instructions
                      </p>
                    </div>
                    <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Keep emergency supplies ready and stay informed through official channels
                      </p>
                    </div>
                    <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Have an evacuation plan ready and know your emergency contacts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;
