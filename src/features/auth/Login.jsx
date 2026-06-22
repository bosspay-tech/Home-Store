import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { sendEmailOtp, verifyEmailOtp, loginTestUser } from "./auth.service";
import { isTestEmail } from "../../config/testAuth";
import AuthLayout, {
  AuthAlert,
  AuthField,
  AuthStepIndicator,
  AuthSubmitButton,
} from "./AuthLayout";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isValidOtp(otp) {
  return /^\d{6,8}$/.test(otp.trim());
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
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
      if (isTestEmail(email)) {
        const { error } = await loginTestUser({ email: email.trim() });
        if (error) {
          setFormError(error.message || "Test login failed.");
          return;
        }
        toast.success("Signed in.");
        navigate(nextPath.startsWith("/") ? nextPath : "/");
        return;
      }

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
      navigate(nextPath.startsWith("/") ? nextPath : "/");
    } catch {
      setFormError(
        "Something went wrong while verifying OTP. Please try again.",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <AuthLayout
      variant="login"
      title="Sign in"
      subtitle="We'll send a one-time code to your email."
      footer={
        <>
          New here?{" "}
          <Link
            className="font-semibold text-emerald-700 hover:text-emerald-800"
            to="/signup"
          >
            Create an account
          </Link>
        </>
      }
    >
      <AuthStepIndicator otpSent={otpSent} />

      <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
        {formError ? <AuthAlert type="error">{formError}</AuthAlert> : null}
        {successMessage ? (
          <AuthAlert type="success">{successMessage}</AuthAlert>
        ) : null}

        <AuthField
          label="Email address"
          type="email"
          value={email}
          placeholder="you@example.com"
          autoComplete="email"
          error={emailErr}
          help={
            emailErr ? undefined : "Use the email registered with your account."
          }
          disabled={sendingOtp || verifyingOtp}
          onChange={setEmail}
          onBlur={() => setTouched((value) => ({ ...value, email: true }))}
        />

        {otpSent ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Enter OTP
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400"
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
              placeholder="6-digit code"
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, ""))
              }
              onBlur={() => setTouched((value) => ({ ...value, otp: true }))}
              className={[
                "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                "outline-none transition focus:ring-4",
                otpErr
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-50",
              ].join(" ")}
              autoComplete="one-time-code"
              disabled={verifyingOtp}
            />
            {otpErr ? (
              <p className="mt-2 text-xs text-red-600">{otpErr}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Check your inbox and spam folder for the code.
              </p>
            )}
          </div>
        ) : null}

        <AuthSubmitButton disabled={otpSent ? !canVerifyOtp : !canSendOtp}>
          {otpSent
            ? verifyingOtp
              ? "Verifying OTP..."
              : "Verify & sign in"
            : sendingOtp
              ? isTestEmail(email)
                ? "Signing in..."
                : "Sending OTP..."
              : isTestEmail(email)
                ? "Sign in"
                : "Send OTP"}
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
