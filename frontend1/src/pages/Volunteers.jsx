import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { toast } from "react-hot-toast";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { TaskDetailsModal } from "../components/TaskDetailsModal";
import { useThemeStore } from '../store/theme';

const BACKEND_URL = "http://localhost:5000/api/volunteers";

export function Volunteers() {
  const { user } = useAuth();
  const { isDarkMode } = useThemeStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    activeVolunteers: 0,
    hoursContributed: 0,
    tasksCompleted: 0,
    activeLocations: 0,
  });

  useEffect(() => {
    if (user?.token) {
      console.log("User token:", user.token);
      console.log("User role:", user.role);
      fetchTasks();
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    console.log("Modal state changed:", isModalOpen);
  }, [isModalOpen]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/tasks`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stats`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleVolunteer = async (taskId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ taskId }),
      });

      const result = await response.json();
      console.log("Response from backend:", result);

      if (response.ok) {
        toast.success("You have successfully volunteered for this task!");
        fetchTasks(); // Refresh tasks
        fetchStats(); // Refresh stats
      } else {
        toast.error(result.error || "Failed to volunteer for task");
      }
    } catch (error) {
      console.error("Error volunteering for task:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Task created successfully!");
        setIsModalOpen(false);
        fetchTasks(); // Refresh tasks
      } else {
        toast.error(result.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ taskId }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Task marked as completed!");
        fetchTasks(); // Refresh tasks
        fetchStats(); // Refresh stats
      } else {
        toast.error(result.error || "Failed to complete task");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-red-600'}`}></div>
      </div>
    );
  }

  // Add this function to handle opening the details modal
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-red-500 to-red-600'} p-8 text-white`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Volunteer Coordination</h1>
              <p className="text-red-100">Join hands to make a difference in emergency situations</p>
            </div>
            {user?.role === "authority" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 rounded-xl shadow-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 text-white font-medium"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-red-50'} p-6`}>
            <div className="flex items-center">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-red-100'} p-3 rounded-xl`}>
                <Users className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="ml-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-red-900'}`}>Active Volunteers</h2>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-red-600'}`}>{stats.activeVolunteers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-6`}>
            <div className="flex items-center">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'} p-3 rounded-xl`}>
                <Clock className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Hours Contributed</h2>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>{stats.hoursContributed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-6`}>
            <div className="flex items-center">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-green-100'} p-3 rounded-xl`}>
                <Calendar className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="ml-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-green-900'}`}>Tasks Completed</h2>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-green-600'}`}>{stats.tasksCompleted}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transform hover:scale-105 transition-transform duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'} p-6`}>
            <div className="flex items-center">
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-purple-100'} p-3 rounded-xl`}>
                <MapPin className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="ml-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>Active Locations</h2>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>{stats.activeLocations}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Tasks</h3>
        </div>
        {tasks.length === 0 ? (
          <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No active tasks available at the moment.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task._id} className={`p-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === "high"
                            ? isDarkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? isDarkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                            : task.priority === "critical"
                            ? isDarkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                            : isDarkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "open"
                            ? isDarkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                            : task.status === "in_progress"
                            ? isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                            : task.status === "completed"
                            ? isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"
                            : isDarkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {task.description}
                    </p>
                    <div className="mt-4 flex items-center space-x-6 text-sm">
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <MapPin className="h-4 w-4 mr-1" />
                        {task.location}
                      </div>
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        {task.estimatedDuration}
                      </div>
                      <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <Users className="h-4 w-4 mr-1" />
                        {task.volunteers ? task.volunteers.length : 0}/{task.maxVolunteers} volunteers
                      </div>
                      {task.volunteers && task.volunteers.some(vol => vol._id === user?._id) && (
                        <div className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          You are volunteering
                        </div>
                      )}
                      {task.requiredSkills && task.requiredSkills.length > 0 && (
                        <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          <span className="text-xs">
                            Skills: {task.requiredSkills.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {task.status === 'open' || (task.status === 'in_progress' && task.volunteers.length < task.maxVolunteers) ? (
                      !task.volunteers.some(vol => vol._id === user?._id) ? (
                        <button 
                          onClick={() => handleVolunteer(task._id)}
                          className="inline-flex items-center px-4 py-2 rounded-xl shadow-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                        >
                          Volunteer
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleViewDetails(task)}
                          className="inline-flex items-center px-4 py-2 rounded-xl shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                        >
                          View Details
                        </button>
                      )
                    ) : task.status === 'in_progress' && (task.volunteers.some(vol => vol._id === user?._id) || user?.role === 'authority') ? (
                      <button 
                        onClick={() => handleCompleteTask(task._id)}
                        className="inline-flex items-center px-4 py-2 rounded-xl shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewDetails(task)}
                        className="inline-flex items-center px-4 py-2 rounded-xl shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      
      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}

export default Volunteers;
