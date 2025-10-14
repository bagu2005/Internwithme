import { OAuth2Client } from 'google-auth-library';
import { pool } from '../config/database';
import * as jwt from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = {
  async verifyGoogleToken(token: string) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw createError('Google OAuth not configured', 500);
      }

      console.log('Verifying Google token:', token.substring(0, 20) + '...');
      console.log('Using Google Client ID:', process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw createError('Invalid Google token payload', 401);
      }
      
      console.log('Google token verified successfully for:', payload.email);
      return payload;
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw createError('Google token verification failed', 401);
    }
  },

  async findOrCreateUser(payload: any) {
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatarUrl } = payload;

    if (!email) {
      throw createError('Email not provided by Google', 400);
    }

    const client = await pool.connect();
    try {
      // Check if user exists by google_id
      let userResult = await client.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

      if (userResult.rows.length > 0) {
        // User found by google_id
        return userResult.rows[0];
      }

      // Check if user exists by email (for existing non-Google accounts)
      userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

      if (userResult.rows.length > 0) {
        // User found by email, link Google ID
        const existingUser = userResult.rows[0];
        if (existingUser.google_id && existingUser.google_id !== googleId) {
          throw createError('Email already registered with a different Google account', 409);
        }
        
        await client.query(
          'UPDATE users SET google_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
          [googleId, existingUser.id]
        );
        
        return { ...existingUser, google_id: googleId };
      }

      // Create new user
      const newUserResult = await client.query(
        `INSERT INTO users (email, first_name, last_name, google_id, avatar_url, role, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE) 
         RETURNING id, email, first_name, last_name, role, avatar_url, google_id, is_verified`,
        [email, firstName || 'User', lastName || '', googleId, avatarUrl, 'intern']
      );
      
      const newUser = newUserResult.rows[0];
      
      // Create intern profile for new user
      await client.query(
        `INSERT INTO intern_profiles (user_id, skills, interests, experience, portfolio_url, linkedin_url, github_url, resume_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newUser.id, [], [], '', '', '', '', '']
      );
      
      return newUser;
    } finally {
      client.release();
    }
  },

  generateAuthToken(user: any) {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' } as any
    );
  },

  async authenticateWithGoogle(idToken: string) {
    try {
      const payload = await this.verifyGoogleToken(idToken);
      const user = await this.findOrCreateUser(payload);
      const token = this.generateAuthToken(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
        },
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  }
};
