"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import PasswordInput from "@/components/common/PasswordInput";
import { useStore } from "@/components/public/store";
import { unwrap } from "@/lib/http";

/* Token travels in the URL; only the passwords are typed here. */
const newPasswordSchema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

const inputCls =
  "w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition";

function ResetPasswordContent() {
  const router = useRouter();
  const { showToast } = useStore();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
  });

  const resetMutation = useMutation({
    mutationFn: async (values: NewPasswordValues) =>
      unwrap(axios.post("/api/reset-password", { token, ...values })),
    onSuccess: () => {
      showToast("Password reset successfully. Sign in with your new password.");
      router.push("/login");
    },
  });

  return (
    <main className="flex-1 flex items-center justify-center py-16 md:py-24 px-6">
      <div className="max-w-md w-full bg-white rounded-[36px] shadow-2xl border border-cream p-8 md:p-10">
        <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
          Account Recovery
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-charcoal mb-3">
          Choose a New Password
        </h1>

        {!token ? (
          <>
            <p className="text-sm text-muted leading-relaxed mb-8">
              This page needs the reset link from your email. The link may be
              incomplete — or you can request a fresh one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block w-full text-center py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm"
            >
              Request Reset Link
            </Link>
          </>
        ) : (
          <form
            onSubmit={handleSubmit((values) => resetMutation.mutate(values))}
            className="space-y-5 mt-5"
          >
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                New Password
              </label>
              <PasswordInput
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                {...register("new_password")}
                className={inputCls}
              />
              {errors.new_password && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.new_password.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                Confirm New Password
              </label>
              <PasswordInput
                placeholder="Re-enter password"
                autoComplete="new-password"
                {...register("confirm_password")}
                className={inputCls}
              />
              {errors.confirm_password && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {resetMutation.isError && (
              <p className="text-[11px] text-rose-600">
                {resetMutation.error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm disabled:opacity-60"
            >
              {resetMutation.isPending ? "Saving…" : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

/* useSearchParams must live inside a Suspense boundary. */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
