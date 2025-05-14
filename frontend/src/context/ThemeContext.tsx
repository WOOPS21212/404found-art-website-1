'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of the theme context
interface ThemeContextType {
  theme: 'light' | 'dark';
  colorScheme: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setColorScheme: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
  defaultColorScheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  defaultColorScheme = '#0070f3', // Default to a blue accent
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(defaultTheme);
  const [colorScheme, setColorScheme] = useState<string>(defaultColorScheme);

  // Persist theme in localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const storedColor = localStorage.getItem('colorScheme');
    if (storedTheme) setTheme(storedTheme);
    if (storedColor) setColorScheme(storedColor);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme);
    document.documentElement.style.setProperty('--color-scheme', colorScheme);
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 