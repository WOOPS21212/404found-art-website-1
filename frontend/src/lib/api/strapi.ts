import { PostType } from '@/components/grid/PostCard';
import { Post } from '@/types/post';

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

export async function getSinglePost(slug: string): Promise<Post | null> {
  if (!slug) {
    console.error('Invalid slug provided to getSinglePost:', slug);
    return null;
  }

  try {
    console.log('getSinglePost: Making API request with slug:', slug);
    // Ensure we're using the correct API URL
    // NEXT_PUBLIC_STRAPI_API_URL should be 'http://localhost:1337/api'
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api'}/posts?filters[slug][$eq]=${slug}&populate=*`;
    console.log('getSinglePost URL:', url);
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    console.log('getSinglePost response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('getSinglePost response data:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Check if we have valid data
    if (data && data.data && data.data.length > 0) {
      // Return formatted post data
      console.log('getSinglePost: Post found, formatting data');
      return formatPost(data.data[0]);
    }
    
    console.error('No post found with slug:', slug);
    return null;
  } catch (error) {
    console.error('Error fetching single post:', error);
    return null;
  }
}

/**
 * Generates a URL-friendly slug from a title
 * @param title The title to convert to a slug
 * @param id The post ID to use as fallback
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string | undefined, id: string | number): string {
  if (!title) return `post-${id}`;
  
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim leading/trailing spaces
}

// Helper function to format the post data from Strapi
function formatPost(post: any): Post {
  // Check if the data is in the expected Strapi API format
  if (post && post.attributes) {
    // Standard API response format
    const attributes = post.attributes;
    
    // Use the slug from Strapi if it exists, otherwise generate one
    const slug = attributes.slug || generateSlug(attributes.title, post.id);

    return {
      id: post.id,
      title: attributes.title || 'Untitled',
      slug: slug,
      description: attributes.description,
      content: attributes.content,
      featuredImage: attributes.featuredImage?.data
        ? {
            url: attributes.featuredImage.data.attributes.url,
            alt: attributes.featuredImage.data.attributes.alternativeText || attributes.title,
          }
        : null,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  } 
  // Check if this is a direct post object (with no nested attributes)
  else if (post && post.id && typeof post.id !== 'undefined') {
    // Direct post object format
    const slug = post.slug || generateSlug(post.title, post.id);
    
    return {
      id: post.id.toString(),
      title: post.title || 'Untitled',
      slug: slug,
      description: post.description || '',
      content: post.content,
      featuredImage: post.featuredImage
        ? {
            url: STRAPI_URL + post.featuredImage.url,
            alt: post.featuredImage.alternativeText || post.title || '',
          }
        : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
  
  // Default case for invalid data
  console.error('Invalid post data received:', post);
  return {
    id: '0',
    title: 'Error: Invalid post data',
    slug: 'error-invalid-post',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetches a post by its ID using the collection endpoint as a fallback
 * @param id The post ID to fetch
 * @returns The formatted post or null if not found
 */
export async function getPostById(id: string | number): Promise<Post | null> {
  if (!id) {
    console.error('Invalid ID provided to getPostById');
    return null;
  }

  try {
    // Use the filter approach which is more reliable
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/posts?filters[id][$eq]=${id}&populate=*`;
    console.log('Fetching post by ID URL:', url);

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    // Log status for debugging
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error(`Failed to fetch post by ID ${id}. Status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Collection endpoint returns an array, so we need the first item
    if (data && data.data && data.data.length > 0) {
      console.log('Post found by ID:', id);
      return formatPost(data.data[0]);
    }
    
    console.error('No post found with ID:', id);
    return null;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

/**
 * Debug function to verify Strapi API configuration and structure
 */
export async function debugStrapiApi(): Promise<string> {
  try {
    // Get the API info
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}`);
    const data = await response.json();
    console.log('Strapi API structure:', data);
    
    // Try to get all posts to verify endpoint
    const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/posts?populate=*`);
    const postsData = await postsResponse.json();
    console.log('Posts response structure:', postsData);
    
    if (postsData && postsData.data && postsData.data.length > 0) {
      const firstPostId = postsData.data[0].id;
      console.log('First post ID:', firstPostId);
      
      // Try to get this specific post
      const singlePostResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/posts/${firstPostId}?populate=*`);
      console.log('Single post status:', singlePostResponse.status);
      
      if (singlePostResponse.ok) {
        const singlePostData = await singlePostResponse.json();
        console.log('Single post structure:', singlePostData);
      }
    }
    
    return 'Debug complete. Check console for results.';
  } catch (error) {
    console.error('Error debugging Strapi API:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Utility function to verify Strapi configuration and permissions
 */
export async function verifyStrapiConfig(): Promise<string> {
  try {
    console.log('NEXT_PUBLIC_STRAPI_API_URL:', process.env.NEXT_PUBLIC_STRAPI_API_URL);
    
    // Check if we can access the API at all
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/posts?populate=*`);
    
    if (!response.ok) {
      console.error('Cannot access Strapi API. Status:', response.status);
      
      // Try without the /api prefix as a fallback (some setups might be different)
      const altResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/posts?populate=*`);
      if (altResponse.ok) {
        console.log('API accessible without /api prefix. Your NEXT_PUBLIC_STRAPI_API_URL might need adjustment');
      }
    } else {
      console.log('Successfully accessed Strapi API!');
    }
    
    return 'Verification complete. Check console for results.';
  } catch (error) {
    console.error('Error verifying Strapi config:', error);
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
