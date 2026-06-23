import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      const nextPath = searchParams.get("next") || "/";
      const safeNext = nextPath.startsWith("/") ? nextPath : "/";

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;

        if (error) {
          toast.error(error.message || "Could not complete sign in.");
          navigate("/login", { replace: true });
          return;
        }

        toast.success("Signed in.");
        navigate(safeNext, { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        toast.error(error.message || "Could not complete sign in.");
        navigate("/login", { replace: true });
        return;
      }

      if (data.session) {
        toast.success("Signed in.");
        navigate(safeNext, { replace: true });
        return;
      }

      setMessage("Link expired or invalid. Redirecting to login...");
      navigate("/login", { replace: true });
    }

    completeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !session) return;
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const nextPath = searchParams.get("next") || "/";
        navigate(nextPath.startsWith("/") ? nextPath : "/", { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4 py-16 text-center">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
