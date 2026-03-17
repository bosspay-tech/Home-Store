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
            {/* Return Window */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Return Window
              </h2>
              <p className="mt-2">
                Return requests must be raised within <b>7 days</b> of delivery.
                Requests submitted after this period may not be accepted.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Eligibility
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Returns are accepted only if you received an incorrect item or
                  an item not listed on your bill due to our error.
                </li>
                <li>
                  Customers are strongly advised to record a video while opening
                  the parcel as proof for damaged or incorrect items.
                </li>
                <li>
                  For branded items, returns are accepted only if original
                  packaging and all contents are intact.
                </li>
                <li>
                  Personalized or customized products cannot be cancelled or
                  returned once processed.
                </li>
              </ul>
            </section>

            {/* Return Authorization */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Return Authorization & Process
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  A return authorization is mandatory before sending any product
                  back.
                </li>
                <li>
                  Products sent without authorization will be returned to the
                  sender.
                </li>
                <li>
                  Once approved, we will provide a return shipping label or
                  instructions.
                </li>
                <li>
                  Customers must securely pack the product with all original
                  contents. Original packaging is recommended.
                </li>
                <li>
                  We recommend recording a video while packing the return. Our
                  team may also record an unboxing video upon receipt for
                  verification.
                </li>
              </ul>
            </section>

            {/* How to Request */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                How to Request a Return
              </h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Email <b>support@vyaparvaultpvt.shop</b> with your{" "}
                  <b>Order ID</b>.
                </li>
                <li>
                  Share images or video evidence of the issue (damaged/incorrect
                  item).
                </li>
                <li>Our team will verify and confirm the next steps.</li>
              </ol>
            </section>

            {/* Refunds */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Refunds
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Once the returned item passes inspection, refunds are
                  processed within <b>5–10 business days</b>.
                </li>
                <li>
                  Refunds are issued to the original payment method or via bank
                  transfer/UPI (for COD orders).
                </li>
                <li>Packaging and shipping charges are non-refundable.</li>
              </ul>
            </section>

            {/* Replacement */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Replacement
              </h2>
              <p className="mt-2">
                If the product is eligible, we may offer a replacement of the
                same item (subject to availability). If unavailable, a refund or
                store credit will be provided.
              </p>
            </section>

            {/* Damaged */}
            <section>
              <h2 className="text-base font-semibold text-slate-900">
                Damaged / Incorrect Item
              </h2>
              <p className="mt-2">
                If you receive a damaged or incorrect item, please contact us
                within <b>48 hours</b> of delivery with supporting images or
                video proof. We will resolve the issue via replacement or
                refund.
              </p>
            </section>

            {/* Contact */}
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
