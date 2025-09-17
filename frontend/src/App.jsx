import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterWithVerification from './pages/RegisterWithVerification';
import Dashboard from './pages/Dashboard';
import DonorRegistration from './pages/DonorRegistration';
import PatientRequest from './pages/PatientRequest';
import DonorSearch from './pages/DonorSearch';
import AdminDashboard from './pages/AdminDashboard';
import RequestsDashboard from './pages/RequestsDashboard';
import BloodMatching from './pages/BloodMatching';
import GoogleCallback from './pages/GoogleCallback';
import RoleSelection from './pages/RoleSelection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterWithVerification />} />
            <Route path="/register-old" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donor" element={<DonorRegistration />} />
            <Route path="/patient" element={<PatientRequest />} />
            <Route path="/donors" element={<DonorSearch />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/requests" element={<RequestsDashboard />} />
            <Route path="/matching" element={<BloodMatching />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/role-selection" element={<RoleSelection />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;