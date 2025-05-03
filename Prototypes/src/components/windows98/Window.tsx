import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { WindowProps } from '../../types/windows98';

const Window: React.FC<WindowProps> = ({
  id,
  title,
  isActive,
  isMinimized,
  position,
  size,
  content,
  onClose,
  onMinimize,
  onFocus
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) {
      onFocus(id);
    }

    if ((e.target as HTMLElement).closest('.window-titlebar')) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - (size.width || 400);
      const maxY = window.innerHeight - (size.height || 300);
      
      setCurrentPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={`win98-window absolute ${isDragging ? 'cursor-move' : ''} overflow-hidden`}
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: isActive ? 10 : 5
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`win98-window-inner w-full h-full flex flex-col`}>
        <div className={`window-titlebar win98-titlebar ${!isActive ? 'inactive' : ''} h-7 flex items-center justify-between px-1 select-none cursor-move`}>
          <div className="flex items-center">
            <span className="text-sm font-normal ml-1">{title}</span>
          </div>
          <div className="flex">
            <button 
              className="win98-button w-5 h-5 flex items-center justify-center mr-1"
              onClick={() => onMinimize(id)}
            >
              <Minus className="w-3 h-3" />
            </button>
            <button className="win98-button w-5 h-5 flex items-center justify-center mr-1">
              <Square className="w-3 h-3" />
            </button>
            <button 
              className="win98-button w-5 h-5 flex items-center justify-center"
              onClick={() => onClose(id)}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-1 bg-white">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Window;