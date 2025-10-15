import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { subscriptionService } from '../services/subscriptionService';
import { Application } from '../shared/types';

export const createApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const { internshipId, coverLetter, resumeUrl } = req.body;

    if (!internshipId) {
      throw createError('Internship ID is required', 400);
    }

    const client = await pool.connect();
    try {
      // Check if internship exists and is active
      const internshipResult = await client.query(
        'SELECT id, application_deadline FROM internships WHERE id = $1 AND is_active = true',
        [internshipId]
      );

      if (internshipResult.rows.length === 0) {
        throw createError('Internship not found or not active', 404);
      }

      const internship = internshipResult.rows[0];
      
      // Check if application deadline has passed
      if (new Date() > new Date(internship.application_deadline)) {
        throw createError('Application deadline has passed', 400);
      }

      // Check if user already applied
      const existingApplication = await client.query(
        'SELECT id FROM applications WHERE intern_id = $1 AND internship_id = $2',
        [req.authUser.id, internshipId]
      );

      if (existingApplication.rows.length > 0) {
        throw createError('You have already applied to this internship', 409);
      }

      // Check application limit
      const access = await subscriptionService.checkFeatureAccess(req.authUser.id, 'applications');
      if (!access.hasAccess) {
        const subscription = await subscriptionService.getUserSubscription(req.authUser.id);
        const plan = subscription.plan;
        throw createError(
          `You have reached your application limit for the ${plan.name} plan. Upgrade to Premium or Pro for more applications.`,
          403
        );
      }

      // Create application
      const result = await client.query(
        `INSERT INTO applications (intern_id, internship_id, cover_letter, resume_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.authUser.id, internshipId, coverLetter, resumeUrl]
      );

      // Increment application usage
      await subscriptionService.incrementFeatureUsage(req.authUser.id, 'applications');

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Application submitted successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          a.*,
          u.first_name, u.last_name, u.email,
          i.title as internship_title,
          cp.company_name
        FROM applications a
        LEFT JOIN users u ON a.intern_id = u.id
        LEFT JOIN internships i ON a.internship_id = i.id
        LEFT JOIN company_profiles cp ON i.company_id = cp.user_id
        ORDER BY a.applied_at DESC`
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

export const getApplicationById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT 
          a.*,
          u.first_name, u.last_name, u.email,
          i.title as internship_title,
          cp.company_name
        FROM applications a
        LEFT JOIN users u ON a.intern_id = u.id
        LEFT JOIN internships i ON a.internship_id = i.id
        LEFT JOIN company_profiles cp ON i.company_id = cp.user_id
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Application not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      throw createError('Invalid status. Must be one of: pending, reviewed, accepted, rejected', 400);
    }

    const client = await pool.connect();
    try {
      // Check if application exists and belongs to company's internship
      const checkResult = await client.query(
        `SELECT a.id, i.company_id 
         FROM applications a
         LEFT JOIN internships i ON a.internship_id = i.id
         WHERE a.id = $1`,
        [id]
      );

      if (checkResult.rows.length === 0) {
        throw createError('Application not found', 404);
      }

      if (checkResult.rows[0].company_id !== req.authUser.id) {
        throw createError('Not authorized to update this application', 403);
      }

      const result = await client.query(
        `UPDATE applications 
         SET status = $1, notes = $2, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [status, notes, id]
      );

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Application status updated successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getInternApplications = async (
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
      const result = await client.query(
        `SELECT 
          a.*,
          i.title as internship_title,
          i.description as internship_description,
          i.location,
          i.start_date,
          i.end_date,
          cp.company_name,
          cp.logo_url
        FROM applications a
        LEFT JOIN internships i ON a.internship_id = i.id
        LEFT JOIN company_profiles cp ON i.company_id = cp.user_id
        WHERE a.intern_id = $1
        ORDER BY a.applied_at DESC`,
        [req.authUser.id]
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

export const getCompanyApplications = async (
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
      const result = await client.query(
        `SELECT 
          a.*,
          u.first_name, u.last_name, u.email,
          i.title as internship_title,
          ip.university, ip.major, ip.skills, ip.resume_url
        FROM applications a
        LEFT JOIN users u ON a.intern_id = u.id
        LEFT JOIN internships i ON a.internship_id = i.id
        LEFT JOIN intern_profiles ip ON a.intern_id = ip.user_id
        WHERE i.company_id = $1
        ORDER BY a.applied_at DESC`,
        [req.authUser.id]
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
