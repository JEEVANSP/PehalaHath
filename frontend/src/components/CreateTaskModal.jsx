import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../store/theme';

export function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const { isDarkMode } = useThemeStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    requiredSkills: '',
    estimatedDuration: '',
    maxVolunteers: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format skills as array
    const taskData = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(skill => skill.trim()).filter(Boolean)
    };
    
    onSubmit(taskData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Volunteer Task</h2>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the task in detail"
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            ></textarea>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Task location"
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Required Skills</label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. first aid, driving, cooking (comma separated)"
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            />
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Separate skills with commas
            </p>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Estimated Duration (hours)</label>
            <input
              type="text"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              required
              placeholder="e.g. 2 hours"
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            />
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Enter the estimated time in hours (e.g., "2 hours", "1.5 hours")
            </p>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Maximum Volunteers</label>
            <input
              type="number"
              name="maxVolunteers"
              min="1"
              max="100"
              value={formData.maxVolunteers}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
              } shadow-sm`}
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;