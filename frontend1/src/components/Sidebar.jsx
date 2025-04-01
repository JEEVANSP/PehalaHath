import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/theme';
import { Home, Bell, MessageSquare, Phone, AlertCircle, Box, Settings, Heart, Menu, X } from 'lucide-react';

export function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/emergency-contacts', icon: Phone, label: 'Emergency Contacts' },
    { path: '/report-disaster', icon: AlertCircle, label: 'Report Disaster' },
    { path: '/resources', icon: Box, label: 'Resources' },
    { path: '/volunteers', icon: Heart, label: 'Volunteers' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } shadow-lg md:hidden`}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full transition-all duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}
        style={{ width: isSidebarOpen ? '16rem' : '4rem' }}
      >
        {/* Logo */}
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            } ${!isSidebarOpen && 'hidden'}`}>
              PehlaHath
            </h1>
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } hidden md:block`}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? isDarkMode
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={20} />
                    {isSidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
} 