"use client";

import { Plus, Syringe } from "lucide-react";
import { useState } from "react";
import { MedCard } from "@/components/ui/med-card";
import { demoMedications } from "@/lib/demo-data";
import { queueOfflineDose } from "@/lib/storage";

export default function MedicationsPage() {
  const [taken, setTaken] = useState<string[]>([]); const [showSite, setShowSite] = useState(false); const [site, setSite] = useState("Karın");
  const confirm = (id: string, insulin?: boolean) => { if (insulin) { setShowSite(true); return; } queueOfflineDose({ medicationId: id, takenAt: new Date().toISOString() }); setTaken((v) => [...v, id]); };
  const confirmInsulin = () => { queueOfflineDose({ medicationId: "lantus", takenAt: new Date().toISOString(), injectionSite: site }); setTaken((v) => [...v, "lantus"]); setShowSite(false); };
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">İlaçlarım</h1><p className="mt-2 text-lg text-slate-600">Dozunu tek hareketle ve güvenle onayla.</p></div><button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-bold text-white"><Plus size={20} /> Yeni ilaç ekle</button></div><div className="mt-8 grid gap-5 lg:grid-cols-2">{demoMedications.map((med) => <MedCard key={med.id} medication={med} status={taken.includes(med.id) ? "taken" : "upcoming"} onTaken={() => confirm(med.id, med.isInsulin)} />)}</div>
    {showSite && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6"><Syringe className="text-emerald-600" size={30} /><h2 className="mt-3 text-2xl font-bold">Enjeksiyon bölgesini seç</h2><p className="mt-2 text-slate-600">Bölge rotasyonu için son kullandığın yerden farklı bir alan tercih et.</p><div className="mt-5 grid grid-cols-3 gap-3">{["Karın", "Kol", "Uyluk"].map((item) => <button key={item} onClick={() => setSite(item)} className={`h-16 rounded-xl border-2 text-base font-semibold ${site === item ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>{item}</button>)}</div><button onClick={confirmInsulin} className="mt-6 h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white">{site} bölgesini kaydet</button></div></div>}
  </div>;
}
