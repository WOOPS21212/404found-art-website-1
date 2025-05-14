'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { Play, Pause, Repeat } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type PostType = 'standard' | 'video' | 'gif' | 'gallery';

interface PostCardProps {
  id: string;
  title: string;
  description?: string;
  type: PostType;
  mediaUrl: string;
  mediaAlt?: string;
  videoProvider?: 'vimeo' | 'self-hosted';
  disableAutoplay?: boolean;
  disableLoop?: boolean;
  className?: string;
}

export function PostCard({
  id,
  title,
  description,
  type,
  mediaUrl,
  mediaAlt,
  videoProvider,
  disableAutoplay = false,
  disableLoop = false,
  className = '',
}: PostCardProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
  const [isLooping, setIsLooping] = useState(!disableLoop);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Autoplay failed, likely due to mobile restrictions
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, type]);

  const renderMedia = () => {
    // Handle Vimeo videos first
    if (type === 'video' && videoProvider === 'vimeo') {
      // Extract video ID from URL if it's a full Vimeo URL
      const vimeoId = mediaUrl.includes('vimeo.com') 
        ? mediaUrl.split('/').pop() 
        : mediaUrl;
        
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=${!disableAutoplay}&loop=${!disableLoop}&byline=0&title=0&muted=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    // Handle video files - if it's a video type or the URL ends with video extension
    else if (type === 'video' || mediaUrl.toLowerCase().match(/\.(mp4|webm|mov)$/)) {
      return (
        <video
          ref={videoRef}
          src={mediaUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={!disableAutoplay}
          loop={!disableLoop}
          muted
          playsInline
        />
      );
    } 
    // Default to image for all other types
    else {
      return (
        <Image
          src={mediaUrl}
          alt={mediaAlt || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={type === 'gif'}
          unoptimized={type === 'gif' && isPlaying}
        />
      );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative aspect-square rounded-lg overflow-hidden group ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      } ${className}`}
    >
      {renderMedia()}
      {(type === 'video' || type === 'gif') && (
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full ${
              isPlaying ? 'bg-black/50' : 'bg-white/50'
            } transition-colors`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
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
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${
          theme === 'dark' ? 'text-white' : 'text-white'
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          {description && (
            <p className="text-sm opacity-90 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
