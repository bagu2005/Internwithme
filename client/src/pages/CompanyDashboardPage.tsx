import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, TrendingUp, Calendar, MapPin, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Internship {
  id: string;
  title: string;
  description: string;
  location: string;
  isRemote: boolean;
  isPaid: boolean;
  compensation?: {
    amount: number;
    currency: string;
    type: string;
  };
  duration: number;
  startDate: string;
  applicationDeadline: string;
  requirements: string[];
  benefits: string[];
  createdAt: string;
  applicationCount: number;
  status: 'active' | 'paused' | 'closed';
}

const CompanyDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalApplications: 0,
    activeInternships: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    if (user && user.role === 'company') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real app, this would come from API
      const mockInternships: Internship[] = [
        {
          id: '1',
          title: 'Software Development Intern',
          description: 'Join our engineering team and work on cutting-edge web applications.',
          location: 'San Francisco, CA',
          isRemote: true,
          isPaid: true,
          compensation: { amount: 25, currency: 'USD', type: 'hourly' },
          duration: 12,
          startDate: '2024-06-01',
          applicationDeadline: '2024-05-15',
          requirements: ['JavaScript', 'React', 'Node.js'],
          benefits: ['Mentorship', 'Flexible hours'],
          createdAt: '2024-01-15',
          applicationCount: 15,
          status: 'active',
        },
        {
          id: '2',
          title: 'Marketing Intern',
          description: 'Support our marketing team with social media campaigns and content creation.',
          location: 'New York, NY',
          isRemote: false,
          isPaid: true,
          compensation: { amount: 20, currency: 'USD', type: 'hourly' },
          duration: 8,
          startDate: '2024-07-01',
          applicationDeadline: '2024-06-01',
          requirements: ['Social Media', 'Content Creation'],
          benefits: ['Networking', 'Portfolio building'],
          createdAt: '2024-01-10',
          applicationCount: 8,
          status: 'active',
        },
      ];

      setInternships(mockInternships);
      setStats({
        totalInternships: mockInternships.length,
        totalApplications: mockInternships.reduce((sum, i) => sum + i.applicationCount, 0),
        activeInternships: mockInternships.filter(i => i.status === 'active').length,
        pendingReviews: 5, // Mock data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInternship = async (internshipId: string) => {
    if (window.confirm('Are you sure you want to delete this internship?')) {
      try {
        // TODO: Implement delete API call
        setInternships(prev => prev.filter(i => i.id !== internshipId));
        toast.success('Internship deleted successfully');
      } catch (error) {
        toast.error('Failed to delete internship');
      }
    }
  };

  const handleToggleStatus = async (internshipId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      // TODO: Implement status update API call
      setInternships(prev => prev.map(i => 
        i.id === internshipId ? { ...i, status: newStatus as 'active' | 'paused' | 'closed' } : i
      ));
      toast.success(`Internship ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error('Failed to update internship status');
    }
  };

  if (!user || user.role !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to company accounts.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your internship opportunities and applications</p>
          </div>
          <Link
            to="/create-internship"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Post New Internship
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Internships</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInternships}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Internships</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeInternships}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Internships List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Internships</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {internships.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships posted yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first internship opportunity.</p>
                <Link
                  to="/create-internship"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post Your First Internship
                </Link>
              </div>
            ) : (
              internships.map((internship) => (
                <div key={internship.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{internship.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          internship.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : internship.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {internship.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{internship.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {internship.location}
                          {internship.isRemote && (
                            <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Remote
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {internship.duration} weeks
                        </div>
                        {internship.isPaid && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${internship.compensation?.amount}/{internship.compensation?.type}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {internship.applicationCount} applications
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(internship.id, internship.status)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          internship.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {internship.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      
                      <Link
                        to={`/internships/${internship.id}/applications`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Applications"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <Link
                        to={`/internships/${internship.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Internship"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteInternship(internship.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Internship"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;