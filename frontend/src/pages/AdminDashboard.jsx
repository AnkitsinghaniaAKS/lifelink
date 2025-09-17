import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalPatients: 0,
    availableDonors: 0,
    pendingRequests: 0
  });
  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donorsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/donor'),
        axios.get('http://localhost:5000/api/patient')
      ]);

      const donorsData = donorsRes.data;
      const patientsData = patientsRes.data;

      setDonors(donorsData);
      setPatients(patientsData);
      
      setStats({
        totalDonors: donorsData.length,
        totalPatients: patientsData.length,
        availableDonors: donorsData.filter(d => d.isAvailable).length,
        pendingRequests: patientsData.filter(p => p.status === 'pending').length
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">{stats.totalDonors}</div>
              <div className="text-gray-300">Total Donors</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">{stats.totalPatients}</div>
              <div className="text-gray-300">Total Patients</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">{stats.availableDonors}</div>
              <div className="text-gray-300">Available Donors</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">{stats.pendingRequests}</div>
              <div className="text-gray-300">Pending Requests</div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Donors */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">Recent Donors</h3>
            <div className="space-y-3">
              {donors.slice(0, 5).map((donor) => (
                <div key={donor._id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <div className="text-white font-medium">{donor.user.name}</div>
                    <div className="text-gray-400 text-sm">{donor.bloodType} • {donor.phone}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    donor.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {donor.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Patient Requests */}
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">Recent Patient Requests</h3>
            <div className="space-y-3">
              {patients.slice(0, 5).map((patient) => (
                <div key={patient._id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <div className="text-white font-medium">{patient.user.name}</div>
                    <div className="text-gray-400 text-sm">{patient.bloodType} • {patient.hospital}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      patient.urgency === 'high' ? 'bg-red-500' :
                      patient.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}>
                      {patient.urgency}
                    </span>
                    <div className="text-gray-400 text-xs mt-1">{patient.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;