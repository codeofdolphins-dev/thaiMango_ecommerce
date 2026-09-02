"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "type">;

/**
 * Password input with a show/hide eye toggle (the pattern the login page
 * established). `className` styles the input itself; the wrapper only
 * positions the toggle. Forwards the ref so react-hook-form's
 * `{...register("field")}` spread works unchanged.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={`${className ?? ""} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
          className="p-1 text-muted hover:text-charcoal absolute right-3.5 top-1/2 -translate-y-1/2 transition"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }
);

export default PasswordInput;
