'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BasePostTemplate } from './BasePostTemplate';
import { PostType } from '@/components/grid/PostCard';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
  url: string;
  alt: string;
}

interface GalleryPostTemplateProps {
  title: string;
  description: string;
  createdAt: string;
  images: GalleryImage[];
}

export function GalleryPostTemplate({
  title,
  description,
  createdAt,
  images,
}: GalleryPostTemplateProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <BasePostTemplate
      title={title}
      description={description}
      type="gallery"
      createdAt={createdAt}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {images.map((image, index) => (
          <div
            key={image.url}
            className="relative aspect-square rounded-lg overflow-hidden bg-black cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
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

          <button
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4">
            <Image
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </BasePostTemplate>
  );
} 