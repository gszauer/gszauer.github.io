/**
 * Search module for handling search functionality
 */

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  
  // Set up search input event listener
  searchInput.addEventListener('input', handleSearch);
  
  // Focus the search input on page load
  setTimeout(() => {
    searchInput.focus();
  }, 300);
}

/**
 * Handle search input changes
 * @param {Event} event - Input event
 */
function handleSearch(event) {
  const searchText = event.target.value;
  
  // Find active tag if any
  const activeTagElement = document.querySelector('.tag.active');
  const activeTag = activeTagElement ? activeTagElement.getAttribute('data-tag') : '';
  
  // Filter and render emojis
  renderFilteredEmojis(searchText, activeTag);
}

/**
 * Clear search and filters
 */
function clearSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  
  // Remove active class from all tags
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  
  // Reset to show all emojis
  renderFilteredEmojis('', '');
}