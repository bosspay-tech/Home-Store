import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const storeName = "Vyapar Vault";

const linkGroups = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Value Deals", to: "/products?category=value-deal" },
      { label: "Best Sellers", to: "/products?category=bestseller" },
      { label: "New Arrivals", to: "/products?category=new-arrival" },
      { label: "Cart", to: "/cart" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping", to: "/shipping" },
      { label: "Returns & Refunds", to: "/returns" },
      { label: "Contact", to: "/contact" },
      { label: "Orders", to: "/orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      {children}
    </Link>
  );
}

function TrustPill({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
      {icon}
      {label}
    </span>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center rounded-2xl text-2xl font-extrabold tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Go to homepage"
            >
              {storeName}
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Everyday home-care essentials with simple checkout, reliable
              packing, and quick support.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <TrustPill
                icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Secure payments"
              />
              <TrustPill
                icon={<Truck className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Fast shipping"
              />
              <TrustPill
                icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                label="Easy returns"
              />
            </div>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-slate-300">
              <div>
                <div className="font-semibold text-white">Registered Office</div>
                <p className="mt-2 leading-6">
                  VYAAPAR VAULT PRIVATE LIMITED
                  <br />
                  B-1225, Dev Atelier, Anandnagar Cross Road,
                  <br />
                  Satellite, Ahmedabad, Gujarat - 380015
                </p>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  +91 9909009479
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  GST: 24AALCV4036H1ZA
                </p>
                <p className="text-xs text-slate-400">
                  CIN: U47912GJ2025PTC167384
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {linkGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-white">
                    {group.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.to}>
                        <FooterLink to={link.to}>{link.label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Fast dispatch", "Packed within 24 to 48 hours"],
                ["Careful packing", "Leak-aware parcel handling"],
                ["Secure checkout", "UPI, cards and wallets"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-950 shadow-xl shadow-black/20">
              <h3 className="text-sm font-bold">Get offers and updates</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Product drops, household tips, and occasional discounts.
              </p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Join
                </button>
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <Mail className="mt-0.5 h-3.5 w-3.5" aria-hidden="true" />
                By subscribing, you agree to our{" "}
                <Link className="underline hover:text-slate-800" to="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {year} {storeName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <FooterLink to="/privacy">Privacy</FooterLink>
            <span className="text-slate-700">/</span>
            <FooterLink to="/terms">Terms</FooterLink>
            <span className="text-slate-700">/</span>
            <FooterLink to="/returns">Returns</FooterLink>
            <span className="text-slate-700">/</span>
            <FooterLink to="/shipping">Shipping</FooterLink>
          </div>
        </div>

        <p className="mt-4 max-w-4xl text-xs leading-5 text-slate-500">
          Brand names shown on this website are trademarks of their respective
          owners. We are not affiliated with or endorsed by them unless
          explicitly stated.
        </p>
      </div>
    </footer>
  );
}
