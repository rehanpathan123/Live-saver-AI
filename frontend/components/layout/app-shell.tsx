"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, CalendarDays, CheckSquare, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, setToken } = useAuthStore();

  function logout() {
    setToken(null);
    router.push("/login");
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="glass sticky top-0 z-20 flex h-auto items-center justify-between rounded-none border-x-0 border-t-0 p-4 md:h-screen md:flex-col md:items-stretch md:justify-start">
        <Link href="/" className="mb-6 hidden text-lg font-bold tracking-tight md:block">
          Life Saver AI
        </Link>
        <Link href="/" className="text-lg font-bold tracking-tight md:hidden">
          Life Saver AI
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:flex-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/10 hover:text-white",
                  pathname === item.href && "bg-white/[0.12] text-white font-medium"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:block mt-auto pt-4 border-t border-border/50">
          {token ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted hover:text-rose-400 hover:bg-white/5 transition"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-white">
              Sign in
            </Link>
          )}
          <p className="mt-2 px-3 text-xs text-muted/60">Proactive planning, not passive reminders.</p>
        </div>
      </aside>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
