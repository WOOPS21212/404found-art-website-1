import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { strapiAPI } from '@/lib/api/strapi';
import { StandardPostTemplate } from '@/components/post/StandardPostTemplate';
import { VideoPostTemplate } from '@/components/post/VideoPostTemplate';
import { GifPostTemplate } from '@/components/post/GifPostTemplate';
import { GalleryPostTemplate } from '@/components/post/GalleryPostTemplate';
import { PostType } from '@/components/grid/PostCard';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const post = await strapiAPI.getPostBySlug(params.slug);
    if (!post) return { title: 'Post Not Found' };

    return {
      title: post.title,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        images: post.mediaUrl ? [post.mediaUrl] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        images: post.mediaUrl ? [post.mediaUrl] : [],
      },
    };
  } catch (error) {
    return { title: 'Error Loading Post' };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const post = await strapiAPI.getPostBySlug(params.slug);
    if (!post) notFound();

    const { previousPost, nextPost } = await strapiAPI.getAdjacentPosts(post.id);

    const renderPostTemplate = () => {
      switch (post.type) {
        case 'standard':
          return (
            <StandardPostTemplate
              title={post.title}
              description={post.description}
              createdAt={post.createdAt}
              mediaUrl={post.mediaUrl}
              mediaAlt={post.mediaAlt}
              content={post.content}
            />
          );
        case 'video':
          return (
            <VideoPostTemplate
              title={post.title}
              description={post.description}
              createdAt={post.createdAt}
              videoId={post.videoId}
            />
          );
        case 'gif':
          return (
            <GifPostTemplate
              title={post.title}
              description={post.description}
              createdAt={post.createdAt}
              mediaUrl={post.mediaUrl}
              mediaAlt={post.mediaAlt}
            />
          );
        case 'gallery':
          return (
            <GalleryPostTemplate
              title={post.title}
              description={post.description}
              createdAt={post.createdAt}
              images={post.galleryImages}
            />
          );
        default:
          return null;
      }
    };

    return (
      <>
        {renderPostTemplate()}
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            {previousPost ? (
              <a
                href={`/post/${previousPost.slug}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← {previousPost.title}
              </a>
            ) : (
              <div />
            )}
            {nextPost ? (
              <a
                href={`/post/${nextPost.slug}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {nextPost.title} →
              </a>
            ) : (
              <div />
            )}
          </div>
        </nav>
      </>
    );
  } catch (error) {
    throw new Error('Failed to load post');
  }
} 