import express from 'express';
import { googleAuthService } from '../services/googleAuthService';
import { createError } from '../middleware/errorHandler';
import { pool } from '../config/database';

const router = express.Router();

// Google OAuth callback
router.post('/callback', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw createError('Google ID token is required', 400);
    }

    const result = await googleAuthService.authenticateWithGoogle(idToken);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Check if email exists (for frontend to show appropriate sign-in option)
router.post('/check-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw createError('Email is required', 400);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, google_id, password_hash FROM users WHERE email = $1', 
        [email]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        res.status(200).json({
          success: true,
          exists: true,
          hasGoogleAuth: !!user.google_id,
          hasPassword: !!user.password_hash,
        });
      } else {
        res.status(200).json({
          success: true,
          exists: false,
          hasGoogleAuth: false,
          hasPassword: false,
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

export default router;
