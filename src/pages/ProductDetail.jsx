import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { STORE_ID } from "../config/store";
import { useCartStore } from "../store/cart.store";
import toast from "react-hot-toast";
import { productField, productMrp, productAttributeEntries } from "../lib/productFields";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1400&q=70";

function normalizeHttpsUrl(raw) {
  if (!raw) return "";
  const s0 = String(raw).trim();
  if (/^(data:|blob:)/i.test(s0)) return s0;
  const s = s0.replace(/^(https?:)?\/\//i, "").replace(/^\/+/, "");
  return s ? `https://${s}` : "";
}

function SkeletonDetail() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="aspect-4/5 bg-slate-100" />
          </div>
          <div className="mt-6 hidden animate-pulse rounded-3xl border border-slate-200 bg-white p-5 lg:block">
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
        <div className="animate-pulse lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="h-8 w-3/4 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
            <div className="mt-6 h-10 w-32 rounded bg-slate-100" />
            <div className="mt-6 h-12 w-full rounded-2xl bg-slate-100" />
            <div className="mt-3 h-12 w-full rounded-2xl bg-slate-100" />
            <div className="mt-6 h-28 w-full rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Accordion({ items, defaultOpenIndex = -1 }) {
  const [open, setOpen] = useState(defaultOpenIndex);

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {items.map((item, index) => (
        <div key={item.title}>
          <button
            type="button"
            onClick={() => setOpen(open === index ? -1 : index)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-slate-900">
              {item.title}
            </span>
            <span className="text-slate-500">{open === index ? "-" : "+"}</span>
          </button>
          {open === index ? (
            <div className="px-5 pb-5 text-sm leading-6 text-slate-600">
              {item.content}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DetailSection({ title, children, tone = "default" }) {
  const panelTone =
    tone === "soft"
      ? "border-slate-200 bg-slate-50"
      : "border-slate-200 bg-white shadow-sm";

  return (
    <section className={`rounded-3xl border p-5 ${panelTone}`}>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function formatAttributeKey(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAttributeValue(value) {
  if (Array.isArray(value)) return value.map(formatAttributeValue).join(", ");

  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        return `${formatAttributeKey(key)}: ${formatAttributeValue(nestedValue)}`;
      })
      .join(", ");
  }

  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  return String(value);
}

function getAttributeEntries(attributes) {
  return productAttributeEntries(attributes);
}

function collectionLabelFromKey(key) {
  const labels = {
    bestseller: "Best Sellers",
    "new-arrival": "New Arrivals",
    "value-deal": "Value Deals",
  };
  return labels[key] || formatAttributeKey(key || "Essentials");
}

function normalizeCategoryKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  const aliases = {
    "best-seller": "bestseller",
    "best-sellers": "bestseller",
    "new-arrivals": "new-arrival",
    "value-deals": "value-deal",
  };

  return aliases[key] || key;
}

function productCategoryKeys(product) {
  const rawCategories = Array.isArray(product?.categories)
    ? product.categories
    : product?.categories
      ? [product.categories]
      : [];

  return rawCategories.map(normalizeCategoryKey).filter(Boolean);
}

function featuredCollectionKeys(product) {
  const featured = ["value-deal", "bestseller", "new-arrival"];
  const categories = productCategoryKeys(product);
  return featured.filter((key) => categories.includes(key));
}

function chooseRelatedProducts(product, products) {
  const currentCollections = featuredCollectionKeys(product);
  const candidates = products.filter((item) => item.id !== product.id);
  const sameCollection = candidates.filter((item) => {
    const itemCollections = featuredCollectionKeys(item);
    return currentCollections.some((key) => itemCollections.includes(key));
  });

  if (sameCollection.length) {
    return { items: sameCollection.slice(0, 8), source: "collection" };
  }

  const sameType = candidates.filter((item) => item.type === product.type);
  if (sameType.length) {
    return { items: sameType.slice(0, 8), source: "type" };
  }

  return { items: candidates.slice(0, 8), source: "all" };
}

function SpecificationsList({ product, typeLabel, collectionLabel, attributes }) {
  const specs = [
    ["Type", typeLabel],
    ["Collection", collectionLabel],
    ["Item", product?.title],
    ["Quality", "Checked"],
    ["Pack", productField(product, "pack_size") || productField(product, "pack")],
    ["Volume", productField(product, "volume")],
    ["Material", productField(product, "material")],
    ["Recommended use", productField(product, "recommended_use")],
    ...attributes.map(([key, value]) => [
      formatAttributeKey(key),
      formatAttributeValue(value),
    ]),
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {specs.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RatingRow({ rating = 4.6, count = 312 }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm tracking-wide text-amber-500">★★★★★</span>
      <span className="text-sm font-semibold text-slate-900">{rating}</span>
      <span className="text-sm text-slate-500">({count} reviews)</span>
    </div>
  );
}

function RelatedProductCard({ product }) {
  const price = Number(product?.base_price ?? 0);
  const imageUrl = normalizeHttpsUrl(product?.image_url);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-200"
    >
      <div className="relative flex aspect-4/3 items-center justify-center bg-linear-to-b from-slate-50 to-white p-5">
        <img
          src={imageUrl || FALLBACK_IMAGE}
          alt={product.title || "Product"}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {product?.categories?.[0] ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white">
            {collectionLabelFromKey(product.categories[0])}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-base font-bold text-slate-900">₹{price}</div>
          <span className="text-xs font-semibold text-slate-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [related, setRelated] = useState([]);
  const [relatedSource, setRelatedSource] = useState("collection");
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
      setLoading(true);
      setErr("");
      setPinMsg("");

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

  useEffect(() => {
    if (!product?.id) return;
    let alive = true;

    const fetchRelated = async () => {
      setRelatedLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id,title,base_price,image_url,description,is_active,categories,type",
        )
        .eq("store_id", STORE_ID)
        .eq("is_active", true)
        .neq("id", product.id)
        .order("created_at", { ascending: false })
        .limit(60);

      if (!alive) return;

      if (!error && Array.isArray(data)) {
        const result = chooseRelatedProducts(product, data);
        setRelated(result.items);
        setRelatedSource(result.source);
      } else {
        setRelated([]);
        setRelatedSource("all");
      }

      setRelatedLoading(false);
    };

    fetchRelated();
    return () => {
      alive = false;
    };
  }, [product]);

  const cartItem = items.find((it) => it.productId === product?.id);
  const qtyInCart = cartItem?.quantity ?? 0;

  const price = useMemo(() => {
    const p = selectedVariant?.price ?? product?.base_price ?? 0;
    return Number(p);
  }, [selectedVariant, product]);

  const mrp = productMrp(product);
  const hasMrp = mrp != null;
  const discountPct =
    hasMrp && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : null;

  const imageUrl = normalizeHttpsUrl(product?.image_url);
  const inStock = product?.is_active !== false;
  const typeLabel = product?.type || "Home cleaning";
  const currentCollectionKeys = featuredCollectionKeys(product);
  const collectionLabel =
    currentCollectionKeys.map(collectionLabelFromKey).join(", ") ||
    collectionLabelFromKey(product?.category || product?.categories?.[0]);
  const attributeEntries = getAttributeEntries(product?.attributes);
  const relatedHeading =
    relatedSource === "collection" && currentCollectionKeys.length > 0
      ? `More from ${collectionLabel}`
      : relatedSource === "type"
        ? `More ${typeLabel} products`
        : "More products you may like";
  const relatedCopy =
    relatedSource === "collection"
      ? "Pick another product from the same featured collection."
      : "A few more useful products from this store.";

  const handleAddToCart = () => {
    if (!inStock) return;

    addItem({
      productId: product.id,
      storeId: STORE_ID,
      title: product.title,
      price,
      imageUrl: normalizeHttpsUrl(product.image_url),
    });

    toast.success(
      qtyInCart > 0
        ? `Updated cart, ${qtyInCart + 1} in cart`
        : "Added to cart",
    );
  };

  const handleCheckPincode = () => {
    const ok = /^\d{6}$/.test(pincode.trim());
    setPinMsg(
      ok
        ? "Delivery available. Estimated 2 to 5 days. Free shipping above ₹999."
        : "Enter a valid 6-digit pincode.",
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
            ?
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
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-700">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-700">
            Products
          </Link>
          <span>/</span>
          <span className="line-clamp-1 font-semibold text-slate-700">
            {product.title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative flex aspect-4/5 items-center justify-center bg-linear-to-b from-slate-50 to-white p-6 sm:p-8">
                <img
                  src={imageUrl || FALLBACK_IMAGE}
                  alt={product.title}
                  loading="eager"
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                {productField(product, "badge") ? (
                  <span className="absolute left-4 top-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {productField(product, "badge")}
                  </span>
                ) : null}

                {discountPct ? (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {discountPct}% OFF
                  </span>
                ) : null}

                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    Quality checked
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    Secure packing
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    Fast dispatch
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 hidden lg:block">
              <DetailSection title="Specifications">
                <SpecificationsList
                  product={product}
                  typeLabel={typeLabel}
                  collectionLabel={collectionLabel}
                  attributes={attributeEntries}
                />
              </DetailSection>
            </div>

            <div className="mt-6 hidden gap-3 lg:grid lg:grid-cols-3">
              {[
                ["Daily home use", "Made for regular cleaning routines"],
                ["Quick dispatch", "Packed within 24 to 48 hours"],
                ["Protected parcel", "Neat wrap for safe delivery"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {title}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {product.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                      Type: <span className="text-slate-950">{typeLabel}</span>
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                      Collection:{" "}
                      <span className="text-slate-950">{collectionLabel}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    inStock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700",
                  ].join(" ")}
                >
                  {inStock ? "In stock" : "Out of stock"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <RatingRow />
                <span className="text-xs font-semibold text-slate-500">
                  Trusted choice
                </span>
              </div>

              {productField(product, "short_description") ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {productField(product, "short_description")}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div className="text-3xl font-black tracking-tight text-slate-900">
                  ₹{price}
                </div>

                {hasMrp ? (
                  <div className="pb-1 text-sm text-slate-500 line-through">
                    ₹{mrp}
                  </div>
                ) : (
                  <div className="pb-1 text-sm text-slate-500">
                    Taxes as applicable
                  </div>
                )}

                <span className="pb-1 text-sm font-semibold text-emerald-700">
                  {hasMrp ? "Deal price" : "Best price"}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Check delivery
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={pincode}
                    onChange={(event) => setPincode(event.target.value)}
                    placeholder="Enter pincode"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleCheckPincode}
                    className="shrink-0 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    Check
                  </button>
                </div>
                {/* <p className="mt-2 text-xs text-slate-600">
                  {pinMsg || "COD may be available. Easy returns."}
                </p> */}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={[
                    "w-full rounded-2xl px-6 py-3.5 text-sm font-semibold transition focus:outline-none focus:ring-4",
                    !inStock
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 focus:ring-slate-200",
                  ].join(" ")}
                >
                  {!inStock
                    ? "Out of stock"
                    : qtyInCart > 0
                      ? `In cart: ${qtyInCart}. Add more`
                      : "Add to cart"}
                </button>

                <Link
                  to="/cart"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Go to cart
                </Link>
              </div>

              <div className="mt-6">
                <DetailSection title="Description" tone="soft">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p>
                      A practical home-care essential selected for everyday
                      cleaning, quick use, and dependable performance.
                    </p>
                  )}
                </DetailSection>
              </div>

              <div className="mt-6 lg:hidden">
                <DetailSection title="Specifications" tone="soft">
                  <SpecificationsList
                    product={product}
                    typeLabel={typeLabel}
                    collectionLabel={collectionLabel}
                    attributes={attributeEntries}
                  />
                </DetailSection>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Offers for you
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Bundle deals on select home essentials</li>
                  <li>Invoice available for every order</li>
                  <li>Free shipping above ₹999</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Accordion
                items={[
                  {
                    title: "Package and Care",
                    content: (
                      <ul className="list-disc pl-5">
                        <li>Protective packing to reduce leakage or damage</li>
                        <li>Store in a cool, dry place</li>
                        <li>Keep cleaning liquids away from children</li>
                      </ul>
                    ),
                  },
                  {
                    title: "Shipping and Returns",
                    content: (
                      <ul className="list-disc pl-5">
                        <li>Dispatch usually happens within 24 to 48 hours</li>
                        <li>Delivery usually takes 2 to 5 business days</li>
                        <li>Returns follow the store policy for unused items</li>
                      </ul>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 text-xs text-slate-600">
          {[
            "Secure payments",
            "Fast dispatch",
            "Careful packing",
            "Quality checked",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {relatedHeading}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{relatedCopy}</p>
            </div>
            <Link
              to={
                currentCollectionKeys[0]
                  ? `/products?category=${currentCollectionKeys[0]}`
                  : "/products"
              }
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View collection
            </Link>
          </div>

          {relatedLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-40 bg-slate-100" />
                  <div className="p-4">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : related.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <RelatedProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No related products found in this collection yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
