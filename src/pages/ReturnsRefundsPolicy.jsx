export default function ReturnsRefundsPolicy() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Returns & Refunds Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Return Window
              </h2>
              <p className="mt-2">
                You can request a return within <b>7 days</b> of delivery.
                Returns are subject to inspection and eligibility.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Eligible Reasons
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Wrong item delivered</li>
                <li>Item arrived damaged or leaking</li>
                <li>Missing items in the package</li>
                <li>Expired / near-expiry item received (if applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Non-Returnable Items
              </h2>
              <p className="mt-2 text-slate-600">
                For hygiene and safety, we may not accept returns for opened or
                used consumables.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Opened/used disinfectants, floor cleaners, wipes</li>
                <li>Items with missing seals/labels</li>
                <li>Products damaged due to customer mishandling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                How to Request a Return
              </h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Email <b>ssupport@vyaparvaultpvt.shop</b> with your <b>Order ID</b>.
                </li>
                <li>
                  Share photos/videos of the product and packaging (especially
                  if damaged/leaking).
                </li>
                <li>
                  We will confirm eligibility and arrange pickup if needed.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Refund Timelines
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Once the return is approved/received, refunds are processed
                  within <b>5–10 business days</b>.
                </li>
                <li>
                  Refunds are made to the original payment method (or as store
                  credit if applicable).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Replacement Option
              </h2>
              <p className="mt-2">
                For damaged/wrong items, we may offer replacement (subject to
                availability) as a faster resolution.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Need Help?
              </h2>
              <p className="mt-2">
                Reach us at <b>support@vyaparvaultpvt.shop</b>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
