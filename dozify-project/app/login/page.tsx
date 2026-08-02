"use client";

import { HeartPulse, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const login = async () => {
    const supabase = createClient();
    if (!supabase) { setMessage("Demo modu açık. Supabase anahtarlarını .env.local dosyanıza ekledikten sonra Google ile giriş etkinleşir."); return; }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/onboarding` } });
    if (error) setMessage(error.message);
  };
  const demoLogin = () => {
    localStorage.setItem("dozify-demo-user", "true");
    router.push("/dashboard");
  };
  return <main className="grid min-h-screen place-items-center bg-gradient-to-b from-sky-100 to-white px-4 py-10"><section className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-card">
    <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-sky-600 text-white"><HeartPulse size={42} /></div>
    <h1 className="mt-6 text-3xl font-bold text-slate-900">Dozify</h1><p className="mt-2 text-lg text-slate-600">Akıllı İlaç ve Tahlil Asistanı</p>
    <button onClick={login} className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-base font-bold text-slate-800 shadow-sm hover:bg-slate-50"><span className="font-black text-red-500">G</span> Google ile Devam Et</button>
    <button onClick={demoLogin} className="mt-3 h-14 w-full rounded-xl bg-sky-600 text-base font-bold text-white hover:bg-sky-700">Demo olarak devam et</button>
    {message && <p className="mt-4 rounded-xl bg-sky-50 p-3 text-sm leading-6 text-sky-900">{message}</p>}
    <div className="mt-8 flex items-start gap-2 text-left text-sm leading-6 text-slate-500"><ShieldCheck className="mt-1 shrink-0 text-emerald-600" size={17} />İlk 3 gün tüm Plus özelliklerini deneyin. Sağlık verileriniz size aittir.</div>
    <p className="mt-8 text-sm text-slate-400">powered by Nova Studio</p>
  </section></main>;
}
