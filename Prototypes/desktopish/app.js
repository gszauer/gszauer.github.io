let activeWindow = null;
let windows = [];
let selectedIcon = null;
let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initialize desktop
function init() {
  createDesktopIcons();
  updateClock();
  setInterval(updateClock, 1000);
  setupStartMenu();
  setupGlobalListeners();
  setupDarkMode();
  
  // Open Games folder by default
  const gamesCategory = categories.find(c => c.id === 'games');
  if (gamesCategory) {
    openWindow(gamesCategory);
  }
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
}

function createDesktopIcons() {
  const desktopIcons = document.getElementById('desktop-icons');
  
  // Add README.md first
  const readmeIcon = categories.find(c => c.id === 'readme');
  if (readmeIcon) {
    const icon = createIconElement(readmeIcon, 0);
    desktopIcons.appendChild(icon);
  }
  
  // Add other icons
  categories
    .filter(category => category.id !== 'readme')
    .forEach((category, index) => {
      const icon = createIconElement(category, index + 1);
      desktopIcons.appendChild(icon);
    });
}

function createIconElement(category, index) {
  const icon = document.createElement('div');
  icon.className = 'desktop-icon';
  icon.innerHTML = `
    <img src="${category.icon}" alt="${category.title}">
    <span>${category.title}</span>
  `;
  icon.style.left = '20px';
  icon.style.top = `${20 + index * 80}px`;
  
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    selectIcon(icon, category.id);
  });
  
  icon.addEventListener('dblclick', () => {
    openWindow(category);
  });
  
  return icon;
}

function selectIcon(iconElement, iconId) {
  if (selectedIcon) {
    selectedIcon.classList.remove('selected');
  }
  selectedIcon = iconElement;
  iconElement.classList.add('selected');
}

function createWindow(category) {
  const win = document.createElement('div');
  win.className = 'window';
  
  // Calculate centered position and 80% size
  const width = Math.min(window.innerWidth * 0.8, 1200);
  const height = window.innerHeight * 0.8;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  
  win.innerHTML = `
    <div class="window-titlebar">
      <span>${category.title}</span>
      <div class="window-controls">
        <button class="window-button minimize">_</button>
        <button class="window-button maximize">□</button>
        <button class="window-button close">×</button>
      </div>
    </div>
    <div class="window-content">
      ${category.type === 'file' ? createMarkdownContent(category.content) : createFolderContent(category.items)}
    </div>
    <div class="resize-handle"></div>
  `;
  
  makeWindowDraggable(win);
  makeWindowResizable(win);
  setupWindowControls(win);
  
  document.body.appendChild(win);
  return win;
}

function makeWindowResizable(windowElement) {
  const handle = windowElement.querySelector('.resize-handle');
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(windowElement.style.width, 10);
    startHeight = parseInt(windowElement.style.height, 10);
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  });

  function handleResize(e) {
    if (!isResizing) return;

    const width = startWidth + (e.clientX - startX);
    const height = startHeight + (e.clientY - startY);

    windowElement.style.width = `${Math.max(300, width)}px`;
    windowElement.style.height = `${Math.max(200, height)}px`;
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  }
}

function createMarkdownContent(content) {
  // Simple markdown to HTML conversion
  return content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>');
}

function createFolderContent(items) {
  if (!items || !items.length) {
    return '<p>No items in this folder.</p>';
  }
  
  const emojis = ['🎮', '🕹️', '💻', '🖥️', '⌨️', '🖱️', '🎲', '🎯', '🎪', '🎨'];
  
  return `
    <div class="folder-grid">
      ${items.map(item => `
        <a href="${item.link}" target="_blank" class="folder-item">
          ${item.icon ? 
            `<img src="${item.icon}" alt="${item.name}" class="item-icon">` :
            `<span class="item-emoji">${emojis[Math.floor(Math.random() * emojis.length)]}</span>`
          }
          <span class="item-name">${item.name}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function makeWindowDraggable(windowElement) {
  const titlebar = windowElement.querySelector('.window-titlebar');
  let isDragging = false;
  let startX;
  let startY;
  let startLeft;
  let startTop;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target === titlebar) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(windowElement.style.left, 10);
      startTop = parseInt(windowElement.style.top, 10);
      activateWindow(windowElement);
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    windowElement.style.left = `${startLeft + dx}px`;
    windowElement.style.top = `${startTop + dy}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function setupWindowControls(windowElement) {
  const minimizeBtn = windowElement.querySelector('.window-button.minimize');
  const maximizeBtn = windowElement.querySelector('.window-button.maximize');
  const closeBtn = windowElement.querySelector('.window-button.close');
  let isMaximized = false;
  let previousSize = null;

  minimizeBtn.addEventListener('click', () => {
    windowElement.style.display = 'none';
    const taskbarButton = Array.from(document.getElementById('taskbar-windows').children)
      .find(btn => btn.textContent === windowElement.querySelector('.window-titlebar span').textContent);
    if (taskbarButton) {
      taskbarButton.classList.add('active');
    }
  });

  maximizeBtn.addEventListener('click', () => {
    if (!isMaximized) {
      previousSize = {
        width: windowElement.style.width,
        height: windowElement.style.height,
        left: windowElement.style.left,
        top: windowElement.style.top
      };
      windowElement.style.width = '100%';
      windowElement.style.height = 'calc(100% - 30px)';
      windowElement.style.left = '0';
      windowElement.style.top = '0';
    } else {
      Object.assign(windowElement.style, previousSize);
    }
    isMaximized = !isMaximized;
  });
  
  closeBtn.addEventListener('click', () => {
    windowElement.remove();
    windows = windows.filter(w => w !== windowElement);
    updateTaskbar();
  });
  
  windowElement.addEventListener('mousedown', () => {
    activateWindow(windowElement);
  });
}

function activateWindow(windowElement) {
  if (activeWindow) {
    activeWindow.classList.remove('active');
    activeWindow.querySelector('.window-titlebar').classList.add('inactive');
  }
  activeWindow = windowElement;
  windowElement.classList.add('active');
  windowElement.querySelector('.window-titlebar').classList.remove('inactive');
  windowElement.style.zIndex = getTopZIndex() + 1;
}

function getTopZIndex() {
  return Math.max(0, ...Array.from(document.querySelectorAll('.window'))
    .map(w => parseInt(w.style.zIndex) || 0));
}

function openWindow(category) {
  const existingWindow = windows.find(w => 
    w.querySelector('.window-titlebar span').textContent === category.title
  );
  
  if (existingWindow) {
    activateWindow(existingWindow);
    return;
  }
  
  const win = createWindow(category);
  windows.push(win);
  activateWindow(win);
  updateTaskbar();
}

function updateTaskbar() {
  const taskbarWindows = document.getElementById('taskbar-windows');
  taskbarWindows.innerHTML = '';
  
  windows.forEach(win => {
    const button = document.createElement('button');
    button.className = 'start-button';
    button.style.marginLeft = '4px';
    button.textContent = win.querySelector('.window-titlebar span').textContent;
    
    if (win.style.display === 'none') {
      button.classList.add('active');
    }
    
    button.addEventListener('click', () => {
      if (win.style.display === 'none') {
        win.style.display = 'block';
        button.classList.remove('active');
      }
      activateWindow(win);
    });
    
    taskbarWindows.appendChild(button);
  });
}

function setupStartMenu() {
  const startButton = document.querySelector('.start-button');
  const startMenu = document.getElementById('start-menu');
  
  startButton.addEventListener('click', () => {
    startMenu.classList.toggle('hidden');
  });
  
  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenu.classList.add('hidden');
    }
  });

  // Setup folder menu items
  document.querySelectorAll('.menu-item[data-folder]').forEach(item => {
    item.addEventListener('click', () => {
      const folderId = item.getAttribute('data-folder');
      const category = categories.find(c => c.id === folderId);
      if (category) {
        openWindow(category);
        startMenu.classList.add('hidden');
      }
    });
  });
}

function setupDarkMode() {
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = `<img src="https://api.iconify.design/lucide:${isDarkMode ? 'sun' : 'moon'}.svg" alt="Toggle dark mode">`;
  
  darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    darkModeToggle.innerHTML = `<img src="https://api.iconify.design/lucide:${isDarkMode ? 'sun' : 'moon'}.svg" alt="Toggle dark mode">`;
  });
  
  const clock = document.getElementById('clock');
  clock.parentNode.insertBefore(darkModeToggle, clock);
  
  // Set initial dark mode state
  document.documentElement.classList.toggle('dark-mode', isDarkMode);
}

function setupGlobalListeners() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.desktop-icon')) return;
    if (selectedIcon) {
      selectedIcon.classList.remove('selected');
      selectedIcon = null;
    }
  });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);