import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Try to get user info from token or localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { ...user, token } });
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    dispatch({ type: 'SET_LOADING', payload: false });
    
    // Listen for auth updates from Google OAuth
    const handleAuthUpdate = (event) => {
      const userData = event.detail;
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    };
    
    window.addEventListener('auth-update', handleAuthUpdate);
    
    return () => {
      window.removeEventListener('auth-update', handleAuthUpdate);
    };
  }, []);

  const login = async (email, password, token = null) => {
    try {
      let res;
      if (token) {
        // Google Sign-In with existing token
        res = { data: { email, token, name: 'Google User' } };
      } else {
        // Regular login
        res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
      }
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };
  
  const loginWithToken = (userData) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);