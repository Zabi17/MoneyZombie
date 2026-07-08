import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/savings": "Savings",
  "/categories": "Categories",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatarError, setAvatarError] = useState(false);
  const title = TITLES[pathname] ?? "MoneyZombie";

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const fullName = (user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "") as string;
  const initial = fullName.charAt(0).toUpperCase() || "?";
  const showImage = Boolean(avatarUrl) && !avatarError;

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14"
      style={{
        background: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          aria-label="Go to settings"
          className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden shrink-0"
          style={{ background: "var(--color-accent)" }}
        >
          {showImage ? (
            <img
              src={avatarUrl}
              alt={fullName || "Profile"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-[10px] font-bold" style={{ color: "black" }}>
              {initial}
            </span>
          )}
        </button>
        <span
          className="font-bold text-base"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </span>
      </div>
    </header>
  );
}
