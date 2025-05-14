'use client';

import { useState, useEffect, useRef } from 'react';
import { BasePostTemplate } from './BasePostTemplate';
import { PostType } from '@/components/grid/PostCard';
import { Play, Pause, Repeat } from 'lucide-react';

interface VideoPostTemplateProps {
  title: string;
  description: string;
  createdAt: string;
  videoId: string;
  videoProvider: 'vimeo' | 'self-hosted';
  disableAutoplay?: boolean;
  disableLoop?: boolean;
}

export function VideoPostTemplate({
  title,
  description,
  createdAt,
  videoId,
  videoProvider,
  disableAutoplay = false,
  disableLoop = false,
}: VideoPostTemplateProps) {
  const [isPlaying, setIsPlaying] = useState(!disableAutoplay);
  const [isLooping, setIsLooping] = useState(!disableLoop);
  const playerRef = useRef<HTMLIFrameElement | HTMLVideoElement>(null);
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
    if (videoProvider === 'vimeo') {
      // Load Vimeo Player API
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [videoProvider]);

  const handlePlayPause = () => {
    if (videoProvider === 'vimeo' && playerRef.current) {
      const player = new (window as any).Vimeo.Player(playerRef.current);
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } else if (videoProvider === 'self-hosted' && playerRef.current) {
      if (isPlaying) {
        (playerRef.current as HTMLVideoElement).pause();
      } else {
        (playerRef.current as HTMLVideoElement).play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoopToggle = () => {
    if (videoProvider === 'vimeo' && playerRef.current) {
      const player = new (window as any).Vimeo.Player(playerRef.current);
      player.setLoop(!isLooping);
    } else if (videoProvider === 'self-hosted' && playerRef.current) {
      (playerRef.current as HTMLVideoElement).loop = !isLooping;
    }
    setIsLooping(!isLooping);
  };

  const renderVideo = () => {
    if (videoProvider === 'vimeo') {
      return (
        <iframe
          ref={playerRef as React.RefObject<HTMLIFrameElement>}
          src={`https://player.vimeo.com/video/${videoId}?background=1&autoplay=${!disableAutoplay}&loop=${!disableLoop}&byline=0&title=0&muted=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      return (
        <video
          ref={playerRef as React.RefObject<HTMLVideoElement>}
          src={videoId}
          className="absolute inset-0 w-full h-full"
          autoPlay={!disableAutoplay}
          loop={!disableLoop}
          muted
          playsInline
        />
      );
    }
  };

  return (
    <BasePostTemplate
      title={title}
      description={description}
      type="video"
      createdAt={createdAt}
    >
      <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-black">
        {renderVideo()}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={handlePlayPause}
            className={`p-2 rounded-full ${
              isPlaying ? 'bg-black/50' : 'bg-white/50'
            } transition-colors`}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-black" />
            )}
          </button>
          <button
            onClick={handleLoopToggle}
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