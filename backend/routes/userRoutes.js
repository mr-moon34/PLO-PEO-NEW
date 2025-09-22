import express from 'express';
import { getAllUsers, addUser, deleteUser, getUserCount } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.post('/', protect, adminOnly, addUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.get('/count', protect, adminOnly, getUserCount);

export default router; 