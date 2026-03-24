import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5 px-4"
      style={{ background: "var(--color-background)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--color-accent)" }}
      >
        <Sparkles size={24} color="black" />
      </div>
      <div className="text-center">
        <p
          className="text-6xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          404
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          This page doesn't exist
        </p>
      </div>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
        style={{ background: "var(--color-accent)", color: "black" }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
