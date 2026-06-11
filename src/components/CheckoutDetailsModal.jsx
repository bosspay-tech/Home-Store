import { useEffect, useRef, useState } from "react";
import { lookupPincode } from "../lib/pincode";

function formatMoney(n) {
  const num = Number(n || 0);
  return `₹${num.toFixed(0)}`;
}

const emptyCustomer = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const MIN_ADDRESS_WORDS = 8;

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function CheckoutDetailsModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  amount = 0,
  user = null,
  title = "Enter customer details",
  subtitle = "Please fill in your billing / shipping details to continue.",
}) {
  const [customer, setCustomer] = useState(emptyCustomer);
  const [error, setError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeHint, setPincodeHint] = useState("");
  const lastLookupRef = useRef("");

  useEffect(() => {
    if (!open) return;

    setCustomer({
      name: "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setError("");
    setPincodeHint("");
    lastLookupRef.current = "";
  }, [open, user]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const pincode = customer.pincode.replace(/\D/g, "");
    if (pincode.length !== 6) {
      setPincodeLoading(false);
      if (pincode.length < 6) {
        setPincodeHint("");
        lastLookupRef.current = "";
      }
      return undefined;
    }

    if (lastLookupRef.current === pincode) return undefined;

    let alive = true;
    const timer = setTimeout(async () => {
      setPincodeLoading(true);
      setPincodeHint("");

      try {
        const result = await lookupPincode(pincode);
        if (!alive) return;

        lastLookupRef.current = pincode;

        if (!result) {
          setPincodeHint("Pincode not found. Enter city and state manually.");
          return;
        }

        setCustomer((prev) => ({
          ...prev,
          city: result.city,
          state: result.state,
        }));
        setPincodeHint("City and state filled from pincode.");
      } catch {
        if (!alive) return;
        setPincodeHint("Could not fetch location. Enter city and state manually.");
      } finally {
        if (alive) setPincodeLoading(false);
      }
    }, 350);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [customer.pincode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pincode") {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      setCustomer((prev) => ({
        ...prev,
        pincode: digits,
      }));
      return;
    }

    if (name === "phone") {
      setCustomer((prev) => ({
        ...prev,
        phone: value.replace(/\D/g, "").slice(0, 10),
      }));
      return;
    }

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!customer.name.trim()) return "Please enter full name.";
    if (!customer.email.trim()) return "Please enter email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return "Please enter a valid email address.";
    }
    if (!customer.phone.trim()) return "Please enter phone number.";
    if (!/^\d{10}$/.test(customer.phone)) {
      return "Please enter a valid 10-digit phone number.";
    }
    if (!customer.address.trim()) return "Please enter address.";
    if (countWords(customer.address) < MIN_ADDRESS_WORDS) {
      return `Address must be at least ${MIN_ADDRESS_WORDS} words.`;
    }
    if (!customer.pincode.trim()) return "Please enter pincode.";
    if (!/^\d{6}$/.test(customer.pincode)) {
      return "Please enter a valid 6-digit pincode.";
    }
    if (!customer.city.trim()) return "Please enter city.";
    if (!customer.state.trim()) return "Please enter state.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    await onConfirm?.(customer);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!loading) onClose?.();
        }}
      />

      <div className="relative z-10 h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength={10}
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Address
              </label>
              <textarea
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="House no, street, area, landmark"
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
              <p
                className={[
                  "mt-1.5 text-xs",
                  countWords(customer.address) >= MIN_ADDRESS_WORDS
                    ? "text-emerald-700"
                    : "text-slate-500",
                ].join(" ")}
              >
                {countWords(customer.address)}/{MIN_ADDRESS_WORDS} words minimum
              </p>
            </div>

            <div className="sm:col-span-2 sm:max-w-xs">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={customer.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength={6}
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
              {pincodeLoading ? (
                <p className="mt-1.5 text-xs text-slate-500">
                  Looking up city and state...
                </p>
              ) : pincodeHint ? (
                <p
                  className={[
                    "mt-1.5 text-xs",
                    pincodeHint.includes("filled")
                      ? "text-emerald-700"
                      : "text-amber-700",
                  ].join(" ")}
                >
                  {pincodeHint}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">
                  City and state auto-fill when pincode is entered.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={customer.city}
                onChange={handleChange}
                placeholder="Auto-filled from pincode"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={customer.state}
                onChange={handleChange}
                placeholder="Auto-filled from pincode"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>

          {error ? (
            <div className="px-5 pb-3">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Total:{" "}
              <span className="font-bold text-slate-900">
                {formatMoney(amount)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || pincodeLoading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Please wait..." : "Continue"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
