import { useState, useEffect } from 'react';
import { Search, Heart, Phone, MapPin, Clock, Users } from 'lucide-react';
import Button from '../components/Button';
import axios from 'axios';

const BloodMatching = () => {
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = async () => {
    if (!selectedBloodType) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/patient/donors/${selectedBloodType}`);
      setMatchingData(res.data);
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Blood Type Matching</h1>
          <p className="text-gray-600">Find compatible donors for any blood type</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Blood Type Needed
              </label>
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose blood type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!selectedBloodType || loading}
              className="bg-red-500 hover:bg-red-600"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Find Donors'}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {matchingData && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Matching Results for {matchingData.requestedBloodType}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Available Donors</p>
                      <p className="text-2xl font-bold text-red-500">{matchingData.totalDonors}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Compatible Types</p>
                      <p className="text-lg font-bold text-blue-500">
                        {matchingData.compatibleBloodTypes.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="text-lg font-bold text-green-500">~2 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Blood Compatibility Info:</h3>
                <p className="text-blue-700 text-sm">
                  Patients with <strong>{matchingData.requestedBloodType}</strong> blood type can receive donations from: {' '}
                  <strong>{matchingData.compatibleBloodTypes.join(', ')}</strong>
                </p>
              </div>
            </div>

            {/* Donor List */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Available Donors</h3>
              
              {matchingData.donors.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No donors available for this blood type</p>
                  <p className="text-sm text-gray-400 mt-2">Try checking again later or contact emergency services</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchingData.donors.map((donor) => (
                    <div key={donor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {donor.bloodType}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{donor.user?.name || 'Anonymous'}</h4>
                            <p className="text-sm text-gray-600">Age: {donor.age}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          AVAILABLE
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{donor.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{donor.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Registered: {new Date(donor.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-red-500 hover:bg-red-600 text-sm">
                        Contact Donor
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodMatching;