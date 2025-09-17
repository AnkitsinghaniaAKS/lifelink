import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Logo from '../components/Logo';
import axios from 'axios';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from location state (passed from OAuth)
  const userData = location.state?.userData;
  
  if (!userData) {
    // If no user data, redirect to register
    navigate('/register');
    return null;
  }

  const handleRoleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Update user role in backend
      const res = await axios.post('/api/auth/update-role', {
        userId: userData._id,
        role: selectedRole
      }, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      // Update localStorage with new role
      const updatedUser = { ...userData, role: selectedRole };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', userData.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Role update error:', error);
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {userData.name}!
          </h2>
          <p className="text-gray-600">
            Your Google account has been verified. Please choose your role to complete registration.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-900 mb-6 text-center">
            Choose your role:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${
              selectedRole === 'donor' 
                ? 'border-red-500 bg-red-50 shadow-md' 
                : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
            }`}>
              <input
                type="radio"
                name="role"
                value="donor"
                checked={selectedRole === 'donor'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="sr-only"
              />
              <div className="text-4xl mb-3">🩸</div>
              <div className="font-bold text-gray-900 mb-2">Blood Donor</div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Help save lives by donating blood
              </div>
              {selectedRole === 'donor' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}
            </label>
            
            <label className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${
              selectedRole === 'patient' 
                ? 'border-red-500 bg-red-50 shadow-md' 
                : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
            }`}>
              <input
                type="radio"
                name="role"
                value="patient"
                checked={selectedRole === 'patient'}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="sr-only"
              />
              <div className="text-4xl mb-3">🏥</div>
              <div className="font-bold text-gray-900 mb-2">Patient</div>
              <div className="text-sm text-gray-600 leading-relaxed">
                Request blood donations for treatment
              </div>
              {selectedRole === 'patient' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <Button 
          onClick={handleRoleSubmit}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
        >
          {loading ? 'Setting up your account...' : 'Complete Registration'}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can change your role later in account settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;