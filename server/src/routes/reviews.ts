import express from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getCompanyReviews,
} from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/company/:companyId', getCompanyReviews);

// Protected routes
router.post('/', authenticate, authorize('intern'), createReview);
router.get('/:id', getReviewById);
router.put('/:id', authenticate, authorize('intern'), updateReview);
router.delete('/:id', authenticate, authorize('intern'), deleteReview);

export default router;
