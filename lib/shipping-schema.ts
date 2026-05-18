import { z } from "zod";

export const reasonOptions = ["Loan", "Sale", "Demo", "Gift", "Event", "Other"] as const;
export const reasonLabels: Record<(typeof reasonOptions)[number], string> = {
  Loan: "Prêt",
  Sale: "Vente",
  Demo: "Démo",
  Gift: "Don",
  Event: "Événement",
  Other: "Autre"
};

export const parcelWeightSchema = z.object({
  value: z.string()
});

export const serialNumberSchema = z.object({
  value: z.string()
});

export const modelSchema = z.object({
  modelName: z.string(),
  quantity: z.string(),
  serialNumbers: z.array(serialNumberSchema)
});

export const shippingFormSchema = z.object({
  recipient: z.object({
    name: z.string(),
    address: z.string(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string(),
    phone: z.string(),
    email: z.string()
  }),
  parcel: z.object({
    parcels: z.string(),
    weights: z.array(parcelWeightSchema),
    length: z.string(),
    width: z.string(),
    height: z.string()
  }),
  models: z.array(modelSchema),
  reason: z.enum(reasonOptions),
  otherReason: z.string(),
  loanReturnDate: z.string(),
  eventName: z.string(),
  eventStartDate: z.string(),
  eventEndDate: z.string(),
  additional: z.object({
    requestedDate: z.string(),
    timeConstraints: z.string(),
    onSiteContact: z.string(),
    accessInstructions: z.string(),
    internalReference: z.string()
  })
});

export type ShippingFormValues = z.infer<typeof shippingFormSchema>;
export type Reason = (typeof reasonOptions)[number];

export const emptyParcelWeight = (): ShippingFormValues["parcel"]["weights"][number] => ({
  value: ""
});

export const emptyModel = (): ShippingFormValues["models"][number] => ({
  modelName: "",
  quantity: "1",
  serialNumbers: [{ value: "" }]
});

export const defaultShippingValues: ShippingFormValues = {
  recipient: {
    name: "",
    address: "",
    postalCode: "",
    city: "",
    country: "",
    phone: "",
    email: ""
  },
  parcel: {
    parcels: "1",
    weights: [emptyParcelWeight()],
    length: "",
    width: "",
    height: ""
  },
  models: [emptyModel()],
  reason: "Loan",
  otherReason: "",
  loanReturnDate: "",
  eventName: "",
  eventStartDate: "",
  eventEndDate: "",
  additional: {
    requestedDate: "",
    timeConstraints: "",
    onSiteContact: "",
    accessInstructions: "",
    internalReference: ""
  }
};
