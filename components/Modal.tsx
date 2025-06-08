
import React, { ReactNode, useState, useEffect } from 'react';
import { XIcon } from './IconComponents.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mount modal and prepare for animation
      setShowModal(true);
    } else {
      // If closing, start fade out, then unmount after transition
      // For simplicity here, we'll just immediately hide if not animating out
      // A more complex solution would handle the out-animation before setting isOpen to false externally
      setShowModal(false); 
    }
  }, [isOpen]);
  
  // Delay applying 'open' animation classes until component is mounted and ready
  const [startAnimation, setStartAnimation] = useState(false);
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => setStartAnimation(true), 10); // Small delay for CSS transition
      return () => clearTimeout(timer);
    } else {
      setStartAnimation(false);
    }
  }, [showModal]);


  if (!isOpen && !showModal) return null; // Fully hidden

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl' // Removed trailing comma here
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out ${startAnimation && isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} p-6 transform transition-all duration-300 ease-in-out ${startAnimation && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-teal-700">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100"
            aria-label="Kapat"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};