import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const INITIAL_USER_CREDENTIALS = {
  username: 'harini.muhilan',
  email: 'harini.muhilan@dualpath.com',
  password: 'DualPath@Secure2026',
  name: 'Harini Muhilan',
  role: 'Executive Administrator'
};

const STORAGE_KEY = 'dualpath_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Authenticate user with credentials
  const login = async (identifier, password) => {
    setLoading(true);
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      // 1. Try Backend Authentication endpoint
      const response = await api.post('/api/auth/login', {
        username: cleanId,
        password: cleanPass
      });

      if (response.data && response.data.success) {
        const sessionUser = {
          username: response.data.username || INITIAL_USER_CREDENTIALS.username,
          email: response.data.email || INITIAL_USER_CREDENTIALS.email,
          name: response.data.name || INITIAL_USER_CREDENTIALS.name,
          role: response.data.role || INITIAL_USER_CREDENTIALS.role,
          token: response.data.token || 'dp_sec_auth',
          loginTime: new Date().toISOString()
        };
        setUser(sessionUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }
    } catch (err) {
      // 2. Client-side verified fallback if backend API is offline or returns error
      const isMatch = (
        cleanId === INITIAL_USER_CREDENTIALS.username.toLowerCase() ||
        cleanId === INITIAL_USER_CREDENTIALS.email.toLowerCase() ||
        cleanId === 'harini'
      ) && cleanPass === INITIAL_USER_CREDENTIALS.password;

      if (isMatch) {
        const sessionUser = {
          username: INITIAL_USER_CREDENTIALS.username,
          email: INITIAL_USER_CREDENTIALS.email,
          name: INITIAL_USER_CREDENTIALS.name,
          role: INITIAL_USER_CREDENTIALS.role,
          token: 'dp_sec_direct_' + Date.now(),
          loginTime: new Date().toISOString()
        };
        setUser(sessionUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }

      const errorMessage = err?.response?.data?.message || 'Invalid username or password.';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      initialCredentials: INITIAL_USER_CREDENTIALS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
