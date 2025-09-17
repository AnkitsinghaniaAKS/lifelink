const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

// CORS Configuration - MUST be first
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://lifelink-tan.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'https://lifelink-tan.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-HTTP-Method-Override');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LifeLink API Server', 
    status: 'Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL,
    corsEnabled: true,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      donor: '/api/donor',
      patient: '/api/patient',
      email: '/api/email'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes with individual error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
  // Fallback auth route
  app.use('/api/auth', (req, res) => {
    res.status(503).json({ message: 'Auth service temporarily unavailable' });
  });
}

try {
  app.use('/api/donor', require('./routes/donor'));
  console.log('✅ Donor routes loaded');
} catch (error) {
  console.error('❌ Error loading donor routes:', error.message);
}

try {
  app.use('/api/patient', require('./routes/patient'));
  console.log('✅ Patient routes loaded');
} catch (error) {
  console.error('❌ Error loading patient routes:', error.message);
}

try {
  app.use('/api/email', require('./routes/email'));
  console.log('✅ Email routes loaded');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 Please check MongoDB Atlas Network Access settings');
    console.error('💡 Add 0.0.0.0/0 to IP whitelist or add Render IP ranges');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: https://lifelink-tan.vercel.app`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});