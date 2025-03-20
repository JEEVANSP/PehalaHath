import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthProvider";
import { Bell, AlertTriangle, Filter, Search, MapPin, Calendar, ExternalLink } from 'lucide-react';


const BACKEND_URL = "http://localhost:5000/api/auth/reports";

export function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const {user} = useAuth();

  useEffect(() => {
    setTimeout(() => {
      fetchReports();
      setLoading(false);
    }, 1000);
  }, [user]);

  const fetchReports = async () => {
    try {
        console.log("user",user.token)
      const response = await fetch(`${BACKEND_URL}/get-report`, {
        headers: { "Authorization": `Bearer ${user?.token}` },
      });
      const data = await response.json();
      console.log(data);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setAlerts([]);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    (selectedSeverity === 'all' || alert.severity === selectedSeverity) &&
    alert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading alerts...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl shadow-lg p-8 mb-8 flex justify-between items-center transform hover:scale-[1.01] transition-transform">
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Alert System</h1>
          <Bell className="h-10 w-10 text-white/90 hover:text-white transition-colors" />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 flex gap-4 border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white transition-all hover:bg-gray-50"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert._id} 
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-red-100"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${getSeverityColor(alert.severity)} transform hover:scale-105 transition-transform`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{alert.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {alert.location}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="flex items-center text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                  <span className="mr-2">Details</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
