import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300,
  width = 'auto',
  dark = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  // Calculate position
  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        y = targetRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        y = targetRect.bottom + 8;
        break;
      case 'left':
        x = targetRect.left - tooltipRect.width - 8;
        y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = targetRect.right + 8;
        y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        break;
      default:
        x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        y = targetRect.top - tooltipRect.height - 8;
    }

    // Ensure tooltip stays within viewport
    x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

    setCoords({ x, y });
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after a small delay to ensure tooltip is rendered
      setTimeout(calculatePosition, 10);
    }, delay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Recalculate position on window resize
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isVisible]);

  // Get arrow position class
  const getArrowClass = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-900 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-900 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-t-transparent border-r-transparent border-b-transparent';
      case 'right':
        return 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-t-transparent border-l-transparent border-b-transparent';
      default:
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-900 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div 
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      ref={targetRef}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: coords.y,
              left: coords.x,
              width: width === 'auto' ? 'auto' : `${width}px`,
              zIndex: 9999,
            }}
            className={`px-3 py-2 rounded text-sm font-medium ${dark ? 'bg-gray-900 text-white dark:bg-gray-700' : 'bg-white text-gray-900 border border-gray-200 shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700'}`}
          >
            {content}
            <div className={`absolute w-0 h-0 border-4 ${getArrowClass()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
