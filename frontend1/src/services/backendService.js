import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update this with your backend URL

export const backendService = {
  // Get all resources
  getAllResources: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resources`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  // Create a new resource request
  createResourceRequest: async (resourceData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/resources`, resourceData);
      return response.data;
    } catch (error) {
      console.error('Error creating resource request:', error);
      throw error;
    }
  },

  // Update resource status
  updateResourceStatus: async (resourceId, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/resources/${resourceId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating resource status:', error);
      throw error;
    }
  },

  // Get user's resource requests
  getUserResourceRequests: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resources/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user resources:', error);
      throw error;
    }
  }
}; 