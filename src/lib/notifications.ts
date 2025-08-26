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
  const quietStart = 22; // 22:00
  const quietEnd = 8; // 08:00
  const date = new Date(options.timestamp);
  const hour = date.getHours();
  if (hour >= quietStart || hour < quietEnd) {
    if (hour >= quietStart) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(quietEnd, 0, 0, 0);
  }
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'schedule-reminder',
    title: options.title,
    options: { body: options.body },
    timestamp: date.getTime(),
  });
}
