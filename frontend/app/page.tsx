import Link from "next/link";
import { ArrowRight, Brain, Clock, type LucideIcon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const features: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: Clock, title: "Dynamic scheduling", text: "Finds free time and splits work before deadlines." },
    { icon: ShieldAlert, title: "Panic recovery", text: "Drafts extension emails, risk summaries, and fallback plans." },
    { icon: Brain, title: "Warm starts", text: "Generates outlines, checklists, resources, and starter drafts." }
  ];

  return (
    <main className="min-h-screen px-4 py-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="text-lg font-bold">Life Saver AI</div>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white">Login</Link>
          <Link href="/register"><Button>Start</Button></Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-8 pb-12 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold text-accent">AI productivity companion</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Life Saver AI</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Turn chaos dumps into prioritized tasks, protected work blocks, follow-ups, and deadline recovery plans before work slips.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard"><Button><ArrowRight size={16} /> Open dashboard</Button></Link>
            <Link href="/assistant" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-white/10">Try assistant</Link>
          </div>
        </div>
        <Card className="gradient-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-accent/20 p-3 text-accent"><Brain /></div>
            <div>
              <p className="font-semibold">Chaos dump parsed</p>
              <p className="text-sm text-muted">Physics exam, Max notes dependency, high priority</p>
            </div>
          </div>
          <div className="space-y-3">
            {["10:00 AM Study block", "2:00 PM Request notes", "5:00 PM Practice problems"].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-black/20 p-3 text-sm">{item}</div>
            ))}
          </div>
        </Card>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <Icon className="mb-4 text-accent" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
