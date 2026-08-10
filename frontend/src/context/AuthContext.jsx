import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Validate token on mount by calling /api/auth/me
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        // Verify the token is still valid with the backend
        const res = await authAPI.getMe();
        // Use fresh user data from backend
        const freshUser = res.data;
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
      } catch {
        // Token is invalid or expired — clear stale credentials
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  // Listen for auth:logout events from the API interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [navigate]);

  const handleAuthResponse = useCallback((data) => {
    try {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('Local storage quota exceeded. Clearing storage and retrying.');
        localStorage.clear();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw e;
      }
    }
    setUser(data.user);
  }, []);

  const signup = useCallback(async (fullName, email, password) => {
    const res = await authAPI.signup({ full_name: fullName, email, password });
    handleAuthResponse(res.data);
    return res.data;
  }, [handleAuthResponse]);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    handleAuthResponse(res.data);
    return res.data;
  }, [handleAuthResponse]);

  const googleLogin = useCallback(async (credential) => {
    const res = await authAPI.googleAuth(credential);
    handleAuthResponse(res.data);
    return res.data;
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signup,
    login,
    googleLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
