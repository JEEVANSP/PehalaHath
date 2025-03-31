import UserSchema from "../../config/models/userModel.js";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserSchema.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, role, phone, notifications } = req.body;
    if (!name || !email || !role || !phone) {
      return res
        .status(400)
        .json({ error: "Name, email, phone and role are required" });
    }
    const existingUser = await UserSchema.findOne({
      email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email is already in use by another account" });
    }
    
    // Update user data including notification preferences
    const updateData = {
      name,
      email,
      role,
      phone,
      notifications
    };
    
    // Only update notifications if they were provided
    if (notifications) {
      updateData.notifications = notifications;
    }
    
    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    // Find user
    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Server error" });
  }
};
