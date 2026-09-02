"use client";

import { BellRing, Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { showMedicationNotification } from "@/lib/notifications";

export default function SettingsPage() {
  const [notificationMessage, setNotificationMessage] = useState("");
  const sendTestNotification = async () => {
    const sent = await showMedicationNotification({ medicationId: "test-dose", profileId: "test", name: "Metformin", scheduledTime: "Şimdi" });
    setNotificationMessage(sent ? "Test bildirimi Service Worker üzerinden gönderildi." : "Bildirim izni verilmedi veya tarayıcınız desteklemiyor.");
  };
  return <div className="max-w-3xl"><h1 className="text-3xl font-bold">Ayarlar</h1><p className="mt-2 text-lg text-slate-600">Hesabını ve planını yönet.</p><section className="mt-8 rounded-2xl bg-white p-6 shadow-card"><h2 className="text-xl font-bold">Planın</h2><div className="mt-4 flex flex-col justify-between gap-4 rounded-xl bg-sky-50 p-5 sm:flex-row sm:items-center"><div className="flex gap-3"><Crown className="shrink-0 text-amber-500" size={28} /><div><p className="font-bold text-slate-900">3 günlük Plus denemesi</p><p className="mt-1 text-slate-600">İlaç ve tahlil geçmişini sınırsız deneyin.</p></div></div><Link href="/plans" className="inline-flex h-12 items-center justify-center rounded-xl bg-sky-600 px-5 text-base font-bold text-white">Planları gör</Link></div><div className="mt-6 grid gap-3 text-base text-slate-700"><p><strong>Free:</strong> 4 aktif ilaç, 1 tahlil kaydı ve temel bildirimler.</p><p><strong>Plus:</strong> sadece kendiniz için sınırsız kayıt, reçete uyarıları ve reklamsız kullanım.</p><p><strong>Aile Plus:</strong> Plus özellikleri + 3 yakına kadar takip ve kaçırılan doz uyarıları.</p></div></section><section className="mt-6 rounded-2xl bg-white p-6 shadow-card"><BellRing className="text-sky-600" size={28} /><h2 className="mt-3 text-xl font-bold">Bildirim testi</h2><p className="mt-2 leading-7 text-slate-600">Tarayıcı iznini kontrol etmek için örnek ilaç hatırlatması gönderin.</p><button onClick={sendTestNotification} className="mt-5 h-12 rounded-xl bg-sky-600 px-5 text-base font-bold text-white">Test Bildirimi Gönder</button>{notificationMessage && <p className="mt-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{notificationMessage}</p>}</section><section className="mt-6 rounded-2xl bg-white p-6 shadow-card"><div className="flex gap-3"><ShieldCheck className="text-emerald-600" /><div><h2 className="text-xl font-bold">Gizlilik</h2><p className="mt-2 leading-7 text-slate-600">Verileriniz satılmaz; erişim, Supabase Row Level Security ile yalnızca yetkili hesaplara sınırlanır.</p><Link href="/privacy" className="mt-4 inline-flex min-h-12 items-center font-bold text-sky-700 underline">Gizlilik Politikasını oku</Link></div></div><p className="mt-5 text-sm text-slate-400">powered by Nova Studio</p></section></div>;
}
