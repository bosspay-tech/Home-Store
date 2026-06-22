const STORED_IN_ATTRIBUTES = new Set([
  "mrp",
  "short_description",
  "badge",
  "rating",
  "pack_size",
  "pack",
  "volume",
  "material",
  "recommended_use",
]);

export function productField(product, key) {
  const top = product?.[key];
  if (top != null && top !== "") return top;
  const nested = product?.attributes?.[key];
  if (nested != null && nested !== "") return nested;
  return null;
}

export function productMrp(product) {
  const value = Number(productField(product, "mrp"));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function productAttributeEntries(attributes) {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    return [];
  }

  return Object.entries(attributes).filter(([key]) => !STORED_IN_ATTRIBUTES.has(key));
}
