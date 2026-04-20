import { LoreEntry, VoiceProfile, RefineDraftOptions, NarrativeBlueprint, MechanicalMandate } from "../../types";
import { callAiApi } from "./api";
import { zodToGeminiSchema } from "../../utils/zodToGemini";
import { NarrativeAlignmentOutputSchema } from "../../schemas/refinementSchemas";

/**
 * AlignmentEngine: Responsible for generating the narrative blueprint and mechanical mandate
 * by detecting context leaks, semantic drift, and logic gaps.
 */
export const AlignmentEngine = {
    async performAlignment(
        draft: string,
        loreEntries: LoreEntry[],
        voiceProfiles: VoiceProfile[],
        options: RefineDraftOptions,
        memoryAxioms: any[] = []
    ): Promise<{ blueprint: NarrativeBlueprint; mandate: MechanicalMandate }> {
        
        let loreContext = '';
        loreEntries.forEach(l => {
            loreContext += `[LORE: ${l.title} (${l.categoryId})] - ${l.description}\n`;
            if (l.domainData && Object.keys(l.domainData).length > 0) {
                loreContext += `  Specifics: ${JSON.stringify(l.domainData)}\n`;
            }
            if (l.foundationalTruths && l.foundationalTruths.length > 0) {
                loreContext += `  Axioms: ${l.foundationalTruths.join(', ')}\n`;
            }
        });

        let voiceContext = '';
        voiceProfiles.forEach(v => {
            voiceContext += `[VOICE: ${v.name}] - Core: ${v.coreMotivation} | Soul: ${v.soulPattern} | Speech: ${v.cognitiveSpeech}\n`;
        });

        const prompt = `
Analyze the following draft and perform a Sovereign Alignment Audit to generate a narrative blueprint AND a mechanical mandate.

DRAFT:
"${String(draft || '').substring(0, 3000)}"

CONTEXT:
${loreContext}
${voiceContext}
Axioms: ${memoryAxioms.map(a => a.axiom).join(' | ')}

<AUDIT_OBJECTIVES>
1. CONTEXT LEAK DETECTION: Identify where the draft is making assumptions about the world or characters that are NOT supported by the <CONTEXT>.
2. SEMANTIC DRIFT RISK: Identify characters whose voices are "flattening" or drifting away from their Soul Pattern.
3. SLUDGE PROPENSITY: Identify areas where the prose is becoming generic or "AI-optimized" (SEO-style).
4. CAUSALITY CHECK: Identify logical gaps in the narrative flow.
</AUDIT_OBJECTIVES>

Return a JSON object:
{
  "blueprint": {
    "chapterArc": "Overarching progression analysis...",
    "tonalSignature": "The specific emotional climate...",
    "foreshadowingNotes": "Context points to preserve/intensify...",
    "priorityFocus": "Identify the MUST-FIX issue (e.g., Semantic Drift in User X)"
  },
  "mandate": {
    "axioms": ["Non-negotiable scene laws based on Lore and detected violations..."],
    "objectives": [{ "p": 1, "t": "Target element", "r": "Diagnostic reasoning" }],
    "guardrails": ["Specific PROHIBITIONS to prevent Sludge and Drift (e.g., 'Do not allow Character Y to apologize')"]
  }
}
`;

        const response = await callAiApi({
            model: 'gemini-3-flash-preview',
            prompt,
            systemInstruction: "You are a Sovereign Archivist. Your goal is to guide the author by revealing narrative patterns, not by asserting clinical correctness.",
            responseSchema: zodToGeminiSchema(NarrativeAlignmentOutputSchema),
            temperature: 0.2
        });

        let parsedBlueprint = JSON.parse(response.text || '{}');
        try {
            parsedBlueprint = NarrativeAlignmentOutputSchema.parse(parsedBlueprint);
        } catch(e) {
            console.warn("Alignment Validator warning:", e);
        }
        return parsedBlueprint;
    }
};
