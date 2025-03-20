import mongoose from 'mongoose';

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role:{type:String,required:true}
});

const UserSchema = mongoose.model('User', User);

export default UserSchema;
