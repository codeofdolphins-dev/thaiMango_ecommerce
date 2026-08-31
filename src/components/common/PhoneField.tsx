"use client";

import { useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import {
  COUNTRY_CODES,
  countryByIso,
  formatPhone,
  parsePhone,
} from "@/lib/countryCodes";
import { publicCompactSelectStyles } from "@/components/public/selectStyles";

interface DialOption {
  value: string;
  label: string;
  dial: string;
  flag: string;
  name: string;
}

const OPTIONS: DialOption[] = COUNTRY_CODES.map((c) => ({
  value: c.iso,
  label: `${c.flag} ${c.dial}`,
  dial: c.dial,
  flag: c.flag,
  name: c.name,
}));

const publicDialStyles = publicCompactSelectStyles<DialOption>();

/* Admin portal: stone borders, peach focus — matches adminSelectStyles. */
const adminPhoneSelectStyles: StylesConfig<DialOption, false> = {
  ...publicDialStyles,
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "0.75rem",
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#F29F86" : "rgba(231, 229, 228, 0.7)",
    boxShadow: "none",
    fontSize: "0.875rem",
    "&:hover": { borderColor: "#F29F86" },
  }),
};

export interface PhoneFieldProps {
  /** Combined value, e.g. "+91 98765 43210". */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  variant?: "public" | "admin";
  inputClassName?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

/**
 * Country dial code + national number, stored and emitted as one string so the
 * API contract (a single `phone` field) stays unchanged.
 */
export default function PhoneField({
  value,
  onChange,
  onBlur,
  variant = "public",
  inputClassName,
  placeholder = "98765 43210",
  required,
  id,
  disabled,
}: PhoneFieldProps) {
  const { iso, number } = useMemo(() => parsePhone(value), [value]);
  const selected = OPTIONS.find((o) => o.value === iso) ?? OPTIONS[0];

  const defaultInputCls =
    variant === "admin"
      ? "w-full px-4 py-2.5 rounded-xl border border-stone-200/70 bg-white text-sm focus:outline-none focus:border-peach transition placeholder:text-muted/60"
      : "w-full px-4 py-3.5 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition";

  return (
    <div className="flex gap-2">
      <div className="w-[120px] shrink-0">
        <Select<DialOption>
          instanceId={id ? `${id}-dial` : "phone-dial"}
          options={OPTIONS}
          value={selected}
          isDisabled={disabled}
          onChange={(opt) => onChange(formatPhone(opt?.value ?? iso, number))}
          onBlur={onBlur}
          styles={variant === "admin" ? adminPhoneSelectStyles : publicDialStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          aria-label="Country dialling code"
          formatOptionLabel={(opt, meta) =>
            meta.context === "menu" ? (
              <span className="flex items-center gap-2">
                <span>{opt.flag}</span>
                <span className="flex-1 truncate">{opt.name}</span>
                <span className="text-muted">{opt.dial}</span>
              </span>
            ) : (
              <span>
                {opt.flag} {opt.dial}
              </span>
            )
          }
        />
      </div>
      <input
        type="tel"
        id={id}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={number}
        onChange={(e) => {
          /* Keep digits and the usual separators only. */
          const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
          onChange(formatPhone(iso, cleaned));
        }}
        onBlur={onBlur}
        className={inputClassName ?? defaultInputCls}
        aria-label={`Phone number, ${countryByIso(iso).name}`}
      />
    </div>
  );
}
