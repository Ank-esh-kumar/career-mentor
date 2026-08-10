import { createContext, useContext, useEffect, useState } from 'react';
import { useSubscription } from './SubscriptionContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { isPremium, loading } = useSubscription();

  // Mode: 'light', 'dark', 'system'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('app-mode') || 'system';
  });

  // Pro Theme: 'default', 'pro-emerald', 'pro-gold', 'pro-rose', 'pro-amethyst'
  const [proTheme, setProTheme] = useState(() => {
    return localStorage.getItem('app-pro-theme') || 'default';
  });

  useEffect(() => {
    localStorage.setItem('app-mode', mode);
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('app-pro-theme', proTheme);
    const root = window.document.documentElement;

    if (isPremium && proTheme !== 'default') {
      root.setAttribute('data-theme', proTheme);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [proTheme, isPremium]);

  const value = {
    mode,
    setMode,
    proTheme,
    setProTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
