import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import './Carousel.css';

const Carousel = ({
  items = [],
  autoPlay = false,
  autoPlayInterval = 3000,
  showArrows = true,
  showDots = true,
  showPlayPause = false,
  infinite = true,
  className = '',
  itemsPerView = 1,
  gap = 16,
  renderItem
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const maxIndex = Math.max(0, items.length - itemsPerView);

  useEffect(() => {
    if (isPlaying && items.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, autoPlayInterval, items.length, itemsPerView]);

  const goToNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex >= maxIndex) {
      if (infinite) {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (currentIndex <= 0) {
      if (infinite) {
        setCurrentIndex(maxIndex);
      }
    } else {
      setCurrentIndex(prev => prev - 1);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case ' ':
        e.preventDefault();
        if (showPlayPause) {
          togglePlayPause();
        }
        break;
    }
  };

  if (items.length === 0) {
    return (
      <div className="carousel-empty">
        <p>No items to display</p>
      </div>
    );
  }

  const translateX = -(currentIndex * (100 / itemsPerView));
  const itemWidth = itemsPerView > 1 ? `calc(${100 / itemsPerView}% - ${gap * (itemsPerView - 1) / itemsPerView}px)` : '100%';

  return (
    <div 
      className={`carousel ${className}`}
      ref={carouselRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ 
            transform: `translateX(${translateX}%)`,
            gap: `${gap}px`
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="carousel-item"
              style={{ width: itemWidth }}
              aria-hidden={index < currentIndex || index >= currentIndex + itemsPerView}
            >
              {renderItem ? renderItem(item, index) : (
                <div className="carousel-default-item">
                  {typeof item === 'string' ? (
                    <img src={item} alt={`Slide ${index + 1}`} />
                  ) : (
                    <div>{item}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showArrows && items.length > itemsPerView && (
          <>
            <button
              className={`carousel-arrow carousel-arrow-prev ${currentIndex === 0 && !infinite ? 'disabled' : ''}`}
              onClick={goToPrevious}
              disabled={currentIndex === 0 && !infinite}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`carousel-arrow carousel-arrow-next ${currentIndex >= maxIndex && !infinite ? 'disabled' : ''}`}
              onClick={goToNext}
              disabled={currentIndex >= maxIndex && !infinite}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {showPlayPause && autoPlay && (
          <button
            className="carousel-play-pause"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        )}
      </div>

      {showDots && items.length > itemsPerView && (
        <div className="carousel-dots">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;