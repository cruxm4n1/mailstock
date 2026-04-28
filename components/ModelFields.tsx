"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { Field } from "@/components/Field";
import type { ShippingFormValues } from "@/lib/shipping-schema";

type ModelFieldsProps = {
  control: Control<ShippingFormValues>;
  register: UseFormRegister<ShippingFormValues>;
  modelIndex: number;
  onRemove: () => void;
  canRemove: boolean;
};

export function ModelFields({ control, register, modelIndex, onRemove, canRemove }: ModelFieldsProps) {
  const serials = useFieldArray({
    control,
    name: `models.${modelIndex}.serialNumbers`
  });

  return (
    <div className="rounded-lg border border-line bg-white/[0.035] p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-100">Modèle {modelIndex + 1}</h3>
        <button className="danger-button" type="button" onClick={onRemove} disabled={!canRemove}>
          <Trash2 size={15} />
          Supprimer
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <Field label="Nom du modèle" placeholder="MacBook Pro 14 M3" {...register(`models.${modelIndex}.modelName`)} />
        <Field
          label="Quantité"
          inputMode="numeric"
          min="1"
          placeholder="1"
          type="number"
          {...register(`models.${modelIndex}.quantity`)}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-200">Numéros de série</p>
          <button
            className="secondary-button h-9"
            type="button"
            onClick={() => serials.append({ value: "" })}
          >
            <Plus size={15} />
            Ajouter un numéro
          </button>
        </div>

        {serials.fields.map((field, serialIndex) => (
          <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Field
              label={`Numéro de série ${serialIndex + 1}`}
              placeholder="SN123456789"
              {...register(`models.${modelIndex}.serialNumbers.${serialIndex}.value`)}
            />
            <button
              className="danger-button self-end"
              type="button"
              onClick={() => serials.remove(serialIndex)}
              disabled={serials.fields.length === 1}
              aria-label={`Supprimer le numéro de série ${serialIndex + 1}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
