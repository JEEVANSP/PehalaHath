import mongoose from 'mongoose';

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true},
  notifications: {
    email: { type: Boolean, default: true },
    alertTypes: {
      flood: { type: Boolean, default: true },
      earthquake: { type: Boolean, default: true },
      fire: { type: Boolean, default: true },
      other: { type: Boolean, default: true }
    }
  }
});

const UserSchema = mongoose.model('User', User);

export default UserSchema;
