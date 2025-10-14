import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  submitUserVerificationDocuments,
  submitCompanyVerificationDocuments,
  getUserVerificationStatus,
  getAdminPendingVerifications,
  adminApproveVerification,
  adminRejectVerification,
  getAdminVerificationStats
} from '../controllers/verificationController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User verification routes
router.post('/user', submitUserVerificationDocuments);
router.post('/company', submitCompanyVerificationDocuments);
router.get('/status', getUserVerificationStatus);

// Admin routes
router.get('/admin/pending', authorize('admin'), getAdminPendingVerifications);
router.get('/admin/stats', authorize('admin'), getAdminVerificationStats);
router.put('/admin/:userId/approve', authorize('admin'), adminApproveVerification);
router.put('/admin/:userId/reject', authorize('admin'), adminRejectVerification);

export default router;
