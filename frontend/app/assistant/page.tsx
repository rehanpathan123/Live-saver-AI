"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, CalendarPlus, Flame, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function AssistantPage() {
  const [text, setText] = useState("I have a physics exam Friday and need notes from Max on Wednesday before I can start studying.");
  const [result, setResult] = useState<unknown>(null);
  const parse = useMutation({ mutationFn: () => api("/ai/parse-task", { method: "POST", body: JSON.stringify({ text }) }), onSuccess: setResult });
  const warm = useMutation({ mutationFn: () => api("/ai/warm-start", { method: "POST", body: JSON.stringify({ title: text }) }), onSuccess: setResult });
  const panic = useMutation({ mutationFn: () => api("/ai/panic-button", { method: "POST", body: JSON.stringify({ title: text, blocker: "waiting for external data" }) }), onSuccess: setResult });
  const schedule = useMutation({
    mutationFn: () => api("/ai/generate-schedule", { method: "POST", body: JSON.stringify({ title: text, duration_minutes: 180, deadline: new Date(Date.now() + 86400000).toISOString() }) }),
    onSuccess: setResult
  });

  return (
    <AppShell>
      <PageHeader title="AI Assistant" subtitle="Dump the mess. Life Saver AI extracts the plan, starts the work, and creates a recovery path when needed." />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-48 w-full resize-none rounded-lg border border-border bg-black/20 p-4 outline-none focus:border-accent" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => parse.mutate()}><Bot size={16} /> Parse</Button>
            <Button onClick={() => schedule.mutate()} className="bg-cyan text-black"><CalendarPlus size={16} /> Schedule</Button>
            <Button onClick={() => warm.mutate()} className="bg-amber text-black"><Sparkles size={16} /> Warm start</Button>
            <Button onClick={() => panic.mutate()} className="bg-rose text-white"><Flame size={16} /> Panic</Button>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-semibold">AI Output</h2>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-xs text-muted">{JSON.stringify(result ?? { status: "Waiting for action" }, null, 2)}</pre>
        </Card>
      </div>
    </AppShell>
  );
}
