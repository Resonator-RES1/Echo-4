/**
 * Structure & Format Engine (SFE)
 * Implements Standard Manuscript Format (MSF) and Marshalling of Narrative Beats.
 * References: 
 * - Standard Manuscript Format
 * - Snowflake Method (Structural Planning)
 * - Motivation-Reaction Units (MRUs)
 */

export const StructureEngine = {
    /**
     * MSF Protocol: Strict formatting for novelistic prose.
     */
    getFormattingMandate(): string {
        return `
### THE FORMATTING MANIFEST (MSF PROTOCOL)
1. **PARAGRAPH DENSITY CAP**: No paragraph may exceed 150 words or 6 sentences. If a paragraph exceeds this, you MUST force a break at the nearest logic shift.
2. **SPEAKER VETO**: A change in speaker MANDATES a new paragraph. You are FORBIDDEN from merging two different characters' speech into a single paragraph.
3. **DIALOGUE SANCTITY**: Use double quotes ("example") for direct speech. Use italics for internal thoughts. NEVER use single quotes for dialogue.
4. **THE WALL VETO**: If your output contains a single paragraph longer than 10 lines of text, it is a SYSTEM FAILURE. Break it.
5. **TITLE PRESERVATION**: If the input starts with a Title (e.g. # Chapter One), you MUST preserve it at the exact top of your output 'refined_text' or 'final_text'. DO NOT strip headers from the body prose.
`;
    },

    /**
     * MRU Logic: Enforces biological-narrative causality.
     * Pattern: Stimulus -> Reaction (Visceral -> Thought -> Action -> Speech)
     */
    getStructuralMandate(): string {
        return `
### THE STRUCTURAL RIGOR (MRU & SNOWFLAKE)
1. **MOTIVATION-REACTION UNITS (MRU)**: Ensure the prose follows biological priority:
   - **Stimulus (External)**: Something happens in the world.
   - **Reaction (Internal/Visceral)**: The character's gut reacts (pulse, sweat, flinch).
   - **Reaction (Cognitive)**: The character processes/thinks about the stimulus.
   - **Reaction (Voluntary Action/Speech)**: The character acts or speaks.
   *NEVER skip the internal reaction for pivotal beats.*
2. **SCENE VS SEQUEL**: Identify if the current beat is a 'Scene' (Goal -> Conflict -> Disaster) or a 'Sequel' (Reaction -> Dilemma -> Decision).
3. **SNOWFLAKE DENSITY**: Every sentence must justify its weight. If a sentence doesn't advance the plot, deepen lore, or reveal voice, PURGE IT.
`;
    },

    /**
     * Visual Audit Instructions: For the internal critique.
     */
    getVisualAuditDirective(): string {
        return `
- [STRUCTURE_AUDIT]: Did I break the paragraph when the speaker changed?
- [MRU_CHECK]: Did I show the character's internal flinch before they spoke?
- [DENSITY_SCAN]: Is there a "Wall of Text"? If yes, identify the split point.
`;
    }
};
