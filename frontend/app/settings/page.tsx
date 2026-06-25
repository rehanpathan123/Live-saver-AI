import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Connect calendars, tune scheduling preferences, and manage AI behavior." />
      <Card className="max-w-2xl space-y-4">
        <Input placeholder="Timezone" defaultValue="Asia/Kolkata" />
        <Input placeholder="Workday start" defaultValue="09:00" />
        <Input placeholder="Workday end" defaultValue="18:00" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">Google Calendar ready</div>
          <div className="rounded-lg border border-border p-4">Outlook Calendar ready</div>
        </div>
      </Card>
    </AppShell>
  );
}
