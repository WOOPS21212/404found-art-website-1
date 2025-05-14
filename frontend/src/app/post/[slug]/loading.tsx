'use client';

import { useTheme } from '@/context/ThemeContext';
import { PostLayout } from '@/components/post/PostLayout';

export default function PostLoading() {
  const { theme } = useTheme();

  return (
    <PostLayout title="Loading..." showBackButton={true}>
      <article className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-8" />
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          </div>
        </div>
      </article>
    </PostLayout>
  );
} 