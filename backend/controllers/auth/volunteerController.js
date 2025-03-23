import VolunteerTask from "../../config/models/volunteerTask.js";
import User from '../../config/models/userModel.js';

export const getTasks = async (req, res) => {
    try {
      const tasks = await VolunteerTask.find()
        .populate('createdBy', 'name email role')
        .populate('volunteers', 'name email role')
        .sort({ createdAt: -1 });
      
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, location, priority, requiredSkills, estimatedDuration, maxVolunteers } = req.body;
    
    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newTask = new VolunteerTask({
      title,
      description,
      location,
      priority: priority || 'medium',
      requiredSkills: requiredSkills || [],
      estimatedDuration: estimatedDuration || 'Not specified',
      maxVolunteers: maxVolunteers || 1,
      createdBy: req.user.id,
      volunteers: []
    });
    
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};


export const assignVolunteer = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.id;
    
    const task = await VolunteerTask.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.status !== 'open' && task.status !== 'in_progress') {
      return res.status(400).json({ error: 'This task is no longer available' });
    }
    
    // Check if user is already a volunteer
    if (task.volunteers && task.volunteers.includes(userId)) {
      return res.status(400).json({ error: 'You are already volunteering for this task' });
    }
    
    // Check if max volunteers reached
    if (task.volunteers && task.volunteers.length >= task.maxVolunteers) {
      return res.status(400).json({ error: 'Maximum number of volunteers reached for this task' });
    }
    
    // Initialize volunteers array if it doesn't exist
    if (!task.volunteers) {
      task.volunteers = [];
    }
    
    // Add volunteer to the task
    task.volunteers.push(userId);
    
    // Update status if this is the first volunteer
    if (task.status === 'open' && task.volunteers.length > 0) {
      task.status = 'in_progress';
    }
    
    await task.save();
    
    res.status(200).json({ message: 'Successfully volunteered for task', task });
  } catch (error) {
    console.error('Error assigning volunteer:', error);
    res.status(500).json({ error: 'Failed to volunteer for task' });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.id;
    
    const task = await VolunteerTask.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is a volunteer for this task or an authority
    const isVolunteer = task.volunteers && task.volunteers.includes(userId);
    const isAuthority = req.user.role === 'authority';
    
    if (!isVolunteer && !isAuthority) {
      return res.status(403).json({ error: 'You are not authorized to complete this task' });
    }
    
    if (task.status === 'completed') {
      return res.status(400).json({ error: 'This task is already completed' });
    }
    
    task.status = 'completed';
    task.completedAt = new Date();
    
    await task.save();
    
    res.status(200).json({ message: 'Task marked as completed', task });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};

export const getStats = async (req, res) => {
  try {
    // Get all tasks
    const tasks = await VolunteerTask.find();
    
    // Count active tasks (not completed or cancelled)
    const activeTasks = tasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled'
    );
    
    // Count unique volunteers in active tasks
    const activeVolunteersSet = new Set();
    activeTasks.forEach(task => {
      if (task.volunteers && task.volunteers.length > 0) {
        task.volunteers.forEach(volunteer => {
          activeVolunteersSet.add(volunteer.toString());
        });
      }
    });
    
    // Count completed tasks
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    // Count unique locations with active tasks
    const activeLocationsSet = new Set(activeTasks.map(task => task.location));
    
    // Calculate estimated hours contributed (simplified calculation)
    // Assuming each completed task took 2 hours per volunteer on average
    let hoursContributed = 0;
    completedTasks.forEach(task => {
      const volunteerCount = task.volunteers ? task.volunteers.length : 0;
      hoursContributed += volunteerCount * 2; // 2 hours per volunteer per task
    });
    
    const stats = {
      activeVolunteers: activeVolunteersSet.size,
      hoursContributed,
      tasksCompleted: completedTasks.length,
      activeLocations: activeLocationsSet.size
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer statistics' });
  }
};