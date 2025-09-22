import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

const getArg = (name) => {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
};

const run = async () => {
  try {
    await connectDB();

    const providedEmail = getArg('email') || process.env.ADMIN_EMAIL || 'admin@example.com';
    const newPassword = getArg('password') || process.env.ADMIN_NEW_PASSWORD;

    if (!newPassword || newPassword.length < 6) {
      console.error('Error: Provide a new password (≥ 6 chars) via --password or ADMIN_NEW_PASSWORD');
      process.exit(1);
    }

    const adminUser = await User.findOne({ email: providedEmail }) || await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('Error: Admin user not found.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(newPassword, 10);
    adminUser.password = hash;
    await adminUser.save();

    console.log(`Success: Password reset for admin (${adminUser.email}).`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset admin password:', err);
    process.exit(1);
  }
};

run();


