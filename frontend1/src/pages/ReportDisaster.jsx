import React, { useState, useEffect } from "react";



const BACKEND_URL = "http://localhost:5000/api/auth";

const ReportDisaster = () => {
    const [formData, setFormData] = useState({
        type: "",
        title: "",
        description: "",
        location: "",
        severity: "",
        images: [],
    });

    const [reports, setReports] = useState([]);
    const [responseMessage, setResponseMessage] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    // Fetch all reports from backend
    const fetchReports = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/reports");
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle file selection
    const handleFileChange = (e) => {
        setFormData({ ...formData, images: e.target.files });
    };

    // Submit report
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            if (key === "images") {
                Array.from(formData.images).forEach((file) => formDataToSend.append("images", file));
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

        try {
            const response = await fetch("http://localhost:5000/api/auth/reports", {
                method: "POST",
                body: formDataToSend,
            });

            const result = await response.json();
            if (response.ok) {
                setResponseMessage("Report submitted successfully!");
                setFormData({ type: "", title: "", description: "", location: "", severity: "", images: [] });
                fetchReports();
            } else {
                setResponseMessage(result.error || "Failed to submit report.");
            }
        } catch (error) {
            setResponseMessage("Error submitting report. Try again.");
        }
    };

    // Delete a report
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/auth/reports/${id}`, { method: "DELETE" });
            const result = await response.json();
            if (response.ok) {
                setResponseMessage("Report deleted successfully!");
                fetchReports();
            } else {
                setResponseMessage(result.error || "Failed to delete report.");
            }
        } catch (error) {
            setResponseMessage("Error deleting report. Try again.");
        }
    };

    return (
        <div>
            <h2>Report a Disaster</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label>Type:</label>
                <input type="text" name="type" value={formData.type} onChange={handleChange} required />

                <label>Title:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />

                <label>Description:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />

                <label>Location:</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />

                <label>Severity:</label>
                <input type="text" name="severity" value={formData.severity} onChange={handleChange} required />

                <label>Upload Images:</label>
                <input type="file" multiple onChange={handleFileChange} />

                <button type="submit">Submit Report</button>
            </form>

            {responseMessage && <p>{responseMessage}</p>}

            <h2>Reported Disasters</h2>
            <ul>
                {reports.map((report) => (
                    <li key={report._id}>
                        <strong>{report.title}</strong> - {report.description} ({report.location})
                        <button onClick={() => handleDelete(report._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReportDisaster;
