/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('Service Worker registered: ', registration);
        }).catch(error => {
          console.log('Service Worker registration failed: ', error);
        });
      });
    }
  }
  
  /**
   * Unregister service worker
   */
  export function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.unregister();
      }).catch(error => {
        console.error(error.message);
      });
    }
  }