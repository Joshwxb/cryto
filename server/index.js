require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const tradeRoutes = require('./src/routes/tradeRoutes'); 

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(cors({
  origin: '*', // Allows your Vercel frontend to communicate with Render
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 3. Define Routes
app.use('/api/auth', authRoutes);    // Auth: Register/Login
app.use('/api/trade', tradeRoutes);  // Trade: Buy/Sell Logic

// Basic Route for Testing (Useful for Render Health Checks)
app.get('/', (req, res) => {
  res.send('Crypto Trading API is live and running...');
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Trade Routes: /api/trade`);
});