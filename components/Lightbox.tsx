
import React, { useState, useEffect, ReactNode } from 'react';
import { XIcon } from './IconComponents.tsx';

interface LightboxProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ imageUrl, altText, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const handleBackdropClick = () => {
    onClose();
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.classList.add('lightbox-open');
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('lightbox-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-1 sm:p-2 md:p-4 overflow-auto"
      onClick={handleBackdropClick} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      {/* This div is the viewport for the image. It handles centering when not zoomed, and scrolling when zoomed. */}
      <div 
        className={`relative w-full h-full ${isZoomed ? 'overflow-auto' : 'flex items-center justify-center'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="lightbox-title" className="sr-only">{altText} - Yakınlaştırılmış Görünüm</h2>

        <img 
          src={imageUrl} 
          alt={altText}
          className={`block transition-transform duration-300 ease-in-out
                      ${isZoomed 
                        ? 'scale-[1.75] md:scale-[2.25] cursor-grab active:cursor-grabbing' 
                        : 'object-contain cursor-zoom-in'
                      }`}
          style={{
            maxWidth: isZoomed ? 'none' : '100%', 
            maxHeight: isZoomed ? 'none' : '100%',
            // When zoomed, width/height auto allows the image to take its scaled natural size.
            // When not zoomed, object-contain + maxW/H 100% ensures it fits and maintains aspect ratio.
            width: 'auto',
            height: 'auto',
          }}
          onClick={handleImageClick}
        />
        
        <p className="text-white text-center text-xs mt-2 bg-black/60 p-1.5 rounded absolute bottom-4 left-1/2 -translate-x-1/2 select-none pointer-events-none">
          {isZoomed ? "Küçültmek için görsele tıklayın. Kaydırmak için fare tekerleğini/ok tuşlarını kullanın." : "Yakınlaştırmak için görsele tıklayın."}
        </p>
        
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/80 text-slate-900 p-2 rounded-full shadow-xl hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Kapat"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
