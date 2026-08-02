"use client";

type OfflineDose = { medicationId: string; takenAt: string; injectionSite?: string };
const QUEUE_KEY = "dozify-offline-dose-queue";

export function queueOfflineDose(dose: OfflineDose) {
  const entries: OfflineDose[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  localStorage.setItem(QUEUE_KEY, JSON.stringify([...entries, dose]));
}

export async function flushOfflineDoseQueue(sync: (dose: OfflineDose) => Promise<void>) {
  if (!navigator.onLine) return;
  const entries: OfflineDose[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  const remaining: OfflineDose[] = [];
  for (const dose of entries) {
    try { await sync(dose); } catch { remaining.push(dose); }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}
