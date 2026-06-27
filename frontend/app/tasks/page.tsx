"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

type Task = { id: string; title: string; priority: string; status: string; deadline?: string };

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-white/10 text-muted",
  medium: "bg-cyan-500/20 text-cyan-400",
  high: "bg-amber-500/20 text-amber-400",
  urgent: "bg-rose-500/20 text-rose-400",
};

export default function TasksPage() {
  const client = useQueryClient();
  const { data = [], isLoading: loadingTasks, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api<Task[]>("/tasks"),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("todo");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("todo");
    setDeadline("");
    setEstimatedMinutes(60);
    setValidationError(null);
  };

  const create = useMutation({
    mutationFn: (newTask: {
      title: string;
      description?: string;
      priority: string;
      status: string;
      deadline?: string | null;
      estimated_minutes: number;
    }) =>
      api("/tasks", {
        method: "POST",
        body: JSON.stringify(newTask),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["tasks"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) {
      setValidationError("Title must be at least 2 characters long.");
      return;
    }
    if (title.trim().length > 240) {
      setValidationError("Title must be less than 240 characters.");
      return;
    }
    if (estimatedMinutes < 15 || estimatedMinutes > 1440) {
      setValidationError("Estimated minutes must be between 15 and 1440.");
      return;
    }

    create.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      estimated_minutes: Number(estimatedMinutes),
    });
  };

  return (
    <AppShell>
      <PageHeader title="Tasks" subtitle="Prioritized work, dependencies, and status in one focused queue." />
      <div className="mb-4 flex items-center gap-3">
        <Button id="add-task-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add Task
        </Button>
        {error && <p className="text-sm text-rose-400">Could not load tasks — are you logged in?</p>}
      </div>

      {loadingTasks ? (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading tasks…
        </div>
      ) : data.length === 0 ? (
        <Card className="text-center text-muted">
          <p>No tasks yet. Click <strong>Add Task</strong> to create one.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.map((task) => (
            <Card key={task.id} className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">{task.title}</h2>
                <p className="text-sm text-muted capitalize">
                  {task.status.replace("_", " ")} ·{" "}
                  {task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-3 py-1 text-xs capitalize ${PRIORITY_COLORS[task.priority.toLowerCase()] ?? "bg-white/10"}`}>
                  {task.priority}
                </span>
                <button
                  title="Delete task"
                  onClick={() => remove.mutate(task.id)}
                  className="rounded p-1 text-muted hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modern Glassmorphic Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0c0d12]/90 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Create New Task</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="rounded-lg p-1 text-muted hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {validationError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm text-rose">
                    <AlertCircle size={16} />
                    <span>{validationError}</span>
                  </div>
                )}

                {create.error && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose/30 bg-rose/10 px-4 py-2.5 text-sm text-rose">
                    <AlertCircle size={16} />
                    <span>{(create.error as Error).message || "Failed to create task."}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="task-title" className="text-xs font-semibold text-muted tracking-wider uppercase">
                    Title *
                  </label>
                  <Input
                    id="task-title"
                    placeholder="E.g., Review project proposal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="border-white/10 bg-white/[0.03] focus:border-accent text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="task-desc" className="text-xs font-semibold text-muted tracking-wider uppercase">
                    Description
                  </label>
                  <textarea
                    id="task-desc"
                    placeholder="Add details about this task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-24 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-accent text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="task-priority" className="text-xs font-semibold text-muted tracking-wider uppercase">
                      Priority
                    </label>
                    <select
                      id="task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full h-10 rounded-lg border border-white/10 bg-[#161821] px-3 text-sm outline-none focus:border-accent text-white cursor-pointer"
                    >
                      <option value="Low" className="bg-[#0c0d12] text-white">Low</option>
                      <option value="Medium" className="bg-[#0c0d12] text-white">Medium</option>
                      <option value="High" className="bg-[#0c0d12] text-white">High</option>
                      <option value="Urgent" className="bg-[#0c0d12] text-white">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="task-status" className="text-xs font-semibold text-muted tracking-wider uppercase">
                      Status
                    </label>
                    <select
                      id="task-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 rounded-lg border border-white/10 bg-[#161821] px-3 text-sm outline-none focus:border-accent text-white cursor-pointer"
                    >
                      <option value="todo" className="bg-[#0c0d12] text-white">Todo</option>
                      <option value="scheduled" className="bg-[#0c0d12] text-white">Scheduled</option>
                      <option value="in_progress" className="bg-[#0c0d12] text-white">In Progress</option>
                      <option value="blocked" className="bg-[#0c0d12] text-white">Blocked</option>
                      <option value="completed" className="bg-[#0c0d12] text-white">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="task-deadline" className="text-xs font-semibold text-muted tracking-wider uppercase">
                      Deadline
                    </label>
                    <Input
                      id="task-deadline"
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="border-white/10 bg-white/[0.03] focus:border-accent text-white cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="task-minutes" className="text-xs font-semibold text-muted tracking-wider uppercase">
                      Est. Minutes
                    </label>
                    <Input
                      id="task-minutes"
                      type="number"
                      min={15}
                      max={1440}
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                      className="border-white/10 bg-white/[0.03] focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={create.isPending}
                    className="min-w-28"
                  >
                    {create.isPending ? (
                      <Loader2 size={16} className="animate-spin text-black" />
                    ) : (
                      "Create Task"
                    )}
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
