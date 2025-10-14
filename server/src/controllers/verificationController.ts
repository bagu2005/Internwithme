import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import {
  submitUserVerification,
  submitCompanyVerification,
  getVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationStats,
  UserVerificationData,
  CompanyVerificationData
} from '../services/verificationService';

// Submit user verification documents
export const submitUserVerificationDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not authenticated', 401);
    }

    if (req.authUser.role !== 'intern') {
      throw createError('Only students can submit user verification', 403);
    }

    const { facePhoto, idDocument, additionalDocuments } = req.body;

    if (!facePhoto) {
      throw createError('Face photo is required', 400);
    }

    const verificationData: UserVerificationData = {
      facePhoto,
      idDocument,
      additionalDocuments
    };

    await submitUserVerification(req.authUser.id, verificationData);

    res.json({
      success: true,
      message: 'Verification documents submitted successfully. We will review them within 24-48 hours.'
    });
  } catch (error) {
    next(error);
  }
};

// Submit company verification documents
export const submitCompanyVerificationDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not authenticated', 401);
    }

    if (req.authUser.role !== 'company') {
      throw createError('Only companies can submit company verification', 403);
    }

    const { businessLicense, companyPhoto, taxDocument, additionalDocuments } = req.body;

    if (!businessLicense || !companyPhoto) {
      throw createError('Business license and company photo are required', 400);
    }

    const verificationData: CompanyVerificationData = {
      businessLicense,
      companyPhoto,
      taxDocument,
      additionalDocuments
    };

    await submitCompanyVerification(req.authUser.id, verificationData);

    res.json({
      success: true,
      message: 'Company verification documents submitted successfully. We will review them within 24-48 hours.'
    });
  } catch (error) {
    next(error);
  }
};

// Get user's verification status
export const getUserVerificationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser) {
      throw createError('User not authenticated', 401);
    }

    const status = await getVerificationStatus(req.authUser.id);

    res.json({
      success: true,
      data: {
        isVerified: status.identity_verified,
        status: status.identity_verification_status,
        documents: status.identity_verification_documents,
        notes: status.identity_verification_notes,
        verifiedAt: status.verified_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all pending verifications
export const getAdminPendingVerifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser || req.authUser.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    const pendingVerifications = await getPendingVerifications();

    res.json({
      success: true,
      data: pendingVerifications
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Approve verification
export const adminApproveVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser || req.authUser.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    const { userId } = req.params;
    const { notes } = req.body;

    await approveVerification(userId, notes);

    res.json({
      success: true,
      message: 'Verification approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reject verification
export const adminRejectVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser || req.authUser.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw createError('Rejection reason is required', 400);
    }

    await rejectVerification(userId, reason);

    res.json({
      success: true,
      message: 'Verification rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get verification statistics
export const getAdminVerificationStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.authUser || req.authUser.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    const stats = await getVerificationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
