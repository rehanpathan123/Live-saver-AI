"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bot, CalendarPlus, Flame, Loader2, Sparkles, Globe, Plus,
  CalendarDays, Clock, Sun, Moon, Zap, BookOpen, Users, Heart,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<string, { color: string; bar: string; Icon: any }> = {
  work:     { color: "text-cyan-400",   bar: "bg-cyan-400",   Icon: Zap       },
  health:   { color: "text-accent",     bar: "bg-accent",     Icon: Heart      },
  personal: { color: "text-amber-400",  bar: "bg-amber-400",  Icon: Sun        },
  learning: { color: "text-purple-400", bar: "bg-purple-400", Icon: BookOpen   },
  social:   { color: "text-rose-400",   bar: "bg-rose-400",   Icon: Users      },
};

function getCatStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? { color: "text-muted", bar: "bg-white/30", Icon: Clock };
}

export default function AssistantPage() {
  const queryClient = useQueryClient();
  // ── Shared state ─────────────────────────────────────────────────────────
  const [language, setLanguage] = useState("English");
  const [result, setResult]     = useState<unknown>(null);
  const [error, setError]       = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"assistant" | "schedule">("assistant");

  // ── Assistant tab state ───────────────────────────────────────────────────
  const [text, setText] = useState(
    "I have a physics exam Friday and need notes from Max on Wednesday before I can start studying."
  );

  // ── Daily Schedule tab state ──────────────────────────────────────────────
  const [description, setDescription] = useState("productive student/developer day with exercise and learning");
  const [wakeUp, setWakeUp]   = useState("07:00");
  const [sleepAt, setSleepAt] = useState("23:00");

  // ── Helpers ───────────────────────────────────────────────────────────────
  function wrap<T>(fn: () => Promise<T>) {
    setError(null);
    setResult(null);
    return fn().then(setResult).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("401") ? "Not logged in. Please login first." : `AI error: ${msg}`);
    });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  const parse = useMutation({
    mutationFn: () => wrap(() => api("/ai/parse-task", { method: "POST", body: JSON.stringify({ text, language }) })),
  });
  const warm = useMutation({
    mutationFn: () => wrap(() => api("/ai/warm-start", { method: "POST", body: JSON.stringify({ title: text, language }) })),
  });
  const panic = useMutation({
    mutationFn: () =>
      wrap(() => api("/ai/panic-button", { method: "POST", body: JSON.stringify({ title: text, blocker: "waiting for external data", language }) })),
  });
  const schedule = useMutation({
    mutationFn: () =>
      wrap(() => api("/ai/generate-schedule", {
        method: "POST",
        body: JSON.stringify({ title: text, duration_minutes: 180, deadline: new Date(Date.now() + 86400000).toISOString() }),
      })),
  });
  const dailySched = useMutation({
    mutationFn: () =>
      wrap(() => api("/ai/daily-schedule", {
        method: "POST",
        body: JSON.stringify({ description, wake_up: wakeUp, sleep: sleepAt, language }),
      })),
  });
  const createTaskFromAI = useMutation({
    mutationFn: (newTask: { title: string; priority: string; estimated_minutes: number; deadline?: string | null; status: string }) =>
      api("/tasks", { method: "POST", body: JSON.stringify(newTask) }),
    onSuccess: () => alert("Task added to list successfully!"),
    onError: (err: any) => alert(`Could not create task: ${err.message}`),
  });

  const saveDailySchedule = useMutation({
    mutationFn: (slots: { time: string; activity: string; duration_minutes: number; category: string }[]) => {
      const today = new Date();
      const payload = slots.map((slot) => {
        const [hours, minutes] = slot.time.split(":").map(Number);
        const start = new Date(today);
        start.setHours(hours, minutes, 0, 0);
        const end = new Date(start.getTime() + slot.duration_minutes * 60 * 1000);
        return {
          title: slot.activity,
          start_at: start.toISOString(),
          end_at: end.toISOString(),
          provider: "manual",
        };
      });
      return api("/calendar/events/bulk", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      alert("Daily schedule applied to your calendar successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: any) => alert(`Could not save daily schedule: ${err.message || err}`),
  });

  const isAssistantLoading = parse.isPending || warm.isPending || panic.isPending || schedule.isPending;
  const isDailyLoading     = dailySched.isPending;

  // ── Render AI output cards ────────────────────────────────────────────────
  const renderAIResponse = () => {
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
          <Sparkles size={32} className="mb-3 text-accent animate-pulse" />
          <p className="text-sm">Waiting for action — click a button to begin.</p>
        </div>
      );
    }
    const data = result as Record<string, any>;

    // Daily Schedule result
    if ("schedule" in data && Array.isArray(data.schedule)) {
      const slots  = data.schedule as { time: string; activity: string; duration_minutes: number; category: string }[];
      const summary = data.summary || "";
      const tips    = (data.tips as string[]) || [];

      return (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-accent tracking-wider uppercase">Daily Routine Schedule</span>

          {summary && (
            <p className="text-xs text-muted leading-relaxed italic border-l-2 border-accent/40 pl-3">{summary}</p>
          )}

          {/* Timeline */}
          <div className="relative space-y-0">
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-white/[0.06]" />
            {slots.map((slot, idx) => {
              const cat = getCatStyle(slot.category);
              const Icon = cat.Icon;
              return (
                <div key={idx} className="relative flex items-start gap-3 py-2">
                  {/* Time */}
                  <span className="w-12 shrink-0 pt-0.5 text-right text-[11px] font-mono text-muted">{slot.time}</span>
                  {/* Dot */}
                  <div className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${cat.bar}`} />
                  {/* Content */}
                  <div className="flex-1 min-w-0 rounded-lg bg-white/[0.04] px-3 py-2 hover:bg-white/[0.07] transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className={cat.color} />
                      <span className="text-sm text-white font-medium">{slot.activity}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] capitalize font-semibold ${cat.color}`}>{slot.category}</span>
                      <span className="text-[10px] text-muted">{slot.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          {tips.length > 0 && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-1.5 mt-2">
              <p className="text-[10px] font-bold text-accent uppercase tracking-wider">💡 Tips</p>
              {tips.map((tip, idx) => (
                <p key={idx} className="text-xs text-muted">• {tip}</p>
              ))}
            </div>
          )}

          <Button
            onClick={() => saveDailySchedule.mutate(slots)}
            disabled={saveDailySchedule.isPending}
            className="w-full bg-accent text-black hover:bg-accent/90 mt-3"
          >
            {saveDailySchedule.isPending ? (
              <Loader2 size={16} className="animate-spin text-black" />
            ) : (
              <CalendarPlus size={16} />
            )}
            Save Routine to My Daily Schedule
          </Button>
        </div>
      );
    }

    // Task blocks schedule result
    if ("blocks" in data) {
      const blocks = data.blocks as { title: string; start_at: string; end_at: string }[];
      return (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-cyan tracking-wider uppercase">Scheduled Work Blocks</span>
          {!data.possible || blocks.length === 0 ? (
            <p className="text-sm text-rose-400">⚠ No free slots found before the deadline.</p>
          ) : (
            blocks.map((b, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-2.5">
                <CalendarDays size={14} className="mt-0.5 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{b.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(b.start_at).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {" → "}
                    {new Date(b.end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
          {data.remaining_minutes > 0 && (
            <p className="text-xs text-amber-400">⚠ {data.remaining_minutes} minutes could not be scheduled before deadline.</p>
          )}
        </div>
      );
    }

    // Parsed Task
    if ("task" in data) {
      const taskTitle = data.task || "Unnamed Task";
      const priority = data.priority || "medium";
      const estMinutes = data.estimated_minutes || 60;
      const deadlineVal = data.deadline;
      const dependency = data.dependency;
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-accent/20 bg-[#74f7c5]/5 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-accent tracking-wider uppercase">Parsed Task</span>
                <h3 className="text-base font-semibold text-white mt-0.5">{taskTitle}</h3>
              </div>
              <span className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold capitalize ${
                priority === "high" ? "bg-amber-500/20 text-amber-400" :
                priority === "urgent" ? "bg-rose-500/20 text-rose-400" :
                priority === "low" ? "bg-white/10 text-muted" : "bg-cyan-500/20 text-cyan-400"
              }`}>{priority}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="font-semibold text-white/40">EST. DURATION</p><p className="text-white mt-0.5">{estMinutes} minutes</p></div>
              <div><p className="font-semibold text-white/40">DEADLINE</p><p className="text-white mt-0.5">{deadlineVal ? new Date(deadlineVal).toLocaleString() : "None"}</p></div>
            </div>
            {dependency && (
              <div className="border-t border-white/5 pt-2.5 text-xs">
                <p className="font-semibold text-amber-400">Dependency Alert</p>
                <p className="text-muted mt-0.5">Needs: <strong className="text-white">{dependency}</strong></p>
              </div>
            )}
          </div>
          <Button
            onClick={() => createTaskFromAI.mutate({
              title: taskTitle,
              priority: priority === "low" ? "Low" : priority === "high" ? "High" : priority === "urgent" ? "Urgent" : "Medium",
              estimated_minutes: Number(estMinutes),
              deadline: deadlineVal ? new Date(deadlineVal).toISOString() : null,
              status: "todo",
            })}
            disabled={createTaskFromAI.isPending}
            className="w-full bg-accent text-black hover:bg-accent/90"
          >
            {createTaskFromAI.isPending ? <Loader2 size={16} className="animate-spin text-black" /> : <Plus size={16} />}
            Add this Task to List
          </Button>
        </div>
      );
    }

    // Warm Start
    if ("outline" in data || "checklist" in data) {
      const outline   = (data.outline as string[]) || [];
      const draft     = data.first_draft || "";
      const checklist = (data.checklist as string[]) || [];
      const resources = (data.resources as string[]) || [];
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-amber tracking-wider uppercase">Warm Start Package</span>
          {draft && (
            <div className="rounded-lg bg-white/5 p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-white/60 uppercase">Starter Draft</h4>
                <button onClick={() => { navigator.clipboard.writeText(draft); alert("Copied!"); }} className="text-xs text-accent hover:underline">Copy</button>
              </div>
              <p className="text-sm italic text-muted whitespace-pre-wrap">{draft}</p>
            </div>
          )}
          {checklist.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/60 uppercase">Checklist</h4>
              {checklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm text-white cursor-pointer hover:bg-white/5 transition-colors">
                  <input type="checkbox" className="rounded border-white/20 cursor-pointer" /> <span>{item}</span>
                </label>
              ))}
            </div>
          )}
          {outline.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white/60 uppercase">Outline</h4>
              <ol className="list-decimal pl-4 text-sm text-white/80 space-y-1">{outline.map((item, idx) => <li key={idx}>{item}</li>)}</ol>
            </div>
          )}
          {resources.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-white/60 uppercase">Resources</h4>
              <ul className="list-disc pl-4 text-sm text-white/80 space-y-1">{resources.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
            </div>
          )}
        </div>
      );
    }

    // Panic Button
    if ("extension_email" in data || "risk_summary" in data) {
      const email    = data.extension_email || "";
      const proposal = (data.reschedule_proposal as string[]) || [];
      const risk     = data.risk_summary || "";
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-rose tracking-wider uppercase">Deadline Recovery Assets</span>
          {risk && <div className="rounded-lg border border-rose/30 bg-rose/10 p-4"><h4 className="text-xs font-bold text-rose uppercase mb-1">Risk Summary</h4><p className="text-sm text-white/90">{risk}</p></div>}
          {email && (
            <div className="rounded-lg bg-white/5 p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-white/60 uppercase">Extension Email Draft</h4>
                <button onClick={() => { navigator.clipboard.writeText(email); alert("Copied!"); }} className="text-xs text-rose hover:underline">Copy</button>
              </div>
              <p className="text-sm text-muted whitespace-pre-wrap">{email}</p>
            </div>
          )}
          {proposal.length > 0 && <ul className="list-disc pl-4 text-sm text-white/80 space-y-1">{proposal.map((item, idx) => <li key={idx}>{item}</li>)}</ul>}
        </div>
      );
    }

    // Follow Up
    if ("message" in data) {
      const message = data.message || "";
      const subject = data.subject || "";
      return (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-cyan tracking-wider uppercase">Follow-Up Draft</span>
          <div className="rounded-lg bg-white/5 p-4 border border-white/5 space-y-3">
            {subject && <div><h4 className="text-[10px] font-bold text-white/40 uppercase">Subject</h4><p className="text-sm font-semibold text-white">{subject}</p></div>}
            <div><h4 className="text-[10px] font-bold text-white/40 uppercase">Message</h4><p className="text-sm text-muted whitespace-pre-wrap mt-1">{message}</p></div>
            <Button onClick={() => { navigator.clipboard.writeText(message); alert("Copied!"); }} className="w-full bg-cyan-500 text-black hover:bg-cyan-400">Copy Message</Button>
          </div>
        </div>
      );
    }

    return (
      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-4 text-xs text-muted">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <AppShell>
      <PageHeader title="AI Assistant" subtitle="Powered by Ollama (llama3.2). Parse tasks, plan your day, recover from blockers." />

      {/* ── Mode Tabs ── */}
      <div className="mb-5 flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1 w-fit">
        <button
          onClick={() => { setActiveMode("assistant"); setResult(null); setError(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeMode === "assistant" ? "bg-accent text-black" : "text-muted hover:text-white"}`}
        >
          <span className="flex items-center gap-2"><Bot size={14} /> AI Assistant</span>
        </button>
        <button
          onClick={() => { setActiveMode("schedule"); setResult(null); setError(null); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeMode === "schedule" ? "bg-accent text-black" : "text-muted hover:text-white"}`}
        >
          <span className="flex items-center gap-2"><CalendarDays size={14} /> Daily Schedule</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        {/* ── Left Panel ── */}
        {activeMode === "assistant" ? (
          <Card>
            {/* Language bar */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted">Describe your task, deadline, or blocker:</p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-black/30 px-3 py-1.5 text-xs text-muted">
                <Globe size={14} className="text-accent" />
                <span>Language:</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-white font-medium outline-none cursor-pointer border-none p-0">
                  {[["English","English"],["Hindi","Hindi (हिन्दी)"],["Spanish","Spanish (Español)"],["French","French (Français)"],["German","German (Deutsch)"],["Urdu","Urdu (اردو)"],["Arabic","Arabic (العربية)"],["Chinese","Chinese (中文)"]].map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#0c0d12]">{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea id="ai-input" value={text} onChange={(e) => setText(e.target.value)}
              className="min-h-48 w-full resize-none rounded-lg border border-border bg-black/20 p-4 text-sm outline-none focus:border-accent text-white" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button id="btn-parse" onClick={() => parse.mutate()} disabled={isAssistantLoading}>
                {parse.isPending ? <Loader2 size={16} className="animate-spin text-black" /> : <Bot size={16} />} Parse Task
              </Button>
              <Button id="btn-schedule" onClick={() => schedule.mutate()} disabled={isAssistantLoading} className="bg-cyan-500 text-black hover:bg-cyan-400">
                {schedule.isPending ? <Loader2 size={16} className="animate-spin text-black" /> : <CalendarPlus size={16} />} Schedule
              </Button>
              <Button id="btn-warm" onClick={() => warm.mutate()} disabled={isAssistantLoading} className="bg-amber-500 text-black hover:bg-amber-400">
                {warm.isPending ? <Loader2 size={16} className="animate-spin text-black" /> : <Sparkles size={16} />} Warm Start
              </Button>
              <Button id="btn-panic" onClick={() => panic.mutate()} disabled={isAssistantLoading} className="bg-rose-600 text-white hover:bg-rose-500">
                {panic.isPending ? <Loader2 size={16} className="animate-spin text-white" /> : <Flame size={16} />} Panic Mode
              </Button>
            </div>
            {isAssistantLoading && <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Loader2 size={12} className="animate-spin" /> Thinking with llama3.2… 10–30 seconds on first run.</p>}
            {error && <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
          </Card>
        ) : (
          /* ── Daily Schedule Panel ── */
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-accent" />
              <h3 className="font-semibold text-white">Generate My Daily Routine</h3>
            </div>
            <p className="mb-4 text-xs text-muted">Tell the AI about your goals and lifestyle — it will build a personalized full-day schedule for you.</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted tracking-wider uppercase">Describe Your Day</label>
                <textarea
                  id="schedule-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. student preparing for exams with gym and coding sessions"
                  className="w-full min-h-28 resize-none rounded-lg border border-border bg-black/20 p-4 text-sm outline-none focus:border-accent text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted tracking-wider uppercase flex items-center gap-1">
                    <Sun size={12} className="text-amber-400" /> Wake Up Time
                  </label>
                  <input
                    type="time" value={wakeUp} onChange={(e) => setWakeUp(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-white/5 px-3 text-sm outline-none focus:border-accent text-white cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted tracking-wider uppercase flex items-center gap-1">
                    <Moon size={12} className="text-purple-400" /> Sleep Time
                  </label>
                  <input
                    type="time" value={sleepAt} onChange={(e) => setSleepAt(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-white/5 px-3 text-sm outline-none focus:border-accent text-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-black/30 px-3 py-2 text-xs text-muted w-fit">
                <Globe size={14} className="text-accent" />
                <span>Language:</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-white font-medium outline-none cursor-pointer border-none p-0">
                  {[["English","English"],["Hindi","Hindi (हिन्दी)"],["Spanish","Español"],["French","Français"],["German","Deutsch"],["Urdu","Urdu (اردو)"],["Arabic","العربية"],["Chinese","中文"]].map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#0c0d12]">{l}</option>
                  ))}
                </select>
              </div>

              <Button
                id="btn-daily-sched"
                onClick={() => dailySched.mutate()}
                disabled={isDailyLoading}
                className="w-full"
              >
                {isDailyLoading ? <Loader2 size={16} className="animate-spin text-black" /> : <CalendarDays size={16} />}
                Generate My Daily Schedule
              </Button>

              {isDailyLoading && (
                <p className="flex items-center gap-2 text-xs text-muted">
                  <Loader2 size={12} className="animate-spin" /> AI is building your schedule… 15–30 seconds.
                </p>
              )}
              {error && <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
            </div>
          </Card>
        )}

        {/* ── Right Panel: Output ── */}
        <Card>
          <h2 className="mb-3 text-xl font-semibold">AI Output</h2>
          {(isAssistantLoading || isDailyLoading) ? (
            <div className="flex items-center gap-3 rounded-lg bg-black/30 p-4">
              <Loader2 size={18} className="animate-spin text-accent" />
              <p className="text-sm text-muted">Generating response…</p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto rounded-lg bg-black/30 p-4 text-xs text-muted scrollbar-thin">
              {renderAIResponse()}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
