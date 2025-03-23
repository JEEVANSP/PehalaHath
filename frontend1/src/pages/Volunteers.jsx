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

const BACKEND_URL = "http://localhost:5000/api/volunteers";

export function Volunteers() {
  const { user } = useAuth();
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
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  // Add this function to handle opening the details modal
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Volunteer Coordination
        </h1>
        {user?.role === "authority" && (
          <button
            onClick={() => {
              console.log("Create Task button clicked");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create Task
          </button>
        )}
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-10 w-10 text-red-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Active Volunteers</h2>
              <p className="text-3xl font-bold">{stats.activeVolunteers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Hours Contributed</h2>
              <p className="text-3xl font-bold">{stats.hoursContributed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Tasks Completed</h2>
              <p className="text-3xl font-bold">{stats.tasksCompleted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MapPin className="h-10 w-10 text-purple-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Active Locations</h2>
              <p className="text-3xl font-bold">{stats.activeLocations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Active Tasks
          </h3>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No active tasks available at the moment.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li key={task._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : task.priority === "critical"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === "open"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {task.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {task.estimatedDuration}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {task.volunteers ? task.volunteers.length : 0}/{task.maxVolunteers} volunteers
                      </div>
                      {task.volunteers && task.volunteers.some(vol => vol._id === user?._id) && (
                        <div className="flex items-center text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          You are volunteering
                        </div>
                      )}
                      {task.requiredSkills &&
                        task.requiredSkills.length > 0 && (
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">
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
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                          Volunteer
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleViewDetails(task)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      )
                    ) : task.status === 'in_progress' && (task.volunteers.some(vol => vol._id === user?._id) || user?.role === 'authority') ? (
                      <button 
                        onClick={() => handleCompleteTask(task._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleViewDetails(task)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
