import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES } from "../../config/admin";
import {
  createProduct,
  fetchProductForAdmin,
  updateProduct,
} from "../../features/admin/product.service";
import {
  emptyProductForm,
  formToProductPayload,
  productToForm,
  slugifyTitle,
} from "../../features/admin/productForm";

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </label>
  );
}

function inputClass(error) {
  return [
    "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-50",
  ].join(" ");
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

function normalizeImageUrl(raw) {
  if (!raw) return "";
  const s = String(raw).trim().replace(/^(https?:)?\/\//i, "");
  return s ? `https://${s}` : "";
}

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyProductForm());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setLoadError("");
      const { data, error } = await fetchProductForAdmin(id);
      if (!alive) return;

      if (error || !data) {
        setLoadError(error?.message || "Product not found.");
      } else {
        setForm(productToForm(data));
      }
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const previewImage = useMemo(
    () => normalizeImageUrl(form.image_url),
    [form.image_url],
  );

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCategory = (value) => {
    setForm((current) => {
      const set = new Set(current.categories);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...current, categories: [...set] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    const { payload, error } = formToProductPayload(form, {
      id: isEdit ? id : crypto.randomUUID(),
      slugOverride: isEdit ? form.slug : slugifyTitle(form.title),
      forUpdate: isEdit,
    });

    if (error || !payload) {
      setFormError(error || "Invalid form data.");
      setSaving(false);
      return;
    }

    const result = isEdit
      ? await updateProduct(id, payload)
      : await createProduct(payload);

    setSaving(false);

    if (result.error) {
      setFormError(result.error.message || "Could not save product.");
      return;
    }

    toast.success(isEdit ? "Product updated." : "Product created.");
    navigate("/admin/products");
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? "Edit product" : "Add product"}>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Loading product…
        </div>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout title="Edit product">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {loadError}
        </div>
        <Link
          to="/admin/products"
          className="mt-4 inline-block text-sm font-semibold text-emerald-700"
        >
          Back to products
        </Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? "Edit product" : "Add product"}
      actions={
        <Link
          to="/admin/products"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <Section title="Basic details">
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              className={inputClass()}
              placeholder="FreshLime Dishwash Gel 500ml"
              required
            />
          </Field>

          <Field
            label="Slug"
            hint="URL-friendly ID. Auto-generated on create if left blank."
          >
            <input
              value={form.slug}
              onChange={(event) => setField("slug", event.target.value)}
              className={inputClass()}
              placeholder="freshlime-dishwash-gel-500ml"
            />
          </Field>

          <Field label="Type">
            <input
              list="product-types"
              value={form.type}
              onChange={(event) => setField("type", event.target.value)}
              className={inputClass()}
              placeholder="Floor Cleaner"
            />
            <datalist id="product-types">
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
              className={inputClass()}
              placeholder="Full product description shown on the product page."
            />
          </Field>

          <Field label="Short description">
            <textarea
              value={form.short_description}
              onChange={(event) =>
                setField("short_description", event.target.value)
              }
              rows={2}
              className={inputClass()}
              placeholder="Brief summary for cards and SEO."
            />
          </Field>
        </Section>

        <Section title="Pricing & promo">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Base price (₹) *">
              <input
                type="number"
                min="1"
                step="1"
                value={form.base_price}
                onChange={(event) => setField("base_price", event.target.value)}
                className={inputClass()}
                required
              />
            </Field>

            <Field label="MRP (₹)" hint="Optional. Used to show discount.">
              <input
                type="number"
                min="1"
                step="1"
                value={form.mrp}
                onChange={(event) => setField("mrp", event.target.value)}
                className={inputClass()}
              />
            </Field>

            <Field label="Badge" hint='e.g. "Best value", "New"'>
              <input
                value={form.badge}
                onChange={(event) => setField("badge", event.target.value)}
                className={inputClass()}
              />
            </Field>

            <Field label="Rating (0–5)">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) => setField("rating", event.target.value)}
                className={inputClass()}
              />
            </Field>
          </div>
        </Section>

        <Section title="Image">
          <Field
            label="Image URL"
            hint="Paste a full URL or host path like images.unsplash.com/..."
          >
            <input
              value={form.image_url}
              onChange={(event) => setField("image_url", event.target.value)}
              className={inputClass()}
              placeholder="images.unsplash.com/photo-..."
            />
          </Field>

          {previewImage ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={previewImage}
                alt="Preview"
                className="mx-auto max-h-72 w-full object-contain"
              />
            </div>
          ) : null}
        </Section>

        <Section title="Categories & visibility">
          <div>
            <p className="text-sm font-medium text-slate-700">Collections</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {PRODUCT_CATEGORIES.map((category) => (
                <label
                  key={category.value}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.categories.includes(category.value)}
                    onChange={() => toggleCategory(category.value)}
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </div>

          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setField("is_active", event.target.checked)}
            />
            <span>
              <span className="font-medium text-slate-900">Active on storefront</span>
              <span className="mt-0.5 block text-slate-500">
                Hidden products stay in admin but won&apos;t appear in the shop.
              </span>
            </span>
          </label>
        </Section>

        <Section title="Specifications">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Pack size">
              <input
                value={form.pack_size}
                onChange={(event) => setField("pack_size", event.target.value)}
                className={inputClass()}
                placeholder="500ml"
              />
            </Field>
            <Field label="Pack">
              <input
                value={form.pack}
                onChange={(event) => setField("pack", event.target.value)}
                className={inputClass()}
                placeholder="Pack of 2"
              />
            </Field>
            <Field label="Volume">
              <input
                value={form.volume}
                onChange={(event) => setField("volume", event.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Material">
              <input
                value={form.material}
                onChange={(event) => setField("material", event.target.value)}
                className={inputClass()}
              />
            </Field>
          </div>

          <Field label="Recommended use">
            <textarea
              value={form.recommended_use}
              onChange={(event) =>
                setField("recommended_use", event.target.value)
              }
              rows={2}
              className={inputClass()}
            />
          </Field>
        </Section>

        <Section title="Advanced JSON">
          <Field
            label="Attributes (JSON)"
            hint='Optional key/value specs, e.g. {"fragrance":"Citrus"}'
          >
            <textarea
              value={form.attributesJson}
              onChange={(event) =>
                setField("attributesJson", event.target.value)
              }
              rows={5}
              className={inputClass()}
              placeholder='{"fragrance":"Citrus","form":"Liquid"}'
            />
          </Field>

          <Field label="Variants (JSON)" hint="Optional variant data for future use.">
            <textarea
              value={form.variantsJson}
              onChange={(event) => setField("variantsJson", event.target.value)}
              rows={5}
              className={inputClass()}
              placeholder="[]"
            />
          </Field>
        </Section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <Link
            to="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
