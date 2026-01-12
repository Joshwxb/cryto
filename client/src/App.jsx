import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard'; // Import your new Dashboard
import { motion, AnimatePresence } from 'framer-motion';

// A professional PrivateRoute component to protect the Dashboard
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="bg-slate-950 min-h-screen font-sans selection:bg-cyan-500/30">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Route: Only accessible if NOT logged in */}
            <Route 
              path="/auth" 
              element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} 
            />

            {/* Protected Route: Accessible only if logged in */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            {/* Default Redirect: Send users to the appropriate page based on auth state */}
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/auth"} />} 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;