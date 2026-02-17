import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-1 font-bold tracking-tight text-slate-900 hover:bg-slate-100"
              aria-label="Go to homepage"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                S
              </span>
              <span className="text-lg">Store</span>
            </Link>

            <p className="mt-3 text-sm text-slate-600">
              Premium products, simple checkout, fast support.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                🔒 Secure
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                🚚 Fast shipping
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                ↩️ Easy returns
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Shop</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="text-slate-600 hover:text-slate-900" to="/">
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
              <h4 className="text-sm font-semibold text-slate-900">Support</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    className="text-slate-600 hover:text-slate-900"
                    to="/help"
                  >
                    Help Center
                  </Link>
                </li>
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
              <h4 className="text-sm font-semibold text-slate-900">Company</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    className="text-slate-600 hover:text-slate-900"
                    to="/about"
                  >
                    About
                  </Link>
                </li>
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

        {/* Bottom */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {year} Store. All rights reserved.
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

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Visa / Mastercard / UPI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
