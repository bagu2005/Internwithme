import express from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getInternApplications,
  getCompanyApplications,
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Application routes
router.post('/', authorize('intern'), createApplication);
router.get('/', getApplications);
router.get('/my-applications', authorize('intern'), getInternApplications);
router.get('/company-applications', authorize('company'), getCompanyApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('company'), updateApplicationStatus);

export default router;
