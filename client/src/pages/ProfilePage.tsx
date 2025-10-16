import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Linkedin, Github, Globe, Upload, FileText, Plus, X, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ProfileData {
  bio: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  interests: string[];
  resumeUrl?: string;
  // Job preferences for personalized scraping
  major: string;
  industry: string;
  jobSkills: string;
  location: string;
}

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    skills: [],
    education: [],
    experience: [],
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    interests: [],
    resumeUrl: '',
    // Job preferences
    major: '',
    industry: '',
    jobSkills: '',
    location: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileData>();

  useEffect(() => {
    if (user) {
      // Load existing profile data
      loadProfileData();
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      // For now, set a default verification status since we don't have verification in Supabase yet
      setVerificationStatus({
        isVerified: false,
        verificationType: 'email',
        submittedAt: null,
        reviewedAt: null,
        status: 'pending'
      });
    } catch (error) {
      console.error('Failed to load verification status:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      // Get current user from Supabase
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setProfileError('No authenticated user found');
        return;
      }
      
      // For now, use default profile data since we don't have a profiles table yet
      const defaultProfileData: ProfileData = {
        bio: '',
        skills: [],
        education: [],
        experience: [],
        portfolioUrl: '',
        linkedinUrl: '',
        githubUrl: '',
        websiteUrl: '',
        interests: [],
        resumeUrl: '',
        // Job preferences
        major: '',
        industry: '',
        jobSkills: '',
        location: '',
      };
      
      setProfileData(defaultProfileData);
      
      // Set form values
      Object.keys(defaultProfileData).forEach(key => {
        setValue(key as keyof ProfileData, defaultProfileData[key]);
      });
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError('Network error while loading profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    try {
      // For now, just show success message since we don't have a profiles table yet
      toast.success('Profile updated successfully! (Demo mode - data not saved)');
      setIsEditing(false);
      setProfileData(data);
      
      // Show a message about job preferences
      if (data.major || data.industry || data.jobSkills || data.location) {
        toast.success('🎯 Your job preferences have been updated! Check the Jobs page for personalized recommendations.');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    setUploading(true);
    try {
      // For now, just show success message since we don't have file upload in Supabase yet
      toast.success('Resume uploaded successfully! (Demo mode - file not saved)');
      setProfileData(prev => ({ ...prev, resumeUrl: 'demo-resume-url' }));
      setResumeFile(null);
    } catch (error) {
      toast.error('Error uploading resume');
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...profileData.skills, newSkill.trim()];
      setProfileData(prev => ({ ...prev, skills: updatedSkills }));
      setValue('skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
    setProfileData(prev => ({ ...prev, skills: updatedSkills }));
    setValue('skills', updatedSkills);
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      const updatedInterests = [...profileData.interests, newInterest.trim()];
      setProfileData(prev => ({ ...prev, interests: updatedInterests }));
      setValue('interests', updatedInterests);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    const updatedInterests = profileData.interests.filter(interest => interest !== interestToRemove);
    setProfileData(prev => ({ ...prev, interests: updatedInterests }));
    setValue('interests', updatedInterests);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {profileError}</p>
          <button 
            onClick={() => loadProfileData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <p className="text-lg text-gray-900">{user.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <p className="text-lg text-gray-900">{user.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <p className="text-lg text-gray-900 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                <div className="flex items-center space-x-2">
                  {verificationStatus?.isVerified ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Verified</span>
                    </>
                  ) : verificationStatus?.status === 'pending' ? (
                    <>
                      <Shield className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">Pending Review</span>
                    </>
                  ) : verificationStatus?.status === 'rejected' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">Rejected</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500">Not Verified</span>
                    </>
                  )}
                </div>
                {!verificationStatus?.isVerified && (
                  <p className="text-sm text-gray-500 mt-1">
                    <a href="/verification" className="text-indigo-600 hover:text-indigo-500">
                      Complete verification →
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900">{profileData.bio || 'No bio provided'}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  {isEditing ? (
                    <input
                      {...register('linkedinUrl')}
                      type="url"
                      placeholder="LinkedIn URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {profileData.linkedinUrl || 'Not provided'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-gray-800" />
                  {isEditing ? (
                    <input
                      {...register('githubUrl')}
                      type="url"
                      placeholder="GitHub URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {profileData.githubUrl || 'Not provided'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  {isEditing ? (
                    <input
                      {...register('websiteUrl')}
                      type="url"
                      placeholder="Portfolio/Website URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {profileData.websiteUrl || 'Not provided'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
              {profileData.resumeUrl ? (
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <a
                    href={`http://localhost:5001${profileData.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Current Resume
                  </a>
                </div>
              ) : (
                <p className="text-gray-500">No resume uploaded</p>
              )}
              
              {isEditing && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {resumeFile && (
                    <button
                      type="button"
                      onClick={handleResumeUpload}
                      disabled={uploading}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.length > 0 ? (
                    profileData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Job Preferences Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Job Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set your preferences to get personalized internship recommendations
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Major/Field of Study */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Major/Field of Study
                  </label>
                  {isEditing ? (
                    <select
                      {...register('major')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your major</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="design">Design/Art</option>
                      <option value="business">Business/Marketing</option>
                      <option value="finance">Finance/Economics</option>
                      <option value="journalism">Journalism/Communications</option>
                      <option value="data-science">Data Science/Analytics</option>
                      <option value="engineering">Engineering</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {profileData.major ? profileData.major.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Preferred Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Industry
                  </label>
                  {isEditing ? (
                    <select
                      {...register('industry')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select preferred industry</option>
                      <option value="technology">Technology</option>
                      <option value="design">Design/Creative</option>
                      <option value="marketing">Marketing/Advertising</option>
                      <option value="finance">Finance/Banking</option>
                      <option value="media">Media/Entertainment</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {profileData.industry ? profileData.industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Job Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job-Related Skills
                  </label>
                  {isEditing ? (
                    <input
                      {...register('jobSkills')}
                      type="text"
                      placeholder="e.g., JavaScript, Python, Design, Marketing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.jobSkills || 'Not specified'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple skills with commas
                  </p>
                </div>

                {/* Preferred Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Location
                  </label>
                  {isEditing ? (
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="e.g., San Francisco, Remote, New York"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.location || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;