/**
 * Data module for emoji handling
 */

// This will store our emoji data once loaded
let emojiData = [];

// Categories to display in order
const orderedCategories = [
  "Smileys & Emotion",
  "People & Body",
  "Animals & Nature",
  "Food & Drink",
  "Travel & Places",
  "Activities",
  "Objects",
  "Symbols",
  "Flags"
];

/**
 * Load emoji data from JSON file
 * @returns {Promise} Promise that resolves when data is loaded
 */
async function loadEmojiData() {
  try {
    const response = await fetch('data/emojis.json');
    if (!response.ok) {
      throw new Error('Failed to load emoji data');
    }
    
    emojiData = await response.json();
    return emojiData;
  } catch (error) {
    console.error('Error loading emoji data:', error);
    document.querySelector('#categories-container').innerHTML = `
      <div class="empty-state">
        <p>Failed to load emoji data.</p>
        <p>Please try refreshing the page.</p>
      </div>
    `;
    return [];
  }
}

/**
 * Get all unique tags from emoji data
 * @returns {Array} Array of unique tags
 */
function getAllTags() {
  if (!emojiData.length) return [];
  
  // Collect all tags
  const allTags = emojiData.reduce((tags, emoji) => {
    if (emoji.tags && Array.isArray(emoji.tags)) {
      return [...tags, ...emoji.tags];
    }
    return tags;
  }, []);
  
  // Count tag occurrences
  const tagCount = allTags.reduce((count, tag) => {
    count[tag] = (count[tag] || 0) + 1;
    return count;
  }, {});
  
  // Sort by occurrences (most common first)
  const sortedTags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
  
  // Take top tags (limit to 20 most common)
  return sortedTags.slice(0, 20);
}

/**
 * Get emojis grouped by category
 * @returns {Object} Object with categories as keys and arrays of emojis as values
 */
function getEmojisByCategory() {
  if (!emojiData.length) return {};
  
  // Group emojis by category
  const categorized = emojiData.reduce((groups, emoji) => {
    const category = emoji.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(emoji);
    return groups;
  }, {});
  
  // Sort categories using the ordered list
  const ordered = {};
  orderedCategories.forEach(category => {
    if (categorized[category]) {
      ordered[category] = categorized[category];
    }
  });
  
  // Add any categories not in the ordered list
  Object.keys(categorized).forEach(category => {
    if (!ordered[category]) {
      ordered[category] = categorized[category];
    }
  });
  
  return ordered;
}

/**
 * Filter emojis based on search text and active tag
 * @param {string} searchText - Text to search for
 * @param {string} activeTag - Currently active tag filter
 * @returns {Object} Filtered emojis grouped by category
 */
function filterEmojis(searchText, activeTag) {
  if (!emojiData.length) return {};
  
  const searchLower = searchText.toLowerCase().trim();
  
  // Filter emojis
  const filtered = emojiData.filter(emoji => {
    // If an active tag is set, only show emojis with that tag
    if (activeTag && (!emoji.tags || !emoji.tags.includes(activeTag))) {
      return false;
    }
    
    // If no search text, show all emojis that match the tag filter
    if (!searchLower) {
      return true;
    }
    
    // Search in description
    if (emoji.description && emoji.description.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in category
    if (emoji.category && emoji.category.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in aliases
    if (emoji.aliases && Array.isArray(emoji.aliases) && 
        emoji.aliases.some(alias => alias.toLowerCase().includes(searchLower))) {
      return true;
    }
    
    // Search in tags
    if (emoji.tags && Array.isArray(emoji.tags) && 
        emoji.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
      return true;
    }
    
    return false;
  });
  
  // Group filtered emojis by category
  const categorized = filtered.reduce((groups, emoji) => {
    const category = emoji.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(emoji);
    return groups;
  }, {});
  
  // Sort categories using the ordered list
  const ordered = {};
  orderedCategories.forEach(category => {
    if (categorized[category] && categorized[category].length > 0) {
      ordered[category] = categorized[category];
    }
  });
  
  // Add any categories not in the ordered list
  Object.keys(categorized).forEach(category => {
    if (!ordered[category] && categorized[category].length > 0) {
      ordered[category] = categorized[category];
    }
  });
  
  return ordered;
}