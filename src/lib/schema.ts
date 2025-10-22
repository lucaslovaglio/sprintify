import { z } from "zod";

// Schema solo para lo que el AI puede generar (sin source)
const AiGeneratedSchema = z.object({
  isPSA: z.boolean(),
  card: z.object({
    sport: z.string().optional(),
    player: z.string().optional(),
    set: z.string().optional(),
    subset: z.string().nullable().optional(),
    number: z.union([z.string(), z.number()]).nullable().optional(),
    grade: z.string().nullable().optional(),
    certificationNumber: z.union([z.string(), z.number()]).nullable().optional(),
    qualifiers: z.string().nullable().optional(),
    team: z.string().optional(),
    notes: z.string().optional(),
    fullDescription: z.string().optional(),
  }).optional(),
  reason: z.string().optional(),
});

// Schema completo con source (para el resultado final)
export const PsaCardSchema = AiGeneratedSchema.extend({
  source: z.object({
    filename: z.string(),
    mimetype: z.string(),
    size: z.number(),
  }),
});

// Exportamos ambos schemas
export const PsaCardAiSchema = AiGeneratedSchema;
export type PsaCard = z.infer<typeof PsaCardSchema>;