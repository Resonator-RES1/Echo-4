import { z } from "zod";
import { PreFlightOutputSchema, NarrativeAlignmentOutputSchema } from "../../schemas/refinementSchemas";
import { LoreEntry, VoiceProfile, RefineDraftOptions, MemoryAxiom } from "../../types";
import { callAiApi } from "./api";
import { zodToGeminiSchema } from "../../utils/zodToGemini";

export const AlignmentNexusSchema = z.object({
    preFlight: PreFlightOutputSchema,
    alignment: NarrativeAlignmentOutputSchema
});

export type AlignmentNexusOutput = z.infer<typeof AlignmentNexusSchema>;

/**
 * AlignmentNexus: Consolidates Pre-Flight Analysis and Strategic Alignment
 * into a single high-density inference pass to reduce network round-trips.
 */
export const AlignmentNexus = {
    async execute(
        draft: string,
        loreEntries: LoreEntry[],
        voiceProfiles: VoiceProfile[],
        options: RefineDraftOptions,
        memoryAxioms: MemoryAxiom[] = [],
        model: string = 'gemini-3.1-flash-lite-preview'
    ): Promise<AlignmentNexusOutput> {
        const textForAnalysis = String(draft || '').substring(0, 3000);
        
        const contextList = [
            ...loreEntries.map(l => `[LORE:${l.id}] ${l.title}: ${String(l.description || '').substring(0, 100)}`),
            ...voiceProfiles.map(v => `[VOICE:${v.id}] ${v.name}: ${String(v.soulPattern || '').substring(0, 100)}`),
            ...memoryAxioms.map(a => `[AXIOM:${a.id}] Type: ${a.type} | Rule: ${a.axiom}`)
        ].join('\n');

        const prompt = `
Analyze the following draft and perform the SOVEREIGN ALIGNMENT NEXUS pass.
This is a dual-objective audit: Pre-Flight Scoping and Strategic Alignment.

<TASK_1: PRE-FLIGHT_SCOPING>
1. Classify Narrative Density: Determine if the text is primarily "action", "dialogue", or "exposition".
2. Semantic Anchoring: Identify which Lore, Voice, or Axiom IDs from the AVAILABLE CONTEXT are relevant to this text.

<TASK_2: STRATEGIC_ALIGNMENT>
1. CONTEXT LEAK DETECTION: Identify where the draft is making assumptions NOT supported by context.
2. SEMANTIC DRIFT RISK: Identify characters drifting from their Soul Pattern.
3. SLUDGE PROPENSITY: Identify generic or AI-optimized prose.
4. CAUSALITY CHECK: Identify logical gaps in narrative flow.

DRAFT:
"${textForAnalysis}"

AVAILABLE CONTEXT:
${contextList}

Return a single JSON object matching the requested schema. Ensure the alignment object provides a deep diagnostic blueprint and a mechanical mandate for the next rendering pass.
`;

        try {
            const response = await callAiApi({
                model,
                prompt,
                systemInstruction: "You are the Sovereign Alignment Nexus. Your goal is to anchor the narrative to its lore while unveiling the strategic blueprint needed for high-fidelity refinement.",
                responseSchema: zodToGeminiSchema(AlignmentNexusSchema),
                temperature: 0.2
            });

            const rawData = JSON.parse(response.text || '{}');
            return AlignmentNexusSchema.parse(rawData);
        } catch (e) {
            console.error("Alignment Nexus Critical Failure:", e);
            // Fallback object to prevent graph crash
            return {
                preFlight: { density: { primary: 'exposition', segments: [] }, semantic: { loreIds: [], voiceIds: [], axiomIds: [] } },
                alignment: { 
                    blueprint: { chapterArc: 'Error state', tonalSignature: 'Unstable', foreshadowingNotes: 'Check logs', priorityFocus: 'Critical Failure' },
                    mandate: { axioms: [], objectives: [], guardrails: [] }
                }
            };
        }
    }
};
