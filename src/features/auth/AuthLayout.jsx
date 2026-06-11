import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, Truck } from "lucide-react";

const LOGIN_POINTS = [
  { icon: ShieldCheck, text: "Secure email OTP — no password to remember" },
  { icon: Truck, text: "Track orders and delivery from your account" },
  { icon: Sparkles, text: "Fast checkout on every purchase" },
];

const SIGNUP_POINTS = [
  { icon: ShieldCheck, text: "Verify once with email OTP to get started" },
  { icon: Truck, text: "Save details for quicker repeat orders" },
  { icon: Sparkles, text: "Access order history and support anytime" },
];

export default function AuthLayout({
  variant = "login",
  title,
  subtitle,
  children,
  footer,
}) {
  const points = variant === "signup" ? SIGNUP_POINTS : LOGIN_POINTS;
  const eyebrow = variant === "signup" ? "Create account" : "Sign in";
  const headline =
    variant === "signup"
      ? "Join Vyapar Vault in minutes."
      : "Welcome back to Vyapar Vault.";

  return (
    <main className="bg-slate-50">
      <div className="lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to store
            </Link>

            <p className="mt-8 text-xs font-semibold tracking-widest text-emerald-400 uppercase lg:mt-12">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
              {headline}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Everyday home-care essentials with simple checkout, reliable
              packing, and quick support.
            </p>
          </div>

          <ul className="relative mt-10 hidden space-y-4 lg:block">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-slate-200">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <p className="relative mt-8 hidden text-xs text-slate-500 lg:block">
            © {new Date().getFullYear()} Vyapar Vault
          </p>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Link
                to="/"
                className="text-lg font-bold tracking-tight text-slate-900"
              >
                Vyapar Vault
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Email OTP
                </span>
              </div>

              <div className="mt-6">{children}</div>

              {footer ? (
                <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthAlert({ type = "error", children }) {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${styles}`}
      role="alert"
    >
      {children}
    </div>
  );
}

export function AuthField({
  className = "",
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  error,
  help,
  disabled,
  onChange,
  onBlur,
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={[
          "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
          "outline-none transition focus:ring-4",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-50",
        ].join(" ")}
        autoComplete={autoComplete}
        disabled={disabled}
      />
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : help ? (
        <p className="mt-2 text-xs text-slate-500">{help}</p>
      ) : null}
    </div>
  );
}

export function AuthStepIndicator({ otpSent }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Step number={1} label="Details" active={!otpSent} done={otpSent} />
      <div
        className={`h-px flex-1 ${otpSent ? "bg-emerald-300" : "bg-slate-200"}`}
      />
      <Step number={2} label="Verify OTP" active={otpSent} done={false} />
    </div>
  );
}

function Step({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
          done
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {done ? "✓" : number}
      </span>
      <span
        className={[
          "text-xs font-medium",
          active || done ? "text-slate-900" : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

export function AuthSubmitButton({ disabled, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={[
        "mt-6 w-full rounded-2xl py-3.5 text-sm font-semibold transition",
        "focus:outline-none focus:ring-4 focus:ring-emerald-100",
        disabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500"
          : "bg-emerald-600 text-white hover:bg-emerald-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
