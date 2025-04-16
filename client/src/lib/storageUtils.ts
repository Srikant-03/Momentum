/**
 * Local storage utility functions for persisting data on the client side
 */

/**
 * Save data to local storage with a specific key
 * @param key The storage key
 * @param data The data to store
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
  }
  
  /**
   * Load data from local storage by key
   * @param key The storage key
   * @param defaultValue Default value if the key doesn't exist
   * @returns The retrieved data or the default value
   */
  export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Error loading from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  }
  
  /**
   * Remove a specific key from local storage
   * @param key The storage key to remove
   */
  export function removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
  }
  
  /**
   * Clear all data from local storage
   * Careful! This removes all data, not just app-specific data
   */
  export function clearLocalStorage(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
  
  /**
   * Save app settings to local storage
   * @param settings The settings object to save
   */
  export function saveAppSettings(settings: any): void {
    saveToLocalStorage('momentum_settings', settings);
  }
  
  /**
   * Load app settings from local storage
   * @returns The settings object or default settings
   */
  export function loadAppSettings(): any {
    const defaultSettings = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      notificationsEnabled: false,
      pomodoro: {
        focusTime: 25,
        breakTime: 5,
        longBreakTime: 15,
        sessionsBeforeLongBreak: 4
      }
    };
    
    return loadFromLocalStorage('momentum_settings', defaultSettings);
  }
  
  /**
   * Save study materials to local storage for offline use
   * @param materials Array of study materials
   */
  export function saveMaterialsOffline(materials: any[]): void {
    saveToLocalStorage('momentum_offline_materials', materials);
  }
  
  /**
   * Load offline study materials from local storage
   * @returns Array of stored study materials
   */
  export function loadOfflineMaterials(): any[] {
    return loadFromLocalStorage('momentum_offline_materials', []);
  }
  
  /**
   * Save timetable to local storage for offline use
   * @param timetable The timetable object to save
   */
  export function saveTimetableOffline(timetable: any): void {
    saveToLocalStorage('momentum_offline_timetable', timetable);
  }
  
  /**
   * Load offline timetable from local storage
   * @returns The timetable object or an empty object
   */
  export function loadOfflineTimetable(): any {
    return loadFromLocalStorage('momentum_offline_timetable', { entries: [] });
  }
  
  /**
   * Check if the application is online
   * @returns Boolean indicating if the application is online
   */
  export function isOnline(): boolean {
    return navigator.onLine;
  }
  
  /**
   * Register online/offline event listeners
   * @param onlineCallback Function to call when going online
   * @param offlineCallback Function to call when going offline
   * @returns Function to remove the event listeners
   */
  export function registerConnectivityListeners(
    onlineCallback: () => void,
    offlineCallback: () => void
  ): () => void {
    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);
    
    return () => {
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }