"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState("demo@lifesaver.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to your Life Saver AI account.</p>
        <div className="mt-6 space-y-3">
          <Input
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />
          <Input
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}
          <Button id="login-submit" onClick={submit} className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Button>
        </div>
        <Link href="/register" className="mt-4 block text-sm text-muted hover:text-white">
          Don&apos;t have an account? Create one →
        </Link>
      </Card>
    </main>
  );
}
