const express = require('express');
const router = express.Router();
const axios = require('axios');
const { executeTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

// --- SERVER-SIDE CACHING LOGIC ---
let cachedCoins = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 60 seconds (Time To Live)

/**
 * @route   GET /api/trade/coins
 * @desc    Proxy to fetch live market data with 60-second caching
 * @access  Public
 */
router.get('/coins', async (req, res) => {
    const now = Date.now();

    // Check if cache is still valid
    if (cachedCoins && (now - lastFetchTime < CACHE_TTL)) {
        return res.json(cachedCoins);
    }

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

        // Update cache and timestamp
        cachedCoins = data;
        lastFetchTime = now;

        res.json(data);
    } catch (error) {
        // Fallback: If API fails but we have old cache, use it
        if (cachedCoins) {
            console.warn("CoinGecko API Limit reached - serving stale cache");
            return res.json(cachedCoins);
        }

        console.error("CoinGecko Proxy Error:", error.message);
        res.status(429).json({ 
            message: "Market data provider is throttled. Please try again in a minute." 
        });
    }
});

/**
 * @route   POST /api/trade/execute
 * @desc    Process a buy/sell trade
 * @access  Private
 */
router.post('/execute', protect, executeTrade);

module.exports = router;