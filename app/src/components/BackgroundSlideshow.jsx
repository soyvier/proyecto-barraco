import { useState, useEffect, useRef } from 'react';
import { useBackgroundSlideshow } from '../hooks/useBackgroundSlideshow';

export default function BackgroundSlideshow() {
  const { currentImage, nextImage } = useBackgroundSlideshow(12000);
  const [fadeState, setFadeState] = useState({ showing: currentImage, fading: null });
  const prevImage = useRef(currentImage);

  useEffect(() => {
    if (currentImage !== prevImage.current) {
      setFadeState({ showing: currentImage, fading: prevImage.current });
      prevImage.current = currentImage;

      // Clean up fading image after transition completes
      const timer = setTimeout(() => {
        setFadeState(prev => ({ ...prev, fading: null }));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [currentImage]);

  return (
    <div className="bg-slideshow">
      {/* Fading out image (behind) */}
      {fadeState.fading && (
        <img
          src={fadeState.fading}
          alt=""
          style={{ opacity: 0, zIndex: 0 }}
        />
      )}
      {/* Current image (on top) */}
      <img
        key={fadeState.showing}
        src={fadeState.showing}
        alt=""
        style={{ opacity: 1, zIndex: 1 }}
      />
    </div>
  );
}
