"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneField from "@/components/common/PhoneField";
import PasswordInput from "@/components/common/PasswordInput";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useStore } from "@/components/public/store";
import { signUpSchema } from "@/schemas/signup.schema";
import { unwrap } from "@/lib/http";

type SignUpValues = z.infer<typeof signUpSchema>;

const SKIN_TYPES = ["Classic", "Spicy", "Sweet & Glazed", "Fusion"] as const;
const SKIN_TYPE_TITLES: Record<(typeof SKIN_TYPES)[number], string> = {
  Classic: "Plain & natural",
  Spicy: "Chili & lime lover",
  "Sweet & Glazed": "Honey glazed fan",
  Fusion: "Adventurous, beetroot & fusion blends",
};

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, showToast } = useStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { choice: "Classic" },
  });
  const selectedSkinType = watch("choice");

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpValues) =>
      unwrap<{ id: string; name: string; email: string; phone: string }>(
        axios.post("/api/sign-up", values)
      ),
    onSuccess: (data, values) => {
      setUser({
        isLoggedIn: true,
        id: data.id,
        firstName: values.f_name,
        lastName: values.l_name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        skinType: values.choice,
      });
      showToast("Welcome to the Thai Mango Circle! Claimed 15% discount.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const onSubmit = (values: SignUpValues) => signUpMutation.mutate(values);

  const handleSocialLogin = (provider: "Google" | "Facebook") => {
    showToast(`${provider} sign-up isn't available yet.`);
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 md:py-20 px-6">
      <div className="max-w-5xl w-full bg-white rounded-[36px] shadow-2xl border border-cream overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual / Brand Column (5 cols) */}
        <div className="lg:col-span-5 relative bg-[#52091E] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          {/* Backdrop glow & imagery */}
          <img
            src="/images/bangkok-mango-beetroot-1.png"
            alt="Thai Mango Membership"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D0514] via-[#52091E]/90 to-transparent"></div>

          <div className="relative z-10">
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-gold block mb-3">
              Join The Thai Mango Circle
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4">
              Begin Your Mango Snacking Journey
            </h2>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Unlock instant member privileges, tailored flavor
              recommendations, birthday gifts, and dedicated concierge
              support.
            </p>
          </div>

          {/* Welcome Privilege Banner */}
          <div className="relative z-10 mt-8 p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-1">
              New Member Gift
            </span>
            <p className="text-xs font-semibold text-white">
              Receive a 15% Welcome Voucher &amp; 100 Reward Points upon
              registration.
            </p>
          </div>
        </div>

        {/* Right Register Form Column (7 cols) */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto max-h-[85vh] no-scrollbar">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-1">
              New Membership
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
              Create Account
            </h1>
            <p className="text-xs text-muted">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-accent font-semibold underline hover:text-charcoal transition"
              >
                Sign In here
              </Link>
            </p>
          </div>

          {/* Register Form */}
          <form id="register-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="reg-firstname"
                  placeholder="Aarav"
                  {...register("f_name")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.f_name && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.f_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="reg-lastname"
                  placeholder="Sharma"
                  {...register("l_name")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.l_name && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.l_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="reg-email"
                  placeholder="aarav@example.com"
                  {...register("email")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Phone Number
                </label>
                <Controller
                  name="ph_no"
                  control={control}
                  render={({ field }) => (
                    <PhoneField
                      id="reg-phone"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputClassName="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                    />
                  )}
                />
                {errors.ph_no && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.ph_no.message}</p>
                )}
              </div>
            </div>

            {/* Flavor Preference Customization Selector */}
            <div className="pt-2">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-charcoal mb-2">
                Select Your Flavor Preference (For Personalized Picks)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="skin-type-selector">
                {SKIN_TYPES.map((type) => {
                  const active = selectedSkinType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      className={
                        active
                          ? "skin-type-btn py-2 px-2 rounded-xl border border-charcoal bg-charcoal text-white text-xs font-semibold text-center"
                          : "skin-type-btn py-2 px-2 rounded-xl border border-cream bg-ivory/50 text-xs font-semibold text-muted hover:border-accent transition text-center"
                      }
                      data-type={type}
                      title={SKIN_TYPE_TITLES[type]}
                      onClick={() => setValue("choice", type)}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Password
                </label>
                <PasswordInput
                  id="reg-password"
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Confirm Password
                </label>
                <PasswordInput
                  id="reg-confirm-password"
                  placeholder="Re-enter password"
                  {...register("confirm_password")}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                {errors.confirm_password && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  id="reg-terms"
                  defaultChecked
                  className="w-4 h-4 mt-0.5 rounded border-cream text-accent focus:ring-accent accent-accent"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-accent underline">
                    Privacy Policy
                  </Link>{" "}
                  and wish to receive tasty mango snack updates.
                </span>
              </label>
            </div>

            <button
              type="submit"
              id="submit-register"
              disabled={signUpMutation.isPending}
              className="w-full py-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center gap-2 group mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>
                {signUpMutation.isPending
                  ? "Creating Account..."
                  : "Create Account & Claim 15% Off"}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream"></div>
            </div>
            <span className="relative bg-white px-4 text-xs text-muted font-medium uppercase tracking-wider">
              Or register with
            </span>
          </div>

          {/* Social Registrations */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-cream hover:border-charcoal hover:bg-cream/40 transition text-xs font-semibold text-charcoal shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-cream hover:border-charcoal hover:bg-cream/40 transition text-xs font-semibold text-charcoal shadow-sm"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
