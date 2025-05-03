/**
 * Main application entry point
 */

// Active tag (global state)
let activeTag = '';

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Load emoji data
    await loadEmojiData();
    
    // Get unique tags
    const allTags = getAllTags();
    
    // Get emojis grouped by category
    const emojisByCategory = getEmojisByCategory();
    
    // Render tags
    renderTags(allTags);
    
    // Render categories
    renderCategories(emojisByCategory);
    
    // Initialize search
    initSearch();
    
  } catch (error) {
    console.error('Error initializing app:', error);
    document.querySelector('#categories-container').innerHTML = `
      <div class="empty-state">
        <p>Something went wrong while loading the application.</p>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);