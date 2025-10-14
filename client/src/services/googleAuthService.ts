import api from './api';
import { AuthResponse } from '../../../shared/types';

export const googleAuthService = {
  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      console.log('Sending Google token to backend:', idToken.substring(0, 20) + '...');
      
      const response = await api.post<{ success: boolean; data: AuthResponse }>(
        '/auth/google/callback', 
        { idToken }
      );
      
      console.log('Google login response:', response.data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Google authentication failed');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.response?.data?.error || 'Google authentication failed');
    }
  },

  async checkEmailExists(email: string): Promise<{
    exists: boolean;
    hasGoogleAuth: boolean;
    hasPassword: boolean;
  }> {
    try {
      const response = await api.post<{
        success: boolean;
        exists: boolean;
        hasGoogleAuth: boolean;
        hasPassword: boolean;
      }>('/auth/google/check-email', { email });
      
      if (response.data.success) {
        return {
          exists: response.data.exists,
          hasGoogleAuth: response.data.hasGoogleAuth,
          hasPassword: response.data.hasPassword,
        };
      } else {
        throw new Error('Failed to check email');
      }
    } catch (error: any) {
      console.error('Check email error:', error);
      throw new Error(error.response?.data?.error || 'Failed to check email');
    }
  }
};
