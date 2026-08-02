"use client";

import { CircleDot, Droplets, Pill, Syringe, Trash2 } from "lucide-react";
import type { Medication } from "@/lib/types";
import { SlideToConfirm } from "./slide-to-confirm";

const formIcon = { Tablet: Pill, Kapsül: Pill, Şurup: Droplets, Damla: Droplets, "İnsülin/Enjeksiyon": Syringe };
const formColor = { Tablet: "bg-sky-100 text-sky-700", Kapsül: "bg-rose-100 text-rose-700", Şurup: "bg-amber-100 text-amber-700", Damla: "bg-violet-100 text-violet-700", "İnsülin/Enjeksiyon": "bg-emerald-100 text-emerald-700" };

export function MedCard({ medication, status = "upcoming", onTaken, onDelete }: { medication: Medication; status?: "taken" | "upcoming" | "missed"; onTaken?: () => void; onDelete?: () => void }) {
  const Icon = formIcon[medication.form];
  const refillUrgent = medication.remainingCount <= Math.max(5, medication.dailyFrequency * 5);
  return <article className="relative rounded-2xl border border-sky-100 bg-white p-5 shadow-card">
    {onDelete && <button onClick={onDelete} className="absolute right-3 top-3 grid h-12 w-12 place-items-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`${medication.name} ilacını sil`}><Trash2 size={21} /></button>}
    <div className="flex gap-4">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${formColor[medication.form]}`}><Icon size={27} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2 pr-10"><h3 className="text-lg font-bold text-slate-900">{medication.name}</h3><span className={`min-h-8 rounded-full px-3 py-1 text-sm font-semibold ${status === "taken" ? "bg-emerald-100 text-emerald-700" : status === "missed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{status === "taken" ? "Alındı" : status === "missed" ? "Gecikti" : medication.scheduledTime}</span></div>
        <p className="mt-1 text-base text-slate-600">{medication.dosage} · {medication.mealStatus}</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><CircleDot size={16} /> Kutuda {medication.remainingCount}/{medication.totalCount} doz kaldı</p>
      </div>
    </div>
    {refillUrgent && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-900">Reçeteni yenileme ve eczaneden ilacını alma zamanın yaklaşıyor.</p>}
    {status === "upcoming" && <div className="mt-4"><SlideToConfirm onConfirm={onTaken ?? (() => undefined)} /></div>}
  </article>;
}
