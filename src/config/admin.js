const raw = import.meta.env.VITE_ADMIN_EMAILS ?? "";

export const ADMIN_EMAILS = raw
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const PRODUCT_CATEGORIES = [
  { value: "bestseller", label: "Best Sellers" },
  { value: "new-arrival", label: "New Arrivals" },
  { value: "value-deal", label: "Value Deals" },
];

export const PRODUCT_TYPES = [
  "Dishwash",
  "Handwash",
  "Floor Cleaner",
  "Glass Cleaner",
  "Freshener",
  "Toilet Cleaner",
  "Cleaning Tools",
  "Kitchen Cleaner",
  "Laundry",
  "Surface Cleaner",
];
