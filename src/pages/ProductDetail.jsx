/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Check,
  ChevronRight,
  Package,
  AlertCircle,
  CheckCircle2,
  Share2,
  Sparkles,
  Info,
  Ruler,
  X,
  Loader2,
  ZoomIn,
  RefreshCw,
  Copy,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Award,
  Percent,
  Bell,
  Flag,
  Tag,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../utils/api";

/* ════════════════════════════════════════════════════════════
   HD FONT CSS
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  .pd-hd-root {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1, "tnum" 1;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    font-optical-sizing: auto;
  }
  .pd-hd-root * { -webkit-tap-highlight-color: transparent; }
  .pd-hd-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0, "opsz" 48;
    font-feature-settings: "kern" 1, "liga" 1, "ss01" 1;
    letter-spacing: -0.02em;
  }
  .pd-hd-sans {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1;
  }
  .pd-hd-num {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "kern" 1;
  }
  .pd-hd-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
  .pd-hd-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .pd-hd-scroll::-webkit-scrollbar-track { background: transparent; }
  .pd-hd-scroll::-webkit-scrollbar-thumb {
    background: rgba(115, 115, 115, 0.35);
    border-radius: 999px;
  }
  .pd-hd-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(115, 115, 115, 0.55);
  }
  .pd-hd-root :focus-visible {
    outline: 2px solid #171717;
    outline-offset: 2px;
    border-radius: 6px;
  }
  @media (prefers-color-scheme: dark) {
    .pd-hd-root :focus-visible { outline-color: #fafafa; }
  }
  .post-content, .post-content * { white-space: pre-wrap !important; }
  .post-content p { margin-bottom: 1.25em; }
  .post-content img { max-width: 100%; height: auto; border-radius: 8px; }

  @keyframes pd-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .pd-skeleton {
    background: linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 100%);
    background-size: 200% 100%;
    animation: pd-shimmer 1.4s ease-in-out infinite;
  }
  @media (prefers-color-scheme: dark) {
    .pd-skeleton {
      background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 100%);
      background-size: 200% 100%;
    }
  }

  .pd-thumb-rail::-webkit-scrollbar { display: none; }
  .pd-thumb-rail { scrollbar-width: none; }
`;

/* ════════════════════════════════════════════════════════════
   LocalStorage keys
   ════════════════════════════════════════════════════════════ */
const LS_CART = "feathered:cart";
const LS_WISHLIST = "feathered:wishlist";
const LS_RECENT = "feathered:recentlyViewed";

/* ════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════ */
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (/^https?:\/\//.test(avatarPath)) return avatarPath;
  const base =
    (typeof API === "string" && API) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    "";
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`;
};

const getApiInstance = () => {
  let instance;
  if (API && typeof API.get === "function") {
    instance = API;
  } else {
    instance = axios.create({
      baseURL:
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
        "http://localhost:8000",
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!instance.__productDetailAttached) {
    instance.interceptors.request.use(
      (config) => {
        try {
          const token = localStorage.getItem("accessToken");
          if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch {}
        return config;
      },
      (error) => Promise.reject(error)
    );
    instance.__productDetailAttached = true;
  }
  return instance;
};

const api = getApiInstance();

const formatPKR = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "Rs 0";
  return `Rs ${num.toLocaleString("en-PK")}`;
};

const getReadingStats = (text) => {
  if (!text) return { minutes: 1, words: 0 };
  const words = text
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return { minutes: Math.max(1, Math.ceil(words / 200)), words };
};

const injectHeadingIds = (html) => {
  if (!html) return { html: "", toc: [] };
  const toc = [];
  let counter = 0;
  const withIds = html.replace(
    /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      counter += 1;
      const text = inner.replace(/<[^>]*>/g, "").trim();
      const slug =
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "section";
      const id = `${slug}-${counter}`;
      toc.push({ id, text, level: tag });
      const hasId = /id\s*=/.test(attrs);
      const newAttrs = hasId ? attrs : `${attrs} id="${id}"`;
      return `<${tag}${newAttrs}>${inner}</${tag}>`;
    }
  );
  return { html: withIds, toc };
};

const updateCommentRecursively = (comments, id, updater) =>
  comments.map((c) => {
    if (c._id === id) return updater(c);
    if (c.replies?.length)
      return { ...c, replies: updateCommentRecursively(c.replies, id, updater) };
    return c;
  });

const addReplyRecursively = (comments, parentId, reply) =>
  comments.map((c) => {
    if (c._id === parentId) return { ...c, replies: [...(c.replies || []), reply] };
    if (c.replies?.length)
      return { ...c, replies: addReplyRecursively(c.replies, parentId, reply) };
    return c;
  });

const deleteCommentRecursively = (comments, id) =>
  comments
    .filter((c) => c._id !== id)
    .map((c) => ({
      ...c,
      replies: c.replies ? deleteCommentRecursively(c.replies, id) : [],
    }));

const normalizeLikes = (comment) => ({
  ...comment,
  likes: Array.isArray(comment.likes) ? comment.likes.length : comment.likes || 0,
  replies: comment.replies ? comment.replies.map(normalizeLikes) : [],
});

const FALLBACK_IMG =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20fill%3D%22%23999%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

const resolveImg = (img) =>
  typeof img === "string" && img.trim().length > 0 ? img : FALLBACK_IMG;

const conditionStyles = {
  Good: { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-400" },
  "Very Good": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
  Excellent: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  Premium: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400" },
  "Premium Plus": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400" },
  "Premium+": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400" },
};

/* ✅ Safe localStorage */
const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

/* ✅ Estimated delivery (skips weekends) */
const getEstimatedDelivery = (daysFromNow = 5) => {
  const date = new Date();
  let added = 0;
  while (added < daysFromNow) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/* ✅ Analytics (GA/GTM compatible) */
const trackEvent = (name, params = {}) => {
  try {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name, ...params });
    }
  } catch {}
};

/* ✅ Haptic feedback (mobile) */
const haptic = (ms = 10) => {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms);
  } catch {}
};

/* ✅ Focus trap */
const useFocusTrap = (active, containerRef) => {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const previousActive = document.activeElement;
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first) first.focus();

    const onKey = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previousActive?.focus?.();
    };
  }, [active, containerRef]);
};

/* ════════════════════════════════════════════════════════════
   Breadcrumbs
   ════════════════════════════════════════════════════════════ */
const Breadcrumbs = memo(function Breadcrumbs({ items = [] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[11px] sm:text-[12px] md:text-[13px] pd-hd-sans text-neutral-500 dark:text-neutral-400 overflow-x-auto pd-hd-scroll whitespace-nowrap"
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <ChevronRight
              className="h-3 w-3 shrink-0 text-neutral-300 dark:text-neutral-600"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          )}
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 dark:text-neutral-100 font-medium truncate max-w-[200px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
});

/* ════════════════════════════════════════════════════════════
   Skeleton — responsive
   ════════════════════════════════════════════════════════════ */
const ProductSkeleton = memo(function ProductSkeleton() {
  return (
    <div className="pd-hd-root min-h-screen bg-white dark:bg-neutral-950">
      <style>{HD_CSS}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl pd-skeleton" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-16 h-16 rounded-xl pd-skeleton" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 pd-skeleton rounded" />
            <div className="h-8 w-3/4 pd-skeleton rounded" />
            <div className="h-6 w-1/3 pd-skeleton rounded" />
            <div className="h-10 w-1/2 pd-skeleton rounded" />
            <div className="h-20 w-full pd-skeleton rounded" />
            <div className="h-12 w-full pd-skeleton rounded" />
            <div className="h-12 w-full pd-skeleton rounded" />
          </div>
        </div>
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   ImageGallery — advanced with pan-zoom lightbox + preload
   ════════════════════════════════════════════════════════════ */
const ImageGallery = memo(function ImageGallery({
  images = [],
  name = "",
  currentIndex = 0,
  onIndexChange,
  autoPlay = true,
  progress = 0,
  onToggleAutoPlay,
}) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const lightboxRef = useRef(null);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const hasImages = safeImages.length > 0;
  const hasMultiple = safeImages.length > 1;
  const activeImage = hasImages ? safeImages[currentIndex] : null;

  useFocusTrap(zoomOpen, lightboxRef);

  /* ✅ Preload adjacent images */
  useEffect(() => {
    if (!hasMultiple) return;
    const nextIdx = (currentIndex + 1) % safeImages.length;
    const prevIdx = (currentIndex - 1 + safeImages.length) % safeImages.length;
    [nextIdx, prevIdx].forEach((i) => {
      const img = new Image();
      img.src = safeImages[i];
    });
  }, [currentIndex, safeImages, hasMultiple]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setZoomOpen(false);
      else if (e.key === "ArrowLeft" && hasMultiple)
        onIndexChange((currentIndex - 1 + safeImages.length) % safeImages.length);
      else if (e.key === "ArrowRight" && hasMultiple)
        onIndexChange((currentIndex + 1) % safeImages.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomOpen, hasMultiple, currentIndex, safeImages.length, onIndexChange]);

  const go = useCallback(
    (i) => {
      if (!onIndexChange) return;
      onIndexChange(i);
    },
    [onIndexChange]
  );

  /* Lightbox pan + zoom */
  const onWheel = (e) => {
    e.preventDefault();
    setZoomScale((s) => Math.min(4, Math.max(1, s - e.deltaY * 0.001)));
  };
  const onMouseDown = (e) => {
    dragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      px: zoomPos.x,
      py: zoomPos.y,
    };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setZoomPos({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = () => {
    dragging.current = false;
  };
  const resetZoom = () => {
    setZoomScale(1);
    setZoomPos({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:gap-5">
        {hasMultiple && (
          <div
            className="pd-thumb-rail flex sm:flex-col gap-2 sm:gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] md:max-h-[560px] lg:max-h-[680px] shrink-0 pb-1 sm:pb-0 pd-hd-scroll"
            role="tablist"
            aria-label="Product images"
          >
            {safeImages.map((img, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={currentIndex === i}
                aria-label={`View image ${i + 1} of ${safeImages.length}`}
                onClick={() => go(i)}
                className={`relative shrink-0 w-14 h-14 sm:w-[68px] sm:h-[68px] lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                  currentIndex === i
                    ? "border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900/10 dark:ring-neutral-100/10 scale-[1.02]"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:scale-[1.02]"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover pd-hd-image"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-1 aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 border border-neutral-200/80 dark:border-neutral-800 group">
          {hasImages ? (
            <>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={currentIndex}
                  src={activeImage}
                  alt={name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 w-full h-full object-cover pd-hd-image"
                  draggable={false}
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
              </AnimatePresence>

              {hasMultiple && (
                <>
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-black/60 text-white text-[11px] sm:text-[12px] pd-hd-num font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                    {currentIndex + 1} / {safeImages.length}
                  </div>

                  <button
                    type="button"
                    onClick={onToggleAutoPlay}
                    aria-label={autoPlay ? "Pause slideshow" : "Play slideshow"}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  >
                    {autoPlay ? (
                      <span className="flex items-center justify-center gap-[3px] h-4 w-4">
                        <span className="block w-[3px] h-full bg-current rounded-sm" />
                        <span className="block w-[3px] h-full bg-current rounded-sm" />
                      </span>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-10">
                    <div
                      className="h-full bg-white transition-[width] duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2.5 sm:p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 hover:scale-105 transition-all shadow-lg z-10"
                aria-label="Zoom image"
              >
                <ZoomIn className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package
                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-neutral-300 dark:text-neutral-600"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>
      </div>

      {/* Advanced lightbox */}
      <AnimatePresence>
        {zoomOpen && hasImages && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <button
              type="button"
              onClick={() => {
                setZoomOpen(false);
                resetZoom();
              }}
              className="absolute top-4 right-4 z-20 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close zoom"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(1, s - 0.5))}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="text-white/80 pd-hd-num text-[12px] font-semibold min-w-[40px] text-center">
                {zoomScale.toFixed(1)}×
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(4, s + 0.5))}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {hasMultiple && zoomScale === 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go((currentIndex - 1 + safeImages.length) % safeImages.length);
                    resetZoom();
                  }}
                  className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronRight className="h-5 w-5 rotate-180" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go((currentIndex + 1) % safeImages.length);
                    resetZoom();
                  }}
                  className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </>
            )}

            <div
              className="w-full h-full flex items-center justify-center p-4"
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{ cursor: zoomScale > 1 ? (dragging.current ? "grabbing" : "grab") : "default" }}
            >
              <motion.img
                key={currentIndex}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={activeImage}
                alt={name}
                draggable={false}
                className="max-w-full max-h-full rounded-lg shadow-2xl pd-hd-image select-none"
                style={{
                  transform: `scale(${zoomScale}) translate(${zoomPos.x / zoomScale}px, ${zoomPos.y / zoomScale}px)`,
                  transition: dragging.current ? "none" : "transform 0.15s ease-out",
                }}
              />
            </div>

            <p className="absolute bottom-4 sm:bottom-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 pd-hd-num text-[11px] sm:text-[12px] font-medium">
              {currentIndex + 1} / {safeImages.length} · Scroll to zoom · Drag to pan
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

/* ════════════════════════════════════════════════════════════
   StarRating
   ════════════════════════════════════════════════════════════ */
const StarRating = memo(function StarRating({
  rating = 0,
  count = 0,
  size = 16,
  showCount = true,
}) {
  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2">
      <div className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const partial = !filled && rating > star - 1;
          return (
            <Star
              key={star}
              style={{ width: size, height: size }}
              className={`${
                filled || partial
                  ? "fill-amber-400 text-amber-400"
                  : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
              } transition-colors`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {showCount && count > 0 && (
        <span className="text-[12px] sm:text-[13px] pd-hd-num text-neutral-500 dark:text-neutral-400 font-medium">
          {rating.toFixed(1)}
          <span className="mx-1">·</span>
          {count} {count === 1 ? "review" : "reviews"}
        </span>
      )}
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Star picker for review form
   ════════════════════════════════════════════════════════════ */
const StarPicker = memo(function StarPicker({ value = 5, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className="p-1 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none"
        >
          <Star
            size={20}
            className={
              star <= display
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
            }
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   SizeSelector — responsive grid
   ════════════════════════════════════════════════════════════ */
const SizeSelector = memo(function SizeSelector({
  sizes = [],
  selected,
  onSelect,
  onOpenSizeGuide,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-[11px] sm:text-[12px] uppercase tracking-wider font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100">
            Select Size
          </label>
          {selected && (
            <span className="text-[11px] sm:text-[12px] pd-hd-num text-neutral-400 font-medium">
              · {selected}
            </span>
          )}
        </div>
        {onOpenSizeGuide && (
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold pd-hd-sans text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors outline-none focus:outline-none focus-visible:outline-none"
          >
            <Ruler className="h-3.5 w-3.5" strokeWidth={2.5} />
            Size guide
          </button>
        )}
      </div>

      {/* Responsive grid: 4 cols mobile → 8 desktop */}
      <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {sizes.map((s) => {
          const isActive = selected === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                onSelect(s);
                haptic(8);
              }}
              className={`relative min-h-[44px] px-2 py-2 rounded-lg text-[11px] sm:text-[12px] font-bold pd-hd-num transition-all duration-150 border outline-none focus:outline-none focus-visible:outline-none ${
                isActive
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-md scale-[1.02]"
                  : "bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 hover:scale-[1.02]"
              }`}
              aria-pressed={isActive}
              aria-label={`Size ${s}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   QuantitySelector
   ════════════════════════════════════════════════════════════ */
const QuantitySelector = memo(function QuantitySelector({
  value,
  onChange,
  max = 10,
  disabled = false,
}) {
  const inc = () => {
    onChange(Math.min(max, value + 1));
    haptic(6);
  };
  const dec = () => {
    onChange(Math.max(1, value - 1));
    haptic(6);
  };
  return (
    <div
      className={`inline-flex items-center border border-neutral-200 dark:border-neutral-800 rounded-full overflow-hidden bg-white dark:bg-neutral-950 shrink-0 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= 1}
        className="p-3 sm:p-3.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none focus:outline-none focus-visible:outline-none"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      <span className="px-3 sm:px-4 pd-hd-num text-[13px] sm:text-[14px] font-bold tabular-nums min-w-[36px] sm:min-w-[44px] text-center text-neutral-900 dark:text-neutral-100 select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        className="p-3 sm:p-3.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors outline-none focus:outline-none focus-visible:outline-none"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Tabs
   ════════════════════════════════════════════════════════════ */
const Tabs = memo(function Tabs({ tabs, activeId, onChange }) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 relative">
      <div className="flex gap-0 overflow-x-auto pd-hd-scroll -mb-px">
        {tabs.map((tab) => {
          const active = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative px-3.5 sm:px-5 md:px-6 py-3 sm:py-4 text-[12px] sm:text-[13px] font-semibold pd-hd-sans whitespace-nowrap transition-colors shrink-0 outline-none focus:outline-none focus-visible:outline-none ${
                active
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
              aria-selected={active}
              role="tab"
            >
              {tab.label}
              {active && (
                <motion.div
                  layoutId="pd-active-tab"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-neutral-900 dark:bg-neutral-100 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   RatingSummary
   ════════════════════════════════════════════════════════════ */
const RatingSummary = memo(function RatingSummary({
  reviews = [],
  rating = 0,
  count = 0,
}) {
  const distribution = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));
    const total = reviews.length || 1;
    return dist.map((d) => ({ ...d, pct: Math.round((d.count / total) * 100) }));
  }, [reviews]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-6 md:pb-8 border-b border-neutral-100 dark:border-neutral-800">
      <div className="flex flex-col items-start">
        <p className="text-4xl sm:text-5xl font-bold pd-hd-serif text-neutral-900 dark:text-neutral-100 tracking-tight tabular-nums">
          {rating.toFixed(1)}
        </p>
        <div className="mt-2">
          <StarRating rating={rating} size={18} showCount={false} />
        </div>
        <p className="text-[12px] sm:text-[13px] pd-hd-sans text-neutral-500 dark:text-neutral-400 mt-2">
          Based on {count || reviews.length} {count === 1 ? "review" : "reviews"}
        </p>
      </div>

      <div className="md:col-span-2 space-y-2">
        {distribution.map((d) => (
          <div key={d.star} className="flex items-center gap-3">
            <span className="text-[11px] sm:text-[12px] font-semibold pd-hd-num text-neutral-600 dark:text-neutral-400 w-6 sm:w-8 shrink-0">
              {d.star}★
            </span>
            <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${d.pct}%` }}
              />
            </div>
            <span className="text-[11px] sm:text-[12px] pd-hd-num text-neutral-500 dark:text-neutral-400 w-10 text-right shrink-0">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   TrustBadges — with delivery date
   ════════════════════════════════════════════════════════════ */
const TrustBadges = memo(function TrustBadges({ deliveryDate }) {
  const badges = [
    { icon: Truck, label: "Free shipping", sub: "Over Rs 8,000" },
    { icon: RotateCcw, label: "30-day returns", sub: "No questions" },
    { icon: Shield, label: "Authenticity", sub: "Guaranteed" },
    { icon: Award, label: "Quality checked", sub: "Every item" },
  ];

  return (
    <div className="space-y-4 pt-5 sm:pt-6 border-t border-neutral-100 dark:border-neutral-800">
      {deliveryDate && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
          <p className="text-[12px] sm:text-[13px] pd-hd-sans text-emerald-700 dark:text-emerald-400">
            Order today, get it by{" "}
            <span className="font-bold">{deliveryDate}</span>
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-1.5 p-2.5 sm:p-3 rounded-xl"
            >
              <div className="p-2.5 sm:p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                <Icon className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold pd-hd-sans text-neutral-700 dark:text-neutral-300 leading-tight">
                {b.label}
              </span>
              <span className="text-[9px] sm:text-[10px] pd-hd-sans text-neutral-400 leading-tight">
                {b.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   CommentItem — enhanced
   ════════════════════════════════════════════════════════════ */
const CommentItem = ({
  comment,
  onReply,
  onLike,
  onDelete,
  onReport,
  currentUser,
  isRoot = false,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReplyClick = () => {
    if (!currentUser) {
      toast.error("Log in to reply to comments", {
        action: { label: "Log in", onClick: () => (window.location.href = "/login") },
        duration: 4000,
      });
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment._id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } catch {
      toast.error("Reply failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeClick = () => {
    if (!currentUser) {
      toast.error("Log in to like comments", {
        action: { label: "Log in", onClick: () => (window.location.href = "/login") },
        duration: 4000,
      });
      return;
    }
    haptic(8);
    onLike(comment._id);
  };

  const authorObj = typeof comment.author === "object" ? comment.author : null;
  const authorDisplay = authorObj?.fullname || authorObj?.username || "Anonymous";
  const avatarUrl = authorObj?.avatar ? getAvatarUrl(authorObj.avatar) : null;
  const isOwnComment = currentUser?._id === authorObj?._id;

  return (
    <div className="py-5 sm:py-6 first:pt-0 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <div className="flex items-start gap-3 sm:gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={authorDisplay}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              e.target.src = FALLBACK_IMG;
            }}
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-[11px] sm:text-[12px] font-bold pd-hd-sans text-neutral-600 dark:text-neutral-300 shrink-0">
            {authorDisplay
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13px] sm:text-[14px] font-semibold pd-hd-sans text-neutral-900 dark:text-neutral-100 truncate">
                  {authorDisplay}
                </p>
                {comment.verified && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold pd-hd-sans bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                {comment.rating > 0 && (
                  <StarRating rating={comment.rating} size={11} showCount={false} />
                )}
                <span className="text-[11px] sm:text-[12px] pd-hd-sans text-neutral-400 inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" strokeWidth={2.5} />
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isOwnComment ? (
                <button
                  onClick={() => onDelete(comment._id)}
                  className="text-neutral-400 hover:text-red-500 text-[12px] p-1.5 rounded-lg transition-colors outline-none focus:outline-none focus-visible:outline-none"
                  aria-label="Delete review"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              ) : currentUser ? (
                <button
                  onClick={() => onReport?.(comment._id)}
                  className="text-neutral-400 hover:text-amber-500 text-[12px] p-1.5 rounded-lg transition-colors outline-none focus:outline-none focus-visible:outline-none"
                  aria-label="Report review"
                  title="Report"
                >
                  <Flag className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              ) : null}
            </div>
          </div>

          <p className="text-[13px] sm:text-[14px] pd-hd-sans text-neutral-600 dark:text-neutral-400 leading-relaxed mt-2 break-words">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold pd-hd-sans transition-colors outline-none focus:outline-none focus-visible:outline-none ${
                comment.liked
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              <ThumbsUp
                className={`h-3.5 w-3.5 ${comment.liked ? "fill-current" : ""}`}
                strokeWidth={2.5}
              />
              Helpful {comment.likes > 0 ? `(${comment.likes})` : ""}
            </button>
            {isRoot && (
              <button
                type="button"
                onClick={handleReplyClick}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold pd-hd-sans text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors outline-none focus:outline-none focus-visible:outline-none"
              >
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.5} />
                Reply
              </button>
            )}
          </div>

          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-md text-[13px] pd-hd-sans focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                disabled={submitting}
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-[12px] font-semibold pd-hd-sans hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "…" : "Send"}
              </button>
            </form>
          )}

          {comment.replies?.length > 0 && (
            <div className="ml-4 sm:ml-6 mt-3 pl-3 sm:pl-4 border-l-2 border-neutral-100 dark:border-neutral-800 space-y-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReport={onReport}
                  currentUser={currentUser}
                  isRoot={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   SizeGuideModal
   ════════════════════════════════════════════════════════════ */
const SizeGuideModal = memo(function SizeGuideModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  useFocusTrap(isOpen, modalRef);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const table = [
    { eu: "39", cm: "24.5", uk: "6", us: "7" },
    { eu: "40", cm: "25.0", uk: "6.5", us: "7.5" },
    { eu: "41", cm: "25.7", uk: "7", us: "8" },
    { eu: "42", cm: "26.3", uk: "8", us: "9" },
    { eu: "43", cm: "27.0", uk: "8.5", us: "9.5" },
    { eu: "44", cm: "27.7", uk: "9.5", us: "10.5" },
    { eu: "45", cm: "28.3", uk: "10", us: "11" },
    { eu: "46", cm: "29.0", uk: "11", us: "12" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
        >
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-neutral-900 dark:text-neutral-100" strokeWidth={2.5} />
              <h3 className="text-[14px] sm:text-[15px] font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100">
                Size Guide
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors outline-none focus:outline-none focus-visible:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto pd-hd-scroll">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800">
                    {["EU", "UK", "US", "Foot Length (cm)"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] uppercase tracking-wider font-bold pd-hd-sans text-neutral-400 py-2.5 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr
                      key={row.eu}
                      className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-2.5 text-[12px] sm:text-[13px] font-semibold pd-hd-num text-neutral-900 dark:text-neutral-100">
                        {row.eu}
                      </td>
                      <td className="py-2.5 text-[12px] sm:text-[13px] pd-hd-num text-neutral-600 dark:text-neutral-400">
                        {row.uk}
                      </td>
                      <td className="py-2.5 text-[12px] sm:text-[13px] pd-hd-num text-neutral-600 dark:text-neutral-400">
                        {row.us}
                      </td>
                      <td className="py-2.5 text-[12px] sm:text-[13px] pd-hd-num text-neutral-600 dark:text-neutral-400">
                        {row.cm}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
              <p className="text-[11px] sm:text-[12px] pd-hd-sans text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <Info className="h-3.5 w-3.5 inline mr-1.5 align-text-bottom" strokeWidth={2.5} />
                Measure your foot from heel to the longest toe, standing up. Match to the nearest size above.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

/* ════════════════════════════════════════════════════════════
   NotifyMeModal — for out-of-stock
   ════════════════════════════════════════════════════════════ */
const NotifyMeModal = memo(function NotifyMeModal({ isOpen, onClose, product, size }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef(null);
  useFocusTrap(isOpen, modalRef);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    toast.success("We'll notify you when it's back in stock");
    setTimeout(() => onClose(), 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xl p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Bell className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100">
                Notify me when back in stock
              </h3>
              <p className="text-[12px] pd-hd-sans text-neutral-500 dark:text-neutral-400 mt-1">
                {product?.title}
                {size && <span className="font-semibold"> · Size {size}</span>}
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
              <span className="text-[12px] font-semibold">You're on the list!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl text-[13px] pd-hd-sans focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[12px] font-semibold pd-hd-sans text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-bold pd-hd-sans hover:opacity-90 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
                >
                  Notify me
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

/* ════════════════════════════════════════════════════════════
   RelatedProducts
   ════════════════════════════════════════════════════════════ */
const RelatedProducts = memo(function RelatedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16 lg:mt-20">
      <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 tracking-tight">
            You may also like
          </h2>
          <p className="text-[12px] sm:text-[13px] pd-hd-sans text-neutral-400 mt-1">
            Curated recommendations based on this product
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {products.slice(0, 4).map((p, i) => {
          const rRegular = Number(p.regularPrice) || 0;
          const rSale = Number(p.salePrice) || 0;
          const hasItemSale = rSale > 0 && rSale < rRegular;
          const discount = hasItemSale
            ? Math.round(((rRegular - rSale) / rRegular) * 100)
            : 0;
          const image = Array.isArray(p.images) && p.images[0] ? p.images[0] : FALLBACK_IMG;

          return (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                to={`/shop/${p.slug || p._id}`}
                className="group block bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300"
              >
                <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 overflow-hidden">
                  <img
                    src={image}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 pd-hd-image"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold pd-hd-sans bg-red-500 text-white">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold pd-hd-sans text-neutral-400 truncate">
                    {p.brand}
                  </p>
                  <h3 className="text-[12px] sm:text-[13px] font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 truncate mt-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2 flex-wrap">
                    <span className="text-[13px] sm:text-[14px] font-bold pd-hd-num text-neutral-900 dark:text-neutral-100">
                      {formatPKR(hasItemSale ? rSale : rRegular)}
                    </span>
                    {hasItemSale && (
                      <span className="text-[10px] sm:text-[11px] pd-hd-num text-neutral-400 line-through">
                        {formatPKR(rRegular)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
});

/* ════════════════════════════════════════════════════════════
   Sticky Mobile Buy Bar
   ════════════════════════════════════════════════════════════ */
const StickyMobileBuy = memo(function StickyMobileBuy({
  visible,
  effectivePrice,
  hasSale,
  safeRegular,
  selectedSize,
  onAddToCart,
  isOutOfStock,
  addingToCart,
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-200/80 dark:border-neutral-800 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[15px] font-bold pd-hd-num text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {formatPKR(effectivePrice)}
                </span>
                {hasSale && (
                  <span className="text-[11px] pd-hd-num text-neutral-400 line-through">
                    {formatPKR(safeRegular)}
                  </span>
                )}
              </div>
              <p className="text-[10px] pd-hd-sans text-neutral-400 truncate mt-0.5">
                {selectedSize ? `Size ${selectedSize}` : "Select size"}
              </p>
            </div>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="px-4 py-3 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-bold pd-hd-sans disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0 outline-none focus:outline-none focus-visible:outline-none"
            >
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.5} />
              {addingToCart ? "…" : "Add"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/* ════════════════════════════════════════════════════════════
   ProductDetail — main
   ════════════════════════════════════════════════════════════ */
const ProductDetail = () => {
  const params = useParams();
  const identifier = params.slug || params.id;
  const navigate = useNavigate();

  /* ✅ ALL HOOKS AT THE TOP — no early returns above this block */

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [readProgress, setReadProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [shareToast, setShareToast] = useState(false);
  const [skuCopied, setSkuCopied] = useState(false);

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  const articleRef = useRef(null);
  const autoPlayRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const buyBoxRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentSort, setCommentSort] = useState("newest");
  const [commentFilter, setCommentFilter] = useState("all");

  /* ─── Fetch product ────────────────────────────────── */
  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      setError("Product not found");
      return;
    }

    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/posts/${identifier}`, {
          signal: controller.signal,
        });
        const data = res?.data?.data;
        if (!data) {
          setError("Product not found");
          return;
        }
        setProduct(data);
        setCurrentImageIndex(0);
        setSelectedSize(data.sizes?.[0] || null);
        setQuantity(1);

        trackEvent("view_item", {
          item_id: data._id,
          item_name: data.title,
          item_brand: data.brand,
          item_category: data.category,
          price: Number(data.salePrice) || Number(data.regularPrice) || 0,
        });

        try {
          const recent = safeRead(LS_RECENT, []);
          const filtered = recent.filter((r) => r._id !== data._id);
          const next = [
            {
              _id: data._id,
              slug: data.slug,
              title: data.title,
              brand: data.brand,
              images: data.images,
              regularPrice: data.regularPrice,
              salePrice: data.salePrice,
            },
            ...filtered,
          ].slice(0, 8);
          safeWrite(LS_RECENT, next);
        } catch {}

        try {
          const list = safeRead(LS_WISHLIST, []);
          setWishlisted(list.includes(data._id));
        } catch {}

        if (data.category) {
          api
            .get("/api/posts", {
              params: { category: data.category, limit: 8, page: 1 },
              signal: controller.signal,
            })
            .then((relatedRes) => {
              setRelated(
                (relatedRes?.data?.data || [])
                  .filter((p) => p._id !== data._id)
                  .slice(0, 4)
              );
            })
            .catch((relErr) => {
              if (!axios.isCancel?.(relErr)) {
                console.warn("Related fetch failed:", relErr);
              }
            });
        }
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED") return;
        console.error("Error fetching product:", err);
        const status = err?.response?.status;
        setError(
          status === 404
            ? "Product not found"
            : err?.response?.data?.message || "Failed to load product"
        );
        toast.error("Failed to load product");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchProduct();

    return () => controller.abort();
  }, [identifier]);

  /* ─── Fetch comments ───────────────────────────────── */
  const fetchComments = useCallback(async () => {
    if (!identifier) return;
    try {
      setCommentsLoading(true);
      const res = await api.get(`/api/posts/${identifier}/comments`);
      setComments((res?.data?.data || []).map(normalizeLikes));
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /* ─── Load current user ────────────────────────────── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setCurrentUser(raw ? JSON.parse(raw) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  /* ─── Sticky mobile bar visibility ─────────────────── */
  useEffect(() => {
    const onScroll = () => {
      if (!buyBoxRef.current) return;
      const rect = buyBoxRef.current.getBoundingClientRect();
      setStickyVisible(rect.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [product]);

  /* ─── Sorted + filtered comments ───────────────────── */
  const sortedComments = useMemo(() => {
    let list = [...comments];

    if (commentFilter === "withText") {
      list = list.filter((c) => c.content && c.content.trim().length > 0);
    } else if (commentFilter === "withRating") {
      list = list.filter((c) => c.rating > 0);
    }

    if (commentSort === "liked") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (commentSort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (commentSort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [comments, commentSort, commentFilter]);

  /* ─── Comment handlers ─────────────────────────────── */
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/api/posts/${identifier}/comments`, {
        content: commentText,
        rating: commentRating,
      });
      setComments((prev) => [normalizeLikes(res.data.data), ...prev]);
      setCommentText("");
      setCommentRating(5);
      toast.success("Review posted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Review failed to send");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (commentId, content) => {
    try {
      const res = await api.post(`/api/comments/${commentId}/replies`, { content });
      setComments((prev) =>
        addReplyRecursively(prev, commentId, normalizeLikes(res.data.data))
      );
      toast.success("Reply posted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reply failed to send");
      throw err;
    }
  };

  const handleLike = async (commentId) => {
    setComments((prev) =>
      updateCommentRecursively(prev, commentId, (c) => ({
        ...c,
        likes: (c.likes || 0) + (c.liked ? -1 : 1),
        liked: !c.liked,
      }))
    );

    try {
      const res = await api.post(`/api/comments/${commentId}/like`);
      const { liked, likes } = res.data.data;
      setComments((prev) =>
        updateCommentRecursively(prev, commentId, (c) => ({ ...c, likes, liked }))
      );
    } catch (err) {
      console.error("Like error:", err);
      setComments((prev) =>
        updateCommentRecursively(prev, commentId, (c) => ({
          ...c,
          likes: (c.likes || 0) + (c.liked ? -1 : 1),
          liked: !c.liked,
        }))
      );
      toast.error("Like failed to send");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments((prev) => deleteCommentRecursively(prev, commentId));
      toast.success("Review deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleReport = async (commentId) => {
    if (!window.confirm("Report this review?")) return;
    try {
      await api.post(`/api/comments/${commentId}/report`);
      toast.success("Reported. Thanks for helping us.");
    } catch {
      toast.success("Reported. Thanks for helping us.");
    }
  };

  /* ─── Reading progress ─────────────────────────────── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const el = articleRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            const scrolled = -rect.top;
            setReadProgress(
              total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) * 100 : 0
            );
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [product]);

  /* ─── Gallery images ───────────────────────────────── */
  const images = useMemo(() => {
    const raw = product?.images;
    if (!Array.isArray(raw) || raw.length === 0) return [FALLBACK_IMG];
    return raw.map(resolveImg);
  }, [product?.images]);

  const goToImage = useCallback(
    (index) => {
      setCurrentImageIndex(() => {
        const len = images.length;
        if (len === 0) return 0;
        return ((index % len) + len) % len;
      });
      setProgress(0);
    },
    [images.length]
  );

  const handleImageNext = useCallback(() => {
    goToImage(currentImageIndex + 1);
  }, [currentImageIndex, goToImage]);

  const handleImagePrev = useCallback(() => {
    goToImage(currentImageIndex - 1);
  }, [currentImageIndex, goToImage]);

  const hasMultipleImages = images.length > 1;

  /* ─── Autoplay ────────────────────────────────────── */
  useEffect(() => {
    if (!hasMultipleImages) return;
    if (!autoPlay) {
      if (autoPlayRef.current) cancelAnimationFrame(autoPlayRef.current);
      setProgress(0);
      return;
    }
    const interval = 3500;
    let start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / interval) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        handleImageNext();
        start = Date.now();
      }
      autoPlayRef.current = requestAnimationFrame(tick);
    };
    autoPlayRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoPlayRef.current) cancelAnimationFrame(autoPlayRef.current);
    };
  }, [autoPlay, hasMultipleImages, handleImageNext]);

  /* ─── Touch swipe ──────────────────────────────────── */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleImageNext();
      else handleImagePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  /* ─── Keyboard navigation ──────────────────────────── */
  useEffect(() => {
    if (!hasMultipleImages) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handleImagePrev();
      else if (e.key === "ArrowRight") handleImageNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasMultipleImages, handleImageNext, handleImagePrev]);

  /* ─── Share ────────────────────────────────────────── */
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = product?.title || "Check out this product";

  const shareOnFacebook = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  const shareOnTwitter = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareTitle
      )}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  const shareOnLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      },
      () => toast.error("Failed to copy")
    );
  };
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {}
  }, [product]);

  /* ✅ Copy SKU */
  const copySku = useCallback(() => {
    if (!product?.sku) return;
    try {
      navigator.clipboard.writeText(product.sku);
      setSkuCopied(true);
      haptic(8);
      toast.success("SKU copied");
      setTimeout(() => setSkuCopied(false), 1500);
    } catch {
      toast.error("Failed to copy SKU");
    }
  }, [product?.sku]);

  /* ─── Cart ─────────────────────────────────────────── */
  const handleAddToCart = async () => {
    if (!selectedSize && product?.sizes?.length) {
      toast.error("Please select a size first");
      return;
    }
    if (product?.inStock === false || product?.stockQuantity === 0) {
      toast.error("This product is out of stock");
      return;
    }
    setAddingToCart(true);
    haptic(15);

    try {
      const cart = safeRead(LS_CART, []);
      const key = `${product._id}__${selectedSize || "one"}`;
      const existing = cart.find((item) => item.key === key);

      if (existing) {
        existing.qty = Math.min((product.stockQuantity || 99), existing.qty + quantity);
      } else {
        cart.push({
          key,
          productId: product._id,
          slug: product.slug,
          sku: product.sku,
          title: product.title,
          image: product.images?.[0],
          price: Number(product.salePrice) || Number(product.regularPrice) || 0,
          size: selectedSize,
          qty: quantity,
          brand: product.brand,
          addedAt: Date.now(),
        });
      }
      safeWrite(LS_CART, cart);
      window.dispatchEvent(new CustomEvent("feathered:cart:update", { detail: { cart } }));

      trackEvent("add_to_cart", {
        item_id: product._id,
        item_name: product.title,
        quantity,
        price: Number(product.salePrice) || Number(product.regularPrice) || 0,
      });

      setTimeout(() => {
        toast.success(`Added to bag · ${selectedSize || "One Size"} · ×${quantity}`);
        setAddingToCart(false);
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to bag");
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize && product?.sizes?.length) {
      toast.error("Please select a size first");
      return;
    }
    navigate("/checkout", {
      state: { productId: product._id, size: selectedSize, qty: quantity },
    });
  };

  const toggleBookmark = () =>
    setBookmarked((p) => {
      haptic(8);
      toast.success(!p ? "Saved for later" : "Removed from saved");
      return !p;
    });

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const list = safeRead(LS_WISHLIST, []);
      const isNow = !wishlisted;
      const next = isNow
        ? [...new Set([...list, product._id])]
        : list.filter((id) => id !== product._id);
      safeWrite(LS_WISHLIST, next);
      setWishlisted(isNow);
      haptic(10);
      window.dispatchEvent(
        new CustomEvent("feathered:wishlist:update", { detail: { list: next } })
      );
      toast.success(isNow ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Wishlist update failed");
    }
  };

  /* ─── TOC ──────────────────────────────────────────── */
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const longDesc = product?.longDescription || product?.description || "";
  const { html: descriptionHtml, toc } = useMemo(
    () => injectHeadingIds(longDesc),
    [longDesc]
  );
  const readingStats = useMemo(() => getReadingStats(longDesc), [longDesc]);

  /* ✅ Delivery date — NO HOOK, plain expression (safe to compute anywhere) */
  const deliveryDate = getEstimatedDelivery(5);

  /* ═════════════════════════════════════════════════════════
     Loading state — AFTER all hooks
     ═════════════════════════════════════════════════════════ */
  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="pd-hd-root min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center px-4">
        <style>{HD_CSS}</style>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold pd-hd-serif text-neutral-900 dark:text-neutral-100 mb-2">
            {error || "Product not found"}
          </h1>
          <p className="text-[13px] sm:text-[14px] pd-hd-sans text-neutral-500 dark:text-neutral-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-[12px] sm:text-[13px] font-semibold pd-hd-sans text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none focus:outline-none focus-visible:outline-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Go back
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] sm:text-[13px] font-bold pd-hd-sans hover:opacity-90 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
              Browse products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Derived data (NO HOOKS from here down) ───────── */
  const {
    title,
    sku,
    brand,
    category,
    condition,
    sizes = [],
    regularPrice,
    salePrice,
    isPublished,
    isFeatured,
    inStock,
    stockQuantity,
    rating,
    numReviews,
  } = product;

  const safeRegular = Number(regularPrice) || 0;
  const safeSale = Number(salePrice) || 0;
  const hasSale = safeSale > 0 && safeSale < safeRegular;
  const discount = hasSale
    ? Math.round(((safeRegular - safeSale) / safeRegular) * 100)
    : 0;
  const effectivePrice = hasSale ? safeSale : safeRegular;
  const isOutOfStock = inStock === false || stockQuantity === 0;
  const maxQty = Math.max(1, Math.min(stockQuantity || 99, 99));
  const conditionStyle = conditionStyles[condition] || conditionStyles.Good;

  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "reviews", label: `Reviews (${comments.length})` },
    { id: "shipping", label: "Shipping & Returns" },
  ];

  const reviewList = comments.map((c) => ({
    name:
      typeof c.author === "object"
        ? c.author?.fullname || c.author?.username || "Anonymous"
        : "Anonymous",
    rating: c.rating || 5,
    date: new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    verified: false,
    text: c.content,
    _id: c._id,
    likes: c.likes,
    liked: c.liked,
    replies: c.replies,
    author: c.author,
    createdAt: c.createdAt,
  }));

  const averageRating =
    comments.length > 0
      ? comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length
      : Number(rating) || 0;

  /* ═════════════════════════════════════════════════════════
     Render
     ═════════════════════════════════════════════════════════ */
  return (
    <div className="pd-hd-root min-h-screen bg-white dark:bg-neutral-950 pb-20 lg:pb-0">
      <style>{HD_CSS}</style>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-neutral-100 dark:bg-neutral-900 z-40">
        <div
          className="h-full bg-neutral-900 dark:bg-neutral-100 transition-[width] duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Shop", to: "/shop" },
              ...(brand
                ? [{ label: brand, to: `/shop?brand=${encodeURIComponent(brand)}` }]
                : []),
              { label: title },
            ]}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-6 md:py-8 lg:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold pd-hd-sans text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors outline-none focus:outline-none focus-visible:outline-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              className={`inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold pd-hd-sans border px-3 py-1.5 rounded-full transition-colors outline-none focus:outline-none focus-visible:outline-none ${
                wishlisted
                  ? "border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-500"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600"
              }`}
              aria-pressed={wishlisted}
            >
              <Heart
                className={`h-3.5 w-3.5 ${wishlisted ? "fill-current" : ""}`}
                strokeWidth={2}
              />
              <span className="hidden sm:inline">
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </span>
            </button>
            <button
              onClick={toggleBookmark}
              className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold pd-hd-sans border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors outline-none focus:outline-none focus-visible:outline-none"
            >
              <Sparkles
                className={`h-3.5 w-3.5 ${bookmarked ? "fill-current text-amber-500" : ""}`}
                strokeWidth={2}
              />
              <span className="hidden sm:inline">
                {bookmarked ? "Saved" : "Save"}
              </span>
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Gallery */}
          <div
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ImageGallery
              images={images}
              name={title}
              currentIndex={currentImageIndex}
              onIndexChange={goToImage}
              autoPlay={autoPlay}
              progress={progress}
              onToggleAutoPlay={() => setAutoPlay((v) => !v)}
            />
          </div>

          {/* Buy box */}
          <div ref={buyBoxRef} className="space-y-5 sm:space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {brand && (
                    <Link
                      to={`/shop?brand=${encodeURIComponent(brand)}`}
                      className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold pd-hd-sans text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      {brand}
                    </Link>
                  )}
                  {condition && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold pd-hd-sans ${conditionStyle.bg} ${conditionStyle.text}`}
                    >
                      {condition}
                    </span>
                  )}
                  {isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold pd-hd-sans bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                      <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                      Featured
                    </span>
                  )}
                  {!isPublished && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold pd-hd-sans bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                      Draft
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-[2rem] xl:text-4xl font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 tracking-tight leading-[1.15]">
                  {title}
                </h1>

                {/* ✅ SKU chip — click to copy */}
                {sku && (
                  <button
                    type="button"
                    onClick={copySku}
                    className="group inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] pd-hd-num font-semibold text-neutral-600 dark:text-neutral-400 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                    aria-label="Copy SKU"
                  >
                    <Tag className="h-3 w-3" strokeWidth={2.5} />
                    <span className="uppercase tracking-wider text-[9px] font-bold text-neutral-400">
                      SKU
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">{sku}</span>
                    {skuCopied ? (
                      <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                    )}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors shrink-0 outline-none focus:outline-none focus-visible:outline-none"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {(averageRating > 0 || comments.length > 0) && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <StarRating
                  rating={averageRating}
                  count={comments.length || Number(numReviews) || 0}
                  size={16}
                />
                {category && (
                  <span className="text-[11px] sm:text-[12px] pd-hd-sans text-neutral-400">
                    Category:{" "}
                    <span className="font-medium pd-hd-sans text-neutral-600 dark:text-neutral-400">
                      {category}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 tabular-nums tracking-tight">
                {formatPKR(effectivePrice)}
              </span>
              {hasSale && (
                <>
                  <span className="text-base sm:text-lg pd-hd-num text-neutral-400 line-through">
                    {formatPKR(safeRegular)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-[12px] font-bold pd-hd-sans bg-red-500 text-white">
                    <Percent className="h-3 w-3" strokeWidth={2.5} />
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-[14px] sm:text-[15px] pd-hd-sans text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              {!isOutOfStock ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[12px] sm:text-[13px] font-semibold pd-hd-sans text-emerald-600 dark:text-emerald-400">
                    In stock
                    {stockQuantity > 0 && ` · ${stockQuantity} available`}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[12px] sm:text-[13px] font-semibold pd-hd-sans text-red-600 dark:text-red-400">
                    Out of stock
                  </span>
                </>
              )}
            </div>

            {/* Sizes */}
            {sizes.length > 0 && (
              <SizeSelector
                sizes={sizes}
                selected={selectedSize}
                onSelect={(s) => {
                  setSelectedSize(s);
                  setQuantity(1);
                }}
                onOpenSizeGuide={() => setSizeGuideOpen(true)}
              />
            )}

            {/* Quantity + CTA */}
            <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] sm:text-[12px] uppercase tracking-wider font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100">
                  Quantity
                </span>
                <span className="text-[10px] sm:text-[11px] pd-hd-sans text-neutral-400">
                  Max {maxQty} per order
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={maxQty}
                  disabled={isOutOfStock}
                />

                {!isOutOfStock ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-[13px] sm:text-[14px] font-bold pd-hd-sans bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 outline-none focus:outline-none focus-visible:outline-none"
                  >
                    <ShoppingBag className="h-4 w-4" strokeWidth={2.5} />
                    {addingToCart ? "Adding…" : "Add to bag"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNotifyOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-[13px] sm:text-[14px] font-bold pd-hd-sans bg-amber-500 text-white hover:bg-amber-600 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                  >
                    <Bell className="h-4 w-4" strokeWidth={2.5} />
                    Notify me
                  </button>
                )}
              </div>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 sm:py-4 rounded-full border border-neutral-200 dark:border-neutral-800 text-[13px] sm:text-[14px] font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                >
                  Buy it now
                </button>
              )}
            </div>

            <TrustBadges deliveryDate={deliveryDate} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16">
          <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />

          <div className="py-5 sm:py-6 md:py-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl"
                >
                  {toc.length > 0 && (
                    <div className="mb-6 lg:hidden border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-950">
                      <p className="text-[13px] font-semibold pd-hd-sans text-neutral-900 dark:text-neutral-100 mb-2">
                        In this description
                      </p>
                      <ul className="space-y-1.5">
                        {toc.map((item) => (
                          <li key={item.id} className={item.level === "h3" ? "ml-4" : ""}>
                            <button
                              onClick={() => scrollToSection(item.id)}
                              className="text-[13px] pd-hd-sans text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 text-left outline-none focus:outline-none focus-visible:outline-none"
                            >
                              {item.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {longDesc ? (
                    <div
                      ref={articleRef}
                      className="prose prose-lg max-w-none text-neutral-900 dark:text-neutral-100 prose-p:leading-[1.8] prose-hr:my-8 post-content pd-hd-sans"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : (
                    <p className="text-[13px] sm:text-[14px] pd-hd-sans text-neutral-400 italic">
                      No description provided for this product.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl"
                >
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                    {[
                      ["SKU", sku],
                      ["Brand", brand],
                      ["Category", category],
                      ["Condition", condition],
                      ["Available sizes", sizes.length ? sizes.join(", ") : "—"],
                      ["Stock", isOutOfStock ? "Out of stock" : `${stockQuantity || "∞"} available`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-0.5 py-3 border-b border-neutral-100 dark:border-neutral-800"
                      >
                        <dt className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold pd-hd-sans text-neutral-400">
                          {label}
                        </dt>
                        <dd className="text-[13px] sm:text-[14px] font-medium pd-hd-sans text-neutral-900 dark:text-neutral-100 break-words flex items-center gap-2">
                          {value || "—"}
                          {label === "SKU" && value && (
                            <button
                              type="button"
                              onClick={copySku}
                              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors outline-none focus:outline-none focus-visible:outline-none"
                              aria-label="Copy SKU"
                            >
                              {skuCopied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                              ) : (
                                <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl"
                >
                  <RatingSummary
                    reviews={reviewList}
                    rating={averageRating}
                    count={comments.length}
                  />

                  <div className="pt-6">
                    {currentUser ? (
                      <form
                        onSubmit={handleAddComment}
                        className="mb-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-3"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[12px] font-semibold pd-hd-sans text-neutral-700 dark:text-neutral-300">
                            Your rating
                          </span>
                          <StarPicker
                            value={commentRating}
                            onChange={setCommentRating}
                            disabled={submittingComment}
                          />
                        </div>
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts on this product…"
                          className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl text-[13px] pd-hd-sans focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                          required
                          disabled={submittingComment}
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submittingComment || !commentText.trim()}
                            className="px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-[12px] font-bold pd-hd-sans hover:opacity-90 disabled:opacity-40 transition-opacity outline-none focus:outline-none focus-visible:outline-none"
                          >
                            {submittingComment ? "Posting…" : "Post review"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-[13px] pd-hd-sans text-neutral-500 dark:text-neutral-400 mb-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                        <Link
                          to="/login"
                          className="text-neutral-900 dark:text-neutral-100 font-semibold hover:underline"
                        >
                          Log in
                        </Link>{" "}
                        to leave a review.
                      </p>
                    )}

                    {!commentsLoading && comments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] pd-hd-sans text-neutral-400">Sort:</span>
                          <select
                            value={commentSort}
                            onChange={(e) => setCommentSort(e.target.value)}
                            className="text-[12px] pd-hd-sans bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 cursor-pointer"
                          >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="liked">Most helpful</option>
                            <option value="rating">Highest rated</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] pd-hd-sans text-neutral-400">Filter:</span>
                          <select
                            value={commentFilter}
                            onChange={(e) => setCommentFilter(e.target.value)}
                            className="text-[12px] pd-hd-sans bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 cursor-pointer"
                          >
                            <option value="all">All</option>
                            <option value="withText">With text</option>
                            <option value="withRating">With rating</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {commentsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((n) => (
                          <div key={n} className="flex gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-800 rounded" />
                              <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-12 sm:py-16">
                        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                          <Star className="h-7 w-7 text-neutral-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-semibold pd-hd-sans text-neutral-900 dark:text-neutral-100">
                          No reviews yet
                        </p>
                        <p className="text-[12px] sm:text-[13px] pd-hd-sans text-neutral-400 mt-1">
                          Be the first to review this product
                        </p>
                      </div>
                    ) : sortedComments.length === 0 ? (
                      <p className="text-center py-8 text-[13px] pd-hd-sans text-neutral-400">
                        No reviews match this filter.
                      </p>
                    ) : (
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {sortedComments.map((comment) => (
                          <CommentItem
                            key={comment._id}
                            comment={comment}
                            onReply={handleReply}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onReport={handleReport}
                            currentUser={currentUser}
                            isRoot
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl space-y-6"
                >
                  <div>
                    <h3 className="text-[14px] sm:text-[15px] font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                      <Truck className="h-4 w-4" strokeWidth={2.5} />
                      Shipping
                    </h3>
                    <p className="text-[13px] sm:text-[14px] pd-hd-sans text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Free standard shipping on orders over Rs 8,000. Orders under Rs 8,000
                      ship for a flat rate. Express shipping available at checkout. Most
                      orders ship within 1–2 business days.
                    </p>
                    {deliveryDate && (
                      <p className="text-[12px] pd-hd-sans text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                        Estimated delivery: {deliveryDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[14px] sm:text-[15px] font-bold pd-hd-sans text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                      Returns
                    </h3>
                    <p className="text-[13px] sm:text-[14px] pd-hd-sans text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      We offer a 30-day return policy. Items must be unused, in original
                      packaging, and in the same condition you received them.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ✅ Sold by box REMOVED */}

        {/* Related products */}
        <RelatedProducts products={related} />

        {/* Share row */}
        <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] sm:text-[12px] uppercase tracking-wider font-bold pd-hd-sans text-neutral-400 mr-1">
            Share
          </span>
          <button
            onClick={shareOnFacebook}
            aria-label="Share on Facebook"
            className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors outline-none focus:outline-none focus-visible:outline-none"
          >
            <span className="text-[13px] font-bold">f</span>
          </button>
          <button
            onClick={shareOnTwitter}
            aria-label="Share on X"
            className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors outline-none focus:outline-none focus-visible:outline-none"
          >
            <span className="text-[13px] font-bold">𝕏</span>
          </button>
          <button
            onClick={shareOnLinkedIn}
            aria-label="Share on LinkedIn"
            className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors outline-none focus:outline-none focus-visible:outline-none"
          >
            <span className="text-[13px] font-bold">in</span>
          </button>
          <button
            onClick={copyLink}
            aria-label="Copy link"
            className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors outline-none focus:outline-none focus-visible:outline-none"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Sidebar TOC — only on xl+ to avoid overlap with content */}
        <div className="hidden xl:block fixed right-8 top-32 w-56 2xl:w-64">
          {toc.length > 0 && (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 mb-4">
              <p className="text-[13px] font-semibold pd-hd-sans text-neutral-900 dark:text-neutral-100 mb-3">
                In this description
              </p>
              <ul className="space-y-2 border-l border-neutral-200 dark:border-neutral-800">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === "h3" ? "pl-6" : "pl-3"}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-[12px] pd-hd-sans text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 text-left outline-none focus:outline-none focus-visible:outline-none"
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="text-neutral-900 dark:text-neutral-100" size={16} strokeWidth={2.5} />
              <span className="font-semibold pd-hd-sans text-neutral-900 dark:text-neutral-100 text-[13px]">
                {readingStats.minutes} min read
              </span>
            </div>
            <p className="text-[11px] pd-hd-sans text-neutral-500 dark:text-neutral-400 mt-1">
              {readingStats.words.toLocaleString()} words in this description.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      <StickyMobileBuy
        visible={stickyVisible}
        effectivePrice={effectivePrice}
        hasSale={hasSale}
        safeRegular={safeRegular}
        selectedSize={selectedSize}
        onAddToCart={handleAddToCart}
        isOutOfStock={isOutOfStock}
        addingToCart={addingToCart}
      />

      {/* Modals */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      <NotifyMeModal
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        product={product}
        size={selectedSize}
      />

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 pd-hd-sans"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
            <span className="text-[12px] sm:text-[13px] font-semibold">
              Link copied to clipboard
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(ProductDetail);