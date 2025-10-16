import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getJobs,
  getJobById,
  getJobRecommendations,
  triggerJobScraping,
  getJobStats
} from '../controllers/jobController';

const router = Router();

// Public routes
router.get('/', getJobs);
router.get('/stats', getJobStats);
router.get('/:id', getJobById);

// Protected routes
router.get('/recommendations', auth, getJobRecommendations);

// Admin routes
router.post('/scrape', auth, triggerJobScraping);

export default router;
