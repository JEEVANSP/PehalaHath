import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

export const sendAlertEmail = async(recipient, alertData) => {
  try {
    // Format the alert data for email
    const severityColor = 
      alertData.severity === 'critical' ? '#FF0000' : 
      alertData.severity === 'high' ? '#FF4500' : 
      alertData.severity === 'medium' ? '#FFA500' : '#FFCC00';
    
    // Get alert type icon
    const getAlertTypeIcon = (type) => {
      const typeLC = type.toLowerCase();
      if (typeLC.includes('flood')) return '🌊';
      if (typeLC.includes('fire')) return '🔥';
      if (typeLC.includes('earthquake')) return '🌋';
      if (typeLC.includes('storm') || typeLC.includes('cyclone')) return '🌪️';
      return '⚠️';
    };
    
    const alertIcon = getAlertTypeIcon(alertData.type);
    
    // Email content
    const mailOptions = {
      from: `"PEHLA-HATH Emergency Alerts" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `${alertIcon} URGENT: ${alertData.title} - PEHLA-HATH Alert`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d32f2f; margin: 0;">Emergency Alert</h1>
            <p style="color: #666; font-size: 14px;">PEHLA-HATH Emergency Response System</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f8f8; border-radius: 4px; border-left: 4px solid ${severityColor};">
            <h2 style="margin-top: 0; color: #333;">${alertIcon} ${alertData.title}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Type:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${alertData.type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${alertData.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Severity:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="color: ${severityColor}; font-weight: bold;">${alertData.severity}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Reported:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(alertData.timestamp || Date.now()).toLocaleString()}</td>
              </tr>
            </table>
            
            <div style="margin-top: 15px;">
              <h3 style="margin-bottom: 5px;">Description:</h3>
              <p style="margin-top: 0; line-height: 1.5;">${alertData.description}</p>
            </div>
            
            ${alertData.images && alertData.images.length > 0 ? `
              <div style="margin-top: 15px;">
                <h3 style="margin-bottom: 10px;">Images:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                  ${alertData.images.slice(0, 3).map(img => `
                    <img src="${img}" alt="Alert Image" style="max-width: 180px; max-height: 180px; object-fit: cover; border-radius: 4px;">
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 25px; background-color: #f1f8e9; padding: 15px; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #2e7d32;">Safety Information</h3>
            <p style="margin-bottom: 10px;">Please follow local authority instructions and stay safe.</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Keep emergency contacts handy</li>
              <li>Follow evacuation orders if issued</li>
              <li>Check on vulnerable neighbors if safe to do so</li>
              <li>Stay tuned to local news for updates</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.FRONTEND_URL}/alerts" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View All Alerts</a>
          </div>
          
          <p style="margin-top: 25px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
            This is an automated message from PEHLA-HATH Emergency Response System. Please do not reply to this email.<br>
            You received this email because you opted in to emergency alerts. To update your preferences, visit your profile settings.
          </p>
        </div>
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending alert email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send batch emails to multiple users
export const sendBatchAlertEmails = async (recipients, alertData) => {
    try {
      const results = [];
      for (const recipient of recipients) {
        const result = await sendAlertEmail(recipient, alertData);
        results.push({ email: recipient, ...result });
      }
      return results;
    } catch (error) {
      console.error('Error sending batch emails:', error);
      return { success: false, error: error.message };
    }
};
