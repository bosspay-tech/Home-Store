import { Link } from "react-router-dom";
import { EFFECTIVE_DATE, LEGAL } from "../config/legal";

export default function PrivacyPolicy() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Operated by <b>{LEGAL.companyName}</b> ({LEGAL.brandName}) at{" "}
            <a
              href={LEGAL.website}
              className="font-medium text-slate-900 underline"
            >
              {LEGAL.website.replace("https://", "")}
            </a>
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                1. Introduction
              </h2>
              <p className="mt-2">
                This Privacy Policy explains how {LEGAL.companyName} collects,
                uses, stores, and protects your personal information when you use
                our website, create an account, place orders, or contact
                support. By using our services, you agree to this policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                2. Information We Collect
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <b>Account data:</b> name, email address, mobile number
                  (sign-up / sign-in via email OTP)
                </li>
                <li>
                  <b>Order data:</b> shipping address, city, state, pincode,
                  items purchased, order value, order status, transaction
                  reference
                </li>
                <li>
                  <b>Payment data:</b> payment status, gateway reference, and
                  amount — we do <b>not</b> store card numbers, CVV, or UPI PINs
                </li>
                <li>
                  <b>Technical data:</b> browser type, device information, IP
                  address, cookies, and local storage (e.g. cart items)
                </li>
                <li>
                  <b>Communications:</b> messages you send to support via email
                  or our contact form
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                3. How We Use Your Information
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Process and fulfil orders, including delivery and returns</li>
                <li>Authenticate your account and manage order history</li>
                <li>Send order confirmations, shipping updates, and support replies</li>
                <li>Prevent fraud, abuse, and unauthorised transactions</li>
                <li>Improve our website, products, and customer experience</li>
                <li>Comply with applicable laws, tax, and accounting requirements</li>
                <li>
                  Send promotional emails only if you opt in (you may unsubscribe
                  anytime)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                4. Sharing of Information
              </h2>
              <p className="mt-2">
                We share personal data only as needed to operate our store:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <b>Payment partners</b> (e.g. NSDL / NineteenPay, Easebuzz) for
                  secure payment processing
                </li>
                <li>
                  <b>Courier and logistics partners</b> for delivery (name,
                  address, phone)
                </li>
                <li>
                  <b>Technology providers</b> including hosting and database
                  services used to run the website
                </li>
                <li>
                  <b>Authorities</b> when required by law, court order, or to
                  protect our legal rights
                </li>
              </ul>
              <p className="mt-2">We do not sell your personal data.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                5. Cookies & Local Storage
              </h2>
              <p className="mt-2">
                We use cookies and browser local storage to keep you signed in,
                remember your cart, and understand how the site is used. You can
                disable cookies in your browser settings, but some features (cart,
                login, checkout) may not work correctly.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                6. Data Retention
              </h2>
              <p className="mt-2">
                We retain order and account information for as long as needed to
                provide services, handle returns or disputes, and meet legal,
                tax, and regulatory obligations (typically up to 7 years for
                financial records where required).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                7. Data Security
              </h2>
              <p className="mt-2">
                We use reasonable technical and organisational measures to protect
                your data, including encrypted connections (HTTPS) and secure
                payment gateways. No online system is completely secure; please
                use strong credentials and keep your OTP private.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                8. Your Rights
              </h2>
              <p className="mt-2">
                Subject to applicable Indian law, you may request access,
                correction, or deletion of your personal data, or withdraw
                marketing consent. Contact us at{" "}
                <b>{LEGAL.email}</b>. We may retain certain data where required
                by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                9. Children
              </h2>
              <p className="mt-2">
                Our services are intended for users aged 18 and above. We do not
                knowingly collect personal data from children.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                10. Grievance Officer
              </h2>
              <p className="mt-2">
                For privacy-related complaints or concerns, contact our Grievance
                Officer:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Email: <b>{LEGAL.email}</b>
                </li>
                <li>
                  Phone: <b>{LEGAL.phone}</b>
                </li>
                <li>Address: {LEGAL.address}</li>
              </ul>
              <p className="mt-2">
                We aim to respond within 30 days of receiving a valid request.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                11. Changes to This Policy
              </h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. The effective
                date at the top will reflect the latest version. Continued use of
                the site after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                12. Contact
              </h2>
              <p className="mt-2">
                {LEGAL.companyName}
                <br />
                {LEGAL.address}
                <br />
                Email: <b>{LEGAL.email}</b>
                <br />
                Phone: <b>{LEGAL.phone}</b>
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
