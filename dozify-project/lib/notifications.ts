"use client";

type NotificationResult = "granted" | "denied" | "unsupported";
export type MedicationNotice = { medicationId: string; profileId: string; name: string; scheduledTime?: string; persistent?: boolean };

export async function requestNotificationPermission(): Promise<NotificationResult> {
  if (!("Notification" in window)) return "unsupported";
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return permission === "granted" ? "granted" : "denied";
}

export async function showMedicationNotification(notice: MedicationNotice) {
  if (await requestNotificationPermission() !== "granted") return false;
  const title = notice.persistent ? "Dozify: ilaç onayı bekleniyor" : "Dozify ilaç hatırlatması";
  const body = notice.persistent ? `${notice.name} ilacınızı henüz almadınız, lütfen ilacınızı alınız!` : `${notice.name}${notice.scheduledTime ? ` · ${notice.scheduledTime}` : ""} dozunuzu alma zamanınız geldi.`;
  const options: NotificationOptions & { actions?: { action: string; title: string }[]; renotify?: boolean; requireInteraction?: boolean } = {
    body, icon: "/icon.svg", badge: "/icon.svg", tag: `dozify-${notice.profileId}-${notice.medicationId}-${notice.scheduledTime ?? "test"}`,
    renotify: Boolean(notice.persistent), requireInteraction: Boolean(notice.persistent), data: notice,
    actions: [{ action: "taken", title: "Aldım" }, { action: "open", title: "Uygulamayı aç" }],
  };
  const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => undefined) : undefined;
  if (registration) await registration.showNotification(title, options);
  else new Notification(title, options);
  return true;
}

const confirmationKey = (profileId: string) => `dozify-dose-confirmations-${profileId}`;
const today = () => new Date().toISOString().slice(0, 10);

export function recordDoseConfirmation(profileId: string, medicationId: string, scheduledTime?: string) {
  const records: Record<string, string> = JSON.parse(localStorage.getItem(confirmationKey(profileId)) ?? "{}");
  records[`${today()}:${medicationId}:${scheduledTime ?? "all"}`] = new Date().toISOString();
  localStorage.setItem(confirmationKey(profileId), JSON.stringify(records));
}

export function isDoseConfirmed(profileId: string, medicationId: string, scheduledTime: string) {
  const records: Record<string, string> = JSON.parse(localStorage.getItem(confirmationKey(profileId)) ?? "{}");
  return Boolean(records[`${today()}:${medicationId}:${scheduledTime}`] || records[`${today()}:${medicationId}:all`]);
}
