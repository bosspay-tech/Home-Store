import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  ArrowRight,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

import { supabase } from "../lib/supabase";
import { STORE_ID } from "../config/store";
import ProductCard from "../components/ProductCard";

const HERO_SLIDES = [
  {
    image:
      "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-17-a_f1d4f872-0e83-43f1-81be-15f7443945a8.jpg?v=1657613859",
    eyebrow: "Home-care essentials",
    title: "A cleaner home starts here",
    subtitle:
      "Disinfectants, floor cleaners, and everyday supplies — packed carefully and delivered fast.",
    cta: "Shop all products",
    to: "/products",
  },
  {
    image:
      "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-14_edbd1662-4475-4a1b-9a2f-a1122b4bb83d.jpg?v=1657613918",
    eyebrow: "Value deals",
    title: "Quality products at practical prices",
    subtitle:
      "Browse bundles and value picks without compromising on everyday performance.",
    cta: "View value deals",
    to: "/products?category=value-deal",
  },
  {
    image:
      "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-3a_75fdcb2d-930b-4fe3-8be0-ca6db0e8e80f.jpg?v=1657613967",
    eyebrow: "New arrivals",
    title: "Fresh drops for your daily routine",
    subtitle:
      "Discover the latest home-care additions, ready to ship from our warehouse.",
    cta: "See new arrivals",
    to: "/products?category=new-arrival",
  },
  {
    image:
      "https://healthyhome.co.in/cdn/shop/files/Desktop-1920x784-9_748949ca-90f7-49dd-a156-6d65b4a89d72.jpg?v=1657613895",
    eyebrow: "Best sellers",
    title: "Trusted picks customers reorder",
    subtitle:
      "Top-rated cleaners and household staples chosen again and again.",
    cta: "Shop best sellers",
    to: "/products?category=bestseller",
  },
];

const COLLECTIONS = [
  {
    title: "Best Sellers",
    desc: "Most loved by customers",
    tag: "bestseller",
    badge: "Popular",
    icon: Star,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    title: "New Arrivals",
    desc: "Fresh picks just dropped",
    tag: "new-arrival",
    badge: "New",
    icon: Sparkles,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
  },
  {
    title: "Value Deals",
    desc: "Great products, better prices",
    tag: "value-deal",
    badge: "Save",
    icon: Tag,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
  },
];

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Fast delivery",
    desc: "Dispatched within 24–48 hours",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    desc: "UPI, cards & encrypted payments",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    desc: "Hassle-free return policy",
  },
  {
    icon: Package,
    title: "Careful packing",
    desc: "Leak-aware parcel handling",
  },
];

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="h-56 bg-slate-100" />
      <div className="p-5">
        <div className="h-4 w-2/3 rounded bg-slate-100" />
        <div className="mt-3 h-3 w-full rounded bg-slate-100" />
        <div className="mt-4 h-9 w-full rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadFeatured() {
      if (!supabase) {
        if (alive) {
          setFeatured([]);
          setLoadingProducts(false);
        }
        return;
      }

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", STORE_ID)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (alive) {
        setFeatured(data ?? []);
        setLoadingProducts(false);
      }
    }

    loadFeatured();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="bg-white">
      <div className="border-b border-emerald-100 bg-emerald-50/80">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-xs font-medium text-emerald-900 sm:text-sm">
          <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Free shipping on orders above ₹499 · Secure UPI & card checkout</span>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination]}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="landing-swiper h-[min(68vh,720px)] min-h-[420px] w-full"
        >
          {HERO_SLIDES.map((slide) => (
            <SwiperSlide key={slide.title}>
              <div className="relative h-full w-full">
                <img
                  src={slide.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/45 to-slate-950/10" />

                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <div className="max-w-xl">
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/95 uppercase backdrop-blur-sm">
                        {slide.eyebrow}
                      </span>
                      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                        {slide.title}
                      </h1>
                      <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                        {slide.subtitle}
                      </p>
                      <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                          to={slide.to}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-white/30"
                        >
                          {slide.cta}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                          to="/cart"
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
                        >
                          View cart
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 bg-white px-5 py-6 sm:px-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-linear-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
                Collections
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Shop by category
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-600">
                Curated home-care essentials — from everyday cleaners to value
                bundles.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {COLLECTIONS.map(
              ({ title, desc, tag, badge, icon: Icon, gradient }) => (
                <Link
                  key={tag}
                  to={`/products?category=${tag}`}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${gradient} opacity-20 blur-2xl transition group-hover:opacity-30`}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${gradient} text-white shadow-lg`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {badge}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      Browse collection
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
                Featured
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Popular right now
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Hand-picked essentials from our latest catalogue.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-emerald-700"
            >
              See all products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingProducts
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              : featured.length > 0
                ? featured.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    >
                      <ProductCard product={product} />
                    </Link>
                  ))
                : (
                    <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                      <p className="text-sm font-semibold text-slate-900">
                        Products coming soon
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Check back shortly for our full home-care range.
                      </p>
                      <Link
                        to="/products"
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Browse catalogue
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
              New drops weekly · Fast checkout
            </span>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Discover products you will actually use.
            </h2>

            <p className="mt-4 max-w-xl text-base text-white/75">
              Curated home-care essentials, practical prices, and a smooth
              shopping experience from browse to delivery.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                Shop now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/75">
              <span className="rounded-full bg-white/10 px-3 py-1">
                Secure payments
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Fast shipping
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Easy returns
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewCard
              title="Best Sellers"
              subtitle="Top-rated home-care picks"
              imageUrl={HERO_SLIDES[3].image}
              to="/products?category=bestseller"
            />
            <PreviewCard
              title="New Arrivals"
              subtitle="Fresh cleaning essentials"
              imageUrl={HERO_SLIDES[2].image}
              to="/products?category=new-arrival"
            />
            <PreviewCard
              title="Value Deals"
              subtitle="Useful products at better prices"
              imageUrl={HERO_SLIDES[1].image}
              to="/products?category=value-deal"
            />
            <PreviewCard
              title="All Products"
              subtitle="Browse the full catalogue"
              imageUrl={HERO_SLIDES[0].image}
              to="/products"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                Why Vyapar Vault
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Home-care shopping, simplified.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                We focus on practical everyday products — reliable quality,
                transparent pricing, and checkout that takes minutes, not
                hassle.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Genuine home-care brands at competitive prices",
                  "Orders packed with leak-aware handling",
                  "Dedicated support for shipping & returns",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { stat: "24–48h", label: "Typical dispatch time" },
                { stat: "100%", label: "Secure payment options" },
                { stat: "Easy", label: "Returns & refunds" },
                { stat: "PAN India", label: "Delivery coverage" },
              ].map(({ stat, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <p className="text-2xl font-extrabold text-white">{stat}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-12 text-white shadow-xl sm:px-10 sm:py-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold sm:text-3xl">
                  Ready to stock up?
                </h3>
                <p className="mt-2 text-sm leading-6 text-emerald-50/90 sm:text-base">
                  Browse the full catalogue, add to cart, and checkout in
                  minutes with UPI or card.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/30"
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewCard({ title, subtitle, imageUrl, to }) {
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/15"
    >
      <div className="relative h-32 overflow-hidden bg-white/10">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = HERO_SLIDES[0].image;
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-white/70">{subtitle}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-white/70">Explore range</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
