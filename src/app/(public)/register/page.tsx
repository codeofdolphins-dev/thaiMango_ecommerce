"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/components/public/store";

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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedSkinType, setSelectedSkinType] =
    useState<(typeof SKIN_TYPES)[number]>("Classic");

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Passwords do not match. Please check.");
      return;
    }

    const first = firstName.trim() || "Valued";
    const last = lastName.trim() || "Member";
    const emailValue = email.trim() || "member@thaimango.com";
    const phoneValue = phone.trim() || "+91 98765 43210";

    const newUser = {
      isLoggedIn: true,
      firstName: first,
      lastName: last,
      name: `${first} ${last}`,
      email: emailValue,
      phone: phoneValue,
      skinType: selectedSkinType,
      tier: "Gold Member",
      points: 580,
      memberSince: "2026",
    };

    setUser(newUser);
    showToast("Welcome to the Thai Mango Circle! Claimed 15% discount.");
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
          <form id="register-form" className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="reg-firstname"
                  required
                  placeholder="Aarav"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="reg-lastname"
                  required
                  placeholder="Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
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
                  required
                  placeholder="aarav@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="reg-phone"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
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
                      onClick={() => setSelectedSkinType(type)}
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
                <input
                  type="password"
                  id="reg-password"
                  required
                  placeholder="Minimum 8 characters"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="reg-confirm-password"
                  required
                  placeholder="Re-enter password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-cream bg-ivory/30 text-sm focus:outline-none focus:border-accent focus:bg-white transition"
                />
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
              className="w-full py-4 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all duration-300 shadow-md flex items-center justify-center gap-2 group mt-4"
            >
              <span>Create Account &amp; Claim 15% Off</span>
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
