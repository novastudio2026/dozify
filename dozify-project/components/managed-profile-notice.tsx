"use client";

import { Info } from "lucide-react";
import { useProfile } from "@/components/profile-provider";

export function ManagedProfileNotice() {
  const { activeProfile } = useProfile();
  if (activeProfile.access !== "managed") return null;
  return <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><Info className="mt-0.5 shrink-0 text-amber-700" /><p className="text-base leading-7"><strong>{activeProfile.name} hesabını düzenliyorsunuz.</strong> Bu profilin ilaç, tahlil ve hatırlatıcı bilgileri görüntüleniyor. Değişiklikleri ilgili kişinin bilgisi ve izniyle yapın.</p></div>;
}
