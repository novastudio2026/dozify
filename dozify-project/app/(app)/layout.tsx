import { HeaderWithBranding } from "@/components/ui/header-with-branding";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <><HeaderWithBranding /><main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-8">{children}</main></>;
}
