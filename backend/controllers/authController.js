import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Seed first admin if no users exist
export const registerAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ isAdmin: true });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const { name, email, phone, department, batch, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const admin = new User({
      name,
      email,
      phone,
      department,
      batch,
      password: hash,
      isAdmin: true,
    });
    await admin.save();
    res.status(201).json({ message: 'Admin registered', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error: error.message });
  }
};

// Login (all users)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

// Admin-only: Add user
export const addUser = async (req, res) => {
  try {
    const { name, email, phone, department, batch, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      phone,
      department,
      batch,
      password: hash,
      isAdmin: false,
    });
    await user.save();
    res.status(201).json({ message: 'User added', user });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
};

// Admin-only: List users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Admin-only: Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}; 