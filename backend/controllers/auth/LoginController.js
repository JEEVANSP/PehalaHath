import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserSchema from '../../config/models/userModel.js'; // Adjust the path as needed
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// User login controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const user = await UserSchema.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT Token
    console.log('JWT_SECRET:', JWT_SECRET);

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role,
        phone: user.phone 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};