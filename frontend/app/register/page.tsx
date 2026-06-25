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
  const [form, setForm] = useState({ name: "Demo User", email: "demo@lifesaver.ai", password: "password123", timezone: "Asia/Kolkata" });
  async function submit() {
    const data = await api<{ access_token: string }>("/auth/register", { method: "POST", body: JSON.stringify(form) });
    setToken(data.access_token);
    router.push("/dashboard");
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <div className="mt-6 space-y-3">
          {Object.entries(form).map(([key, value]) => (
            <Input key={key} value={value} type={key === "password" ? "password" : "text"} placeholder={key} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          ))}
          <Button onClick={submit} className="w-full">Register</Button>
        </div>
      </Card>
    </main>
  );
}
