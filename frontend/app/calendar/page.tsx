"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, RefreshCw, Trash2, Plus, X, ChevronLeft, ChevronRight, CalendarDays, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

type CalEvent = {
  id: string;
  title: string;
  provider: string;
  start_at: string;
  end_at: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PROVIDER_COLORS: Record<string, string> = {
  google:  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  manual:  "bg-accent/20 text-accent border-accent/30",
  outlook: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPage() {
  const client = useQueryClient();

  // Calendar navigation state
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle]   = useState("");
  const [eventDate, setEventDate]     = useState("");
  const [startTime, setStartTime]     = useState("09:00");
  const [endTime, setEndTime]         = useState("10:00");
  const [formError, setFormError]     = useState<string | null>(null);

  // Selected day for event list
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // --- Queries & Mutations ---
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: () => api<CalEvent[]>("/calendar/events"),
  });

  const sync = useMutation({
    mutationFn: () => api("/calendar/sync", { method: "POST", body: JSON.stringify({ provider: "google" }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["events"] }),
  });

  const create = useMutation({
    mutationFn: (payload: { title: string; start_at: string; end_at: string }) =>
      api("/calendar/events", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["events"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => setFormError(err.message || "Failed to create event."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/calendar/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["events"] }),
  });

  // --- Helpers ---
  const resetForm = () => {
    setEventTitle(""); setEventDate(""); setStartTime("09:00");
    setEndTime("10:00"); setFormError(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) { setFormError("Event title is required."); return; }
    if (!eventDate)          { setFormError("Please pick a date."); return; }
    if (startTime >= endTime) { setFormError("End time must be after start time."); return; }
    create.mutate({
      title: eventTitle.trim(),
      start_at: new Date(`${eventDate}T${startTime}:00`).toISOString(),
      end_at:   new Date(`${eventDate}T${endTime}:00`).toISOString(),
    });
  };

  // --- Calendar grid computation ---
  const calDays = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last  = new Date(viewYear, viewMonth + 1, 0);
    const days: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(viewYear, viewMonth, d));
    // pad to complete last row
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [viewYear, viewMonth]);

  const eventsOnDay = (day: Date) =>
    data.filter((e) => isSameDay(new Date(e.start_at), day));

  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  return (
    <AppShell>
      <PageHeader title="Calendar" subtitle="Synced calendar events and AI-protected focus time." />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button id="add-event-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={16} /> Add Event
        </Button>
        <Button
          id="sync-calendar-btn"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          {sync.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Sync Demo Calendar
        </Button>
        {error && <p className="text-sm text-rose-400">Could not load events — are you logged in?</p>}
        {sync.isSuccess && <p className="text-xs text-accent">Demo events synced ✓</p>}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* ── Calendar Grid ── */}
        <Card className="overflow-hidden p-0">
          {/* Month nav header */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <button onClick={prevMonth} className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-semibold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted">
              <Loader2 size={18} className="animate-spin" /> Loading events…
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-24 border-b border-r border-white/[0.04]" />;
                }
                const dayEvents = eventsOnDay(day);
                const isToday   = isSameDay(day, today);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`relative flex h-24 flex-col items-start gap-1 border-b border-r border-white/[0.04] p-2 text-left transition-colors
                      ${isSelected ? "bg-accent/10" : "hover:bg-white/[0.04]"}`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                      ${isToday ? "bg-accent text-black" : "text-muted"}`}>
                      {day.getDate()}
                    </span>
                    <div className="flex w-full flex-col gap-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border
                            ${PROVIDER_COLORS[e.provider] ?? "bg-white/10 text-white border-white/10"}`}
                        >
                          {e.title}
                        </span>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-muted pl-1">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Sidebar: selected day events ── */}
        <div className="space-y-4">
          <Card className="min-h-[200px]">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-accent" />
              <h3 className="font-semibold text-white">
                {selectedDay
                  ? selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                  : "Select a day"}
              </h3>
            </div>
            {!selectedDay ? (
              <p className="text-sm text-muted">Click any date on the calendar to see its events.</p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-sm text-muted">No events on this day. <button className="text-accent hover:underline" onClick={() => {
                resetForm();
                setEventDate(selectedDay.toISOString().slice(0, 10));
                setIsModalOpen(true);
              }}>Add one?</button></p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-lg border p-3 flex items-start justify-between gap-2
                      ${PROVIDER_COLORS[event.provider] ?? "bg-white/5 border-white/10"}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs opacity-70">
                        <Clock size={10} />
                        {new Date(event.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" → "}
                        {new Date(event.end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <button
                      title="Delete event"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(event.id)}
                      className="shrink-0 rounded p-1 text-current opacity-60 hover:opacity-100 disabled:opacity-30 transition-opacity"
                    >
                      {remove.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* All upcoming events list */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">Upcoming Events</h3>
            {data.length === 0 ? (
              <p className="text-xs text-muted">No events yet. Sync or add one above.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {[...data]
                  .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                  .filter((e) => new Date(e.end_at) >= today)
                  .slice(0, 10)
                  .map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                      <div>
                        <p className="text-xs font-medium text-white">{event.title}</p>
                        <p className="text-[10px] text-muted">
                          {new Date(event.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" · "}
                          {new Date(event.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(event.id)}
                        className="rounded p-1 text-muted hover:text-rose-400 disabled:opacity-40 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Add Event Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0c0d12]/90 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">New Calendar Event</h3>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="rounded-lg p-1 text-muted hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {formError && (
                  <div className="rounded-lg border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm text-rose">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted tracking-wider uppercase">
                    Event Title *
                  </label>
                  <Input
                    id="event-title"
                    placeholder="e.g. Team standup"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="border-white/10 bg-white/[0.03] focus:border-accent text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted tracking-wider uppercase">Date *</label>
                  <Input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="border-white/10 bg-white/[0.03] focus:border-accent text-white cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted tracking-wider uppercase">Start Time *</label>
                    <Input
                      id="event-start"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border-white/10 bg-white/[0.03] focus:border-accent text-white cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted tracking-wider uppercase">End Time *</label>
                    <Input
                      id="event-end"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-white/10 bg-white/[0.03] focus:border-accent text-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={create.isPending} className="min-w-32">
                    {create.isPending ? <Loader2 size={16} className="animate-spin text-black" /> : "Create Event"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
