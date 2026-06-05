import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { sendEmailOtp, verifyEmailOtp } from "./auth.service";

function formatIndianPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("91") && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

function isValidIndianPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  return (
    cleaned.length === 10 ||
    (cleaned.startsWith("91") && cleaned.length === 12)
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isValidOtp(otp) {
  return /^\d{6,8}$/.test(otp.trim());
}

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    otp: false,
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const fullNameErr = useMemo(() => {
    if (!touched.fullName) return "";
    if (!fullName.trim()) return "Full name is required.";
    return "";
  }, [fullName, touched.fullName]);

  const emailErr = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "Email is required.";
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    return "";
  }, [email, touched.email]);

  const phoneErr = useMemo(() => {
    if (!touched.phone) return "";
    if (!phone.trim()) return "Mobile number is required.";
    if (!isValidIndianPhone(phone)) {
      return "Please enter a valid 10-digit mobile number.";
    }
    return "";
  }, [phone, touched.phone]);

  const otpErr = useMemo(() => {
    if (!otpSent || !touched.otp) return "";
    if (!otp.trim()) return "OTP is required.";
    if (!isValidOtp(otp)) return "Please enter a valid OTP.";
    return "";
  }, [otp, otpSent, touched.otp]);

  const canSendOtp =
    !sendingOtp &&
    !!fullName.trim() &&
    !!email.trim() &&
    !!phone.trim() &&
    !fullNameErr &&
    !emailErr &&
    !phoneErr;

  const canVerifyOtp =
    otpSent &&
    !verifyingOtp &&
    !!fullName.trim() &&
    !!email.trim() &&
    !!phone.trim() &&
    !!otp.trim() &&
    !fullNameErr &&
    !emailErr &&
    !phoneErr &&
    !otpErr;

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setTouched((value) => ({
      ...value,
      fullName: true,
      email: true,
      phone: true,
    }));

    if (
      !fullName.trim() ||
      !email.trim() ||
      !isValidEmail(email) ||
      !phone.trim() ||
      !isValidIndianPhone(phone)
    ) {
      setFormError("Please enter your name, valid email, and mobile number.");
      return;
    }

    setSendingOtp(true);
    try {
      const formattedPhone = formatIndianPhone(phone);
      const { error } = await sendEmailOtp({
        email: email.trim(),
        fullName: fullName.trim(),
        phone: formattedPhone,
        shouldCreateUser: true,
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
    setTouched({ fullName: true, email: true, phone: true, otp: true });

    if (
      !fullName.trim() ||
      !email.trim() ||
      !isValidEmail(email) ||
      !phone.trim() ||
      !isValidIndianPhone(phone) ||
      !otp.trim() ||
      !isValidOtp(otp)
    ) {
      setFormError("Please complete your details and enter the OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const formattedPhone = formatIndianPhone(phone);
      const { error } = await verifyEmailOtp({
        email: email.trim(),
        token: otp.trim(),
        fullName: fullName.trim(),
        phone: formattedPhone,
      });

      if (error) {
        setFormError(
          error.message || "OTP verification failed. Please try again.",
        );
        return;
      }

      toast.success("Account verified.");
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
                Create your account
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Email OTP
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Verify your email with OTP to finish signup.
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

            <Field
              label="Full name"
              value={fullName}
              placeholder="Enter your full name"
              autoComplete="name"
              error={fullNameErr}
              disabled={sendingOtp || verifyingOtp}
              onChange={setFullName}
              onBlur={() =>
                setTouched((value) => ({ ...value, fullName: true }))
              }
            />

            <Field
              className="mt-4"
              label="Email address"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              error={emailErr}
              disabled={sendingOtp || verifyingOtp}
              onChange={setEmail}
              onBlur={() =>
                setTouched((value) => ({ ...value, email: true }))
              }
            />

            <Field
              className="mt-4"
              label="Mobile number"
              type="tel"
              value={phone}
              placeholder="9876543210"
              autoComplete="tel"
              error={phoneErr}
              disabled={sendingOtp || verifyingOtp}
              onChange={setPhone}
              onBlur={() =>
                setTouched((value) => ({ ...value, phone: true }))
              }
              help="Enter your 10-digit number. We will automatically use +91."
            />

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
                  : "Verify OTP & Sign Up"
                : sendingOtp
                  ? "Sending OTP..."
                  : "Send OTP"}
            </button>

            <div className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                className="font-semibold text-slate-900 hover:underline"
                to="/login"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
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
          "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
          "outline-none transition focus:ring-4",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-slate-400 focus:ring-slate-100",
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
