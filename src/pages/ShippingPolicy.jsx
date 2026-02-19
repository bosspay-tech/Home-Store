export default function ShippingPolicy() {
  return (
    <div className="bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Shipping Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Effective date: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-6 text-sm leading-6 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Order Processing
              </h2>
              <p className="mt-2">
                Orders are usually processed within <b>24–48 business hours</b>.
                Processing time may be longer during sales, holidays, or high
                demand periods.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Delivery Timelines
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Metro cities: typically <b>2–4 business days</b>
                </li>
                <li>
                  Other locations: typically <b>3–7 business days</b>
                </li>
              </ul>
              <p className="mt-2 text-slate-600">
                Delivery timelines are estimates and can vary depending on your
                pincode, courier partner, and local conditions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Shipping Charges
              </h2>
              <p className="mt-2">
                Shipping fees (if applicable) are shown at checkout. Free
                shipping offers may be available on select orders or during
                promotions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Packaging & Safety
              </h2>
              <p className="mt-2">
                Home-care products like disinfectants, floor cleaners, and wipes
                are packed carefully to reduce leakage/damage during transit.
                Please check outer packaging at delivery.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Address & Delivery Attempts
              </h2>
              <p className="mt-2">
                Please ensure your shipping address and phone number are
                correct. Courier partners typically attempt delivery 2–3 times.
                If delivery fails due to incorrect address/unavailability, the
                order may return to us.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Order Tracking
              </h2>
              <p className="mt-2">
                Once shipped, you’ll receive tracking details via email/SMS (if
                available). You can also check your order status in the{" "}
                <b>Orders</b> section.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Need Help?
              </h2>
              <p className="mt-2">
                Contact us at <b>support@yourstore.com</b> with your order ID.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
