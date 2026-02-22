"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setIsLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    // Si no hay error, el navegador redirige a Google → no hacemos nada más aquí
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <div className="w-full max-w-xs">
        {/* Header */}
        <div className="mb-10 text-center">
          <p
            className="mb-2 text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            Control Financiero
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            <span style={{ color: "var(--color-accent)" }}>Debt</span>
            <span style={{ color: "var(--color-text-primary)" }}>Tracker</span>
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Regulariza tus deudas con IA
          </p>
        </div>

        {/* Card */}
        <div
          className="border p-7"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="mb-1 text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Iniciar sesión
          </h2>
          <p
            className="mb-6 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Usa tu cuenta de Google para continuar.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            aria-label="Iniciar sesión con Google"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
              minHeight: "48px", // Touch target ≥44px (WCAG)
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-3 border bg-transparent px-5 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-[var(--color-accent-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                Redirigiendo...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continuar con Google
              </>
            )}
          </button>

          {error && (
            <p
              role="alert"
              className="mt-4 text-center text-xs"
              style={{ color: "var(--color-danger)" }}
            >
              {error}
            </p>
          )}
        </div>

        <p
          className="mt-5 text-center text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Tu información es privada. Solo tú puedes acceder a ella.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
