"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import type {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Card } from "@/components/admin/ui";
import { useMoney } from "@/components/admin/useMoney";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60";
const labelCls =
  "block text-[10px] uppercase tracking-wider font-semibold text-muted mb-1";

export interface VariantFormRow {
  id?: number;
  label: string;
  weight_grams: string;
  sku: string;
  price: string;
  compare_at_price: string;
  stock: string;
  is_default: boolean;
}

/* The host form must expose a `variants` array of VariantFormRow. */
export interface VariantsFormShape {
  variants: VariantFormRow[];
}

export const emptyVariant = (): VariantFormRow => ({
  label: "",
  weight_grams: "",
  sku: "",
  price: "",
  compare_at_price: "",
  stock: "",
  is_default: false,
});

export default function VariantsEditor<T extends VariantsFormShape>({
  control,
  register,
  errors,
  buildSku,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  /* Optional SKU suggestion for freshly added rows. */
  buildSku?: (row: VariantFormRow, index: number) => string;
}) {
  const { symbol } = useMoney();
  /* eslint-disable @typescript-eslint/no-explicit-any -- generic field-array paths */
  const { fields, append, remove, update } = useFieldArray<any>({
    control: control as any,
    name: "variants",
  });

  const rows = fields as unknown as FieldArrayWithId<VariantsFormShape, "variants">[];
  const reg = register as any;
  const variantErrors = (errors as any)?.variants;
  const rowError = (i: number, key: keyof VariantFormRow): string | undefined =>
    variantErrors?.[i]?.[key]?.message;

  const setDefault = (index: number) => {
    rows.forEach((row, i) => {
      update(i, { ...(row as unknown as VariantFormRow), is_default: i === index });
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold uppercase tracking-wide text-charcoal">
          Variants &amp; Pricing
        </h2>
        <button
          type="button"
          onClick={() => {
            const next = emptyVariant();
            append({
              ...next,
              sku: buildSku ? buildSku(next, rows.length) : "",
              is_default: rows.length === 0,
            } as any);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream text-xs font-semibold text-charcoal/80 hover:border-accent hover:text-accent transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Variant
        </button>
      </div>
      <p className="text-[11px] text-muted mb-5">
        Each size or pack is a variant with its own SKU, price and stock. The
        starred one is shown by default on the storefront.
      </p>

      {typeof variantErrors?.message === "string" && (
        <p className="text-[11px] text-rose-600 mb-4">{variantErrors.message}</p>
      )}
      {typeof variantErrors?.root?.message === "string" && (
        <p className="text-[11px] text-rose-600 mb-4">{variantErrors.root.message}</p>
      )}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center border border-dashed border-cream rounded-xl">
            No variants yet — add at least one.
          </p>
        ) : (
          rows.map((field, index) => {
            const row = field as unknown as VariantFormRow;
            return (
              <div
                key={field.id}
                className={`rounded-xl border p-4 transition ${
                  row.is_default
                    ? "border-accent/60 bg-cream/30"
                    : "border-cream bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Variant {index + 1}
                    {row.is_default && (
                      <span className="ml-2 text-accent">• Default</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDefault(index)}
                      disabled={row.is_default}
                      title={row.is_default ? "Default variant" : "Make default"}
                      aria-label={`Make variant ${index + 1} the default`}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        row.is_default
                          ? "text-accent"
                          : "text-muted/70 hover:text-accent hover:bg-cream"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${row.is_default ? "fill-accent" : ""}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const wasDefault = row.is_default;
                        remove(index);
                        /* Never leave the product without a default variant. */
                        if (wasDefault && rows.length > 1) {
                          const fallback = index === 0 ? 1 : 0;
                          const target = rows[fallback] as unknown as VariantFormRow;
                          update(index === 0 ? 0 : 0, { ...target, is_default: true });
                        }
                      }}
                      disabled={rows.length === 1}
                      title={
                        rows.length === 1
                          ? "A product needs at least one variant"
                          : "Remove variant"
                      }
                      aria-label={`Remove variant ${index + 1}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted/70 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted/70"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <input type="hidden" {...reg(`variants.${index}.id`)} />
                <input type="hidden" {...reg(`variants.${index}.is_default`)} />

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="col-span-2 lg:col-span-2">
                    <label className={labelCls}>Label</label>
                    <input
                      className={inputCls}
                      placeholder="100g Pouch"
                      {...reg(`variants.${index}.label`)}
                    />
                    {rowError(index, "label") && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {rowError(index, "label")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Weight (g)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="100"
                      {...reg(`variants.${index}.weight_grams`)}
                    />
                    {rowError(index, "weight_grams") && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {rowError(index, "weight_grams")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>SKU</label>
                    <input
                      className={inputCls}
                      placeholder="TM-CLS-100"
                      {...reg(`variants.${index}.sku`)}
                    />
                    {rowError(index, "sku") && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {rowError(index, "sku")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Price ({symbol})</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="390"
                      {...reg(`variants.${index}.price`)}
                    />
                    {rowError(index, "price") && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {rowError(index, "price")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Compare-at ({symbol})</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="430"
                      {...reg(`variants.${index}.compare_at_price`)}
                    />
                    {rowError(index, "compare_at_price") && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {rowError(index, "compare_at_price")}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <label className={labelCls}>Stock</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="150"
                      {...reg(`variants.${index}.stock`)}
                    />
                    {rowError(index, "stock") && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {rowError(index, "stock")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
