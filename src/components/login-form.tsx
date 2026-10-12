"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

const providers = [
  {
    name: "Google",
    icon: (
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path fill="#ffffff" d="M15.6 8h-1.5c-.8 0-1.1.4-1.1 1.1v1.5h2.5l-.3 2.6H13V20h-2.7v-6.8H8.4v-2.6h1.9V8.8c0-2 1.2-3.1 3-3.1.9 0 1.7.1 2.3.2z" />
      </svg>
    ),
  },
  {
    name: "X",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
        <path fill="#101211" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#0A66C2" />
        <circle cx="7" cy="7.2" r="1.6" fill="#ffffff" />
        <rect x="5.6" y="10" width="2.8" height="8.4" fill="#ffffff" />
        <path fill="#ffffff" d="M10.6 10h2.7v1.2c.5-.8 1.5-1.5 2.9-1.5 2.4 0 3.2 1.5 3.2 4v4.7h-2.8v-4.2c0-1.2-.3-2-1.4-2-1.2 0-1.8.8-1.8 2v4.2h-2.8z" />
      </svg>
    ),
  },
];

// Sign-in is not connected to a real account system yet: every route here opens the demo dashboard.
export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const enterDemo = () => router.push("/dashboard");

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          enterDemo();
        }}
        className="space-y-4"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Email</span>
          <span className="login-field">
            <Mail className="h-4 w-4 shrink-0 text-ink-soft/70" />
            <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className="login-input" />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Password</span>
          <span className="login-field">
            <Lock className="h-4 w-4 shrink-0 text-ink-soft/70" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="login-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="shrink-0 text-ink-soft/70 hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <button type="submit" className="login-submit">
          Log in <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-soft/70">
        <span className="h-px flex-1 bg-line" />
        or continue with
        <span className="h-px flex-1 bg-line" />
      </div>

      <button type="button" onClick={enterDemo} className="login-social login-social-wide">
        {providers[0].icon}
        Continue with Google
      </button>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {providers.slice(1).map((provider) => (
          <button key={provider.name} type="button" onClick={enterDemo} aria-label={`Continue with ${provider.name}`} className="login-social">
            {provider.icon}
            <span className="hidden sm:inline">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
