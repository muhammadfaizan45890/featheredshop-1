import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiArrowLeft,
  FiBookOpen,
  FiSearch,
  FiShoppingBag,
  FiMail,
  FiCompass,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
 * FeatheredShop 404 — Advanced / Responsive
 * ───────────────────────────────────────────────────────────── */

const QUICK_LINKS = [
  { to: "/", label: "Home", icon: FiHome },
  { to: "/shop", label: "Shop", icon: FiShoppingBag },
  { to: "/news", label: "Articles", icon: FiBookOpen },
  { to: "/contact", label: "Contact", icon: FiMail },
];

const SUGGESTED_SEARCHES = [
  "New arrivals",
  "Best sellers",
  "Sale",
  "Featured",
];

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [glitchIndex, setGlitchIndex] = useState(0);

  const glitchFrames = ["404", "4Ø4", "4◯4", "404"];

  /* Mount flag for entrance animations */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Subtle glitch loop on the big 404 (disabled if reduced motion) */
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setGlitchIndex((i) => (i + 1) % glitchFrames.length);
    }, 2200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  /* SEO: title */
  useEffect(() => {
    const prev = document.title;
    document.title = "404 — Page Not Found | FeatheredShop";
    return () => {
      document.title = prev;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSuggested = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  /* Motion helpers */
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: mounted ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <main
      role="main"
      aria-labelledby="notfound-title"
      className="
        relative min-h-[100svh] w-full overflow-hidden
        bg-gradient-to-b from-white via-zinc-50 to-white
        dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950
        flex items-center justify-center
        px-4 sm:px-6 lg:px-8
        py-12 sm:py-16
      "
    >
      {/* ─── Ambient background ─────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* soft radial glow */}
        <div
          className="
            absolute -top-32 left-1/2 -translate-x-1/2
            h-[420px] w-[420px] sm:h-[560px] sm:w-[560px]
            rounded-full blur-3xl opacity-60
            bg-gradient-to-tr from-amber-200/40 via-rose-200/30 to-transparent
            dark:from-amber-500/10 dark:via-rose-500/10 dark:to-transparent
          "
        />
        {/* grid pattern */}
        <div
          className="
            absolute inset-0 opacity-[0.035] dark:opacity-[0.06]
            [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
            dark:[background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:32px_32px]
            [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]
          "
        />
        {/* floating dots */}
        <motion.div
          aria-hidden="true"
          className="absolute top-24 left-[12%] h-2 w-2 rounded-full bg-amber-400/70 dark:bg-amber-300/50"
          animate={prefersReducedMotion ? {} : { y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-32 right-[14%] h-3 w-3 rounded-full bg-rose-400/60 dark:bg-rose-300/40"
          animate={prefersReducedMotion ? {} : { y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute top-1/2 right-[8%] h-1.5 w-1.5 rounded-full bg-zinc-400/60 dark:bg-zinc-500/60"
          animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ─── Main card ──────────────────────────────────── */}
      <motion.div
        {...fadeUp(0)}
        className="
          relative z-10 w-full max-w-3xl
          rounded-3xl
          border border-zinc-200/70 dark:border-zinc-800/70
          bg-white/70 dark:bg-zinc-900/60
          backdrop-blur-xl
          shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]
          dark:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.7)]
          px-6 sm:px-10 lg:px-14
          py-10 sm:py-14
          text-center
        "
      >
        {/* Brand eyebrow */}
        <motion.div {...fadeUp(0.05)} className="mb-4 sm:mb-6">
          <Link
            to="/"
            className="
              inline-flex items-center gap-2
              text-[11px] sm:text-xs font-semibold
              uppercase tracking-[0.22em]
              text-zinc-500 dark:text-zinc-400
              hover:text-zinc-900 dark:hover:text-white
              transition-colors
            "
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            FeatheredShop
          </Link>
        </motion.div>

        {/* ─── 404 headline ─────────────────────────── */}
        <motion.div {...fadeUp(0.1)} className="relative select-none">
          {/* ghost layer */}
          <h1
            aria-hidden="true"
            className="
              text-[7rem] sm:text-[10rem] md:text-[12rem]
              font-black leading-none tracking-tighter
              bg-gradient-to-b from-zinc-200 to-zinc-100
              dark:from-zinc-800 dark:to-zinc-900
              bg-clip-text text-transparent
            "
          >
            404
          </h1>

          {/* foreground layer (glitching) */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              flex items-center justify-center
              text-[6rem] sm:text-[9rem] md:text-[11rem]
              font-black leading-none tracking-tighter
              bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900
              dark:from-white dark:via-zinc-300 dark:to-white
              bg-clip-text text-transparent
              drop-shadow-[0_2px_10px_rgba(0,0,0,0.08)]
            "
          >
            {prefersReducedMotion ? "404" : glitchFrames[glitchIndex]}
          </span>

          {/* tiny icon badge */}
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={mounted ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="
              absolute -bottom-2 right-1/2 translate-x-1/2
              sm:right-8 sm:translate-x-0 sm:-bottom-2
              inline-flex items-center justify-center
              h-12 w-12 sm:h-14 sm:w-14
              rounded-2xl
              bg-zinc-900 dark:bg-white
              text-white dark:text-zinc-900
              shadow-lg shadow-zinc-900/20 dark:shadow-white/10
            "
          >
            <FiSearch className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.div>
        </motion.div>

        {/* ─── Copy ─────────────────────────────────── */}
        <motion.h2
          {...fadeUp(0.2)}
          id="notfound-title"
          className="
            mt-8 sm:mt-10
            text-2xl sm:text-3xl md:text-4xl
            font-black tracking-tight
            text-zinc-900 dark:text-white
          "
        >
          We couldn't find that page
        </motion.h2>

        <motion.p
          {...fadeUp(0.25)}
          className="
            mt-3 sm:mt-4
            text-sm sm:text-base
            text-zinc-600 dark:text-zinc-400
            max-w-xl mx-auto leading-relaxed
          "
        >
          The link may be broken, or the page may have been moved or removed.
          Try a search, or head back to a safe place.
          {location?.pathname && location.pathname !== "/404" && (
            <>
              {" "}
              <span className="block mt-2 text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-mono break-all">
                Requested: {location.pathname}
              </span>
            </>
          )}
        </motion.p>

        {/* ─── Search ───────────────────────────────── */}
        <motion.form
          {...fadeUp(0.3)}
          onSubmit={handleSearch}
          role="search"
          className="mt-7 sm:mt-9 max-w-xl mx-auto"
        >
          <div
            className="
              group relative flex items-center gap-2
              rounded-2xl
              border border-zinc-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900
              focus-within:border-zinc-900 dark:focus-within:border-white
              focus-within:ring-4 focus-within:ring-zinc-900/5 dark:focus-within:ring-white/10
              transition-all
              pl-4 pr-1.5 py-1.5
              shadow-sm
            "
          >
            <FiSearch className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, articles..."
              aria-label="Search FeatheredShop"
              className="
                flex-1 min-w-0 bg-transparent
                py-2.5 text-sm sm:text-[15px]
                text-zinc-900 dark:text-white
                placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                outline-none
              "
            />
            <button
              type="submit"
              className="
                shrink-0
                inline-flex items-center gap-1.5
                h-10 px-4
                rounded-xl
                bg-zinc-900 dark:bg-white
                text-white dark:text-zinc-900
                text-[13px] font-semibold
                hover:bg-zinc-800 dark:hover:bg-zinc-200
                active:scale-[0.98]
                transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                focus-visible:ring-zinc-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900
              "
            >
              <FiCompass className="h-3.5 w-3.5" />
              <span className="hidden xs:inline sm:inline">Search</span>
            </button>
          </div>

          {/* Suggested terms */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Try:
            </span>
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSuggested(term)}
                className="
                  text-[12px] font-medium
                  px-2.5 py-1
                  rounded-full
                  border border-zinc-200 dark:border-zinc-800
                  text-zinc-600 dark:text-zinc-400
                  hover:border-zinc-900 dark:hover:border-white
                  hover:text-zinc-900 dark:hover:text-white
                  transition-colors
                "
              >
                {term}
              </button>
            ))}
          </div>
        </motion.form>

        {/* ─── Primary actions ──────────────────────── */}
        <motion.div
          {...fadeUp(0.4)}
          className="
            mt-8 sm:mt-10
            flex flex-col sm:flex-row
            gap-3 sm:gap-4
            justify-center items-stretch sm:items-center
          "
        >
          <Link
            to="/"
            className="
              group inline-flex items-center justify-center gap-2
              h-12 px-6
              rounded-xl
              bg-zinc-900 dark:bg-white
              text-white dark:text-zinc-900
              font-semibold text-sm
              hover:bg-zinc-800 dark:hover:bg-zinc-200
              active:scale-[0.98]
              shadow-sm hover:shadow-md
              transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              focus-visible:ring-zinc-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900
            "
          >
            <FiHome className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Back to Home
          </Link>

          <Link
            to="/shop"
            className="
              group inline-flex items-center justify-center gap-2
              h-12 px-6
              rounded-xl
              border border-zinc-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900
              text-zinc-800 dark:text-zinc-200
              font-semibold text-sm
              hover:bg-zinc-50 dark:hover:bg-zinc-800
              hover:border-zinc-300 dark:hover:border-zinc-700
              active:scale-[0.98]
              transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              focus-visible:ring-zinc-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900
            "
          >
            <FiShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
            Continue Shopping
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              group inline-flex items-center justify-center gap-2
              h-12 px-6
              rounded-xl
              text-zinc-600 dark:text-zinc-400
              font-semibold text-sm
              hover:text-zinc-900 dark:hover:text-white
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              active:scale-[0.98]
              transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              focus-visible:ring-zinc-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900
            "
          >
            <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Go Back
          </button>
        </motion.div>

        {/* ─── Quick links grid ─────────────────────── */}
        <motion.div {...fadeUp(0.5)} className="mt-10 sm:mt-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[10.5px] uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500 font-semibold">
              Quick Links
            </span>
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="
                  group flex flex-col items-center justify-center gap-2
                  px-3 py-4
                  rounded-2xl
                  border border-zinc-200/80 dark:border-zinc-800/80
                  bg-white/60 dark:bg-zinc-900/40
                  text-zinc-700 dark:text-zinc-300
                  hover:bg-white dark:hover:bg-zinc-900
                  hover:border-zinc-300 dark:hover:border-zinc-700
                  hover:text-zinc-900 dark:hover:text-white
                  hover:-translate-y-0.5
                  shadow-sm hover:shadow-md
                  transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  focus-visible:ring-zinc-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900
                "
              >
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[12.5px] font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ─── Helper footer ────────────────────────── */}
        <motion.div
          {...fadeUp(0.6)}
          className="
            mt-8 sm:mt-10 pt-6
            border-t border-zinc-200/70 dark:border-zinc-800/70
            flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5
            text-[12.5px] text-zinc-500 dark:text-zinc-400
          "
        >
          <span className="inline-flex items-center gap-1.5">
            <FiRefreshCw className="h-3.5 w-3.5" />
            Still stuck?
          </span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
          <Link
            to="/contact"
            className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline-offset-4 hover:underline transition"
          >
            Contact support
          </Link>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
          <Link
            to="/about"
            className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline-offset-4 hover:underline transition"
          >
            About FeatheredShop
          </Link>
        </motion.div>
      </motion.div>

      {/* ─── Bottom tagline ─────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="
          pointer-events-none absolute bottom-4 sm:bottom-6 left-0 right-0
          text-center text-[11px] sm:text-xs
          text-zinc-400 dark:text-zinc-600
        "
      >
        Lost? We've got your back.
      </motion.p>
    </main>
  );
};

export default NotFound;