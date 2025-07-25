require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); // Route file

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: 'https://your-frontend.vercel.app', // frontend's deployed URL
  credentials: true, // if you send cookies/auth
}));

app.use(express.json());

// ROUTES (ONLY ONCE)
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


