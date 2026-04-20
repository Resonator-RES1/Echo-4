import { 
    RefineDraftOptions, 
    LoreEntry, 
    VoiceProfile, 
    MemoryAxiom, 
    EntropyMetrics 
} from "../../types";
import { callWithInstructor } from "./refine";
import { AuditOutputSchema } from "../../schemas/refinementSchemas";
import { INTENSITY_CONFIG } from "../../constants/polishDepth";
import { entropyEngine } from "./entropyEngine";
import { injectGritIntoAudit } from "./gritEngine";
import { SovereignEngine } from "./SovereignEngine";
import { NegativeVetoUtility } from "./NegativeVetoUtility";

/**
 * AuditEngine: Conducts adversarial diagnostics on refined prose.
 * Captures distortions, style erosion, and AI sludge using both 
 * LLM reasoning and deterministic entropy heuristics.
 */
export const AuditEngine = {
    async performAudit(
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
        needsHealing: boolean;
        entropyMetrics?: EntropyMetrics;
        combinedThinking?: string;
    }> {
        const greatnessStandards = options.baselinePillars 
            ? `\n<greatness_standards>\n1. Causality: No logic leaps.\n2. Voice Resonance: No AI Sludge or generic diction.\n3. Subtext: No stating the obvious.\n</greatness_standards>\n` 
            : '';
            
        const auditSystemInstruction = `<role>\nYou are Echo, the Sovereign Adversary and Auditor. Your singular purpose is to find DISTORTIONS, Hallucinations, and Style Erosion in the provided prose. You are not a cheerleader; you are a cynical gatekeeper of authorial intent.\n</role>${greatnessStandards}`;

        const axiomContext = memoryAxioms && memoryAxioms.length > 0 
            ? `\n<Memory_Axioms>\n${memoryAxioms.map(a => `[AXIOM:${a.id}] ${a.axiom}`).join('\n')}\n</Memory_Axioms>\n`
            : '';

        const worldConsistencyContext = `
<World_Anchor_Lore>
${activeLore.map((l: any) => `[${l.title.toUpperCase()}]: ${l.description} | TRUTHS: ${l.foundationalTruths?.join('; ') || 'None'}`).join('\n')}
</World_Anchor_Lore>

<Voice_Anchor_DNA>
${activeVoices.map((v: any) => `[${v.name.toUpperCase()}]: Pattern: ${v.soulPattern} | Motivation: ${v.coreMotivation} | Prohibited: ${v.antiMannerisms?.join(', ') || 'None'}`).join('\n')}
</Voice_Anchor_DNA>
`;

        const entropyHeuristics = entropyEngine.getEntropyPromptBlock(refinedText);

        const auditPrompt = `<REFINED_TEXT>\n${refinedText}\n</REFINED_TEXT>\n<CONTEXT>\n${worldConsistencyContext}\nFocus Areas: ${options.focusAreas.join(', ')}\nBlueprint: ${JSON.stringify(blueprint)}\nMandate: ${JSON.stringify(mandate)}\n${axiomContext}Previous Echoes (Stylistic Markers): ${JSON.stringify((options.previousEchoes || []).slice(0, 3).map(e => ({ title: e.title, summary: e.summary, metrics: e.metrics, analysis: e.analysis })))}\n${options.isReRefinement ? `\n*** RE-REFINEMENT AUDIT MODE ACTIVE ***\nPrevious Internal Critique: ${options.previousInternalCritique}\nYou MUST perform an 'evolution_audit' comparing this pass to the previous state. Assess if the previous critique was effectively addressed.` : ''}\n</CONTEXT>\n${entropyHeuristics}\n<TASK>\nPerform a RUTHLESS ADVERSARIAL AUDIT of the <REFINED_TEXT>.\n\n1. HALLUCINATION & DRIFT DETECTION (CRITICAL):\n   - Compare every claim in <REFINED_TEXT> against the <World_Anchor_Lore> and <Memory_Axioms>.\n   - Does the prose introduce features, capabilities, or facts that contradict the context or the Axioms? \n   - Identify any "Semantic Noise" where the AI is making assumptions not present in the lore.\n   \n2. VOICE INTEGRITY & SLUDGE SCAN:\n   - Audit against <Voice_Anchor_DNA>. Identify any lines where character behavior "softens" into generic AI tropes.\n   - SLUDGE DETECTION: Identify words like "beacon," "tapestry," "dance of," "symphony," or clinical sentence structures. This is a binary failure of the Archivist persona.\n   \n3. NARRATIVE ENTROPY:\n   - Analyze the longitudinal stability. Is the style 'fuzzier' or 'cleaner' than the [Previous Echoes]? Identify drift away from the author's established jaggedness.\n   \n4. THEMATIC RESONANCE:\n   - Evaluate against the [Chapter Arc] and [Tonal Signature]. If the mandate was "Grim" and the text is "Hopeful," it is a DISTORTION.\n   \n5. Generate PROSE METRICS [Scale 0-10]. All scores REQUIRE a detailed diagnostic rationale.\n\n6. MANDATORY: Fill the axiom_collisions and conflicts fields if you find even a subtle leak.\n\n7. EVOLUTION CHECK (If Re-Refinement):\n   - Explicitly evaluate if the previous internal critique was addressed. Return results in the 'evolution_audit' field.\n\n8. ENTROPY AUDIT: Populate entropy_metrics based on the <Entropy_Heuristics_Laboratory> findings.\n</TASK>`;

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

        // Grit pass
        const { isGritFailed } = injectGritIntoAudit(parsedAudit, refinedText);

        // Entropy heuristics pass
        const stats = entropyEngine.calculateHeuristics(refinedText);
        const isPro = SovereignEngine.isProModel(options.generationConfig?.model);
        
        // Deterministic Veto Pass
        const vetoResults = NegativeVetoUtility.check(refinedText);
        if (vetoResults.failed) {
            parsedAudit.conflicts.push(...vetoResults.violations.map(v => ({
                sentence: "Negative Mandate Violation",
                reason: v
            })));
        }

        // Stricter thresholds for Pro Models
        const burstinessThreshold = isPro ? 10.0 : 4.5;
        const isEntropyFailed = stats.ttr < 0.6 || stats.sigma < burstinessThreshold || stats.polarityScore < 0.8;

        // Failure detection logic
        const isMandateViolated = (parsedAudit.conflicts && parsedAudit.conflicts.length > 0) || vetoResults.failed;
        const isLoreFailed = parsedAudit.audit && parsedAudit.audit.loreCompliance < dynamicLoreThreshold;
        const isVoiceFailed = parsedAudit.audit && (parsedAudit.audit.voiceFidelityScore < 7.0 || parsedAudit.audit.voiceAdherence < 7.0);
        const isAxiomViolated = parsedAudit.axiom_collisions && parsedAudit.axiom_collisions.length > 0;
        const isSludgeDetected = (parsedAudit.narrative_entropy && parsedAudit.narrative_entropy.sludge_score > 6.0) || (parsedAudit.entropy_metrics && parsedAudit.entropy_metrics.sludge_density > 0.3);

        const needsHealing = options.healingLoopActive !== false && (
            isMandateViolated || 
            isLoreFailed || 
            isVoiceFailed || 
            isAxiomViolated || 
            isSludgeDetected || 
            isGritFailed || 
            (isEntropyFailed && (options.feedbackDepth === 'in-depth' || isPro))
        );

        return { 
            parsedAudit, 
            needsHealing,
            entropyMetrics: parsedAudit.entropy_metrics,
            combinedThinking 
        };
    }
};
