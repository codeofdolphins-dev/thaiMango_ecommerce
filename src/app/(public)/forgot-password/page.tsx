"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { forgetPasswordSchema } from "@/schemas/password.schema";
import { unwrap } from "@/lib/http";

type ForgotValues = z.infer<typeof forgetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const forgotMutation = useMutation({
    mutationFn: async (values: ForgotValues) =>
      unwrap(axios.post("/api/forget-password", values)).then(() => values.email),
    onSuccess: (email) => setSentTo(email),
  });

  return (
    <main className="flex-1 flex items-center justify-center py-16 md:py-24 px-6">
      <div className="max-w-md w-full bg-white rounded-[36px] shadow-2xl border border-cream p-8 md:p-10">
        {sentTo ? (
          <div className="text-center">
            <MailCheck className="w-10 h-10 text-accent mx-auto mb-4 stroke-[1.5]" />
            <h1 className="font-serif text-2xl md:text-3xl text-charcoal mb-3">
              Check Your Email
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-8">
              If an account exists for <strong className="text-charcoal">{sentTo}</strong>,
              we&apos;ve sent a link to reset your password. The link is valid
              for 30 minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-accent hover:text-charcoal transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
              Account Recovery
            </span>
            <h1 className="font-serif text-2xl md:text-3xl text-charcoal mb-3">
              Forgot Password
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-8">
              Enter the email you signed up with and we&apos;ll send you a link
              to choose a new password.
            </p>

            <form
              onSubmit={handleSubmit((values) => forgotMutation.mutate(values))}
              className="space-y-5"
            >
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {forgotMutation.isError && (
                <p className="text-[11px] text-rose-600">
                  {forgotMutation.error.message}
                </p>
              )}

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="w-full py-3.5 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition shadow-sm disabled:opacity-60"
              >
                {forgotMutation.isPending ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted hover:text-accent transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
