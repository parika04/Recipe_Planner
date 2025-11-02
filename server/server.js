require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const mealPlanRoutes = require('./routes/mealPlan');

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/mealplan', mealPlanRoutes);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  }
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// MongoDB Connection with better options
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment variables');
    }

    const mongoOptions = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ MongoDB connected successfully');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error('\n🔧 Troubleshooting:');
      console.error('1. Check MONGO_URI in .env file');
      console.error('2. Verify IP is whitelisted in MongoDB Atlas');
      console.error('3. Check if cluster is running');
      console.error('4. Verify credentials are correct');
    }
    
    // Don't exit in development, allow server to start but requests will fail
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  }
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  }
});


