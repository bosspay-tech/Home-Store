import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { isAdminUser } from "../lib/admin";

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!isAdminUser(user)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your account is not authorized for the admin panel. Contact the store
          owner if you need access.
        </p>
      </div>
    );
  }

  return children;
}
