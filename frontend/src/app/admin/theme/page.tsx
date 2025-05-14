'use client';

import ThemeSwitcher from '../../../components/theme/ThemeSwitcher';
import ColorPicker from '../../../components/theme/ColorPicker';
import { useTheme } from '../../../context/ThemeContext';

export default function AdminThemePage() {
  const { theme, colorScheme } = useTheme();

  return (
    <main style={{ padding: 32 }}>
      <h1>Admin Theme Settings</h1>
      <ThemeSwitcher />
      <ColorPicker />
      <p>Current theme: <b>{theme}</b></p>
      <p>Accent color: <span style={{ color: colorScheme }}>{colorScheme}</span></p>
    </main>
  );
} 