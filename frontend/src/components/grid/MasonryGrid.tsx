'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import styles from './MasonryGrid.module.css';

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export const MasonryGrid = ({
  children,
  className = '',
}: MasonryGridProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`${styles.masonryGrid} ${className}`}>
      {children}
    </div>
  );
}; 