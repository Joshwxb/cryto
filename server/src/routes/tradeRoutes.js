const express = require('express');
const router = express.Router();
const { executeTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

// Protect ensures only logged-in users can trade
router.post('/execute', protect, executeTrade);

module.exports = router;