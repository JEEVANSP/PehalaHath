import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useThemeStore } from '../store/theme';
import { Home, Bell, MessageSquare, Phone, AlertCircle, Box, Settings, Heart } from 'lucide-react';

export function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useThemeStore();
  const location = useLocation();

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/alerts':
        return 'Alerts';
      case '/chat':
        return 'Chat';
      case '/emergency-contacts':
        return 'Emergency Contacts';
      case '/report-disaster':
        return 'Report Disaster';
      case '/resources':
        return 'Resources';
      case '/volunteers':
        return 'Volunteers';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  // Get current page icon based on route
  const getPageIcon = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return <Home size={24} />;
      case '/alerts':
        return <Bell size={24} />;
      case '/chat':
        return <MessageSquare size={24} />;
      case '/emergency-contacts':
        return <Phone size={24} />;
      case '/report-disaster':
        return <AlertCircle size={24} />;
      case '/resources':
        return <Box size={24} />;
      case '/volunteers':
        return <Heart size={24} />;
      case '/settings':
        return <Settings size={24} />;
      default:
        return <Home size={24} />;
    }
  };

  // Update document class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Navigation Bar */}
        <div className={`sticky top-0 z-40 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b shadow-sm`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {getPageIcon()}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getPageTitle()}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {location.pathname === '/' ? 'Overview of your emergency dashboard' : `Manage your ${getPageTitle().toLowerCase()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add any top-right items here */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`p-6 transition-all duration-300 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              {/* Page Content */}
              <div className={`rounded-lg shadow-sm ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } p-6`}>
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}