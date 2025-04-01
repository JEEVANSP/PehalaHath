import mongoose from "mongoose";

const VolunteerTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "completed", "cancelled"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Change from single assignedTo to array of volunteers
  volunteers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // Keep track of max volunteers needed
  maxVolunteers: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  requiredSkills: [String],
  estimatedDuration: { type: String, required: true },
  durationHours: {
    type: Number,
    default: 0,
  },
  actualHours: {
    type: Number,
  },
  completedAt: Date,
});

const VolunteerTask = mongoose.model("VolunteerTask", VolunteerTaskSchema);

export default VolunteerTask;
