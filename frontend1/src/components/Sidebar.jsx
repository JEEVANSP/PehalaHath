import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, Phone, AlertCircle, Box, Settings, Heart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';

export function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth();

  const sidebarItems = [
    { icon: <Box size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Bell size={20} />, label: 'Alerts', path: '/alerts' },
    { icon: <MessageSquare size={20} />, label: 'Chat', path: '/chat' },
    { icon: <Phone size={20} />, label: 'Emergency Contacts', path: '/emergency-contacts' },
    { icon: <AlertCircle size={20} />, label: 'Report Disaster', path: '/report-disaster' },
    { icon: <Box size={20} />, label: 'Resources', path: '/resources' },
    { icon: <Heart size={20} />, label: 'Volunteers', path: '/volunteers' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50 
      ${isSidebarOpen ? 'w-64' : 'w-18'}`}>
      <div className="p-4 flex items-center justify-between border-b">
        {isSidebarOpen && <h2 className="text-xl font-bold text-gray-800">PehlaHath</h2>}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <nav className="p-4 flex flex-col h-[calc(100%-80px)] justify-between">
        <div>
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} 
                p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 mb-2`}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
        
        <button
          onClick={logout}
          className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} 
            p-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700`}
        >
          <LogOut size={20} />
          {isSidebarOpen && <span>Sign Out</span>}
        </button>
      </nav>
    </div>
  );
}