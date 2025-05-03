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
      <span style="font-size: 32px">${category.icon}</span>
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
      
      // Clear any existing timeout
      if (touchTimeout) clearTimeout(touchTimeout);
      
      // Set a new timeout
      touchTimeout = setTimeout(() => {
        createWindow(category);
      }, 100); // Short delay to prevent accidental opens
    });
    
    icon.addEventListener('touchend', (e) => {
      e.preventDefault();
    });
    
    desktopIcons.appendChild(icon);
  });
}

// Windows
function createWindow(category) {
  const windowId = Date.now().toString();
  const windowElement = document.createElement('div');
  windowElement.className = 'window';
  windowElement.dataset.windowId = windowId;
  
  const offset = windows.length * 20;
  windowElement.style.left = `${100 + offset}px`;
  windowElement.style.top = `${100 + offset}px`;
  windowElement.style.width = '600px';
  windowElement.style.height = '400px';
  
  let content = '';
  if (category.type === 'file') {
    content = `<div class="markdown-content">${category.content}</div>`;
  } else {
    content = `
      <div class="folder-grid">
        ${category.items.map(item => `
          <a href="${item.link}" class="folder-item" target="_blank">
            <span style="font-size: 32px">${item.icon}</span>
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
}

function toggleMaximize(windowId) {
  const window = windows.find(w => w.id === windowId);
  if (!window) return;

  const taskbarHeight = 28;
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
  
  const dragMouseDown = (e) => {
    if (e.target.closest('.window-button') || e.target.closest('.resize-handle')) return;
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    document.addEventListener('mousemove', elementDrag);
    document.addEventListener('mouseup', closeDragElement);
    
    setActiveWindow(element.dataset.windowId);
  };
  
  const elementDrag = (e) => {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    const newTop = element.offsetTop - pos2;
    const newLeft = element.offsetLeft - pos1;
    
    // Keep window within viewport bounds
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = document.documentElement.clientHeight - 28 - element.offsetHeight; // Subtract taskbar height
    
    element.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
    element.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
  };
  
  const closeDragElement = () => {
    document.removeEventListener('mousemove', elementDrag);
    document.removeEventListener('mouseup', closeDragElement);
  };
  
  handle.addEventListener('mousedown', dragMouseDown);
}

// Resizable Windows
function makeResizable(element) {
  const minWidth = 200;
  const minHeight = 150;
  const handles = element.querySelectorAll('.resize-handle');
  
  handles.forEach(handle => {
    handle.addEventListener('mousedown', initResize);
  });

  function initResize(e) {
    e.preventDefault();
    e.stopPropagation();

    const direction = e.target.classList[1];
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(getComputedStyle(element).width, 10);
    const startHeight = parseInt(getComputedStyle(element).height, 10);
    const startLeft = element.offsetLeft;
    const startTop = element.offsetTop;

    const taskbarHeight = 28;
    const maxWidth = window.innerWidth - startLeft;
    const maxHeight = document.documentElement.clientHeight - taskbarHeight - startTop;

    function resize(e) {
      if (direction.includes('e')) {
        const width = Math.min(startWidth + (e.clientX - startX), maxWidth);
        if (width >= minWidth) {
          element.style.width = width + 'px';
        }
      }
      if (direction.includes('s')) {
        const height = Math.min(startHeight + (e.clientY - startY), maxHeight);
        if (height >= minHeight) {
          element.style.height = height + 'px';
        }
      }
      if (direction.includes('w')) {
        const width = startWidth - (e.clientX - startX);
        if (width >= minWidth) {
          element.style.width = width + 'px';
          element.style.left = startLeft + (e.clientX - startX) + 'px';
        }
      }
      if (direction.includes('n')) {
        const height = startHeight - (e.clientY - startY);
        if (height >= minHeight) {
          element.style.height = height + 'px';
          element.style.top = startTop + (e.clientY - startY) + 'px';
        }
      }
    }

    function stopResize() {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    }

    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  }
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