import React from 'react';
import { Folder, MonitorIcon } from 'lucide-react';
import { DesktopIconProps } from '../../types/windows98';

const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  title,
  icon,
  onDoubleClick,
  isSelected,
  onSelect,
  position
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(id);
  };

  return (
    <div
      className={`win98-desktop-icon absolute flex flex-col items-center w-20 p-2 cursor-pointer ${
        isSelected ? 'win98-desktop-icon selected' : ''
      }`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="mb-1">
        {icon === 'folder' ? (
          <Folder className="w-10 h-10" strokeWidth={1.5} />
        ) : (
          <MonitorIcon className="w-10 h-10" strokeWidth={1.5} />
        )}
      </div>
      <div className="text-center text-xs whitespace-normal">
        {title}
      </div>
    </div>
  );
};

export default DesktopIcon;