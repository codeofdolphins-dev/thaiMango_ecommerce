"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { Card, PageHeader } from "@/components/admin/ui";
import {
  settingsSchema,
  SettingsValues,
  DEFAULT_SETTINGS,
} from "@/schemas/settings.schema";

type SettingsFormInput = z.input<typeof settingsSchema>;

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

function Toggle({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="w-full flex items-start justify-between gap-4 py-3 cursor-pointer text-left"
      role="switch"
      aria-checked={on}
    >
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
    </button>
  );
}

export default function SettingsPage() {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async (): Promise<SettingsValues> => {
      const res = await fetch("/api/admin/settings");
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load settings");
      return body.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormInput, unknown, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
    values: settingsQuery.data,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: SettingsValues) => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.errors?.[0] || body.message || "Something went wrong");
      }
      return body.data;
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const onSubmit = handleSubmit((values) => {
    setServerError("");
    saveMutation.mutate(values);
  });

  const toggle = (name: keyof SettingsFormInput, label: string, desc: string) => (
    <Toggle
      label={label}
      desc={desc}
      on={Boolean(watch(name))}
      onChange={(v) => setValue(name, v, { shouldDirty: true })}
    />
  );

  return (
    <>
      <PageHeader title="Settings" subtitle="Store configuration and preferences.">
        <button
          onClick={onSubmit}
          disabled={saveMutation.isPending || settingsQuery.isPending}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {saveMutation.isPending ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </PageHeader>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Store Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Store Name</label>
                <input className={inputCls} {...register("store_name")} />
                {errors.store_name && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.store_name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Support Email</label>
                  <input className={inputCls} {...register("support_email")} />
                  {errors.support_email && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {errors.support_email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Support Phone</label>
                  <input className={inputCls} {...register("support_phone")} />
                  {errors.support_phone && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {errors.support_phone.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>Store Address</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  {...register("store_address")}
                />
                {errors.store_address && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {errors.store_address.message}
                  </p>
                )}
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
                <input type="number" className={inputCls} {...register("free_shipping_above")} />
              </div>
              <div>
                <label className={labelCls}>Standard Shipping (₹)</label>
                <input type="number" className={inputCls} {...register("standard_shipping")} />
              </div>
              <div>
                <label className={labelCls}>GST Rate (%)</label>
                <input type="number" className={inputCls} {...register("gst_rate")} />
              </div>
              <div>
                <label className={labelCls}>Default Currency</label>
                <select className={inputCls} {...register("currency")}>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="THB">THB — Thai Baht (฿)</option>
                </select>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-200/70 divide-y divide-stone-100">
              {toggle("cod_enabled", "Cash on Delivery", "Allow COD at checkout for serviceable pincodes.")}
              {toggle("upi_enabled", "UPI Payments", "Accept GPay, PhonePe and Paytm.")}
              {toggle("intl_shipping", "International Shipping", "Ship orders outside India.")}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-2">
              Notifications
            </h2>
            <div className="divide-y divide-stone-100">
              {toggle("notif_new_order", "New Order Emails", "Email me on every new order.")}
              {toggle("notif_low_stock", "Low Stock Alerts", "Warn when stock drops below 50.")}
              {toggle("notif_weekly", "Weekly Reports", "Sales summary every Monday.")}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-2">
              Storefront
            </h2>
            <div className="divide-y divide-stone-100">
              {toggle("maintenance_mode", "Maintenance Mode", "Temporarily hide the storefront.")}
              {toggle("show_announcement", "Show Announcement Bar", "Display the top promo marquee.")}
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
