import { Link } from "react-router-dom";
import { EFFECTIVE_DATE, LEGAL } from "../config/legal";

export default function TermsOfService() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {LEGAL.companyName} ({LEGAL.brandName}) · {LEGAL.website}
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                1. Agreement
              </h2>
              <p className="mt-2">
                By accessing or purchasing from {LEGAL.brandName}, you agree to
                these Terms of Service, our{" "}
                <Link to="/privacy" className="font-semibold text-slate-900 underline">
                  Privacy Policy
                </Link>
                ,{" "}
                <Link to="/shipping" className="font-semibold text-slate-900 underline">
                  Shipping Policy
                </Link>
                , and{" "}
                <Link to="/returns" className="font-semibold text-slate-900 underline">
                  Returns & Refunds Policy
                </Link>
                . If you do not agree, please do not use the website.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                2. Eligibility
              </h2>
              <p className="mt-2">
                You must be at least 18 years old and capable of entering a
                binding contract under Indian law. You are responsible for
                providing accurate account and delivery information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                3. Products & Availability
              </h2>
              <p className="mt-2">
                We sell home-care and cleaning products through our online store.
                Product images are for representation; packaging, labels, or
                batch details may vary from images. Stock availability, prices,
                and offers may change without prior notice. We may cancel orders
                affected by pricing errors, stock issues, or suspected fraud.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                4. Pricing, Taxes & Payments
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>All prices are shown in Indian Rupees (INR) unless stated otherwise.</li>
                <li>
                  Applicable taxes (including GST) are included or shown as per
                  product/checkout display.
                </li>
                <li>
                  Shipping charges are calculated at checkout. Free shipping
                  applies on orders of ₹{LEGAL.freeShippingMin} and above.
                </li>
                <li>
                  Payment is processed online through secure third-party gateways
                  (including NSDL / NineteenPay and Easebuzz). We accept UPI,
                  cards, and other methods supported by the gateway.
                </li>
                <li>
                  We do not store full card details or UPI PINs. Orders are
                  confirmed only after successful payment authorisation.
                </li>
                <li>
                  If payment fails or is cancelled, you may retry payment from the
                  order confirmation page using the same order reference.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                5. Orders & Account
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Placing an order constitutes an offer to purchase. We confirm
                  acceptance when payment is successful and the order is recorded.
                </li>
                <li>
                  You may shop as a guest or with an account (email OTP
                  sign-in). Account holders can view order history at{" "}
                  <Link to="/orders" className="font-semibold text-slate-900 underline">
                    My Orders
                  </Link>
                  .
                </li>
                <li>
                  You must provide a complete delivery address (minimum address
                  details as required at checkout) and a valid 6-digit pincode.
                </li>
                <li>
                  Orders may be cancelled before dispatch by contacting{" "}
                  <b>{LEGAL.email}</b> with your order reference.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                6. Shipping & Delivery
              </h2>
              <p className="mt-2">
                Delivery timelines and shipping charges are described in our{" "}
                <Link to="/shipping" className="font-semibold text-slate-900 underline">
                  Shipping Policy
                </Link>
                . Risk of loss passes to you upon delivery to the address
                provided.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                7. Returns & Refunds
              </h2>
              <p className="mt-2">
                Returns and refunds are handled as per our{" "}
                <Link to="/returns" className="font-semibold text-slate-900 underline">
                  Returns & Refunds Policy
                </Link>
                . Hygiene and sealed-product rules may apply to home-care items.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                8. Prohibited Use
              </h2>
              <p className="mt-2">
                You agree not to misuse the website, attempt unauthorised access,
                place fraudulent orders, resell products in violation of law, or
                interfere with site operations or payment systems.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                9. Intellectual Property
              </h2>
              <p className="mt-2">
                Website content, design, and {LEGAL.brandName} branding belong to{" "}
                {LEGAL.companyName} or its licensors. Product brand names and
                logos (e.g. cleaning brands) are trademarks of their respective
                owners and are used for identification only.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                10. Disclaimer
              </h2>
              <p className="mt-2">
                Products must be used as per manufacturer instructions. We are not
                responsible for misuse of products. The website is provided on an
                &quot;as is&quot; basis to the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                11. Limitation of Liability
              </h2>
              <p className="mt-2">
                To the maximum extent permitted under Indian law,{" "}
                {LEGAL.companyName} shall not be liable for indirect, incidental,
                or consequential damages. Our total liability for any claim
                relating to an order shall not exceed the amount you paid for that
                order.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                12. Governing Law & Disputes
              </h2>
              <p className="mt-2">
                These Terms are governed by the laws of India. Courts at{" "}
                {LEGAL.governingCity}, {LEGAL.governingState} shall have exclusive
                jurisdiction, subject to applicable consumer protection laws that
                may provide remedies in your place of residence.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                13. Contact
              </h2>
              <p className="mt-2">
                {LEGAL.companyName}
                <br />
                {LEGAL.address}
                <br />
                Email: <b>{LEGAL.email}</b> · Phone: <b>{LEGAL.phone}</b>
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
