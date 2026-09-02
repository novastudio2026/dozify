"use client";

import { isDoseConfirmed, showMedicationNotification } from "@/lib/notifications";

type StoredMedication = { id: string; name: string; scheduledTime?: string };
const REMINDER_KEY = "dozify-reminder-last-sent";
const RETRY_MINUTES = 10;
const dayKey = () => new Date().toISOString().slice(0, 10);

function profiles(): string[] {
  const saved = localStorage.getItem("dozify-family-profiles");
  return saved ? Array.from(new Set<string>(JSON.parse(saved).map((profile: { dataProfileId?: string; id: string }) => profile.dataProfileId || profile.id))) : [];
}
function toTodayTime(time: string) { const [hours, minutes] = time.trim().split(":").map(Number); const target = new Date(); target.setHours(hours, minutes, 0, 0); return target; }

async function checkReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const now = Date.now(); const sent: Record<string, number> = JSON.parse(localStorage.getItem(REMINDER_KEY) ?? "{}");
  for (const profileId of profiles()) {
    const medications: StoredMedication[] = JSON.parse(localStorage.getItem(`dozify-demo-medications-${profileId}`) ?? "[]");
    for (const medication of medications) for (const scheduledTime of (medication.scheduledTime ?? "").split("·").map((time) => time.trim()).filter(Boolean)) {
      if (now < toTodayTime(scheduledTime).getTime() || isDoseConfirmed(profileId, medication.id, scheduledTime)) continue;
      const key = `${dayKey()}:${profileId}:${medication.id}:${scheduledTime}`;
      const lastSent = sent[key] ?? 0;
      if (now - lastSent < RETRY_MINUTES * 60_000) continue;
      if (await showMedicationNotification({ medicationId: medication.id, profileId, name: medication.name, scheduledTime, persistent: lastSent > 0 })) { sent[key] = now; localStorage.setItem(REMINDER_KEY, JSON.stringify(sent)); }
    }
  }
}

export function startNotificationEngine() {
  void checkReminders();
  const interval = window.setInterval(() => void checkReminders(), 60_000);
  return () => window.clearInterval(interval);
}
