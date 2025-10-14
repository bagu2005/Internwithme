import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  text?: 'signin_with' | 'signup_with';
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleSignInButton({ 
  onSuccess, 
  text = 'signin_with', 
  className = '' 
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not defined. Google Sign-In will not work.');
      return;
    }

    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        toast.error('Failed to load Google Sign-In. Please try again.');
      };
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google || !buttonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          buttonRef.current,
          { 
            theme: 'outline', 
            size: 'large', 
            text: text, 
            width: '100%',
            shape: 'rectangular'
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        toast.error('Failed to initialize Google Sign-In.');
      }
    };

    const handleCredentialResponse = (response: any) => {
      console.log('Google credential response received:', response);
      if (response.credential) {
        console.log('Google credential token:', response.credential.substring(0, 20) + '...');
        onSuccess(response.credential);
      } else {
        console.error('No credential in Google response:', response);
        toast.error('Google Sign-In failed. Please try again.');
      }
    };

    loadGoogleScript();

    // Cleanup function
    return () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.warn('Error cleaning up Google Sign-In:', error);
        }
      }
    };
  }, [googleClientId, onSuccess, text]);

  if (!googleClientId) {
    return (
      <div className={`${className} flex items-center justify-center p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500`}>
        Google Sign-In not configured
      </div>
    );
  }

  return <div ref={buttonRef} className={className}></div>;
}
