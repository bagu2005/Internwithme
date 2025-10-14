import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface VerificationDocument {
  type: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface UserVerificationData {
  facePhoto: VerificationDocument;
  idDocument?: VerificationDocument;
  additionalDocuments?: VerificationDocument[];
}

export interface CompanyVerificationData {
  businessLicense: VerificationDocument;
  companyPhoto: VerificationDocument;
  taxDocument?: VerificationDocument;
  additionalDocuments?: VerificationDocument[];
}

// Submit user identity verification
export const submitUserVerification = async (
  userId: string,
  verificationData: UserVerificationData
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Validate required documents
    if (!verificationData.facePhoto) {
      throw createError('Face photo is required for verification', 400);
    }

    const documents = {
      facePhoto: verificationData.facePhoto,
      idDocument: verificationData.idDocument,
      additionalDocuments: verificationData.additionalDocuments || []
    };

    await client.query(
      `UPDATE users 
       SET identity_verification_status = 'pending',
           identity_verification_documents = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(documents), userId]
    );
  } finally {
    client.release();
  }
};

// Submit company verification
export const submitCompanyVerification = async (
  userId: string,
  verificationData: CompanyVerificationData
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Validate required documents
    if (!verificationData.businessLicense || !verificationData.companyPhoto) {
      throw createError('Business license and company photo are required for verification', 400);
    }

    const documents = {
      businessLicense: verificationData.businessLicense,
      companyPhoto: verificationData.companyPhoto,
      taxDocument: verificationData.taxDocument,
      additionalDocuments: verificationData.additionalDocuments || []
    };

    await client.query(
      `UPDATE users 
       SET identity_verification_status = 'pending',
           identity_verification_documents = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(documents), userId]
    );
  } finally {
    client.release();
  }
};

// Get verification status
export const getVerificationStatus = async (userId: string) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT identity_verified, identity_verification_status, 
              identity_verification_documents, identity_verification_notes,
              verified_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404);
    }

    return result.rows[0];
  } finally {
    client.release();
  }
};

// Admin: Get all pending verifications
export const getPendingVerifications = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role,
              u.identity_verification_status, u.identity_verification_documents,
              u.created_at, u.updated_at,
              cp.company_name
       FROM users u
       LEFT JOIN company_profiles cp ON u.id = cp.user_id
       WHERE u.identity_verification_status = 'pending'
       ORDER BY u.updated_at DESC`
    );

    return result.rows;
  } finally {
    client.release();
  }
};

// Admin: Approve verification
export const approveVerification = async (
  userId: string,
  adminNotes?: string
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE users 
       SET identity_verified = true,
           identity_verification_status = 'approved',
           identity_verification_notes = $1,
           verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [adminNotes, userId]
    );
  } finally {
    client.release();
  }
};

// Admin: Reject verification
export const rejectVerification = async (
  userId: string,
  rejectionReason: string
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE users 
       SET identity_verified = false,
           identity_verification_status = 'rejected',
           identity_verification_notes = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [rejectionReason, userId]
    );
  } finally {
    client.release();
  }
};

// Get verification statistics
export const getVerificationStats = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN identity_verified = true THEN 1 END) as verified_users,
         COUNT(CASE WHEN identity_verification_status = 'pending' THEN 1 END) as pending_verifications,
         COUNT(CASE WHEN identity_verification_status = 'rejected' THEN 1 END) as rejected_verifications
       FROM users
       WHERE role IN ('intern', 'company')`
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};
