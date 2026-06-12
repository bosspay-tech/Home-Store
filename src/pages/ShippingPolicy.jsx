import { Link } from "react-router-dom";
import { EFFECTIVE_DATE, LEGAL } from "../config/legal";

export default function ShippingPolicy() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Shipping Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {LEGAL.companyName} ({LEGAL.brandName})
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                1. Serviceable Areas
              </h2>
              <p className="mt-2">
                We currently ship across India to valid 6-digit pincodes served
                by our courier partners. Delivery availability for your location
                may be checked on the product page before ordering. We reserve
                the right to decline orders to unserviceable or restricted
                areas.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                2. Order Processing
              </h2>
              <p className="mt-2">
                Orders are typically processed within{" "}
                <b>24–48 business hours</b> after successful payment confirmation.
                Processing may take longer during sales, festivals, or high-demand
                periods. Business days exclude Sundays and public holidays.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                3. Delivery Timelines
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Metro cities: usually <b>2–4 business days</b> after dispatch
                </li>
                <li>
                  Other locations: usually <b>3–7 business days</b> after dispatch
                </li>
              </ul>
              <p className="mt-2 text-slate-600">
                These are estimates only. Actual delivery depends on pincode,
                courier partner, weather, and local conditions. Delays do not
                automatically entitle cancellation unless stated under our
                Returns policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                4. Shipping Charges
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <b>Free shipping</b> on orders of ₹{LEGAL.freeShippingMin} and
                  above (subtotal before shipping).
                </li>
                <li>
                  For orders below ₹{LEGAL.freeShippingMin}, shipping is
                  calculated at checkout based on your cart value and rounded to
                  the nearest ₹50 for a clear payable total.
                </li>
                <li>
                  Shipping charges are shown in the cart and checkout summary
                  before you pay.
                </li>
                <li>Shipping fees are non-refundable except where required by law or under our Returns policy for our error.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                5. Packaging & Safety
              </h2>
              <p className="mt-2">
                Home-care products such as disinfectants, floor cleaners, and
                liquid detergents are packed with leak-aware handling. Please
                inspect outer packaging at delivery and report visible damage
                within 48 hours — see our{" "}
                <Link to="/returns" className="font-semibold text-slate-900 underline">
                  Returns & Refunds Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                6. Address & Delivery Attempts
              </h2>
              <p className="mt-2">
                Please provide a complete delivery address, valid mobile number,
                and correct pincode at checkout. Courier partners usually attempt
                delivery 2–3 times. If delivery fails due to incorrect address,
                refusal, or repeated unavailability, the parcel may be returned to
                us and re-shipping charges may apply.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                7. Order Tracking
              </h2>
              <p className="mt-2">
                Once dispatched, tracking details (if available) are shared via
                email/SMS. Signed-in customers can also check status under{" "}
                <Link to="/orders" className="font-semibold text-slate-900 underline">
                  My Orders
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                8. Lost or Delayed Shipments
              </h2>
              <p className="mt-2">
                If your order is significantly delayed or appears lost in transit,
                contact us at <b>{LEGAL.email}</b> with your order reference. We
                will coordinate with the courier and update you on replacement
                or refund as applicable.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                9. Contact
              </h2>
              <p className="mt-2">
                Email: <b>{LEGAL.email}</b> · Phone: <b>{LEGAL.phone}</b>
                <br />
                {LEGAL.address}
              </p>
              <p className="mt-2">
                <Link to="/contact" className="font-semibold text-slate-900 underline">
                  Contact us
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
