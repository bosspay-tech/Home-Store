import { STORE_ID } from "../../config/store";

/** Columns that exist on the live `products` table. */
const DB_WRITE_KEYS = new Set([
  "store_id",
  "title",
  "slug",
  "description",
  "base_price",
  "image_url",
  "type",
  "categories",
  "is_active",
  "attributes",
  "variants",
]);

const ATTRIBUTE_FIELD_KEYS = [
  "mrp",
  "short_description",
  "badge",
  "rating",
  "pack_size",
  "pack",
  "volume",
  "material",
  "recommended_use",
];

export function slugifyTitle(title) {
  const base = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base ? `${base}-${Date.now().toString(36).slice(-4)}` : "";
}

export function emptyProductForm() {
  return {
    title: "",
    slug: "",
    description: "",
    short_description: "",
    base_price: "",
    mrp: "",
    image_url: "",
    type: "",
    categories: [],
    is_active: true,
    badge: "",
    rating: "",
    pack_size: "",
    pack: "",
    volume: "",
    material: "",
    recommended_use: "",
    attributesJson: "",
    variantsJson: "",
  };
}

function readAttr(product, key) {
  if (product?.[key] != null && product[key] !== "") return product[key];
  const attrs = product?.attributes;
  if (attrs && typeof attrs === "object" && attrs[key] != null) {
    return attrs[key];
  }
  return "";
}

export function productToForm(product) {
  if (!product) return emptyProductForm();

  const customJson = { ...(product.attributes || {}) };
  for (const key of ATTRIBUTE_FIELD_KEYS) {
    delete customJson[key];
  }

  return {
    title: product.title ?? "",
    slug: product.slug ?? "",
    description: product.description ?? "",
    short_description: readAttr(product, "short_description"),
    base_price: product.base_price ?? "",
    mrp: readAttr(product, "mrp"),
    image_url: product.image_url ?? "",
    type: product.type ?? "",
    categories: Array.isArray(product.categories) ? product.categories : [],
    is_active: product.is_active !== false,
    badge: readAttr(product, "badge"),
    rating: readAttr(product, "rating"),
    pack_size: readAttr(product, "pack_size"),
    pack: readAttr(product, "pack"),
    volume: readAttr(product, "volume"),
    material: readAttr(product, "material"),
    recommended_use: readAttr(product, "recommended_use"),
    attributesJson:
      Object.keys(customJson).length > 0
        ? JSON.stringify(customJson, null, 2)
        : "",
    variantsJson:
      product.variants != null ? JSON.stringify(product.variants, null, 2) : "",
  };
}

function parseOptionalJson(raw, fieldName) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { value: null };

  try {
    return { value: JSON.parse(trimmed) };
  } catch {
    return { error: `${fieldName} must be valid JSON.` };
  }
}

function buildAttributes(form, parsedAttributes) {
  const attrs =
    parsedAttributes && typeof parsedAttributes === "object"
      ? { ...parsedAttributes }
      : {};

  const mrpRaw = String(form.mrp ?? "").trim();
  if (mrpRaw) {
    const mrp = Number(mrpRaw);
    if (Number.isFinite(mrp) && mrp > 0) attrs.mrp = mrp;
    else delete attrs.mrp;
  } else {
    delete attrs.mrp;
  }

  const ratingRaw = String(form.rating ?? "").trim();
  if (ratingRaw) {
    const rating = Number(ratingRaw);
    if (Number.isFinite(rating)) attrs.rating = rating;
    else delete attrs.rating;
  } else {
    delete attrs.rating;
  }

  for (const key of ATTRIBUTE_FIELD_KEYS) {
    if (key === "mrp" || key === "rating") continue;
    const value = String(form[key] ?? "").trim();
    if (value) attrs[key] = value;
    else delete attrs[key];
  }

  return Object.keys(attrs).length ? attrs : null;
}

export function formToProductPayload(form, { id, slugOverride, forUpdate = false }) {
  const title = form.title.trim();
  if (!title) return { error: "Title is required." };

  const basePrice = Number(form.base_price);
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return { error: "Base price must be a positive number." };
  }

  const mrpRaw = String(form.mrp ?? "").trim();
  if (mrpRaw) {
    const mrp = Number(mrpRaw);
    if (!Number.isFinite(mrp) || mrp <= 0) {
      return { error: "MRP must be a positive number when provided." };
    }
  }

  const ratingRaw = String(form.rating ?? "").trim();
  if (ratingRaw) {
    const rating = Number(ratingRaw);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return { error: "Rating must be between 0 and 5." };
    }
  }

  const attributesResult = parseOptionalJson(form.attributesJson, "Attributes");
  if (attributesResult.error) return { error: attributesResult.error };

  const variantsResult = parseOptionalJson(form.variantsJson, "Variants");
  if (variantsResult.error) return { error: variantsResult.error };

  const slug = (form.slug || slugOverride || slugifyTitle(title)).trim();

  const payload = {
    store_id: STORE_ID,
    title,
    slug,
    description: form.description.trim() || null,
    base_price: basePrice,
    image_url: form.image_url.trim() || null,
    type: form.type.trim() || null,
    categories: form.categories?.length ? form.categories : [],
    is_active: !!form.is_active,
    attributes: buildAttributes(form, attributesResult.value),
    variants: variantsResult.value,
  };

  if (id && !forUpdate) payload.id = id;

  const clean = {};
  for (const [key, value] of Object.entries(payload)) {
    if (DB_WRITE_KEYS.has(key)) clean[key] = value;
  }

  return { payload: clean };
}
