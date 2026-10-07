import React, { createContext, useState, useContext, useEffect } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  // Initialize from localStorage or default to 'HOUSEHOLD'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('expense_tracker_mode') || 'HOUSEHOLD';
  });

  useEffect(() => {
    localStorage.setItem('expense_tracker_mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'HOUSEHOLD' ? 'BUSINESS' : 'HOUSEHOLD'));
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
