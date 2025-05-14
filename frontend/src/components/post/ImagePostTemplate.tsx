'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BasePostTemplate } from './BasePostTemplate';
import { PostType } from '@/components/grid/PostCard';
import { X } from 'lucide-react';

interface ImagePostTemplateProps {
  title: string;
  description: string;
  createdAt: string;
  mediaUrl: string;
  mediaAlt: string;
}

export function ImagePostTemplate({
  title,
  description,
  createdAt,
  mediaUrl,
  mediaAlt,
}: ImagePostTemplateProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <BasePostTemplate
      title={title}
      description={description}
      type="standard"
      createdAt={createdAt}
    >
      <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-black">
        <Image
          src={mediaUrl}
          alt={mediaAlt}
          fill
          className="object-contain cursor-pointer"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
          onClick={() => setIsLightboxOpen(true)}
        />
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4">
            <Image
              src={mediaUrl}
              alt={mediaAlt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </BasePostTemplate>
  );
} 