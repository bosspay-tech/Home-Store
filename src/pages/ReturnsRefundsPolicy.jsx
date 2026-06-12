import { Link } from "react-router-dom";
import { EFFECTIVE_DATE, LEGAL } from "../config/legal";

export default function ReturnsRefundsPolicy() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Returns & Refunds Policy
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
                1. Overview
              </h2>
              <p className="mt-2">
                We want you to receive the correct products in good condition.
                This policy explains when returns, replacements, or refunds are
                available. All orders are prepaid online; we do not offer Cash on
                Delivery (COD).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                2. Return Window
              </h2>
              <p className="mt-2">
                Return requests must be raised within <b>7 days</b> of delivery.
                Requests after this period may not be accepted unless required by
                applicable consumer protection law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                3. Eligible Reasons
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Wrong item delivered (not matching your order invoice)</li>
                <li>Item missing from the parcel</li>
                <li>
                  Product received damaged, leaking, or broken in transit
                  (with proof)
                </li>
                <li>
                  Significant defect making the product unfit for use (subject to
                  inspection)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                4. Non-Returnable Items
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Opened or used liquids, disinfectants, and hygiene products
                  (unless damaged/defective on arrival)
                </li>
                <li>
                  Products with broken seals, missing labels, or tampered
                  packaging due to customer handling
                </li>
                <li>Personalised or custom-made products</li>
                <li>
                  Items marked non-returnable on the product page at time of
                  purchase
                </li>
                <li>
                  Returns arising from incorrect address or refusal at delivery
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                5. Proof Required
              </h2>
              <p className="mt-2">
                For damaged or incorrect items, please provide clear photos or an
                unboxing video showing the outer package and the product issue.
                We strongly recommend recording video while opening the parcel.
                Claims without adequate proof may be declined.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                6. How to Request a Return
              </h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Email <b>{LEGAL.email}</b> or use our{" "}
                  <Link to="/contact" className="font-semibold text-slate-900 underline">
                    contact page
                  </Link>{" "}
                  within the return window.
                </li>
                <li>
                  Include your <b>order reference</b> (e.g. ORD…), registered
                  phone/email, and a description of the issue.
                </li>
                <li>Attach photos or video evidence where applicable.</li>
                <li>Wait for return authorisation before shipping any product back.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                7. Return Authorisation & Pickup
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Returns are accepted only after written authorisation from our
                  support team.
                </li>
                <li>
                  Unauthorised returns may be refused or sent back to the sender.
                </li>
                <li>
                  We may arrange reverse pickup or provide return instructions
                  depending on your pincode and courier coverage.
                </li>
                <li>
                  Products must be securely packed with all contents and original
                  packaging where possible.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                8. Cancellations
              </h2>
              <p className="mt-2">
                You may request cancellation before the order is dispatched by
                emailing <b>{LEGAL.email}</b> with your order reference. If
                already shipped, cancellation is not possible; you may request a
                return only if eligible under this policy after delivery.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                9. Refunds
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Approved refunds are processed within{" "}
                  <b>5–10 business days</b> after we receive and inspect the
                  returned item (or confirm a delivery issue without return, where
                  applicable).
                </li>
                <li>
                  Refunds are credited to the <b>original payment method</b> used
                  at checkout (UPI, card, or netbanking via our payment partner).
                </li>
                <li>
                  Shipping charges are non-refundable unless the return is due to
                  our error (wrong/damaged item).
                </li>
                <li>
                  Failed or cancelled payments: no charge is completed; you may
                  retry payment from the order page for pending orders.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                10. Replacement
              </h2>
              <p className="mt-2">
                Where eligible, we may offer a replacement of the same product
                (subject to stock). If unavailable, a refund will be issued to
                your original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                11. Damaged / Incorrect on Arrival
              </h2>
              <p className="mt-2">
                Report damaged or incorrect deliveries within{" "}
                <b>48 hours</b> of delivery with photos or video. We will review
                and offer replacement or refund as appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                12. Consumer Rights
              </h2>
              <p className="mt-2">
                Nothing in this policy limits your statutory rights under
                applicable Indian consumer protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                13. Contact
              </h2>
              <p className="mt-2">
                Email: <b>{LEGAL.email}</b> · Phone: <b>{LEGAL.phone}</b>
                <br />
                {LEGAL.address}
                <br />
                GST: {LEGAL.gst} · CIN: {LEGAL.cin}
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
