import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { RegisterRequest, LoginRequest, AuthResponse } from '../../../shared/types';
import { generateOTP, sendOTPEmail, sendPasswordResetEmail } from '../services/emailService';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: '7d' }
  );
};

export const register = async (
  req: Request<{}, any, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      throw createError('All fields are required', 400);
    }

    // Validate role
    if (!['intern', 'company'].includes(role)) {
      throw createError('Invalid role. Must be either "intern" or "company"', 400);
    }

    // Check if user already exists
    let client;
    try {
      client = await pool.connect();
    } catch (dbError) {
      // Database not available - return demo response
      const token = generateToken('demo-user-id');
      res.status(201).json({
        success: true,
        message: 'Demo user created successfully (database not available)',
        data: {
          user: {
            id: 'demo-user-id',
            email,
            firstName,
            lastName,
            role,
            createdAt: new Date().toISOString()
          },
          token
        }
      });
      return;
    }

    try {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, role, created_at`,
        [email, passwordHash, firstName, lastName, role]
      );

      const user = result.rows[0];

      // Create profile based on role
      if (role === 'intern') {
        await client.query(
          `INSERT INTO intern_profiles (user_id, skills, interests)
           VALUES ($1, $2, $3)`,
          [user.id, [], []]
        );
      } else if (role === 'company') {
        await client.query(
          `INSERT INTO company_profiles (user_id, company_name)
           VALUES ($1, $2)`,
          [user.id, `${firstName} ${lastName}'s Company`]
        );
      }

      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.created_at,
          },
          token,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, any, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    let client;
    try {
      client = await pool.connect();
    } catch (dbError) {
      // Database not available - return demo response for demo user
      if (email === 'demo@example.com' && password === 'demo123') {
        const token = generateToken('demo-user-id');
        res.status(200).json({
          success: true,
          message: 'Demo login successful (database not available)',
          data: {
            user: {
              id: 'demo-user-id',
              email: 'demo@example.com',
              firstName: 'Demo',
              lastName: 'User',
              role: 'intern',
              createdAt: new Date().toISOString()
            },
            token
          }
        });
        return;
      } else {
        throw createError('Database not available. Use demo@example.com / demo123 for demo login', 503);
      }
    }

    try {
      // Find user by email
      const result = await client.query(
        'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw createError('Invalid email or password', 401);
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw createError('Invalid email or password', 401);
      }

      const token = generateToken(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: new Date(), // We'll get this from a proper query later
            updatedAt: new Date(),
          },
          token,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('getCurrentUser: Request received, authUser:', req.authUser);
    
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    let client;
    try {
      client = await pool.connect();
    } catch (dbError) {
      // Database not available - return demo user data
      res.status(200).json({
        success: true,
        data: {
          id: req.authUser.id,
          email: req.authUser.email,
          firstName: 'Demo',
          lastName: 'User',
          role: req.authUser.role,
          createdAt: new Date().toISOString()
        }
      });
      return;
    }

    try {
      // Get user data (simplified for now)
      const result = await client.query(
        `SELECT u.*
         FROM users u
         WHERE u.id = $1`,
        [req.authUser.id]
      );

      if (result.rows.length === 0) {
        throw createError('User not found', 404);
      }

      const userData = result.rows[0];

      res.json({
        success: true,
        data: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          avatar: userData.avatar_url,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
          // Add profile-specific data based on role
          ...(req.authUser.role === 'intern' && {
            university: userData.university,
            major: userData.major,
            graduationYear: userData.graduation_year,
            skills: userData.skills || [],
            interests: userData.interests || [],
            experience: userData.experience,
            resumeUrl: userData.resume_url,
            portfolioUrl: userData.portfolio_url,
            linkedinUrl: userData.linkedin_url,
            githubUrl: userData.github_url,
          }),
          ...(req.authUser.role === 'company' && {
            companyName: userData.company_name,
            description: userData.description,
            website: userData.website,
            industry: userData.industry,
            size: userData.size,
            location: userData.location,
            logoUrl: userData.logo_url,
            linkedinUrl: userData.linkedin_url,
            verified: userData.verified,
          }),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const client = await pool.connect();
    try {
      // Update basic user info
      const { firstName, lastName, avatar } = req.body;
      
      if (firstName || lastName || avatar) {
        await client.query(
          `UPDATE users 
           SET first_name = COALESCE($1, first_name),
               last_name = COALESCE($2, last_name),
               avatar_url = COALESCE($3, avatar_url),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [firstName, lastName, avatar, req.authUser.id]
        );
      }

      // Update role-specific profile
      if (req.authUser.role === 'intern') {
        const {
          university,
          major,
          graduationYear,
          skills,
          interests,
          experience,
          resumeUrl,
          portfolioUrl,
          linkedinUrl,
          githubUrl,
        } = req.body;

        await client.query(
          `UPDATE intern_profiles 
           SET university = COALESCE($1, university),
               major = COALESCE($2, major),
               graduation_year = COALESCE($3, graduation_year),
               skills = COALESCE($4, skills),
               interests = COALESCE($5, interests),
               experience = COALESCE($6, experience),
               resume_url = COALESCE($7, resume_url),
               portfolio_url = COALESCE($8, portfolio_url),
               linkedin_url = COALESCE($9, linkedin_url),
               github_url = COALESCE($10, github_url),
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $11`,
          [
            university,
            major,
            graduationYear,
            skills,
            interests,
            experience,
            resumeUrl,
            portfolioUrl,
            linkedinUrl,
            githubUrl,
            req.authUser.id,
          ]
        );
      } else if (req.authUser.role === 'company') {
        const {
          companyName,
          description,
          website,
          industry,
          size,
          location,
          logoUrl,
          linkedinUrl,
        } = req.body;

        await client.query(
          `UPDATE company_profiles 
           SET company_name = COALESCE($1, company_name),
               description = COALESCE($2, description),
               website = COALESCE($3, website),
               industry = COALESCE($4, industry),
               size = COALESCE($5, size),
               location = COALESCE($6, location),
               logo_url = COALESCE($7, logo_url),
               linkedin_url = COALESCE($8, linkedin_url),
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $9`,
          [
            companyName,
            description,
            website,
            industry,
            size,
            location,
            logoUrl,
            linkedinUrl,
            req.authUser.id,
          ]
        );
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Verify OTP
export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError('Email and OTP are required', 400);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, verification_otp, otp_expires_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw createError('User not found', 404);
      }

      const user = result.rows[0];

      if (!user.verification_otp) {
        throw createError('No OTP found for this user', 400);
      }

      if (user.verification_otp !== otp) {
        throw createError('Invalid OTP', 400);
      }

      if (new Date() > new Date(user.otp_expires_at)) {
        throw createError('OTP has expired', 400);
      }

      // Mark user as verified
      await client.query(
        'UPDATE users SET is_verified = true, verification_otp = NULL, otp_expires_at = NULL WHERE id = $1',
        [user.id]
      );

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Resend OTP
export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, is_verified FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw createError('User not found', 404);
      }

      const user = result.rows[0];

      if (user.is_verified) {
        throw createError('Email is already verified', 400);
      }

      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await client.query(
        'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, otpExpiresAt, user.id]
      );

      const emailSent = await sendOTPEmail(email, otp);
      
      if (!emailSent) {
        throw createError('Failed to send OTP email', 500);
      }

      res.json({
        success: true,
        message: 'OTP sent successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Don't reveal if email exists or not
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent',
        });
        return;
      }

      const user = result.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await client.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, user.id]
      );

      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailSent) {
        throw createError('Failed to send password reset email', 500);
      }

      res.json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw createError('Token and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        throw createError('Invalid or expired reset token', 400);
      }

      const user = result.rows[0];
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await client.query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [hashedPassword, user.id]
      );

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};
