export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showNotification(title: string, body: string): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icon-192.png" });
}
