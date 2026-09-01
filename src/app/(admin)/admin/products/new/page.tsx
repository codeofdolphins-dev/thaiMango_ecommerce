"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Select from "react-select";
import { Card, PageHeader } from "@/components/admin/ui";
import ImageUploader from "@/components/admin/ImageUploader";
import { adminSelectStyles, SelectOption } from "@/components/admin/selectStyles";
import VariantsEditor, {
  emptyVariant,
  VariantFormRow,
} from "@/components/admin/VariantsEditor";
import { productSchema } from "@/schemas/product.schema";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SKU_SKIP_WORDS = new Set(["thai", "mango", "the", "a", "of", "and"]);

function buildSku(nameEn: string, weightGrams: string) {
  const words = nameEn
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !SKU_SKIP_WORDS.has(w.toLowerCase()));
  const source = words.length > 0 ? words : nameEn.trim().split(/\s+/).filter(Boolean);
  const code = source
    .slice(0, 3)
    .map((w) => w.replace(/[^a-zA-Z]/g, "").charAt(0).toUpperCase())
    .join("");
  if (!code) return "";
  const weight = weightGrams.trim();
  return weight ? `TM-${code}-${weight}` : `TM-${code}`;
}

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
  how_its_made: string;
  storage_info: string;
  ingredients: string;
  variants: VariantFormRow[];
}

const splitList = (s: string | null | undefined) =>
  (s ?? "")
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
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name_en: "",
      name_th: "",
      slug: "",
      description_en: "",
      description_th: "",
      /* The list fields are comma-joined strings; leaving them undefined makes
         the controlled inputs (and splitList) blow up on first render. */
      tags: "",
      highlights: "",
      images: "",
      how_its_made: "",
      storage_info: "",
      ingredients: "",
      status: "DRAFT",
      category_id: "",
      variants: [{ ...emptyVariant(), is_default: true }],
    },
  });

  const nameEn = useWatch({ control, name: "name_en" });
  const variants = useWatch({ control, name: "variants" });

  /* Slug is always derived from the English name — the field is read-only. */
  useEffect(() => {
    setValue("slug", slugify(nameEn ?? ""));
  }, [nameEn, setValue]);

  /* Suggest a SKU for any row that doesn't have one yet; never overwrite one
     the admin has typed. */
  useEffect(() => {
    (variants ?? []).forEach((row, i) => {
      if (!row.sku?.trim()) {
        const suggested = buildSku(nameEn ?? "", row.weight_grams ?? "");
        if (suggested) setValue(`variants.${i}.sku`, suggested);
      }
    });
  }, [nameEn, variants, setValue]);

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
      how_its_made: values.how_its_made || undefined,
      storage_info: values.storage_info || undefined,
      ingredients: values.ingredients || undefined,
      status,
      variants: (values.variants ?? []).map((v) => ({
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

    createMutation.mutate(parsed.data);
  };

  const fieldError = (name: keyof FormValues) =>
    errors[name] ? (
      <p className="text-[11px] text-rose-600 mt-1">
        {errors[name]?.message as string}
      </p>
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
          className="px-4 py-2.5 rounded-full border border-cream bg-white text-sm font-semibold text-charcoal hover:border-accent transition disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Save as Draft"}
        </button>
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={handleSubmit((v) => onSubmit(v, "ACTIVE"))}
          className="px-4 py-2.5 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-burgundy transition disabled:opacity-60"
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
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-5">
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
                  className={`${inputCls} bg-ivory text-muted cursor-not-allowed`}
                  placeholder="chili-lime-bites"
                  readOnly
                  {...register("slug")}
                />
                <p className="text-[11px] text-muted mt-1">
                  Auto-generated from the English name.
                </p>
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
            </div>
          </Card>

          <VariantsEditor<FormValues>
            control={control}
            register={register}
            errors={errors}
            buildSku={(row) => buildSku(nameEn ?? "", row.weight_grams)}
          />

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-5">
              Product Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>How It&apos;s Made</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="Hand-selected, sliced and slow sun-dried…"
                  {...register("how_its_made")}
                />
              </div>
              <div>
                <label className={labelCls}>Storage &amp; Freshness</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="Keep in a cool, dry place away from direct sunlight…"
                  {...register("storage_info")}
                />
              </div>
              <div>
                <label className={labelCls}>Full Ingredients</label>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="Mangifera Indica (Mango), no added sugar…"
                  {...register("ingredients")}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted mt-3">
              Optional — shown in the accordion on the storefront product page.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-5">
              Product Images
            </h2>
            {/* Stored in the form as a comma-joined string so the submit
                handler's splitList() stays unchanged. */}
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader
                  value={splitList(field.value)}
                  onChange={(next) => field.onChange(next.join(", "))}
                />
              )}
            />
          </Card>
        </div>

        {/* Right: organization */}
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-charcoal mb-5">
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
