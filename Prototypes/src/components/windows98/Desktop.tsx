import React, { useEffect } from 'react';
import { useDesktop } from '../../context/DesktopContext';
import DesktopIcon from './DesktopIcon';
import Window from './Window';
import Taskbar from './Taskbar';
import PrototypesList from '../prototypes/PrototypesList';
import ReactMarkdown from 'react-markdown';

const Desktop: React.FC = () => {
  const { 
    icons, 
    openWindows, 
    activeWindowId,
    selectedIconId, 
    selectIcon,
    openWindow, 
    closeWindow, 
    minimizeWindow, 
    setActiveWindow,
  } = useDesktop();

  // Handle background click to deselect icons
  const handleBackgroundClick = () => {
    selectIcon(null);
  };

  // Open Apps folder by default
  useEffect(() => {
    const appsIcon = icons.find(icon => icon.id === 'apps');
    if (appsIcon) {
      openWindow(appsIcon.id);
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeWindowId) {
        closeWindow(activeWindowId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeWindowId, closeWindow]);

  const renderWindowContent = (iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (!icon) return null;

    if (icon.type === 'file' && icon.id === 'readme') {
      return (
        <div className="prose prose-sm max-w-none p-4">
          <ReactMarkdown>{icon.content}</ReactMarkdown>
        </div>
      );
    }

    return <PrototypesList items={icon.items || []} />;
  };

  return (
    <div 
      className="win98-desktop relative w-full h-screen overflow-hidden"
      onClick={handleBackgroundClick}
    >
      {/* Desktop Icons */}
      {icons.map((icon, index) => (
        <DesktopIcon
          key={icon.id}
          id={icon.id}
          title={icon.title}
          icon={icon.icon}
          type={icon.type}
          position={{ x: 25, y: 25 + index * 90 }}
          onDoubleClick={openWindow}
          isSelected={selectedIconId === icon.id}
          onSelect={selectIcon}
        />
      ))}
      
      {/* Windows */}
      {openWindows.map((window) => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          isActive={window.id === activeWindowId}
          isMinimized={window.isMinimized}
          position={window.position}
          size={window.size}
          content={renderWindowContent(window.iconId)}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFocus={setActiveWindow}
        />
      ))}
      
      {/* Taskbar */}
      <Taskbar />
    </div>
  );
};

export default Desktop;