import Resource from '../../config/models/resourceModel.js';

// Get all resources
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ timestamp: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new resource request
export const createResourceRequest = async (req, res) => {
  try {
    const resource = new Resource(req.body);
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update resource status
export const updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update resource allocation status
export const updateResourceAllocation = async (req, res) => {
  try {
    const { userId,resourceId } = req.params;
    const resource = await Resource.findOne({_id: resourceId, 'providedBy.id': userId });
    console.log(resource);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if the resource was requested by the current user
    // if (resource.providedBy.id !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to update this resource' });
    // }

    resource.status = 'allocated';
    
    // Save the updated document
    const updatedResource = await resource.save();

    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's resource requests
export const getUserResourceRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const resources = await Resource.find({ 'providedBy.id': userId }).sort({ timestamp: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllocatedResource = async (req,res) => {
  try {
    const {userId, resourceId} = req.params;
    const resource = await Resource.findOne({
      _id: resourceId,
      'providedBy.id': userId,
      status: 'allocated'
    });
    if(!resource){
      return res.status(404).json({
        message: 'Resource not found or not allocated'
      });
    }
    await Resource.findByIdAndDelete(resourceId);
    res.json({message: 'Resource deleted successfully'});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};