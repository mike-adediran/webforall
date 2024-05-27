document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById("magnification-slider");
  const magnificationLevelSpan = document.getElementById("magnification-level");
  const contrastToggle = document.getElementById("contrast-toggle");
  const altTextCheckbox = document.getElementById("alt-text-checkbox");
  
  // Load saved settings
  chrome.storage.sync.get(['magnificationLevel'], (result) => {
      if (result.magnificationLevel) {
          slider.value = result.magnificationLevel;
          magnificationLevelSpan.textContent = `${result.magnificationLevel}x`;
          slider.setAttribute('aria-valuenow', result.magnificationLevel);
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, { type: "updateMagnification", level: result.magnificationLevel });
          });
      }
      if (result.highContrast !== undefined) {
        contrastToggle.checked = result.highContrast;
        chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {type: "updateContrast", highContrast: result.highContrast });
        });
      }
      if (result.showAltText) {
        altTextCheckbox.checked = result.showAltText;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {type: "toggleAltText", enabled: result.showAltText});
        });
      }
  });
  let debounceTimeout;
  slider.addEventListener("input", (event) => {
      const newMagnificationLevel = parseFloat(event.target.value);
      
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, { type: "updateMagnification", level: newMagnificationLevel });
          });
          magnificationLevelSpan.textContent = `${newMagnificationLevel}x`;
          slider.setAttribute('aria-valuenow', newMagnificationLevel);

          // Save the new magnification level
          chrome.storage.sync.set({ magnificationLevel: newMagnificationLevel });
      }, 300); // Adjust the debounce delay as needed
  });

  contrastToggle.addEventListener("change", (event) => {
    const highContrast = event.target.checked;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs)=> {
        chrome.tabs.sendMessage(tabs[0].id, {type: "updateContrast", highContrast: highContrast});
    });
    // Save the high contrast mode preference
    chrome.storage.sync.set({highContrast: highContrast});
  });

  altTextCheckbox.addEventListener('change', (event) => {
    const showAltText = event.target.checked;
    chrome.tabs.query ({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: "toggleAltText", enabled: showAltText});
    });

    //save the alt text mode
    chrome.storage.sync.set({showAltText});
  });
});