import { useState, useEffect, useCallback } from 'react';
import { strapiAPI, StrapiPost } from '@/lib/api/strapi';
import { PostType } from '@/components/grid/PostCard';

interface Post {
  id: string;
  title: string;
  description: string;
  type: PostType;
  mediaUrl: string;
  mediaFormats: Record<string, string>;
  mediaAlt: string;
  createdAt: string;
  updatedAt: string;
  slug?: string; // Added slug property
}

interface UsePostsOptions {
  initialType?: PostType;
  initialSearch?: string;
  pageSize?: number;
}

interface UsePostsResult {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  selectedType: PostType | null;
  searchQuery: string;
  loadMore: () => Promise<void>;
  setType: (type: PostType | null) => Promise<void>;
  setSearch: (query: string) => Promise<void>;
  resetFilters: () => Promise<void>;
}

export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
  const {
    initialType = null,
    initialSearch = '',
    pageSize = 10,
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedType, setSelectedType] = useState<PostType | null>(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const fetchPosts = useCallback(async (pageNum: number, type: PostType | null, search: string) => {
    try {
      setIsLoading(true);
      let response;

      if (search) {
        response = await strapiAPI.searchPosts(search, {
          page: pageNum,
          pageSize,
          type: type || undefined,
        });
      } else if (type) {
        response = await strapiAPI.getPostsByType(type, {
          page: pageNum,
          pageSize,
        });
      } else {
        response = await strapiAPI.getPosts({
          page: pageNum,
          pageSize,
        });
      }

      const newPosts = response.data.map(post => strapiAPI.transformPost(post));
      setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(pageNum < response.meta.pagination.pageCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
      setPosts([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchPosts(nextPage, selectedType, searchQuery);
    }
  }, [isLoading, hasMore, page, selectedType, searchQuery, fetchPosts]);

  const setType = useCallback(async (type: PostType | null) => {
    setSelectedType(type);
    setPage(1);
    await fetchPosts(1, type, searchQuery);
  }, [searchQuery, fetchPosts]);

  const setSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setPage(1);
    await fetchPosts(1, selectedType, query);
  }, [selectedType, fetchPosts]);

  const resetFilters = useCallback(async () => {
    setSelectedType(null);
    setSearchQuery('');
    setPage(1);
    await fetchPosts(1, null, '');
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(1, selectedType, searchQuery);
  }, []);

  return {
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
  };
}
