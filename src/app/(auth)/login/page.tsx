"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">TITE</h1>
        <p className="mb-6 text-sm text-ink-soft">¿Qué me pongo hoy?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[44px] rounded-xl border border-line px-3"
          />
          <label className="text-sm font-medium" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] rounded-xl border border-line px-3"
          />

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continuar con Google
        </Button>

        <p className="mt-6 text-center text-sm text-ink-soft">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-ink underline">
            Creá una
          </Link>
        </p>
      </Card>
    </main>
  );
}
