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
// UNIVERSAL CORS: Allows all origins to prevent the "No Access-Control-Allow-Origin" error
app.use(cors()); 

// Support JSON bodies
app.use(express.json());

// FINAL FIX FOR NODE v22: 
// Using a Regular Expression literal /.*/ to handle preflight OPTIONS
app.options(/.*/, cors()); 

// 3. Define Routes
app.use('/api/auth', authRoutes);    
app.use('/api/trade', tradeRoutes);  

// Basic Route for Testing (Health Check)
app.get('/', (req, res) => {
  res.send('Crypto Trading API is live and running...');
});

// 4. Handle 404 (Route not found)
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base: https://crytotrade-pro-0exo.onrender.com/api`);
});