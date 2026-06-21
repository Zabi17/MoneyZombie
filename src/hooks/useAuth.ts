import { useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      initializedRef.current = true;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only trigger a state update if auth actually changed (login/logout)
      // Ignore TOKEN_REFRESHED and other non-auth-change events
      if (_event === "SIGNED_IN" || _event === "SIGNED_OUT") {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: import.meta.env.VITE_APP_URL,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signInWithGoogle, signOut };
}
