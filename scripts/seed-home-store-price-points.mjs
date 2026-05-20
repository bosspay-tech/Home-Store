import fs from "node:fs";

const PRICE_POINT_PRODUCTS = [
  {
    id: "f250d657-223d-4f26-9e3e-4dcae6be896e",
    title: "FreshLime Dishwash Gel 500ml",
    slug: "freshlime-dishwash-gel-500ml-210",
    base_price: 210,
    type: "Dishwash",
    categories: ["value-deal", "new-arrival"],
    image_url:
      "images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=70",
    description:
      "Concentrated dishwash gel for everyday utensils with a fresh citrus fragrance.",
  },
  {
    id: "a79473aa-4ba8-4148-857c-28ac8c2ceba6",
    title: "SparkFoam Handwash Refill 750ml",
    slug: "sparkfoam-handwash-refill-750ml-210",
    base_price: 210,
    type: "Handwash",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1607006483224-838e2ac8c7a9?auto=format&fit=crop&w=1200&q=70",
    description:
      "Gentle handwash refill for frequent use with a clean, mild fragrance.",
  },
  {
    id: "16355151-f11e-4c61-88c0-4d3e417c8b83",
    title: "NeemGuard Floor Cleaner 1L",
    slug: "neemguard-floor-cleaner-1l-210",
    base_price: 210,
    type: "Floor Cleaner",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Daily-use floor cleaner with neem-inspired freshness for household surfaces.",
  },
  {
    id: "727baa1f-35c3-498a-b2b2-bf5c6daa3085",
    title: "QuickShine Glass Cleaner 500ml",
    slug: "quickshine-glass-cleaner-500ml-210",
    base_price: 210,
    type: "Glass Cleaner",
    categories: ["new-arrival"],
    image_url:
      "images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1200&q=70",
    description:
      "Streak-free glass cleaner for mirrors, windows, counters, and glossy surfaces.",
  },
  {
    id: "615f9c4e-4a42-4d61-9530-bd17db4cdb60",
    title: "FreshNest Room Freshener 250ml",
    slug: "freshnest-room-freshener-250ml-210",
    base_price: 210,
    type: "Freshener",
    categories: ["new-arrival", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=70",
    description:
      "Long-lasting room freshener spray for bedrooms, living rooms, and workspaces.",
  },
  {
    id: "b73d6c23-e9dd-474f-ad04-3bcee57c5c3b",
    title: "ActiveClean Toilet Cleaner 500ml",
    slug: "activeclean-toilet-cleaner-500ml-210",
    base_price: 210,
    type: "Toilet Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Thick toilet cleaning liquid for stains, scale, and everyday bathroom freshness.",
  },
  {
    id: "13afea1e-786b-4e7f-bee3-69e3010b71fa",
    title: "Microfiber Cleaning Cloth Pack of 4",
    slug: "microfiber-cleaning-cloth-pack-4-210",
    base_price: 210,
    type: "Cleaning Tools",
    categories: ["bestseller"],
    image_url:
      "images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=70",
    description:
      "Soft microfiber cloths for dusting, polishing, and kitchen counter cleanup.",
  },
  {
    id: "fc21ba7b-4dfc-4bf4-b63a-222bea544d30",
    title: "Citrus Kitchen Degreaser 500ml",
    slug: "citrus-kitchen-degreaser-500ml-210",
    base_price: 210,
    type: "Kitchen Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Citrus-powered cleaner for oily kitchen counters, stovetops, and tiles.",
  },
  {
    id: "9de1133e-168d-4785-8ece-4477692a9edd",
    title: "Herbal Floor Cleaner 2L",
    slug: "herbal-floor-cleaner-2l-250",
    base_price: 250,
    type: "Floor Cleaner",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Large-size herbal floor cleaner for daily mopping and fresh-smelling rooms.",
  },
  {
    id: "1a9e1992-3b1f-40d2-afb8-98c1d060ff92",
    title: "Lemon Dishwash Bar Pack of 4",
    slug: "lemon-dishwash-bar-pack-4-250",
    base_price: 250,
    type: "Dishwash",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=70",
    description:
      "Value pack of lemon dishwash bars for tough grease and everyday cleaning.",
  },
  {
    id: "15b0cde9-88fb-4037-883b-8f1a8a313762",
    title: "Surface Sanitizer Spray 500ml",
    slug: "surface-sanitizer-spray-500ml-250",
    base_price: 250,
    type: "Sanitizer",
    categories: ["new-arrival"],
    image_url:
      "images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=1200&q=70",
    description:
      "Fast-use surface sanitizer spray for tables, handles, counters, and appliances.",
  },
  {
    id: "6764c7f5-2d5b-4947-a462-773793d6cb22",
    title: "Bathroom Scale Remover 500ml",
    slug: "bathroom-scale-remover-500ml-250",
    base_price: 250,
    type: "Bathroom Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Bathroom cleaner for scale, soap marks, taps, basins, and tile corners.",
  },
  {
    id: "1f5108fa-510c-43a8-b98b-f66feec1a2e7",
    title: "Cotton Mop Refill",
    slug: "cotton-mop-refill-250",
    base_price: 250,
    type: "Cleaning Tools",
    categories: ["bestseller"],
    image_url:
      "images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=70",
    description:
      "Absorbent cotton mop refill for regular home and office floor cleaning.",
  },
  {
    id: "9f6f03b9-6086-4819-aeb3-8e15015f72da",
    title: "Scrub Pad Heavy Duty Pack of 10",
    slug: "scrub-pad-heavy-duty-pack-10-250",
    base_price: 250,
    type: "Cleaning Tools",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Heavy-duty scrub pads for utensils, sinks, tiles, and tough kitchen stains.",
  },
  {
    id: "1a2dadf3-4e89-4a92-a749-29cc643df702",
    title: "Laundry Liquid Detergent 1L",
    slug: "laundry-liquid-detergent-1l-250",
    base_price: 250,
    type: "Laundry",
    categories: ["new-arrival", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=70",
    description:
      "Liquid detergent for machine and bucket wash with dependable stain removal.",
  },
  {
    id: "36b2d721-7b9f-4ea1-8e7a-052b5ffdeb6e",
    title: "Garbage Bags Medium 30 Count",
    slug: "garbage-bags-medium-30-count-250",
    base_price: 250,
    type: "Waste Bags",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1200&q=70",
    description:
      "Medium garbage bag roll for kitchen bins, office bins, and daily disposal.",
  },
  {
    id: "5470b2d5-c0c0-4494-99ff-bba87bea3018",
    title: "PowerClean Floor Cleaner Combo",
    slug: "powerclean-floor-cleaner-combo-295",
    base_price: 295,
    type: "Floor Cleaner",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Two-piece floor cleaning combo for routine mopping and household freshness.",
  },
  {
    id: "5213cf28-77bc-40e0-a545-36851df708c1",
    title: "AquaFresh Toilet Cleaner Twin Pack",
    slug: "aquafresh-toilet-cleaner-twin-pack-295",
    base_price: 295,
    type: "Toilet Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Twin pack toilet cleaner for stain control, hygiene, and lasting freshness.",
  },
  {
    id: "266222c3-ee3d-4c13-acef-a80a70c69968",
    title: "Stainless Steel Scrubber Pack",
    slug: "stainless-steel-scrubber-pack-295",
    base_price: 295,
    type: "Cleaning Tools",
    categories: ["bestseller"],
    image_url:
      "images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Durable stainless steel scrubber pack for cookware, grills, and utensils.",
  },
  {
    id: "eb044317-d54e-435c-a53b-7b670a465d31",
    title: "GermShield Disinfectant Spray 400ml",
    slug: "germshield-disinfectant-spray-400ml-295",
    base_price: 295,
    type: "Disinfectant",
    categories: ["new-arrival"],
    image_url:
      "images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=1200&q=70",
    description:
      "Disinfectant spray for frequently touched surfaces and everyday household use.",
  },
  {
    id: "60577fee-2644-4949-a461-62612b7e8fca",
    title: "Fabric Freshener Lavender 500ml",
    slug: "fabric-freshener-lavender-500ml-295",
    base_price: 295,
    type: "Freshener",
    categories: ["new-arrival", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=70",
    description:
      "Lavender fabric freshener for curtains, sofas, bedding, and wardrobes.",
  },
  {
    id: "f88c9d66-7461-4d37-88bb-7ccd7c06fee2",
    title: "Handwash Pump Twin Pack",
    slug: "handwash-pump-twin-pack-295",
    base_price: 295,
    type: "Handwash",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1607006483224-838e2ac8c7a9?auto=format&fit=crop&w=1200&q=70",
    description:
      "Twin handwash pumps for bathrooms and kitchens with a gentle cleansing feel.",
  },
  {
    id: "63440939-d3d8-4f91-9388-c725cde5067e",
    title: "Multipurpose Wipes 80 Pulls",
    slug: "multipurpose-wipes-80-pulls-295",
    base_price: 295,
    type: "Wipes",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=70",
    description:
      "Multipurpose cleaning wipes for quick surface cleanups across the home.",
  },
  {
    id: "4b175cb2-4ad9-4556-a78e-319fd046c1dc",
    title: "Tile Cleaner 1L",
    slug: "tile-cleaner-1l-295",
    base_price: 295,
    type: "Bathroom Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1200&q=70",
    description:
      "Tile cleaner for bathroom and kitchen tiles, grout lines, and wall surfaces.",
  },
  {
    id: "c99b4769-463c-45f1-a134-9a3383d1c9f9",
    title: "Monthly Home Cleaning Kit",
    slug: "monthly-home-cleaning-kit-490",
    base_price: 490,
    type: "Cleaning Combo",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Balanced monthly kit with essentials for floors, surfaces, and bathrooms.",
  },
  {
    id: "0ba6ad1e-0255-4e35-a1ac-144b1e369a0d",
    title: "Premium Microfiber Mop Set",
    slug: "premium-microfiber-mop-set-490",
    base_price: 490,
    type: "Cleaning Tools",
    categories: ["new-arrival"],
    image_url:
      "images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=70",
    description:
      "Premium mop set with microfiber head for smooth and efficient mopping.",
  },
  {
    id: "12baba26-754b-437c-8de9-4452c452bb57",
    title: "Laundry Care Combo Pack",
    slug: "laundry-care-combo-pack-490",
    base_price: 490,
    type: "Laundry",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=70",
    description:
      "Laundry detergent and fabric care combo for weekly family washing needs.",
  },
  {
    id: "574561e2-1a1a-4658-84c9-15c1758195c4",
    title: "Kitchen Deep Clean Combo",
    slug: "kitchen-deep-clean-combo-490",
    base_price: 490,
    type: "Kitchen Cleaner",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Kitchen deep-clean combo for grease, counters, sinks, and appliance surfaces.",
  },
  {
    id: "0beff225-33bf-4f13-bdcc-e2e5630df1f1",
    title: "Bathroom Deep Clean Combo",
    slug: "bathroom-deep-clean-combo-490",
    base_price: 490,
    type: "Bathroom Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Bathroom cleaning combo for toilets, tiles, basins, fittings, and floors.",
  },
  {
    id: "e75971e1-3eb6-4a63-bd97-3c78819fa444",
    title: "Floor Care Twin Pack 5L",
    slug: "floor-care-twin-pack-5l-490",
    base_price: 490,
    type: "Floor Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Large floor-care twin pack for homes, shops, offices, and regular mopping.",
  },
  {
    id: "4fb9c249-0174-4a47-8817-1e195ba6e97c",
    title: "Odor Control Room Freshener Trio",
    slug: "odor-control-room-freshener-trio-490",
    base_price: 490,
    type: "Freshener",
    categories: ["new-arrival", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=70",
    description:
      "Three-room freshener set for bedrooms, bathrooms, living rooms, and cars.",
  },
  {
    id: "2e5188b4-854e-45ad-8217-77bbba3d847a",
    title: "Dishwash Gel Super Saver 3L",
    slug: "dishwash-gel-super-saver-3l-490",
    base_price: 490,
    type: "Dishwash",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=70",
    description:
      "Bulk dishwash gel pack for high-use kitchens and monthly household needs.",
  },
  {
    id: "b28266f2-bf91-4e9c-968c-29f26dcf48dc",
    title: "Complete Home Hygiene Mega Kit",
    slug: "complete-home-hygiene-mega-kit-988",
    base_price: 988,
    type: "Cleaning Combo",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Full home hygiene kit with cleaning liquids, sprays, and daily-use essentials.",
  },
  {
    id: "acdbd847-574a-4f22-a4ed-5ba0cabbb878",
    title: "Premium Cleaning Starter Bundle",
    slug: "premium-cleaning-starter-bundle-988",
    base_price: 988,
    type: "Cleaning Combo",
    categories: ["new-arrival", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=70",
    description:
      "Starter bundle for setting up a complete household cleaning routine.",
  },
  {
    id: "8be87be3-54ae-44b5-8a60-9b68e16e5fea",
    title: "Family Laundry Monthly Pack",
    slug: "family-laundry-monthly-pack-988",
    base_price: 988,
    type: "Laundry",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=70",
    description:
      "Monthly laundry bundle with detergent and fabric-care essentials for families.",
  },
  {
    id: "0afaac17-138a-43b1-bac7-79e24d0eb29c",
    title: "Full Kitchen Care Mega Combo",
    slug: "full-kitchen-care-mega-combo-988",
    base_price: 988,
    type: "Kitchen Cleaner",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Kitchen care combo with degreaser, dishwash, scrubbers, and surface cleaner.",
  },
  {
    id: "bdd01234-e3fb-4d6d-a866-5b837e7d2980",
    title: "Bathroom Hygiene Mega Combo",
    slug: "bathroom-hygiene-mega-combo-988",
    base_price: 988,
    type: "Bathroom Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=1200&q=70",
    description:
      "Bathroom hygiene combo for toilets, tiles, floors, mirrors, and fixtures.",
  },
  {
    id: "7c309ebb-11b4-43b6-9fcc-82a3e9934aba",
    title: "Floor Cleaning Bulk Pack 10L",
    slug: "floor-cleaning-bulk-pack-10l-988",
    base_price: 988,
    type: "Floor Cleaner",
    categories: ["value-deal"],
    image_url:
      "images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=70",
    description:
      "Bulk floor cleaner pack for homes, small businesses, offices, and stores.",
  },
  {
    id: "addc9e63-f444-4b5e-9e15-2c1749dfed02",
    title: "Hospitality Cleaning Essentials Kit",
    slug: "hospitality-cleaning-essentials-kit-988",
    base_price: 988,
    type: "Cleaning Combo",
    categories: ["new-arrival"],
    image_url:
      "images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=70",
    description:
      "Cleaning essentials kit for guest rooms, counters, floors, and shared spaces.",
  },
  {
    id: "90e059cf-5e7e-4a55-8749-af4aa0fed2c8",
    title: "Full Home Fragrance and Hygiene Combo",
    slug: "full-home-fragrance-hygiene-combo-988",
    base_price: 988,
    type: "Freshener",
    categories: ["bestseller", "value-deal"],
    image_url:
      "images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=70",
    description:
      "Fragrance and hygiene combo for rooms, fabrics, counters, and bathroom spaces.",
  },
];

const REQUIRED_PRICE_POINTS = [210, 250, 295, 490, 988];
const STORE_ID = "home-store";

function readEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

function validateProducts(products) {
  const counts = new Map(REQUIRED_PRICE_POINTS.map((price) => [price, 0]));

  for (const product of products) {
    if (!counts.has(product.base_price)) continue;
    counts.set(product.base_price, counts.get(product.base_price) + 1);
  }

  const invalid = [...counts.entries()].filter(([, count]) => count < 8);
  if (invalid.length) {
    throw new Error(
      `Each requested price point needs at least 8 products. Missing: ${invalid
        .map(([price, count]) => `${price} has ${count}`)
        .join(", ")}`,
    );
  }
}

async function upsertProducts() {
  validateProducts(PRICE_POINT_PRODUCTS);

  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  const rows = PRICE_POINT_PRODUCTS.map((product) => ({
    ...product,
    store_id: STORE_ID,
    attributes: null,
    variants: null,
    is_active: true,
  }));

  const response = await fetch(`${url}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase upsert failed (${response.status}): ${body}`);
  }

  const inserted = JSON.parse(body);
  const counts = inserted.reduce((memo, product) => {
    memo[product.base_price] = (memo[product.base_price] || 0) + 1;
    return memo;
  }, {});

  console.log(`Upserted ${inserted.length} home-store products.`);
  console.log(`Price point counts in this seed: ${JSON.stringify(counts)}`);
}

upsertProducts().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
