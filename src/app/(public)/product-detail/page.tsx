"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  ShieldCheck,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useStore } from "@/components/public/store";

const PRODUCT_NAME = "Thai Mango Beetroot Fusion Chews";

const GALLERY_IMAGES = [
  "/images/bangkok-mango-beetroot-1.png",
  "/images/bangkok-mango-beetroot-2.png",
  "/images/bangkok-mango-beetroot-1.png",
  "/images/bangkok-mango-beetroot-2.png",
];

const THUMB_ACTIVE_CLASS =
  "thumb-btn relative rounded-2xl overflow-hidden aspect-square bg-white p-1 ring-2 ring-accent shadow-md transition-all duration-300 opacity-100 hover:-translate-y-0.5";
const THUMB_INACTIVE_CLASS =
  "thumb-btn relative rounded-2xl overflow-hidden aspect-square bg-white p-1 ring-1 ring-cream opacity-70 shadow-sm transition-all duration-300 hover:opacity-100 hover:ring-accent/50 hover:-translate-y-0.5";

const LIGHTBOX_THUMB_ACTIVE_CLASS =
  "lightbox-thumb border-2 border-accent rounded-xl overflow-hidden w-14 h-14 bg-white/10 shrink-0 p-0.5 transition opacity-100";
const LIGHTBOX_THUMB_INACTIVE_CLASS =
  "lightbox-thumb border border-white/20 hover:border-accent rounded-xl overflow-hidden w-14 h-14 bg-white/10 shrink-0 p-0.5 transition opacity-60 hover:opacity-100";

interface SizeOption {
  label: string;
  price: number;
}

const SIZE_OPTIONS: SizeOption[] = [
  { label: "100g Standard", price: 410 },
  { label: "250g Bulk Pack (+₹540)", price: 950 },
];

const ZOOM_FACTOR = 2.2;

export default function ProductDetailPage() {
  const { addToCart } = useStore();

  /* ------------------------------------------------------------ */
  /* Gallery state                                                  */
  /* ------------------------------------------------------------ */
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [mainImgIndex, setMainImgIndex] = useState(0);
  const [mainImgOpacity, setMainImgOpacity] = useState(1);

  const switchGalleryImage = (rawIndex: number) => {
    const len = GALLERY_IMAGES.length;
    const next = ((rawIndex % len) + len) % len;
    setGalleryIndex(next);
    setMainImgOpacity(0.4);
    window.setTimeout(() => {
      setMainImgIndex(next);
      setMainImgOpacity(1);
    }, 100);
  };

  /* ------------------------------------------------------------ */
  /* Hover lens + side zoom pane                                    */
  /* ------------------------------------------------------------ */
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const zoomLensRef = useRef<HTMLDivElement>(null);
  const zoomPaneRef = useRef<HTMLDivElement>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);

  const handleZoomMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = zoomContainerRef.current;
    const lens = zoomLensRef.current;
    const pane = zoomPaneRef.current;
    const img = mainImgRef.current;
    if (!container || !lens || !img) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensW = rect.width / ZOOM_FACTOR;
    const lensH = rect.height / ZOOM_FACTOR;
    const lensX = Math.min(Math.max(x - lensW / 2, 0), rect.width - lensW);
    const lensY = Math.min(Math.max(y - lensH / 2, 0), rect.height - lensH);

    lens.style.width = `${lensW}px`;
    lens.style.height = `${lensH}px`;
    lens.style.left = `${lensX}px`;
    lens.style.top = `${lensY}px`;

    if (pane) {
      const spaceRight = window.innerWidth - rect.right;
      const fitsBeside = spaceRight >= rect.width + 24;
      pane.style.left = fitsBeside ? "calc(100% + 24px)" : "0px";
      pane.style.width = `${rect.width}px`;
      pane.style.height = `${rect.height}px`;
      pane.style.backgroundImage = `url('${img.src}')`;
      pane.style.backgroundSize = `${rect.width * ZOOM_FACTOR}px ${
        rect.height * ZOOM_FACTOR
      }px`;
      pane.style.backgroundPosition = `${-(lensX * ZOOM_FACTOR)}px ${-(
        lensY * ZOOM_FACTOR
      )}px`;
    }

    container.classList.add("is-zoomed");
  };

  const handleZoomMouseLeave = () => {
    zoomContainerRef.current?.classList.remove("is-zoomed");
  };

  const handleZoomContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === mainImgRef.current) {
      openLightbox(galleryIndex);
    }
  };

  /* ------------------------------------------------------------ */
  /* Fullscreen lightbox                                            */
  /* ------------------------------------------------------------ */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxImgRef = useRef<HTMLImageElement>(null);
  const lightboxWrapperRef = useRef<HTMLDivElement>(null);
  const lightboxScaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const applyLightboxTransform = () => {
    const img = lightboxImgRef.current;
    if (!img) return;
    const scale = lightboxScaleRef.current;
    const { x, y } = translateRef.current;
    img.style.transform = `scale(${scale}) translate(${x / scale}px, ${
      y / scale
    }px)`;
  };

  const openLightbox = (index: number) => {
    switchGalleryImage(index);
    lightboxScaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    applyLightboxTransform();
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    lightboxScaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    applyLightboxTransform();
  };

  const zoomIn = () => {
    lightboxScaleRef.current = Math.min(3.5, lightboxScaleRef.current + 0.5);
    applyLightboxTransform();
  };

  const zoomOut = () => {
    lightboxScaleRef.current = Math.max(1, lightboxScaleRef.current - 0.5);
    if (lightboxScaleRef.current === 1) translateRef.current = { x: 0, y: 0 };
    applyLightboxTransform();
  };

  const resetZoom = () => {
    lightboxScaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    applyLightboxTransform();
  };

  const handleLightboxDoubleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    lightboxScaleRef.current = lightboxScaleRef.current > 1 ? 1 : 2.5;
    if (lightboxScaleRef.current === 1) translateRef.current = { x: 0, y: 0 };
    applyLightboxTransform();
  };

  /* lock body scroll + keyboard shortcuts while lightbox is open */
  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") switchGalleryImage(galleryIndex - 1);
      else if (e.key === "ArrowRight") switchGalleryImage(galleryIndex + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, galleryIndex]);

  /* drag-to-pan when zoomed */
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (draggingRef.current && lightboxScaleRef.current > 1) {
        translateRef.current = {
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        };
        applyLightboxTransform();
      }
    };
    const onMouseUp = () => {
      draggingRef.current = false;
      lightboxWrapperRef.current?.classList.remove("is-dragging");
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleWrapperMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lightboxScaleRef.current > 1) {
      draggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - translateRef.current.x,
        y: e.clientY - translateRef.current.y,
      };
      lightboxWrapperRef.current?.classList.add("is-dragging");
    }
  };

  /* ------------------------------------------------------------ */
  /* Size / quantity / add to cart                                  */
  /* ------------------------------------------------------------ */
  const [sizeIndex, setSizeIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const selectedSize = SIZE_OPTIONS[sizeIndex];

  const handleAddToCart = () => {
    addToCart({
      name: PRODUCT_NAME,
      price: selectedSize.price,
      image: GALLERY_IMAGES[mainImgIndex],
      size: selectedSize.label,
      quantity: qty,
    });
  };

  return (
    <>
      <main>
        {/* Breadcrumbs */}
        <div className="bg-cream/40 border-b border-cream py-4">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <nav className="flex flex-wrap items-center gap-2 text-xs text-muted uppercase tracking-widest">
              <Link href="/" className="hover:text-charcoal transition">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/shop" className="hover:text-charcoal transition">
                Shop
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/shop" className="hover:text-charcoal transition">
                Fusion Blends
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-charcoal font-semibold truncate max-w-xs">
                Thai Mango Beetroot Fusion Chews
              </span>
            </nav>
          </div>
        </div>

        {/* Product Showcase */}
        <section className="py-12 md:py-20 bg-ivory">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left: Gallery (6 cols) */}
              <div className="lg:col-span-6 flex flex-col sm:flex-row-reverse gap-3 sm:gap-4">
                <div className="relative flex-1 min-w-0">
                  <div
                    id="product-zoom-container"
                    ref={zoomContainerRef}
                    onMouseMove={handleZoomMouseMove}
                    onMouseLeave={handleZoomMouseLeave}
                    onClick={handleZoomContainerClick}
                    className="product-zoom-container relative rounded-[28px] overflow-hidden aspect-square bg-gradient-to-br from-[#FBF3E8] to-[#F3ECE2] ring-1 ring-black/5 shadow-[0_20px_50px_-15px_rgba(20,15,10,0.25)] group"
                  >
                    <img
                      id="main-product-img"
                      ref={mainImgRef}
                      src={GALLERY_IMAGES[mainImgIndex]}
                      alt="Thai Mango Beetroot Fusion Chews"
                      className="w-full h-full object-cover select-none"
                      style={{ opacity: mainImgOpacity, transition: "opacity 0.15s ease" }}
                    />
                    <span className="absolute top-5 left-5 bg-[#F29F86] text-white text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md pointer-events-none z-10">
                      Bestseller
                    </span>
                    <span
                      id="main-gallery-counter"
                      className="absolute bottom-5 left-5 z-10 bg-charcoal/75 text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none"
                    >
                      {galleryIndex + 1} / {GALLERY_IMAGES.length}
                    </span>

                    {/* Floating Zoom Trigger Badge */}
                    <button
                      id="open-lightbox-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(galleryIndex);
                      }}
                      className="absolute bottom-5 right-5 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md text-charcoal text-xs font-semibold hover:bg-charcoal hover:text-white transition-all shadow-lg group-hover:scale-105"
                      aria-label="Expand photo"
                    >
                      <ZoomIn className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                      <span className="hidden sm:inline text-[11px] uppercase tracking-wider">
                        Hover to Zoom
                      </span>
                      <span className="sm:hidden text-[11px] uppercase tracking-wider">
                        Zoom
                      </span>
                    </button>

                    {/* Rectangular lens box tracking the cursor */}
                    <div id="zoom-lens-box" ref={zoomLensRef} className="zoom-lens-box" />
                  </div>

                  {/* Amazon/Flipkart-style magnified panel */}
                  <div id="zoom-pane" ref={zoomPaneRef} className="zoom-pane" />
                </div>
                {/* Thumbnails */}
                <div
                  id="product-thumbnails"
                  className="grid grid-cols-4 sm:grid-cols-1 content-start gap-3 sm:w-20 md:w-24 shrink-0"
                >
                  {GALLERY_IMAGES.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => switchGalleryImage(idx)}
                      className={
                        idx === galleryIndex ? THUMB_ACTIVE_CLASS : THUMB_INACTIVE_CLASS
                      }
                      data-img={src}
                      data-index={idx}
                    >
                      <img
                        src={src}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Product Info & Purchase Form (7 cols) */}
              <div className="lg:col-span-6 flex flex-col justify-start">
                <div className="border-b border-cream pb-6 mb-6">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2 block">
                    Small-Batch Sun-Dried • No Preservatives
                  </span>
                  <h1 className="font-serif text-3xl md:text-5xl text-charcoal mb-4 leading-tight">
                    Thai Mango Beetroot Fusion Chews
                  </h1>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex text-amber-500 text-sm">★★★★★</div>
                    <span className="text-xs font-semibold text-charcoal">4.9 / 5.0</span>
                    <span className="text-xs text-muted">(148 Verified Reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">
                      ₹{selectedSize.price}
                    </span>
                    <span className="text-sm text-muted line-through">₹450</span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Save 9%
                    </span>
                  </div>
                </div>

                <p className="text-sm md:text-base text-muted leading-relaxed mb-8">
                  Thai Mango Beetroot Fusion Chews pair naturally sun-dried Thai mango
                  with real beetroot for a vibrant, earthy-sweet chew. Slow sun-dried the
                  traditional way and infused with beetroot for color and antioxidants,
                  with no added preservatives — just fruit, sunshine, and time.
                </p>

                {/* Size Selector */}
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest font-bold text-charcoal mb-3 block">
                    Select Size:
                  </span>
                  <div className="flex gap-3">
                    {SIZE_OPTIONS.map((option, idx) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setSizeIndex(idx)}
                        className={
                          idx === sizeIndex
                            ? "size-btn px-6 py-3 rounded-full border-2 border-charcoal bg-charcoal text-white text-xs font-bold uppercase tracking-wider"
                            : "size-btn px-6 py-3 rounded-full border border-cream bg-white text-muted hover:border-charcoal hover:text-charcoal text-xs font-bold uppercase tracking-wider transition"
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {/* Counter */}
                  <div className="flex items-center justify-between border border-cream bg-white rounded-full px-4 py-3 w-full sm:w-36">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="text-muted hover:text-charcoal p-1 text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="qty-input text-sm font-bold text-charcoal">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => q + 1)}
                      className="text-muted hover:text-charcoal p-1 text-lg font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="add-to-cart flex-1 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent transition duration-300 shadow-md"
                  >
                    Add to Bag • ₹{selectedSize.price}
                  </button>
                </div>

                {/* Key Benefits Icons */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-cream/40 rounded-2xl border border-cream mb-8">
                  <div className="flex flex-col items-center text-center">
                    <Droplet className="w-6 h-6 text-accent mb-2" />
                    <span className="text-[11px] font-bold text-charcoal uppercase">
                      100% Natural
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <ShieldCheck className="w-6 h-6 text-accent mb-2" />
                    <span className="text-[11px] font-bold text-charcoal uppercase">
                      No Preservatives
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Sparkles className="w-6 h-6 text-accent mb-2" />
                    <span className="text-[11px] font-bold text-charcoal uppercase">
                      Naturally Sweet
                    </span>
                  </div>
                </div>

                {/* Accordion Details */}
                <div className="border-t border-cream divide-y divide-cream">
                  <details className="py-4 group cursor-pointer" open>
                    <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none">
                      <span>How It&apos;s Made</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6">
                      Ripe Thai mangoes are hand-selected, sliced, and slow sun-dried using
                      a centuries-old Thai technique to concentrate their natural
                      sweetness. Each slice is then infused with real beetroot juice,
                      adding vibrant color, earthy depth of flavor, and a natural boost of
                      antioxidants.
                    </p>
                  </details>

                  <details className="py-4 group cursor-pointer">
                    <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none">
                      <span>Storage &amp; Freshness</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6">
                      Keep in a cool, dry place away from direct sunlight. The resealable
                      pouch locks in freshness after opening — best enjoyed within 2
                      weeks. Unopened, it stays fresh for up to 12 months from the pack
                      date.
                    </p>
                  </details>

                  <details className="py-4 group cursor-pointer">
                    <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none">
                      <span>Full Ingredients</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6">
                      Mangifera Indica (Mango), Beta Vulgaris (Beetroot) Juice
                      Concentrate. No added sugar, no preservatives, no artificial colors
                      or flavors. May contain natural fruit sulfites.
                    </p>
                  </details>

                  <details className="py-4 group cursor-pointer">
                    <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-charcoal list-none">
                      <span>Shipping &amp; Free Returns</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="text-xs md:text-sm text-muted leading-relaxed mt-3 pr-6">
                      Complimentary express delivery across India on orders over ₹1,500.
                      Standard delivery delivers in 2–4 business days with tamper-proof
                      eco packaging.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section className="py-16 bg-[#F8F6F2] border-t border-cream">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-serif text-3xl text-charcoal">Complete the Ritual</h2>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest font-bold text-accent hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Rel 1 */}
              <div className="bg-white rounded-[28px] overflow-hidden shadow-sm p-6 flex flex-col justify-between">
                <img
                  src="/images/bangkok-mango-beetroot-1.png"
                  alt=""
                  className="w-full aspect-square object-cover rounded-2xl mb-4"
                />
                <h3 className="font-serif text-xl mb-1">
                  Thai Mango Classic Sun-Dried Strips
                </h3>
                <p className="text-sm font-semibold text-accent mb-4">₹390</p>
                <Link
                  href="/product-detail"
                  className="text-center py-3 bg-charcoal text-white text-xs uppercase tracking-wider rounded-full font-bold hover:bg-accent transition"
                >
                  View Product
                </Link>
              </div>
              {/* Rel 2 */}
              <div className="bg-white rounded-[28px] overflow-hidden shadow-sm p-6 flex flex-col justify-between">
                <img
                  src="/images/bangkok-mango-beetroot-2.png"
                  alt=""
                  className="w-full aspect-square object-cover rounded-2xl mb-4"
                />
                <h3 className="font-serif text-xl mb-1">Thai Mango Chili Lime Bites</h3>
                <p className="text-sm font-semibold text-accent mb-4">₹430</p>
                <Link
                  href="/product-detail"
                  className="text-center py-3 bg-charcoal text-white text-xs uppercase tracking-wider rounded-full font-bold hover:bg-accent transition"
                >
                  View Product
                </Link>
              </div>
              {/* Rel 3 */}
              <div className="bg-white rounded-[28px] overflow-hidden shadow-sm p-6 flex flex-col justify-between">
                <img
                  src="/images/bangkok-mango-beetroot-2.png"
                  alt=""
                  className="w-full aspect-square object-cover rounded-2xl mb-4"
                />
                <h3 className="font-serif text-xl mb-1">Thai Mango Honey Glazed Slices</h3>
                <p className="text-sm font-semibold text-accent mb-4">₹450</p>
                <Link
                  href="/product-detail"
                  className="text-center py-3 bg-charcoal text-white text-xs uppercase tracking-wider rounded-full font-bold hover:bg-accent transition"
                >
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quality & Origin 5-Badge Banner */}
        <div className="relative z-10 w-full border-t border-[#E5B869]/30 bg-[#640C26] text-white reveal">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 md:py-6 grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-0 gap-x-6 md:gap-x-0 md:divide-x md:divide-[#E5B869]/30 text-center items-center">
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 22V10"></path>
                  <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9"></path>
                  <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7"></path>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-wide text-white mb-1">
                ธรรมชาติ 100%
              </span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">
                100% NATURAL
              </span>
            </div>
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8"></path>
                  <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z"></path>
                  <path d="M10 4.5c1-1.5 2-2 3-2"></path>
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-wide text-white mb-1">
                คัดสรรจากมะม่วงคุณภาพ
              </span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">
                FINEST QUALITY MANGO
              </span>
            </div>
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <svg className="w-14 h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
                  <path
                    d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z"
                    fill="#ED1C24"
                  />
                  <path
                    d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z"
                    fill="#FFFFFF"
                  />
                  <path
                    d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z"
                    fill="#241D4F"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-wide text-white mb-1">
                ผลิตในประเทศไทย
              </span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">
                PRODUCT OF THAILAND
              </span>
            </div>
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z"></path>
                  <circle cx="9" cy="8" r="1" fill="currentColor"></circle>
                  <circle cx="15" cy="7" r="0.8" fill="currentColor"></circle>
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-wide text-white mb-1">
                อร่อย เพลิน เคี้ยวหนึบ
              </span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">
                DELICIOUS &amp; CHEWY
              </span>
            </div>
            <div className="col-span-2 md:col-span-1 px-2 md:px-4 flex flex-col items-center justify-center group max-w-xs mx-auto">
              <span className="w-14 h-14 rounded-full border-2 border-[#E5B869] flex items-center justify-center text-[#E5B869] mb-3 group-hover:scale-110 group-hover:bg-[#E5B869]/10 transition-all duration-300 shadow-sm">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="8" cy="5.5" r="2.2"></circle>
                  <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5"></path>
                  <circle cx="16.5" cy="7" r="1.8"></circle>
                  <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4"></path>
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-wide text-white mb-1">
                เหมาะสำหรับทุกวัย
              </span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#E5B869]">
                FOR ALL AGES
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Product Lightbox Modal (page-specific overlay; not part of the
          shared PublicShell chrome, so it is rendered here alongside <main>). */}
      <div
        id="product-lightbox"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
        className={`fixed inset-0 z-[200] bg-charcoal/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8 transition-all duration-300 ${
          lightboxOpen ? "" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Header */}
        <div className="flex justify-between items-center z-10 max-w-7xl mx-auto w-full text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#E5B869] font-bold">
              Zoom View
            </span>
            <span className="text-white/40">•</span>
            <span
              id="lightbox-counter"
              className="text-xs text-white/70 font-semibold tracking-wider"
            >
              {galleryIndex + 1} / {GALLERY_IMAGES.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="lightbox-zoom-out"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              id="lightbox-zoom-in"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              id="lightbox-reset-zoom"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider uppercase text-white transition"
            >
              Reset
            </button>
            <button
              id="close-lightbox"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition ml-2"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Stage */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4">
          <button
            id="lightbox-prev"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchGalleryImage(galleryIndex - 1);
            }}
            className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            id="lightbox-img-wrapper"
            ref={lightboxWrapperRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
            onMouseDown={handleWrapperMouseDown}
            className="lightbox-img-wrapper flex items-center justify-center max-w-full max-h-full"
          >
            <img
              id="lightbox-img"
              ref={lightboxImgRef}
              src={GALLERY_IMAGES[galleryIndex]}
              alt="Thai Mango Product Zoom"
              onDoubleClick={handleLightboxDoubleClick}
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
            />
          </div>

          <button
            id="lightbox-next"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchGalleryImage(galleryIndex + 1);
            }}
            className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Thumbnail Strip */}
        <div className="z-10 flex justify-center items-center gap-3 overflow-x-auto py-2 no-scrollbar">
          {GALLERY_IMAGES.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                switchGalleryImage(idx);
              }}
              className={
                idx === galleryIndex
                  ? LIGHTBOX_THUMB_ACTIVE_CLASS
                  : LIGHTBOX_THUMB_INACTIVE_CLASS
              }
              data-src={src}
              data-index={idx}
            >
              <img src={src} className="w-full h-full object-cover rounded-lg" alt="" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
