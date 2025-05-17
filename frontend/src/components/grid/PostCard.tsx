'use client';

import { motion } from 'framer-motion';
// Update the Next.js Image import to fix "default is not a constructor" error
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { Play, Pause, Repeat } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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
  aspectRatio?: number;
  slug: string;
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
  aspectRatio = 1, // Default to square if not provided
  slug,
}: PostCardProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
  const [isLooping, setIsLooping] = useState(!disableLoop);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [actualAspectRatio, setActualAspectRatio] = useState(aspectRatio);
  const [isLoading, setIsLoading] = useState(true);

  // Create a safe slug fallback using the post ID if the slug is invalid
  const safeSlug = (!slug || slug === 'undefined' || typeof slug !== 'string') 
    ? `post-${id}` 
    : slug;

  // Log a warning if we're using the fallback slug
  useEffect(() => {
    if (safeSlug !== slug) {
      console.warn('Using fallback slug for post:', { id, title, originalSlug: slug, fallbackSlug: safeSlug });
    }
  }, [id, title, slug, safeSlug]);

  // Effect for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect for video playback control
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

  // Effect for aspect ratio calculation
  useEffect(() => {
    const calculateAspectRatio = async () => {
      // First try to get from sessionStorage
      try {
        const storedRatio = sessionStorage.getItem(`post-${id}-aspect-ratio`);
        if (storedRatio) {
          const ratio = parseFloat(storedRatio);
          if (!isNaN(ratio)) {
            setActualAspectRatio(ratio);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to retrieve aspect ratio from sessionStorage", e);
      }
      
      // If no cache found, determine based on media type
      if (type === 'video' && videoProvider === 'vimeo') {
        // For Vimeo, we'll default to 16:9 if not specified
        const vimeoRatio = 16/9;
        setActualAspectRatio(vimeoRatio);
        setIsLoading(false);
        // Store for future
        try {
          sessionStorage.setItem(`post-${id}-aspect-ratio`, vimeoRatio.toString());
        } catch (e) {
          console.error("Failed to store aspect ratio in sessionStorage", e);
        }
      }
      // For self-hosted videos, we'll get ratio in onLoadedMetadata
      else if (type !== 'video' || videoProvider !== 'vimeo') {
        // For images and GIFs, preload to get dimensions
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          setActualAspectRatio(ratio);
          setIsLoading(false);
          
          // Store for future use
          try {
            sessionStorage.setItem(`post-${id}-aspect-ratio`, ratio.toString());
          } catch (e) {
            console.error("Failed to store aspect ratio in sessionStorage", e);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${mediaUrl}`);
          setActualAspectRatio(1); // Fallback to square
          setIsLoading(false);
        };
        img.src = mediaUrl;
      }
    };
    
    calculateAspectRatio();
  }, [id, mediaUrl, type, videoProvider]);

  // Function to determine column span based on actual aspect ratio
  const getColumnSpanClass = () => {
    if (actualAspectRatio >= 3) return 'col-span-3';
    // 16:9 aspect ratio is approximately 1.78, so we use 1.7 as threshold to capture 16:9 content
    if (actualAspectRatio >= 1.7) return 'col-span-2';
    return '';
  };

  // Function to render appropriate media based on type
  const renderMedia = () => {
    // Handle Vimeo videos
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
    // Handle self-hosted videos
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
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            const ratio = video.videoWidth / video.videoHeight;
            setActualAspectRatio(ratio);
            setIsLoading(false);
            
            // Store the aspect ratio in sessionStorage
            try {
              sessionStorage.setItem(`post-${id}-aspect-ratio`, ratio.toString());
            } catch (e) {
              console.error("Failed to store aspect ratio in sessionStorage", e);
            }
          }}
        />
      );
    } 
    // Default to image for all other types
    else {
      return (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={mediaUrl}
            alt={mediaAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={type === 'gif'}
            unoptimized={type === 'gif' && isPlaying}
            onLoad={(e) => {
              // This is a backup method for aspect ratio calculation
              // The main calculation happens in the useEffect above via Image preloading
              const img = e.target as HTMLImageElement;
              if (img.naturalWidth && img.naturalHeight) {
                const ratio = img.naturalWidth / img.naturalHeight;
                setActualAspectRatio(ratio);
                setIsLoading(false);
                
                // Store the aspect ratio in sessionStorage
                try {
                  sessionStorage.setItem(`post-${id}-aspect-ratio`, ratio.toString());
                } catch (e) {
                  console.error("Failed to store aspect ratio in sessionStorage", e);
                }
              }
            }}
          />
        </div>
      );
    }
  };

  return (
    <Link 
      href={`/posts/${safeSlug}`}
      className="block"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-lg overflow-hidden group ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } ${getColumnSpanClass()} ${className}`}
        style={{
          aspectRatio: isLoading ? 1 : actualAspectRatio,
          width: '100%',
          height: 'auto',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        <div className="relative w-full h-full" data-aspect-ratio={actualAspectRatio}>
          {renderMedia()}
        </div>
        {(type === 'video' || type === 'gif') && (
          <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation when clicking controls
                setIsPlaying(!isPlaying);
              }}
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
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation when clicking controls
                setIsLooping(!isLooping);
              }}
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
            <h3 className="text-lg font-semibold mb-1 post-title">{title}</h3>
            {description && (
              <p className="text-sm opacity-90 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
