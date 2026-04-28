"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { reasonLabels, reasonOptions, type Reason } from "@/lib/shipping-schema";

type ReasonDropdownProps = {
  value: Reason;
  onChange: (value: Reason) => void;
};

export function ReasonDropdown({ value, onChange }: ReasonDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <span className="field-label">Motif</span>
      <button
        type="button"
        className={clsx("field-input flex items-center justify-between text-left", open && "border-primary/70 bg-[#171717]")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span>{reasonLabels[value]}</span>
        <ChevronDown className={clsx("h-4 w-4 text-zinc-500 transition", open && "rotate-180 text-zinc-300")} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-zinc-800 bg-[#151515] shadow-panel">
          <div className="max-h-64 overflow-auto py-1" role="listbox" aria-label="Motif">
            {reasonOptions.map((option) => {
              const selected = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={clsx(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition",
                    selected ? "bg-primary/12 text-zinc-50" : "text-zinc-300 hover:bg-white/[0.055] hover:text-zinc-50"
                  )}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <span>{reasonLabels[option]}</span>
                  {selected ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
