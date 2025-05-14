import { PostType } from '@/components/grid/PostCard';

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  Description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiPost {
  id: number;
  documentId: string;
  title: string;
  description: string;
  publicationDate?: string;
  slug: string;
  postType: PostType;
  isFeatured?: boolean;
  videoURL?: string;
  videoProvider?: 'vimeo' | 'self-hosted';
  disableAutoplay?: boolean;
  disableLoop?: boolean;
  gifURL?: string;
  gifProvider?: string;
  autoPlay?: boolean;
  content?: any;
  featuredImage?: StrapiMedia | null;
  galleryImages?: StrapiMedia[];
  categories?: StrapiCategory[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GetPostsOptions {
  page?: number;
  pageSize?: number;
  type?: PostType;
  search?: string;
  sort?: string;
}

class StrapiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

class StrapiAPI {
  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${STRAPI_URL}/api${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new StrapiError(
          error.error?.message || response.statusText,
          response.status,
          error.error?.code
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof StrapiError) {
        throw error;
      }
      console.error('Strapi API request failed:', error);
      throw new StrapiError(
        error instanceof Error ? error.message : 'Failed to fetch from Strapi'
      );
    }
  }

  private buildQueryString(options: GetPostsOptions = {}): string {
    const {
      page = 1,
      pageSize = 10,
      type,
      search,
      sort = 'createdAt:desc',
    } = options;

    const params = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      sort,
    });

    if (type) {
      params.append('filters[postType][$eq]', type);
    }

    if (search) {
      params.append('filters[$or][0][title][$containsi]', search);
      params.append('filters[$or][1][description][$containsi]', search);
    }

    return params.toString();
  }

  private getMediaUrl(media: StrapiMedia | null | undefined): string {
    if (!media || !media.url) {
      return '';
    }

    const baseUrl = STRAPI_URL.replace(/\/$/, '');
    const mediaUrl = media.url.replace(/^\//, '');
    return `${baseUrl}/${mediaUrl}`;
  }

  private getMediaFormats(media: StrapiMedia | null | undefined): Record<string, string> {
    if (!media || !media.formats) {
      return {};
    }

    const baseUrl = STRAPI_URL.replace(/\/$/, '');
    const formats: Record<string, string> = {};

    Object.entries(media.formats).forEach(([key, format]) => {
      if (format?.url) {
        formats[key] = `${baseUrl}${format.url}`;
      }
    });

    return formats;
  }

  async getPosts(options: GetPostsOptions = {}): Promise<StrapiResponse<StrapiPost[]>> {
    const queryString = this.buildQueryString(options);
    return this.fetch<StrapiResponse<StrapiPost[]>>(
      `/posts?populate=featuredImage&populate=galleryImages&populate=categories&${queryString}`
    );
  }

  async getPost(id: number): Promise<StrapiResponse<StrapiPost>> {
    return this.fetch<StrapiResponse<StrapiPost>>(
      `/posts/${id}?populate=featuredImage&populate=galleryImages&populate=categories`
    );
  }

  async searchPosts(query: string, options: Omit<GetPostsOptions, 'search'> = {}): Promise<StrapiResponse<StrapiPost[]>> {
    return this.getPosts({ ...options, search: query });
  }

  async getPostsByType(type: PostType, options: Omit<GetPostsOptions, 'type'> = {}): Promise<StrapiResponse<StrapiPost[]>> {
    return this.getPosts({ ...options, type });
  }

  async getPostBySlug(slug: string): Promise<StrapiPost | null> {
    try {
      const response = await this.fetch<StrapiResponse<StrapiPost[]>>(
        `/posts?filters[slug][$eq]=${slug}&populate=featuredImage&populate=galleryImages&populate=categories`
      );
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
  }

  async getAdjacentPosts(postId: number): Promise<{
    previousPost: { slug: string; title: string } | null;
    nextPost: { slug: string; title: string } | null;
  }> {
    try {
      const [previousResponse, nextResponse] = await Promise.all([
        this.fetch<StrapiResponse<StrapiPost[]>>(
          `/posts?filters[id][$lt]=${postId}&sort=id:desc&pagination[limit]=1`
        ),
        this.fetch<StrapiResponse<StrapiPost[]>>(
          `/posts?filters[id][$gt]=${postId}&sort=id:asc&pagination[limit]=1`
        ),
      ]);

      return {
        previousPost: previousResponse.data[0]
          ? {
              slug: previousResponse.data[0].slug,
              title: previousResponse.data[0].title,
            }
          : null,
        nextPost: nextResponse.data[0]
          ? {
              slug: nextResponse.data[0].slug,
              title: nextResponse.data[0].title,
            }
          : null,
      };
    } catch (error) {
      console.error('Error fetching adjacent posts:', error);
      return { previousPost: null, nextPost: null };
    }
  }

  transformPost(strapiPost: StrapiPost) {
    console.log('transformPost received:', JSON.stringify(strapiPost, null, 2));
    
    // Defensive programming
    if (!strapiPost) {
      console.error('Invalid post data:', strapiPost);
      return {
        id: '0',
        title: 'Error: Invalid post data',
        description: '',
        type: 'standard' as PostType,
        mediaUrl: '',
        mediaFormats: {},
        mediaAlt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    // Find first video from galleryImages for video posts if videoURL is not provided
    let mediaUrl = '';
    if (strapiPost.postType === 'video' && strapiPost.galleryImages && strapiPost.galleryImages.length > 0) {
      const firstVideo = strapiPost.galleryImages[0];
      mediaUrl = this.getMediaUrl(firstVideo);
    } else {
      mediaUrl = this.getMediaUrl(strapiPost.featuredImage);
    }
    
    return {
      id: strapiPost.id.toString(),
      title: strapiPost.title || 'Untitled',
      description: strapiPost.description || '',
      type: strapiPost.postType,
      slug: strapiPost.slug || '',
      content: strapiPost.content,
      videoURL: strapiPost.videoURL,
      videoProvider: strapiPost.videoProvider,
      galleryImages: strapiPost.galleryImages?.map(image => ({
        url: this.getMediaUrl(image),
        alt: image?.alternativeText || ''
      })) || [],
      mediaUrl,
      mediaFormats: this.getMediaFormats(strapiPost.featuredImage),
      mediaAlt: strapiPost.featuredImage?.alternativeText || '',
      createdAt: strapiPost.createdAt,
      updatedAt: strapiPost.updatedAt,
    };
  }
}

export const strapiAPI = new StrapiAPI();
