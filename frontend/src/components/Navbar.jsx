import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Logo from './Logo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <Logo size="md" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-red-500 font-medium">Home</Link>
            <Link to="/donor" className="relative text-gray-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-200">
              Donor Portal
            </Link>
            <Link to="/patient" className="relative text-gray-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-200">
              Patient Portal
            </Link>
            <Link to="/matching" className="relative text-gray-600 hover:text-red-500 font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-200">
              Find Donors
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 font-medium">Admin</Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;