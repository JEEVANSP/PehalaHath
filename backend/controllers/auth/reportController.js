import Report from "../../config/models/report.js"; // Import the Report model
import cloudinary from "../../config/cloudinary.js";
import { sendAlertNotification } from "./emailController.js";
// Submit a new report
export const submitReport = async (req, res) => {
  try {
    const { type, title, description, location, severity } = req.body;
    const images = [];

    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Convert buffer to base64 string for Cloudinary upload
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "reports",
          resource_type: "auto",
        });
        images.push(result.secure_url);
      }
    }

    // Create and save report with all required fields
    const report = new Report({
      type,
      title,
      description,
      location,
      severity,
      images,
    });
    await report.save();

    if (report) {
      // Send email notifications in the background
      sendAlertNotification(report)
        .then((emailResult) => {
          console.log("Email notification result:", emailResult);
        })
        .catch((err) => {
          console.error("Failed to send email notifications:", err);
        });

      // Return response immediately without waiting for emails
      return res.status(201).json(report);
    }

    res.status(200).json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: error.message || "Error submitting report" });
  }
};

// Fetch all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Error fetching reports" });
  }
};

// Fetch a specific report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Error fetching report" });
  }
};

// Delete a report by ID
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ error: "Error deleting report" });
  }
};
