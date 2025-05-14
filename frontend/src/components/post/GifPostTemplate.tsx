'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BasePostTemplate } from './BasePostTemplate';
import { PostType } from '@/components/grid/PostCard';
import { Play, Pause, Repeat } from 'lucide-react';

interface GifPostTemplateProps {
  title: string;
  description: string;
  createdAt: string;
  mediaUrl: string;
  mediaAlt: string;
  disableAutoplay?: boolean;
  disableLoop?: boolean;
}

export function GifPostTemplate({
  title,
  description,
  createdAt,
  mediaUrl,
  mediaAlt,
  disableAutoplay = false,
  disableLoop = false,
}: GifPostTemplateProps) {
  const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
  const [isLooping, setIsLooping] = useState(!disableLoop);

  return (
    <BasePostTemplate
      title={title}
      description={description}
      type="gif"
      createdAt={createdAt}
    >
      <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-black">
        <Image
          src={mediaUrl}
          alt={mediaAlt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
          unoptimized={isPlaying}
        />
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full ${
              isPlaying ? 'bg-black/50' : 'bg-white/50'
            } transition-colors`}
            aria-label={isPlaying ? 'Pause GIF' : 'Play GIF'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-black" />
            )}
          </button>
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-full ${
              isLooping ? 'bg-black/50' : 'bg-white/50'
            } transition-colors`}
            aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
          >
            <Repeat
              className={`w-6 h-6 ${
                isLooping ? 'text-white' : 'text-black opacity-50'
              }`}
            />
          </button>
        </div>
      </div>
    </BasePostTemplate>
  );
} 