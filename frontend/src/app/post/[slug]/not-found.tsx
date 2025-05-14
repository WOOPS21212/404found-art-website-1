'use client';

import { useTheme } from '@/context/ThemeContext';
import { PostLayout } from '@/components/post/PostLayout';
import { FileQuestion } from 'lucide-react';

export default function PostNotFound() {
  const { theme } = useTheme();

  return (
    <PostLayout title="Post Not Found" showBackButton={true}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <FileQuestion className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Post Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to homepage
        </a>
      </div>
    </PostLayout>
  );
} 