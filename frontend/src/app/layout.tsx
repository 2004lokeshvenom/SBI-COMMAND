import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModalProvider } from "@/components/modals/ModalProvider";

const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "🔥 FAMILY PRIDE | Generational Change Starts Here",
  description: "Every hour of study is a step toward making Amma & Nanna proud. SBI PO Command Center.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col relative text-foreground">
        <ModalProvider />
        <TopBar />
        <div className="flex flex-1 w-full">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 z-10 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
