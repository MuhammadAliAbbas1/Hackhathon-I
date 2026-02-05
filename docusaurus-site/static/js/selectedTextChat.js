// Global variable to store selected text
let selectedTextGlobal = '';

// Create the Ask AI button element
const askAiButton = document.createElement('div');
askAiButton.id = 'ask-ai-button';
askAiButton.textContent = 'Ask AI';
askAiButton.style.position = 'fixed';
askAiButton.style.display = 'none'; // Initially hidden
askAiButton.style.backgroundColor = '#3b82f6'; // Blue background
askAiButton.style.color = 'white'; // White text
askAiButton.style.borderRadius = '8px'; // Rounded corners
askAiButton.style.padding = '8px 16px'; // Padding
askAiButton.style.cursor = 'pointer'; // Pointer cursor
askAiButton.style.zIndex = '9999'; // High z-index
askAiButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; // Small shadow
askAiButton.style.fontFamily = 'system-ui, -apple-system, sans-serif';
askAiButton.style.fontSize = '14px';
askAiButton.style.fontWeight = '500';

// Add hover effect
askAiButton.addEventListener('mouseenter', () => {
  askAiButton.style.opacity = '0.9';
});
askAiButton.addEventListener('mouseleave', () => {
  askAiButton.style.opacity = '1';
});

// Append the button to the body
document.body.appendChild(askAiButton);

// Function to check if the selection is inside main article content
function isInMainContent(element) {
  // Check if the selection is within main article content
  const mainSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.markdown',
    '.theme-doc-markdown',
    '.container',
    '.col',
    '[data-testid="doc-markdown"]'
  ];

  // Check if the element or any of its parents match main content selectors
  while (element && element !== document) {
    if (mainSelectors.some(selector => element.matches && element.matches(selector))) {
      return true;
    }
    element = element.parentElement;
  }

  return false;
}

// Mouseup event listener to detect text selection
document.addEventListener('mouseup', function(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // Check if selection is in main content area
  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  const commonAncestorContainer = range ? range.commonAncestorContainer : null;
  const element = commonAncestorContainer ?
    (commonAncestorContainer.nodeType === Node.ELEMENT_NODE ?
      commonAncestorContainer :
      commonAncestorContainer.parentElement) :
    null;

  if (!isInMainContent(element)) {
    // Hide button if selection is not in main content
    askAiButton.style.display = 'none';
    return;
  }

  // Show/hide button based on selection length
  if (selectedText.length > 20) {
    // Position the button near the mouse cursor
    askAiButton.style.left = (event.pageX + 10) + 'px';
    askAiButton.style.top = (event.pageY - 40) + 'px';
    askAiButton.style.display = 'block';
  } else {
    askAiButton.style.display = 'none';
  }
});

// Click event listener for the Ask AI button
askAiButton.addEventListener('click', function() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // Store the selected text in global variable
  selectedTextGlobal = selectedText;

  // Console log the selected text
  console.log('Selected Text:', selectedText);

  // Hide the button after clicking
  askAiButton.style.display = 'none';

  // Clear the selection
  window.getSelection().removeAllRanges();
});

// Hide button when clicking elsewhere
document.addEventListener('mousedown', function(event) {
  if (event.target !== askAiButton) {
    askAiButton.style.display = 'none';
  }
});