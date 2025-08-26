export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission === 'denied') {
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

interface ReminderOptions {
  title: string;
  body: string;
  timestamp: number; // milliseconds since epoch
}

export async function scheduleReminder(options: ReminderOptions) {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'schedule-reminder',
    title: options.title,
    options: { body: options.body },
    timestamp: options.timestamp,
  });
}
