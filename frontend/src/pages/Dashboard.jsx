import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Users, Plus, Clock } from 'lucide-react';
import Button from '../components/Button';
import axios from 'axios';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [userDonations, setUserDonations] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      if (user?.role === 'donor') {
        // Fetch all patient requests for donors to see
        const requestsRes = await axios.get('/api/patient/requests');
        setUserRequests(requestsRes.data);
      } else if (user?.role === 'patient') {
        // Fetch user's own requests
        const requestsRes = await axios.get('/api/patient/requests');
        // Filter to show only current user's requests (would need user ID matching in real app)
        setUserRequests(requestsRes.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">
            You're registered as a <span className="font-medium capitalize">{user?.role}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {user?.role === 'donor' && (
            <Link to="/donor">
              <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Update Donor Profile</h3>
                    <p className="text-sm text-gray-600">Manage your donation preferences</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {user?.role === 'patient' && (
            <Link to="/patient">
              <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Plus className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Request Blood</h3>
                    <p className="text-sm text-gray-600">Submit a new blood request</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          <Link to="/requests">
            <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View All Data</h3>
                  <p className="text-sm text-gray-600">See all donors and requests</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* User Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blood Requests (for donors) */}
          {user?.role === 'donor' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Blood Requests You Can Help</h2>
              {userRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No blood requests yet</p>
                  <p className="text-sm text-gray-400 mt-2">Patient requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Blood Type: {request.bloodType}</p>
                          <p className="text-sm text-gray-600">Hospital: {request.hospital}</p>
                          <p className="text-sm text-gray-600">Urgency: {request.urgency}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.urgency === 'high' ? 'bg-red-100 text-red-800' : 
                          request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {request.urgency.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userRequests.length > 3 && (
                    <Link to="/requests" className="text-red-500 text-sm hover:underline">
                      View all {userRequests.length} requests →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* My Requests (for patients) */}
          {user?.role === 'patient' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Blood Requests</h2>
              {userRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No requests yet</p>
                  <p className="text-sm text-gray-400 mt-2">Submit a blood request when needed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRequests.map((request, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-medium">Blood Type: {request.bloodType}</p>
                      <p className="text-sm text-gray-600">Status: {request.status}</p>
                      <p className="text-sm text-gray-600">{request.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-2">Your recent actions will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;