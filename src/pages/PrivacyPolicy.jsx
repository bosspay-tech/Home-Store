export default function PrivacyPolicy() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                What We Collect
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Contact information (name, phone, email)</li>
                <li>Shipping address and order details</li>
                <li>
                  Payment confirmation details (not full card/UPI credentials)
                </li>
                <li>Device/browser information, cookies (for analytics)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                How We Use Your Data
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Process orders and deliver products</li>
                <li>Send order updates, invoices, support communication</li>
                <li>Improve site experience and prevent fraud</li>
                <li>
                  Marketing emails only if you opt-in (you can unsubscribe)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Sharing of Information
              </h2>
              <p className="mt-2">
                We share only what is required to fulfill your order:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Courier/shipping partners (name, address, phone)</li>
                <li>Payment providers (transaction-related data)</li>
                <li>Analytics tools (aggregated usage data)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Cookies
              </h2>
              <p className="mt-2">
                Cookies help us remember your preferences, keep your cart, and
                understand site performance. You can disable cookies in your
                browser, but parts of the site may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Data Security
              </h2>
              <p className="mt-2">
                We use reasonable security measures to protect your information.
                However, no online system is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Your Rights
              </h2>
              <p className="mt-2">
                You can request access, correction, or deletion of your personal
                data (subject to legal/operational requirements). Contact us at{" "}
                <b>support@vyaparvaultpvt.shop</b>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Contact
              </h2>
              <p className="mt-2">
                Email: <b>support@vyaparvaultpvt.shop</b>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
