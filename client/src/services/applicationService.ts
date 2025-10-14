import api from './api';

export interface ApplicationData {
  internshipId: string;
  coverLetter: string;
  resumeUrl?: string;
}

export interface Application {
  id: string;
  internId: string;
  internshipId: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  coverLetter: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
  internship?: {
    id: string;
    title: string;
    company: {
      id: string;
      companyName: string;
    };
  };
  intern?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const applicationService = {
  // Apply to an internship
  async applyToInternship(applicationData: ApplicationData): Promise<{ message: string; data: Application }> {
    const response = await api.post<{ success: boolean; message: string; data: Application }>(
      '/applications',
      applicationData
    );
    return response.data;
  },

  // Get user's applications
  async getUserApplications(): Promise<Application[]> {
    const response = await api.get<{ success: boolean; data: Application[] }>('/applications/my-applications');
    return response.data.data;
  },

  // Get applications for a company (company dashboard)
  async getCompanyApplications(): Promise<Application[]> {
    const response = await api.get<{ success: boolean; data: Application[] }>('/applications/company');
    return response.data.data;
  },

  // Update application status (for companies)
  async updateApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
  ): Promise<{ message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      `/applications/${applicationId}/status`,
      { status }
    );
    return response.data;
  },

  // Get application details
  async getApplicationDetails(applicationId: string): Promise<Application> {
    const response = await api.get<{ success: boolean; data: Application }>(`/applications/${applicationId}`);
    return response.data.data;
  },

  // Withdraw application
  async withdrawApplication(applicationId: string): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/applications/${applicationId}`);
    return response.data;
  },
};
