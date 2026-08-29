"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { useStore } from "@/components/public/store";
import { defaultDemoUser } from "@/lib/site-data";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, showToast } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDemoLogin = () => {
    setEmail(defaultDemoUser.email || "");
    setPassword("mango123");
    showToast("Demo credentials autofilled");
    setTimeout(() => {
      setUser(defaultDemoUser);
      showToast("Welcome back, Aarav!");
      router.push("/dashboard");
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailValue = email.trim() || defaultDemoUser.email || "";
    const user = {
      ...defaultDemoUser,
      email: emailValue,
      name: emailValue.split("@")[0].replace(".", " ").toUpperCase(),
      firstName: emailValue.split("@")[0],
    };
    setUser(user);
    showToast("Sign in successful! Entering Sanctuary...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleSocialLogin = (provider: "Google" | "Facebook") => {
    showToast(`Connecting with ${provider}...`);
    setTimeout(() => {
      const socialUser = {
        isLoggedIn: true,
        firstName: provider === "Google" ? "Aarav" : "Maya",
        lastName: provider === "Google" ? "Sharma" : "Verma",
        name: provider === "Google" ? "Aarav Sharma" : "Maya Verma",
        email:
          provider === "Google"
            ? "aarav.sharma@gmail.com"
            : "maya.verma@facebook.com",
        phone: "+91 98765 43210",
        skinType: "Combination",
        tier: "Gold Member",
        points: 620,
        memberSince: "2026",
      };
      setUser(socialUser);
      showToast(`Signed in with ${provider}! Welcome, ${socialUser.firstName}.`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    }, 500);
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    showToast("Password reset link sent to your email.");
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 md:py-20 px-6">
      <div className="max-w-5xl w-full bg-white rounded-[36px] shadow-2xl border border-cream overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual / Brand Column (5 cols) */}
        <div className="lg:col-span-5 relative bg-[#52091E] text-white p-8 md:p-12 flex flex-col justify-between overflow-hidden">
          {/* Backdrop glow & imagery */}
          <img
            src="/images/bangkok-mango-beetroot-2.png"
            alt="Thai Mango Orchards"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D0514] via-[#52091E]/90 to-transparent"></div>

          <div className="relative z-10">
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-gold block mb-3">
              Thai Mango Circle
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4">
              Welcome Back, Mango Lover
            </h2>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Access your favorite dried mango flavors, order history, loyalty
              rewards, and personalized snack recommendations.
            </p>
          </div>

          {/* Member Perks */}
          <div className="relative z-10 mt-12 pt-8 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>15% Member Discount on all reorders</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>Free Express Delivery, Freshness Sealed</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>Complimentary Festive Gift Box Sampler</span>
            </div>
          </div>
        </div>

        {/* Right Sign In Form Column (7 cols) */}
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-accent font-bold block mb-2">
              Account Login
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
              Sign In to Thai Mango
            </h1>
            <p className="text-xs text-muted">
              Don&apos;t have an account yet?{" "}
              <Link
                href="/register"
                className="text-accent font-semibold underline hover:text-charcoal transition"
              >
                Create an Account
              </Link>
            </p>
          </div>

          {/* Demo Login Quick Autofill Card */}
          <div className="mb-6 p-4 rounded-2xl bg-cream/50 border border-cream flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5B869]/20 text-accent flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-charcoal block">
                  Instant Demo Access
                </span>
                <span className="text-[11px] text-muted">
                  Test the dashboard with one click
                </span>
              </div>
            </div>
            <button
              type="button"
              id="demo-login-btn"
              onClick={handleDemoLogin}
              className="px-4 py-2 bg-charcoal text-white text-[11px] uppercase tracking-wider font-bold rounded-full hover:bg-accent transition shrink-0 shadow-sm"
            >
              Demo Login
            </button>
          </div>

          {/* Login Form */}
          <form id="login-form" className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="login-email"
                  required
                  placeholder="aarav@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-muted absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted">
                  Password
                </label>
                <a
                  href="#"
                  id="forgot-password-link"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-muted hover:text-accent transition"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="p-1 text-muted hover:text-charcoal absolute right-3.5 top-1/2 -translate-y-1/2"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  defaultChecked
                  className="w-4 h-4 rounded border-cream text-accent focus:ring-accent accent-accent"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              id="submit-login"
              className="w-full py-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Sign In to Thai Mango</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream"></div>
            </div>
            <span className="relative bg-white px-4 text-xs text-muted font-medium uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Social Logins */}
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
