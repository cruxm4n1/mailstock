import { reasonLabels, type Reason, type ShippingFormValues } from "@/lib/shipping-schema";

type GeneratedEmail = {
  subject: string;
  body: string;
  missing: string[];
  warnings: string[];
};

const templateIntro: Record<Reason, string> = {
  Loan: "Veuillez trouver ci-dessous les détails de la demande d'expédition pour ce prêt.",
  Sale: "Veuillez trouver ci-dessous les détails de la demande d'expédition pour cette vente.",
  Demo: "Veuillez trouver ci-dessous les détails de la demande d'expédition pour cette démo.",
  Gift: "Veuillez trouver ci-dessous les détails de la demande d'expédition pour ce don.",
  Event: "Veuillez trouver ci-dessous les détails de la demande d'expédition pour cet événement.",
  Other: "Veuillez trouver ci-dessous les détails de la demande d'expédition."
};

const templateSubject: Record<Reason, string> = {
  Loan: "DEMANDE D'EXPÉDITION - Prêt",
  Sale: "DEMANDE D'EXPÉDITION - Vente",
  Demo: "DEMANDE D'EXPÉDITION - Démo",
  Gift: "DEMANDE D'EXPÉDITION - Don",
  Event: "DEMANDE D'EXPÉDITION - Événement",
  Other: "DEMANDE D'EXPÉDITION"
};

const clean = (value: string | undefined) => value?.trim() ?? "";

const filledSerialNumbers = (serialNumbers: { value: string }[]) =>
  serialNumbers.map((item) => clean(item.value)).filter(Boolean);

const quantityAsNumber = (quantity: string) => {
  const parsed = Number(clean(quantity));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const fieldLine = (label: string, value: string) => {
  const cleanedValue = clean(value);
  return cleanedValue ? `${label} ${cleanedValue}` : null;
};

const buildSection = (title: string, lines: Array<string | null>) => {
  const visibleLines = lines.filter(Boolean);
  return visibleLines.length ? `${title}\n${visibleLines.join("\n")}` : "";
};

export function getDisplayReason(values: ShippingFormValues) {
  if (values.reason === "Other") {
    return clean(values.otherReason);
  }

  return reasonLabels[values.reason];
}

export function generateShippingEmail(values: ShippingFormValues): GeneratedEmail {
  const missing: string[] = [];
  const warnings: string[] = [];
  const displayReason = getDisplayReason(values);
  const recipientName = clean(values.recipient.name);

  if (!recipientName) missing.push("Nom complet / société du destinataire");
  if (!clean(values.recipient.address)) missing.push("Adresse complète");
  if (!clean(values.recipient.phone)) missing.push("Numéro de téléphone");
  if (!clean(values.recipient.email)) missing.push("Email");
  const parcelCount = quantityAsNumber(values.parcel.parcels);
  const parcelWeights = values.parcel.weights.map((weight) => clean(weight.value));

  if (!parcelCount) missing.push("Nombre de colis");
  if (!parcelWeights.some(Boolean)) missing.push("Poids par colis");
  if (parcelCount && parcelWeights.length < parcelCount) {
    missing.push(`Poids pour ${parcelCount - parcelWeights.length} colis`);
  }
  parcelWeights.forEach((weight, index) => {
    if (!weight && parcelCount && index < parcelCount) {
      missing.push(`Poids du colis n°${index + 1}`);
    }
  });
  if (!values.models.length) missing.push("Au moins un modèle");
  if (!displayReason) missing.push("Motif de l'expédition");
  if (values.reason === "Other" && !clean(values.otherReason)) missing.push("Détail du motif Autre");
  if (values.reason === "Loan" && !clean(values.loanReturnDate)) missing.push("Date de retour prévue");
  if (values.reason === "Event") {
    if (!clean(values.eventName)) missing.push("Nom de l'événement");
    if (!clean(values.eventStartDate)) missing.push("Date de début de l'événement");
    if (!clean(values.eventEndDate)) missing.push("Date de fin de l'événement");
  }

  values.models.forEach((model, index) => {
    const modelLabel = clean(model.modelName) || `modèle n°${index + 1}`;
    const serials = filledSerialNumbers(model.serialNumbers);
    const quantity = quantityAsNumber(model.quantity);

    if (!clean(model.modelName)) missing.push(`Nom du modèle n°${index + 1}`);
    if (!quantity) missing.push(`Quantité pour ${modelLabel}`);
    if (!serials.length) missing.push(`Numéro(s) de série pour ${modelLabel}`);
    if (quantity && quantity > serials.length) {
      warnings.push(
        `La quantité est de ${quantity} pour ${modelLabel}, mais seulement ${serials.length} numéro(s) de série sont renseignés.`
      );
    }
  });

  const warningLines = warnings.map((warning) => `Attention : ${warning}`);
  const subjectReason = displayReason || "Motif manquant";
  const subjectRecipient = recipientName || "Destinataire manquant";
  const subjectBase = values.reason === "Other" ? "DEMANDE D'EXPÉDITION" : templateSubject[values.reason];
  const subject =
    values.reason === "Other"
      ? `${subjectBase} - ${subjectReason} - ${subjectRecipient}`
      : `${subjectBase} - ${subjectRecipient}`;

  const length = clean(values.parcel.length);
  const width = clean(values.parcel.width);
  const height = clean(values.parcel.height);
  const dimensions =
    length && width && height
      ? `${length} x ${width} x ${height} cm`
      : [
          length ? `Longueur : ${length} cm` : null,
          width ? `Largeur : ${width} cm` : null,
          height ? `Hauteur : ${height} cm` : null
        ]
          .filter(Boolean)
          .join(", ");

  const addressParts = [
    clean(values.recipient.address),
    clean(values.recipient.postalCode),
    clean(values.recipient.city),
    clean(values.recipient.country)
  ].filter(Boolean);

  const content = values.models.length
    ? values.models
        .map((model, index) => {
          const modelLabel = clean(model.modelName) || `Nom du modèle manquant n°${index + 1}`;
          const serials = filledSerialNumbers(model.serialNumbers);
          const quantity = clean(model.quantity);
          const quantityNumber = quantityAsNumber(model.quantity);
          const serialText = serials.length ? serials.join(", ") : "";
          const modelWarnings =
            quantityNumber && quantityNumber > serials.length
              ? `\n  Attention : La quantité est de ${quantityNumber}, mais seulement ${serials.length} numéro(s) de série sont renseignés.`
              : "";
          const lines = [
            clean(model.modelName) ? `- Modèle : ${modelLabel}` : null,
            quantity ? `  Quantité : ${quantity}` : null,
            serialText ? `  Numéro(s) de série : ${serialText}` : null
          ].filter(Boolean);

          return lines.length ? `${lines.join("\n")}${modelWarnings}` : "";
        })
        .filter(Boolean)
        .join("\n\n")
    : "";

  const recipientSection = buildSection("Destinataire :", [
    fieldLine("Nom complet / Société :", recipientName),
    addressParts.length ? `Adresse complète : ${addressParts.join(", ")}` : null,
    fieldLine("Téléphone :", values.recipient.phone),
    fieldLine("Email :", values.recipient.email)
  ]);

  const visibleWeights = parcelWeights
    .map((weight, index) => (weight ? `Poids colis n°${index + 1} : ${weight} kg` : null))
    .filter(Boolean);
  const totalWeight = parcelWeights.reduce((total, weight) => {
    const parsed = Number(weight.replace(",", "."));
    return Number.isFinite(parsed) && parsed > 0 ? total + parsed : total;
  }, 0);

  const parcelSection = buildSection("Colis :", [
    fieldLine("Nombre de colis :", values.parcel.parcels),
    ...visibleWeights,
    totalWeight > 0 ? `Poids total : ${totalWeight.toLocaleString("fr-FR")} kg` : null,
    dimensions ? `Dimensions : ${dimensions}` : null
  ]);

  const contentSection = content ? `Contenu :\n${content}` : "";
  const reasonDetails = [
    displayReason,
    values.reason === "Loan" && clean(values.loanReturnDate)
      ? `Date de retour prévue : ${clean(values.loanReturnDate)}`
      : null,
    values.reason === "Gift" ? "Pouvez-vous le retirer du stock ?" : null,
    values.reason === "Event" && clean(values.eventName) ? `Nom de l'événement : ${clean(values.eventName)}` : null,
    values.reason === "Event" && clean(values.eventStartDate)
      ? `Date de début de l'événement : ${clean(values.eventStartDate)}`
      : null,
    values.reason === "Event" && clean(values.eventEndDate)
      ? `Date de fin de l'événement : ${clean(values.eventEndDate)}`
      : null
  ].filter(Boolean);
  const reasonSection = reasonDetails.length ? `Motif de l'expédition :\n${reasonDetails.join("\n")}` : "";
  const additionalSection = buildSection("Informations complémentaires :", [
    fieldLine("Date d'expédition souhaitée :", values.additional.requestedDate),
    fieldLine("Contraintes horaires :", values.additional.timeConstraints),
    fieldLine("Contact sur site :", values.additional.onSiteContact),
    fieldLine("Instructions d'accès spécifiques :", values.additional.accessInstructions),
    fieldLine("Référence interne :", values.additional.internalReference)
  ]);

  const body = `Bonjour,

${templateIntro[values.reason]}

DEMANDE D'EXPÉDITION
${warningLines.length ? `\n${warningLines.join("\n")}` : ""}
${[recipientSection, parcelSection, contentSection, reasonSection, additionalSection].filter(Boolean).join("\n\n")}

Cordialement,`;

  return {
    subject,
    body,
    missing,
    warnings
  };
}
