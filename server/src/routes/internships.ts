import express from 'express';
import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getCompanyInternships,
} from '../controllers/internshipController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getInternships);
router.get('/:id', optionalAuth, getInternshipById);

// Company routes
router.post('/', authenticate, authorize('company'), createInternship);
router.get('/company/my-internships', authenticate, authorize('company'), getCompanyInternships);
router.put('/:id', authenticate, authorize('company'), updateInternship);
router.delete('/:id', authenticate, authorize('company'), deleteInternship);

export default router;
