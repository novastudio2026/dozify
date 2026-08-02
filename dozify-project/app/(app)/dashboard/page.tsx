"use client";

import { Activity, CalendarClock, ChevronRight, Plus, TestTube2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { demoMedications } from "@/lib/demo-data";
import { MedCard } from "@/components/ui/med-card";
import type { Medication } from "@/lib/types";
import { useProfile } from "@/components/profile-provider";

export default function DashboardPage() {
  const [taken, setTaken] = useState<string[]>([]);
  const [medications, setMedications] = useState<Medication[]>(demoMedications);
  const { activeProfile } = useProfile();
  useEffect(() => { const stored = localStorage.getItem(`dozify-demo-medications-${activeProfile.id}`); setMedications(stored ? JSON.parse(stored) : activeProfile.id === "emir" ? demoMedications : []); setTaken([]); }, [activeProfile.id]);
  return <div><section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-base text-slate-600">1 Ağustos Cumartesi</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Günaydın, {activeProfile.name}</h1><p className="mt-2 text-lg text-slate-600">Bugün kendine iyi bakman için buradayız.</p></div><Link href="/medications" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-bold text-white hover:bg-sky-700"><Plus size={20} /> İlaç ekle</Link></section>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-sky-600 p-5 text-white"><CalendarClock size={26} /><p className="mt-5 text-3xl font-bold">{medications.length - taken.length}</p><p className="mt-1 text-base text-sky-100">Bugün bekleyen doz</p></div><Link href="/labs" className="rounded-2xl bg-white p-5 shadow-card transition hover:-translate-y-0.5"><TestTube2 className="text-amber-500" size={26} /><p className="mt-5 text-xl font-bold">Tahlil takibi</p><p className="mt-1 text-base text-slate-600">Son sonuçlarını incele</p></Link><Link href="/family" className="rounded-2xl bg-white p-5 shadow-card transition hover:-translate-y-0.5"><Activity className="text-emerald-500" size={26} /><p className="mt-5 text-xl font-bold">Aile bağlantısı</p><p className="mt-1 text-base text-slate-600">Yakınlarınla güvenle paylaş</p></Link></section>
    <section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">Bugünün dozları</h2><Link href="/medications" className="flex items-center text-base font-semibold text-sky-700">Tümünü gör <ChevronRight size={18} /></Link></div><div className="grid gap-4 lg:grid-cols-2">{medications.slice(0, 2).map((med) => <MedCard key={med.id} medication={med} status={taken.includes(med.id) ? "taken" : "upcoming"} onTaken={() => setTaken((old) => [...old, med.id])} />)}{medications.length === 0 && <p className="rounded-2xl bg-white p-5 text-base text-slate-600 shadow-card">Bu profil için henüz ilaç kaydı yok.</p>}</div></section>
  </div>;
}
