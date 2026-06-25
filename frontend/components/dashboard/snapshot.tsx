"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BatteryCharging, CalendarClock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const cards = [
  { label: "Today's Tasks", value: "7", icon: CheckCircle2, tone: "text-accent" },
  { label: "Focus Blocks", value: "4", icon: CalendarClock, tone: "text-cyan" },
  { label: "Productivity", value: "82", icon: BatteryCharging, tone: "text-amber" },
  { label: "Dependency Alerts", value: "2", icon: AlertTriangle, tone: "text-rose" }
];

export function Snapshot() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card className="gradient-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{card.label}</p>
                <Icon className={card.tone} size={20} />
              </div>
              <p className="mt-4 text-4xl font-semibold">{card.value}</p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
