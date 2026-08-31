"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ExternalLink, Upload } from "lucide-react";
import Select from "react-select";
import { Card, PageHeader } from "@/components/admin/ui";
import { adminSelectStyles, SelectOption } from "@/components/admin/selectStyles";
import VariantsEditor, { VariantFormRow } from "@/components/admin/VariantsEditor";
import { productSchema } from "@/schemas/product.schema";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

interface AdminCategory {
  id: number;
  name_en: string;
}

interface AdminVariant {
  id: number;
  label: string;
  weight_grams: number;
  sku: string;
  price: string;
  compare_at_price: string;
  stock: number;
  is_default: boolean;
}

interface AdminProduct {
  id: string;
  slug: string;
  name_en: string;
  name_th: string;
  description_en: string;
  description_th: string;
  images: string[];
  tags: string[];
  highlights: string[];
  how_its_made: string | null;
  storage_info: string | null;
  ingredients: string | null;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  category: { id: number; slug: string; name_en: string };
  productVariant: AdminVariant[];
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
  how_its_made: string;
  storage_info: string;
  ingredients: string;
  variants: VariantFormRow[];
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);

  const productQuery = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: async (): Promise<AdminProduct> => {
      const res = await fetch(`/api/admin/products/${productId}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load product");
      return body.data;
    },
  });

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
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>();

  /* Fill the form once the product arrives */
  useEffect(() => {
    const p = productQuery.data;
    if (!p) return;
    reset({
      name_en: p.name_en,
      name_th: p.name_th,
      slug: p.slug,
      description_en: p.description_en,
      description_th: p.description_th,
      category_id: String(p.category.id),
      status: p.status,
      tags: p.tags.join(", "),
      highlights: p.highlights.join(", "),
      images: p.images.join(", "),
      how_its_made: p.how_its_made ?? "",
      storage_info: p.storage_info ?? "",
      ingredients: p.ingredients ?? "",
      variants: p.productVariant.map((v) => ({
        id: v.id,
        label: v.label,
        weight_grams: String(v.weight_grams),
        sku: v.sku,
        price: String(Number(v.price)),
        compare_at_price: String(Number(v.compare_at_price)),
        stock: String(v.stock),
        is_default: v.is_default,
      })),
    });
  }, [productQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
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
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const onSubmit = (values: FormValues) => {
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
      how_its_made: values.how_its_made || undefined,
      storage_info: values.storage_info || undefined,
      ingredients: values.ingredients || undefined,
      status: values.status,
      variants: (values.variants ?? []).map((v) => ({
        ...(typeof v.id === "number" ? { id: v.id } : {}),
        label: v.label,
        weight_grams: v.weight_grams,
        sku: v.sku,
        price: v.price,
        compare_at_price: v.compare_at_price || "0",
        stock: v.stock || "0",
        is_default: Boolean(v.is_default),
      })),
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path = issue.path.join(".");
      /* Variant issues carry a numeric index — map them onto the right row. */
      if (issue.path[0] === "variants" && typeof issue.path[1] === "number") {
        const key = issue.path[2] as keyof VariantFormRow | undefined;
        if (key) {
          setError(`variants.${issue.path[1]}.${key}` as never, {
            message: issue.message,
          });
        } else {
          setServerError(issue.message);
        }
        return;
      }
      const fieldMap: Record<string, keyof FormValues> = {
        slug: "slug",
        category_id: "category_id",
        name_en: "name_en",
        name_th: "name_th",
        description_en: "description_en",
        description_th: "description_th",
        variants: "variants",
      };
      const field = fieldMap[path];
      if (field) {
        setError(field as never, { message: issue.message });
      } else {
        setServerError(`${path}: ${issue.message}`);
      }
      return;
    }

    updateMutation.mutate(parsed.data);
  };

  const fieldError = (name: keyof FormValues) =>
    errors[name] ? (
      <p className="text-[11px] text-rose-600 mt-1">{errors[name]?.message}</p>
    ) : null;

  if (productQuery.isPending) {
    return (
      <p className="py-24 text-center text-muted text-sm">Loading product…</p>
    );
  }

  if (productQuery.isError) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-rose-600 mb-4">
          {(productQuery.error as Error).message}
        </p>
        <Link href="/admin/products" className="text-sm text-peach underline">
          Back to Products
        </Link>
      </Card>
    );
  }

  const product = productQuery.data;

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <PageHeader title="Edit Product" subtitle={product.name_en}>
        {product.status === "ACTIVE" && (
          <a
            href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm font-semibold text-charcoal hover:border-peach transition"
          >
            <ExternalLink className="w-4 h-4" />
            View in Shop
          </a>
        )}
        <button
          type="button"
          disabled={updateMutation.isPending || !isDirty}
          onClick={handleSubmit(onSubmit)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
        >
          {updateMutation.isPending
            ? "Saving…"
            : saved
              ? "Saved ✓"
              : "Save Changes"}
        </button>
      </PageHeader>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
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
                  <input className={inputCls} {...register("name_en")} />
                  {fieldError("name_en")}
                </div>
                <div>
                  <label className={labelCls}>Product Name (Thai)</label>
                  <input className={inputCls} {...register("name_th")} />
                  {fieldError("name_th")}
                </div>
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  className={`${inputCls} bg-stone-50 text-muted cursor-not-allowed`}
                  readOnly
                  {...register("slug")}
                />
                <p className="text-[11px] text-muted mt-1">
                  Locked after creation — it&apos;s this product&apos;s public URL.
                </p>
                {fieldError("slug")}
              </div>
              <div>
                <label className={labelCls}>Description (English)</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-y`}
                  {...register("description_en")}
                />
                {fieldError("description_en")}
              </div>
              <div>
                <label className={labelCls}>Description (Thai)</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-y`}
                  {...register("description_th")}
                />
                {fieldError("description_th")}
              </div>
            </div>
          </Card>

          <VariantsEditor<FormValues>
            control={control}
            register={register}
            errors={errors}
          />

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Product Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>How It&apos;s Made</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  {...register("how_its_made")}
                />
              </div>
              <div>
                <label className={labelCls}>Storage &amp; Freshness</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  {...register("storage_info")}
                />
              </div>
              <div>
                <label className={labelCls}>Full Ingredients</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  {...register("ingredients")}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted mt-3">
              Optional — shown in the accordion on the storefront product page.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink mb-5">
              Product Images
            </h2>
            <div>
              <label className={labelCls}>Image Paths (comma-separated)</label>
              <input className={inputCls} {...register("images")} />
            </div>
            {product.images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {product.images.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover bg-cream border border-stone-200/70"
                  />
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted mt-3 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              File upload isn&apos;t wired yet — reference images already in
              /public/images. First image is the cover. Previews reflect the last
              save.
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
                <label className={labelCls}>Status</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select<SelectOption>
                      instanceId="product-status"
                      options={STATUS_OPTIONS}
                      value={STATUS_OPTIONS.find((o) => o.value === field.value) ?? null}
                      onChange={(opt) => field.onChange(opt?.value ?? "DRAFT")}
                      onBlur={field.onBlur}
                      isSearchable={false}
                      styles={adminSelectStyles}
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : undefined
                      }
                    />
                  )}
                />
              </div>
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
              </div>
              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input className={inputCls} {...register("tags")} />
              </div>
              <div>
                <label className={labelCls}>Highlights (comma-separated)</label>
                <input className={inputCls} {...register("highlights")} />
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
