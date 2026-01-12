const User = require('../models/User');

exports.executeTrade = async (req, res) => {
  try {
    const { coinId, symbol, amount, price, type } = req.body;
    
    // 1. Convert to numbers and round to prevent floating point errors
    const tradeAmount = parseFloat(amount);
    const tradePrice = parseFloat(price);
    const totalValue = tradeAmount * tradePrice;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'buy') {
      // Check if user has enough money
      if (user.balance < totalValue) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Deduct from balance
      user.balance -= totalValue;

      // Update Portfolio
      const coinIndex = user.portfolio.findIndex((item) => item.coinId === coinId);
      if (coinIndex > -1) {
        // User already owns this, increase amount
        user.portfolio[coinIndex].amount += tradeAmount;
      } else {
        // First time buying this coin
        user.portfolio.push({ 
          coinId, 
          symbol, 
          amount: tradeAmount, 
          averagePrice: tradePrice 
        });
      }
    } 
    
    else if (type === 'sell') {
      const coinIndex = user.portfolio.findIndex((item) => item.coinId === coinId);
      
      // Check if user owns enough of the coin to sell
      if (coinIndex === -1 || user.portfolio[coinIndex].amount < tradeAmount) {
        return res.status(400).json({ message: 'Not enough coins to sell' });
      }

      // Add to balance
      user.balance += totalValue;

      // Deduct from portfolio
      user.portfolio[coinIndex].amount -= tradeAmount;

      // CRITICAL: Remove the coin completely if the amount hits 0
      // This ensures it disappears from the "Your Assets" box
      if (user.portfolio[coinIndex].amount <= 0.00000001) {
        user.portfolio.splice(coinIndex, 1);
      }
    }

    // Round balance to 2 decimal places for clean display
    user.balance = Math.round(user.balance * 100) / 100;

    // Record in history
    user.tradeHistory.push({ 
      type, 
      coinId, 
      amount: tradeAmount, 
      price: tradePrice,
      date: new Date() 
    });

    // Save to Database
    await user.save();

    // Send back updated data so the Dashboard UI refreshes instantly
    res.status(200).json({
      success: true,
      message: `Successfully ${type}ed ${tradeAmount} ${symbol.toUpperCase()}`,
      balance: user.balance,
      portfolio: user.portfolio
    });

  } catch (error) {
    console.error("Trade Controller Error:", error);
    res.status(500).json({ message: 'Server Error during trade' });
  }
};