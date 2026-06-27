"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ access_token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg.includes("409") || msg.toLowerCase().includes("already") ? "This email is already registered. Try logging in." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-muted">Join Life Saver AI — free forever.</p>
        <div className="mt-6 space-y-3">
          <Input id="register-name" value={form.name} placeholder="Full name" onChange={(e) => update("name", e.target.value)} />
          <Input id="register-email" value={form.email} placeholder="Email" type="email" onChange={(e) => update("email", e.target.value)} />
          <Input id="register-password" value={form.password} placeholder="Password (min 8 chars)" type="password" onChange={(e) => update("password", e.target.value)} />
          <Input id="register-timezone" value={form.timezone} placeholder="Timezone" onChange={(e) => update("timezone", e.target.value)} />
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}
          <Button id="register-submit" onClick={submit} className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </Button>
        </div>
        <a href="/login" className="mt-4 block text-sm text-muted hover:text-white">
          Already have an account? Sign in →
        </a>
      </Card>
    </main>
  );
}
