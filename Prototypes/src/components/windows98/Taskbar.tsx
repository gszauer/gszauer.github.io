import React, { useState } from 'react';
import { useDesktop } from '../../context/DesktopContext';
import { AppWindowIcon as WindowsIcon } from 'lucide-react';
import Clock from './Clock';
import StartMenu from './StartMenu';

const Taskbar: React.FC = () => {
  const { openWindows, activeWindowId, setActiveWindow } = useDesktop();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleTaskButtonClick = (windowId: string) => {
    const window = openWindows.find(w => w.id === windowId);
    if (window?.isMinimized) {
      // Unminimize and activate
      openWindows.forEach(w => {
        if (w.id === windowId) {
          w.isMinimized = false;
        }
      });
    }
    setActiveWindow(windowId);
  };

  return (
    <div className="win98-taskbar absolute bottom-0 left-0 right-0 h-10 flex items-center p-1 z-50">
      <div className="relative">
        <button 
          className={`win98-start-button flex items-center px-2 h-7 ${isStartMenuOpen ? 'active' : ''}`}
          onClick={toggleStartMenu}
        >
          <WindowsIcon className="mr-1 w-4 h-4" />
          <span className="font-bold text-sm">Start</span>
        </button>
        
        <StartMenu isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} />
      </div>
      
      <div className="win98-separator mx-1 h-7"></div>
      
      <div className="flex-1 flex items-center space-x-1 overflow-x-auto px-1">
        {openWindows.map((window) => (
          <button
            key={window.id}
            className={`h-7 px-2 text-sm flex-shrink-0 ${
              window.id === activeWindowId ? 'win98-button active' : 'win98-button'
            }`}
            onClick={() => handleTaskButtonClick(window.id)}
          >
            <span className="truncate max-w-48">{window.title}</span>
          </button>
        ))}
      </div>
      
      <div className="win98-separator mx-1 h-7"></div>
      
      <div className="w-20">
        <Clock />
      </div>
    </div>
  );
};

export default Taskbar;