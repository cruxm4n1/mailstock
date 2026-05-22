"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { EmailPreview } from "@/components/EmailPreview";
import { Field } from "@/components/Field";
import { ModelFields } from "@/components/ModelFields";
import { ReasonDropdown } from "@/components/ReasonDropdown";
import { useCopyState } from "@/components/useCopyState";
import { generateShippingEmail } from "@/lib/email-generator";
import {
  defaultShippingValues,
  emptyParcelWeight,
  shippingFormSchema,
  type ShippingFormValues,
  emptyModel
} from "@/lib/shipping-schema";

export function ShippingRequestTool() {
  const [generationNote, setGenerationNote] = useState("");
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: defaultShippingValues,
    mode: "onChange"
  });

  const { register, control, reset } = form;
  const values = useWatch({ control, defaultValue: defaultShippingValues }) as ShippingFormValues;
  const models = useFieldArray({ control, name: "models" });
  const { fields: parcelWeightFields, replace: replaceParcelWeights } = useFieldArray({ control, name: "parcel.weights" });
  const copyState = useCopyState();

  const generated = useMemo(() => generateShippingEmail(values), [values]);
  const reason = values.reason;

  useEffect(() => {
    const requestedCount = Number.parseInt(values.parcel.parcels, 10);
    const parcelCount = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 1;
    const currentWeights = values.parcel.weights ?? [];

    if (currentWeights.length === parcelCount) {
      return;
    }

    replaceParcelWeights(Array.from({ length: parcelCount }, (_, index) => currentWeights[index] ?? emptyParcelWeight()));
  }, [replaceParcelWeights, values.parcel.parcels, values.parcel.weights]);

  const handleGenerate = () => {
    setGenerationNote(
      generated.missing.length
        ? `Généré avec ${generated.missing.length} information(s) manquante(s).`
        : "Généré et prêt à copier."
    );
  };

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-4 flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-zinc-50">Générateur de demande d&apos;expédition</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
              Renseignez les informations d&apos;expédition, puis copiez un email clair en français avec les alertes visibles.
            </p>
            {generationNote ? <p className="mt-2 text-sm font-medium text-primary">{generationNote}</p> : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="primary-button w-full sm:w-auto" type="button" onClick={handleGenerate}>
              <FileText size={16} />
              Générer l&apos;email
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <section className="panel p-4 sm:p-5">
              <h2 className="section-title">Destinataire</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Nom complet / Société" placeholder="Jane Doe / Société Ltd" {...register("recipient.name")} />
                <Field label="Numéro de téléphone" placeholder="+33 6 00 00 00 00" {...register("recipient.phone")} />
                <Field label="Email" placeholder="destinataire@societe.com" type="email" {...register("recipient.email")} />
                <Field label="Pays" placeholder="France" {...register("recipient.country")} />
                <Field className="sm:col-span-2" label="Adresse complète" placeholder="12 rue Exemple" {...register("recipient.address")} />
                <Field label="Code postal" placeholder="75001" {...register("recipient.postalCode")} />
                <Field label="Ville" placeholder="Paris" {...register("recipient.city")} />
              </div>
            </section>

            <section className="panel p-4 sm:p-5">
              <h2 className="section-title">Colis</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="Nombre de colis"
                  inputMode="numeric"
                  min="1"
                  placeholder="1"
                  type="number"
                  {...register("parcel.parcels")}
                />
                {parcelWeightFields.map((field, index) => (
                  <Field
                    key={field.id}
                    label={`Poids colis n°${index + 1} en kg`}
                    inputMode="decimal"
                    min="0"
                    placeholder="4.5"
                    step="0.1"
                    type="number"
                    {...register(`parcel.weights.${index}.value`)}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="Longueur en cm (optionnel)" placeholder="40" type="number" {...register("parcel.length")} />
                <Field label="Largeur en cm (optionnel)" placeholder="30" type="number" {...register("parcel.width")} />
                <Field label="Hauteur en cm (optionnel)" placeholder="20" type="number" {...register("parcel.height")} />
              </div>
            </section>

            <section className="panel p-4 sm:p-5">
              <h2 className="section-title">Contenu</h2>

              <div className="mt-4 space-y-3">
                {models.fields.map((field, index) => (
                  <ModelFields
                    key={field.id}
                    control={control}
                    register={register}
                    modelIndex={index}
                    onRemove={() => models.remove(index)}
                    canRemove={models.fields.length > 1}
                  />
                ))}
                <button className="secondary-button h-9" type="button" onClick={() => models.append(emptyModel())}>
                  <Plus size={15} />
                  Ajouter un modèle
                </button>
              </div>
            </section>

            <section className="panel p-4 sm:p-5">
              <h2 className="section-title">Motif de l&apos;expédition</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="reason"
                  render={({ field }) => <ReasonDropdown value={field.value} onChange={field.onChange} />}
                />
                {reason === "Other" ? (
                  <Field label="Autre motif" placeholder="Préciser le motif de l'expédition" {...register("otherReason")} />
                ) : null}
                {reason === "Loan" ? (
                  <Field label="Date de retour prévue" placeholder="AAAA-MM-JJ" {...register("loanReturnDate")} />
                ) : null}
                {reason === "Event" ? (
                  <>
                    <Field label="Nom de l'événement" placeholder="Nom de l'événement" {...register("eventName")} />
                    <Field label="Date de début de l'événement" placeholder="AAAA-MM-JJ" {...register("eventStartDate")} />
                    <Field label="Date de fin de l'événement" placeholder="AAAA-MM-JJ" {...register("eventEndDate")} />
                  </>
                ) : null}
              </div>
            </section>

            <section className="panel p-4 sm:p-5">
              <h2 className="section-title">Informations complémentaires optionnelles</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="Date d'expédition souhaitée"
                  placeholder="AAAA-MM-JJ"
                  {...register("additional.requestedDate")}
                />
                <Field label="Contraintes horaires" placeholder="Livraison avant 10h" {...register("additional.timeConstraints")} />
                <Field label="Contact sur site" placeholder="Nom, téléphone, email" {...register("additional.onSiteContact")} />
                <Field
                  label="Référence interne / campagne / événement"
                  placeholder="Référence campagne ou PO"
                  {...register("additional.internalReference")}
                />
                <Field
                  className="sm:col-span-2"
                  label="Instructions d'accès spécifiques"
                  placeholder="Quai de livraison, accueil sécurité, badge requis..."
                  multiline
                  {...register("additional.accessInstructions")}
                />
              </div>
            </section>
          </form>

          <EmailPreview
            subject={generated.subject}
            body={generated.body}
            missing={generated.missing}
            warnings={generated.warnings}
            copyState={copyState}
            onReset={() => reset(defaultShippingValues)}
          />
        </div>
      </div>
    </main>
  );
}
