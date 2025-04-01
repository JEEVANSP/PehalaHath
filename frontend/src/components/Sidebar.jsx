import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, Phone, AlertCircle, Box, Settings, Heart, LogOut, Menu, X, Home,User,Globe, Droplet } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { useThemeStore } from '../store/theme';

export function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth();
  const { isDarkMode } = useThemeStore();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('chatHistory');
    logout();
  };

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Bell size={20} />, label: 'Alerts', path: '/alerts' },
    { icon: <MessageSquare size={20} />, label: 'Chat', path: '/chat' },
    { icon: <Phone size={20} />, label: 'Emergency Contacts', path: '/emergency-contacts' },
    { icon: <AlertCircle size={20} />, label: 'Report Disaster', path: '/report-disaster' },
    { icon: <Box size={20} />, label: 'Resources', path: '/resources' },
    { icon: <Heart size={20} />, label: 'Volunteers', path: '/volunteers' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
    {icon: <Droplet className='h-5 w-5'/>, label: 'Dam Water Levels', path: '/dam-water-levels'},
    { icon: <Globe size={20} />, label: 'Landslide Map', path: 'https://pehlahath123.projects.earthengine.app/view/pehla-hath' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full transition-all duration-300 z-50 
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
      ${isSidebarOpen ? 'w-64' : 'w-18'}`}>
      <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {isSidebarOpen && (
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-600' : 'bg-red-100'}`}>
              <AlertCircle className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-red-600'}`} />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              PehlaHath
            </h2>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <nav className="p-4 flex flex-col h-[calc(100%-80px)] justify-between">
        <div className="space-y-1">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} 
                  p-3 rounded-lg transition-all duration-200 relative
                  ${isActive 
                    ? isDarkMode 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                      : 'bg-red-50 text-red-600 shadow-lg shadow-red-100'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                  }`}
              >
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${
                    isDarkMode ? 'bg-white' : 'bg-red-600'
                  }`} />
                )}
                <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        
        <button
          onClick={handleLogout}
          className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} 
            p-3 rounded-lg transition-all duration-200
            ${isDarkMode 
              ? 'text-red-400 hover:bg-gray-700 hover:text-red-300' 
              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
        >
          <LogOut size={20} />
          {isSidebarOpen && <span>Sign Out</span>}
        </button>
      </nav>
    </div>
  );
}