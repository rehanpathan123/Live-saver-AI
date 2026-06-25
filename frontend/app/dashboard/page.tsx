import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Snapshot } from "@/components/dashboard/snapshot";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader title="Command center" subtitle="A live view of what matters today, what is blocked, and where AI recommends spending energy." />
      <Snapshot />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">AI Suggested Schedule</h2>
          <div className="space-y-3">
            {["09:30 Proposal outline", "11:00 Physics revision", "14:00 Ask Max for notes", "16:30 Inbox triage"].map((slot) => (
              <div key={slot} className="flex items-center justify-between rounded-lg bg-white/[0.06] p-3">
                <span>{slot}</span>
                <span className="text-xs text-accent">optimized</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Dependency Alerts</h2>
          <p className="rounded-lg border border-rose/30 bg-rose/10 p-3 text-sm">Waiting on Sarah for financial report due tomorrow.</p>
          <p className="mt-3 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm">Max notes needed before study block can start.</p>
        </Card>
      </div>
    </AppShell>
  );
}
