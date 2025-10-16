import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { jobScrapingService } from '../services/jobScrapingService';

// Get all job postings with filtering
export const getJobs = async (
  req: Request<{}, any, {}, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      type,
      remote,
      company,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['is_active = true', 'application_deadline > NOW()'];
    let queryParams: any[] = [];
    let paramCount = 0;

    // Add filters
    if (location) {
      paramCount++;
      whereConditions.push(`location ILIKE $${paramCount}`);
      queryParams.push(`%${location}%`);
    }

    if (type) {
      paramCount++;
      whereConditions.push(`type = $${paramCount}`);
      queryParams.push(type);
    }

    if (remote !== undefined) {
      paramCount++;
      whereConditions.push(`remote = $${paramCount}`);
      queryParams.push(remote === 'true');
    }

    if (company) {
      paramCount++;
      whereConditions.push(`company ILIKE $${paramCount}`);
      queryParams.push(`%${company}%`);
    }

    if (search) {
      paramCount++;
      whereConditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Build query
    const whereClause = whereConditions.join(' AND ');
    const countQuery = `SELECT COUNT(*) FROM job_postings WHERE ${whereClause}`;
    const dataQuery = `
      SELECT * FROM job_postings 
      WHERE ${whereClause}
      ORDER BY posted_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(Number(limit), offset);

    const client = await pool.connect();
    
    try {
      // Get total count
      const countResult = await client.query(countQuery, queryParams.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      // Get jobs
      const jobsResult = await client.query(dataQuery, queryParams);
      const jobs = jobsResult.rows;

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Get job by ID
export const getJobById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM job_postings WHERE id = $1 AND is_active = true',
        [id]
      );

      if (result.rows.length === 0) {
        throw createError('Job not found', 404);
      }

      const job = result.rows[0];

      // Get similar jobs
      const similarJobs = await client.query(`
        SELECT * FROM job_postings 
        WHERE id != $1 AND is_active = true 
        AND (company = $2 OR location = $3 OR type = $4)
        ORDER BY posted_date DESC
        LIMIT 5
      `, [id, job.company, job.location, job.type]);

      res.json({
        success: true,
        data: {
          job,
          similarJobs: similarJobs.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Get personalized job recommendations for user
export const getJobRecommendations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401);
    }

    const jobs = await jobScrapingService.getJobsForMatching(userId);

    res.json({
      success: true,
      data: {
        jobs,
        message: 'Personalized job recommendations based on your profile'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Trigger job scraping (admin only)
export const triggerJobScraping = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    // Start scraping in background
    jobScrapingService.scrapeAllJobs().catch(error => {
      console.error('Background job scraping failed:', error);
    });

    res.json({
      success: true,
      message: 'Job scraping started in background'
    });
  } catch (error) {
    next(error);
  }
};

// Get job statistics
export const getJobStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = await pool.connect();
    
    try {
      const stats = await client.query(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN type = 'internship' THEN 1 END) as internships,
          COUNT(CASE WHEN remote = true THEN 1 END) as remote_jobs,
          COUNT(DISTINCT company) as unique_companies,
          COUNT(DISTINCT source) as sources
        FROM job_postings 
        WHERE is_active = true AND application_deadline > NOW()
      `);

      const topCompanies = await client.query(`
        SELECT company, COUNT(*) as job_count
        FROM job_postings 
        WHERE is_active = true AND application_deadline > NOW()
        GROUP BY company
        ORDER BY job_count DESC
        LIMIT 10
      `);

      const topLocations = await client.query(`
        SELECT location, COUNT(*) as job_count
        FROM job_postings 
        WHERE is_active = true AND application_deadline > NOW()
        GROUP BY location
        ORDER BY job_count DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          stats: stats.rows[0],
          topCompanies: topCompanies.rows,
          topLocations: topLocations.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};
