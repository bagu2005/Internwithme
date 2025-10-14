import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import path from 'path';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC'
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id || req.authUser?.id;
    
    console.log('getUserById: Request received, userId:', userId, 'authUser:', req.authUser);
    
    if (!userId) {
      throw createError('User ID required', 400);
    }

    const client = await pool.connect();
    try {
      console.log('getUserById: Connected to database, querying user...');
      
      // Get user basic info
      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, role, avatar_url, created_at FROM users WHERE id = $1',
        [userId]
      );

      console.log('getUserById: User query result:', userResult.rows.length, 'rows');

      if (userResult.rows.length === 0) {
        throw createError('User not found', 404);
      }

      const user = userResult.rows[0];
      console.log('getUserById: User found:', { id: user.id, email: user.email, role: user.role });
      
      let profileData = {};

      // Get profile data based on user role
      if (user.role === 'intern') {
        console.log('getUserById: Querying intern profile for user:', userId);
        const profileResult = await client.query(
          'SELECT * FROM intern_profiles WHERE user_id = $1',
          [userId]
        );
        console.log('getUserById: Intern profile query result:', profileResult.rows.length, 'rows');
        
        if (profileResult.rows.length > 0) {
          const profile = profileResult.rows[0];
          console.log('getUserById: Intern profile found:', profile);
          profileData = {
            skills: profile.skills || [],
            interests: profile.interests || [],
            experience: profile.experience || '',
            portfolioUrl: profile.portfolio_url || '',
            linkedinUrl: profile.linkedin_url || '',
            githubUrl: profile.github_url || '',
            resumeUrl: profile.resume_url || '',
          };
        } else {
          console.log('getUserById: No intern profile found, using empty profile data');
          profileData = {
            skills: [],
            interests: [],
            experience: '',
            portfolioUrl: '',
            linkedinUrl: '',
            githubUrl: '',
            resumeUrl: '',
          };
        }
      } else if (user.role === 'company') {
        const profileResult = await client.query(
          'SELECT * FROM company_profiles WHERE user_id = $1',
          [userId]
        );
        if (profileResult.rows.length > 0) {
          const profile = profileResult.rows[0];
          profileData = {
            companyName: profile.company_name,
            industry: profile.industry,
            description: profile.description,
            headquarters: profile.headquarters,
            teamSize: profile.team_size,
            websiteUrl: profile.website_url,
            logoUrl: profile.logo_url,
          };
        }
      }

      const responseData = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
          ...profileData,
        },
      };
      
      console.log('getUserById: Sending response:', responseData);
      res.json(responseData);
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const { id } = req.params;
    const { firstName, lastName, avatar } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.authUser.id !== id && req.authUser.role !== 'admin') {
      throw createError('Not authorized to update this user', 403);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             avatar_url = COALESCE($3, avatar_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, email, first_name, last_name, role, avatar_url, created_at, updated_at`,
        [firstName, lastName, avatar, id]
      );

      if (result.rows.length === 0) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'User updated successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const { id } = req.params;
    const client = await pool.connect();

    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Update user profile (for intern/company profiles)
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not authenticated', 401);
    }

    const client = await pool.connect();
    try {
      const { 
        bio, 
        skills, 
        education, 
        experience, 
        portfolioUrl, 
        linkedinUrl, 
        githubUrl, 
        websiteUrl, 
        interests,
        companyName,
        industry,
        description,
        headquarters,
        teamSize
      } = req.body;

      if (req.authUser.role === 'intern') {
        // Update intern profile
        await client.query(`
          INSERT INTO intern_profiles (
            user_id, bio, skills, education, experience, 
            portfolio_url, linkedin_url, github_url, website_url, interests
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            bio = EXCLUDED.bio,
            skills = EXCLUDED.skills,
            education = EXCLUDED.education,
            experience = EXCLUDED.experience,
            portfolio_url = EXCLUDED.portfolio_url,
            linkedin_url = EXCLUDED.linkedin_url,
            github_url = EXCLUDED.github_url,
            website_url = EXCLUDED.website_url,
            interests = EXCLUDED.interests,
            updated_at = CURRENT_TIMESTAMP
        `, [
          req.authUser.id, bio, skills, education, experience,
          portfolioUrl, linkedinUrl, githubUrl, websiteUrl, interests
        ]);
      } else if (req.authUser.role === 'company') {
        // Update company profile
        await client.query(`
          INSERT INTO company_profiles (
            user_id, company_name, industry, description, 
            headquarters, team_size
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            company_name = EXCLUDED.company_name,
            industry = EXCLUDED.industry,
            description = EXCLUDED.description,
            headquarters = EXCLUDED.headquarters,
            team_size = EXCLUDED.team_size,
            updated_at = CURRENT_TIMESTAMP
        `, [
          req.authUser.id, companyName, industry, description, headquarters, teamSize
        ]);
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

// Upload resume file
export const uploadResumeFile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not authenticated', 401);
    }

    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const client = await pool.connect();
    try {
      const resumeUrl = `/uploads/${req.file.filename}`;
      
      // Update intern profile with resume URL
      await client.query(`
        INSERT INTO intern_profiles (user_id, resume_url)
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          resume_url = EXCLUDED.resume_url,
          updated_at = CURRENT_TIMESTAMP
      `, [req.authUser.id, resumeUrl]);

      res.json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          resumeUrl: resumeUrl,
          filename: req.file.filename
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};
