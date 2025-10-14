import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, updateProfile, uploadResumeFile } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getUserById);
router.put('/profile', updateProfile);
router.post('/upload-resume', uploadResume, uploadResumeFile);

// Admin routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
