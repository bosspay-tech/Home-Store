import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const HERO_BANNERS = [
  "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-17-a_f1d4f872-0e83-43f1-81be-15f7443945a8.jpg?v=1657613859",
  "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-14_edbd1662-4475-4a1b-9a2f-a1122b4bb83d.jpg?v=1657613918",
  "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-3a_75fdcb2d-930b-4fe3-8be0-ca6db0e8e80f.jpg?v=1657613967",
  "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-9_748949ca-90f7-49dd-a156-6d65b4a89d72.jpg?v=1657613895",
];

const COLLECTION_IMAGES = {
  bestseller:
    "https://t4.ftcdn.net/jpg/15/77/98/65/360_F_1577986576_30ZvE8e9cQINoaK3H2NFhctCxwWGJXiV.jpg",
  "new-arrival":
    "https://media.istockphoto.com/id/1366258243/vector/vector-illustration-new-arrival-label-modern-web-banner-on-yellow-background.jpg?s=612x612&w=0&k=20&c=ddLMrtth5QRoW-jJe8_ozTWmvRejIFlq3cv4BAIq_HQ=",
  "value-deal":
    "https://img.freepik.com/free-vector/modern-amazing-deals-discount-offer-background-design_1017-61362.jpg?semt=ais_hybrid&w=740&q=80",
};

export default function Landing() {
  return (
    <div className="bg-white">
      {/* NEW HERO: Standalone Banner Images (Swiper) */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          loop
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="h-65 w-full sm:h-90 md:h-130"
        >
          {HERO_BANNERS.map((src, idx) => (
            <SwiperSlide key={src}>
              <img
                src={src}
                alt={`Hero banner ${idx + 1}`}
                className="h-full w-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* subtle bottom fade so pagination stays visible */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/25 to-transparent" />
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
          <TrustItem
            title="Fast delivery"
            desc="Quick and reliable shipping with updates."
            icon="🚚"
          />
          <TrustItem
            title="Secure payments"
            desc="Encrypted checkout for safe transactions."
            icon="🔒"
          />
          <TrustItem
            title="Easy returns"
            desc="Simple return policy for peace of mind."
            icon="↩️"
          />
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="bg-linear-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Featured collections
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Pick a vibe. We’ll handle the rest.
              </p>
            </div>

            <Link
              to="/products"
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              View all products →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <CollectionCard
              title="Best Sellers"
              desc="Most loved by customers"
              tag="bestseller"
              badge="Popular"
              imageUrl={COLLECTION_IMAGES.bestseller}
            />
            <CollectionCard
              title="New Arrivals"
              desc="Fresh picks just dropped"
              tag="new-arrival"
              badge="New"
              imageUrl={COLLECTION_IMAGES["new-arrival"]}
            />
            <CollectionCard
              title="Value Deals"
              desc="Great products, great prices"
              tag="value-deal"
              badge="Save"
              imageUrl={COLLECTION_IMAGES["value-deal"]}
            />
          </div>
        </div>
      </section>

      {/* MOVED: Previous Blue Hero Banner (kept as-is) */}
      <section className="relative overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* soft blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
              🔥 New drops weekly • Fast checkout
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Discover products you’ll actually love.
            </h1>

            <p className="mt-4 max-w-xl text-base text-white/75">
              Curated essentials, premium quality, and a smooth shopping
              experience — from browse to delivery.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                Shop now
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/75">
              <span className="rounded-full bg-white/10 px-3 py-1">
                🔒 Secure payments
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                🚚 Fast shipping
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                ↩️ Easy returns
              </span>
            </div>
          </div>

          {/* Right: product preview collage */}
          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2">
              <PreviewCard title="Best Sellers" subtitle="Top-rated picks" />
              <PreviewCard title="New Arrivals" subtitle="Fresh drops" />
              <PreviewCard
                title="Premium Quality"
                subtitle="Curated essentials"
              />
              <PreviewCard title="Fast Delivery" subtitle="Quick dispatch" />
            </div>

            <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-2xl bg-white/10 blur-xl" />
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-2xl bg-white/10 blur-xl" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 px-6 py-10 text-white sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold">Ready to shop?</h3>
                <p className="mt-1 text-sm text-white/75">
                  Browse all products and checkout in minutes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="rounded-xl bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  Shop now
                </Link>
                <Link
                  to="/cart"
                  className="rounded-xl border border-white/20 bg-transparent px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/10"
                >
                  View cart
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/75">
              <span className="rounded-full bg-white/10 px-3 py-1">
                ✅ Trusted
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                💳 UPI / Cards
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                📦 Packed fast
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewCard({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-white/70">{subtitle}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white/10" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-white/70">From ₹299</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
          View
        </span>
      </div>
    </div>
  );
}

function TrustItem({ title, desc, icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function CollectionCard({ title, desc, tag, badge, imageUrl }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-44 bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/5 to-black/30" />

        <span className="absolute left-4 top-4 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      </div>

      <div className="p-5">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>

        <Link
          to={`/products/?category=${tag}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
        >
          Shop collection <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
