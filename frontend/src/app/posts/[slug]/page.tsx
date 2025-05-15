import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getSinglePost, getPostById } from '@/lib/api/strapi';
import styles from './Post.module.css';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // For Next.js App Router, we need to await params before destructuring
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    return {
      title: 'Invalid Post | 404 Found Art',
    };
  }

  // Check if this is a generated slug (post-123 format)
  const isGeneratedSlug = slug.startsWith('post-');
  let post;
  
  try {
    // Create an abort controller for a 10-second timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);
    
    try {
      if (isGeneratedSlug) {
        // Extract the ID from the slug
        const postId = slug.replace('post-', '');
        post = await getPostById(postId);
      } else {
        post = await getSinglePost(slug);
      }
      
      clearTimeout(timeoutId);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      // TypeScript safe error handling
      const fetchError = error as Error;
      if (fetchError.name === 'AbortError') {
        console.error('Fetch request timed out. Strapi server may be unreachable.');
        return {
          title: 'Error Connecting to Server | 404 Found Art',
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching post for metadata:', error);
    return {
      title: 'Error | 404 Found Art',
    };
  }
  
  if (!post) {
    return {
      title: 'Post Not Found | 404 Found Art',
    };
  }

  return {
    title: `${post.title} | 404 Found Art`,
    description: post.description,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  // For Next.js App Router, we need to await params before destructuring
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  
  if (!slug) {
    notFound();
  }

  // Check if this is a generated slug (post-123 format)
  const isGeneratedSlug = slug.startsWith('post-');
  let post;
  
  try {
    console.log('Fetching post with slug:', slug);
    console.log('isGeneratedSlug:', isGeneratedSlug);
    
    // Create an abort controller for a 10-second timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);
    
    try {
      if (isGeneratedSlug) {
        // Extract the ID from the slug
        const postId = slug.replace('post-', '');
        console.log('Attempting to fetch post by ID:', postId);
        post = await getPostById(postId);
      } else {
        console.log('Attempting to fetch post by slug:', slug);
        post = await getSinglePost(slug);
      }
      
      clearTimeout(timeoutId);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      // TypeScript safe error handling
      const fetchError = error as Error;
      if (fetchError.name === 'AbortError') {
        console.error('Fetch request timed out. Strapi server may be unreachable.');
        throw new Error('Server timeout. The backend API may be unavailable.');
      }
      throw error;
    }
    
    console.log('Post fetch result:', post ? 'Found' : 'Not found');
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
  
  if (!post) {
    notFound();
  }
  
  return (
    <main className="min-h-screen">
      {/* Featured media banner */}
      <div className={styles.bannerContainer}>
        {post.featuredImage && (
          <div className={styles.bannerImageWrapper}>
            {post.featuredImage.url.match(/\.(mp4|webm|mov)$/i) ? (
              // Video content
              <video
                src={post.featuredImage.url}
                className={styles.bannerImage}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              // Image content
              <Image 
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
                fill
                className={styles.bannerImage}
                priority
              />
            )}
          </div>
        )}
      </div>
      
      {/* Post content container */}
      <div className={styles.contentContainer}>
        <h1 className={styles.postTitle}>{post.title}</h1>
        
        {post.description && (
          <div className={styles.postDescription}>
            {post.description}
          </div>
        )}
        
        {/* Post content will be rendered here */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Add your content rendering logic here */}
        </div>
      </div>
    </main>
  );
}
