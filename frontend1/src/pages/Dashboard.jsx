import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate,Link } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { AlertTriangle, Users, MessageSquare, Bell, ArrowRight, Menu, X, AlertCircle, Phone, FileText, Box, Settings, Heart, LogOut } from 'lucide-react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';


const BACKEND_URL = "http://localhost:5000/api/auth/dashboard";
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const emergencyIncidents = [
  {
    id: '1',
    type: 'flood',
    title: 'Severe Flooding Event',
    description: 'Major flooding reported in coastal areas',
    location: { lat: 40.7128, lng: -74.0060 },
    severity: 'high',
    timestamp: new Date().toISOString(),
    reportedBy: {
      id: '1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'emergency_responder'
    },
    status: 'active'
  },
  // Add more mock incidents as needed
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect if not logged in
      return;
    }

    axios.get(BACKEND_URL)
      .then(res => setDashboardData(res.data))
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        logout(); // If token invalid, log out
      });
  }, [user, navigate, logout]);

  if (!user) return null; // Prevents flashing

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
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Incident
                  </button>
                </div>
              </div>
              <div className="h-[600px] relative">
                <LoadScript googleMapsApiKey={VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: 20, lng: 0 }}
                    zoom={2}
                  >
                    {emergencyIncidents.map((incident) => (
                      <Marker
                        key={incident.id}
                        position={incident.location}
                        onClick={() => setSelectedIncident(incident)}
                      />
                    ))}
                    {selectedIncident && (
                      <InfoWindow
                        position={selectedIncident.location}
                        onCloseClick={() => setSelectedIncident(null)}
                      >
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900">{selectedIncident.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{selectedIncident.description}</p>
                          <div className="mt-2 flex justify-end">
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                              View Details
                            </button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </LoadScript>
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
