import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Review } from '../shared/types';

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const { companyId, internshipId, rating, title, content, pros, cons, wouldRecommend } = req.body;

    if (!companyId || !rating || !title || !content) {
      throw createError('Missing required fields', 400);
    }

    if (rating < 1 || rating > 5) {
      throw createError('Rating must be between 1 and 5', 400);
    }

    const client = await pool.connect();
    try {
      // Check if company exists
      const companyResult = await client.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [companyId, 'company']
      );

      if (companyResult.rows.length === 0) {
        throw createError('Company not found', 404);
      }

      // Check if user already reviewed this company
      const existingReview = await client.query(
        'SELECT id FROM reviews WHERE intern_id = $1 AND company_id = $2',
        [req.authUser.id, companyId]
      );

      if (existingReview.rows.length > 0) {
        throw createError('You have already reviewed this company', 409);
      }

      // If internshipId is provided, verify it exists and belongs to the company
      if (internshipId) {
        const internshipResult = await client.query(
          'SELECT id FROM internships WHERE id = $1 AND company_id = $2',
          [internshipId, companyId]
        );

        if (internshipResult.rows.length === 0) {
          throw createError('Internship not found or does not belong to this company', 404);
        }
      }

      const result = await client.query(
        `INSERT INTO reviews (
          intern_id, company_id, internship_id, rating, title, content, 
          pros, cons, would_recommend
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [req.authUser.id, companyId, internshipId, rating, title, content, pros, cons, wouldRecommend]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Review created successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          r.*,
          u.first_name, u.last_name,
          cp.company_name,
          i.title as internship_title
        FROM reviews r
        LEFT JOIN users u ON r.intern_id = u.id
        LEFT JOIN company_profiles cp ON r.company_id = cp.user_id
        LEFT JOIN internships i ON r.internship_id = i.id
        ORDER BY r.created_at DESC`
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

export const getReviewById = async (
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
          r.*,
          u.first_name, u.last_name,
          cp.company_name,
          i.title as internship_title
        FROM reviews r
        LEFT JOIN users u ON r.intern_id = u.id
        LEFT JOIN company_profiles cp ON r.company_id = cp.user_id
        LEFT JOIN internships i ON r.internship_id = i.id
        WHERE r.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Review not found', 404);
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

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const { id } = req.params;
    const updateData = req.body;

    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw createError('Rating must be between 1 and 5', 400);
    }

    const client = await pool.connect();
    try {
      // Check if review exists and belongs to the user
      const checkResult = await client.query(
        'SELECT intern_id FROM reviews WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        throw createError('Review not found', 404);
      }

      if (checkResult.rows[0].intern_id !== req.authUser.id) {
        throw createError('Not authorized to update this review', 403);
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw createError('No fields to update', 400);
      }

      values.push(id);

      const result = await client.query(
        `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
        values
      );

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Review updated successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
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
      // Check if review exists and belongs to the user
      const checkResult = await client.query(
        'SELECT intern_id FROM reviews WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        throw createError('Review not found', 404);
      }

      if (checkResult.rows[0].intern_id !== req.authUser.id) {
        throw createError('Not authorized to delete this review', 403);
      }

      await client.query('DELETE FROM reviews WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getCompanyReviews = async (
  req: Request<{ companyId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT 
          r.*,
          u.first_name, u.last_name,
          i.title as internship_title
        FROM reviews r
        LEFT JOIN users u ON r.intern_id = u.id
        LEFT JOIN internships i ON r.internship_id = i.id
        WHERE r.company_id = $1
        ORDER BY r.created_at DESC`,
        [companyId]
      );

      // Calculate average rating
      const avgResult = await client.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE company_id = $1',
        [companyId]
      );

      const stats = avgResult.rows[0];

      res.json({
        success: true,
        data: {
          reviews: result.rows,
          stats: {
            averageRating: parseFloat(stats.avg_rating) || 0,
            totalReviews: parseInt(stats.total_reviews) || 0,
          },
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};
