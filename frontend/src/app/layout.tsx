import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModalProvider } from "@/components/modals/ModalProvider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "EXAM OS | Orbital Command",
  description: "Advanced SBI PO Exam Preparation Command Center",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EXAM OS",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col relative text-primary">
        <ModalProvider />
        <TopBar />
        <div className="flex flex-1 max-w-7xl mx-auto w-full">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 p-6 z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
