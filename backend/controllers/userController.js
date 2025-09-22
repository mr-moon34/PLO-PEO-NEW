import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, phone, department, batch, password, isAdmin } = req.body;
    if (!name || !email || !phone || !department || !batch || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      phone,
      department,
      batch,
      password: hashedPassword,
      isAdmin: !!isAdmin
    });
    await user.save();
    res.status(201).json({ message: 'User added successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user count', error: error.message });
  }
}; 