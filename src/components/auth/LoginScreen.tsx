import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signInWithGoogle();
    // Page will redirect to Google, so no need to setLoading(false)
  };

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-background)" }}
    >
      <div className="w-full max-w-sm space-y-10 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl"
            style={{ background: "var(--color-accent)" }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-125"
            />
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              MoneyZombie
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Your personal finance tracker
            </p>
          </div>
        </div>

        {/* Sign in card */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        >
          {/* Google icon SVG */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Your data is secured & private • made by{" "}
          <a
            href="https://linkedin.com/in/zabiahmed3717"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            Zabi Ahmed
          </a>
        </p>
      </div>
    </div>
  );
}
