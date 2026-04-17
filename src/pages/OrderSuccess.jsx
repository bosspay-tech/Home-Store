import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/cart.store";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function formatMoney(value) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return value || "";
  return `₹${num.toFixed(0)}`;
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const handledRef = useRef(false);

  const [status, setStatus] = useState("processing");
  const [txnId, setTxnId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const checkPayment = async () => {
      try {
        // The collect_ref is passed back as a query param or we read it
        // from the URL that 19Pay redirects to
        const collectRef =
          searchParams.get("collect_ref") ||
          searchParams.get("collectRef") ||
          searchParams.get("order_id") ||
          "";

        if (!collectRef) {
          setMessage("No payment reference found in the URL.");
          setStatus("failed");
          return;
        }

        setTxnId(collectRef);

        // First check our local DB — the webhook may have already updated it
        const { data: order } = await supabase
          .from("orders")
          .select("status, total")
          .eq("transaction_id", collectRef)
          .single();

        if (order) {
          setAmount(String(order.total || ""));

          if (order.status === "success") {
            clearCart();
            setStatus("success");
            return;
          }
          if (order.status === "failed") {
            setStatus("failed");
            return;
          }
        }

        // If still pending, poll the 19Pay status API
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/payment-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ collect_refs: [collectRef] }),
          },
        );

        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          const payment = result.data[0];
          const paymentStatus = (payment.status || "").toUpperCase();

          if (paymentStatus === "SUCCESS" || paymentStatus === "CAPTURED") {
            await supabase
              .from("orders")
              .update({ status: "success" })
              .eq("transaction_id", collectRef);
            clearCart();
            setStatus("success");
            return;
          }

          if (
            paymentStatus === "FAILED" ||
            paymentStatus === "DECLINED" ||
            paymentStatus === "CANCELLED"
          ) {
            await supabase
              .from("orders")
              .update({ status: "failed" })
              .eq("transaction_id", collectRef);
            setStatus("failed");
            return;
          }
        }

        // Still pending
        setStatus("unknown");
      } catch (error) {
        console.error("Error checking payment:", error);
        setMessage(error?.message || "Unable to verify payment.");
        setStatus("failed");
      }
    };

    checkPayment();
  }, [clearCart, searchParams]);

  if (status === "processing") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Processing payment...
      </div>
    );
  }

  const isSuccess = status === "success";
  const isUnknown = status === "unknown";

  return (
    <div className="min-h-[70vh] bg-linear-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
              isSuccess
                ? "bg-emerald-50"
                : isUnknown
                  ? "bg-amber-50"
                  : "bg-red-50"
            }`}
          >
            <span className="text-2xl">
              {isSuccess ? "✅" : isUnknown ? "⏳" : "❌"}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isSuccess
              ? "Payment successful"
              : isUnknown
                ? "Payment status pending"
                : "Payment failed"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {isSuccess
              ? "Your order has been placed successfully."
              : isUnknown
                ? "We received a payment response, but the final status could not be confirmed yet. It may take a few moments."
                : message || "Something went wrong with your payment."}
          </p>

          {txnId ? (
            <div className="mt-4 text-xs text-slate-500">
              Order Ref: <span className="font-semibold">{txnId}</span>
            </div>
          ) : null}

          {amount ? (
            <div className="text-xs text-slate-500">
              Amount:{" "}
              <span className="font-semibold">{formatMoney(amount)}</span>
            </div>
          ) : null}

          <div className="my-6 h-px w-full bg-slate-200" />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/products"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Continue shopping
            </Link>

            <Link
              to="/orders"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              View my orders
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              📦 Packed soon
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              🚚 Fast delivery
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              🔒 Secure payments
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Need help? Visit{" "}
          <Link
            to="/help"
            className="font-semibold text-slate-900 hover:underline"
          >
            Help Center
          </Link>
        </p>
      </div>
    </div>
  );
}
