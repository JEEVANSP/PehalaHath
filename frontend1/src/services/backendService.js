import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update this with your backend URL

axios.interceptors.request.use(request => {
  console.log('Starting API Request:', request.url);
  return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use(response => {
  console.log('API Response:', {
    url: response.config.url,
    status: response.status,
    data: response.data
  });
  return response;
});

export const backendService = {
  // Get all resources
  getAllResources: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resources`);
      console.log(response.data);
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

  // Get resources requested by the current user
  getUserRequestedResources: async (userId, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/resources/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user resources:', error);
      throw error;
    }
  },

  // Update resource allocation status
  updateResourceAllocation: async (userId,resourceId,token) => {
    try {
      console.log("resourceId",resourceId);
      console.log("userId",userId);
      const response = await axios.patch(
        `${API_BASE_URL}/resources/${userId}/${resourceId}/allocate`,
        { status: 'allocated' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating resource allocation:', error);
      throw error;
    }
  },

  deleteAllocatedResource: async (userId,resourceId,token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/resources/${userId}/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
};

