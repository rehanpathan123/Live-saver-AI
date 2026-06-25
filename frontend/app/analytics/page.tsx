"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const productivity = useQuery({ queryKey: ["productivity"], queryFn: () => api<{ productivity_score: number; completed_last_7_days: number; peak_period: string }>("/analytics/productivity") });
  const insights = useQuery({ queryKey: ["insights"], queryFn: () => api<{ insights: string[] }>("/analytics/insights") });
  return (
    <AppShell>
      <PageHeader title="Analytics" subtitle="Energy-aware scheduling signals and productivity insights." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted">Score</p><p className="mt-3 text-4xl font-semibold">{productivity.data?.productivity_score ?? "--"}</p></Card>
        <Card><p className="text-sm text-muted">Completed</p><p className="mt-3 text-4xl font-semibold">{productivity.data?.completed_last_7_days ?? "--"}</p></Card>
        <Card><p className="text-sm text-muted">Peak period</p><p className="mt-3 text-4xl font-semibold capitalize">{productivity.data?.peak_period ?? "--"}</p></Card>
      </div>
      <Card className="mt-4">
        <h2 className="mb-3 text-xl font-semibold">Insights</h2>
        <ul className="space-y-2 text-muted">{(insights.data?.insights ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
      </Card>
    </AppShell>
  );
}
