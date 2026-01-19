import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api'; 
import { Mail, Lock, User, TrendingUp } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false); // NEW: Added loading state
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // START PROCESSING
    
    try {
      if (isLogin) {
        // Log in an existing user
        await login(formData.email, formData.password);
      } else {
        // Register a new user
        await api.post('/auth/register', formData);
        // Automatically log in after successful registration
        await login(formData.email, formData.password);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert("Auth Failed: " + (err.response?.data?.message || "Check your server connection"));
    } finally {
      setIsLoading(false); // STOP PROCESSING (even if it fails)
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -top-20 -left-20" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -bottom-20 -right-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ rotate: -20 }}
            animate={{ rotate: 0 }}
            className="p-3 bg-cyan-500/20 rounded-2xl mb-4 border border-cyan-500/30"
          >
            <TrendingUp className="text-cyan-400 w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight">CryptoTrade Pro</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            {isLogin ? "Welcome back, trader." : "Start your crypto journey today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
              <input 
                required
                type="text" placeholder="Full Name"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div className="relative group">
            <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
            <input 
              required
              type="email" placeholder="Email Address"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
            <input 
              required
              type="password" placeholder="Password"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading} // NEW: Disable button while loading
            className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold py-3.5 rounded-xl mt-6 shadow-xl transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'}`}
          >
            {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              disabled={isLoading}
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 ml-2 hover:text-cyan-300 font-semibold transition-colors"
            >
              {isLogin ? "Register now" : "Login here"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;