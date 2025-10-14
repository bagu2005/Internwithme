import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { applicationService, Application } from '../services/applicationService';
import { toast } from 'react-hot-toast';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Pending Review'
  },
  reviewed: {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Under Review'
  },
  interview: {
    icon: AlertCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Interview Scheduled'
  },
  accepted: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Accepted'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Rejected'
  }
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getUserApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationService.withdrawApplication(applicationId);
      toast.success('Application withdrawn successfully');
      fetchApplications();
    } catch (error: any) {
      console.error('Failed to withdraw application:', error);
      toast.error(error.response?.data?.error || 'Failed to withdraw application');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return <Icon className={`w-5 h-5 ${config.color}`} />;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Please log in to view your applications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Applications
          </h1>
          <p className="text-lg text-gray-600">
            Track the status of your internship applications
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Applications', count: applications.length },
                { key: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
                { key: 'reviewed', label: 'Under Review', count: applications.filter(a => a.status === 'reviewed').length },
                { key: 'interview', label: 'Interview', count: applications.filter(a => a.status === 'interview').length },
                { key: 'accepted', label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length },
                { key: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start applying to internships to see your applications here'
                  : `You don't have any ${filter} applications at the moment`
                }
              </p>
              {filter === 'all' && (
                <Link
                  to="/internships"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Internships
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.internship?.title || 'Internship Title'}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-lg text-gray-600 mb-2">
                      {application.internship?.company?.companyName || 'Company Name'}
                    </p>
                    <div className="flex items-center text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                      {application.updatedAt !== application.appliedAt && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Updated {new Date(application.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/internships/${application.internshipId}`}
                      className="btn-outline"
                    >
                      View Internship
                    </Link>
                    {(application.status === 'pending' || application.status === 'reviewed') && (
                      <button
                        onClick={() => handleWithdrawApplication(application.id)}
                        className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {application.coverLetter}
                  </p>
                </div>

                {application.resumeUrl && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resume</h4>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}