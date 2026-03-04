import React, { useEffect, useState } from 'react';
import { Photo, ImageSource } from '../types';

interface BackgroundProps {
  photos: Photo[];
  interval: number; // seconds
  imageSource?: ImageSource;
  youtubeUrl?: string;
}

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const Background: React.FC<BackgroundProps> = ({ photos, interval, imageSource, youtubeUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Reset indices when photo list changes
  useEffect(() => {
    setCurrentIndex(0);
    setNextIndex(photos.length > 1 ? 1 : 0);
  }, [photos]);

  useEffect(() => {
    // Only set up interval if we have more than 1 photo
    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setTransitioning(false);
        // Preload next
        setNextIndex((prev) => (prev + 2) % photos.length);
      }, 1000); // Transition duration matches CSS
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [photos, interval]);

  // YouTube Background Mode
  if (imageSource === 'youtube' && youtubeUrl) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    
    if (videoId) {
      return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0">
          {/* YouTube iframe - fullscreen, no controls, autoplay, muted, loop */}
          <iframe
            className="absolute top-1/2 left-1/2 w-[180%] h-[180%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0`}
            title="Background Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        </div>
      );
    }
  }

  if (!photos || photos.length === 0) {
    // Visible gradient fallback instead of solid black
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
    );
  }

  const currentPhoto = photos[currentIndex] || photos[0];
  const nextPhoto = photos[nextIndex] || photos[0];

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0">
      {/* Next Image (Preloaded/Underneath) */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${nextPhoto.url})` }}
      />
      
      {/* Current Image (On Top) */}
      <div 
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${transitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${currentPhoto.url})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Author Credit */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs z-10 font-sans">
        {transitioning ? nextPhoto.author : currentPhoto.author}
      </div>
    </div>
  );
};