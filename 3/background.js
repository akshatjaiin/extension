chrome.action.onClicked.addListener((tab) => {
    // Inject the JavaScript and CSS to add the sidebar
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["inject.js"]
    });
  
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["styles.css"]
    });
  });
  