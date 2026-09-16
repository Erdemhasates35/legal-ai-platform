import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal AI Platform | Türk Hukuku + AİHM",
  description: "Sıfır-hallüsinasyon hukuki yapay zeka platformu – Yargıtay, Danıştay, AYM ve AİHM içtihatları. Google giriş + Admin onayı + Free/Private katmanlar."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
