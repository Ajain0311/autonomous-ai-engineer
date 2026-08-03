// Background Service Worker - Declarative Net Request Rules synced with product1_adblocker_extension/db/rules.json
chrome.runtime.onInstalled.addListener(() => {
  console.log("Product 1 - ShieldBlock AI Extension Activated!");
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4],
    addRules: [
      {
        "id": 1,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*doubleclick.net*",
          "resourceTypes": ["script", "image", "xmlhttprequest"]
        }
      },
      {
        "id": 2,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*google-analytics.com*",
          "resourceTypes": ["script"]
        }
      },
      {
        "id": 3,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*connect.facebook.net*",
          "resourceTypes": ["script"]
        }
      },
      {
        "id": 4,
        "priority": 1,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*popads.net*",
          "resourceTypes": ["script"]
        }
      }
    ]
  });
});
