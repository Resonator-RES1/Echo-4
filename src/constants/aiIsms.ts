/**
 * Sovereign Shield: The AI-Ism Bible
 * Comprehensive constraints to prevent "AI Sludge" and ensure natural, authorial prose.
 */

export const AI_SLUDGE_MASTER_DIRECTIVE = `Write naturally without: em dashes (use commas/periods), the words 'delve/moreover/furthermore/albeit/indeed', 'not X but Y' constructions, rhetorical question-answer pairs, groups of three, bullet points, section headers, excessive emphasis (bold/italics), metaphorical clichés ('symphony of', 'tapestry of'), or explanatory phrases ('which was surprising because'). Use concrete descriptions, varied sentence structures, and conversational tone with personality.`;

export const FORBIDDEN_WORDS = [
    'delve', 'moreover', 'furthermore', 'albeit', 'indeed', 'certainly', 
    'tapestry', 'symphony', 'testament', 'beacon', 'myriad', 'embark', 
    'nestle', 'dance', 'whisper', 'echo', 'realm', 'mosaic', 'palpable', 
    'vibrant', 'intersection', 'unfold', 'meticulously', 'weaving', 'shimmering',
    // New high-risk AI sludge words from research:
    'unlock', 'unleash', 'transformative', 'bridge', 'paradigm', 'landscape', 
    'key', 'crucial', 'meaningful', 'robust', 'navigate', 'elevate', 'holistic',
    'comprehensive', 'synergy', 'showcase', 'pave', 'cornerstone',
    // Index of Inevitability - High-frequency clichés:
    'glimmering', 'shimmering', 'shadows danced', 'testament to', 'symphony of', 
    'unbeknownst', 'heart of the', 'porcelain skin'
];

export const FORBIDDEN_TRANSITIONS_AND_PHRASES = [
    'it is important to note', 'it remains to be seen', 'in conclusion', 
    'to summarize', 'let us explore', 'let us dive', 'shed light on',
    'brings us to', 'the bottom line is', 'in the ever-changing', 
    'fosters a sense of', 'not only X but also Y',
    // Index of Inevitability - Specific tropes:
    "smile that didn't reach his eyes", "smile that didn't reach her eyes",
    "taste of copper", "breath hitched", "eyes that swallowed the light",
    "silence became a physical weight", "silence was a heavy weight"
];

export const SOVEREIGN_DICTION_SHIFTS = [
    { insteadOf: 'Melodic/Smooth Voice', use: 'Serrated / Dry / Mono-tonal' },
    { insteadOf: 'Glimmering / Shimmering', use: 'Refractive / Saturated / Chromatic' },
    { insteadOf: 'Sudden Chill', use: 'Localized Drop in Temperature / Endothermic' },
    { insteadOf: 'Gaze Lingered', use: 'Target Locked / Observation Sustained' },
    { insteadOf: 'Beautiful / Handsome', use: 'Symmetrical / Geometrically Correct' }
];

export const WEAK_ACTIONS_BLACKLIST = [
    'arches a brow', 'nods once', 'taps the table', 'leans forward slightly', 
    'leans back slightly', 'exhales through nose', 'jaw clenches', 
    'shrugs', 'shifts weight', 'taps fingers', 'flicks pen', 'cheeks redden', 
    'clenched fists', 'face flushing', 'face paling', 'furrowing brows', 
    'studies the ring for a second too long', 'heavy sigh', 'focus narrowing'
];

export const DIALOGUE_TAG_PROHIBITIONS = [
    'he defends', 'she reassures', 'he said of the files', 'he said sadly', 
    'she asked nervously', 'full of accusation', 'with pride', 
    'unable to hide his surprise'
];

export const STYLE_CONSTRAINTS = {
    structural: [
        "RHYTHMIC RATIO: Enforce a 3:1 ratio of Staccato (short, abrupt) to Legato (long, flowing) sentences to maximize 'Burstiness'.",
        "CONCRETE ANCHOR: Forbidden from using 'Interpretive Adjectives' for emotions (e.g., angry, sad, brave). MUST use a 'Sensory Anchor' from the scene’s Lore (e.g., smell of ozone, heat of the Spire, weight of the sword).",
        "CYNICAL SUMMARY VETO: Remove the last sentence of any paragraph if it performs an 'Interpretive Summary' (e.g., 'It was a day they would never forget'). End on a cliff of action.",
        "SEMANTIC ENTROPY: Inject at least one 'Signature Lexicon' word from the author's palette every 100 words. Force the machine to take the 'scenic route' through specific vocabulary."
    ],
    punctuation: [
        "Limit em dashes to maximum one per 500 words. Use commas, periods, or sentence restructuring instead.",
        "Avoid ellipses except when showing genuine interrupted speech or thought.",
        "Use straight quotes (\") not curly quotes."
    ],
    patterns: [
        "Avoid 'not X, but Y' constructions (e.g., 'not merely tired, but exhausted'). Make direct statements.",
        "Don't use rhetorical questions followed by immediate answers. Choose either question or statement.",
        "Avoid grouping things in threes (Rule of Three). Vary between single items, pairs, and longer lists.",
        "Never use bullet points in narrative writing. Write lists as natural sentences.",
        "Don't use section headers or break text into labeled parts. Use natural paragraph flow."
    ],
    presentation: [
        "Avoid unnecessary introductory phrases like 'Let's break it down' or 'Let's dive in'.",
        "Avoid emphasis (bold/italics) maximum once per 500 words. Rely on word choice and structure for emphasis.",
        "Avoid using sentence fragments solely for 'false drama' (e.g., 'It was over. Finally. Completely.')."
    ],
    mechanics: [
        "Show emotions and reactions through actions and dialogue, don't explain them (Show, Don't Tell).",
        "Eliminate redundant adjective pairs (e.g., 'dark and brooding', 'quick and sharp').",
        "Avoid self-negating phrases (e.g., 'humorless chuckle', 'edge of a smile', 'never quite reached his face')."
    ]
};

export const AI_ISMS_PROMPT_BLOCK = `
<AI_SLUDGE_SHIELD>
CRITICAL: You MUST strictly enforce the following "Sovereign Shield" constraints to prevent generic AI patterns.

1. FORBIDDEN VOCABULARY: NEVER use these words: ${FORBIDDEN_WORDS.join(', ')}.
2. FORBIDDEN TRANSITIONS/PHRASES: NEVER use these generic filler/cliché phrases: ${FORBIDDEN_TRANSITIONS_AND_PHRASES.join(', ')}.
3. STRUCTURAL MANDATES:
${STYLE_CONSTRAINTS.structural.map(p => `   - ${p}`).join('\n')}
4. PUNCTUATION HYGIENE:
${STYLE_CONSTRAINTS.punctuation.map(p => `   - ${p}`).join('\n')}
5. PATTERN AVOIDANCE:
${STYLE_CONSTRAINTS.patterns.map(p => `   - ${p}`).join('\n')}
   - AVOID "Sassy Protagonist" Syndrome: Replace banter with Clinical Silence where power is implied.
6. SOVEREIGN DICTION SHIFTS:
${SOVEREIGN_DICTION_SHIFTS.map(s => `   - Instead of ${s.insteadOf}, use: ${s.use}`).join('\n')}
7. ACTION & DIALOGUE INTEGRITY:
   - Identify and remove "Weak Actions": ${WEAK_ACTIONS_BLACKLIST.slice(0, 10).join(', ')}... (Avoid generic nodding, shrugging, or jaw-clenching without tactical outcome).
   - Eliminate "Dialogue Fillers": Avoid tags like "he defends" or "she reassures". Never use adverbial tags like "he said sadly".
8. MECHANICS & PRESENTATION:
${STYLE_CONSTRAINTS.mechanics.map(m => `   - ${m}`).join('\n')}
${STYLE_CONSTRAINTS.presentation.map(m => `   - ${m}`).join('\n')}
</AI_SLUDGE_SHIELD>
`;
