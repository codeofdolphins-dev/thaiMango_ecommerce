"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Upload } from "lucide-react";
import Select from "react-select";
import { Card, PageHeader } from "@/components/admin/ui";
import { adminSelectStyles, SelectOption } from "@/components/admin/selectStyles";
import { productSchema } from "@/schemas/product.schema";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

interface AdminCategory {
  id: number;
  name_en: string;
}

/* Raw form shape — strings from inputs; assembled + validated with productSchema on submit */
interface FormValues {
  name_en: string;
  name_th: string;
  slug: string;
  description_en: string;
  description_th: string;
  category_id: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  tags: string;
  highlights: string;
  images: string;
  variant_label: string;
  weight_grams: string;
  sku: string;
  price: string;
  compare_at_price: string;
  stock: string;
}

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function NewProductPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async (): Promise<AdminCategory[]> => {
      const res = await fetch("/api/admin/categories");
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load categories");
      return body.data;
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { status: "DRAFT", category_id: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.errors?.[0] || body.message || "Something went wrong");
      }
      return body.data;
    },
    onSuccess: () => {
      router.push("/admin/products");
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const onSubmit = (values: FormValues, status: "ACTIVE" | "DRAFT") => {
    setServerError("");
    const payload = {
      slug: values.slug,
      category_id: values.category_id,
      name_en: values.name_en,
      name_th: values.name_th,
      description_en: values.description_en,
      description_th: values.description_th,
      images: splitList(values.images),
      tags: splitList(values.tags),
      highlights: splitList(values.highlights),
      status,
      variant: {
        label: values.variant_label,
        weight_grams: values.weight_grams,
        sku: values.sku,
        price: values.price,
        compare_at_price: values.compare_at_price || "0",
        stock: values.stock || "0",
        is_default: true,
      },
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path = issue.path.join(".");
      /* map schema paths back onto form fields where possible */
      const fieldMap: Record<string, keyof FormValues> = {
        slug: "slug",
        category_id: "category_id",
        name_en: "name_en",
        name_th: "name_th",
        description_en: "description_en",
        description_th: "description_th",
        "variant.label": "variant_label",
        "variant.weight_grams": "weight_grams",
        "variant.sku": "sku",
        "variant.price": "price",
        "variant.compare_at_price": "compare_at_price",
        "variant.stock": "stock",
      };
      const field = fieldMap[path];
      if (field) {
        setError(field, { message: issue.message });
      } else {
        setServerError(`${path}: ${issue.message}`);
      }
      return;
    }

    createMutation.mutate(parsed.data);
  };

  const fieldError = (name: keyof FormValues) =>
    errors[name] ? (
      <p className="text-[11px] text-rose-600 mt-1">{errors[name]?.message}</p>
    ) : null;

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
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={handleSubmit((v) => onSubmit(v, "DRAFT"))}
          className="px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm font-semibold text-charcoal hover:border-peach transition disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Save as Draft"}
        </button>
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={handleSubmit((v) => onSubmit(v, "ACTIVE"))}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Publish Product"}
        </button>
      </PageHeader>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Product Name (English)</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Thai Mango Chili Lime Bites"
                    {...register("name_en")}
                  />
                  {fieldError("name_en")}
                </div>
                <div>
                  <label className={labelCls}>Product Name (Thai)</label>
                  <input
                    className={inputCls}
                    placeholder="ชื่อสินค้า"
                    {...register("name_th")}
                  />
                  {fieldError("name_th")}
                </div>
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  className={inputCls}
                  placeholder="chili-lime-bites"
                  {...register("slug")}
                />
                {fieldError("slug")}
              </div>
              <div>
                <label className={labelCls}>Description (English)</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-y`}
                  placeholder="Describe the flavor, texture and story of this product…"
                  {...register("description_en")}
                />
                {fieldError("description_en")}
              </div>
              <div>
                <label className={labelCls}>Description (Thai)</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-y`}
                  placeholder="คำอธิบายสินค้า…"
                  {...register("description_th")}
                />
                {fieldError("description_th")}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>SKU</label>
                  <input className={inputCls} placeholder="TM-CHL-100" {...register("sku")} />
                  {fieldError("sku")}
                </div>
                <div>
                  <label className={labelCls}>Variant Label</label>
                  <input
                    className={inputCls}
                    placeholder="Standard Pouch"
                    {...register("variant_label")}
                  />
                  {fieldError("variant_label")}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Pricing &amp; Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelCls}>Price (₹)</label>
                <input type="number" className={inputCls} placeholder="430" {...register("price")} />
                {fieldError("price")}
              </div>
              <div>
                <label className={labelCls}>Compare-at (₹)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="480"
                  {...register("compare_at_price")}
                />
                {fieldError("compare_at_price")}
              </div>
              <div>
                <label className={labelCls}>Stock Quantity</label>
                <input type="number" className={inputCls} placeholder="150" {...register("stock")} />
                {fieldError("stock")}
              </div>
              <div>
                <label className={labelCls}>Weight (grams)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="100"
                  {...register("weight_grams")}
                />
                {fieldError("weight_grams")}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Product Images
            </h2>
            <div>
              <label className={labelCls}>Image Paths (comma-separated)</label>
              <input
                className={inputCls}
                placeholder="/images/bangkok-mango-beetroot-1.png, /images/bangkok-mango-beetroot-2.png"
                {...register("images")}
              />
            </div>
            <p className="text-[11px] text-muted mt-3 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              File upload isn&apos;t wired yet — reference images already in /public/images.
              First image is the cover.
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
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => {
                    const options: SelectOption[] = (categoriesQuery.data ?? []).map(
                      (c) => ({ value: String(c.id), label: c.name_en })
                    );
                    return (
                      <Select<SelectOption>
                        instanceId="product-category"
                        options={options}
                        value={options.find((o) => o.value === field.value) ?? null}
                        onChange={(opt) => field.onChange(opt?.value ?? "")}
                        onBlur={field.onBlur}
                        isLoading={categoriesQuery.isPending}
                        isClearable
                        placeholder="Select a category"
                        styles={adminSelectStyles}
                        menuPortalTarget={
                          typeof document !== "undefined" ? document.body : undefined
                        }
                      />
                    );
                  }}
                />
                {fieldError("category_id")}
                {!categoriesQuery.isPending && (categoriesQuery.data ?? []).length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No categories yet —{" "}
                    <Link href="/admin/categories" className="underline">
                      create one first
                    </Link>
                    .
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input
                  className={inputCls}
                  placeholder="spicy, chili, lime"
                  {...register("tags")}
                />
              </div>
              <div>
                <label className={labelCls}>Highlights (comma-separated)</label>
                <input
                  className={inputCls}
                  placeholder="No Sugar Added, Product of Thailand"
                  {...register("highlights")}
                />
                <p className="text-[11px] text-muted mt-1">
                  Shown as badges on the storefront product card (first two).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
