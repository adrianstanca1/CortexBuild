/**
 * LazyImage Component
 * Implements lazy loading for images with IntersectionObserver
 * Supports WebP format with fallbacks and blur-up effect
 */

import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  srcWebP?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  containerClassName?: string;
  blurUp?: boolean;
}

/**
 * LazyImage Component
 * 
 * Features:
 * - Native lazy loading with IntersectionObserver fallback
 * - WebP format support with PNG fallback
 * - Blur-up effect for better perceived performance
 * - Error handling with fallback image
 * - Responsive image support
 * 
 * @example
 * ```tsx
 * <LazyImage
 *   src="image.png"
 *   srcWebP="image.webp"
 *   alt="Description"
 *   placeholder="data:image/svg+xml,%3Csvg..."
 *   blurUp={true}
 * />
 * ```
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  srcWebP,
  alt,
  placeholder,
  onLoad,
  onError,
  className = '',
  containerClassName = '',
  blurUp = true,
  ...imgProps
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if browser supports IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // Fallback: load image immediately
      setImageSrc(srcWebP || src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, load it
            setImageSrc(srcWebP || src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [src, srcWebP]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    // Try fallback image if WebP failed
    if (srcWebP && imageSrc === srcWebP) {
      setImageSrc(src);
    }
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {/* Placeholder/blur-up effect */}
      {blurUp && placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover blur-sm ${className}`}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <picture>
        {srcWebP && (
          <source srcSet={imageSrc === srcWebP ? srcWebP : ''} type="image/webp" />
        )}
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          {...imgProps}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Failed to load image
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * LazyImageWithFallback Component
 * Provides a fallback UI while image is loading
 */
export const LazyImageWithFallback: React.FC<LazyImageProps & { fallback?: React.ReactNode }> = ({
  fallback,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && fallback && (
        <div className="absolute inset-0 z-10">
          {fallback}
        </div>
      )}
      <LazyImage
        {...props}
        onLoad={() => {
          setIsLoading(false);
          props.onLoad?.();
        }}
      />
    </div>
  );
};

export default LazyImage;

