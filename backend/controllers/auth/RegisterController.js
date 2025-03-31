import bcrypt from 'bcryptjs';
import UserSchema from '../../config/models/userModel.js'; // Adjust the path as needed

// User registration controller
export const registerUser = async (req, res) => {
  const { name, email, password, role,phone } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ error: 'Name, email, password, phone and role are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await UserSchema.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserSchema({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};