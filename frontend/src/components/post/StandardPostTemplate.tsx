'use client';

import Image from 'next/image';
import { BasePostTemplate } from './BasePostTemplate';
import { PostType } from '@/components/grid/PostCard';

interface StandardPostTemplateProps {
  title: string;
  description: string;
  createdAt: string;
  mediaUrl: string;
  mediaAlt: string;
  content?: string;
}

export function StandardPostTemplate({
  title,
  description,
  createdAt,
  mediaUrl,
  mediaAlt,
  content,
}: StandardPostTemplateProps) {
  return (
    <BasePostTemplate
      title={title}
      description={description}
      type="standard"
      createdAt={createdAt}
    >
      <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
        <Image
          src={mediaUrl}
          alt={mediaAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
        />
      </div>

      {content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </BasePostTemplate>
  );
} 