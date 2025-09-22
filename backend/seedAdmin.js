import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();
  const existing = await User.findOne({ isAdmin: true });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }
  const hash = await bcrypt.hash('admin123', 10);
  const admin = new User({
    name: 'Admin',
    email: 'admin@example.com',
    phone: '03001234567',
    department: 'Admin',
    batch: 'N/A',
    password: hash,
    isAdmin: true,
  });
  await admin.save();
  console.log('Admin user created:', admin.email);
  process.exit(0);
};

seedAdmin(); 