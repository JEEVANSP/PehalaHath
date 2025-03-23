import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medical', 'food', 'shelter', 'clothing', 'equipment', 'other']
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'requested', 'allocated'],
    default: 'requested'
  },
  description: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  providedBy: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Resource', resourceSchema); 