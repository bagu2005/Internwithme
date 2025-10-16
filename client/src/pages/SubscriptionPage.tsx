import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Check, Crown, Star, Zap, CreditCard, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Demo subscription plans
      const demoPlans = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          features: ['Browse jobs', 'Basic filtering', 'Apply to jobs'],
          limits: { applications: 5, searches: 10 }
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          features: ['Unlimited applications', 'Advanced filtering', 'Priority support', 'Resume builder'],
          limits: { applications: -1, searches: -1 }
        }
      ];
      
      setPlans(demoPlans);
      setCurrentSubscription({ 
        plan: { id: 'free', name: 'Free', price: 0 },
        status: 'active',
        current_period_end: null
      });
      setUsage({ applications: 2, searches: 5 });
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      if (planId === 'free') {
        toast.error('You are already on the free plan');
        return;
      }

      // Demo upgrade - just show success message
      const selectedPlan = plans.find(p => p.id === planId);
      toast.success('Subscription upgrade initiated! (Demo mode - no payment processed)');
      setCurrentSubscription({ 
        plan: selectedPlan || { id: planId, name: 'Premium', price: 9.99 },
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      toast.error('Error upgrading subscription. Please try again.');
    }
  };

  const handleManageSubscription = async () => {
    try {
      // Demo subscription management
      toast.success('Subscription management opened! (Demo mode)');
    } catch (error: any) {
      console.error('Error opening portal:', error);
      toast.error('Error opening subscription management. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock premium features to boost your internship search
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
              {currentSubscription.plan.id !== 'free' && currentSubscription.status === 'active' && (
                <button
                  onClick={handleManageSubscription}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentSubscription.plan.name} Plan
                </h3>
                <p className="text-gray-600">
                  ${currentSubscription.plan.price}/month
                </p>
                {currentSubscription.current_period_end && (
                  <p className="text-sm text-gray-500">
                    Next billing: {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {currentSubscription.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Feature Usage */}
        {Object.keys(usage).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(usage).map(([feature, data]) => (
                <div key={feature} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {feature.replace('_', ' ')}
                  </h3>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Used: {data.used}</span>
                      <span>Limit: {data.limit === -1 ? 'Unlimited' : data.limit}</span>
                    </div>
                    {data.limit !== -1 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(data.used / data.limit) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {data.remaining} remaining
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md p-8 relative ${
                plan.id === 'premium' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.id === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {plan.id === 'free' && <Star className="h-8 w-8 text-gray-400" />}
                  {plan.id === 'premium' && <Crown className="h-8 w-8 text-blue-500" />}
                  {plan.id === 'pro' && <Zap className="h-8 w-8 text-purple-500" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={currentSubscription?.plan.id === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  currentSubscription?.plan.id === plan.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.id === 'premium'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : plan.id === 'pro'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {currentSubscription?.plan.id === plan.id ? (
                  'Current Plan'
                ) : plan.price === 0 ? (
                  'Current Plan'
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {plan.price > 0 ? 'Subscribe Now' : 'Upgrade Now'}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* AI Features Preview */}
        <div className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Features</h2>
            <p className="text-xl mb-8">
              Boost your internship search with our advanced AI tools
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Cover Letters</h3>
                <p className="text-sm opacity-90">
                  Generate personalized cover letters using your resume and job descriptions
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Resume Optimization</h3>
                <p className="text-sm opacity-90">
                  Get AI-powered suggestions to improve your resume
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Job Matching</h3>
                <p className="text-sm opacity-90">
                  Find the perfect internships with our smart matching algorithm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
