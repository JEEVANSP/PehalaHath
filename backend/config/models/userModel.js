import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true}, // Role validation
});

// Hash password before saving
// User.pre('save', async function (next) {
//   if (!this.isModified('password')) return next(); // Only hash if password is new/changed
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password method
// User.methods.comparePassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// Create User Model
const UserSchema = mongoose.model('User', User);

export default UserSchema;
