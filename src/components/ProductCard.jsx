export function normalizeHttpsUrl(raw) {
  if (!raw) return "";

  let s = String(raw).trim();

  // remove leading protocol (http/https) and protocol-relative //
  s = s.replace(/^(https?:)?\/\//i, "");

  // remove any accidental multiple slashes at start
  s = s.replace(/^\/+/, "");

  // if it's still empty, return ""
  if (!s) return "";

  return `https://${s}`;
}

function ProductCard({ product, onViewDetails }) {
  const price = Number(product?.base_price ?? 0);
  const imageUrl = normalizeHttpsUrl(product?.image_url);
  const hasMrp = product?.mrp != null && Number(product.mrp) > 0;
  const mrp = hasMrp ? Number(product.mrp) : null;

  const discountPct =
    hasMrp && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* soft hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-slate-200/30 blur-3xl" />
      </div>

      {/* Image */}
      <div className="relative h-56 bg-linear-to-b from-slate-50 to-white">
        <img
          src={imageUrl}
          alt={product?.title || "Product"}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
          // onError={(e) => {
          //   e.currentTarget.src =
          //     "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=60";
          // }}
        />

        {/* Badge */}
        {product?.badge ? (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
            {product.badge}
          </span>
        ) : null}

        {/* Discount pill */}
        {discountPct ? (
          <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
            {discountPct}% OFF
          </span>
        ) : null}        
      </div>

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-[15px] font-semibold tracking-tight text-slate-900">
            {product?.title}
          </h3>

          {typeof product?.rating === "number" ? (
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              <span className="text-amber-500">★</span>
              <span>{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {product?.description || "No description available."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-slate-900">₹{price}</p>

            {hasMrp ? (
              <p className="text-sm text-slate-500 line-through">₹{mrp}</p>
            ) : null}
          </div>

          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              product?.inStock === false
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            {product?.inStock === false ? "Out of stock" : "In stock"}
          </span>
        </div>

        {/* Main CTA */}
        <button
          type="button"
          onClick={() => onViewDetails?.(product)}
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          View details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
