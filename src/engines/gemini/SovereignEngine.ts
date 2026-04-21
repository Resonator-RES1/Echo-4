import { NarrativeBlueprint } from "../../types";

/**
 * Sovereign Engine
 * Manages the "Pro-Hardening Logic" to strip meta-language and enforce mechanical precision
 * for high-parameter models that suffer from the "Illusion of Thinking".
 */

export const SovereignEngine = {
    /**
     * The Sanitizer: Translates high-concept internal critiques into 
     * physical, mechanical mandates.
     */
    sanitizeCritique(critique: string): string {
        if (!critique) return "";

        let sanitized = critique;

        // 1. Mapping meta-language to mechanical physical directives
        const mappings = [
            { pattern: /clinical malevolence/gi, replacement: "sound bored and detached" },
            { pattern: /ontological dread/gi, replacement: "focus on cold physical smells and small damp textures" },
            { pattern: /deep thematic resonance/gi, replacement: "mention a specific secondary lore object twice" },
            { pattern: /stylistic flair/gi, replacement: "remove all adverbs" },
            { pattern: /emotional depth/gi, replacement: "describe internal pulse speed or stomach tightness only" },
            { pattern: /narrative momentum/gi, replacement: "use sentences shorter than 10 words" },
            { pattern: /vivid imagery/gi, replacement: "name three concrete physical objects in the room" },
            { pattern: /robotic/gi, replacement: "use irregular sentence lengths" },
            { pattern: /cliché/gi, replacement: "replace idioms with direct physical descriptions" },
            { pattern: /abstract/gi, replacement: "anchored in physical dirt, sweat, or metal" }
        ];

        mappings.forEach(m => {
            sanitized = sanitized.replace(m.pattern, m.replacement);
        });

        // 2. Final meta-word purge
        const forbiddenMeta = ['vibe', 'essence', 'feeling', 'atmosphere', 'resonance', 'ontological', 'paradigm', 'nuance'];
        forbiddenMeta.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            sanitized = sanitized.replace(regex, 'physical detail');
        });

        return sanitized;
    },

    /**
     * Winston-Hardened Constraints: Mathematical narrow-pass for Pro models.
     * Rewritten via Positive Displacement to avoid the LLM Attention Trap.
     */
    getHardenedConstraints(): string {
        return `
### THE SOVEREIGN RIGOR (HARD CONSTRAINTS)
1. **SENTENCE POLARITY**: Every sentence over 20 words must strictly be followed by a sentence of 5 words or fewer.
2. **NOUN-ANCHOR LOCK**: Use ONLY concrete, physical nouns (e.g., rust, blood, dirt, metal, glass). Anchor every description in tangible reality.
3. **LEXICAL ENTROPY**: Use the vocabulary of a 19th-century sailor or a cynical detective. Focus on the mechanics of action.
4. **PHYSICS-FIRST**: Describe the weight of air, the smell of dust, or the temperature of skin before introducing character reactions.
`;
    },

    /**
     * The Shield Mandate: Resets pattern-matching focus via Positive Displacement.
     */
    getShieldMandate(): string {
        return `
---
**THE SHIELD MANDATE** (Final Override):
Focus entirely on the **Physics of the Scene.**
The character must act and sound like a bored person waiting for a train.
Your singular objective is **Mechanical Precision.** Focus on the grit, the dirt, and the clockwork of the moment.
---
`;
    },

    /**
     * Is the model a "Pro" model?
     */
    isProModel(model?: string): boolean {
        if (!model) return false;
        return model.includes('pro') || model.includes('ultra');
    },

    /**
     * Report Translation Node:
     * Transcodes Audit findings into specific "Model-Persona" formats.
     */
    translateAudit(audit: any, targetModel: string): string {
        const isPro = this.isProModel(targetModel);
        const analysis = audit.analysis || "Standard Audit";
        const conflicts = audit.conflicts || [];
        
        if (isPro) {
            // MATH-FIRST (Pro Models): Pure logic, constraints, and physical goals.
            return `
[ENGINE_DIRECTIVE]: PHYSICS-ONLY REFINEMENT
[CONSTRAINTS]:
- ${analysis}
- MANDATE: Repair all lore conflicts via direct physical action.
- ${conflicts.map((c: any) => `[CONFLICT]: ${c.sentence}\n  [FIX]: ${c.reason}`).join('\n')}
[GOAL]: Strict causality recovery.
`;
        } else {
            // SENSORY-FIRST (Flash Models): Noun-anchors, vibes, and world-building cues.
            return `
[FIX_THE_VIBE]: Sensory Recovery required.
[SENSORY_ANCHORS]: Use concrete textures, sharp smells, and high-entropy nouns.
[LORE_FIXES]:
${conflicts.map((c: any) => `- Ensure ${c.sentence} aligns with the world's weight: ${c.reason}`).join('\n')}
[VIBE_CHECK]: ${analysis}
`;
        }
    }
};
