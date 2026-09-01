"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import type { z } from "zod";
import { Card, PageHeader } from "@/components/admin/ui";
import { adminSelectStyles, SelectOption } from "@/components/admin/selectStyles";
import PhoneField from "@/components/common/PhoneField";
import {
  settingsSchema,
  SettingsValues,
  DEFAULT_SETTINGS,
  THAI_VAT_RATE,
  SECRET_MASK,
} from "@/schemas/settings.schema";
import { CURRENCIES, CurrencyCode, currencySymbol, isCurrencyCode } from "@/lib/currency";

const CURRENCY_OPTIONS: SelectOption[] = (
  Object.keys(CURRENCIES) as CurrencyCode[]
).map((code) => ({ value: code, label: CURRENCIES[code].label }));

type SettingsFormInput = z.input<typeof settingsSchema>;

type Gateway = "razorpay" | "stripe";
interface TestResult {
  ok: boolean;
  message: string;
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const lockedInputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-cream text-sm text-muted cursor-not-allowed focus:outline-none";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

function Toggle({
  label,
  desc,
  on,
  onChange,
  ariaLabel,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
  /* Bare switch (no label/desc) — used beside a section heading. */
  ariaLabel?: string;
}) {
  const bare = !label && !desc;
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`flex items-start justify-between gap-4 cursor-pointer text-left ${
        bare ? "shrink-0" : "w-full py-3"
      }`}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
    >
      {!bare && (
        <div>
          <span className="block text-sm font-medium text-charcoal">{label}</span>
          <span className="block text-xs text-muted mt-0.5">{desc}</span>
        </div>
      )}
      <span
        className={`relative w-11 h-6 rounded-full transition shrink-0 ${
          on ? "bg-accent" : "bg-cream"
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
      const res = await fetch("/api/settings");
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
    getValues,
    control,
    formState: { errors },
  } = useForm<SettingsFormInput, unknown, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
    values: settingsQuery.data,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: SettingsValues) => {
      const res = await fetch("/api/settings", {
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

  /* Connection tests run against whatever is typed in the form; blank or
     still-masked secrets fall back to the saved keys server-side. */
  const [testingGateway, setTestingGateway] = useState<Gateway | null>(null);
  const [testResults, setTestResults] = useState<
    Partial<Record<Gateway, TestResult>>
  >({});

  const testGateway = async (gateway: Gateway) => {
    setTestingGateway(gateway);
    setTestResults((prev) => ({ ...prev, [gateway]: undefined }));
    try {
      const values = getValues();
      const payload =
        gateway === "razorpay"
          ? {
              gateway,
              key_id: values.razorpay_key_id,
              key_secret: values.razorpay_key_secret,
            }
          : {
              gateway,
              publishable_key: values.stripe_publishable_key,
              secret_key: values.stripe_secret_key,
            };

      const res = await fetch("/api/admin/settings/test-gateway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [gateway]: {
          ok: Boolean(res.ok && body.data?.ok),
          message:
            body.data?.message || body.message || "Connection test failed.",
        },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [gateway]: { ok: false, message: "Could not run the test. Try again." },
      }));
    } finally {
      setTestingGateway(null);
    }
  };

  /* Dedicated per-gateway save — PATCHes only that gateway's toggle + keys so
     unsaved edits elsewhere in the form are never swept along. */
  const [savingGateway, setSavingGateway] = useState<Gateway | null>(null);

  const saveGatewayKeys = async (gateway: Gateway) => {
    setSavingGateway(gateway);
    setTestResults((prev) => ({ ...prev, [gateway]: undefined }));
    try {
      const values = getValues();
      const payload =
        gateway === "razorpay"
          ? {
              gateway,
              enabled: Boolean(values.razorpay_enabled),
              key_id: values.razorpay_key_id,
              key_secret: values.razorpay_key_secret,
            }
          : {
              gateway,
              enabled: Boolean(values.stripe_enabled),
              publishable_key: values.stripe_publishable_key,
              secret_key: values.stripe_secret_key,
            };

      const res = await fetch("/api/admin/settings/gateways", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.errors?.[0] || body.message || "Save failed.");
      }

      /* A freshly saved secret now lives server-side — swap the input to the
         mask so a later global Save Changes keeps it instead of resending. */
      const secretField =
        gateway === "razorpay" ? "razorpay_key_secret" : "stripe_secret_key";
      const typedSecret = values[secretField];
      if (typedSecret && typedSecret !== SECRET_MASK) {
        setValue(secretField, SECRET_MASK);
      }

      setTestResults((prev) => ({
        ...prev,
        [gateway]: { ok: true, message: "Keys saved." },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [gateway]: {
          ok: false,
          message: error instanceof Error ? error.message : "Save failed.",
        },
      }));
    } finally {
      setSavingGateway(null);
    }
  };

  const testButton = (gateway: Gateway) => {
    const result = testResults[gateway];
    const busy = testingGateway === gateway;
    const saving = savingGateway === gateway;
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => saveGatewayKeys(gateway)}
          disabled={saving || busy}
          className="px-3.5 py-2 rounded-full bg-accent text-white text-xs font-semibold hover:bg-burgundy transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Keys"}
        </button>
        <button
          type="button"
          onClick={() => testGateway(gateway)}
          disabled={busy || saving}
          className="px-3.5 py-2 rounded-full border border-cream bg-white text-xs font-semibold text-charcoal hover:border-accent transition disabled:opacity-60"
        >
          {busy ? "Testing…" : "Test Connection"}
        </button>
        {result && (
          <span
            className={`text-[11px] font-medium ${
              result.ok ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {result.ok ? "✓ " : "✕ "}
            {result.message}
          </span>
        )}
      </div>
    );
  };

  /* The base currency locks against the SAVED value — the admin can still
     change their mind freely before the first save. */
  const savedBaseCurrency = settingsQuery.data?.currency || "";
  const baseCurrencyLocked = Boolean(savedBaseCurrency);
  const watchedBase = watch("currency");
  const baseSymbol = currencySymbol(
    isCurrencyCode(watchedBase) ? watchedBase : undefined
  );

  const toggle = (name: keyof SettingsFormInput, label: string, desc: string) => (
    <Toggle
      label={label}
      desc={desc}
      on={Boolean(watch(name))}
      onChange={(v) => setValue(name, v, { shouldDirty: true })}
    />
  );

  const socialField = (
    name: keyof SettingsFormInput,
    label: string,
    placeholder: string
  ) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} placeholder={placeholder} {...register(name)} />
      {errors[name] && (
        <p className="text-[11px] text-rose-600 mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title="Settings" subtitle="Store configuration and preferences.">
        <button
          onClick={onSubmit}
          disabled={saveMutation.isPending || settingsQuery.isPending}
          className="px-4 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition disabled:opacity-60"
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
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-5">
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
                  <Controller
                    name="support_phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneField
                        variant="admin"
                        id="support-phone"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
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
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-1">
              Social Links
            </h2>
            <p className="text-[11px] text-muted mb-5">
              Shown on the storefront. Leave a link empty to hide its icon.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {socialField("social_instagram", "Instagram", "https://instagram.com/thaimango")}
              {socialField("social_facebook", "Facebook", "https://facebook.com/thaimango")}
              {socialField("social_twitter", "X (Twitter)", "https://x.com/thaimango")}
              {socialField("social_youtube", "YouTube", "https://youtube.com/@thaimango")}
              {socialField("social_whatsapp", "WhatsApp", "https://wa.me/919876543210")}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-5">
              Shipping &amp; Payments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Free Shipping Above ({baseSymbol})
                </label>
                <input type="number" className={inputCls} {...register("free_shipping_above")} />
              </div>
              <div>
                <label className={labelCls}>
                  Standard Shipping ({baseSymbol})
                </label>
                <input type="number" className={inputCls} {...register("standard_shipping")} />
                <p className="text-[11px] text-muted mt-1">
                  Charged below the free-shipping threshold.
                </p>
              </div>
              <div>
                <label className={labelCls}>
                  Priority Shipping ({baseSymbol})
                </label>
                <input type="number" className={inputCls} {...register("priority_shipping")} />
                <p className="text-[11px] text-muted mt-1">
                  Same-day / next-day rate, never free.
                </p>
              </div>
              <div>
                <label className={labelCls}>Thai VAT (%)</label>
                <input
                  type="number"
                  className={lockedInputCls}
                  disabled
                  {...register("gst_rate")}
                />
                <p className="text-[11px] text-muted mt-1">
                  Fixed at Thailand&apos;s standard VAT rate of {THAI_VAT_RATE}%.
                </p>
              </div>
              <div>
                <label className={labelCls}>Base Currency (product entry)</label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select<SelectOption>
                      instanceId="settings-base-currency"
                      options={CURRENCY_OPTIONS}
                      value={
                        CURRENCY_OPTIONS.find((o) => o.value === field.value) ?? null
                      }
                      onChange={(opt) => field.onChange(opt?.value ?? "")}
                      onBlur={field.onBlur}
                      isDisabled={baseCurrencyLocked}
                      isSearchable={false}
                      placeholder="Choose once — cannot be changed later"
                      styles={adminSelectStyles}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : undefined
                      }
                    />
                  )}
                />
                <p className="text-[11px] text-muted mt-1">
                  {baseCurrencyLocked
                    ? `Locked — every product price is stored in ${savedBaseCurrency}.`
                    : "Product prices are entered in this currency. It locks permanently after the first save."}
                </p>
              </div>
              <div>
                <label className={labelCls}>Display Currency (international)</label>
                <Controller
                  name="display_currency"
                  control={control}
                  render={({ field }) => (
                    <Select<SelectOption>
                      instanceId="settings-display-currency"
                      options={CURRENCY_OPTIONS}
                      value={
                        CURRENCY_OPTIONS.find((o) => o.value === field.value) ?? null
                      }
                      onChange={(opt) => field.onChange(opt?.value ?? "")}
                      onBlur={field.onBlur}
                      isClearable
                      isSearchable={false}
                      placeholder="Empty — defaults to USD ($)"
                      styles={adminSelectStyles}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : undefined
                      }
                    />
                  )}
                />
                <p className="text-[11px] text-muted mt-1">
                  Shoppers in India always see ₹ and in Thailand ฿; everyone
                  else sees this currency (or $ if empty), converted live from
                  the base currency.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-cream divide-y divide-cream">
              {toggle("cod_enabled", "Cash on Delivery", "Allow COD at checkout for serviceable pincodes.")}
              {toggle("upi_enabled", "UPI Payments", "Accept GPay, PhonePe and Paytm.")}
              {toggle("intl_shipping", "International Shipping", "Ship orders outside India.")}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-1">
              Payment Gateways
            </h2>
            <p className="text-[11px] text-muted mb-5">
              Keys saved here are used for live checkout. Secrets are stored
              server-side and never shown again — leave a secret field untouched
              to keep the saved value. A gateway only appears at checkout once
              its keys are complete and it is switched on.
            </p>

            {/* Razorpay */}
            <div className="rounded-xl border border-cream p-4 mb-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-charcoal">Razorpay</h3>
                  <p className="text-[11px] text-muted">
                    UPI, cards and net banking. Dashboard → Settings → API Keys.
                  </p>
                </div>
                <Toggle
                  label=""
                  desc=""
                  ariaLabel="Enable Razorpay"
                  on={Boolean(watch("razorpay_enabled"))}
                  onChange={(v) =>
                    setValue("razorpay_enabled", v, { shouldDirty: true })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Key ID</label>
                  <input
                    className={inputCls}
                    placeholder="rzp_test_xxxxxxxxxxxx"
                    autoComplete="off"
                    {...register("razorpay_key_id")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Key Secret</label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Enter to replace the saved secret"
                    autoComplete="new-password"
                    {...register("razorpay_key_secret")}
                  />
                </div>
              </div>
              {testButton("razorpay")}
            </div>

            {/* Stripe */}
            <div className="rounded-xl border border-cream p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-charcoal">Stripe</h3>
                  <p className="text-[11px] text-muted">
                    International cards. Dashboard → Developers → API keys.
                  </p>
                </div>
                <Toggle
                  label=""
                  desc=""
                  ariaLabel="Enable Stripe"
                  on={Boolean(watch("stripe_enabled"))}
                  onChange={(v) =>
                    setValue("stripe_enabled", v, { shouldDirty: true })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Publishable Key</label>
                  <input
                    className={inputCls}
                    placeholder="pk_test_xxxxxxxxxxxx"
                    autoComplete="off"
                    {...register("stripe_publishable_key")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Secret Key</label>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Enter to replace the saved secret"
                    autoComplete="new-password"
                    {...register("stripe_secret_key")}
                  />
                </div>
              </div>
              {testButton("stripe")}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-2">
              Notifications
            </h2>
            <div className="divide-y divide-cream">
              {toggle("notif_new_order", "New Order Emails", "Email me on every new order.")}
              {toggle("notif_low_stock", "Low Stock Alerts", "Warn when stock drops below 50.")}
              {toggle("notif_weekly", "Weekly Reports", "Sales summary every Monday.")}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-2">
              Storefront
            </h2>
            <div className="divide-y divide-cream">
              {toggle("maintenance_mode", "Maintenance Mode", "Temporarily hide the storefront.")}
              {toggle("show_announcement", "Show Announcement Bar", "Display the top promo marquee.")}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-1">
              We Accept
            </h2>
            <p className="text-[11px] text-muted mb-2">
              Card badges shown in the footer. The UPI and COD badges follow
              the payment toggles automatically.
            </p>
            <div className="divide-y divide-cream">
              {toggle("card_visa", "Visa", "Show the Visa badge.")}
              {toggle("card_mastercard", "Mastercard", "Show the Mastercard badge.")}
              {toggle("card_rupay", "RuPay", "Show the RuPay badge.")}
              {toggle("card_amex", "American Express", "Show the Amex badge.")}
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
