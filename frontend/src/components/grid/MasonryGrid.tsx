'use client';

import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { useTheme } from '@/context/ThemeContext';

interface MasonryGridProps {
  children: React.ReactNode;
  breakpointCols?: {
    default: number;
    [key: number]: number;
  };
  className?: string;
  columnGap?: string;
}

export const MasonryGrid = ({
  children,
  breakpointCols = {
    default: 4,
    1536: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  },
  className = '',
  columnGap = '1.5rem',
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
    <Masonry
      breakpointCols={breakpointCols}
      className={`masonry-grid ${className}`}
      columnClassName="masonry-grid_column"
      style={{
        display: 'flex',
        marginLeft: `-${columnGap}`,
        width: 'auto',
      }}
    >
      {children}
    </Masonry>
  );
}; 