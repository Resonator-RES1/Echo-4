import { 
    RefineDraftOptions, 
    EntropyMetrics 
} from "../../types";
import { DeterministicStylisticEngine } from "./DeterministicStylisticEngine";
import { SovereignEngine } from "./SovereignEngine";
import { LexicalEngine } from "../logic/LexicalEngine";

/**
 * AuditEngine: Conducts deterministic diagnostics on refined prose.
 * IMPLEMENTS THE ECHO SOVEREIGN BLUEPRINT:
 * "Audit Engine (Code): Runs the DSE. Does not use AI."
 */
export const AuditEngine = {
    async performAudit(
        refinedText: string,
        options: RefineDraftOptions,
        activeLore: any[] = [],
        activeVoices: any[] = []
    ): Promise<{
        needsHealing: boolean;
        entropyMetrics: EntropyMetrics;
        violations: any[];
        cleanedText: string;
        fidelityScore: {
            burstiness: number;
            noun_ratio: number;
            sludge_hits: number;
            verdict: 'PASS' | 'FAIL';
        };
    }> {
        const dseResult = DeterministicStylisticEngine.analyze(refinedText, activeLore, activeVoices);
        const isPro = SovereignEngine.isProModel(options.generationConfig?.model);
        
        // --- WEAPONIZED LEXICAL PASS ---
        // We take the "Cleaned" text from DSE and replace remaining sludge with "Sovereign" alternatives.
        let weaponizedText = LexicalEngine.weaponize(dseResult.cleanedText || refinedText, activeLore);
        
        // If high-fidelity feedback requested, perform context-aware substitution
        if (options.feedbackDepth === 'in-depth') {
            const contextKeywords = [
                ...(activeLore.map(l => l.title)),
                ...(options.customFocus ? [options.customFocus] : [])
            ];
            weaponizedText = await LexicalEngine.deepGritify(weaponizedText, contextKeywords);
        }

        // Map DSE result to EntropyMetrics
        const entropyMetrics: EntropyMetrics = {
            ttr: dseResult.ttr,
            sigma: dseResult.sigma,
            burstiness: dseResult.sigma, // Alias
            sludge_density: dseResult.sludgeDetected ? 0.8 : 0.1,
            entropy_score: dseResult.polarityScore,
            entropy_map: dseResult.violations.map(v => ({
                text: `Violation at index ${v.sentenceIndex ?? 'N/A'}`,
                entropy_score: v.severity === 'high' ? 0.2 : 0.5,
                violation: v.message,
                fix_suggestion: v.type === 'Rhythmic' ? "Break sentences." : (v.type === 'Lore' ? "Check Fact-Consistency." : "Noun Anchor.")
            }))
        };

        const burstinessThreshold = isPro ? 10.0 : 8.0;
        const isEntropyFailed = dseResult.ttr < 0.6 || dseResult.sigma < burstinessThreshold || dseResult.polarityScore < 0.8 || dseResult.nounAdjectiveRatio < 4.0;
        
        // Needs healing if any stylistic OR semantic failure
        const hasSemanticFail = dseResult.hallucinations.length > 0 || dseResult.voiceViolations.length > 0;
        const needsHealing = dseResult.sludgeDetected || isEntropyFailed || hasSemanticFail;

        return { 
            needsHealing,
            entropyMetrics,
            violations: dseResult.violations,
            cleanedText: weaponizedText,
            fidelityScore: dseResult.fidelityScore
        };
    }
};
