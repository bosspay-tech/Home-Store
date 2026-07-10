import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import {
  fetchAllProductsAdmin,
  setProductActive,
} from "../../features/admin/product.service";
import { productField } from "../../lib/productFields";

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function normalizeImageUrl(raw) {
  if (!raw) return "";
  const s = String(raw).trim().replace(/^(https?:)?\/\//i, "");
  return s ? `https://${s}` : "";
}

function productPrices(product) {
  return [Number(product.base_price), Number(productField(product, "mrp"))]
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => Math.round(n));
}

function matchesSearchQuery(product, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack =
    `${product.title ?? ""} ${product.type ?? ""} ${product.slug ?? ""}`.toLowerCase();
  if (haystack.includes(q)) return true;

  const priceDigits = q.replace(/[₹,\s]/g, "");
  if (!/^\d+$/.test(priceDigits)) return false;

  return productPrices(product).some((price) =>
    String(price).includes(priceDigits),
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [busyId, setBusyId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    const { data, error: fetchError } = await fetchAllProductsAdmin();
    if (fetchError) {
      setError(fetchError.message || "Failed to load products.");
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (filter === "active" && !product.is_active) return false;
      if (filter === "inactive" && product.is_active) return false;
      return matchesSearchQuery(product, query);
    });
  }, [products, query, filter]);

  const sorted = useMemo(() => {
    const rows = [...filtered];

    const priceOf = (product) => {
      const n = Number(product.base_price);
      return Number.isFinite(n) ? n : 0;
    };

    switch (sortBy) {
      case "price-asc":
        return rows.sort((a, b) => priceOf(a) - priceOf(b));
      case "price-desc":
        return rows.sort((a, b) => priceOf(b) - priceOf(a));
      case "title-asc":
        return rows.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "", undefined, {
            sensitivity: "base",
          }),
        );
      case "newest":
      default:
        return rows.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        );
    }
  }, [filtered, sortBy]);

  const togglePriceSort = () => {
    setSortBy((current) =>
      current === "price-asc" ? "price-desc" : "price-asc",
    );
  };

  const toggleActive = async (product) => {
    setBusyId(product.id);
    const next = !product.is_active;
    const { error: updateError } = await setProductActive(product.id, next);
    setBusyId(null);

    if (updateError) {
      toast.error(updateError.message || "Could not update product.");
      return;
    }

    setProducts((rows) =>
      rows.map((row) =>
        row.id === product.id ? { ...row, is_active: next } : row,
      ),
    );
    toast.success(next ? "Product activated." : "Product hidden.");
  };

  return (
    <AdminLayout
      title="Products"
      actions={
        <Link
          to="/admin/products/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Add product
        </Link>
      }
    >
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, type, slug, or price…"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 lg:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="all">All products</option>
            <option value="active">Active only</option>
            <option value="inactive">Hidden only</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="title-asc">Title: A → Z</option>
          </select>
        </div>
      </div>

      {!loading && sorted.length > 0 ? (
        <p className="mb-4 text-sm text-slate-600">
          Showing {sorted.length} product{sorted.length === 1 ? "" : "s"}
          {sortBy === "price-asc"
            ? " · sorted by price (low to high)"
            : sortBy === "price-desc"
              ? " · sorted by price (high to low)"
              : ""}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Loading products…
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No products found.</p>
          <Link
            to="/admin/products/new"
            className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={togglePriceSort}
                      className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide hover:text-slate-900"
                    >
                      Price
                      <span className="text-slate-400">
                        {sortBy === "price-asc"
                          ? "↑"
                          : sortBy === "price-desc"
                            ? "↓"
                            : "↕"}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {product.image_url ? (
                            <img
                              src={normalizeImageUrl(product.image_url)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.slug || product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {product.type || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(product.base_price)}
                      </p>
                      {product.mrp ? (
                        <p className="text-xs text-slate-500 line-through">
                          {formatPrice(product.mrp)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          product.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600",
                        ].join(" ")}
                      >
                        {product.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => toggleActive(product)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-60"
                        >
                          {busyId === product.id
                            ? "…"
                            : product.is_active
                              ? "Hide"
                              : "Show"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
