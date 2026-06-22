import { z } from "zod";

export const signatureSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Numele complet este obligatoriu")
    .max(120, "Numele este prea lung"),
  organization: z
    .string()
    .trim()
    .min(2, "Organizația este obligatorie")
    .max(160, "Numele organizației este prea lung"),
  position: z
    .string()
    .trim()
    .max(120, "Funcția este prea lungă")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Adresa de email nu este validă")
    .max(160)
    .optional()
    .or(z.literal("")),
  agreed: z.boolean().refine((value) => value === true, {
    error: "Trebuie să confirmi că ai citit și susții declarația",
  }),
});

export type SignatureFormValues = z.infer<typeof signatureSchema>;
