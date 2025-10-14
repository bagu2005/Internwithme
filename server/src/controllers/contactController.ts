import { Request, Response, NextFunction } from 'express';
import { createError } from '../middleware/errorHandler';

export const submitContactForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, subject, message, type } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !type) {
      throw createError('All fields are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Invalid email format', 400);
    }

    // Here you would typically:
    // 1. Save the contact form to database
    // 2. Send email notification to support team
    // 3. Send auto-reply to user
    // 4. Log the contact form submission

    // For now, we'll just log it and return success
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      type,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // TODO: Implement actual email sending and database storage
    // await emailService.sendContactFormNotification({ name, email, subject, message, type });
    // await contactService.saveContactForm({ name, email, subject, message, type });

    res.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      data: {
        id: `contact_${Date.now()}`, // Temporary ID
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getContactInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Return contact information
    const contactInfo = {
      email: 'support@internwithme.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Innovation Drive',
        city: 'Tech City',
        state: 'TC',
        zip: '12345',
        country: 'United States'
      },
      businessHours: {
        weekdays: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed'
      },
      socialMedia: {
        twitter: 'https://twitter.com/internwithme',
        linkedin: 'https://linkedin.com/company/internwithme',
        facebook: 'https://facebook.com/internwithme'
      }
    };

    res.json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    next(error);
  }
};
