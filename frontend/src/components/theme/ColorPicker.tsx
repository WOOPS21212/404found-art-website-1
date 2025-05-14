'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ColorPicker: React.FC = () => {
  const { colorScheme, setColorScheme } = useTheme();

  return (
    <div style={{ margin: '1rem 0' }}>
      <label htmlFor="color-picker">Accent Color: </label>
      <input
        id="color-picker"
        type="color"
        value={colorScheme}
        onChange={e => setColorScheme(e.target.value)}
        style={{ marginLeft: 8 }}
      />
    </div>
  );
};

export default ColorPicker; 