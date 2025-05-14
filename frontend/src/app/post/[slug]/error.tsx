'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PostLayout } from '@/components/post/PostLayout';
import { AlertCircle } from 'lucide-react';

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { theme } = useTheme();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <PostLayout title="Error" showBackButton={true}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Something went wrong!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {error.message || 'An unexpected error occurred while loading this post.'}
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Back to homepage
          </a>
        </div>
      </div>
    </PostLayout>
  );
} 