/**
 * UI module for handling display of emoji data
 */

/**
 * Render the popular tags
 * @param {Array} tags - Array of tag strings
 */
function renderTags(tags) {
  const tagsContainer = document.getElementById('tags-list');
  
  if (!tags || !tags.length) {
    tagsContainer.innerHTML = '<p>No tags available</p>';
    return;
  }
  
  // Create HTML for each tag
  const tagsHTML = tags.map(tag => `
    <span class="tag" data-tag="${tag}">${tag}</span>
  `).join('');
  
  tagsContainer.innerHTML = tagsHTML;
  
  // Add event listeners to each tag
  document.querySelectorAll('.tag').forEach(tagElement => {
    tagElement.addEventListener('click', () => {
      // Toggle active state
      const wasActive = tagElement.classList.contains('active');
      
      // Remove active class from all tags
      document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
      
      // If the tag wasn't active before, make it active
      if (!wasActive) {
        tagElement.classList.add('active');
        // Filter emojis based on selected tag
        const selectedTag = tagElement.getAttribute('data-tag');
        renderFilteredEmojis('', selectedTag);
      } else {
        // Otherwise, clear filter and show all
        renderFilteredEmojis('', '');
      }
    });
  });
}

/**
 * Render the emoji categories
 * @param {Object} emojisByCategory - Object with categories as keys and arrays of emojis as values
 */
function renderCategories(emojisByCategory) {
  const categoriesContainer = document.getElementById('categories-container');
  
  if (!emojisByCategory || Object.keys(emojisByCategory).length === 0) {
    categoriesContainer.innerHTML = `
      <div class="empty-state">
        <p>No emojis found.</p>
        <p>Try adjusting your search or filter.</p>
      </div>
    `;
    return;
  }
  
  let categoriesHTML = '';
  
  // Create HTML for each category and its emojis
  Object.keys(emojisByCategory).forEach(category => {
    const emojis = emojisByCategory[category];
    
    if (emojis.length === 0) return;
    
    categoriesHTML += `
      <div class="category">
        <h2 class="category-name">${category}</h2>
        <div class="emoji-grid">
          ${emojis.map(emoji => `
            <div class="emoji-item" data-emoji="${emoji.emoji}">
              ${emoji.emoji}
              <div class="emoji-tooltip">${emoji.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  categoriesContainer.innerHTML = categoriesHTML;
  
  // Add click event to each emoji for copying
  document.querySelectorAll('.emoji-item').forEach(emoji => {
    emoji.addEventListener('click', () => {
      const emojiText = emoji.getAttribute('data-emoji');
      copyToClipboard(emojiText);
      showToast();
      
      // Add a temporary class for animation
      emoji.classList.add('copied');
      setTimeout(() => {
        emoji.classList.remove('copied');
      }, 800);
    });
  });
}

/**
 * Render emojis filtered by search text and/or tag
 * @param {string} searchText - Text to search for
 * @param {string} activeTag - Currently active tag filter
 */
function renderFilteredEmojis(searchText, activeTag) {
  const filteredEmojis = filterEmojis(searchText, activeTag);
  renderCategories(filteredEmojis);
}

/**
 * Show the toast notification
 */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  
  // Hide toast after 2 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}