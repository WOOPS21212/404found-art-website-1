'use client';

import { useTheme } from '@/context/ThemeContext';
import { PostLayout } from './PostLayout';
import { PostType } from '@/components/grid/PostCard';

interface BasePostTemplateProps {
  title: string;
  description: string;
  type: PostType;
  createdAt: string;
  children: React.ReactNode;
}

export function BasePostTemplate({
  title,
  description,
  type,
  createdAt,
  children,
}: BasePostTemplateProps) {
  const { theme } = useTheme();

  return (
    <PostLayout title={title}>
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
          <div className={`flex items-center space-x-4 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span className="capitalize">{type}</span>
            <span>•</span>
            <time dateTime={createdAt}>
              {new Date(createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        {description && (
          <div className={`prose ${
            theme === 'dark' ? 'prose-invert' : ''
          } max-w-none mb-8`}>
            <p className="text-lg">{description}</p>
          </div>
        )}

        <div className="mt-8">
          {children}
        </div>
      </article>
    </PostLayout>
  );
} 