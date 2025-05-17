'use client';

import { MasonryGrid } from '@/components/grid/MasonryGrid';
import { PostCard, PostType } from '@/components/grid/PostCard';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';
import { usePosts } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/context/ThemeContext';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'video', label: 'Video' },
  { value: 'gif', label: 'GIF' },
  { value: 'gallery', label: 'Gallery' },
];

export default function HomePage() {
  const { theme } = useTheme();
  const {
    posts,
    isLoading,
    error,
    hasMore,
    selectedType,
    searchQuery,
    loadMore,
    setType,
    setSearch,
    resetFilters,
  } = usePosts();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Handle infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Handle debounced search
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTypeChange = useCallback(async (type: PostType | null) => {
    setIsFiltering(true);
    await setType(type);
    setIsFiltering(false);
  }, [setType]);

  const handleReset = useCallback(async () => {
    setIsFiltering(true);
    await resetFilters();
    setIsFiltering(false);
  }, [resetFilters]);

  const buttonBaseClasses = `px-4 py-2 rounded-lg transition-all duration-200 ${
    theme === 'dark'
      ? 'bg-gray-700 text-white hover:bg-gray-600'
      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
  }`;

  const buttonActiveClasses = `${
    theme === 'dark'
      ? 'bg-primary text-white hover:bg-primary/90'
      : 'bg-primary text-white hover:bg-primary/90'
  }`;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className={`text-4xl font-bold post-title ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            404 Found Art
          </h1>
          <ThemeSwitcher />
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts..."
              className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary'
              }`}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleReset}
              disabled={isFiltering}
              className={`${buttonBaseClasses} ${
                !selectedType && !searchQuery ? buttonActiveClasses : ''
              } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFiltering && !selectedType ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                'All'
              )}
            </button>
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                disabled={isFiltering}
                className={`${buttonBaseClasses} ${
                  selectedType === type.value ? buttonActiveClasses : ''
                } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFiltering && selectedType === type.value ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  type.label
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>Error loading posts: {error.message}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading && posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center min-h-[400px]"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No posts found
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MasonryGrid>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    description={post.description}
                    type={post.type}
                    mediaUrl={post.mediaUrl}
                    mediaAlt={post.mediaAlt}
                    slug={post.slug || `post-${post.id}`}
                  />
                ))}
              </MasonryGrid>

              {hasMore && (
                <div ref={loadMoreRef} className="h-10 mt-8">
                  {isLoading && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
