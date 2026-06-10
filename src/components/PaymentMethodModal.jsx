function formatMoney(n) {
  const num = Number(n || 0);
  return `₹${num.toFixed(0)}`;
}

export default function PaymentMethodModal({
  open,
  onClose,
  onSelect,
  loading = false,
  amount = 0,
  customerName = "",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!loading) onClose?.();
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Choose payment method</h3>
        <p className="mt-1 text-sm text-slate-500">
          {customerName ? `Paying as ${customerName}. ` : ""}
          Total {formatMoney(amount)}
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect?.("nineteenpay")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="text-sm font-semibold text-slate-900">NSDL</p>
            <p className="mt-1 text-xs text-slate-500">
              UPI / redirect via NineteenPay NSDL collect
            </p>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => onSelect?.("easebuzz")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="text-sm font-semibold text-slate-900">Easebuzz</p>
            <p className="mt-1 text-xs text-slate-500">
              Cards, UPI, netbanking via Easebuzz
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
