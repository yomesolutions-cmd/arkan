import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import logo from "@/assets/arkan-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or sign up - Arkan Travel" },
      {
        name: "description",
        content:
          "Sign in or create an Arkan Travel account to manage all your reservations in one dashboard.",
      },
      { property: "og:title", content: "Sign in or sign up - Arkan Travel" },
      { property: "og:description", content: "Access or create your Arkan Travel bookings dashboard." },
    ],
  }),
  component: AuthPage,
});

function safePath(p: string | undefined) {
  return p && p.startsWith("/") && !p.startsWith("//") ? p : "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const dest = safePath(search.redirect);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest, replace: true });
    });
  }, [dest, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim();

      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (err) throw err;
        if (data.session) {
          navigate({ to: dest, replace: true });
          return;
        }
        setMessage("Check your inbox to confirm your account, then sign in.");
        return;
      }

      const { error: err } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (err) throw err;
      navigate({ to: dest, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    try {
      sessionStorage.setItem("arkan_redirect", dest);
    } catch {
      /* ignore */
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: dest, replace: true });
  }

  return (
    <div className="topo flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-[0_30px_70px_-45px_var(--ink)]">
        <Link to="/" className="flex justify-center">
          <img src={logo.url} alt="Arkan Travel logo" className="h-14 w-auto" width={160} height={160} />
        </Link>
        <p className="eyebrow mt-5 -rotate-2 text-center">Welcome</p>
        <h1 className="mt-2 text-center text-3xl font-extrabold text-ink">
          {mode === "signin" ? "Sign in to your trips" : "Create your account"}
        </h1>

        <button
          onClick={onGoogle}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-muted"
        >
          <span className="text-base font-bold text-coral">G</span> Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              maxLength={120}
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            maxLength={255}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            maxLength={72}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-accent-foreground">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-coral px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral-dark disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === "signin" ? "signup" : "signin"));
              setError(null);
              setMessage(null);
            }}
            className="font-semibold text-coral transition-colors hover:text-coral-dark"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
