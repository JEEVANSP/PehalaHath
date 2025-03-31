import React, { useEffect } from 'react';
import { X, MapPin, Clock, Users, Calendar, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useThemeStore } from '../store/theme';

export function TaskDetailsModal({ isOpen, onClose, task }) {
  const { isDarkMode } = useThemeStore();
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside the content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative top-10 mx-auto p-6 border w-[500px] shadow-2xl rounded-xl ${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 capitalize`}>{task.status.replace('_', ' ')}</p>
          </div>
          <button
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} transition-colors`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center space-x-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Priority</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize`}>{task.priority}</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volunteers</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {task.volunteers ? task.volunteers.length : 0} of {task.maxVolunteers}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <MapPin className="h-5 w-5 text-green-400" />
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.location}</p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <Clock className="h-5 w-5 text-purple-400" />
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estimated Duration</p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.estimatedDuration || "Not specified"}</p>
            </div>
          </div>
          
          <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Description</p>
            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.description}</p>
          </div>
          
          {task.requiredSkills && task.requiredSkills.length > 0 && (
            <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills.map((skill, index) => (
                  <span 
                    key={index}
                    className={`${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'} px-2 py-0.5 rounded-full text-xs`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {task.createdAt && (
            <div className={`flex items-center space-x-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <Calendar className="h-5 w-5 text-orange-400" />
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created On</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(task.createdAt)}</p>
              </div>
            </div>
          )}
          
          {task.volunteers && task.volunteers.length > 0 && (
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-5`}>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Current Volunteers</h4>
              <div className="space-y-3">
                {task.volunteers.map((volunteer) => (
                  <div key={volunteer._id} className={`flex items-center space-x-2 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className={`${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded-full h-8 w-8 flex items-center justify-center`}>
                      {volunteer.name ? volunteer.name.charAt(0).toUpperCase() : 'V'}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{volunteer.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{volunteer.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
