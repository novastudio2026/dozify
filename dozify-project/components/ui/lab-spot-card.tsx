import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { LabResult } from "@/lib/types";

export function labStatus(result: LabResult) {
  if (result.value < result.refMin) return "low";
  if (result.value > result.refMax) return "high";
  return "normal";
}

export function LabSpotCard({ result }: { result: LabResult }) {
  const status = labStatus(result);
  const normal = status === "normal";
  const details: Record<string, string> = {
    B12: "B12 değeriniz referansın altında. Gün içinde halsizlik hissediyor olabilirsiniz. Kesin değerlendirme ve tedavi için hekiminize danışınız.",
    Hb: "Hb değerindeki düşüklük demir eksikliği gibi yaygın nedenlerle görülebilir. Talasemi taşıyıcılığı da değerlendirilmesi gereken olasılıklardandır; hekiminize danışınız.",
    HCT: "HCT düşüklüğü farklı nedenlerle görülebilir. Talasemi taşıyıcılığı açısından da doktorunuzla görüşmeniz uygun olur.",
  };
  const defaultMessage = normal ? "Sonucunuz belirtilen referans aralığında görünüyor." : "Sonucunuz referans aralığının dışında görünüyor. Kesin değerlendirme için hekiminize danışınız.";
  return <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-card">
    <div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-slate-900">{result.testName}</h3><p className="mt-1 text-2xl font-bold text-slate-800">{result.value} <span className="text-base font-medium text-slate-500">{result.unit}</span></p></div><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${normal ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{normal ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}{normal ? "Normal" : status === "low" ? "Düşük" : "Yüksek"}</span></div>
    <p className="mt-3 text-sm text-slate-500">Referans aralığı: {result.refMin} – {result.refMax} {result.unit}</p>
    <div className={`mt-4 flex gap-2 rounded-xl p-3 text-sm leading-6 ${normal ? "bg-emerald-50 text-emerald-950" : "bg-amber-50 text-amber-950"}`}><Info className="mt-1 shrink-0" size={17} /><p>{details[result.testName] ?? defaultMessage}</p></div>
  </article>;
}
