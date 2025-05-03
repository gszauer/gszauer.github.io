// DOM Elements
const desktop = document.querySelector('.desktop');
const taskbarWindows = document.getElementById('taskbar-windows');
const startButton = document.querySelector('.start-button');
const startMenu = document.getElementById('start-menu');
const clock = document.getElementById('clock');
const desktopIcons = document.getElementById('desktop-icons');
const darkModeToggle = document.getElementById('darkModeToggle');

// State
let windows = [];
let activeWindowId = null;
let selectedIcon = null;
let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let touchTimeout = null;

// Window constraints
const MIN_WINDOW_WIDTH = 200;
const MIN_WINDOW_HEIGHT = 150;
const TASKBAR_HEIGHT = 28;

// Initialize dark mode
function updateDarkMode() {
  document.documentElement.classList.toggle('dark-mode', isDarkMode);
  darkModeToggle.innerHTML = `<img src="desktopish/icons/${isDarkMode ? 'sun' : 'moon'}.svg" alt="Toggle dark mode">`;
}

// Listen for system dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  isDarkMode = e.matches;
  updateDarkMode();
});

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  updateDarkMode();
});

// Initialize clock
function updateClock() {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  clock.textContent = `${hours}:${minutes} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

// Start Menu
startButton.addEventListener('click', () => {
  startMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!startMenu.classList.contains('hidden') && 
      !startButton.contains(e.target) && 
      !startMenu.contains(e.target)) {
    startMenu.classList.add('hidden');
  }
});

// Desktop Icons
function createDesktopIcons() {
  categories.forEach((category, index) => {
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.style.left = '25px';
    icon.style.top = `${25 + index * 90}px`;
    
    icon.innerHTML = `
      <span>${category.icon}</span>
      <span>${category.title}</span>
    `;
    
    // Mouse events
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedIcon) selectedIcon.classList.remove('selected');
      icon.classList.add('selected');
      selectedIcon = icon;
    });
    
    icon.addEventListener('dblclick', () => {
      createWindow(category);
    });
    
    // Touch events
    icon.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (selectedIcon) selectedIcon.classList.remove('selected');
      icon.classList.add('selected');
      selectedIcon = icon;
      
      if (touchTimeout) clearTimeout(touchTimeout);
      
      touchTimeout = setTimeout(() => {
        createWindow(category);
      }, 100);
    });
    
    icon.addEventListener('touchend', (e) => {
      e.preventDefault();
    });
    
    desktopIcons.appendChild(icon);
  });
}

function constrainWindow(windowElement, newPosition = null, newSize = null) {
  const taskbarHeight = TASKBAR_HEIGHT;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight - taskbarHeight;
  
  // Get current dimensions
  const currentRect = windowElement.getBoundingClientRect();
  let width = newSize ? newSize.width : currentRect.width;
  let height = newSize ? newSize.height : currentRect.height;
  let left = newPosition ? newPosition.x : currentRect.left;
  let top = newPosition ? newPosition.y : currentRect.top;
  
  // Ensure minimum size
  width = Math.max(MIN_WINDOW_WIDTH, width);
  height = Math.max(MIN_WINDOW_HEIGHT, height);
  
  // Constrain size to viewport
  width = Math.min(width, viewportWidth);
  height = Math.min(height, viewportHeight);
  
  // Adjust position to keep window in bounds
  left = Math.max(0, Math.min(left, viewportWidth - width));
  top = Math.max(0, Math.min(top, viewportHeight - height));
  
  // Apply constraints
  windowElement.style.width = `${width}px`;
  windowElement.style.height = `${height}px`;
  windowElement.style.left = `${left}px`;
  windowElement.style.top = `${top}px`;
  
  return { width, height, left, top };
}

// Windows
function createWindow(category) {
  const windowId = Date.now().toString();
  const windowElement = document.createElement('div');
  windowElement.className = 'window';
  windowElement.dataset.windowId = windowId;
  
  // Calculate initial position with offset
  const offset = windows.length * 20;
  const initialPosition = {
    x: 100 + offset,
    y: 100 + offset
  };
  
  const initialSize = {
    width: 600,
    height: 400
  };
  
  let content = '';
  if (category.type === 'file') {
    content = `<div class="markdown-content">${category.content}</div>`;
  } else {
    content = `
      <div class="folder-grid">
        ${category.items.map(item => `
          <a href="${item.link}" class="folder-item" target="_blank">
            <span>${item.icon}</span>
            <span class="item-name">${item.name}</span>
          </a>
        `).join('')}
      </div>
    `;
  }
  
  windowElement.innerHTML = `
    <div class="window-titlebar">
      <span>${category.title}</span>
      <div class="window-controls">
        <button class="window-button minimize">_</button>
        <button class="window-button maximize">□</button>
        <button class="window-button close">×</button>
      </div>
    </div>
    <div class="window-content">
      ${content}
    </div>
    <div class="resize-handle n"></div>
    <div class="resize-handle e"></div>
    <div class="resize-handle s"></div>
    <div class="resize-handle w"></div>
    <div class="resize-handle nw"></div>
    <div class="resize-handle ne"></div>
    <div class="resize-handle sw"></div>
    <div class="resize-handle se"></div>
  `;
  
  desktop.appendChild(windowElement);
  
  // Constrain initial size and position
  const constrained = constrainWindow(windowElement, initialPosition, initialSize);
  
  const windowData = {
    id: windowId,
    element: windowElement,
    category: category,
    isMinimized: false,
    isMaximized: false,
    lastPosition: null,
    lastSize: null
  };
  
  windows.push(windowData);
  createTaskbarButton(windowData);
  setActiveWindow(windowId);
  
  // Window Controls
  const closeBtn = windowElement.querySelector('.close');
  const minimizeBtn = windowElement.querySelector('.minimize');
  const maximizeBtn = windowElement.querySelector('.maximize');
  
  closeBtn.addEventListener('click', () => closeWindow(windowId));
  minimizeBtn.addEventListener('click', () => minimizeWindow(windowId));
  maximizeBtn.addEventListener('click', () => toggleMaximize(windowId));
  
  // Make window draggable
  const titlebar = windowElement.querySelector('.window-titlebar');
  makeDraggable(windowElement, titlebar);

  // Make window resizable
  makeResizable(windowElement);

  // Handle window constraints on resize
  window.addEventListener('resize', () => {
    constrainWindow(windowElement);
  });
}

function toggleMaximize(windowId) {
  const window = windows.find(w => w.id === windowId);
  if (!window) return;

  const taskbarHeight = TASKBAR_HEIGHT;
  const availableHeight = document.documentElement.clientHeight - taskbarHeight;

  if (!window.isMaximized) {
    // Save current position and size
    window.lastPosition = {
      left: window.element.style.left,
      top: window.element.style.top
    };
    window.lastSize = {
      width: window.element.style.width,
      height: window.element.style.height
    };

    // Maximize
    window.element.style.left = '0';
    window.element.style.top = '0';
    window.element.style.width = '100%';
    window.element.style.height = `${availableHeight}px`;
    window.isMaximized = true;
  } else {
    // Restore previous position and size
    window.element.style.left = window.lastPosition.left;
    window.element.style.top = window.lastPosition.top;
    window.element.style.width = window.lastSize.width;
    window.element.style.height = window.lastSize.height;
    window.isMaximized = false;
    
    // Ensure window is still in bounds after restore
    constrainWindow(window.element);
  }
}

function createTaskbarButton(windowData) {
  const button = document.createElement('button');
  button.className = 'taskbar-button';
  button.dataset.windowId = windowData.id;
  
  button.innerHTML = `
    <span style="font-family: 'MS Sans Serif', sans-serif;">${windowData.category.title}</span>
  `;
  
  button.addEventListener('click', () => {
    const window = windows.find(w => w.id === windowData.id);
    if (window) {
      if (window.isMinimized) {
        // Restore the window
        window.isMinimized = false;
        window.element.style.display = '';
      } else if (window.id === activeWindowId) {
        // Minimize if clicking the active window's button
        window.isMinimized = true;
        window.element.style.display = 'none';
      }
      setActiveWindow(window.id);
    }
  });
  
  taskbarWindows.appendChild(button);
}

function setActiveWindow(windowId) {
  windows.forEach(w => {
    w.element.style.zIndex = '1';
    w.element.querySelector('.window-titlebar').classList.remove('active');
    taskbarWindows.querySelector(`[data-window-id="${w.id}"]`).classList.remove('active');
  });
  
  const window = windows.find(w => w.id === windowId);
  if (window) {
    window.element.style.zIndex = '2';
    window.element.querySelector('.window-titlebar').classList.add('active');
    if (!window.isMinimized) {
      taskbarWindows.querySelector(`[data-window-id="${windowId}"]`).classList.add('active');
    }
    activeWindowId = windowId;
  }
}

function closeWindow(windowId) {
  const windowIndex = windows.findIndex(w => w.id === windowId);
  if (windowIndex > -1) {
    windows[windowIndex].element.remove();
    taskbarWindows.querySelector(`[data-window-id="${windowId}"]`).remove();
    windows.splice(windowIndex, 1);
    
    if (activeWindowId === windowId) {
      activeWindowId = windows.length ? windows[windows.length - 1].id : null;
      if (activeWindowId) setActiveWindow(activeWindowId);
    }
  }
}

function minimizeWindow(windowId) {
  const window = windows.find(w => w.id === windowId);
  if (window) {
    window.isMinimized = true;
    window.element.style.display = 'none';
    if (activeWindowId === windowId) {
      const nextWindow = windows.find(w => !w.isMinimized && w.id !== windowId);
      activeWindowId = nextWindow ? nextWindow.id : null;
      if (activeWindowId) setActiveWindow(activeWindowId);
    }
  }
}

// Draggable Windows
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  let isDragging = false;
  
  const dragStart = (e) => {
    if (e.target.closest('.window-button') || e.target.closest('.resize-handle')) return;
    
    e.preventDefault();
    isDragging = true;
    
    // Get initial position
    if (e.type === 'mousedown') {
      pos3 = e.clientX;
      pos4 = e.clientY;
    } else if (e.type === 'touchstart') {
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
    }
    
    setActiveWindow(element.dataset.windowId);
    
    // Add move and end event listeners
    if (e.type === 'mousedown') {
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
    } else if (e.type === 'touchstart') {
      document.addEventListener('touchmove', dragMove, { passive: false });
      document.addEventListener('touchend', dragEnd);
    }
  };
  
  const dragMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    // Calculate new position
    if (e.type === 'mousemove') {
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
    } else if (e.type === 'touchmove') {
      pos1 = pos3 - e.touches[0].clientX;
      pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
    }
    
    // Calculate new position
    const newLeft = element.offsetLeft - pos1;
    const newTop = element.offsetTop - pos2;
    
    // Apply constraints
    constrainWindow(element, { x: newLeft, y: newTop });
  };
  
  const dragEnd = () => {
    isDragging = false;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
  };
  
  // Add mouse and touch event listeners
  handle.addEventListener('mousedown', dragStart);
  handle.addEventListener('touchstart', dragStart, { passive: false });
}

// Resizable Windows
function makeResizable(element) {
  const handles = element.querySelectorAll('.resize-handle');
  
  handles.forEach(handle => {
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let isResizing = false;
    
    const resizeStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      
      const direction = handle.classList[1];
      
      // Get initial dimensions
      if (e.type === 'mousedown') {
        startX = e.clientX;
        startY = e.clientY;
      } else if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
      
      startWidth = parseInt(getComputedStyle(element).width, 10);
      startHeight = parseInt(getComputedStyle(element).height, 10);
      startLeft = element.offsetLeft;
      startTop = element.offsetTop;
      
      // Add move and end event listeners
      if (e.type === 'mousedown') {
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', resizeEnd);
      } else if (e.type === 'touchstart') {
        document.addEventListener('touchmove', resize, { passive: false });
        document.addEventListener('touchend', resizeEnd);
      }
      
      function resize(e) {
        if (!isResizing) return;
        e.preventDefault();
        
        let currentX, currentY;
        if (e.type === 'mousemove') {
          currentX = e.clientX;
          currentY = e.clientY;
        } else if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX;
          currentY = e.touches[0].clientY;
        }
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        
        if (direction.includes('e')) {
          newWidth = startWidth + deltaX;
        }
        if (direction.includes('s')) {
          newHeight = startHeight + deltaY;
        }
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          newLeft = startLeft + deltaX;
        }
        if (direction.includes('n')) {
          newHeight = startHeight - deltaY;
          newTop = startTop + deltaY;
        }
        
        // Apply constraints
        constrainWindow(element, { x: newLeft, y: newTop }, { width: newWidth, height: newHeight });
      }
      
      function resizeEnd() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', resizeEnd);
        document.removeEventListener('touchmove', resize);
        document.removeEventListener('touchend', resizeEnd);
      }
    };
    
    // Add mouse and touch event listeners
    handle.addEventListener('mousedown', resizeStart);
    handle.addEventListener('touchstart', resizeStart, { passive: false });
  });
}

// Initialize
createDesktopIcons();
updateDarkMode();

// Open Games folder by default
const gamesCategory = categories.find(c => c.id === 'games');
if (gamesCategory) {
  createWindow(gamesCategory);
}

// Background click deselects icons
desktop.addEventListener('click', (e) => {
  if (e.target === desktop || e.target.classList.contains('desktop')) {
    if (selectedIcon) {
      selectedIcon.classList.remove('selected');
      selectedIcon = null;
    }
  }
});