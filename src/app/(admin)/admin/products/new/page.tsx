"use client";

import Link from "next/link";
import { ChevronLeft, ImagePlus, Upload } from "lucide-react";
import { CATEGORIES } from "@/components/admin/data";
import { Card, PageHeader } from "@/components/admin/ui";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

export default function NewProductPage() {
  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <PageHeader
        title="Add Product"
        subtitle="Create a new product for the Thai Mango catalog."
      >
        <button className="px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm font-semibold text-charcoal hover:border-peach transition">
          Save as Draft
        </button>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition">
          Publish Product
        </button>
      </PageHeader>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              General Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Product Name</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Thai Mango Chili Lime Bites"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={5}
                  className={`${inputCls} resize-y`}
                  placeholder="Describe the flavor, texture and story of this product…"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>SKU</label>
                  <input className={inputCls} placeholder="TM-CHL-100" />
                </div>
                <div>
                  <label className={labelCls}>Weight / Size</label>
                  <input className={inputCls} placeholder="100g Pouch" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Pricing &amp; Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Price (₹)</label>
                <input type="number" className={inputCls} placeholder="430" />
              </div>
              <div>
                <label className={labelCls}>Compare-at (₹)</label>
                <input type="number" className={inputCls} placeholder="480" />
              </div>
              <div>
                <label className={labelCls}>Stock Quantity</label>
                <input type="number" className={inputCls} placeholder="150" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Product Images
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                type="button"
                className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 text-muted hover:border-peach hover:text-peach transition"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-[11px] font-semibold">Add Image</span>
              </button>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-cream/60 border border-stone-200/70 img-placeholder"
                />
              ))}
            </div>
            <p className="text-[11px] text-muted mt-3 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              PNG or JPG, up to 5MB each. First image is the cover.
            </p>
          </Card>
        </div>

        {/* Right: organization */}
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Organization
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} defaultValue="Active">
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Out of Stock</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <input
                  className={inputCls}
                  placeholder="spicy, chili, lime, bestseller"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-4">
              Visibility
            </h2>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-peach"
              />
              <span className="text-sm text-charcoal">
                Show on storefront
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none mt-3">
              <input type="checkbox" className="w-4 h-4 rounded accent-peach" />
              <span className="text-sm text-charcoal">
                Feature on homepage
              </span>
            </label>
          </Card>
        </div>
      </form>
    </>
  );
}
