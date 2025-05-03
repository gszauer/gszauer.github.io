import React, { useEffect, useRef } from 'react';
import { 
  Github,
  MessageCircle,
  Gamepad,
  AppWindow,
  Power
} from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleShutdown = () => {
    window.location.href = 'https://gabormakesgames.com';
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="win98-start-menu absolute bottom-full left-0 mb-0.5 w-64 z-50"
    >
      <div className="flex">
        <div className="win98-start-sidebar w-10 py-2 flex flex-col items-center h-full">
          <div className="flex flex-col justify-between h-full w-full">
            <div className="transform -rotate-90 text-xl font-bold whitespace-nowrap absolute" 
                 style={{ transformOrigin: 'bottom left', bottom: '100px', left: '8px' }}>
              Prototypes
            </div>
            <div className="p-1">
              <div className="text-xs text-center mb-1">Win98</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 py-1">
          <div className="p-1">
            <a href="https://github.com/gszauer/" target="_blank" rel="noopener noreferrer"
               className="hover:bg-blue-900 hover:text-white p-1 flex items-center cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center mr-2">
                <Github size={20} />
              </div>
              <span className="text-sm">GitHub</span>
            </a>
            
            <a href="https://bsky.app/profile/gszauer.bsky.social" target="_blank" rel="noopener noreferrer"
               className="hover:bg-blue-900 hover:text-white p-1 flex items-center cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center mr-2">
                <MessageCircle size={20} />
              </div>
              <span className="text-sm">Bluesky</span>
            </a>
            
            <div className="hover:bg-blue-900 hover:text-white p-1 flex items-center cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center mr-2">
                <Gamepad size={20} />
              </div>
              <span className="text-sm">Games</span>
            </div>
            
            <div className="hover:bg-blue-900 hover:text-white p-1 flex items-center cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center mr-2">
                <AppWindow size={20} />
              </div>
              <span className="text-sm">Apps</span>
            </div>
            
            <div className="win98-separator my-1"></div>
            
            <div className="hover:bg-blue-900 hover:text-white p-1 flex items-center cursor-pointer"
                 onClick={handleShutdown}>
              <div className="w-8 h-8 flex items-center justify-center mr-2">
                <Power size={20} />
              </div>
              <span className="text-sm">Shut Down...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;