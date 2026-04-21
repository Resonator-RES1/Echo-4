import { 
    RefineDraftOptions, 
    LoreEntry, 
    VoiceProfile, 
    MemoryAxiom
} from "../../types";
import { callWithInstructor } from "./refine";
import { AuditOutputSchema } from "../../schemas/refinementSchemas";
import { entropyEngine } from "./entropyEngine";

/**
 * MirrorEditor: The high-level logical auditor.
 * Implements the "Mirror Editor" responsibility from the Echo Sovereign blueprint.
 * Generates the high-fidelity refinement report and hallucination checks using a Pro model.
 */
export const MirrorEditor = {
    async generateReport(
        refinedText: string,
        options: RefineDraftOptions,
        activeLore: LoreEntry[],
        activeVoices: VoiceProfile[],
        memoryAxioms: MemoryAxiom[],
        blueprint: any,
        mandate: any,
        reportGenerationConfig: any,
        dynamicLoreThreshold: number
    ): Promise<{
        parsedAudit: any;
        combinedThinking?: string;
    }> {
        const greatnessStandards = options.baselinePillars 
            ? `\n<greatness_standards>\n1. Causality: No logic leaps.\n2. Voice Resonance: No AI Sludge or generic diction.\n3. Subtext: No stating the obvious.\n</greatness_standards>\n` 
            : '';
            
        const auditSystemInstruction = `<role>\nYou are Echo, the Mirror Editor. Your purpose is to provide the high-level Refinement Report. You find Hallucinations, Logic Leaps, and character inconsistencies. You are the final logical gate.\n</role>${greatnessStandards}`;

        const axiomContext = memoryAxioms && memoryAxioms.length > 0 
            ? `\n<Memory_Axioms>\n${memoryAxioms.map(a => `[AXIOM:${a.id}] ${a.axiom}`).join('\n')}\n</Memory_Axioms>\n`
            : '';

        const worldConsistencyContext = `
<World_Anchor_Lore>
${activeLore.map((l: any) => `[${l.title.toUpperCase()}]: ${l.description} | TRUTHS: ${l.foundationalTruths?.join('; ') || 'None'}`).join('\n')}
</World_Anchor_Lore>

<Voice_Anchor_DNA>
${activeVoices.map((v: any) => `[${v.name.toUpperCase()}]: Pattern: ${v.soulPattern} | Motivation: ${v.coreMotivation} | Tensions: ${v.tensionVectors?.map((tv: any) => `${tv.axis}(Perf: ${tv.performance} vs Essence: ${tv.essence})`).join('; ') || 'None'}`).join('\n')}
</Voice_Anchor_DNA>
`;

        const entropyHeuristics = entropyEngine.getEntropyPromptBlock(refinedText);

        const auditPrompt = `<REFINED_TEXT>\n${refinedText}\n</REFINED_TEXT>\n<CONTEXT>\n${worldConsistencyContext}\nFocus Areas: ${options.focusAreas.join(', ')}\nBlueprint: ${JSON.stringify(blueprint)}\nMandate: ${JSON.stringify(mandate)}\n${axiomContext}\n</CONTEXT>\n${entropyHeuristics}\n<TASK>\nYou are the Mirror Editor. Analyze the <REFINED_TEXT> for high-level logical consistency and subtextual depth. 
NOTE: A deterministic parser has already scanned for technical sludge and prohibited mannerisms. Your focus is on the NARRATIVE SOUL and CAUSAL CONTINUITY.

1. LORE COMPLIANCE: Rate 0-10. Does the scene *feel* right according to the world's weight?
2. VOICE FIDELITY: Rate 0-10. Beyond individual words, does the character's motivation align with their DNA?
3. LOGIC GAPS: Identify any causality breaks or emotional jumps.
4. REFINEMENT REPORT: Detailed analysis of the prose quality and atmospheric resonance.
5. STRUCTURAL COMPLIANCE: Analyze the paragraph density and MRU (Motivation-Reaction Unit) fulfillment. If the AI returned a single block of text or failed to break for a new speaker, explicitly flag this in 'conflicts'. Identify if the text adheres to Standard Manuscript Format length caps (max 150 words/para).
6. DIALOGUE AUDIT (EDE v1.0): Scan for "On-the-nose" dialogue. If a character explains their emotion directly ("I am sad"), it is a LOGIC LEAK. Verify characters don't explain lore the other person already knows ("As you know, Bob"). Flag transactional "Hellos" at scene starts.
7. TENSION AUDIT (EDE v2.0): Analyze the friction between character Performance vs Essence. If a character 'cracks' and speaks their truth directly, verify it is justified by high scene pressure/instability. Populate 'tension_audit' for each active voice.
</TASK>`;

        const { parsed: parsedAudit, combinedThinking } = await callWithInstructor({
            model: reportGenerationConfig.model,
            prompt: auditPrompt,
            systemInstruction: auditSystemInstruction,
            temperature: reportGenerationConfig.temperature,
            thinkingConfig: reportGenerationConfig.thinkingConfig,
            onStream: options.onStream,
            isEntropyAudit: true,
            entropyHeuristics: entropyHeuristics
        }, AuditOutputSchema);

        return { 
            parsedAudit, 
            combinedThinking 
        };
    }
};
