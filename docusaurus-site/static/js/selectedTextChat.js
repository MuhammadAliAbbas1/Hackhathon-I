let selectedTextGlobal = '';

// Create the Ask AI button element
const askAiButton = document.createElement('div');
askAiButton.id = 'ask-ai-button';
askAiButton.textContent = 'Ask AI';

// Styles - Using absolute to work with page coordinates
Object.assign(askAiButton.style, {
  position: 'absolute', 
  display: 'none',
  backgroundColor: '#3b82f6',
  color: 'white',
  borderRadius: '8px',
  padding: '8px 16px',
  cursor: 'pointer',
  zIndex: '2147483647', // Maximum possible z-index
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  fontWeight: '500',
  pointerEvents: 'auto'
});

document.body.appendChild(askAiButton);

// Improved check: Focus on preventing sidebar/nav triggers rather than strictly limiting to "main"
function isValidSelectionArea(element) {
  const forbiddenSelectors = ['nav', 'aside', '.theme-doc-sidebar-container', 'footer'];
  while (element && element !== document.body) {
    if (forbiddenSelectors.some(sel => element.matches && element.matches(sel))) {
      return false;
    }
    element = element.parentElement;
  }
  return true;
}

document.addEventListener('mouseup', function(event) {
  // Small delay to let the browser finish the selection internal state
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 20) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const element = range.commonAncestorContainer.parentElement;

      if (!isValidSelectionArea(element)) {
        askAiButton.style.display = 'none';
        return;
      }

      selectedTextGlobal = selectedText;

      // Positioning using BoundingClientRect + Scroll for pinpoint accuracy
      askAiButton.style.left = `${rect.left + window.scrollX + (rect.width / 2) - 40}px`;
      askAiButton.style.top = `${rect.top + window.scrollY - 45}px`;
      askAiButton.style.display = 'block';
    }
  }, 10);
});

askAiButton.addEventListener('mousedown', function(e) {
  e.preventDefault(); // Prevents selection from clearing before the click fires
});

askAiButton.addEventListener('click', function() {
  console.log('Selected Text for AI:', selectedTextGlobal);
  askAiButton.style.display = 'none';
  window.getSelection().removeAllRanges();
});

document.addEventListener('mousedown', function(event) {
  if (event.target !== askAiButton) {
    askAiButton.style.display = 'none';
  }
});