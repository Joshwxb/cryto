const express = require('express');
const router = express.Router();
const axios = require('axios');
const { executeTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

// --- SERVER-SIDE CACHING & FAIL-SAFE LOGIC ---
let cachedCoins = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 60 seconds

// Hard-coded fallback data to ensure the UI never stays empty
const fallbackCoins = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 98500, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', price_change_percentage_24h: 1.5 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2850, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', price_change_percentage_24h: -0.8 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 610, image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png', price_change_percentage_24h: 0.2 },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 195, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', price_change_percentage_24h: 5.4 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.65, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', price_change_percentage_24h: 1.1 }
];

/**
 * @route   GET /api/trade/coins
 * @desc    Proxy to fetch live market data with cache and hard-coded fallback
 * @access  Public
 */
router.get('/coins', async (req, res) => {
    const now = Date.now();

    // 1. Serve valid cache if available
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
                },
                timeout: 5000 // Prevent hanging requests
            }
        );

        // 2. Update cache on success
        cachedCoins = data;
        lastFetchTime = now;
        res.json(data);

    } catch (error) {
        console.error("CoinGecko API Error:", error.message);
        
        // 3. FAIL-SAFE: Return stale cache or hard-coded fallback
        const dataToReturn = cachedCoins || fallbackCoins;
        console.log("Serving fallback market data to prevent UI lock.");
        res.json(dataToReturn);
    }
});

/**
 * @route   POST /api/trade/execute
 * @desc    Process a buy/sell trade
 * @access  Private
 */
router.post('/execute', protect, executeTrade);

module.exports = router;