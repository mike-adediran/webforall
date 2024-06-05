// Initial magnification level, contrast mode, and TTS enabled state
let magnificationLevel = 1;
let highContrast = false;
let showAltText = false;
let enableTTS = false;
const originalFontSizes = new Map(); // store original font sizes

// Store the original font size of each element
function storeOriginalFontSizes() {
  const elements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, a, span, div, li, td, th, button, label"
  );
  elements.forEach(element => {
    const originalFontSize = window.getComputedStyle(element).getPropertyValue('font-size');
    originalFontSizes.set(element, parseFloat(originalFontSize));
  });
}

// Call this function once when the script runs
storeOriginalFontSizes();

// Function to receive messages from popup.html
chrome.runtime.onMessage.addListener((message) => {
  console.log("Message received in content.js:", message);
  if (message.type === "updateMagnification") {
    magnificationLevel = parseFloat(message.level);
    updateFontSize(magnificationLevel);
  } else if (message.type === "toggleAltText") {
    showAltText = message.enabled;
    toggleAltText(showAltText);
  } else if (message.type === "updateContrast") {
    highContrast = message.highContrast;
    updateContrastMode(highContrast);
  } else if (message.type === "toggleTTS") {
    enableTTS = message.enabled;
    console.log("TTS enabled:", enableTTS);
    toggleTTS(enableTTS);

  }
});

// Update text size based on magnification level
function updateFontSize(magnificationLevel) {
  const elements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, a, span, div, li, td, th, button, label"
  );
  elements.forEach(element => {
    const originalFontSize = originalFontSizes.get(element);
    if (originalFontSize) {
      element.style.fontSize = `${originalFontSize * magnificationLevel}px`;
      console.log(`Updated ${element.tagName} element to ${element.style.fontSize}`);
    }
  });
}

// Update contrast mode
function updateContrastMode(highContrast) {
  if (highContrast) {
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    document.body.style.backgroundColor = "#000";
  } else {
    document.body.style.filter = "";
    document.body.style.backgroundColor = "";
  }
}

// Function to enable alt text
function toggleAltText(enabled) {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (enabled) {
      img.addEventListener('mouseover', showTooltip);
      img.addEventListener('mouseout', hideTooltip);
    } else {
      img.removeEventListener('mouseover', showTooltip);
      img.removeEventListener('mouseout', hideTooltip);
    }
  });
}

function showTooltip(event) {
  const img = event.target;
  const altText = img.getAttribute('alt');
  const tooltip = document.createElement('div');

  tooltip.classList.add('alt-tooltip');
  tooltip.textContent = altText ? altText : 'No alternative text available';
  document.body.appendChild(tooltip);

  const rect = img.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

  //speak the alt text if TTS is enabled
  if (enableTTS && altText) {
    speechSynthesis.cancel(); //cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance (altText);
    speechSynthesis.speak(utterance);
  }
}

function hideTooltip() {
  const tooltip = document.querySelector('.alt-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Enable or disable Text-to-Speech
function toggleTTS(enabled) {
  console.log("TTS enabled:", enabled); //adding this line for logging
  if (enabled) {
    document.addEventListener('mouseup', handleTextSelection);
  } else {
    document.removeEventListener('mouseup', handleTextSelection);
  }
}

// Handle text selection and speak the selected text
function handleTextSelection() {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText && enableTTS) {
    //cancel any ongoing speech
    speechSynthesis.cancel();

    //speak newly selected text
    const utterance = new SpeechSynthesisUtterance(selectedText);
    speechSynthesis.speak(utterance);
  }
}

// Debounce function to avoid repeated calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
