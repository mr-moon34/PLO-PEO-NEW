import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User; 