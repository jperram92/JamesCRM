import React, { useRef, useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const SignaturePad = ({ onChange, initialValue }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      setCtx(context);
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Set line style
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#000';
      
      // Load initial signature if provided
      if (initialValue) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
          setHasSignature(true);
        };
        img.src = initialValue;
      }
    }
  }, [initialValue]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && ctx) {
        // Save current drawing
        const imageData = canvas.toDataURL();
        
        // Resize canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Restore drawing
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = imageData;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ctx]);

  // Convert mouse/touch position to canvas coordinates
  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    // Handle both mouse and touch events
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Start drawing
  const startDrawing = (event) => {
    const { x, y } = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  // Draw
  const draw = (event) => {
    if (!isDrawing) return;
    
    const { x, y } = getCoordinates(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Notify parent component of change
    const canvas = canvasRef.current;
    onChange(canvas.toDataURL());
  };

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
      
      // Notify parent component of change
      const canvas = canvasRef.current;
      onChange(canvas.toDataURL());
    }
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div 
        className="border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 relative"
        style={{ height: '150px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            Sign here
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-outline btn-sm flex items-center"
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
