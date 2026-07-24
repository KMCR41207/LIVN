import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Download } from 'lucide-react';
import './ImageGallery.css';

const ImageGallery = ({ 
  images = [], 
  className = '', 
  showThumbnails = true,
  allowFullscreen = true,
  autoPlay = false,
  autoPlayInterval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (autoPlay && images.length > 1 && !isFullscreen) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, images.length, isFullscreen, autoPlayInterval]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'Escape':
          setIsFullscreen(false);
          setIsZoomed(false);
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const downloadImage = () => {
    if (!currentImage) return;
    
    const link = document.createElement('a');
    link.href = currentImage.src || currentImage;
    link.download = currentImage.alt || `image-${currentIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images.length) {
    return (
      <div className={`image-gallery empty ${className}`}>
        <div className="no-images">No images available</div>
      </div>
    );
  }

  return (
    <>
      <div className={`image-gallery ${className}`}>
        {/* Main Image Display */}
        <div className="gallery-main">
          <div className="main-image-container">
            <img
              src={typeof currentImage === 'string' ? currentImage : currentImage?.src}
              alt={typeof currentImage === 'string' ? `Image ${currentIndex + 1}` : currentImage?.alt}
              className="main-image"
              onClick={allowFullscreen ? toggleFullscreen : undefined}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  className="nav-btn nav-btn-prev"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="nav-btn nav-btn-next"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Overlay Actions */}
            <div className="image-overlay-actions">
              {allowFullscreen && (
                <button 
                  className="overlay-btn"
                  onClick={toggleFullscreen}
                  aria-label="View fullscreen"
                >
                  <ZoomIn size={16} />
                </button>
              )}
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="image-counter">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={typeof image === 'string' ? image : image.src}
                  alt={typeof image === 'string' ? `Thumbnail ${index + 1}` : image.alt}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="gallery-fullscreen-overlay">
          <div className={`fullscreen-container ${isZoomed ? 'zoomed' : ''}`}>
            <img
              src={typeof currentImage === 'string' ? currentImage : currentImage?.src}
              alt={typeof currentImage === 'string' ? `Image ${currentIndex + 1}` : currentImage?.alt}
              className="fullscreen-image"
              onClick={toggleZoom}
            />

            {/* Fullscreen Controls */}
            <div className="fullscreen-controls">
              <button 
                className="fullscreen-btn"
                onClick={toggleZoom}
                aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
              >
                <ZoomIn size={20} />
              </button>
              <button 
                className="fullscreen-btn"
                onClick={downloadImage}
                aria-label="Download image"
              >
                <Download size={20} />
              </button>
              <button 
                className="fullscreen-btn close-btn"
                onClick={toggleFullscreen}
                aria-label="Close fullscreen"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <button 
                  className="fullscreen-nav-btn fullscreen-nav-prev"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="fullscreen-nav-btn fullscreen-nav-next"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Fullscreen Counter */}
            {images.length > 1 && (
              <div className="fullscreen-counter">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Fullscreen Thumbnails */}
            {images.length > 1 && (
              <div className="fullscreen-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`fullscreen-thumbnail ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => goToImage(index)}
                  >
                    <img
                      src={typeof image === 'string' ? image : image.src}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;