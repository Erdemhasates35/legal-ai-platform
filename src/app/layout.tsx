import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal AI Platform | Türk Hukuku + AİHM",
  description: "Sıfır-hallüsinasyon hukuki yapay zeka platformu – Yargıtay, Danıştay, AYM ve AİHM içtihatları"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
