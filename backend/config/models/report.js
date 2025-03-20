import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  severity: { type: String, required: true },
  images: { type: [String], default: [] }, // Stores image paths
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', ReportSchema);

export default Report;
