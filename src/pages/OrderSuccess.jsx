import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCartStore } from "../store/cart.store";
import PaymentMethodModal from "../components/PaymentMethodModal";
import {
  createPaymentSession,
  orderToCustomer,
  savePaymentSession,
} from "../lib/payment";

function formatMoney(value) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return value || "";
  return `₹${num.toFixed(0)}`;
}

const ORDER_SELECT =
  "status, total, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_state, customer_pincode";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const handledRef = useRef(false);

  const [status, setStatus] = useState("processing");
  const [txnId, setTxnId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [retryError, setRetryError] = useState("");

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const checkPayment = async () => {
      try {
        const collectRef =
          searchParams.get("collect_ref") ||
          searchParams.get("collectRef") ||
          searchParams.get("txnid") ||
          searchParams.get("order_id") ||
          sessionStorage.getItem("payment_collect_ref") ||
          "";

        const paymentGateway =
          searchParams.get("gateway") ||
          sessionStorage.getItem("payment_gateway") ||
          "nineteenpay";

        if (!collectRef) {
          setMessage("No payment reference found in the URL.");
          setStatus("failed");
          return;
        }

        setTxnId(collectRef);

        const { data: orderRow } = await supabase
          .from("orders")
          .select(ORDER_SELECT)
          .eq("transaction_id", collectRef)
          .single();

        if (orderRow) {
          setOrder(orderRow);
          setAmount(String(orderRow.total || ""));
        }

        if (searchParams.get("status") === "failed") {
          setStatus("failed");
          setMessage("Payment was not completed.");
          return;
        }

        if (orderRow?.status === "success") {
          clearCart();
          sessionStorage.removeItem("payment_gateway");
          sessionStorage.removeItem("payment_collect_ref");
          setStatus("success");
          return;
        }

        if (orderRow?.status === "failed") {
          setStatus("failed");
          setMessage("Payment was not completed.");
          return;
        }

        const statusEndpoint =
          paymentGateway === "easebuzz"
            ? "/api/easebuzz/payment-status"
            : "/api/nineteenpay/payment-status";

        const response = await fetch(statusEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collect_refs: [collectRef] }),
        });

        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          const payment = result.data[0];
          const paymentStatus = (payment.status || "").toUpperCase();

          if (
            paymentStatus === "SUCCESS" ||
            paymentStatus === "CAPTURED"
          ) {
            await supabase
              .from("orders")
              .update({ status: "success" })
              .eq("transaction_id", collectRef);
            clearCart();
            sessionStorage.removeItem("payment_gateway");
            sessionStorage.removeItem("payment_collect_ref");
            setStatus("success");
            return;
          }

          if (
            paymentStatus === "FAILED" ||
            paymentStatus === "FAILURE" ||
            paymentStatus === "DECLINED" ||
            paymentStatus === "CANCELLED" ||
            paymentStatus === "USERCANCELLED"
          ) {
            await supabase
              .from("orders")
              .update({ status: "failed" })
              .eq("transaction_id", collectRef);
            setStatus("failed");
            setMessage("Payment was not completed.");
            return;
          }
        }

        setStatus("unknown");
      } catch (error) {
        console.error("Error checking payment:", error);
        setMessage(error?.message || "Unable to verify payment.");
        setStatus("failed");
      }
    };

    checkPayment();
  }, [clearCart, searchParams]);

  const handleRetryPayment = async (selectedGateway) => {
    if (!txnId || !order) {
      setRetryError("Order details not found. Please try checkout again.");
      return;
    }

    const customer = orderToCustomer(order);
    if (!customer.email || !customer.phone || !customer.name) {
      setRetryError("Missing customer details on this order.");
      return;
    }

    try {
      setRetryError("");
      setRetryLoading(true);

      await supabase
        .from("orders")
        .update({ status: "pending" })
        .eq("transaction_id", txnId);

      const data = await createPaymentSession({
        gateway: selectedGateway,
        collectRef: txnId,
        amount: Number(order.total || amount || 0),
        customer,
      });

      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.error || "Failed to create payment");
      }

      savePaymentSession(selectedGateway, txnId);
      setShowPaymentModal(false);
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setRetryError(error?.message || "Could not retry payment.");
      setRetryLoading(false);
      setShowPaymentModal(false);
    }
  };

  if (status === "processing") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Processing payment...
      </div>
    );
  }

  const isSuccess = status === "success";
  const isUnknown = status === "unknown";
  const canRetry = !isSuccess && txnId && order;

  return (
    <>
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

            {retryError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {retryError}
              </div>
            ) : null}

            <div className="my-6 h-px w-full bg-slate-200" />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {canRetry ? (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={retryLoading}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {retryLoading ? "Redirecting..." : "Retry payment"}
                </button>
              ) : null}

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
              to="/contact"
              className="font-semibold text-slate-900 hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>

      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => {
          if (!retryLoading) setShowPaymentModal(false);
        }}
        onSelect={handleRetryPayment}
        loading={retryLoading}
        amount={Number(order?.total || amount || 0)}
        customerName={order?.customer_name || ""}
      />
    </>
  );
}
