import type { CSSObjectWithLabel, StylesConfig } from "react-select";

export interface SelectOption {
    value: string;
    label: string;
}

/* Matches the admin input styling: rounded-xl, cream border, accent focus.
   Hex literals mirror the palette-account scope in globals.css — react-select
   builds inline styles, so it cannot read the CSS variables. */
const ACCENT = "#7A1233";
const CREAM = "#EFE9DF";
const CHARCOAL = "#24211E";

export const adminSelectStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
        ...base,
        borderRadius: "0.75rem",
        borderColor: state.isFocused ? ACCENT : CREAM,
        boxShadow: "none",
        minHeight: "42px",
        fontSize: "0.875rem",
        backgroundColor: "#fff",
        "&:hover": { borderColor: ACCENT },
    }),
    option: (base, state) => ({
        ...base,
        fontSize: "0.875rem",
        backgroundColor: state.isSelected
            ? ACCENT
            : state.isFocused
                ? CREAM
                : "#fff",
        color: state.isSelected ? "#fff" : CHARCOAL,
        cursor: "pointer",
    }),
    placeholder: (base) => ({ ...base, color: "rgba(112, 107, 101, 0.6)" }),
    menuPortal: (base) => ({ ...base, zIndex: 60 }),
};

/* Smaller variant for table rows */
export const compactSelectStyles: StylesConfig<SelectOption, false> = {
    ...adminSelectStyles,
    control: (base, state) => ({
        ...(adminSelectStyles.control?.(base, state) as CSSObjectWithLabel),
        minHeight: "34px",
        fontSize: "0.75rem",
        borderRadius: "0.5rem",
    }),
    dropdownIndicator: (base) => ({ ...base, padding: "4px" }),
    valueContainer: (base) => ({ ...base, padding: "0 8px" }),
    indicatorSeparator: () => ({ display: "none" }),
    option: (base, state) => ({
        ...(adminSelectStyles.option?.(base, state) as CSSObjectWithLabel),
        fontSize: "0.75rem",
    }),
};
