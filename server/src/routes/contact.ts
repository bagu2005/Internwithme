import express from 'express';
import { submitContactForm, getContactInfo } from '../controllers/contactController';

const router = express.Router();

// Get contact information
router.get('/', getContactInfo);

// Submit contact form
router.post('/submit', submitContactForm);

export default router;
