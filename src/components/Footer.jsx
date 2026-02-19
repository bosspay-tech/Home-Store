import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  const storeName = "Vyapaar Vault"; // change if needed

  return (
    <footer className="mt-14 border-t border-slate-200/70 bg-linear-to-b from-white via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl px-2 py-1.5 font-extrabold tracking-tight text-slate-900 hover:bg-slate-100"
              aria-label="Go to homepage"
            >
              <span className="text-xl">{storeName}</span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Everyday essentials for a cleaner home — trusted brands, simple
              checkout, and fast support.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                🔒 Secure payments
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                🚚 Fast shipping
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                ↩️ Easy returns
              </span>
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <a
                  href="mailto:support@yourstore.com"
                  className="hover:text-slate-900"
                >
                  support@yourstore.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+910000000000" className="hover:text-slate-900">
                  +91 00000 00000
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Shop</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/"
                    >
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/cart"
                    >
                      Cart
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/orders"
                    >
                      Orders
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Support
                </h4>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/shipping"
                    >
                      Shipping
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/returns"
                    >
                      Returns & Refunds
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Company
                </h4>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/privacy"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-slate-600 hover:text-slate-900"
                      to="/terms"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">
                Get offers & updates
              </h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                New stock alerts, household tips, and occasional discounts.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-4 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {}}
                  className="shrink-0 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Join
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                By subscribing, you agree to our{" "}
                <Link className="underline hover:text-slate-700" to="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} {storeName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <Link className="hover:text-slate-900" to="/privacy">
              Privacy
            </Link>
            <span className="text-slate-300">•</span>
            <Link className="hover:text-slate-900" to="/terms">
              Terms
            </Link>
            <span className="text-slate-300">•</span>
            <Link className="hover:text-slate-900" to="/returns">
              Returns
            </Link>
          </div>

          <div className="text-xs text-slate-500">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
              Visa / Mastercard / UPI
            </span>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-slate-500">
          All brand names (e.g., Dettol, Lizol) are trademarks of their
          respective owners. We are not affiliated with or endorsed by them
          unless explicitly stated.
        </p>
      </div>
    </footer>
  );
}
