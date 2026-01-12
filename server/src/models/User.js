const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  balance: {
    type: Number,
    default: 10000,
  },
  portfolio: [
    {
      coinId: { type: String, required: true },
      symbol: { type: String, required: true },
      amount: { type: Number, default: 0 },
      averagePrice: { type: Number, default: 0 },
    }
  ],
  tradeHistory: [
    {
      type: { type: String, enum: ['buy', 'sell'] },
      coinId: String,
      amount: Number,
      price: Number,
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- BULLETPROOF FIX ---
// Using async without the 'next' parameter prevents the "next is not a function" error
userSchema.pre('save', async function () {
  // If password is not modified (like during a trade), return to finish hook
  if (!this.isModified('password')) {
    return; 
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // In async hooks, simply finishing the function is the same as calling next()
  } catch (err) {
    throw err; // Throwing an error automatically passes it to the next middleware
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);