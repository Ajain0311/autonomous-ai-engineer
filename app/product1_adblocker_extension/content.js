// Content Script - DOM Cosmetic Ad Filter & Popup Zapper
(function() {
  const adSelectors = [
    '.ad-container', '.sponsored-post', '#google_ads_frame',
    '[id^="div-gpt-ad"]', '.cookie-consent-modal', '.popup-overlay'
  ];
  
  function removeAds() {
    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  }

  removeAds();
  const observer = new MutationObserver(removeAds);
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
