import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: Professional Mode Switch State (Demo vs Real)
  // We initialize from localStorage so the preference persists on refresh
  const [isRealMode, setIsRealMode] = useState(() => {
    const savedMode = localStorage.getItem('isRealMode');
    return savedMode === 'true'; // Convert string to boolean
  });

  // 1. Initial Load: Get user from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // 2. Persistence: Sync user state whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // 3. Mode Persistence: Sync the Mode (Demo/Real) to localStorage
  useEffect(() => {
    localStorage.setItem('isRealMode', isRealMode);
  }, [isRealMode]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    // data should contain: { token, name, email, balance, portfolio }
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isRealMode');
    setUser(null);
    setIsRealMode(false);
  };

  return (
    // We added 'isRealMode' and 'setIsRealMode' to the provider
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      loading, 
      isRealMode, 
      setIsRealMode 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};