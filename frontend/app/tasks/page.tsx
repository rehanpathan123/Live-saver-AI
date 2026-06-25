"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

type Task = { id: string; title: string; priority: string; status: string; deadline?: string };

export default function TasksPage() {
  const client = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => api<Task[]>("/tasks") });
  const create = useMutation({
    mutationFn: () => api("/tasks", { method: "POST", body: JSON.stringify({ title: "Prepare presentation", priority: "High", estimated_minutes: 180 }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["tasks"] })
  });
  return (
    <AppShell>
      <PageHeader title="Tasks" subtitle="Prioritized work, dependencies, and status in one focused queue." />
      <Button onClick={() => create.mutate()}><Plus size={16} /> Add demo task</Button>
      <div className="mt-4 grid gap-3">
        {data.map((task) => (
          <Card key={task.id} className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{task.title}</h2>
              <p className="text-sm text-muted">{task.status} · {task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline"}</p>
            </div>
            <span className="rounded-lg bg-white/10 px-3 py-1 text-sm">{task.priority}</span>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
