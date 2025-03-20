import Report from '../models/Report.js'; // Import the Report model

// Submit a new report
export const submitReport = async (req, res) => {
  try {
    const { type, title, description, location, severity } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    const report = new Report({ type, title, description, location, severity, images });
    await report.save();

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Error submitting report' });
  }
};

// Fetch all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
};

// Fetch a specific report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Error fetching report' });
  }
};

// Delete a report by ID
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Error deleting report' });
  }
};
