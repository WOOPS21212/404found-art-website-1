'use client';

import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Share2, ArrowLeft } from 'lucide-react';

interface PostLayoutProps {
  children: React.ReactNode;
  title: string;
  onShare?: () => void;
  showBackButton?: boolean;
}

export function PostLayout({
  children,
  title,
  onShare,
  showBackButton = true,
}: PostLayoutProps) {
  const { theme } = useTheme();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else if (onShare) {
      onShare();
    }
  };

  return (
    <div className="min-h-screen">
      <header className={`sticky top-0 z-50 backdrop-blur-sm ${
        theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'
      } border-b ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {showBackButton && (
              <Link
                href="/"
                className={`flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to all posts</span>
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Share post"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
} 