export interface Post {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  featuredImage?: {
    url: string;
    alt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
} 