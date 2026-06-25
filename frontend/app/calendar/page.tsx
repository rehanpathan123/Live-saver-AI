"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

type Event = { id: string; title: string; provider: string; start_at: string; end_at: string };

export default function CalendarPage() {
  const client = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["events"], queryFn: () => api<Event[]>("/calendar/events") });
  const sync = useMutation({ mutationFn: () => api("/calendar/sync", { method: "POST", body: JSON.stringify({ provider: "google" }) }), onSuccess: () => client.invalidateQueries({ queryKey: ["events"] }) });
  return (
    <AppShell>
      <PageHeader title="Calendar" subtitle="Synced calendar events and AI-protected focus time." />
      <Button onClick={() => sync.mutate()}><RefreshCw size={16} /> Sync demo calendar</Button>
      <div className="mt-4 grid gap-3">
        {data.map((event) => (
          <Card key={event.id}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{event.title}</h2>
              <span className="text-sm text-accent">{event.provider}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{new Date(event.start_at).toLocaleString()} - {new Date(event.end_at).toLocaleTimeString()}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
