function ProductCard({ product, onAddToCart }) {
  const price = Number(product?.base_price ?? 0);

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 bg-slate-50">
        {/* Replace this with <img src={product.imageUrl} ... /> */}
        <div className="flex h-full items-center justify-center text-slate-400">
          Image
        </div>

        {/* Optional badge */}
        {product?.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        ) : null}

        {/* Quick action */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onAddToCart?.(product)}
            className="pointer-events-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
            {product.title}
          </h3>

          {/* Optional rating */}
          {typeof product?.rating === "number" ? (
            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              <span>★</span>
              <span>{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {product.description || "No description available."}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-slate-900">₹{price}</p>

            {/* Optional compare price */}
            {product?.mrp ? (
              <p className="text-sm text-slate-500 line-through">
                ₹{Number(product.mrp)}
              </p>
            ) : null}

            {/* Optional discount */}
            {product?.mrp && price > 0 ? (
              <span className="text-xs font-semibold text-emerald-700">
                {Math.round(
                  ((Number(product.mrp) - price) / Number(product.mrp)) * 100,
                )}
                % OFF
              </span>
            ) : null}
          </div>

          <span className="text-xs text-slate-500">
            {product?.inStock === false ? "Out of stock" : "In stock"}
          </span>
        </div>

        {/* Mobile-friendly CTA (visible always) */}
        <button
          type="button"
          onClick={() => onAddToCart?.(product)}
          disabled={product?.inStock === false}
          className={[
            "mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4",
            product?.inStock === false
              ? "cursor-not-allowed bg-slate-200 text-slate-500"
              : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-200",
          ].join(" ")}
        >
          {product?.inStock === false ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
