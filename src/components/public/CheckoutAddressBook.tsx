"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, MapPin, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { useStore } from "@/components/public/store";

export interface CheckoutAddress {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SavedAddress extends CheckoutAddress {
  id: number;
  is_default: boolean;
}

const EMPTY_DRAFT: CheckoutAddress = {
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-cream bg-ivory/40 text-sm focus:outline-none focus:border-accent focus:bg-white transition";
const labelCls =
  "block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1";

/** One line summary used on collapsed rows. */
export function formatAddress(a: CheckoutAddress): string {
  return `${a.line1}, ${a.city}, ${a.state} - ${a.pincode}`;
}

export function isAddressComplete(a: CheckoutAddress): boolean {
  return Boolean(a.line1.trim() && a.city.trim() && a.state.trim() && a.pincode.trim());
}

export default function CheckoutAddressBook({
  isLoggedIn,
  recipientName,
  recipientPhone,
  selectedAddressId,
  onSelectAddress,
  draftAddress,
  onDraftAddressChange,
}: {
  isLoggedIn: boolean;
  recipientName: string;
  recipientPhone: string;
  selectedAddressId: number | null;
  onSelectAddress: (id: number | null) => void;
  /** The in-progress address form. Held by the checkout page so an order can
      ship to it directly — no separate "save first" step required. */
  draftAddress: CheckoutAddress;
  onDraftAddressChange: (a: CheckoutAddress) => void;
}) {
  const { showToast } = useStore();
  const queryClient = useQueryClient();

  /* Which accordion panel is expanded: an address id, the new-address form,
     or nothing. Only ever one at a time. */
  const [openPanel, setOpenPanel] = useState<number | "new" | null>(null);

  /* Same cache key the dashboard's Address Book uses, so saving here refreshes
     there and vice versa. */
  const addressesQuery = useQuery({
    queryKey: ["my-addresses"],
    enabled: isLoggedIn,
    queryFn: async (): Promise<SavedAddress[]> => {
      const res = await axios.get("/api/addresses");
      return res.data.data;
    },
  });

  const addresses = addressesQuery.data ?? [];

  /* Land on the default address (or the only one) so a returning shopper can
     go straight to payment without touching this step. Skipped while the
     add-new panel is open — that means the shopper chose to type a fresh one. */
  useEffect(() => {
    if (!isLoggedIn || selectedAddressId !== null || addresses.length === 0) return;
    if (openPanel === "new") return;
    const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
    onSelectAddress(preferred.id);
  }, [isLoggedIn, addresses, selectedAddressId, onSelectAddress, openPanel]);

  /* A shopper with no saved addresses has nothing to pick, so open the form. */
  useEffect(() => {
    if (isLoggedIn && addressesQuery.isSuccess && addresses.length === 0) {
      setOpenPanel("new");
    }
  }, [isLoggedIn, addressesQuery.isSuccess, addresses.length]);

  const addAddress = useMutation({
    mutationFn: async (values: CheckoutAddress): Promise<SavedAddress> => {
      const res = await axios.post("/api/addresses", values);
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      onSelectAddress(created.id);
      onDraftAddressChange(EMPTY_DRAFT);
      setOpenPanel(null);
      showToast("Shipping address saved");
    },
    onError: () => showToast("Could not save that address. Please try again."),
  });

  const setDefault = useMutation({
    mutationFn: async (id: number) => {
      await axios.patch(`/api/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      showToast("Default address updated");
    },
    onError: () => showToast("Could not update the default address."),
  });

  const removeAddress = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/addresses/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      /* Dropping the selected address leaves the step unanswered — clear it so
         the auto-select effect can pick the next one. */
      if (selectedAddressId === id) onSelectAddress(null);
      if (openPanel === id) setOpenPanel(null);
      showToast("Address removed");
    },
    onError: () => showToast("Could not remove that address."),
  });

  /* Guests cannot save an address book, so they get the plain form. */
  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <AddressFields
          value={draftAddress}
          onChange={onDraftAddressChange}
          idPrefix="co"
        />
        <p className="text-[11px] text-muted">
          <a href="/login" className="text-accent font-semibold hover:underline">
            Sign in
          </a>{" "}
          to save this address and reuse it next time.
        </p>
      </div>
    );
  }

  if (addressesQuery.isPending) {
    return (
      <p className="py-8 text-center text-muted text-sm">Loading your addresses…</p>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr) => {
        const selected = selectedAddressId === addr.id;
        const expanded = openPanel === addr.id;
        return (
          <div
            key={addr.id}
            className={`rounded-2xl border transition ${
              selected ? "border-accent bg-ivory/60" : "border-cream bg-white"
            }`}
          >
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => {
                onSelectAddress(addr.id);
                setOpenPanel(expanded ? null : addr.id);
              }}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  selected ? "border-accent bg-accent" : "border-cream"
                }`}
              >
                {selected && <Check className="w-3 h-3 text-white" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-bold text-charcoal truncate">
                    {recipientName || "Shipping address"}
                  </span>
                  {addr.is_default && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-white text-[9px] uppercase font-bold tracking-widest shrink-0">
                      Default
                    </span>
                  )}
                </span>
                <span className="block text-xs text-muted truncate mt-0.5">
                  {formatAddress(addr)}
                </span>
              </span>

              <ChevronDown
                className={`w-4 h-4 text-muted shrink-0 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {expanded && (
              <div className="px-4 pb-4 pt-1 border-t border-cream/70">
                <p className="text-xs text-muted leading-relaxed mb-4">
                  {addr.line1}
                  <br />
                  {addr.city}, {addr.state} - {addr.pincode}
                  {recipientPhone && (
                    <>
                      <br />
                      Phone: {recipientPhone}
                    </>
                  )}
                </p>
                <div className="flex gap-3 text-xs font-semibold">
                  {!addr.is_default && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDefault.mutate(addr.id)}
                        disabled={setDefault.isPending}
                        className="text-accent hover:underline disabled:opacity-50"
                      >
                        Set as default
                      </button>
                      <span className="text-muted/40">•</span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAddress.mutate(addr.id)}
                    disabled={removeAddress.isPending}
                    className="inline-flex items-center gap-1.5 text-muted hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {addresses.length === 0 && (
        <div className="py-8 text-center bg-cream/30 rounded-2xl border border-cream">
          <MapPin className="w-8 h-8 text-muted mx-auto mb-2 stroke-[1.5]" />
          <p className="text-xs text-muted">
            No saved addresses yet — add one below.
          </p>
        </div>
      )}

      {/* Add-new panel, same accordion behaviour as the saved rows */}
      <div
        className={`rounded-2xl border transition ${
          openPanel === "new" ? "border-accent bg-ivory/60" : "border-cream bg-white"
        }`}
      >
        <button
          type="button"
          aria-expanded={openPanel === "new"}
          onClick={() => {
            const opening = openPanel !== "new";
            setOpenPanel(opening ? "new" : null);
            /* Opening the form means "ship somewhere new" — drop the saved
               selection so the typed address is the one the order uses. */
            if (opening) onSelectAddress(null);
          }}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <span className="w-5 h-5 rounded-full border-2 border-cream shrink-0 flex items-center justify-center">
            <Plus className="w-3 h-3 text-accent" />
          </span>
          <span className="flex-1 text-sm font-bold text-charcoal">
            Add a new address
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted shrink-0 transition-transform ${
              openPanel === "new" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openPanel === "new" && (
          <div className="px-4 pb-4 pt-1 border-t border-cream/70 space-y-4">
            <AddressFields
              value={draftAddress}
              onChange={onDraftAddressChange}
              idPrefix="co-new"
            />
            <p className="text-[11px] text-muted">
              You can place your order right away — saving just keeps this
              address in your book for next time.
            </p>
            <button
              type="button"
              onClick={() => addAddress.mutate(draftAddress)}
              disabled={addAddress.isPending || !isAddressComplete(draftAddress)}
              className="px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition disabled:opacity-40"
            >
              {addAddress.isPending ? "Saving…" : "Save & Use This Address"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** The four address inputs, shared by the guest form and the add-new panel. */
function AddressFields({
  value,
  onChange,
  idPrefix,
}: {
  value: CheckoutAddress;
  onChange: (a: CheckoutAddress) => void;
  idPrefix: string;
}) {
  const set = (patch: Partial<CheckoutAddress>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-address`} className={labelCls}>
          Street Address, House/Flat No. *
        </label>
        <input
          type="text"
          id={`${idPrefix}-address`}
          required
          placeholder="Flat 402, Lotus Pavilion, Palm Avenue"
          value={value.line1}
          onChange={(e) => set({ line1: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-city`} className={labelCls}>
            City *
          </label>
          <input
            type="text"
            id={`${idPrefix}-city`}
            required
            placeholder="Mumbai"
            value={value.city}
            onChange={(e) => set({ city: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-state`} className={labelCls}>
            State *
          </label>
          <input
            type="text"
            id={`${idPrefix}-state`}
            required
            placeholder="Maharashtra"
            value={value.state}
            onChange={(e) => set({ state: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-pincode`} className={labelCls}>
            PIN / Postal Code *
          </label>
          <input
            type="text"
            id={`${idPrefix}-pincode`}
            required
            placeholder="400001"
            maxLength={6}
            value={value.pincode}
            onChange={(e) => set({ pincode: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
