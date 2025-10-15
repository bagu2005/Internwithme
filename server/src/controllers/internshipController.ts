import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Internship, InternshipFilters, InternshipFormData, PaginatedResponse } from '../shared/types';

export const getInternships = async (
  req: Request<{}, any, {}, InternshipFilters>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      location,
      category,
      paid,
      remote,
      duration,
      skills,
      companySize,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      // Build WHERE clause
      let whereConditions = ['i.is_active = true'];
      let queryParams: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`(i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      if (location) {
        paramCount++;
        whereConditions.push(`i.location ILIKE $${paramCount}`);
        queryParams.push(`%${location}%`);
      }

      if (category) {
        paramCount++;
        whereConditions.push(`i.category = $${paramCount}`);
        queryParams.push(category);
      }

      if (paid !== undefined) {
        paramCount++;
        whereConditions.push(`i.paid = $${paramCount}`);
        queryParams.push(paid);
      }

      if (remote !== undefined) {
        paramCount++;
        whereConditions.push(`i.remote = $${paramCount}`);
        queryParams.push(remote);
      }

      if (duration?.min) {
        paramCount++;
        whereConditions.push(`i.duration >= $${paramCount}`);
        queryParams.push(duration.min);
      }

      if (duration?.max) {
        paramCount++;
        whereConditions.push(`i.duration <= $${paramCount}`);
        queryParams.push(duration.max);
      }

      if (skills && skills.length > 0) {
        paramCount++;
        whereConditions.push(`i.skills && $${paramCount}`);
        queryParams.push(skills);
      }

      if (companySize && companySize.length > 0) {
        paramCount++;
        whereConditions.push(`cp.size = ANY($${paramCount})`);
        queryParams.push(companySize);
      }

      // Build ORDER BY clause
      let orderBy = 'i.created_at DESC';
      if (sortBy === 'title') {
        orderBy = `i.title ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'startDate') {
        orderBy = `i.start_date ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'compensation') {
        orderBy = `i.compensation_amount ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'createdAt') {
        orderBy = `i.created_at ${sortOrder.toUpperCase()}`;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM internships i
        LEFT JOIN company_profiles cp ON i.company_id = cp.user_id
        WHERE ${whereConditions.join(' AND ')}
      `;
      
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get internships
      const internshipsQuery = `
        SELECT 
          i.*,
          cp.company_name,
          cp.description as company_description,
          cp.website as company_website,
          cp.industry,
          cp.size as company_size,
          cp.location as company_location,
          cp.logo_url,
          cp.linkedin_url as company_linkedin_url,
          cp.verified
        FROM internships i
        LEFT JOIN company_profiles cp ON i.company_id = cp.user_id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ${orderBy}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      queryParams.push(limit, offset);
      const result = await client.query(internshipsQuery, queryParams);

      const internships: Internship[] = result.rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        title: row.title,
        description: row.description,
        requirements: row.requirements || [],
        responsibilities: row.responsibilities || [],
        benefits: row.benefits || [],
        duration: row.duration,
        startDate: row.start_date,
        endDate: row.end_date,
        location: row.location,
        remote: row.remote,
        paid: row.paid,
        compensation: row.paid ? {
          amount: row.compensation_amount,
          currency: row.compensation_currency,
          type: row.compensation_type,
        } : undefined,
        category: row.category,
        skills: row.skills || [],
        applicationDeadline: row.application_deadline,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        company: {
          id: row.company_id,
          email: '', // Not included in this query
          firstName: '',
          lastName: '',
          role: 'company',
          companyName: row.company_name,
          description: row.company_description,
          website: row.company_website,
          industry: row.industry,
          size: row.company_size,
          location: row.company_location,
          logoUrl: row.logo_url,
          linkedinUrl: row.company_linkedin_url,
          verified: row.verified,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }));

      res.json({
        success: true,
        data: internships,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getInternshipById = async (
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
          i.*,
          cp.company_name,
          cp.description as company_description,
          cp.website as company_website,
          cp.industry,
          cp.size as company_size,
          cp.location as company_location,
          cp.logo_url,
          cp.linkedin_url as company_linkedin_url,
          cp.verified
        FROM internships i
        LEFT JOIN company_profiles cp ON i.company_id = cp.user_id
        WHERE i.id = $1 AND i.is_active = true`,
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Internship not found', 404);
      }

      const row = result.rows[0];
      const internship: Internship = {
        id: row.id,
        companyId: row.company_id,
        title: row.title,
        description: row.description,
        requirements: row.requirements || [],
        responsibilities: row.responsibilities || [],
        benefits: row.benefits || [],
        duration: row.duration,
        startDate: row.start_date,
        endDate: row.end_date,
        location: row.location,
        remote: row.remote,
        paid: row.paid,
        compensation: row.paid ? {
          amount: row.compensation_amount,
          currency: row.compensation_currency,
          type: row.compensation_type,
        } : undefined,
        category: row.category,
        skills: row.skills || [],
        applicationDeadline: row.application_deadline,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        company: {
          id: row.company_id,
          email: '',
          firstName: '',
          lastName: '',
          role: 'company',
          companyName: row.company_name,
          description: row.company_description,
          website: row.company_website,
          industry: row.industry,
          size: row.company_size,
          location: row.company_location,
          logoUrl: row.logo_url,
          linkedinUrl: row.company_linkedin_url,
          verified: row.verified,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      res.json({
        success: true,
        data: internship,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const createInternship = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not found', 404);
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      duration,
      startDate,
      endDate,
      location,
      remote,
      paid,
      compensation,
      category,
      skills,
      applicationDeadline,
    } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !startDate || !endDate || !location || !category) {
      throw createError('Missing required fields', 400);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO internships (
          company_id, title, description, requirements, responsibilities, benefits,
          duration, start_date, end_date, location, remote, paid,
          compensation_amount, compensation_currency, compensation_type,
          category, skills, application_deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          req.authUser.id,
          title,
          description,
          requirements || [],
          responsibilities || [],
          benefits || [],
          duration,
          startDate,
          endDate,
          location,
          remote || false,
          paid || false,
          compensation?.amount || null,
          compensation?.currency || 'USD',
          compensation?.type || null,
          category,
          skills || [],
          applicationDeadline,
        ]
      );

      const internship = result.rows[0];

      res.status(201).json({
        success: true,
        data: {
          id: internship.id,
          companyId: internship.company_id,
          title: internship.title,
          description: internship.description,
          requirements: internship.requirements || [],
          responsibilities: internship.responsibilities || [],
          benefits: internship.benefits || [],
          duration: internship.duration,
          startDate: internship.start_date,
          endDate: internship.end_date,
          location: internship.location,
          remote: internship.remote,
          paid: internship.paid,
          compensation: internship.paid ? {
            amount: internship.compensation_amount,
            currency: internship.compensation_currency,
            type: internship.compensation_type,
          } : undefined,
          category: internship.category,
          skills: internship.skills || [],
          applicationDeadline: internship.application_deadline,
          isActive: internship.is_active,
          createdAt: internship.created_at,
          updatedAt: internship.updated_at,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const updateInternship = async (
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

    const client = await pool.connect();
    try {
      // Check if internship exists and belongs to the company
      const checkResult = await client.query(
        'SELECT company_id FROM internships WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        throw createError('Internship not found', 404);
      }

      if (checkResult.rows[0].company_id !== req.authUser.id) {
        throw createError('Not authorized to update this internship', 403);
      }

      // Build dynamic update query
      const updateFields = [];
      const values = [];
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

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await client.query(
        `UPDATE internships SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
        values
      );

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Internship updated successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const deleteInternship = async (
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
      // Check if internship exists and belongs to the company
      const checkResult = await client.query(
        'SELECT company_id FROM internships WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        throw createError('Internship not found', 404);
      }

      if (checkResult.rows[0].company_id !== req.authUser.id) {
        throw createError('Not authorized to delete this internship', 403);
      }

      // Soft delete by setting is_active to false
      await client.query(
        'UPDATE internships SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Internship deleted successfully',
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getCompanyInternships = async (
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
        'SELECT * FROM internships WHERE company_id = $1 ORDER BY created_at DESC',
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
