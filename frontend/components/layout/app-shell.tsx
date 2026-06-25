"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, CalendarDays, CheckSquare, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="glass sticky top-0 z-20 flex h-auto items-center justify-between rounded-none border-x-0 border-t-0 p-4 md:h-screen md:flex-col md:items-stretch">
        <Link href="/" className="text-lg font-bold tracking-tight">Life Saver AI</Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/10 hover:text-white",
                  pathname === item.href && "bg-white/[0.12] text-white"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden text-xs text-muted md:block">Proactive planning, not passive reminders.</div>
      </aside>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
