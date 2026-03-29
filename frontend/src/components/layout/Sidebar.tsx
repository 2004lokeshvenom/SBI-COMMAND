"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Map,
  Activity,
  Target,
  PenTool,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

const SECTIONS = [
  { name: "DASHBOARD", icon: LayoutDashboard, href: "/" },
  { name: "SYLLABUS", icon: BookOpen, href: "/topics" },
  { name: "SCHEDULE", icon: CalendarCheck, href: "/schedule" },
  { name: "ROADMAP", icon: Map, href: "/roadmap" },
  { name: "STRATEGY", icon: ShieldCheck, href: "/strategy" },
  { name: "TIMER", icon: Activity, href: "/timer" },
  { name: "MOCKS", icon: Target, href: "/mocks" },
  { name: "NOTES", icon: PenTool, href: "/notes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-background border-r flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 relative">
        {SECTIONS.map((section) => {
          const isActive = pathname === section.href || (section.href !== "/" && pathname.startsWith(section.href));
          return (
            <Link
              key={section.name}
              href={section.href}
              className={clsx(
                "flex items-center gap-3 px-6 py-3 font-mono text-sm tracking-wider transition-all duration-300 relative group text-muted-foreground hover:text-foreground",
                isActive ? "text-primary font-medium" : ""
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
              <section.icon className={clsx("w-5 h-5", isActive ? "text-primary" : "")} />
              <span>{section.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
