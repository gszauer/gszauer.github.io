/**
 * Clipboard module for copying emojis
 */

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  // Use the Clipboard API if available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .catch(err => {
        console.error('Could not copy emoji: ', err);
        fallbackCopyToClipboard(text);
      });
  } else {
    // Fall back to document.execCommand for older browsers
    fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback method to copy to clipboard
 * @param {string} text - Text to copy
 */
function fallbackCopyToClipboard(text) {
  try {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make the textarea out of viewport
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.select();
    
    // Execute copy command
    const success = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    if (!success) {
      console.error('Fallback copy method failed');
    }
  } catch (err) {
    console.error('Fallback copy method failed: ', err);
  }
}