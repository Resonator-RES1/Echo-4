import { RefineDraftOptions, RefinedVersion } from "../../types";

/**
 * HealingEngine: Generates tactical directives for fixing failures 
 * detected during the Audit phase.
 */
export const HealingEngine = {
    generateDirectives(state: any): string {
        const { parsedAudit, entropyMetrics } = state;
        let directives = '';

        // 1. Axiom Fixes
        if (parsedAudit.axiom_collisions && parsedAudit.axiom_collisions.length > 0) {
            directives += `\n<AXIOM_VIOLATION_FIX_REQUIRED>\nThe previous refinement failed Hallucination Gates. You MUST rectify these specific contradictions:\n${parsedAudit.axiom_collisions.map((c: any) => `- [RULE]: ${c.axiomSummary}\n  [VIOLATION]: ${c.violationSnippet}\n  [DIAGNOSTIC]: ${c.diagnostic}`).join('\n')}\n</AXIOM_VIOLATION_FIX_REQUIRED>\n`;
        }

        // 2. Sludge Purge
        if (parsedAudit.narrative_entropy && parsedAudit.narrative_entropy.sludge_score > 6.0) {
            directives += `\n<SLUDGE_PURGE_REQUIRED>\nThe previous refinement exhibited high AI Sludge (Score: ${parsedAudit.narrative_entropy.sludge_score}). You MUST purge generic metaphors and clinical sentence structures. Realize the author's unique voice dna in the repair.\n</SLUDGE_PURGE_REQUIRED>\n`;
        }

        // 3. Entropy Veto Fragments
        if (entropyMetrics?.entropy_map) {
            const sludgeSegments = entropyMetrics.entropy_map.filter((s: any) => s.entropy_score < 0.5);
            if (sludgeSegments.length > 0) {
                directives += `\n<ENTROPY_VETO_FRAGMENTS>\nThe Auditor has identified specific segments of high AI predictability (Sludge).\n${sludgeSegments.map((s: any) => `[FRAGMENT ID: ${s.id}]\n[TEXT]: ${s.text}\n[VIOLATION]: ${s.violation}\n[MANDATE]: ${s.fix_suggestion}`).join('\n')}\n</ENTROPY_VETO_FRAGMENTS>\n`;
            }
        }

        return directives;
    }
};
