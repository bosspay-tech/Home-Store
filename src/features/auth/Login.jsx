import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { sendEmailOtp, verifyEmailOtp } from "./auth.service";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isValidOtp(otp) {
  return /^\d{6,8}$/.test(otp.trim());
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [touched, setTouched] = useState({ email: false, otp: false });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const emailErr = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "Email is required.";
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    return "";
  }, [email, touched.email]);

  const otpErr = useMemo(() => {
    if (!otpSent || !touched.otp) return "";
    if (!otp.trim()) return "OTP is required.";
    if (!isValidOtp(otp)) return "Please enter a valid OTP.";
    return "";
  }, [otp, otpSent, touched.otp]);

  const canSendOtp = !sendingOtp && !!email.trim() && !emailErr;
  const canVerifyOtp =
    otpSent &&
    !verifyingOtp &&
    !!email.trim() &&
    !!otp.trim() &&
    !emailErr &&
    !otpErr;

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setTouched((value) => ({ ...value, email: true }));

    if (!email.trim() || !isValidEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    try {
      const { error } = await sendEmailOtp({
        email: email.trim(),
        shouldCreateUser: false,
      });

      if (error) {
        setFormError(error.message || "Failed to send OTP. Please try again.");
        return;
      }

      setOtpSent(true);
      setOtp("");
      setTouched((value) => ({ ...value, otp: false }));
      setSuccessMessage(`OTP sent to ${email.trim()}`);
    } catch {
      setFormError("Something went wrong while sending OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setTouched({ email: true, otp: true });

    if (
      !email.trim() ||
      !isValidEmail(email) ||
      !otp.trim() ||
      !isValidOtp(otp)
    ) {
      setFormError("Please enter your email and the OTP sent to your inbox.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const { error } = await verifyEmailOtp({
        email: email.trim(),
        token: otp.trim(),
      });

      if (error) {
        setFormError(
          error.message || "OTP verification failed. Please try again.",
        );
        return;
      }

      toast.success("Login verified.");
      navigate("/");
    } catch {
      setFormError(
        "Something went wrong while verifying OTP. Please try again.",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Email OTP
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Sign in by verifying the OTP sent to your email.
            </p>
          </div>

          <form
            className="px-6 pb-6 pt-5"
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          >
            {formError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

            <label className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched((value) => ({ ...value, email: true }))}
              className={[
                "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                "outline-none transition focus:ring-4",
                emailErr
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-100",
              ].join(" ")}
              autoComplete="email"
              disabled={sendingOtp || verifyingOtp}
            />
            {emailErr ? (
              <p className="mt-2 text-xs text-red-600">{emailErr}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Use the email registered with your account.
              </p>
            )}

            {otpSent ? (
              <>
                <div className="mt-4 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Enter OTP
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || verifyingOtp}
                  >
                    {sendingOtp ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={otp}
                  placeholder="Enter OTP"
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  onBlur={() =>
                    setTouched((value) => ({ ...value, otp: true }))
                  }
                  className={[
                    "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                    "outline-none transition focus:ring-4",
                    otpErr
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-slate-400 focus:ring-slate-100",
                  ].join(" ")}
                  autoComplete="one-time-code"
                  disabled={verifyingOtp}
                />
                {otpErr ? (
                  <p className="mt-2 text-xs text-red-600">{otpErr}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Enter the code sent to your email address.
                  </p>
                )}
              </>
            ) : null}

            <button
              type="submit"
              disabled={otpSent ? !canVerifyOtp : !canSendOtp}
              className={[
                "mt-5 w-full rounded-xl py-3 text-sm font-semibold transition",
                "focus:outline-none focus:ring-4 focus:ring-slate-200",
                (otpSent ? canVerifyOtp : canSendOtp)
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500",
              ].join(" ")}
            >
              {otpSent
                ? verifyingOtp
                  ? "Verifying OTP..."
                  : "Verify OTP"
                : sendingOtp
                  ? "Sending OTP..."
                  : "Send OTP"}
            </button>

            <div className="mt-5 text-center text-sm text-slate-600">
              New here?{" "}
              <Link
                className="font-semibold text-slate-900 hover:underline"
                to="/signup"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
