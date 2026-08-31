"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power, Ticket, Trash2, X } from "lucide-react";
import type { z } from "zod";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { couponSchema, CouponValues } from "@/schemas/coupon.schema";

type CouponFormInput = z.input<typeof couponSchema>;

interface AdminCoupon {
  id: number;
  code: string;
  description: string;
  discount_pct: number;
  used: number;
  usage_limit: number;
  expires_at: string;
  is_active: boolean;
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

const couponStatus = (c: AdminCoupon) =>
  !c.is_active || new Date(c.expires_at) < new Date() ? "Expired" : "Active";

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serverError, setServerError] = useState("");

  const couponsQuery = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async (): Promise<AdminCoupon[]> => {
      const res = await fetch("/api/admin/coupons");
      return throwOnError(res);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormInput, unknown, CouponValues>({
    resolver: zodResolver(couponSchema),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CouponValues) => {
      const res = await fetch(
        editingId === null ? "/api/admin/coupons" : `/api/admin/coupons/${editingId}`,
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

  const toggleMutation = useMutation({
    mutationFn: async (c: AdminCoupon) => {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      return throwOnError(res);
    },
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      return throwOnError(res);
    },
    onSuccess: invalidate,
    onError: (error: Error) => setServerError(error.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setServerError("");
    reset({ code: "", description: "", is_active: true });
    setFormOpen(true);
  };

  const openEdit = (c: AdminCoupon) => {
    setEditingId(c.id);
    setServerError("");
    reset({
      code: c.code,
      description: c.description,
      discount_pct: c.discount_pct,
      usage_limit: c.usage_limit,
      expires_at: new Date(c.expires_at),
      is_active: c.is_active,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setServerError("");
  };

  const coupons = couponsQuery.data ?? [];

  return (
    <>
      <PageHeader title="Coupons" subtitle="Discount codes & promotions">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold uppercase tracking-wide shadow-sm shadow-peach/30 hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </PageHeader>

      {formOpen && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold uppercase tracking-wide text-ink">
              {editingId === null ? "New Coupon" : "Edit Coupon"}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <div>
              <label className={labelCls}>Code</label>
              <input className={inputCls} placeholder="MANGO15" {...register("code")} />
              {errors.code && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.code.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Discount (%)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="15"
                {...register("discount_pct")}
              />
              {errors.discount_pct && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.discount_pct.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Usage Limit</label>
              <input
                type="number"
                className={inputCls}
                placeholder="1000"
                {...register("usage_limit")}
              />
              {errors.usage_limit && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.usage_limit.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Expires On</label>
              <input type="date" className={inputCls} {...register("expires_at")} />
              {errors.expires_at && (
                <p className="text-[11px] text-rose-600 mt-1">Enter a valid date</p>
              )}
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Description</label>
              <input
                className={inputCls}
                placeholder="15% off entire order"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.description.message}</p>
              )}
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-peach to-peach-deep text-white text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
              >
                {saveMutation.isPending
                  ? "Saving…"
                  : editingId === null
                    ? "Create Coupon"
                    : "Save Changes"}
              </button>
            </div>
            {serverError && (
              <p className="sm:col-span-2 lg:col-span-4 text-sm text-rose-600">{serverError}</p>
            )}
          </form>
        </Card>
      )}

      {serverError && !formOpen && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-stone-200/70 bg-[#F5F4F1]">
                <th className="font-semibold px-5 py-3.5">Code</th>
                <th className="font-semibold px-5 py-3.5">Description</th>
                <th className="font-semibold px-5 py-3.5">Discount</th>
                <th className="font-semibold px-5 py-3.5">Usage</th>
                <th className="font-semibold px-5 py-3.5">Expires</th>
                <th className="font-semibold px-5 py-3.5">Status</th>
                <th className="font-semibold px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {couponsQuery.isPending ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted text-sm">
                    Loading coupons…
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted text-sm">
                    No coupons yet — create your first discount code.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-peach-soft/30 transition"
                  >
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-ink">
                        <span className="w-7 h-7 rounded-lg bg-peach-soft flex items-center justify-center">
                          <Ticket className="w-3.5 h-3.5 text-peach" />
                        </span>
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{c.description}</td>
                    <td className="px-5 py-4 font-semibold text-peach">{c.discount_pct}%</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-charcoal font-medium text-xs mb-1">
                        {c.used} / {c.usage_limit}
                      </div>
                      <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-peach rounded-full"
                          style={{
                            width: `${Math.min(100, (c.used / c.usage_limit) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.expires_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={couponStatus(c)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setServerError("");
                            toggleMutation.mutate(c);
                          }}
                          disabled={toggleMutation.isPending}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-50 ${
                            c.is_active
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-slate-400 hover:bg-stone-100"
                          }`}
                          aria-label={c.is_active ? `Deactivate ${c.code}` : `Activate ${c.code}`}
                          title={c.is_active ? "Deactivate" : "Activate"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-peach hover:bg-peach-soft transition"
                          aria-label={`Edit ${c.code}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete coupon "${c.code}"?`)) {
                              setServerError("");
                              deleteMutation.mutate(c.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                          aria-label={`Delete ${c.code}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
