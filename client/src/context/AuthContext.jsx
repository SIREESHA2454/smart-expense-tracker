import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

// 1. Create the context object
const AuthContext = createContext();

// 2. Create the Provider component — wraps your entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking localStorage

  // On app load, check if user was previously logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false); // done checking
  }, []);

  // Called after successful login OR signup
  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Value object — everything components can access
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user, // converts user object to true/false
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until we've checked localStorage */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook — makes consuming the context cleaner
// Instead of: const { user } = useContext(AuthContext)
// You write:   const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export default AuthContext;