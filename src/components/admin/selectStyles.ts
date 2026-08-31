import type { CSSObjectWithLabel, StylesConfig } from "react-select";

export interface SelectOption {
    value: string;
    label: string;
}

/* Matches the admin input styling: rounded-xl, stone border, peach focus */
export const adminSelectStyles: StylesConfig<SelectOption, false> = {
    control: (base, state) => ({
        ...base,
        borderRadius: "0.75rem",
        borderColor: state.isFocused ? "#F29F86" : "rgba(231, 229, 228, 0.7)",
        boxShadow: "none",
        minHeight: "42px",
        fontSize: "0.875rem",
        backgroundColor: "#fff",
        "&:hover": { borderColor: "#F29F86" },
    }),
    option: (base, state) => ({
        ...base,
        fontSize: "0.875rem",
        backgroundColor: state.isSelected
            ? "#F29F86"
            : state.isFocused
                ? "#FDEDE7"
                : "#fff",
        color: state.isSelected ? "#fff" : "#1c1917",
        cursor: "pointer",
    }),
    placeholder: (base) => ({ ...base, color: "rgba(120, 113, 108, 0.6)" }),
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
