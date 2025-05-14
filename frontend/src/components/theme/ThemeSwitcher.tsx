'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme} style={{ margin: '1rem 0' }}>
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeSwitcher; 