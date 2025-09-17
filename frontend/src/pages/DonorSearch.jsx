import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import Card from '../components/Card';

const DonorSearch = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    if (bloodTypeFilter) {
      setFilteredDonors(donors.filter(donor => donor.bloodType === bloodTypeFilter));
    } else {
      setFilteredDonors(donors);
    }
  }, [bloodTypeFilter, donors]);

  const fetchDonors = async () => {
    try {
      const response = await axios.get('/api/donor');
      setDonors(response.data);
      setFilteredDonors(response.data);
    } catch (err) {
      setError('Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading donors...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Available Donors</h1>
          
          <div className="flex items-center space-x-4">
            <label className="text-white">Filter by Blood Type:</label>
            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.length > 0 ? (
            filteredDonors.map((donor) => (
              <Card key={donor._id}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-white">{donor.user.name}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      donor.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {donor.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  
                  <div className="text-gray-300 space-y-1">
                    <p><strong>Blood Type:</strong> {donor.bloodType}</p>
                    <p><strong>Age:</strong> {donor.age}</p>
                    <p><strong>Location:</strong> {donor.address}</p>
                    <p><strong>Contact:</strong> {donor.phone}</p>
                  </div>

                  {donor.isAvailable && (
                    <Button className="w-full mt-4">
                      Contact Donor
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              No donors found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorSearch;