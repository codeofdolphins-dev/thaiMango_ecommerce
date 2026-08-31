"use client";

import Link from "next/link";
import { Star, X } from "lucide-react";
import { useStore } from "./store";

export default function QuickViewModal() {
  const { quickView, closeQuickView, addToCart } = useStore();
  const open = quickView !== null;

  const handleAdd = () => {
    if (!quickView) return;
    const parsed = parseInt(quickView.price.replace(/[^0-9]/g, ""), 10);
    addToCart({
      name: quickView.name,
      price: parsed || 410,
      image: quickView.image,
    });
  };

  return (
    <>
      <div
        id="qv-overlay"
        className={`fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeQuickView}
      />
      <div
        id="quick-view-modal"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`qv-content quick-view-modal-content bg-ivory w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-none shadow-2xl relative transition-transform duration-500 ease-out flex flex-col md:flex-row ${
            open ? "scale-100" : "scale-95"
          }`}
        >
          <button
            id="close-qv"
            className="absolute top-4 right-4 p-2 text-charcoal hover:text-accent bg-ivory/90 backdrop-blur rounded-full z-10 transition shadow-sm"
            aria-label="Close quick view"
            onClick={closeQuickView}
          >
            <X className="w-5 h-5 font-light" />
          </button>

          {/* Image half */}
          <div className="w-full md:w-1/2 bg-cream h-[45vh] md:h-auto min-h-[400px]">
            {quickView ? (
              <img
                id="qv-image"
                src={quickView.image}
                alt={quickView.name}
                className="qv-img w-full h-full object-cover"
              />
            ) : null}
          </div>

          {/* Content half */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-ivory">
            <span className="text-[9px] tracking-widest uppercase text-muted mb-3 font-semibold">
              Quick View
            </span>
            <h3
              id="qv-name"
              className="product-name font-serif text-3xl md:text-4xl mb-4"
            >
              {quickView?.name}
            </h3>

            <div className="flex text-accent mb-6">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] tracking-widest text-muted ml-2">
                (128)
              </span>
            </div>

            <p
              id="qv-price"
              className="product-price text-xl mb-6 font-medium font-serif"
            >
              {quickView?.price}
            </p>
            <p
              id="qv-desc"
              className="text-sm text-muted leading-relaxed mb-8 border-b border-cream pb-8"
            >
              {quickView?.desc}
            </p>

            <button
              className="w-full py-4 bg-charcoal text-ivory text-xs tracking-widest uppercase hover:bg-accent transition duration-300 mb-4"
              onClick={handleAdd}
            >
              Add to Cart
            </button>
            <Link
              href={quickView?.slug ? `/product-detail/${quickView.slug}` : "/shop"}
              className="w-full py-3 text-[10px] tracking-widest uppercase text-charcoal underline hover:text-accent transition text-center block"
              onClick={closeQuickView}
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
