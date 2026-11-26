import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Song Guessr — Şarkı Tahmin Oyunu",
  description: "3 aşamada şarkıyı dinle ve tahmin et. Günlük ve sınırsız oyun modu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased">
        <Header />
        <main className="max-w-lg w-full mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
