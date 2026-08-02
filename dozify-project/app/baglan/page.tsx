import Link from "next/link";

export default function ConnectFamilyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  return <main className="grid min-h-screen place-items-center bg-sky-50 p-4"><section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-card"><h1 className="text-3xl font-bold">Dozify aile daveti</h1><p className="mt-4 text-lg leading-7 text-slate-600">{token ? "Bu daveti kabul ederek doz durumu bildirimlerine erişebilirsiniz." : "Geçerli bir davet bağlantısı bulunamadı."}</p>{token && <button className="mt-7 h-12 w-full rounded-xl bg-sky-600 text-base font-bold text-white">Daveti kabul et</button>}<Link href="/login" className="mt-4 inline-block text-base font-semibold text-sky-700">Giriş sayfasına dön</Link></section></main>;
}
