import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal AI Platform | Türk Hukuku + AİHM",
  description: "Kaynak-doğrulamalı hukuk araştırma ve doğrulama platformu – Yargıtay, Danıştay, AYM ve AİHM kaynakları. Google giriş + Admin onayı + Free/Pro++ katmanlar."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
