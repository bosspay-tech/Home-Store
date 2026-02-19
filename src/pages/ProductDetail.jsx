import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { STORE_ID } from "../config/store";
import { useCartStore } from "../store/cart.store";
import toast from "react-hot-toast";

/** Normalize any image url to https://... */
function normalizeHttpsUrl(raw) {
  if (!raw) return "";
  const s0 = String(raw).trim();
  if (/^(data:|blob:)/i.test(s0)) return s0;
  let s = s0.replace(/^(https?:)?\/\//i, "").replace(/^\/+/, "");
  if (!s) return "";
  return `https://${s}`;
}

function SkeletonDetail() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="h-105 bg-slate-100" />
        </div>

        <div className="animate-pulse">
          <div className="h-7 w-2/3 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-6 h-8 w-28 rounded bg-slate-100" />
          <div className="mt-6 h-12 w-full rounded-2xl bg-slate-100" />
          <div className="mt-3 h-12 w-full rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        <span className="text-slate-500">{open ? "–" : "+"}</span>
      </button>
      {open ? (
        <div className="px-4 pb-4 text-sm leading-6 text-slate-600">{a}</div>
      ) : null}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("store_id", STORE_ID)
        .single();

      if (!alive) return;

      if (error) {
        setErr(error.message || "Failed to load product.");
        setProduct(null);
      } else {
        setProduct(data);
        setSelectedVariant(null);
      }
      setLoading(false);
    };

    fetchProduct();
    return () => {
      alive = false;
    };
  }, [id]);

  // Fetch related (simple: same store, active, not current)
  useEffect(() => {
    if (!product?.id) return;
    let alive = true;

    const fetchRelated = async () => {
      setRelatedLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("id,title,base_price,image_url,description,is_active")
        .eq("store_id", STORE_ID)
        .neq("id", product.id)
        .limit(8);

      if (!alive) return;

      if (!error) setRelated(Array.isArray(data) ? data : []);
      setRelatedLoading(false);
    };

    fetchRelated();
    return () => {
      alive = false;
    };
  }, [product?.id]);

  const cartItem = items.find((it) => it.productId === product?.id);
  const qtyInCart = cartItem?.quantity ?? 0;

  const price = useMemo(() => {
    const p = selectedVariant?.price ?? product?.base_price ?? 0;
    return Number(p);
  }, [selectedVariant, product]);

  const hasMrp = product?.mrp != null && Number(product.mrp) > 0;
  const mrp = hasMrp ? Number(product.mrp) : null;
  const discountPct =
    hasMrp && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : null;

  const imageUrl = normalizeHttpsUrl(product?.image_url);

  const handleAddToCart = () => {
    if (product?.is_active === false) return;

    addItem({
      productId: product.id,
      storeId: STORE_ID,
      title: product.title,
      price,
    });

    toast.success(
      qtyInCart > 0
        ? `Updated cart • ${qtyInCart + 1} in cart`
        : "Added to cart",
    );
  };

  if (loading) return <SkeletonDetail />;

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {err}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            🛍️
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Product not found
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            The product you are looking for may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-linear-to-b from-slate-50 via-white to-white">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-700">
            Home
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-slate-700">{product.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Image + badges */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* soft glow */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                <div className="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-slate-200/40 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-slate-200/30 blur-3xl" />
              </div>

              <div className="relative flex h-105 items-center justify-center bg-linear-to-b from-slate-50 to-white p-8">
                <img
                  src={
                    imageUrl ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=60"
                  }
                  alt={product.title}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=60";
                  }}
                />

                {product?.badge ? (
                  <span className="absolute left-4 top-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                    {product.badge}
                  </span>
                ) : null}

                {discountPct ? (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                    {discountPct}% OFF
                  </span>
                ) : null}
              </div>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 text-xs text-slate-700">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                🔒 Secure payments
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                🚚 Fast shipping
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                ↩️ Easy returns
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                ✅ Quality checked
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="md:pt-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {product.title}
            </h1>

            {product?.short_description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.short_description}
              </p>
            ) : null}

            {/* Price */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="text-3xl font-black tracking-tight text-slate-900">
                ₹{price}
              </div>

              {hasMrp ? (
                <div className="text-sm text-slate-500 line-through">
                  ₹{mrp}
                </div>
              ) : null}

              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  product?.is_active === false
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700",
                ].join(" ")}
              >
                {product?.is_active === false ? "Out of stock" : "In stock"}
              </span>
            </div>

            {/* Highlights */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Highlights
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-0.5">✔️</span>
                  <span>
                    Premium quality product with reliable performance.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5">✔️</span>
                  <span>Carefully packed and shipped quickly.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5">✔️</span>
                  <span>Support available for ordering & usage questions.</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product?.is_active === false}
                className={[
                  "w-full rounded-2xl px-6 py-3.5 text-sm font-semibold transition",
                  "shadow-lg shadow-slate-900/10",
                  "focus:outline-none focus:ring-4",
                  product?.is_active === false
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-200",
                ].join(" ")}
              >
                {product?.is_active === false
                  ? "Out of stock"
                  : qtyInCart > 0
                    ? `In cart: ${qtyInCart} • Add more`
                    : "Add to cart"}
              </button>

              <button
                type="button"
                onClick={() => toast("Wishlist coming soon 😉")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                ❤️ Add to wishlist
              </button>

              {/* Payment/Delivery strip */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-900">
                    Delivery
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Ships in 24–48 hours. Typical delivery 2–5 days depending on
                    your location.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-900">
                    Returns
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Easy returns within 7 days (unused & original packaging).
                  </p>
                </div>
              </div>
            </div>

            {/* Offers */}
          </div>
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            Offers & Benefits
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                💳 Multiple payment options
              </div>
              <p className="mt-1 text-xs text-slate-600">
                UPI, cards, netbanking and more.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                🧾 Invoice available
              </div>
              <p className="mt-1 text-xs text-slate-600">
                GST invoice / order invoice sent automatically.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Description</h3>

          {product.description ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
              {product.description}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No description available.
            </p>
          )}
        </div>
        <div className="mt-6">
          <div className="mb-3 text-sm font-semibold text-slate-900">FAQs</div>
          <div className="space-y-3">
            <FAQItem
              q="How long does delivery take?"
              a="Usually 2–5 business days depending on your location. We typically ship within 24–48 hours."
            />
            <FAQItem
              q="What is your return policy?"
              a="Returns accepted within 7 days if the product is unused and in original packaging."
            />
            <FAQItem
              q="Is this product authentic?"
              a="Yes. We source from trusted channels and perform basic quality checks before dispatch."
            />
          </div>
        </div>

        {/* Related products */}
        <div className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Related products
            </h2>
            <Link
              to="/"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View all →
            </Link>
          </div>

          {relatedLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-36 bg-slate-100" />
                  <div className="p-4">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : related?.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => {
                const rp = Number(p?.base_price ?? 0);
                const rimg = normalizeHttpsUrl(p?.image_url);
                return (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex h-36 items-center justify-center bg-linear-to-b from-slate-50 to-white p-4">
                      <img
                        src={
                          rimg ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=60"
                        }
                        alt={p.title || "Product"}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=60";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="line-clamp-1 text-sm font-semibold text-slate-900">
                        {p.title}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        ₹{rp}
                      </div>
                      <div className="mt-3 inline-flex items-center text-xs font-semibold text-slate-700">
                        View details <span className="ml-1">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No related products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
