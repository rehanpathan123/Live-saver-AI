import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-4 text-center">
      <div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-5xl font-semibold">This deadline vanished.</h1>
        <p className="mt-4 text-muted">The page you wanted is not available.</p>
        <Link href="/dashboard" className="mt-6 inline-block"><Button>Return to dashboard</Button></Link>
      </div>
    </main>
  );
}
