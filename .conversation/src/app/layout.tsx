import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "eFootball ARENA Morocco | 1vs1 & Botolat b Rasid",
  description: "Platform raqm 1 f l-mghrib l l3ib eFootball 1vs1 w botolat b rasid kach. Chahn yadawi b CIH w Cash Plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className="font-sans antialiased bg-[#090b10] text-zinc-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-black"
      >
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </LanguageProvider>
          <footer className="border-t border-zinc-800/80 bg-zinc-950/80 py-8 px-4 text-center text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-base">⚽</span>
                <span className="font-bold text-zinc-300">eFootball ARENA</span>
                <span>— Manssa maghribiya li l-tournois w l3ib 1vs1</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span>Paiement Yadawi: CIH Bank & Cash Plus</span>
                <span>•</span>
                <span className="text-emerald-400">Escrow Aman 100%</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
