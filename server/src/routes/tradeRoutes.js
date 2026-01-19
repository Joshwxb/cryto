const express = require('express');
const router = express.Router();
const axios = require('axios'); // Added axios for the proxy request
const { executeTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/trade/coins
 * @desc    Proxy to fetch live market data from CoinGecko
 * @access  Public (or Protect if you want only users to see prices)
 */
router.get('/coins', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,binancecoin,solana,cardano',
          order: 'market_cap_desc',
          per_page: 5,
          page: 1,
          sparkline: false
        }
      }
    );
    res.json(data);
  } catch (error) {
    console.error("CoinGecko Proxy Error:", error.message);
    res.status(500).json({ message: "Failed to fetch market data from provider" });
  }
});

/**
 * @route   POST /api/trade/execute
 * @desc    Process a buy/sell trade
 * @access  Private
 */
router.post('/execute', protect, executeTrade);

module.exports = router;