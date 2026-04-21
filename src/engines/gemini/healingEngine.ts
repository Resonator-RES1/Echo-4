import { RefineDraftOptions, RefinedVersion } from "../../types";

/**
 * HealingEngine: Generates tactical directives for fixing failures 
 * detected during the Audit phase.
 * IMPLEMENTS THE ECHO SOVEREIGN BLUEPRINT:
 * "The Surgical Healing Loop"
 */
export const HealingEngine = {
    generateDirectives(state: any): string {
        const { parsedAudit, entropyMetrics } = state;
        let directives = '';

        // 1. Axiom Fixes (Logical Integrity)
        if (parsedAudit.axiom_collisions && parsedAudit.axiom_collisions.length > 0) {
            directives += `\n<LOGICAL_INTEGRITY_REPAIR>\nThe previous refinement failed Hallucination Gates. You MUST rectify these specific contradictions:\n${parsedAudit.axiom_collisions.map((c: any) => `- [RULE]: ${c.axiomSummary}\n  [VIOLATION]: ${c.violationSnippet}\n  [DIAGNOSTIC]: ${c.diagnostic}`).join('\n')}\n</LOGICAL_INTEGRITY_REPAIR>\n`;
        }

        // 2. Mathematical Style Mandates (DSE Physics)
        if (entropyMetrics) {
            let mathMandates = '';
            
            if (entropyMetrics.sigma < 8.0) {
                mathMandates += `- [PHYSICS_MANDATE]: Rhythmic Failure (AI Metronome). Rewrite problematic paragraphs. Ensure sentence lengths vary by at least 15 words between adjacent sentences.\n`;
            }
            
            if (entropyMetrics.entropy_score < 0.8) {
                mathMandates += `- [PHYSICS_MANDATE]: Winston Polarity Failure. Every sentence longer than 20 words MUST be followed by a sentence shorter than 5 words.\n`;
            }

            if (mathMandates) {
                directives += `\n<MATHEMATICAL_STYLE_MANDATES>\n${mathMandates}</MATHEMATICAL_STYLE_MANDATES>\n`;
            }
        }

        // 3. Block-Specific Vetoes
        if (entropyMetrics?.entropy_map) {
            const failBlocks = entropyMetrics.entropy_map.filter((s: any) => s.entropy_score < 0.5);
            if (failBlocks.length > 0) {
                directives += `\n<SURGICAL_PACKET_FAILURES>\n${failBlocks.map((s: any, idx: number) => `### BLOCK FAIL #${idx + 1}:\n[TEXT]: "${s.text}"\n[VIOLATION]: ${s.violation}\n[MANDATE]: ${s.fix_suggestion || "Apply Winston Polarity and Noun-Anchor lock."}`).join('\n')}\n</SURGICAL_PACKET_FAILURES>\n`;
            }
        }

        return directives;
    }
};
