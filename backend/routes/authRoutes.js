import express from 'express';
import {
  registerAdmin,
  login,
  addUser,
  getUsers,
  deleteUser,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register first admin (one-time setup)
router.post('/register-admin', registerAdmin);
// Login (all users)
router.post('/login', login);
// Add user (admin only)
router.post('/add-user', protect, adminOnly, addUser);
// List users (admin only)
router.get('/users', protect, adminOnly, getUsers);
// Delete user (admin only)
router.delete('/delete/:id', protect, adminOnly, deleteUser);

export default router; 