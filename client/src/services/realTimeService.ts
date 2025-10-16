import { io, Socket } from 'socket.io-client';

class RealTimeService {
  private socket: Socket | null = null;
  private backendUrl: string;

  constructor() {
    // Use the backend URL from environment or default to localhost
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.backendUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to job scraping backend');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from job scraping backend');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Request jobs with user preferences
  requestJobs(userPreferences: any, callback: (jobs: any[]) => void) {
    const socket = this.connect();
    
    socket.emit('request_jobs', userPreferences);
    
    socket.on('jobs_update', (jobs) => {
      callback(jobs);
    });

    socket.on('scraping_status', (status) => {
      console.log('Scraping status:', status);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Filter jobs in real-time
  filterJobs(filters: any, callback: (jobs: any[]) => void) {
    const socket = this.connect();
    
    socket.emit('filter_jobs', filters);
    
    socket.on('jobs_update', (jobs) => {
      callback(jobs);
    });
  }

  // Listen for new jobs
  onNewJobs(callback: (data: { count: number }) => void) {
    const socket = this.connect();
    
    socket.on('new_jobs_available', (data) => {
      callback(data);
    });
  }

  // Get current connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const realTimeService = new RealTimeService();
