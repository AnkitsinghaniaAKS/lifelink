const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults
import axios from 'axios';
axios.defaults.baseURL = API_BASE_URL;

export default API_BASE_URL;