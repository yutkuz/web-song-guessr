import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Şarkıyı Tahmin Et",
  description: "Türkçe şarkıları dinle ve tahmin et.",
  other: {
    "text-scale": "scale",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-neutral-950"
        >
          Ana içeriğe geç
        </a>
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
