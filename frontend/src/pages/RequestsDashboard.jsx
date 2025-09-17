import { useState, useEffect } from 'react';
import { Heart, Users, Clock, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const RequestsDashboard = () => {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donorsRes, requestsRes] = await Promise.all([
        axios.get('/api/donor'),
        axios.get('/api/patient/requests')
      ]);
      
      console.log('Donors API Response:', donorsRes.data);
      console.log('Requests API Response:', requestsRes.data);
      
      // Check if the APIs are returning the wrong data and swap if needed
      const donorsData = donorsRes.data;
      const requestsData = requestsRes.data;
      
      // If donors data has urgency/hospital fields, it's actually requests
      if (donorsData.length > 0 && donorsData[0].urgency) {
        setDonors(requestsData);
        setRequests(donorsData);
      } else {
        setDonors(donorsData);
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blood Donation Dashboard</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Patient Requests</h3>
                <p className="text-2xl font-bold text-blue-500">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Donors</h3>
                <p className="text-2xl font-bold text-red-500">{donors.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Requests</h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  No patient requests yet
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request._id} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                          request.urgency === 'high' ? 'bg-red-500' : 
                          request.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {request.bloodType}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Blood Type: {request.bloodType}</h3>
                          <p className="text-sm text-gray-600 capitalize">Urgency: {request.urgency}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.urgency === 'high' ? 'bg-red-100 text-red-800' : 
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{request.hospital}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{request.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Registered Donors */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registered Donors</h2>
            <div className="space-y-4">
              {donors.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  No donors registered yet
                </div>
              ) : (
                donors.map((donor) => (
                  <div key={donor._id} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-start mb-3">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {donor.bloodType}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Blood Type: {donor.bloodType}</h3>
                        <p className="text-sm text-gray-600">Age: {donor.age} years</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        AVAILABLE
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsDashboard;