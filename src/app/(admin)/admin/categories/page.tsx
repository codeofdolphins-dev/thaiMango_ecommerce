"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { categorySchema, CategoryValues } from "@/schemas/category.schema";

interface AdminCategory {
  id: number;
  slug: string;
  name_en: string;
  name_th: string;
  cat_id: number | null;
  _count: { products: number };
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5";

async function throwOnError(res: Response) {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.errors?.[0] || body.message || "Something went wrong");
  }
  return body.data;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serverError, setServerError] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async (): Promise<AdminCategory[]> => {
      const res = await fetch("/api/admin/categories");
      return throwOnError(res);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema) });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryValues) => {
      const res = await fetch(
        editingId === null
          ? "/api/admin/categories"
          : `/api/admin/categories/${editingId}`,
        {
          method: editingId === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      return throwOnError(res);
    },
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      return throwOnError(res);
    },
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setServerError("");
    reset({ slug: "", name_en: "", name_th: "" });
    setFormOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setServerError("");
    reset({ slug: cat.slug, name_en: cat.name_en, name_th: cat.name_th });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setServerError("");
  };

  const categories = categoriesQuery.data ?? [];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={
          categoriesQuery.isPending
            ? "Loading…"
            : `${categories.length} product categor${categories.length === 1 ? "y" : "ies"}`
        }
      >
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </PageHeader>

      {formOpen && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink">
              {editingId === null ? "New Category" : "Edit Category"}
            </h2>
            <button
              onClick={closeForm}
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-stone-100 transition flex items-center justify-center"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit((values) => {
              setServerError("");
              saveMutation.mutate(values);
            })}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            <div>
              <label className={labelCls}>Name (English)</label>
              <input className={inputCls} placeholder="Classic Cuts" {...register("name_en")} />
              {errors.name_en && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.name_en.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Name (Thai)</label>
              <input className={inputCls} placeholder="คลาสสิก" {...register("name_th")} />
              {errors.name_th && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.name_th.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input className={inputCls} placeholder="classic-cuts" {...register("slug")} />
              {errors.slug && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.slug.message}</p>
              )}
            </div>
            <div className="sm:col-span-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
              >
                {saveMutation.isPending
                  ? "Saving…"
                  : editingId === null
                    ? "Create Category"
                    : "Save Changes"}
              </button>
              {serverError && (
                <p className="text-sm text-rose-600">{serverError}</p>
              )}
            </div>
          </form>
        </Card>
      )}

      {serverError && !formOpen && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {categoriesQuery.isPending ? (
        <p className="text-sm text-muted py-16 text-center">Loading categories…</p>
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted">
            No categories yet. Create one to start organizing products.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide text-ink">
                    {cat.name_en}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {cat.name_th} • {cat._count.products} product
                    {cat._count.products === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 rounded-lg text-muted hover:text-peach hover:bg-peach-soft transition flex items-center justify-center"
                    aria-label={`Edit ${cat.name_en}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name_en}"?`)) {
                        setServerError("");
                        deleteMutation.mutate(cat.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="w-8 h-8 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center disabled:opacity-50"
                    aria-label={`Delete ${cat.name_en}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted">
                Slug: <code className="text-charcoal">{cat.slug}</code>
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
