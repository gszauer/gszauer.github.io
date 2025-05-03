import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import categories from '../data/categories';
import { Category, DesktopContextType, WindowState } from '../types/windows98';

const DesktopContext = createContext<DesktopContextType | null>(null);

export const useDesktop = () => {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within a DesktopProvider');
  }
  return context;
};

interface DesktopProviderProps {
  children: React.ReactNode;
}

export const DesktopProvider: React.FC<DesktopProviderProps> = ({ children }) => {
  const [icons] = useState<Category[]>(categories);
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  const selectIcon = useCallback((id: string | null) => {
    setSelectedIconId(id);
  }, []);

  const openWindow = useCallback((iconId: string) => {
    const icon = icons.find((i) => i.id === iconId);
    
    if (!icon) return;
    
    // Check if window is already open
    const existingWindow = openWindows.find((w) => w.iconId === iconId);
    
    if (existingWindow) {
      // Just focus the window
      setActiveWindowId(existingWindow.id);
      
      // Unminimize if needed
      if (existingWindow.isMinimized) {
        setOpenWindows((prev) =>
          prev.map((w) =>
            w.id === existingWindow.id ? { ...w, isMinimized: false } : w
          )
        );
      }
      return;
    }
    
    // Calculate position with slight offset for each new window
    const offset = openWindows.length * 20;
    const newWindow: WindowState = {
      id: `window-${Date.now()}`,
      iconId,
      title: icon.title,
      isMinimized: false,
      position: { x: 100 + offset, y: 100 + offset },
      size: { width: 600, height: 400 },
    };
    
    setOpenWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  }, [icons, openWindows]);

  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== windowId));
    
    // Set active window to the topmost remaining window
    setActiveWindowId((prevActiveId) => {
      if (prevActiveId === windowId && openWindows.length > 1) {
        // Find the topmost window that isn't the one being closed
        const remainingWindows = openWindows.filter((w) => w.id !== windowId);
        return remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1].id : null;
      }
      return prevActiveId === windowId ? null : prevActiveId;
    });
  }, [openWindows]);

  const minimizeWindow = useCallback((windowId: string) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      )
    );
    
    // Set active window to the next topmost window
    setActiveWindowId((prevActiveId) => {
      if (prevActiveId === windowId && openWindows.length > 1) {
        // Find the topmost window that isn't being minimized
        const visibleWindows = openWindows.filter((w) => w.id !== windowId && !w.isMinimized);
        return visibleWindows.length > 0 ? visibleWindows[visibleWindows.length - 1].id : null;
      }
      return prevActiveId === windowId ? null : prevActiveId;
    });
  }, [openWindows]);

  const setActiveWindow = useCallback((windowId: string) => {
    // Bring window to front by reordering the array
    setOpenWindows((prev) => {
      const windowToActivate = prev.find((w) => w.id === windowId);
      if (!windowToActivate) return prev;
      
      return [
        ...prev.filter((w) => w.id !== windowId),
        windowToActivate
      ];
    });
    
    setActiveWindowId(windowId);
  }, []);

  const moveWindow = useCallback((windowId: string, position: { x: number; y: number }) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, position } : w
      )
    );
  }, []);

  const resizeWindow = useCallback((windowId: string, size: { width: number; height: number }) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, size } : w
      )
    );
  }, []);

  const value = useMemo(() => ({
    icons,
    openWindows,
    activeWindowId, 
    selectedIconId,
    selectIcon,
    openWindow,
    closeWindow,
    minimizeWindow,
    setActiveWindow,
    moveWindow,
    resizeWindow,
  }), [
    icons, 
    openWindows, 
    activeWindowId, 
    selectedIconId,
    selectIcon, 
    openWindow, 
    closeWindow, 
    minimizeWindow, 
    setActiveWindow, 
    moveWindow, 
    resizeWindow
  ]);

  return (
    <DesktopContext.Provider value={value}>
      {children}
    </DesktopContext.Provider>
  );
};