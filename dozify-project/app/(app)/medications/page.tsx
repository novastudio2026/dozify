"use client";

import { Check, PencilLine, Plus, Search, Syringe } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { MedCard } from "@/components/ui/med-card";
import { useProfile } from "@/components/profile-provider";
import { demoMedications } from "@/lib/demo-data";
import { queueOfflineDose } from "@/lib/storage";
import { recordDoseConfirmation } from "@/lib/notifications";
import type { Medication, MedicationForm } from "@/lib/types";
import medicineCatalog from "@/lib/turkey-meds.json";

const STORAGE_KEY = "dozify-demo-medications";
const timeOptions = [{ label: "Sabah", time: "09:00" }, { label: "Öğle", time: "13:00" }, { label: "Akşam", time: "19:00" }, { label: "Gece", time: "23:00" }];
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
  const [selectedMedicine, setSelectedMedicine] = useState<(typeof medicineCatalog)[number]>();
  const [manualMode, setManualMode] = useState(false);
  const [packageCount, setPackageCount] = useState(20);
  const [form, setForm] = useState<MedicationForm>("Tablet");
  const [usage, setUsage] = useState(usageOptions[1]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["Sabah"]);
  const [customTimes, setCustomTimes] = useState<Record<string, string>>({});
  const [frequency, setFrequency] = useState<(typeof frequencyOptions)[number]>(frequencyOptions[0]);
  const { activeProfile } = useProfile();
  const [loadedProfileId, setLoadedProfileId] = useState("");

  useEffect(() => { const saved = localStorage.getItem(`${STORAGE_KEY}-${activeProfile.id}`); setMedications(saved ? JSON.parse(saved) : activeProfile.id === "emir" ? demoMedications : []); setTaken([]); setLoadedProfileId(activeProfile.id); }, [activeProfile.id]);
  useEffect(() => { if (loadedProfileId === activeProfile.id) localStorage.setItem(`${STORAGE_KEY}-${activeProfile.id}`, JSON.stringify(medications)); }, [activeProfile.id, loadedProfileId, medications]);
  useEffect(() => {
    const onServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== "DOSE_TAKEN" || event.data.detail?.profileId !== activeProfile.id) return;
      const medicationId = event.data.detail.medicationId as string;
      recordDoseConfirmation(activeProfile.id, medicationId, event.data.detail.scheduledTime);
      queueOfflineDose({ medicationId, takenAt: new Date().toISOString() }); setTaken((items) => items.includes(medicationId) ? items : [...items, medicationId]);
    };
    navigator.serviceWorker?.addEventListener("message", onServiceWorkerMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", onServiceWorkerMessage);
  }, [activeProfile.id]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const medicationId = params.get("confirm");
    if (!medicationId || params.get("profile") !== activeProfile.id) return;
    recordDoseConfirmation(activeProfile.id, medicationId, params.get("time") ?? undefined);
    queueOfflineDose({ medicationId, takenAt: new Date().toISOString() }); setTaken((items) => items.includes(medicationId) ? items : [...items, medicationId]);
    window.history.replaceState({}, "", "/medications");
  }, [activeProfile.id]);
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return manualMode || selectedMedicine || normalized.length < 2 ? [] : medicineCatalog.filter((item) => item.name.toLocaleLowerCase("tr-TR").includes(normalized)).slice(0, 8);
  }, [manualMode, query, selectedMedicine]);
  const confirm = (id: string, insulin?: boolean) => {
    if (insulin) { setPendingInsulinId(id); setShowSite(true); return; }
    recordDoseConfirmation(activeProfile.id, id); queueOfflineDose({ medicationId: id, takenAt: new Date().toISOString() }); setTaken((v) => v.includes(id) ? v : [...v, id]);
  };
  const confirmInsulin = () => {
    if (!pendingInsulinId) return;
    recordDoseConfirmation(activeProfile.id, pendingInsulinId); queueOfflineDose({ medicationId: pendingInsulinId, takenAt: new Date().toISOString(), injectionSite: site });
    setTaken((v) => v.includes(pendingInsulinId) ? v : [...v, pendingInsulinId]); setShowSite(false); setPendingInsulinId(undefined);
  };
  const chooseSuggestion = (item: (typeof medicineCatalog)[number]) => { setSelectedMedicine(item); setQuery(item.name); setPackageCount(item.packageCount); setForm(item.form as MedicationForm); };
  const resetAddForm = () => { setQuery(""); setSelectedMedicine(undefined); setManualMode(false); setPackageCount(20); setForm("Tablet"); setSelectedTimes(["Sabah"]); setCustomTimes({}); setUsage(usageOptions[1]); setFrequency(frequencyOptions[0]); };
  const toggleTime = (label: string) => setSelectedTimes((times) => times.includes(label) ? (times.length === 1 ? times : times.filter((time) => time !== label)) : [...times, label]);
  const addMedication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const name = query.trim(); if (!name) return;
    const scheduledTime = selectedTimes.map((selectedTime) => customTimes[selectedTime] || timeOptions.find((item) => item.label === selectedTime)?.time).filter(Boolean).join(" · ");
    const medicine: Medication = { id: crypto.randomUUID(), name, form, dosage: frequency[0], mealStatus: `${usage} · ${selectedTimes.join(", ")}`, scheduledTime, totalCount: packageCount, remainingCount: packageCount, dailyFrequency: frequency[0] === "İhtiyaç Halinde" ? 1 : selectedTimes.length, isInsulin: form === "İnsülin/Enjeksiyon" };
    setMedications((items) => [medicine, ...items]); setAdding(false); resetAddForm();
  };
  const deleting = medications.find((item) => item.id === deleteId);
  const removeMedication = () => { if (!deleteId) return; setMedications((items) => items.filter((item) => item.id !== deleteId)); setTaken((items) => items.filter((id) => id !== deleteId)); setDeleteId(undefined); };

  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">{activeProfile.name} · İlaçlar</h1><p className="mt-2 text-lg text-slate-600">Dozunu tek hareketle ve güvenle onayla.</p></div><button onClick={() => { resetAddForm(); setAdding(true); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-bold text-white"><Plus size={20} /> Yeni ilaç ekle</button></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">{medications.map((med) => <MedCard key={med.id} medication={med} status={taken.includes(med.id) ? "taken" : "upcoming"} onTaken={() => confirm(med.id, med.isInsulin)} onDelete={() => setDeleteId(med.id)} />)}</div>
    {adding && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4"><form onSubmit={addMedication} className="mx-auto my-4 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">Yeni ilaç ekle</h2><p className="mt-1 text-base text-slate-600">Zengin katalogdan seç veya ürününü kendin ekle.</p></div><button type="button" onClick={() => { setManualMode((active) => !active); setSelectedMedicine(undefined); setQuery(""); }} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-sky-200 px-3 text-base font-bold text-sky-700"><PencilLine size={18} />{manualMode ? "Kataloga dön" : "Manuel İlaç Ekle"}</button></div>
      <label className="mt-5 block text-base font-semibold text-slate-700">{manualMode ? "İlaç / ürün adı" : "İlaç ara"}<div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={21} /><input required value={query} onChange={(event) => { setQuery(event.target.value); setSelectedMedicine(undefined); }} className="h-12 w-full rounded-xl border border-slate-300 py-2 pl-11 pr-3 text-base" placeholder={manualMode ? "Örn. Özel vitamin takviyem" : "Örn. Parol, Devit, Clexane"} autoComplete="off" />{suggestions.length > 0 && <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-sky-100 bg-white shadow-lg">{suggestions.map((item) => <button type="button" key={item.name} onClick={() => chooseSuggestion(item)} className="flex min-h-12 w-full items-center justify-between px-3 text-left text-base hover:bg-sky-50"><span>{item.name}</span><span className="text-sm text-slate-500">{item.packageCount} adet</span></button>)}</div>}</div></label>{selectedMedicine && <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-base font-semibold text-emerald-900"><Check size={19} /> {selectedMedicine.name} seçildi. Bilgiler aşağıya aktarıldı.</div>}
      {manualMode && <label className="mt-5 block text-base font-semibold text-slate-700">İlaç formu<select value={form} onChange={(event) => setForm(event.target.value as MedicationForm)} className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 text-base"><option>Tablet</option><option>Kapsül</option><option>Şurup</option><option>Damla</option><option>İnsülin/Enjeksiyon</option></select></label>}
      <label className="mt-5 block text-base font-semibold text-slate-700">Kutu / stok adedi<input required value={packageCount} onChange={(event) => setPackageCount(Number(event.target.value))} type="number" min="1" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3 text-base" /></label>
      <div className="mt-5"><p className="text-base font-semibold text-slate-700">Kullanım</p><div className="mt-2 flex flex-wrap gap-2">{usageOptions.map((option) => <Chip key={option} active={usage === option} onClick={() => setUsage(option)}>{option}</Chip>)}</div></div>
      <div className="mt-5"><p className="text-base font-semibold text-slate-700">Kullanım vakitleri <span className="font-normal text-slate-500">(birden fazla seçebilirsin)</span></p><div className="mt-2 flex flex-wrap gap-2">{timeOptions.map((option) => <Chip key={option.label} active={selectedTimes.includes(option.label)} onClick={() => toggleTime(option.label)}><span className="inline-flex items-center gap-2">{selectedTimes.includes(option.label) && <Check size={17} />}{option.label}</span></Chip>)}</div></div>
      <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">{timeOptions.filter((option) => selectedTimes.includes(option.label)).map((option) => <label key={option.label} className="text-sm font-semibold text-slate-700">{option.label} saati<input type="time" value={customTimes[option.label] ?? option.time} onChange={(event) => setCustomTimes((times) => ({ ...times, [option.label]: event.target.value }))} className="mt-1 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base" /></label>)}</div>
      <div className="mt-5"><p className="text-base font-semibold text-slate-700">Sıklık</p><div className="mt-2 flex flex-wrap gap-2">{frequencyOptions.map((option) => <Chip key={option[0]} active={frequency[0] === option[0]} onClick={() => setFrequency(option)}>{option[0]}</Chip>)}</div></div>
      <div className="mt-6 flex gap-3"><button type="button" onClick={() => { setAdding(false); resetAddForm(); }} className="h-12 flex-1 rounded-xl border border-slate-300 text-base font-bold">Vazgeç</button><button className="h-12 flex-1 rounded-xl bg-sky-600 text-base font-bold text-white">İlacı ekle</button></div>
    </form></div>}
    {showSite && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6"><Syringe className="text-emerald-600" size={30} /><h2 className="mt-3 text-2xl font-bold">Enjeksiyon bölgesini seç</h2><p className="mt-2 text-slate-600">Bölge rotasyonu için son kullandığın yerden farklı bir alan tercih et.</p><div className="mt-5 grid grid-cols-3 gap-3">{["Karın", "Kol", "Uyluk"].map((item) => <button key={item} onClick={() => setSite(item)} className={`h-16 rounded-xl border-2 text-base font-semibold ${site === item ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>{item}</button>)}</div><button onClick={confirmInsulin} className="mt-6 h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white">{site} bölgesini kaydet</button></div></div>}
    {deleting && <DeleteConfirmModal title="İlaç silinsin mi?" description={`${deleting.name} ilacı ve bu oturumdaki doz durumu silinecek.`} onCancel={() => setDeleteId(undefined)} onConfirm={removeMedication} />}
  </div>;
}
