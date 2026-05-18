'use client';

import { createContext, useContext, useEffect } from 'react';

import useUIStore from '@/stores/ui-store';

// ===================================================
// THEME CONTEXT
// ===================================================

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ===================================================
// THEME PROVIDER COMPONENT
// ===================================================

export function ThemeProvider({ children }) {
  const { theme, setTheme, toggleTheme } = useUIStore();

  // Initialize theme on mount
  useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('firstcry-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
