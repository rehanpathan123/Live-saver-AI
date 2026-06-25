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
  async function submit() {
    const data = await api<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setToken(data.access_token);
    router.push("/dashboard");
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <div className="mt-6 space-y-3">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
          <Button onClick={submit} className="w-full">Login</Button>
        </div>
        <Link href="/register" className="mt-4 block text-sm text-muted hover:text-white">Create an account</Link>
      </Card>
    </main>
  );
}
