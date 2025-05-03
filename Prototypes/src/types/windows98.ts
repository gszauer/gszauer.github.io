export interface DesktopIconProps {
  id: string;
  title: string;
  icon: string;
  type: 'folder' | 'application';
  position: { x: number; y: number };
  onDoubleClick: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  type: 'folder';
  items?: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  link: string;
  thumbnail?: string;
}

export interface WindowProps {
  id: string;
  title: string;
  isActive: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: React.ReactNode;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
}

export interface DesktopContextType {
  icons: Category[];
  openWindows: WindowState[];
  activeWindowId: string | null;
  selectedIconId: string | null;
  selectIcon: (id: string | null) => void;
  openWindow: (iconId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  setActiveWindow: (windowId: string) => void;
  moveWindow: (windowId: string, position: { x: number; y: number }) => void;
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void;
}

export interface WindowState {
  id: string;
  iconId: string;
  title: string;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}