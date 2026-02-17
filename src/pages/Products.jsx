import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { STORE_ID } from "../config/store";
import { Link, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-48 bg-slate-100" />
      <div className="p-4">
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="mt-3 h-3 w-full rounded bg-slate-100" />
        <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
        <div className="mt-4 h-5 w-24 rounded bg-slate-100" />
        <div className="mt-4 h-9 w-full rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function Products() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const category = params.get("category");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // (optional) basic search
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;

    const fetchProducts = async () => {
      setLoading(true);
      setErr("");

      let query = supabase
        .from("products")
        .select("*")
        .eq("store_id", STORE_ID)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // ✅ Filter by collection if provided
      if (category) query = query.contains("categories", [category]);

      const { data, error } = await query;

      if (!alive) return;

      if (error) {
        setErr(error.message || "Failed to load products.");
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      `${p.title ?? ""} ${p.description ?? ""}`.toLowerCase().includes(s),
    );
  }, [products, q]);

  return (
    <div className="min-h-[70vh] bg-linear-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Products
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Browse our latest items and pick your favorites.
            </p>
          </div>

          {/* Search */}
          <div className="w-full sm:w-80">
            <label className="sr-only">Search products</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Error */}
        {err ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">Loading products…</p>
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                🛍️
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {q.trim()
                  ? "Try a different search term."
                  : "Please check back soon for new arrivals."}
              </p>

              {q.trim() ? (
                <button
                  onClick={() => setQ("")}
                  className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Clear search
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {/* Results meta */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing{" "}
                  <span className="font-semibold">{filtered.length}</span> item
                  {filtered.length === 1 ? "" : "s"}
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="block focus:outline-none focus:ring-4 focus:ring-slate-200 rounded-2xl"
                  >
                    <ProductCard product={product} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
