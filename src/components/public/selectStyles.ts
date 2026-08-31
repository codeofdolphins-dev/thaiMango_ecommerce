import type { CSSObjectWithLabel, StylesConfig } from "react-select";

export interface PublicSelectOption {
    value: string;
    label: string;
}

/* Storefront form styling: cream borders, accent focus, ivory field. */
export function publicSelectStyles<T>(): StylesConfig<T, false> {
    return {
        control: (base, state) => ({
            ...base,
            minHeight: "50px",
            borderRadius: "0.75rem",
            backgroundColor: state.isFocused ? "#fff" : "rgba(251, 249, 246, 0.4)",
            borderColor: state.isFocused ? "#F29F86" : "#EDE4DA",
            boxShadow: "none",
            fontSize: "0.875rem",
            "&:hover": { borderColor: "#F29F86" },
        }),
        option: (base, state) => ({
            ...base,
            fontSize: "0.8125rem",
            backgroundColor: state.isSelected
                ? "#F29F86"
                : state.isFocused
                    ? "#FDEDE7"
                    : "#fff",
            color: state.isSelected ? "#fff" : "#241016",
            cursor: "pointer",
        }),
        placeholder: (base) => ({ ...base, color: "rgba(120, 113, 108, 0.6)" }),
        menu: (base) => ({ ...base, zIndex: 60, overflow: "hidden" }),
        menuPortal: (base) => ({ ...base, zIndex: 60 }),
        indicatorSeparator: () => ({ display: "none" }),
        valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    };
}

/** Narrow variant used by the phone dial-code picker. */
export function publicCompactSelectStyles<T>(): StylesConfig<T, false> {
    const base = publicSelectStyles<T>();
    return {
        ...base,
        control: (styles, state) => ({
            ...(base.control?.(styles, state) as CSSObjectWithLabel),
            backgroundColor: "#fff",
        }),
        menu: (styles) => ({ ...styles, width: 260, zIndex: 60 }),
        dropdownIndicator: (styles) => ({ ...styles, padding: "4px 6px" }),
        valueContainer: (styles) => ({ ...styles, padding: "0 8px" }),
    };
}
