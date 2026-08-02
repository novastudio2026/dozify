"use client";

import { useEffect } from "react";
import { flushOfflineDoseQueue } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const sync = async (dose: { medicationId: string; takenAt: string; injectionSite?: string }) => {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured");
      const { error } = await supabase.from("dose_logs").insert({ medication_id: dose.medicationId, taken_at: dose.takenAt, status: "taken", injection_site: dose.injectionSite });
      if (error) throw error;
    };
    const onOnline = () => void flushOfflineDoseQueue(sync);
    onOnline(); window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);
  return children;
}
