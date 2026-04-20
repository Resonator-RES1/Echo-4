/**
 * NegativeVetoUtility: The Deterministic Gatekeeper.
 * Since LLMs cannot understand "Don't", this class performs raw 
 * reality checks on the output to "Force" absence.
 */

export const NegativeVetoUtility = {
    // List of forbidden patterns that the model consistently fails to avoid via prompting
    FORBIDDEN_PATTERNS: [
        { pattern: /\b(tapestry|dance of|beacon|symphony|leveraging|navigate|ontological|echoes of)\b/gi, name: "AI Sludge" },
        { pattern: /\b(ultimately|finally|in summary|testament|lesson learned|meant that)\b/gi, name: "Moralizer" },
        { pattern: /clinical|generic|vague|abstractly/gi, name: "Clinical Tone" }
    ],

    check(text: string): { failed: boolean; violations: string[] } {
        const violations: string[] = [];
        
        for (const rule of this.FORBIDDEN_PATTERNS) {
            const matches = text.match(rule.pattern);
            if (matches) {
                violations.push(`${rule.name} detected: ${matches.join(', ')}`);
            }
        }

        return {
            failed: violations.length > 0,
            violations
        };
    }
};
