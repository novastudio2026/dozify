"use client";

import { Plus, Search, Syringe } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { MedCard } from "@/components/ui/med-card";
import { useProfile } from "@/components/profile-provider";
import { demoMedications } from "@/lib/demo-data";
import { queueOfflineDose } from "@/lib/storage";
import type { Medication, MedicationForm } from "@/lib/types";
import medicineCatalog from "@/lib/turkey-meds.json";

const STORAGE_KEY = "dozify-demo-medications";
const meals = ["Sabah", "Öğle", "Akşam", "Gece"];
const usageOptions = ["Aç Karnına", "Tok Karnına", "Fark Etmez"];
const frequencyOptions = [["Günde 1", 1], ["Günde 2", 2], ["Günde 3", 3], ["İhtiyaç Halinde", 1]] as const;

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`min-h-12 rounded-xl border-2 px-4 text-base font-semibold transition-colors ${active ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{children}</button>;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>(demoMedications);
  const [taken, setTaken] = useState<string[]>([]);
  const [showSite, setShowSite] = useState(false);
  const [pendingInsulinId, setPendingInsulinId] = useState<string>();
  const [site, setSite] = useState("Karın");
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string>();
  const [query, setQuery] = useState("");
  const [packageCount, setPackageCount] = useState(20);
  const [form, setForm] = useState<MedicationForm>("Tablet");
  const [usage, setUsage] = useState(usageOptions[1]);
  const [meal, setMeal] = useState(meals[0]);
  const [frequency, setFrequency] = useState<(typeof frequencyOptions)[number]>(frequencyOptions[0]);
  const { activeProfile } = useProfile();
  const [loadedProfileId, setLoadedProfileId] = useState("");

  useEffect(() => { const saved = localStorage.getItem(`${STORAGE_KEY}-${activeProfile.id}`); setMedications(saved ? JSON.parse(saved) : activeProfile.id === "emir" ? demoMedications : []); setTaken([]); setLoadedProfileId(activeProfile.id); }, [activeProfile.id]);
  useEffect(() => { if (loadedProfileId === activeProfile.id) localStorage.setItem(`${STORAGE_KEY}-${activeProfile.id}`, JSON.stringify(medications)); }, [activeProfile.id, loadedProfileId, medications]);
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return normalized.length < 2 ? [] : medicineCatalog.filter((item) => item.name.toLocaleLowerCase("tr-TR").includes(normalized)).slice(0, 6);
  }, [query]);
  const confirm = (id: string, insulin?: boolean) => {
    if (insulin) { setPendingInsulinId(id); setShowSite(true); return; }
    queueOfflineDose({ medicationId: id, takenAt: new Date().toISOString() }); setTaken((v) => v.includes(id) ? v : [...v, id]);
  };
  const confirmInsulin = () => {
    if (!pendingInsulinId) return;
    queueOfflineDose({ medicationId: pendingInsulinId, takenAt: new Date().toISOString(), injectionSite: site });
    setTaken((v) => v.includes(pendingInsulinId) ? v : [...v, pendingInsulinId]); setShowSite(false); setPendingInsulinId(undefined);
  };
  const chooseSuggestion = (item: (typeof medicineCatalog)[number]) => { setQuery(item.name); setPackageCount(item.packageCount); setForm(item.form as MedicationForm); };
  const addMedication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const name = query.trim(); if (!name) return;
    const scheduledTime = meal === "Sabah" ? "09:00" : meal === "Öğle" ? "13:00" : meal === "Akşam" ? "19:00" : "22:00";
    const medicine: Medication = { id: crypto.randomUUID(), name, form, dosage: frequency[0], mealStatus: `${usage} · ${meal}`, scheduledTime, totalCount: packageCount, remainingCount: packageCount, dailyFrequency: frequency[1], isInsulin: form === "İnsülin/Enjeksiyon" };
    setMedications((items) => [medicine, ...items]); setAdding(false); setQuery(""); setPackageCount(20); setForm("Tablet");
  };
  const deleting = medications.find((item) => item.id === deleteId);
  const removeMedication = () => { if (!deleteId) return; setMedications((items) => items.filter((item) => item.id !== deleteId)); setTaken((items) => items.filter((id) => id !== deleteId)); setDeleteId(undefined); };

  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">{activeProfile.name} · İlaçlar</h1><p className="mt-2 text-lg text-slate-600">Dozunu tek hareketle ve güvenle onayla.</p></div><button onClick={() => setAdding(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-bold text-white"><Plus size={20} /> Yeni ilaç ekle</button></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">{medications.map((med) => <MedCard key={med.id} medication={med} status={taken.includes(med.id) ? "taken" : "upcoming"} onTaken={() => confirm(med.id, med.isInsulin)} onDelete={() => setDeleteId(med.id)} />)}</div>
    {adding && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4"><form onSubmit={addMedication} className="mx-auto my-4 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-2xl font-bold">Yeni ilaç ekle</h2><p className="mt-1 text-base text-slate-600">Listede yoksa ürün adını kendin yazabilirsin.</p>
      <label className="mt-5 block text-base font-semibold text-slate-700">İlaç adı<div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={21} /><input required value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-xl border border-slate-300 py-2 pl-11 pr-3 text-base" placeholder="Örn. Parol" autoComplete="off" />{suggestions.length > 0 && <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-sky-100 bg-white shadow-lg">{suggestions.map((item) => <button type="button" key={item.name} onClick={() => chooseSuggestion(item)} className="flex min-h-12 w-full items-center justify-between px-3 text-left text-base hover:bg-sky-50"><span>{item.name}</span><span className="text-sm text-slate-500">{item.packageCount} adet</span></button>)}</div>}</div></label>
      <label className="mt-5 block text-base font-semibold text-slate-700">Kutu / stok adedi<input required value={packageCount} onChange={(event) => setPackageCount(Number(event.target.value))} type="number" min="1" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 text-base" /></label>
      <div className="mt-5"><p className="text-base font-semibold text-slate-700">Kullanım</p><div className="mt-2 flex flex-wrap gap-2">{usageOptions.map((option) => <Chip key={option} active={usage === option} onClick={() => setUsage(option)}>{option}</Chip>)}</div></div>
      <div className="mt-5"><p className="text-base font-semibold text-slate-700">Öğün</p><div className="mt-2 flex flex-wrap gap-2">{meals.map((option) => <Chip key={option} active={meal === option} onClick={() => setMeal(option)}>{option}</Chip>)}</div></div>
      <div className="mt-5"><p className="text-base font-semibold text-slate-700">Sıklık</p><div className="mt-2 flex flex-wrap gap-2">{frequencyOptions.map((option) => <Chip key={option[0]} active={frequency[0] === option[0]} onClick={() => setFrequency(option)}>{option[0]}</Chip>)}</div></div>
      <div className="mt-6 flex gap-3"><button type="button" onClick={() => setAdding(false)} className="h-12 flex-1 rounded-xl border border-slate-300 text-base font-bold">Vazgeç</button><button className="h-12 flex-1 rounded-xl bg-sky-600 text-base font-bold text-white">İlacı ekle</button></div>
    </form></div>}
    {showSite && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6"><Syringe className="text-emerald-600" size={30} /><h2 className="mt-3 text-2xl font-bold">Enjeksiyon bölgesini seç</h2><p className="mt-2 text-slate-600">Bölge rotasyonu için son kullandığın yerden farklı bir alan tercih et.</p><div className="mt-5 grid grid-cols-3 gap-3">{["Karın", "Kol", "Uyluk"].map((item) => <button key={item} onClick={() => setSite(item)} className={`h-16 rounded-xl border-2 text-base font-semibold ${site === item ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>{item}</button>)}</div><button onClick={confirmInsulin} className="mt-6 h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white">{site} bölgesini kaydet</button></div></div>}
    {deleting && <DeleteConfirmModal title="İlaç silinsin mi?" description={`${deleting.name} ilacı ve bu oturumdaki doz durumu silinecek.`} onCancel={() => setDeleteId(undefined)} onConfirm={removeMedication} />}
  </div>;
}
