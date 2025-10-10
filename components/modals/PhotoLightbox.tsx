import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '../Icons';

// A generic photo object that the lightbox can use
export interface LightboxPhoto {
    url: string;
    caption?: string;
}

interface PhotoLightboxProps {
    photos: LightboxPhoto[];
    startIndex: number;
    onClose: () => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photos, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    
    const goToPrevious = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
    }, [photos.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
    }, [photos.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [goToPrevious, goToNext, onClose]);
    
    if (photos.length === 0) {
        return null;
    }
    
    const currentPhoto = photos[currentIndex];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img src={currentPhoto.url} alt={currentPhoto.caption || `Image ${currentIndex + 1}`} className="shadow-2xl" />
                {currentPhoto.caption && (
                    <div className="modal-caption">{currentPhoto.caption}</div>
                )}
            </div>
            <button aria-label="Close" className="modal-close-btn" onClick={onClose}>
                <XMarkIcon className="w-6 h-6" />
            </button>
            {photos.length > 1 && (
                <>
                    <button aria-label="Previous image" className="modal-nav-btn prev" onClick={e => { e.stopPropagation(); goToPrevious(); }}>
                        <ChevronLeftIcon className="w-8 h-8" />
                    </button>
                    <button aria-label="Next image" className="modal-nav-btn next" onClick={e => { e.stopPropagation(); goToNext(); }}>
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>
                </>
            )}
        </div>
    );
};

export default PhotoLightbox;
