import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users, Zap } from 'lucide-react';
import axios from 'axios';
import Button from '../components/Button';
import Logo from '../components/Logo';
import doctorHero from '../assets/images/doctor-hero.jpg';

// StatCard Component
const StatCard = ({ title, value, icon: Icon, variant, trend, description }) => {
  const variantStyles = {
    primary: 'bg-red-100 text-red-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    secondary: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${variantStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {trend && (
        <div className="text-sm text-green-600 flex items-center">
          <span className="mr-1">↗</span>
          +{trend.value}% from last month
        </div>
      )}
      {description && (
        <div className="text-sm text-gray-500">{description}</div>
      )}
    </div>
  );
};

// Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 pb-4">{children}</div>
);

const CardContent = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-gray-900">{children}</h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-gray-600 ${className}`}>{children}</p>
);

const HomePage = () => {
  const [stats, setStats] = useState({
    donors: 0,
    requests: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [donorsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/donor'),
        axios.get('http://localhost:5000/api/patient/requests')
      ]);
      
      setStats({
        donors: donorsRes.data.length,
        requests: requestsRes.data.length,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${doctorHero})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Save Lives with <span className="text-red-500">LifeLink</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connect donors with patients in need. Join our life-saving community and make a difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donor">
                <Button size="lg" className="bg-red-500 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  Become a Donor
                </Button>
              </Link>
              <Link to="/patient">
                <Button size="lg" className="bg-red-500 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  Request Donation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Active Donors"
              value={stats.loading ? "..." : stats.donors}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Patient Requests"
              value={stats.loading ? "..." : stats.requests}
              icon={Heart}
              variant="success"
            />
            <StatCard
              title="Total Users"
              value={stats.loading ? "..." : stats.donors + stats.requests}
              icon={Zap}
              variant="warning"
            />
            <StatCard
              title="Platform Status"
              value="Active"
              icon={Shield}
              variant="secondary"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How LifeLink Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform connects donors and patients seamlessly, ensuring quick and efficient life-saving donations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Register as Donor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Sign up, provide your blood type and location. Update your availability status anytime.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Quick Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our AI instantly matches patients with compatible donors based on blood type and location.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Save Lives</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connect directly with patients, coordinate donations, and track your life-saving impact.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of heroes who are already saving lives through LifeLink.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-500 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size="md" />
            </div>
            <p className="text-gray-600 text-center md:text-right">
              © 2024 LifeLink. Saving lives, one donation at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;