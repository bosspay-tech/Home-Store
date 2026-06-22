import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { isAdminUser } from "../../lib/admin";

export default function AdminLayout({ title, actions, children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Admin
            </p>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {user && isAdminUser(user) ? (
              <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/products"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              All products
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Storefront
            </Link>
            {actions}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
