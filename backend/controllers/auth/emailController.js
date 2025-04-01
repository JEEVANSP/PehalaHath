import UserSchema from '../../config/models/userModel.js';
import { sendAlertEmail, sendBatchAlertEmails } from '../../service/emailService.js';

// Send email notification for a new alert to all users
export const sendAlertNotification = async (alertData) => {
  try {
    // Get all users who have enabled email notifications for this alert type
    const users = await UserSchema.find({
      'notifications.email': true,
      [`notifications.alertTypes.${alertData.type.toLowerCase()}`]: true
    }, 'email');
    
    // If no alert type matches, try to use the "other" category
    if (users.length === 0) {
      const otherUsers = await UserSchema.find({
        'notifications.email': true,
        'notifications.alertTypes.other': true
      }, 'email');
      
      if (otherUsers.length > 0) {
        const recipients = otherUsers.map(user => user.email);
        const results = await sendBatchAlertEmails(recipients, alertData);
        return { success: true, results, category: 'other' };
      }
      
      return { success: false, message: 'No recipients found with matching notification preferences' };
    }
    
    const recipients = users.map(user => user.email);
    
    if (recipients.length === 0) {
      return { success: false, message: 'No recipients found' };
    }
    
    // Send emails in batch
    const results = await sendBatchAlertEmails(recipients, alertData);
    return { success: true, results };
  } catch (error) {
    console.error('Error sending alert notifications:', error);
    return { success: false, error: error.message };
  }
};

// Send test email (for testing purposes)
export const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    const testAlert = {
      title: 'Test Alert',
      type: 'Test',
      location: 'Test Location',
      severity: 'Medium',
      description: 'This is a test alert to verify email notifications are working correctly.',
      timestamp: new Date()
    };
    
    const result = await sendAlertEmail(email, testAlert);
    
    if (result.success) {
      return res.status(200).json({ message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      return res.status(500).json({ error: 'Failed to send test email', details: result.error });
    }
  } catch (error) {
    console.error('Error in sendTestEmail:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};