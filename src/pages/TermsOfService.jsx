export default function TermsOfService() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Overview
              </h2>
              <p className="mt-2">
                By using this website, you agree to these Terms. If you do not
                agree, please do not use the site.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Products & Availability
              </h2>
              <p className="mt-2">
                We sell home-care/cleaning products. Product images are for
                representation; actual packaging may vary. Stock availability
                may change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Pricing & Payments
              </h2>
              <p className="mt-2">
                Prices are shown in INR and may change. Payment is processed via
                secure third-party payment gateways. We do not store full card
                details/UPI PINs.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Orders, Cancellations & Refunds
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Orders may be cancelled before shipment (where possible).
                </li>
                <li>
                  Once shipped, cancellations may not be possible; refer to our
                  Returns & Refunds policy.
                </li>
                <li>Refunds are processed as per the Returns policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                User Conduct
              </h2>
              <p className="mt-2">
                You agree not to misuse the site, attempt unauthorized access,
                or interfere with site operations.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Intellectual Property
              </h2>
              <p className="mt-2">
                Site content (text, design, logos) belongs to the store or its
                licensors. Brand names like Dettol/Lizol belong to their
                respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Limitation of Liability
              </h2>
              <p className="mt-2">
                To the maximum extent permitted by law, we are not liable for
                indirect or consequential damages arising from use of the site
                or products.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Governing Law
              </h2>
              <p className="mt-2">
                These Terms are governed by the laws of India. Disputes will be
                subject to jurisdiction of applicable courts in your operating
                city/state.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Contact
              </h2>
              <p className="mt-2">
                Email: <b>support@yourstore.com</b>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
