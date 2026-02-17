import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { STORE_ID } from "../config/store";
import { useCartStore } from "../store/cart.store";
import toast from "react-hot-toast";

function SkeletonDetail() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-105 bg-slate-100" />
        </div>

        <div className="animate-pulse">
          <div className="h-7 w-2/3 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-6 h-8 w-28 rounded bg-slate-100" />
          <div className="mt-6 h-10 w-full rounded-xl bg-slate-100" />
          <div className="mt-3 h-10 w-full rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
        // reset variant when product changes
        setSelectedVariant(null);
      }
      setLoading(false);
    };

    fetchProduct();
    return () => {
      alive = false;
    };
  }, [id]);

  const cartItem = items.find((it) => it.productId === product?.id);
  console.log(cartItem)
  const qtyInCart = cartItem?.quantity ?? 0;
  console.log(qtyInCart)

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

  const price = useMemo(() => {
    const p = selectedVariant?.price ?? product?.base_price ?? 0;
    return Number(p);
  }, [selectedVariant, product]);

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
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
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
    <div className="min-h-[70vh] bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-105 bg-slate-50">
              {/* Replace with real image:
                  <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
              */}
              <div className="flex h-full items-center justify-center text-slate-400">
                Image
              </div>

              {product?.badge ? (
                <span className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {product.badge}
                </span>
              ) : null}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {product.title}
            </h1>

            {/* Short description (if you have it separately) */}
            {product?.short_description ? (
              <p className="mt-2 text-sm text-slate-600">
                {product.short_description}
              </p>
            ) : null}

            {/* Price + meta */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-2xl font-extrabold text-slate-900">
                ₹{price}
              </div>

              {product?.mrp ? (
                <div className="text-sm text-slate-500 line-through">
                  ₹{Number(product.mrp)}
                </div>
              ) : null}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {product?.is_active === false ? "Out of stock" : "In stock"}
              </span>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product?.is_active === false}
                className={[
                  "w-full rounded-xl px-6 py-3 text-sm font-semibold transition",
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
            </div>

            {/* Full Description */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Description
              </h3>

              {/* If description is HTML, you should sanitize before using dangerouslySetInnerHTML */}
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

            {/* Trust row */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                🔒 Secure payments
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                🚚 Fast shipping
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                ↩️ Easy returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
