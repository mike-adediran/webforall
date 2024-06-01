document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById("magnification-slider");
  const magnificationLevelSpan = document.getElementById("magnification-level");
  const contrastToggle = document.getElementById("contrast-toggle");
  const altTextCheckbox = document.getElementById("alt-text-checkbox");
  const ttsToggle = document.getElementById ("tts-toggle");
  
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
      if (result.showAltText !== undefined) {
        altTextCheckbox.checked = result.showAltText;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {type: "toggleAltText", enabled: result.showAltText});
        });
      }
    if (result.ttsToggle !== undefined){
      ttsToggle.checked = result.ttsToggle;
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: "toggleTTS", enabled: result.enableTTS});
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
  ttsToggle.addEventListener('change', (event) => {
    const enableTTS = event.target.checked;
    chrome.tabs.query ({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {type: "toggleTTS", enabled: enableTTS});
    });
    //save TTS mode
    chrome.storage.sync.set({enableTTS});
  });
});
