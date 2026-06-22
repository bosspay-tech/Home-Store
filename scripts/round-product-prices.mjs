/**
 * Snap product base_price to allowed GST-inclusive retail price points.
 *
 * Allowed prices:
 *   ₹100–₹800     → 100, 200, 300, 400, 500, 600, 800
 *   Round ₹1k     → 1000, 2000, 3000, 4000, 5000  (single / standard items)
 *   Near / under  → 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500
 *                   (combo / pack / kit — priced just under the next round thousand)
 *
 * Usage:
 *   npm run round-prices           # preview + price report
 *   npm run round-prices:apply     # write to Supabase
 */

import fs from "node:fs";

const STORE_ID = "home-store";

export const LOW_PRICES = [100, 200, 300, 400, 500, 600, 800];

export const ROUND_THOUSANDS = [1000, 2000, 3000, 4000, 5000];

export const HALF_THOUSANDS = [
  1500, 2500, 3500, 4500, 5500,
];

export const ALLOWED_PRICES = [
  ...LOW_PRICES,
  ...ROUND_THOUSANDS,
  ...HALF_THOUSANDS,
].sort((a, b) => a - b);

function readEnv() {
  const merged = {};

  for (const file of [".env", "bridge/.env"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      merged[trimmed.slice(0, index)] = trimmed.slice(index + 1);
    }
  }

  return merged;
}

function isMultiProductTitle(title) {
  const text = (title || "").toLowerCase();
  return /\b(combo|pack|kit|bundle|starter|ultimate|hygiene|collection|bestseller|edition|limited|multi|surface|care|cleaning)\b/.test(
    text,
  );
}

/** Nearest tier; ties round up to the higher price. */
function pickNearest(tiers, value) {
  if (!tiers.length) return null;

  let best = tiers[0];
  let bestDist = Math.abs(value - best);

  for (const tier of tiers) {
    const dist = Math.abs(value - tier);
    if (dist < bestDist || (dist === bestDist && tier > best)) {
      best = tier;
      bestDist = dist;
    }
  }

  return best;
}

function snapLowPrice(value) {
  return pickNearest(LOW_PRICES, value);
}

function snapHighPrice(value, title) {
  const multi = isMultiProductTitle(title);

  if (multi) {
    const half = pickNearest(HALF_THOUSANDS, value);
    const round = pickNearest(ROUND_THOUSANDS, value);
    const halfDist = Math.abs(value - half);
    const roundDist = Math.abs(value - round);

    // Combos sit on near-under half-thousands unless a round thousand is much closer.
    if (halfDist <= roundDist + 200) return half;
    return round;
  }

  if (value > 5250) {
    return pickNearest(
      ALLOWED_PRICES.filter((price) => price >= 5000),
      value,
    );
  }

  return pickNearest(ROUND_THOUSANDS, value);
}

/** Snap to allowed shelf price based on product type and current value. */
export function roundRetailPrice(price, title = "") {
  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0) return null;

  if (value < 1000) return snapLowPrice(value);

  return snapHighPrice(value, title);
}

function priceKind(price) {
  if (ROUND_THOUSANDS.includes(price)) return "round-thousand";
  if (HALF_THOUSANDS.includes(price)) return "near-under";
  if (LOW_PRICES.includes(price)) return "low-tier";
  return "other";
}

function formatRupee(amount) {
  if (amount == null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function countByPrice(rows, pickPrice) {
  const map = new Map();
  for (const row of rows) {
    const price = pickPrice(row);
    if (price == null || !Number.isFinite(price)) continue;
    map.set(price, (map.get(price) || 0) + 1);
  }
  return map;
}

function printAllowedTierSummary(rows, pickPrice) {
  console.log("\nAllowed price tiers (your price list)");
  console.log("-".repeat(40));

  for (const tier of ALLOWED_PRICES) {
    const count = rows.filter((row) => pickPrice(row) === tier).length;
    const label = count > 0 ? `${count} product(s)` : "—";
    const tag = ROUND_THOUSANDS.includes(tier)
      ? "round"
      : HALF_THOUSANDS.includes(tier)
        ? "near"
        : "";
    console.log(
      `  ${formatRupee(tier).padEnd(12)} ${label.padEnd(14)} ${tag}`,
    );
  }
}

function printKindSummary(rows, pickPrice) {
  const round = rows.filter(
    (row) => priceKind(pickPrice(row)) === "round-thousand",
  ).length;
  const near = rows.filter(
    (row) => priceKind(pickPrice(row)) === "near-under",
  ).length;
  const low = rows.filter((row) => priceKind(pickPrice(row)) === "low-tier").length;

  console.log("\nPrice mix");
  console.log("-".repeat(40));
  console.log(`  Under ₹1,000 (100–800)     ${low} product(s)`);
  console.log(`  Round ₹1k (1000–5000)      ${round} product(s)`);
  console.log(`  Near-under (1500–9500)     ${near} product(s)`);
}

function printPriceDistribution(title, priceMap) {
  console.log(`\n${title}`);
  console.log("-".repeat(40));

  const used = [...priceMap.entries()].sort((a, b) => a[0] - b[0]);
  if (!used.length) {
    console.log("  (none)");
    return;
  }

  for (const [price, count] of used) {
    const ok = ALLOWED_PRICES.includes(price) ? "" : "  ⚠ not allowed";
    console.log(`  ${formatRupee(price).padEnd(12)} ${count} product(s)${ok}`);
  }
}

function planUpdate(product) {
  const oldBase = Number(product.base_price);
  const newBase = roundRetailPrice(oldBase, product.title);

  const plan = {
    id: product.id,
    title: product.title,
    oldBase,
    newBase,
    changed: newBase !== oldBase,
    patch: newBase !== oldBase ? { base_price: newBase } : {},
    reason: "",
  };

  if (plan.changed) {
    if (newBase < 1000) plan.reason = "low tier";
    else if (isMultiProductTitle(product.title)) plan.reason = "combo → near-under";
    else if (ROUND_THOUSANDS.includes(newBase)) plan.reason = "single → round thousand";
    else plan.reason = "high tier";
  }

  plan.setPrice = (price, reason) => {
    plan.newBase = price;
    plan.changed = price !== plan.oldBase;
    plan.patch = plan.changed ? { base_price: price } : {};
    plan.reason = reason;
  };

  return plan;
}

/** Ensure round thousands (1000–5000) and near-under tiers both have products. */
function applyCatalogMix(plans) {
  const halfToRound = [
    [1500, 2000],
    [2500, 3000],
    [3500, 4000],
    [4500, 5000],
  ];

  for (const [half, round] of halfToRound) {
    const group = plans.filter((plan) => plan.newBase === half);
    if (!group.length) continue;

    const promoteCount = Math.max(1, Math.floor(group.length / 2));
    const sorted = [...group].sort((a, b) => {
      const aMulti = isMultiProductTitle(a.title) ? 1 : 0;
      const bMulti = isMultiProductTitle(b.title) ? 1 : 0;
      if (aMulti !== bMulti) return aMulti - bMulti;
      return (a.title?.length || 0) - (b.title?.length || 0);
    });

    for (let i = 0; i < promoteCount; i++) {
      const plan = sorted[i];
      const reason = isMultiProductTitle(plan.title)
        ? "mix → round thousand"
        : "single → round thousand";
      plan.setPrice(round, reason);
    }
  }

  const at800 = plans.filter((plan) => plan.newBase === 800);
  const to1000 = Math.min(4, Math.ceil(at800.length * 0.15));
  if (to1000 > 0) {
    const sorted800 = [...at800].sort(
      (a, b) => (b.title?.length || 0) - (a.title?.length || 0),
    );
    for (let i = 0; i < to1000; i++) {
      sorted800[i].setPrice(1000, "premium → ₹1000");
    }
  }

  const at5500 = plans.filter((plan) => plan.newBase === 5500);
  if (at5500.length >= 2) {
    const sorted5500 = [...at5500].sort(
      (a, b) => (a.title?.length || 0) - (b.title?.length || 0),
    );
    sorted5500[0].setPrice(5000, "mix → round thousand");
  }
}

async function fetchProducts(url, key) {
  const params = new URLSearchParams({
    select: "id,title,base_price",
    store_id: `eq.${STORE_ID}`,
    order: "base_price.asc",
  });

  const response = await fetch(`${url}/rest/v1/products?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}): ${body}`);
  }

  return JSON.parse(body);
}

async function patchProduct(url, key, id, patch) {
  const response = await fetch(`${url}/rest/v1/products?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Update ${id} failed (${response.status}): ${body}`);
  }
}

function printPreview(rows) {
  const changed = rows.filter((row) => row.changed);
  const unchanged = rows.filter((row) => !row.changed);

  console.log(`\nStore: ${STORE_ID}`);
  console.log(`Products loaded: ${rows.length}`);
  console.log(`Will update: ${changed.length}`);
  console.log(`Already on target price: ${unchanged.length}`);

  printPriceDistribution(
    "Current price points (in database)",
    countByPrice(rows, (row) => row.oldBase),
  );

  printPriceDistribution(
    "Target price points (after snap)",
    countByPrice(rows, (row) => row.newBase),
  );

  printKindSummary(rows, (row) => row.newBase);
  printAllowedTierSummary(rows, (row) => row.newBase);

  if (!changed.length) {
    console.log("\nNo changes needed — all prices already match the rules.");
    return;
  }

  console.log("\nProducts to update");
  console.log("-".repeat(96));
  console.log(["Title".padEnd(40), "Current → Target", "Why"].join("  "));
  console.log("-".repeat(96));

  for (const row of changed) {
    const title =
      row.title.length > 38 ? `${row.title.slice(0, 35)}…` : row.title;
    const baseText = `${formatRupee(row.oldBase)} → ${formatRupee(row.newBase)}`;
    console.log(
      [title.padEnd(40), baseText.padEnd(18), row.reason || ""].join("  "),
    );
  }

  const targetSummary = countByPrice(changed, (row) => row.newBase);
  console.log("\nUpdates by target price:");
  for (const [price, count] of [...targetSummary.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    console.log(`  ${formatRupee(price)}: ${count} product(s)`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const env = readEnv();

  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env",
    );
  }

  const products = await fetchProducts(url, key);
  const plans = products.map(planUpdate);
  applyCatalogMix(plans);

  printPreview(plans);

  if (!apply) {
    console.log(
      "\nDry run only. Re-run with --apply to save prices to Supabase.",
    );
    return;
  }

  const toUpdate = plans.filter((row) => row.changed);
  if (!toUpdate.length) return;

  console.log(`\nApplying ${toUpdate.length} update(s)…`);

  let ok = 0;
  for (const row of toUpdate) {
    await patchProduct(url, key, row.id, row.patch);
    ok += 1;
  }

  console.log(`Done. Updated ${ok} product(s).`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
