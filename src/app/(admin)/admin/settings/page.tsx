"use client";

import { Card, PageHeader } from "@/components/admin/ui";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

function Toggle({ label, desc, on = false }: { label: string; desc: string; on?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
      <div>
        <span className="block text-sm font-medium text-charcoal">{label}</span>
        <span className="block text-xs text-muted mt-0.5">{desc}</span>
      </div>
      <span
        className={`relative w-11 h-6 rounded-full transition shrink-0 ${
          on ? "bg-peach" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </label>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Store configuration and preferences."
      >
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition">
          Save Changes
        </button>
      </PageHeader>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Store Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Store Name</label>
                <input className={inputCls} defaultValue="Thai Mango" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Support Email</label>
                  <input
                    className={inputCls}
                    defaultValue="care@thaimango.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Support Phone</label>
                  <input
                    className={inputCls}
                    defaultValue="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Store Address</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  defaultValue="Bangkok Orchard House, MG Road, Bengaluru, KA 560001"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Shipping &amp; Payments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Free Shipping Above (₹)</label>
                <input type="number" className={inputCls} defaultValue={1500} />
              </div>
              <div>
                <label className={labelCls}>Standard Shipping (₹)</label>
                <input type="number" className={inputCls} defaultValue={99} />
              </div>
              <div>
                <label className={labelCls}>GST Rate (%)</label>
                <input type="number" className={inputCls} defaultValue={5} />
              </div>
              <div>
                <label className={labelCls}>Default Currency</label>
                <select className={inputCls} defaultValue="INR">
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="THB">THB — Thai Baht (฿)</option>
                </select>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-200/70 divide-y divide-stone-100">
              <Toggle
                label="Cash on Delivery"
                desc="Allow COD at checkout for serviceable pincodes."
                on
              />
              <Toggle
                label="UPI Payments"
                desc="Accept GPay, PhonePe and Paytm."
                on
              />
              <Toggle
                label="International Shipping"
                desc="Ship orders outside India."
              />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-2">
              Notifications
            </h2>
            <div className="divide-y divide-stone-100">
              <Toggle
                label="New Order Emails"
                desc="Email me on every new order."
                on
              />
              <Toggle
                label="Low Stock Alerts"
                desc="Warn when stock drops below 50."
                on
              />
              <Toggle
                label="Weekly Reports"
                desc="Sales summary every Monday."
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-2">Storefront</h2>
            <div className="divide-y divide-stone-100">
              <Toggle
                label="Maintenance Mode"
                desc="Temporarily hide the storefront."
              />
              <Toggle
                label="Show Announcement Bar"
                desc="Display the top promo marquee."
                on
              />
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
