/**
 * Request notification permissions
 * @returns Promise that resolves with the permission status
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  /**
   * Enable notifications for the application
   * This requests permission and initializes the notification system
   * @returns Promise that resolves with a boolean indicating if notifications are enabled
   */
  export async function enableNotifications(): Promise<boolean> {
    try {
      const permitted = await requestNotificationPermission();
      
      if (permitted) {
        // Register service worker for notifications if supported
        if ('serviceWorker' in navigator) {
          await registerServiceWorker();
        }
        
        // Send a test notification
        sendNotification('Notifications enabled!', { 
          title: 'Momentum', 
          silent: true 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }
  
  /**
   * Check if notifications are permitted
   * @returns Boolean indicating if notifications are permitted
   */
  export function areNotificationsPermitted(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
  
  /**
   * Send a notification to the user
   * @param message The message to show in the notification
   * @param options Additional notification options
   */
  export function sendNotification(
    message: string,
    options: { title?: string; icon?: string; silent?: boolean } = {}
  ): void {
    if (!areNotificationsPermitted()) {
      console.log('Notifications not permitted');
      return;
    }
    
    try {
      const notification = new Notification(options.title || 'Momentum', {
        body: message,
        icon: options.icon || '/logo192.png',
        silent: options.silent || false
      });
      
      // Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      // Handle click event
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  /**
   * Send a timer notification to the user
   * @param message The message to show in the notification
   */
  export function sendTimerNotification(message: string): void {
    sendNotification(message, {
      title: 'Pomodoro Timer',
      icon: '/timer-icon.png'
    });
    
    // Also play a sound if available
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(error => console.error('Error playing notification sound:', error));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
  
  /**
   * Send a deadline notification to the user
   * @param taskName The name of the task
   * @param dueTime The time the task is due
   */
  export function sendDeadlineNotification(taskName: string, dueTime: string): void {
    sendNotification(`Task "${taskName}" is due ${dueTime}`, {
      title: 'Deadline Reminder',
      icon: '/deadline-icon.png'
    });
  }
  
  /**
   * Register the service worker for push notifications
   * @returns Promise that resolves when the service worker is registered
   */
  export async function registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }
  
  /**
   * Schedule a notification for a future time
   * @param time Time in milliseconds when to show the notification
   * @param message The message to show
   * @param title The notification title
   */
  export function scheduleNotification(time: number, message: string, title: string): void {
    const timeToNotification = time - Date.now();
    
    if (timeToNotification <= 0) {
      sendNotification(message, { title });
      return;
    }
    
    setTimeout(() => {
      sendNotification(message, { title });
    }, timeToNotification);
  }