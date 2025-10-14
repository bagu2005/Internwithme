import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { 
  Building, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Shield,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface VerificationStatus {
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  documents?: any;
  notes?: string;
  verifiedAt?: string;
}

export default function CompanyVerificationPage() {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [companyPhoto, setCompanyPhoto] = useState<File | null>(null);
  const [taxDocument, setTaxDocument] = useState<File | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/verification/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File, type: 'license' | 'photo' | 'tax' | 'additional') => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid file (JPEG, PNG, PDF)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    switch (type) {
      case 'license':
        setBusinessLicense(file);
        break;
      case 'photo':
        setCompanyPhoto(file);
        break;
      case 'tax':
        setTaxDocument(file);
        break;
      case 'additional':
        setAdditionalDocs(prev => [...prev, file]);
        break;
    }
  };

  const removeFile = (type: 'license' | 'photo' | 'tax' | 'additional', index?: number) => {
    switch (type) {
      case 'license':
        setBusinessLicense(null);
        break;
      case 'photo':
        setCompanyPhoto(null);
        break;
      case 'tax':
        setTaxDocument(null);
        break;
      case 'additional':
        if (index !== undefined) {
          setAdditionalDocs(prev => prev.filter((_, i) => i !== index));
        }
        break;
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5001/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    if (!businessLicense || !companyPhoto) {
      toast.error('Business license and company photo are required');
      return;
    }

    setSubmitting(true);
    try {
      // Upload files
      const businessLicenseUrl = await uploadFile(businessLicense);
      const companyPhotoUrl = await uploadFile(companyPhoto);
      const taxDocumentUrl = taxDocument ? await uploadFile(taxDocument) : undefined;
      const additionalDocsUrls = await Promise.all(
        additionalDocs.map(file => uploadFile(file))
      );

      const verificationData = {
        businessLicense: {
          type: 'business_license',
          url: businessLicenseUrl,
          filename: businessLicense.name,
          uploadedAt: new Date().toISOString()
        },
        companyPhoto: {
          type: 'company_photo',
          url: companyPhotoUrl,
          filename: companyPhoto.name,
          uploadedAt: new Date().toISOString()
        },
        taxDocument: taxDocument ? {
          type: 'tax_document',
          url: taxDocumentUrl,
          filename: taxDocument.name,
          uploadedAt: new Date().toISOString()
        } : undefined,
        additionalDocuments: additionalDocsUrls.map((url, index) => ({
          type: 'additional_document',
          url,
          filename: additionalDocs[index].name,
          uploadedAt: new Date().toISOString()
        }))
      };

      const response = await fetch('http://localhost:5001/api/verification/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(verificationData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchVerificationStatus();
        // Reset form
        setBusinessLicense(null);
        setCompanyPhoto(null);
        setTaxDocument(null);
        setAdditionalDocs([]);
      } else {
        toast.error(data.error || 'Verification submission failed');
      }
    } catch (error) {
      console.error('Verification submission failed:', error);
      toast.error('Failed to submit verification documents');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Your company has been verified!';
      case 'rejected':
        return 'Your verification was rejected. Please review the feedback and resubmit.';
      case 'pending':
        return 'Your verification is under review. We will get back to you within 24-48 hours.';
      default:
        return 'Please submit your company verification documents to get verified.';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Only companies can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Company Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify your company to build trust and access premium features
          </p>
        </div>

        {/* Verification Status */}
        {verificationStatus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              {getStatusIcon(verificationStatus.status)}
              <h2 className="text-xl font-semibold text-gray-900">
                Verification Status
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              {getStatusMessage(verificationStatus.status)}
            </p>
            
            {verificationStatus.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Admin Notes:</h3>
                <p className="text-gray-600">{verificationStatus.notes}</p>
              </div>
            )}

            {verificationStatus.verifiedAt && (
              <p className="text-sm text-gray-500 mt-4">
                Verified on: {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Verification Form */}
        {(!verificationStatus || verificationStatus.status === 'rejected') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Submit Company Verification Documents
              </h2>
              <p className="text-gray-600">
                Please upload clear, high-quality documents to verify your company.
              </p>
            </div>

            <div className="space-y-8">
              {/* Business License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your official business license or registration certificate.
                </p>
                
                {businessLicense ? (
                  <div className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{businessLicense.name}</p>
                      <p className="text-sm text-gray-500">
                        {(businessLicense.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile('license')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload your business license</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'license')}
                      className="hidden"
                      id="business-license"
                    />
                    <label
                      htmlFor="business-license"
                      className="btn-primary cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              {/* Company Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Photo <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a photo of your company office, storefront, or workspace.
                </p>
                
                {companyPhoto ? (
                  <div className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg">
                    <img
                      src={URL.createObjectURL(companyPhoto)}
                      alt="Company photo preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{companyPhoto.name}</p>
                      <p className="text-sm text-gray-500">
                        {(companyPhoto.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile('photo')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload your company photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'photo')}
                      className="hidden"
                      id="company-photo"
                    />
                    <label
                      htmlFor="company-photo"
                      className="btn-primary cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              {/* Tax Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Document (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your tax registration or VAT certificate.
                </p>
                
                {taxDocument ? (
                  <div className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{taxDocument.name}</p>
                      <p className="text-sm text-gray-500">
                        {(taxDocument.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile('tax')}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload your tax document</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'tax')}
                      className="hidden"
                      id="tax-document"
                    />
                    <label
                      htmlFor="tax-document"
                      className="btn-outline cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              {/* Additional Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Documents (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload any additional documents that may help verify your company
                </p>
                
                <div className="space-y-4">
                  {additionalDocs.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile('additional', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload additional documents</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'additional')}
                      className="hidden"
                      id="additional-docs"
                    />
                    <label
                      htmlFor="additional-docs"
                      className="btn-outline cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Document
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={!businessLicense || !companyPhoto || submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Verification Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure all documents are clear and readable</li>
                <li>• Business license should be current and valid</li>
                <li>• Company photo should show your actual business location</li>
                <li>• All documents must be in JPEG, PNG, or PDF format</li>
                <li>• File size should be less than 10MB per document</li>
                <li>• Verification typically takes 24-48 hours</li>
                <li>• Only legitimate businesses will be approved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
