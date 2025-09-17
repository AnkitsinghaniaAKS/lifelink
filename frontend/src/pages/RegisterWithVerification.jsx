import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Logo from '../components/Logo';
import axios from 'axios';
import emailjs from '@emailjs/browser';

// Import centralized API configuration
import '../config/api.js';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_emgzhzz',
  templateId: 'template_5mjn6h9',
  publicKey: 'mAtmlTnwSGCDdlhtbF0IY'
};

const RegisterWithVerification = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    name: '',
    password: '',
    role: 'donor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const GOOGLE_CLIENT_ID = '186166963636-ocnkfu3ou1nu6n8k8m3jioqge2ednegt.apps.googleusercontent.com';
  
  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }, []);
  
  const generateCodeChallenge = async () => {
    const codeVerifier = generateRandomString(128);
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return { codeVerifier, codeChallenge };
  };
  
  const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state && !isProcessing) {
      handleOAuthCallback(code, state);
    }
  }, [isProcessing]);
  
  const handleOAuthCallback = async (code, state) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      setLoading(true);
      setError('');
      
      const storedState = sessionStorage.getItem('oauth_state');
      const codeVerifier = sessionStorage.getItem('code_verifier');
      
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }
      
      const res = await axios.post('/api/auth/google-oauth', {
        code,
        codeVerifier,
        redirectUri: `${window.location.origin}${window.location.pathname}`
      });
      
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('code_verifier');
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (res.data.authProvider === 'google' && res.data.isNewUser) {
        navigate('/role-selection', { 
          state: { userData: res.data },
          replace: true 
        });
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        window.location.replace('/dashboard');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setError('Google Sign-In failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };
  
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading || isProcessing) return;
    
    try {
      setLoading(true);
      setError('');
      
      const { codeVerifier, codeChallenge } = await generateCodeChallenge();
      const state = generateRandomString(32);
      
      sessionStorage.setItem('code_verifier', codeVerifier);
      sessionStorage.setItem('oauth_state', state);
      
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${window.location.origin}${window.location.pathname}`,
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent'
      });
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      setError('Failed to initiate Google Sign-In. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmailViaEmailJS = async (email, verificationCode) => {
    try {
      const templateParams = {
        user_email: email,
        user_name: email.split('@')[0],
        verification_code: verificationCode,
        to_email: email
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      console.log('✅ Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ EmailJS failed:', error);
      return false;
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      // Get verification code from backend
      const res = await axios.post('/api/email/verify-email', {
        email: formData.email.toLowerCase().trim()
      });
      
      if (res.data.success && res.data.verificationCode) {
        // Send email using EmailJS
        const emailSent = await sendEmailViaEmailJS(
          formData.email.toLowerCase().trim(),
          res.data.verificationCode
        );
        
        if (emailSent) {
          setStep(2);
          setError('');
        } else {
          setError('Failed to send email. Please try again or use Google Sign-In.');
        }
      } else {
        setError(res.data.message || 'Failed to generate verification code');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid email address');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post('/api/email/verify-token', {
        email: formData.email.toLowerCase().trim(),
        token: formData.verificationCode
      });
      
      if (res.data.verified) {
        setStep(3);
        setError('');
      } else {
        setError(res.data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md" hover={false}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 && 'Verify Your Email'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Complete Registration'}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 1 && 'We need to verify your email address first'}
            {step === 2 && `Code sent to ${formData.email}`}
            {step === 3 && 'Almost done! Fill in your details'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="mb-6">
              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || isProcessing}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Redirecting to Google...' : 'Sign up with Google'}
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                  placeholder="Enter your email"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center text-lg tracking-widest disabled:opacity-50"
                placeholder="Enter 6-digit code"
                maxLength="6"
              />
              <p className="text-xs text-gray-500 mt-1">
                Check your email for the 6-digit verification code
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Back to Email
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.role === 'donor' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="donor"
                    checked={formData.role === 'donor'}
                    onChange={handleChange}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-xl mb-1">🩸</div>
                    <div className="font-medium">Donor</div>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.role === 'patient' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-xl mb-1">🏥</div>
                    <div className="font-medium">Patient</div>
                  </div>
                </label>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterWithVerification;