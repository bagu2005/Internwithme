import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FileText, Send, X } from 'lucide-react';
import { applicationService, ApplicationData } from '../services/applicationService';

interface ApplicationFormProps {
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  coverLetter: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  internshipId,
  internshipTitle,
  companyName,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const coverLetter = watch('coverLetter', '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (coverLetter.trim().length < 50) {
      toast.error('Cover letter must be at least 50 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationData: ApplicationData = {
        internshipId,
        coverLetter: data.coverLetter,
      };

      // If user has a resume file, upload it first
      if (resumeFile) {
        // In a real app, you'd upload the file and get the URL
        // For now, we'll just include it in the application
        applicationData.resumeUrl = resumeFile.name;
      }

      await applicationService.applyToInternship(applicationData);
      toast.success('Application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Application submission failed:', error);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Apply to Internship</h2>
              <p className="text-gray-600 mt-1">
                {internshipTitle} at {companyName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Letter */}
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                {...register('coverLetter', {
                  required: 'Cover letter is required',
                  minLength: {
                    value: 50,
                    message: 'Cover letter must be at least 50 characters long',
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Cover letter must be less than 2000 characters',
                  },
                })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us why you're interested in this internship and what makes you a great fit..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.coverLetter && (
                  <p className="text-sm text-red-600">{errors.coverLetter.message}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {coverLetter.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                Resume (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  {resumeFile ? resumeFile.name : 'Choose Resume'}
                </label>
                {resumeFile && (
                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Accepted formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            {/* Application Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Application Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Highlight relevant skills and experience</li>
                <li>• Show enthusiasm for the company and role</li>
                <li>• Keep it professional and concise</li>
                <li>• Proofread for spelling and grammar</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || coverLetter.length < 50}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
