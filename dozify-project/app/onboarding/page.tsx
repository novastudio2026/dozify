"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const audience = ["Sadece Kendim", "Annem/Babam/Yakınım", "Hem Kendim Hem Ailem"];
export default function OnboardingPage() {
  const router = useRouter(); const [userType, setUserType] = useState(audience[0]); const [error, setError] = useState<string>();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const supabase = createClient();
    if (supabase) { const { data: { user } } = await supabase.auth.getUser(); if (user) { const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: form.get("name"), age: Number(form.get("age")), gender: form.get("gender"), height: Number(form.get("height")), weight: Number(form.get("weight")), user_type: userType, trial_ends_at: new Date(Date.now() + 3 * 86400000).toISOString() }); if (error) { setError(error.message); return; } } }
    router.push("/dashboard");
  };
  return <main className="mx-auto max-w-2xl px-4 py-10"><form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-card sm:p-8"><p className="text-sm font-bold uppercase tracking-widest text-sky-700">Dozify&apos;a hoş geldiniz</p><h1 className="mt-2 text-3xl font-bold">Bu uygulamayı kimin için kullanacaksın?</h1><div className="mt-6 grid gap-3">{audience.map((option) => <button type="button" key={option} onClick={() => setUserType(option)} className={`min-h-14 rounded-xl border-2 px-4 text-left text-base font-semibold ${userType === option ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-700"}`}>{option}</button>)}</div>
    <h2 className="mt-8 text-xl font-bold">Temel bilgiler</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2">Ad soyad<input required name="name" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3" placeholder="Adınız soyadınız" /></label><label>Yaş<input required name="age" type="number" min="0" max="120" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3" /></label><label>Cinsiyet<select required name="gender" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3"><option value="">Seçiniz</option><option>Kadın</option><option>Erkek</option><option>Belirtmek istemiyorum</option></select></label><label>Boy (cm)<input required name="height" type="number" min="40" max="250" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3" /></label><label>Kilo (kg)<input required name="weight" type="number" min="2" max="500" step=".1" className="mt-1 h-12 w-full rounded-xl border border-slate-300 px-3" /></label></div>
    {error && <p className="mt-4 text-red-600">{error}</p>}<button className="mt-8 h-14 w-full rounded-xl bg-sky-600 text-base font-bold text-white hover:bg-sky-700">3 günlük Plus denememi başlat</button><p className="mt-3 text-center text-sm text-slate-500">Deneme boyunca en fazla 2 tahlil sonucu ekleyebilirsiniz.</p></form></main>;
}
