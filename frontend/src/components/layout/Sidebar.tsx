"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import clsx from "clsx";
import { useMissionStore } from "@/store/useMissionStore";

const SECTIONS = [
  { name: "Timetable", href: "/timetable", emoji: "⏰" },
  { name: "Dashboard", href: "/", emoji: "🏠" },
  { name: "Syllabus", href: "/topics", emoji: "📚" },
  { name: "Schedule", href: "/schedule", emoji: "📅" },
  { name: "Roadmap", href: "/roadmap", emoji: "🗺️" },
  { name: "Timer", href: "/timer", emoji: "⏱️" },
  { name: "Mocks", href: "/mocks", emoji: "🎯" },
  { name: "Notes", href: "/notes", emoji: "📝" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useMissionStore();

  const navContent = (
    <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-0.5 px-3">
      {SECTIONS.map((section) => {
        const isActive = pathname === section.href || (section.href !== "/" && pathname.startsWith(section.href));
        return (
          <Link
            key={section.name}
            href={section.href}
            prefetch={false}
            onClick={closeSidebar}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] tracking-wide transition-all relative",
              isActive
                ? "bg-cyan-500/8 text-cyan-300 font-medium border border-cyan-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            style={isActive ? { boxShadow: "inset 0 0 12px rgba(56,189,248,0.05)" } : {}}
          >
            <span className="text-sm">{section.emoji}</span>
            <span className="font-mono text-[11px] tracking-wider uppercase">{section.name}</span>
          </Link>
        );
      })}
      <div className="mt-6 mx-3 p-3 rounded-xl bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-cyan-500/10" style={{ boxShadow: "inset 0 0 12px rgba(56,189,248,0.03)" }}>
        <p className="text-[11px] font-mono text-orange-400/80 text-center leading-relaxed">🔥 Their sacrifice ends with YOUR success</p>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="hidden md:flex w-56 bg-card/50 border-r border-[rgba(56,189,248,0.15)] flex-col h-[calc(100vh-3.5rem)] sticky top-14">
        {navContent}
      </aside>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSidebar} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-[rgba(56,189,248,0.2)] flex flex-col animate-in slide-in-from-left duration-200">
            <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(56,189,248,0.15)]">
              <span className="font-mono font-bold text-sm tracking-[0.2em] bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">🔥 MENU</span>
              <button onClick={closeSidebar} className="p-2 rounded-lg hover:bg-white/5 transition"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
