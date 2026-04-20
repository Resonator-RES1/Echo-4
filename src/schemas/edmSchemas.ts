import { z } from "zod";

export const EDMAxiomSchema = z.object({
  type: z.enum(['world_rule', 'character_fact', 'historical_event', 'relationship_dynamic']),
  scope: z.enum(['global', 'local']),
  entityIds: z.array(z.string()).describe("The exact IDs of the Lore or Voice entities this axiom derives from."),
  axiom: z.string().describe("A boolean reality constraint or strict rule derived from the raw lore. Must be direct and factual."),
  context: z.string().describe("Sovereign justification for why this axiom exists.").optional()
});

export const EDMSynthesisSchema = z.object({
  axioms: z.array(EDMAxiomSchema).describe("The synthesized list of non-negotiable narrative rules.")
});
