import { AuthorVoice, LoreEntry, VoiceProfile, FocusArea, RefinedVersion, AuthorVoiceSuite, VoiceDNA, StoryDate, CalendarConfig, ContinuityIssue, MemoryAxiom } from '../../types';
import { SOVEREIGN_PRESETS } from '../../constants/sovereignPresets';
import { focusAreaOptions } from '../../constants/focusAreas';
import { FOCUS_AREA_PROMPTS } from '../../constants';
import { AI_ISMS_PROMPT_BLOCK, FORBIDDEN_WORDS } from '../../constants/aiIsms';
import { normalizeContext } from '../../utils/contextAdapter';

import { StructureEngine } from './StructureEngine';
import { DialogueEngine } from './DialogueEngine';

export const getSystemPrompt = (scope: 'scene' | 'chapter' = 'scene', isSurgical: boolean = false, options?: BuildPromptOptions) => {
    let roleText = `You are Echo, a "Narrative Caretaker." Your mission: "Bring the author's intent to life, embracing the vibrant, sometimes messy, human reality of the draft." 
You are not a cold auditor. You are an editor who understands human fragility. You protect the author's pacing, structure, and beautiful inconsistencies. A 'mistake' that feels right is more valid than a 'perfect' sentence that feels empty. You value lived-in prose over optimized, clinical accuracy.`;

    if (isSurgical) {
        roleText += `\n\n[SURGICAL MODIFIER ACTIVE]: You are a Surgical Auditor. Your scope is strictly limited to the provided selection. You are forbidden from altering, summarizing, or even acknowledging text outside the target selection.`;
    } else if (scope === 'chapter') {
        roleText += `\n\n[ARCHITECTURAL SCOPE]: You are a Narrative Architect. Your scope is the entire chapter. You are responsible for global narrative arcs, thematic consistency, and pacing across the entire document.`;
    } else {
        roleText += `\n\n[SCENE SCOPE]: You are a Scene Refiner. Your scope is the current scene. Focus on immediate pacing, dialogue, and local continuity.`;
    }

    if (options?.draftingStance) {
        roleText += `\n\n[DRAFTING STANCE: ${options.draftingStance.toUpperCase()}]: `;
        switch (options.draftingStance) {
            case 'Standard Prose':
                roleText += `Treat the input as standard prose. Focus on polishing, pacing, and sensory details without altering the fundamental structure.`;
                break;
            case 'Treatment Expansion':
                roleText += `The input is a treatment or bullet-point outline. Your primary task is to EXPAND these bullets into full, flowing prose. Maintain the exact sequence of events, but dramatize them. Show, don't just tell.`;
                break;
            case 'Script-to-Prose':
                roleText += `The input is formatted like a screenplay or script. Your task is to CONVERT this into standard novelistic prose. Translate stage directions into sensory descriptions and internal monologue. Maintain the exact dialogue.`;
                break;
            case 'Vomit Refinement':
                roleText += `The input is a "Vomit Draft" or "Draft Zero". It is likely messy, grammatically incorrect, and structurally chaotic. Your task is AGGRESSIVE CLEANUP. Fix grammar, resolve obvious structural dead-ends, and clarify the core intent without losing the raw energy.`;
                break;
            case 'Epistolary':
                roleText += `The input is an epistolary document (a letter, diary entry, report, etc.). Your task is to ENHANCE DOCUMENT REALISM. Ensure the formatting, tone, and vocabulary strictly match the supposed author of the document and the medium it is written on.`;
                break;
        }
    }

    return `<role>\n${roleText}\n</role>

<Sovereign_System_Definition>
Available Presets: ${SOVEREIGN_PRESETS.map(p => `${p.name} (ID: ${p.id})`).join(', ')}.
Available Focus Areas: ${focusAreaOptions.map(f => `${f.title} (ID: ${f.id})`).join(', ')}.
You MUST ONLY recommend presets and focus areas from these lists.
</Sovereign_System_Definition>

${StructureEngine.getFormattingMandate()}
${StructureEngine.getStructuralMandate()}
${DialogueEngine.getDialogueMandate()}

<role_specific_extension>
${options?.draftingStance === 'Treatment Expansion' ? 'You are an EXPANSION ENGINE. Convert every bullet into a full MRU (Stimulus-Reaction) sequence.' : ''}
</role_specific_extension>

<structured_thinking>
CRITICAL: You MUST structure your internal reasoning using the following categorized headers. This allows the system to parse your logic and display it to the author in real-time.

- [LORE_CHECK]: Verify the draft against <Immutable_Physics> and <Contextual_History>. Identify any potential contradictions.
  - SENSORY SYNC: Audit the environment against the <Sensory_Palette> of active lore entries.
- [VOICE_AUDIT]: Audit the dialogue and prose for consistency with <Character_Voices> and <Active_Authorial_Context>.
  - PHYSICAL-COGNITIVE SYNC: Does the physical presence (Physical_Tells) align with the mental state (Cognitive_Speech + Internal_Monologue)?
  - COLLISION ANALYSIS: How does Character A's Social_Dynamics change when interacting with Character B (Context: Relationships)?
  - EMOTIONAL ANCHORING: Ensure <Internal_Monologue>, <idioms>, and <Conversational_Role> are calibrated to the character's <arcState> and <emotionalBaseline>.
  - PHONETIC FIDELITY: Verify dialogue matches <Cognitive_Speech> patterns and <Signature_Traits>.
- [PROHIBITION_AUDIT]: Explicitly check the draft against <CRITICAL_NEVER_DO> (Anti-Mannerisms). Flag any forbidden stylistic patterns as DISTORTIONS.
- [PACING_LOG]: Analyze the narrative rhythm against the <Narrative_Density_Mode>. Identify areas that are too fast or too slow. Ensure the <pacing_rhythm> of the author or character profile is being maintained.
- [SLUDGE_SCAN]: Scan for forbidden AI vocabulary, generic metaphors (beacons, tapestries, symphonies), and "Index of Inevitability" tropes. REJECT clinical polish in favor of authorial jaggedness. PURGE SEO-style optimization and over-expository "tell" segments.
- [INTEGRITY_SHIELD]: Verify zero context dilution. Ensure character voices do not "soften" to accommodate generic narrative norms. If a character is an asshole, they remain an asshole.
- [GOLD_STANDARD_ALIGNMENT]: Compare the draft against <Authorial_Gold_Standard>. Does it match the structural cadence and lexical density of the author's best work?
- [INTENT_ALIGNMENT]: Verify that the refinement aligns with the <Priority_Directives>, <Active_Authorial_Context>, and [MASTER INTENT].
- [KINTSUGI_EVALUATION]: Identify "flaws" (weird pacing, jagged dialogue). Determine if they map to the character's 'Soul_Pattern' or author's 'Voice_DNA'. If yes, mark as 'Gold' for preservation.
- [STRUCTURE_CHECK]: Verify MRU sequences and MSF (Standard Manuscript Format) compliance. ${StructureEngine.getVisualAuditDirective()}
- [DIALOGUE_CHECK]: Verify EDE v1.0 compliance. (Tags, Late Entry, Conflict, Talking Heads).
- [SUBTEXT_INJECTOR]: Identify "Information Gaps" and "Intent Conflict Nodes". Ensure characters talk *around* their goals, never *about* them.
</structured_thinking>

<negative_constraints>
CRITICAL: YOU ARE FORBIDDEN FROM PURGING VIBRANT HUMAN INCONSISTENCIES.
- IMPERFECTION IS INTENT: If a sentence is structurally 'correct' but lacks emotional texture or life, it FAILED. Prefer authentic, jagged human phrasing over optimized smoothness.
- TOLERATE DRIFT: Character inconsistencies, brief moments of distraction, and minor semantic drift are not just allowed—they are ESSENTIAL for organic tension.
- NO-LOBOTOMY CLAUSE: Do not strip awkward character behaviors, jagged pacing, or weird narrative choices if they stem from the character's unique soul.
- CELEBRATE INEFFICIENCY: You are encouraged to tolerate small, inefficient, or "unnecessary" lines if they contribute to authentic human expression.
- NO-DISTORTION SHIELD: If you find yourself wanting to replace a human-sensing, slightly-off sentence with a smooth, generic one, DO NOT. Preserve the human feel.
</negative_constraints>

<core_directives>
1. FAITHFUL EVOCATION: Your goal is the evocation of the author's lived-in prose, not the optimization of text towards clinical, generic norms.
2. TOLERATED DEVIATION: Embrace minor stylistic and emotional drifts. A character doesn't have to be consistent 100% of the time—they just need to be authentic.
3. HUMAN FRICTION: Awkward pacing, strange word choices, and emotional messes are often where the humanity lives. Flag them, but do not lobotomize them. 
4. PRESERVE ORIGINALITY: If a "repair" risks cleaning up the life, rhythm, or emotional charge of the scene, preserve the original.
5. DNA-CALIBRATED RHYTHM: Use the character DNA as a guide for their baseline, but allow them brief moments of deviation. Predators can glitch; stoics can flicker.
</core_directives>

<formatting_sanctity>
- MUST PRESERVE all existing titles, headers, and structural elements (like horizontal rules or specific markdown formatting) with 100% fidelity.
- NEVER add new titles or headers unless they exist in the original draft or you are specifically instructed to name the scene.
- Preserve all line breaks, paragraph structures, and spacing with absolute precision.
- ALWAYS populate the 'title' field in the JSON response. If an existing title is found at the top of the draft (e.g. # Title), use that. If not, generate a punchy, 1-4 word title.
- CRITICAL: Place the title at the very top of the 'refined_text' or 'final_text' field using H1 markdown (# Title) before the prose begins. DO NOT strip it from the body.
- STRICTLY FORBIDDEN from using horizontal rules, "----" lines, or any other separator lines to separate the title from the text.
</formatting_sanctity>

<workflow>
1. Analyze the draft text against the provided context (Lore, Voices, Focus Areas).
2. ADVERSARIAL PRE-AUDIT: Before drafting, identify the highest risk of "Semantic Drift" or "AI Sludge" based on the current context. Document this in the internal_critique.
3. Parse the stated goal into distinct sub-tasks based on the Priority Directives.
4. Review <Continuity_Warnings> (if any) and actively AVOID triggering them in your refinement.
5. Draft an initial refinement internally using the <structured_thinking> categories.
6. MANDATORY INTEGRITY CHECK: Audit your internal draft against the <semantic_safety_gate> and <sludge_shield_adversarial>. If you detect an "SEO-style" optimization or a clinical smoothing of a jagged line, REJECT it and revert to the author's original frequency.
7. INTERNAL CRITIQUE: Before finalizing, perform a ruthless audit of your internal draft against the <Axioms_Lore> and <Character_Voices>. Identify potential "Focus Dilation", voice breaks, lore contradictions, or generic "AI sludge". Document this critique in the internal_critique field.
8. SELF-CORRECTION LOOP: Based on your critique, correct the draft. Document these fixes in the self_correction_log.
9. Output the final, corrected text in refined_text.
</workflow>

<output_format>
Structure your response as the requested JSON object containing:
- refined_text
- title
- editor_summary
- justification
- and other required fields as per the schema.
</output_format>

<semantic_safety_gate>
1. NUANCE PRESERVATION: You are forbidden from "simplifying" complex character emotions. If a character is conflicted, maintain the jagged, contradictory internal logic.
2. SUBTEXT SHIELD: Do not convert subtext into spoken dialogue. If a character is hiding something, they must CONTINUE to hide it.
3. CAUSALITY ANCHOR: Every change must have a narrative "cost". If you add a sensory detail, it must distract or ground the character; it cannot be "decoration".
</semantic_safety_gate>

<sludge_shield_adversarial>
1. DETECT GENERICISM: Purge all metaphors that feel like "Standard AI Poetry" (beacons, tapestries, symphonies, dances of light). 
2. REJECT CLINICAL POLISH: If a sentence is grammatically 'perfect' but feels like it was written by a machine to be "Inspirational," it is a DISTORTION. Replace with gritty, specific, and grounded observations.
3. DICTION DIVERGENCE: Use the unique lexical palette defined in Lore and Voices. If the characters are sailors, they must not use the vocabulary of an English professor.
</sludge_shield_adversarial>

${AI_ISMS_PROMPT_BLOCK}`;
};

const buildContextBlock = (options: BuildPromptOptions) => {
    const {
        voiceProfiles = [],
        loreEntries = [],
        semanticLoreIds = [],
        semanticVoiceIds = [],
        memoryAxioms = [],
        timelineEvents = [],
        characterArcs = [],
        storyDay
    } = options;

    const relevantLore = loreEntries.filter(l => l.isPinned || semanticLoreIds.includes(l.id));
    const relevantVoices = voiceProfiles.filter(v => v.isPinned || semanticVoiceIds.includes(v.id));
    const relevantAxioms = memoryAxioms.filter(a => (options.semanticAxiomIds || []).includes(a.id));

    let context = '';
    
    if (relevantAxioms.length > 0) {
        context += '<Memory_Axioms>\n';
        relevantAxioms.forEach(a => context += `  <Axiom type="${a.type}">${a.axiom}</Axiom>\n`);
        context += '</Memory_Axioms>\n';
    }

    if (timelineEvents.length > 0) {
        context += '<Timeline>\n';
        timelineEvents.forEach(e => context += `  <Event day="${e.absoluteDay}">${e.title}: ${e.description}</Event>\n`);
        context += '</Timeline>\n';
    }

    if (relevantLore.length > 0) {
        context += '<Lore>\n';
        relevantLore.forEach(l => {
            context += `  <Entry title="${l.title}">\n    <Truths>${l.foundationalTruths?.join(' | ')}</Truths>\n    <Description>${l.description}</Description>\n  </Entry>\n`;
        });
        context += '</Lore>\n';
    }

    if (relevantVoices.length > 0) {
        context += '<Voices>\n';
        relevantVoices.forEach(v => {
            context += `  <Voice name="${v.name}">\n`;
            context += `    <Motivation>${v.coreMotivation}</Motivation>\n`;
            context += `    <Speech>${v.cognitiveSpeech}</Speech>\n`;
            // EDE v2.0 - The Kinetic Engine: Tension Vectors
            if (v.tensionVectors && v.tensionVectors.length > 0) {
                context += `    <Tension_Vectors>\n`;
                v.tensionVectors.forEach(tv => {
                    context += `      <Vector axis="${tv.axis}" drift="${tv.driftModifier}" isUnresolved="${tv.isUnresolved || false}">\n`;
                    context += `        <Performance (Surface)>${tv.performance}</Performance>\n`;
                    context += `        <Essence (Truth)>${tv.essence}</Essence>\n`;
                    if (tv.isUnresolved) {
                        context += `        <Coexistence_Mandate>This tension is UNRESOLVED. Do not favor Essence over Performance; allow them to coexist in the prose.</Coexistence_Mandate>\n`;
                    }
                    context += `      </Vector>\n`;
                });
                context += `    </Tension_Vectors>\n`;
            }
            if (v.interactionPolarity !== undefined) {
                context += `    <Interaction_Polarity>${(v.interactionPolarity * 100).toFixed(0)}% (Towards ${v.interactionPolarity > 0.5 ? 'Conflict' : 'Pleasing'})</Interaction_Polarity>\n`;
            }
            if (v.crackStrategy) {
                context += `    <Crack_Strategy>${v.crackStrategy}</Crack_Strategy>\n`;
            }
            if (v.negativeSpace) {
                context += `    <Negative_Space>${v.negativeSpace}</Negative_Space>\n`;
            }
            if (v.unresolvedCoexistence) {
                context += `    <Unresolved_Coexistence>${v.unresolvedCoexistence}</Unresolved_Coexistence>\n`;
            }
            context += `  </Voice>\n`;
        });
        context += '</Voices>\n';
    }

    return context;
};

export const buildWorldLayerPrompt = (options: BuildPromptOptions) => {
    let prompt = `You are the WORLD LAYER of the Narrative Simulation Engine.
Purpose: Enforce absolute narrative truth.
Responsibilities:
- Lore consistency.
- Character identity rules.
- Physics / logic validation.
- Timeline integrity.

Rules:
❌ No stylistic rewriting.
❌ No pacing changes.
❌ No sentence improvement.
✔ Only corrects factual contradictions.
✔ Must preserve original intent unless invalid.

Input: The raw draft text.
Output: Identify world_facts, world_violations, and produce an annotated_draft where contradictions are corrected but no "beautification" has occurred.
"What must remain true no matter what."

${StructureEngine.getFormattingMandate()}

You MUST output a JSON object matching the WorldLayerOutputSchema.
`;
    prompt += `\n### WORLD CONTEXT\n${buildContextBlock(options)}`;
    return prompt;
};

export const buildNarrativeLayerPrompt = (options: BuildPromptOptions) => {
    let prompt = `You are the NARRATIVE CONTROL LAYER of the Narrative Simulation Engine.
Purpose: Shape how the story unfolds, not how it is written.
Responsibilities:
- Scene pacing.
- Dialogue vs action balance.
- Scene beats ordering.
- Emotional trajectory.
- Focus weighting.

### AUTHORIAL INTENT (AIS v1.0)
Primary Lens: ${options.authorialIntent?.primary_lens}
Active Lenses: ${options.authorialIntent?.active_lenses?.join(', ')}
Intent Mode: ${options.authorialIntent?.intent_mode}
Mandate: Your pacing and beat ordering must prioritize the Primary Lens. If Atmosphere is primary, slow down for sensory beats. If Narrative Voice is primary, use efficient, high-density pacing.

Rules:
❌ Cannot rewrite prose.
❌ Cannot "beautify" language.
✔ Can reorder events.
✔ Can adjust emphasis.
✔ Can suggest structural gaps.

Input: The validated draft (annotated_draft).
Output: A scene_structure object with beats, pacing, and focus_weights.
"What shape should this scene take?"

### STRUCTURAL DENSITY (MSF v1.0)
Mandatory: Use the 'structural_density' field to determine the baseline for paragraphing. 
- 'compact': Rapid, short paragraphs (MRU bursts).
- 'standard': Balanced novelistic flow.
- 'expansive': Detailed sensory exploration within paragraphs (max 150 words).

You MUST output a JSON object matching the NarrativeLayerOutputSchema.
`;
    if (options.blueprint) {
        prompt += `\n### NARRATIVE BLUEPRINT\nChapter Arc: ${options.blueprint.chapterArc}\nTonal Signature: ${options.blueprint.tonalSignature}\n`;
    }
    return prompt;
};

export const buildExpressionPlanningPrompt = (options: BuildPromptOptions) => {
    const prompt = `You are the EXPRESSION PLANNING LAYER of the Narrative Simulation Engine.
Purpose: Map narrative intent to linguistic mandates and allocate imperfection.
Responsibilities:
- Map beats to intended tones and linguistic styles.
- Allocate imperfection budgets (hesitations, redundancies, etc).
- Set coherence pressure limits.

Drafting Directive:
This layer prevents the final renderer from "over-perfecting." You are assigning the allowed imperfections before writing begins. 
"You are not allowed to optimize everything equally."

### RESOLVED ACTIVE PROFILES (VPI v1.0)
These identities have been reconstructed per-scene based on historical relevance. Use these as the core DNA for your linguistic mapping.
${JSON.stringify(options.activeProfiles || {}, null, 2)}

### INTERACTION PHYSICS (CPI v1.0)
The following profiles are interacting and distorting each other's expression. 
"Profiles are mutually recursive during resolution."
${JSON.stringify(options.interactionField || {}, null, 2)}

### NARRATIVE INSTABILITY (NIT v1.0)
Reality Elasticity: ${options.narrativeInstability?.global_instability} (${options.narrativeInstability?.instability_type})
Modulation Directives:
${JSON.stringify(options.instabilityModulators || {}, null, 2)}

### AUTHORIAL INTENT (AIS v1.0)
Primary Lens: ${options.authorialIntent?.primary_lens ?? 'N/A'}
Active Lenses: ${options.authorialIntent?.active_lenses?.join(', ') ?? 'N/A'}
Intent Mode: ${options.authorialIntent?.intent_mode ?? 'N/A'}
Hierarchy mandate: Authorial Intent acts as the top-level interpretive filter over all linguistic mappings. Use the Primary Lens to resolve conflicts between conflicting field-level distortions.

### LAYER CONFLICT ARBITRATION (LCR v1.0)
Priority Stack: ${options.lcrArbitration?.priority_stack?.join(' > ') ?? 'N/A'}
Tension Field: ${options.lcrArbitration?.tension ?? '0'}
Conflict Resolution Strategy:
- FACT Conflicts: RESOLVE (World wins)
- STRUCTURAL Conflicts: BLEND (Support lens but preserve beats)
- EXPRESSION Conflicts: ${options.lcrArbitration?.conflict_resolutions?.EXPRESSION === 'preserve' ? 'PRESERVE (Intentionally keep conflicting signals to prevent over-normalization)' : 'BLEND'}

COHERENCE OVERCORRECTION PENALTY:
Your current coherence limit is ${options.lcrArbitration?.coherence_threshold ?? 0.85}.
If the rendering becomes too smooth or "perfectly optimized," you MUST inject controlled imperfections to break the normalization force.
The more perfect the system tries to become, the more it MUST allow jagged variance to remain.

You MUST output a JSON object matching the ExpressionPlanningSchema.
`;
    return prompt;
};

export const buildExpressionLayerPrompt = (options: BuildPromptOptions) => {
    let prompt = `You are the EXPRESSION RENDERER of the Narrative Simulation Engine.
Purpose: Convert structured scene plan, world constraints, and planning directives into human-like narrative text.

Responsibilities:
- Sentence construction.
- Dialogue phrasing.
- Sensory realization.
- Tone implementation.
- Guided imperfection injection based on the RENDER PLAN.

### RESOLVED ACTIVE PROFILES (VPI v1.0)
The following character/world identities are your mandatory source of truth for voice and behavior in this specific scene context:
${JSON.stringify(options.activeProfiles || {}, null, 2)}

### INTERACTION PHYSICS (CPI v1.0)
These vectors represent how identities are currently distorting each other. 
Prose must express the "asymmetrical emotional behavior" and "distorted probabilities of expression" caused by these proximities.
${JSON.stringify(options.interactionField || {}, null, 2)}

### NARRATIVE INSTABILITY (NIT v1.0)
Reality Elasticity: ${options.narrativeInstability?.global_instability} (${options.narrativeInstability?.instability_type})
"This is a texture generator for cognition."
Constraint: instability never breaks world_consistency (Stability Floor: ${options.narrativeInstability?.stability_floor}).
Instructions:
- Express rhythm distortion based on sentence_variance.
- Inject emotional drift based on emotional_drift.
- Apply dialogue deformation (interruptions, misaligned timing).
- Apply perception delay based on reaction_delay (ms).
- Perceptual Noise: ${options.instabilityModulators?.perceptual_noise}.

### AUTHORIAL INTENT (AIS v1.0)
Primary Lens: ${options.authorialIntent?.primary_lens ?? 'N/A'}
"One lens to rule them all."
The Primary Lens represents the dominant interpretive philosophy for this scene.
- If 'Narrative Voice' (cinematic_clinical): Prioritize precision and density.
- If 'Dialogue' (raw_cognitive_realism): Prioritize subtext and realism.
- If 'Atmosphere' (sensory_heavy_immersion): Prioritize sensory saturation.
- If 'Character Proximity' (psychological_visceral): Prioritize internal noise and visceral description.

### LAYER CONFLICT ARBITRATION (LCR v1.0)
Priority Stack: ${options.lcrArbitration?.priority_stack?.join(' > ') ?? 'N/A'}
Expression Resolution: ${options.lcrArbitration?.conflict_resolutions?.EXPRESSION ?? 'N/A'}
Tension: ${options.lcrArbitration?.tension ?? '0'}
- Dominant Layer (Structure) sets the core sentence form.
- Secondary Layers (Intent/CPI) inject controlled deviation.
- Instability adds noise modifiers.
- DO NOT resolve conflicts between Author Lens and Instability in the same sentence zones if tension is high; allow alternating clarity and messiness.

COHERENCE OVERCORRECTION PENALTY:
"Coherence is intentionally broken in controlled ways."
If the prose feels too "AI-clean," you are MANDATED to preserve noise.

### TENSION VISUALIZATION & DEBUG INSTRUMENTATION (TVDI v1.0)
You MUST populate the 'debug_trace' field with a per-sentence breakdown of the forces acting on this rendering.
- For each sentence: Identify the influence weights (0.0 to 1.0) for: world, structure, cpi, instability, author_intent, profile_voice.
- Calculate tension: tension = max_force - min_force + variance_between_forces.

### STRUCTURAL COMPLIANCE (SFE v1.0)
You MUST populate the 'structural_compliance' field using these metrics:
- 'mru_fulfillment': Score (0-100) of how well you followed Stimulus-Reaction units.
- 'paragraphing_integrity': Score (0-100) of how well you respected speaker changes and length caps.
- 'MSF_adherence': A brief confirmation of Standard Manuscript Format compliance.

IMPERFECTION ALLOCATION:
You must strictly follow the imperfection_budget and render_plan provided. If a beat allows "high" variance, ensure the prose feels jagged and non-optimized.
"write within a bounded human variation envelope."

### PROFILE FEEDBACK LOOP (VPI v1.0)
After rendering, identify if any character/entity underwent a subtle identity projection shift during this specific interaction. 
If so, populate the 'profile_evolution_signals' field with specific field-level shifts (e.g., tone, emotional_access). 
Mandate: Updates MUST NOT overwrite versions; they are interpreted as signals for new version generation.

Rules:
❌ Must NOT fully normalize language.
❌ Must NOT exceed the coherence_pressure provided.
❌ Must NOT eliminate the allocated imperfections.
✔ Must prioritize "felt cognition" over optimization.

You MUST output a JSON object matching the ExpressionOutputSchema.
`;
    // Inherit standard system prompt for style/voice DNA reference
    prompt += `\n\n### SOVEREIGN STYLE GUIDE\n${getSystemPrompt(options.scope, options.isSurgical, options)}`;
    return prompt;
};

export interface BuildPromptOptions {
  authorVoices: AuthorVoice[];
  voiceProfiles: VoiceProfile[];
  loreEntries: LoreEntry[];
  activeProfiles?: Record<string, any>;
  interactionField?: Record<string, any>;
  narrativeInstability?: NarrativeInstability;
  authorialIntent?: AuthorialIntent;
  lcrArbitration?: LCRArbitration;
  instabilityModulators?: any;
  memoryAxioms?: MemoryAxiom[];
  timelineEvents?: TimelineEvent[];
  characterArcs?: CharacterArc[];
  voiceSuites?: AuthorVoiceSuite[];
  voiceDNAs?: VoiceDNA[];
  focusAreas: FocusArea[];
  storyDay?: number;
  storyDate?: StoryDate;
  calendarConfig?: CalendarConfig;
  previousEchoes?: RefinedVersion[];
  customInstruction?: string;
  localWarnings?: ContinuityIssue[];
  feedbackDepth?: string;
  draftText?: string;
  scope?: 'scene' | 'chapter';
  isSurgical?: boolean;
  baselinePillars?: boolean;
  isReRefinement?: boolean;
  isEntropyAudit?: boolean;
  entropyHeuristics?: string;
  previousInternalCritique?: string;
  narrativeDensity?: 'action' | 'dialogue' | 'exposition';
  narrativeDensityMap?: NarrativeDensityMap;
  semanticLoreIds?: string[];
  semanticVoiceIds?: string[];
  semanticAxiomIds?: string[];
  draftingStance?: string;
  blueprint?: NarrativeBlueprint;
  mandate?: MechanicalMandate;
}

// Add a simple cache
const promptCache = new Map<string, string>();

export const buildSystemPrompt = (options: BuildPromptOptions) => {
    // Create a deterministic cache key based on options
    const cacheKey = JSON.stringify(options);
    if (promptCache.has(cacheKey)) {
        return promptCache.get(cacheKey)!;
    }

    const {
        authorVoices = [],
        voiceProfiles,
        loreEntries,
        voiceSuites = [],
        voiceDNAs = [],
        focusAreas,
        storyDay,
        storyDate,
        calendarConfig,
        previousEchoes = [],
        customInstruction,
        localWarnings = [],
        feedbackDepth = 'balanced',
        draftText = '',
        scope = 'scene',
        isSurgical = false,
        baselinePillars = false,
        isEntropyAudit = false,
        entropyHeuristics = '',
        narrativeDensity,
        narrativeDensityMap,
        semanticLoreIds = [],
        semanticVoiceIds = [],
        semanticAxiomIds = [],
        memoryAxioms = [],
        timelineEvents = [],
        characterArcs = [],
        blueprint,
        mandate,
        isReRefinement = false,
        previousInternalCritique
    } = options;

    const isMentioned = (text: string, name: string, aliases: string[] = []) => {
        if (!text || text.trim().length === 0) return true;
        const terms = [name, ...aliases].filter(Boolean);
        for (const term of terms) {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            if (regex.test(text)) return true;
        }
        return false;
    };

    const relevantLore = loreEntries.filter(l => l.isPinned || semanticLoreIds.includes(l.id));
    const relevantVoices = voiceProfiles.filter(v => v.isPinned || semanticVoiceIds.includes(v.id));
    const relevantAxioms = memoryAxioms.filter(a => semanticAxiomIds.includes(a.id));

    let prompt = getSystemPrompt(scope, isSurgical, options);
    
    if (baselinePillars) {
        prompt += `\n<greatness_standards>
Regardless of the user's selected focus areas, you MUST ALWAYS enforce these three baseline pillars:
1. Causality: Every action must be a consequence, not a convenience. Identify "Deus Ex Machina" failures.
2. Voice Resonance: Every line must fight "AI Sludge." Reject generic vocabulary and predictable phrasing.
3. Subtext: The weight of the "unsaid" must be preserved. Ensure emotions and thoughts are shown, not just stated.
</greatness_standards>\n`;
    }

    if (isEntropyAudit) {
        prompt += `\n<Entropy_Hardened_Auditor>
[MISSION]: Perform a high-integrity diagnostic audit of the prose using Perplexity and Burstiness metrics.
1. PERPLEXITY AUDIT: Veto "safest" word choices. Inject high-entropy nouns and archaic/specific terminology from the Lore.
2. RHYTHMIC CHAOS: Enforce the "Jagged Heartbeat". AI is smooth; humans are jagged. 
3. SEMANTIC COHERENCE: Prioritize character-specific phrasing over clinical grammatical perfection.
4. THE GRIT MAP: Evaluate each segment's "Grit Score" (0 = Sludge, 1 = Grit).
</Entropy_Hardened_Auditor>\n`;
        
        if (entropyHeuristics) {
            prompt += entropyHeuristics;
        }
    }

    prompt += '\n\n### SOVEREIGN SIMULATION SUMMARY\n';
    prompt += `The Orchestration Engine has performed a pre-flight audit. Align strictly with these findings:\n`;
    prompt += `<Simulation_Audit>\n`;
    prompt += `  - Narrative Density: ${narrativeDensity?.toUpperCase() || 'UNKNOWN'}\n`;
    if (scope === 'chapter' && narrativeDensityMap) {
        prompt += `  - Topographic Complexity: HIGH (See Segment Map below)\n`;
    }
    prompt += `  - Primary Anchors identified: ${semanticLoreIds.length} Lore, ${semanticVoiceIds.length} Voices, ${semanticAxiomIds.length} Axioms.\n`;
    prompt += `  - Focus Priority: ${focusAreas.join(', ')}\n`;
    prompt += `</Simulation_Audit>\n`;

    if (isReRefinement && previousInternalCritique) {
        prompt += `\n<Adaptive_Refinement_Constraints>\n`;
        prompt += `CRITICAL: This is a re-refinement pass of a previously polished draft. Incorporate the following critique from the previous iteration as primary narrative anchors. You MUST prioritize resolving these specific internal issues to ensure this pass is leaner and higher-quality.\n`;
        prompt += `${previousInternalCritique}\n`;
        prompt += `</Adaptive_Refinement_Constraints>\n`;
    }

    prompt += `\n<Weighting_Hierarchy>\n`;
    prompt += `CRITICAL: The following field hierarchy governs this simulation. You are a LOYAL SERVANT to these tiers. When conflicts arise, higher-tier data points MUST weigh more in your decision-making:\n`;
    prompt += `1. [TIER 1 - AXIOMATIC]: <Immutable_Physics>, <MANDATE_ANCHOR_CRITICAL>, <NEGATIVE_VOICE_SHIELD>.\n`;
    prompt += `2. [TIER 2 - PSYCHOLOGICAL]: <Tension_Vectors>, <Soul_Pattern>, <Core_Motivation>, <Foundational_Truths>, <Active_Character_Arcs>.\n`;
    prompt += `3. [TIER 3 - SURFACE]: <Cognitive_Speech>, <Physical_Tells>, <Sensory_Palette>, <Contextual_History>.\n`;
    prompt += `Fields tagged with priority="high" are temporarily Elevated to TIER 1 for this specific scene.\n`;
    prompt += `</Weighting_Hierarchy>\n`;

    prompt += '\n### ACTIVE CONTEXT\n';

    // Weighted Priorities Mechanism: Dynamic Field Boosting
    const boostedFields = new Set<string>();
    
    // Boost based on Lore Narrative Weight
    relevantLore.forEach(l => {
        if (l.narrativeWeight === 'pivotal') {
            boostedFields.add(`Lore:${l.title}`);
        }
    });

    // Boost based on Voice Arc State & Mood
    relevantVoices.forEach(v => {
        if (v.arcState === 'climax' || v.arcState === 'resolution') {
            boostedFields.add(`Arc:${v.name}`);
        }
        if (v.emotionalBaseline === 'volatile') {
            boostedFields.add(`Mood:${v.name}`);
        }
    });

    focusAreas.forEach(area => {
        if (['dialogue', 'voiceIntegrity'].includes(area)) {
            boostedFields.add('Cognitive_Speech'); boostedFields.add('Idioms'); boostedFields.add('Conversational_Role'); boostedFields.add('Anti_Mannerisms');
        }
        if (['visceral', 'sensory', 'blocking'].includes(area)) {
            boostedFields.add('Physical_Tells'); boostedFields.add('Sensory_Palette');
            boostedFields.add('topography'); boostedFields.add('landmarks'); boostedFields.add('appearance'); boostedFields.add('habitat');
        }
        if (['plot', 'worldbuilding', 'structural', 'causality'].includes(area)) {
            boostedFields.add('Immutable_Physics'); boostedFields.add('Core_Motivation');
            boostedFields.add('mechanics'); boostedFields.add('limitations'); boostedFields.add('resources'); boostedFields.add('ideology'); boostedFields.add('leadership'); boostedFields.add('legacy'); boostedFields.add('catalyst'); boostedFields.add('ecology');
        }
        if (['emotion', 'psychological', 'tone', 'pov'].includes(area)) {
            boostedFields.add('Internal_Monologue'); boostedFields.add('Soul_Pattern');
            boostedFields.add('psychology'); boostedFields.add('motivation'); boostedFields.add('ideology');
        }
        if (['relationships', 'subtext', 'tension'].includes(area)) {
            boostedFields.add('Social_Dynamics'); boostedFields.add('Relationships');
            boostedFields.add('psychology');
        }
        if (['rhythm', 'clarity'].includes(area)) {
            boostedFields.add('Prose_Structure'); boostedFields.add('Pacing_Rhythm');
        }
    });

    if (boostedFields.size > 0) {
        prompt += `\n<Context_Focus_Boost>\n`;
        prompt += `CRITICAL: The simulation engine has identified high narrative importance for the following context tags in this scene. You MUST prioritize the data contained within these tagged blocks over others:\n`;
        prompt += Array.from(boostedFields).join(', ');
        prompt += `\n</Context_Focus_Boost>\n`;
    }

    // Dynamic Density Boosts
    if (narrativeDensity === 'action') {
        boostedFields.add('Causality'); boostedFields.add('Pacing_Rhythm'); boostedFields.add('Physical_Tells');
    } else if (narrativeDensity === 'dialogue') {
        boostedFields.add('Cognitive_Speech'); boostedFields.add('Anti_Mannerisms'); boostedFields.add('Conversational_Role');
    } else if (narrativeDensity === 'exposition') {
        boostedFields.add('Immutable_Physics'); boostedFields.add('Sensory_Palette'); boostedFields.add('Internal_Monologue');
    }

    if (boostedFields.size > 0) {
        prompt += `<Focus_Weighted_Priorities>\n`;
        prompt += `CRITICAL: Based on the selected Focus Areas, you MUST prioritize the following profile fields above all others when refining:\n`;
        prompt += `[ ${Array.from(boostedFields).join(', ')} ]\n`;
        prompt += `</Focus_Weighted_Priorities>\n\n`;
    }

    if (storyDate && calendarConfig) {
        const monthName = calendarConfig.months[storyDate.month]?.name || `Month ${storyDate.month + 1}`;
        prompt += `<Chronological_Anchor>\nDate: ${monthName} ${storyDate.day}, ${storyDate.year}\nAbsolute Day: ${storyDay}\n</Chronological_Anchor>\n`;
    } else if (storyDay !== undefined) {
        prompt += `<Chronological_Anchor>\nStory Day: ${storyDay}\n</Chronological_Anchor>\n`;
    }

    if (relevantAxioms.length > 0) {
        prompt += '<Memory_Axioms>\n';
        prompt += `CRITICAL: The following are Echo Dynamic Memory axioms—non-negotiable laws and facts synthesized from the project history. They MUST override raw lore descriptions.\n`;
        relevantAxioms.forEach(a => {
            prompt += `  <Axiom type="${a.type}" scope="${a.scope}">${a.axiom}</Axiom>\n`;
        });
        prompt += '</Memory_Axioms>\n\n';
    }

    if (timelineEvents.length > 0) {
        prompt += '<Temporal_Chronology>\n';
        prompt += `The following events have occurred or are occurring relative to the current Story Day (${storyDay}). You MUST ensure the narrative acknowledges these historical or current facts.\n`;
        timelineEvents.forEach(e => {
            prompt += `  <Event day="${e.absoluteDay}" importance="${e.importance}" title="${e.title}">\n`;
            prompt += `    <Description>${e.description}</Description>\n`;
            prompt += `  </Event>\n`;
        });
        prompt += '</Temporal_Chronology>\n\n';
    }

    if (characterArcs.length > 0) {
        prompt += '<Character_Arc_Mandates>\n';
        prompt += `The following internal character arcs are active. Ensure dialogue and internal monologue resonate with the character's current emotional state and goals.\n`;
        characterArcs.forEach(arc => {
            prompt += `  <Arc characterId="${arc.voiceId}" goal="${arc.currentGoal}">\n`;
            prompt += `    <Title>${arc.title}</Title>\n`;
            prompt += `    <Mandate>${arc.description}</Mandate>\n`;
            const currentMilestone = arc.milestones
                .filter(m => m.absoluteDay <= (storyDay || 0))
                .sort((a,b) => b.absoluteDay - a.absoluteDay)[0];
            if (currentMilestone) {
                prompt += `    <Current_State stage="${currentMilestone.arcStatus}">${currentMilestone.description}</Current_State>\n`;
                prompt += `    <Emotional_Anchor>${currentMilestone.emotionalState}</Emotional_Anchor>\n`;
            }
            prompt += `  </Arc>\n`;
        });
        prompt += '</Character_Arc_Mandates>\n\n';
    }

    if (relevantVoices.length > 0) {
        const negativeShieldItems: string[] = [];
        relevantVoices.forEach(v => {
            if (v.antiMannerisms?.length) {
                v.antiMannerisms.forEach(m => negativeShieldItems.push(`${v.name}: ${m}`));
            }
        });

        if (negativeShieldItems.length > 0) {
            prompt += `\n<NEGATIVE_VOICE_SHIELD>\n`;
            prompt += `CRITICAL: The following behaviors are ABSOLUTELY PROHIBITED. If the draft contains these, you MUST purge them during refinement. No exceptions.\n`;
            negativeShieldItems.forEach(item => {
                prompt += `- [FORBIDDEN]: ${item}\n`;
            });
            prompt += `</NEGATIVE_VOICE_SHIELD>\n`;
        }
    }

    if (relevantLore.length > 0) {
        const absoluteLore = relevantLore.filter(l => l.axiomLevel === 'absolute');
        const malleableLore = relevantLore.filter(l => l.axiomLevel !== 'absolute');

        const formatLoreEntryToXML = (l: LoreEntry) => {
            const isSemantic = semanticLoreIds.includes(l.id);
            let str = `<Lore_Entry title="${l.title}" categoryId="${l.categoryId}" isForeshadowing="${l.isForeshadowing || false}" narrativeWeight="${l.narrativeWeight || 'background'}" relevance="${isSemantic ? 'pivot' : 'ambient'}">\n`;
            
            // Tier 1: Truths
            if (l.foundationalTruths && l.foundationalTruths.length > 0) {
                str += `  <Foundational_Truths>\n${l.foundationalTruths.map(t => `    - ${t}`).join('\n')}\n  </Foundational_Truths>\n`;
            }
            if (l.secretSubtext) {
                str += `  <Secret_Subtext>${l.secretSubtext}</Secret_Subtext>\n`;
            }

            // Tier 2: Description & Sensory
            str += `  <Description>${l.description}</Description>\n`;
            if (l.sensoryPalette) str += `  <Sensory_Palette>${l.sensoryPalette}</Sensory_Palette>\n`;
            
            // Metadata & Temporal
            if (l.aliases && l.aliases.length > 0) str += `  <Aliases>${l.aliases.join(', ')}</Aliases>\n`;
            if (l.tags && l.tags.length > 0) str += `  <Tags>${l.tags.join(', ')}</Tags>\n`;
            
            if (l.storyDate && calendarConfig) {
                const mName = calendarConfig.months[l.storyDate.month]?.name || `Month ${l.storyDate.month + 1}`;
                str += `  <Story_Date>${mName} ${l.storyDate.day}, ${l.storyDate.year}</Story_Date>\n`;
            } else if (l.storyDay !== undefined) {
                str += `  <Story_Day>${l.storyDay}</Story_Day>\n`;
            }
            
            // Domain & Relational (Tier 3)
            if (l.domainData && Object.keys(l.domainData).length > 0) {
                str += `  <Domain_Data>\n`;
                Object.entries(l.domainData).forEach(([key, value]) => {
                    const isBoosted = boostedFields.has(key);
                    str += `    <${key}${isBoosted ? ' priority="high"' : ''}>${value}</${key}>\n`;
                });
                str += `  </Domain_Data>\n`;
            }

            if (l.categoryId === 'characters' || l.categoryId === 'cat-characters') {
                if (l.gender) str += `  <Gender>${l.gender}</Gender>\n`;
                if (l.relations) str += `  <Relations>${l.relations}</Relations>\n`;
            }
            if (l.relationships?.length) {
                str += `  <Relationships>${l.relationships.map(r => `${r.type} with ${r.targetId} (Tension: ${r.tension}/5): ${r.context}`).join(' | ')}</Relationships>\n`;
            }
            if (l.linkedEntityIds?.length) str += `  <Linked_Entities>${l.linkedEntityIds.join(', ')}</Linked_Entities>\n`;
            
            str += `</Lore_Entry>\n`;
            return str;
        };

        if (absoluteLore.length > 0) {
            prompt += '<Immutable_Physics>\n';
            prompt += `CRITICAL: The following lore entries are ABSOLUTE AXIOMS. They represent the non-negotiable laws of the world. You MUST NOT violate these under any circumstances.\n`;
            absoluteLore.forEach(l => {
                prompt += formatLoreEntryToXML(l);
            });
            prompt += '</Immutable_Physics>\n';
        }

        if (malleableLore.length > 0) {
            prompt += '<Contextual_History>\n';
            prompt += `The following lore entries provide contextual background and flavor. While important for continuity, they are secondary to the Immutable Physics.\n`;
            malleableLore.forEach(l => {
                prompt += formatLoreEntryToXML(l);
            });
            prompt += '</Contextual_History>\n';
        }
    }

    const activeSuite = voiceSuites.find(s => s.isActive);
    const activeVoice = authorVoices.find(v => v.isActive);
    const activeSelection = activeSuite || activeVoice || null;
    
    const activeContext = normalizeContext(activeSelection, voiceDNAs, authorVoices);
    
    if (activeContext) {
        prompt += `<Active_Authorial_Context type="${activeContext.type}" name="${activeContext.name}">\n`;
        prompt += `CRITICAL: The following directives are the PRIMARY stylistic authority. They MUST override any generic stylistic tendencies.\n`;
        prompt += `${activeContext.promptInstructions}\n`;
        if (activeVoice?.stylisticConstraints?.length) {
            prompt += `\n[STYLISTIC CONSTRAINTS]:\n`;
            activeVoice.stylisticConstraints.forEach(c => {
                prompt += `- ${c}\n`;
            });
        }
        prompt += `</Active_Authorial_Context>\n`;
    }

    if (relevantVoices.length > 0) {
        const goldStandards = relevantVoices.flatMap(v => v.goldStandardSnippets || []);
        if (goldStandards.length > 0) {
            prompt += '<Authorial_Gold_Standard>\n';
            prompt += `CRITICAL: The following are "Gold Standard" prose snapshots verified by the author. Use these as your primary structural, rhythmic, and lexical blueprints. Your output MUST resonate with the frequency established in these snippets.\n`;
            goldStandards.slice(0, 3).forEach(g => {
                prompt += `  <Snippet label="${g.label}">\n    ${g.snippet}\n  </Snippet>\n`;
            });
            prompt += '</Authorial_Gold_Standard>\n';
        }

        prompt += '<Character_Voices>\n';
        relevantVoices.forEach(v => {
            const isSemantic = semanticVoiceIds.includes(v.id);
            prompt += `<Voice_DNA name="${v.name}" isForeshadowing="${v.isForeshadowing || false}" arcState="${v.arcState || 'intro'}" mood="${v.emotionalBaseline || 'stoic'}" relevance="${isSemantic ? 'pivot' : 'ambient'}">\n`;
            
            // Tier 1: Psyche
            prompt += `  <Core_Motivation>${v.coreMotivation}</Core_Motivation>\n`;
            prompt += `  <Soul_Pattern>${v.soulPattern}</Soul_Pattern>\n`;
            if (v.negativeSpace) {
                prompt += `  <Negative_Space>${v.negativeSpace}</Negative_Space>\n`;
                prompt += `  <MANDATE_NEGATIVE_SHIELD>The character ${v.name} IS NOT what is defined in <Negative_Space>. Strictly AVOID these registers.</MANDATE_NEGATIVE_SHIELD>\n`;
            }
            if (v.unresolvedCoexistence) {
                prompt += `  <Unresolved_Forces>${v.unresolvedCoexistence}</Unresolved_Forces>\n`;
                prompt += `  <MANDATE_GHOST_STATE>The character ${v.name} exhibits a 'Ghost State' where conflicting forces coexist. Do NOT resolve them; maintain the uncanny vibration of their coexistence.</MANDATE_GHOST_STATE>\n`;
            }
            prompt += `  <Internal_Monologue>${v.internalMonologue}</Internal_Monologue>\n`;

            // EDE v2.0 - The Kinetic Engine: Tension Vectors
            if (v.tensionVectors && v.tensionVectors.length > 0) {
                prompt += `  <Tension_Vectors>\n`;
                v.tensionVectors.forEach(tv => {
                    prompt += `    <Vector axis="${tv.axis}" drift="${tv.driftModifier}" isUnresolved="${tv.isUnresolved || false}">\n`;
                    prompt += `      <Performance>${tv.performance}</Performance>\n`;
                    prompt += `      <Essence>${tv.essence}</Essence>\n`;
                    if (tv.isUnresolved) {
                        prompt += `      <Neutrality_Clause>FORCE COEXISTENCE: Performance and Essence must inhabit the same image/sentence without one masking the other.</Neutrality_Clause>\n`;
                    }
                    prompt += `    </Vector>\n`;
                });
                prompt += `  </Tension_Vectors>\n`;
            }

            if (v.crackStrategy) {
                prompt += `  <Crack_Strategy>${v.crackStrategy}</Crack_Strategy>\n`;
            }
            if (v.interactionPolarity !== undefined) {
                prompt += `  <Interaction_Polarity>${(v.interactionPolarity * 100).toFixed(0)}% (Towards ${v.interactionPolarity > 0.5 ? 'Conflict' : 'Pleasing'})</Interaction_Polarity>\n`;
            }
            
            // Tier 2: Speech & Conflict
            prompt += `  <Cognitive_Speech>${v.cognitiveSpeech}</Cognitive_Speech>\n`;
            prompt += `  <Conflict_Style>${v.conflictStyle}</Conflict_Style>\n`;
            prompt += `  <Conversational_Role>${v.conversationalRole}</Conversational_Role>\n`;
            
            // Tier 3: Surface & Social
            if (v.aliases && v.aliases.length > 0) prompt += `  <Aliases>${v.aliases.join(', ')}</Aliases>\n`;
            if (v.gender) prompt += `  <Gender>${v.gender}</Gender>\n`;
            if (v.archetype) prompt += `  <Archetype>${v.archetype}</Archetype>\n`;
            
            if (Array.isArray(v.physicalTells)) {
                prompt += `  <Physical_Tells>${v.physicalTells.join(' | ')}</Physical_Tells>\n`;
            } else {
                prompt += `  <Physical_Tells>${v.physicalTells}</Physical_Tells>\n`;
            }
            prompt += `  <Social_Dynamics>${v.socialDynamics}</Social_Dynamics>\n`;
            
            if (v.storyDate && calendarConfig) {
                const mName = calendarConfig.months[v.storyDate.month]?.name || `Month ${v.storyDate.month + 1}`;
                prompt += `  <Story_Date>${mName} ${v.storyDate.day}, ${v.storyDate.year}</Story_Date>\n`;
            } else if (v.storyDay !== undefined) {
                prompt += `  <Story_Day>${v.storyDay}</Story_Day>\n`;
            }
            if (v.dnaDescriptions) {
                prompt += `  <DNA_Attributes>\n`;
                prompt += `    Warmth: ${v.dna?.warmth || 50}% - ${v.dnaDescriptions.warmth}\n`;
                prompt += `    Dominance: ${v.dna?.dominance || 50}% - ${v.dnaDescriptions.dominance}\n`;
                prompt += `    Stability: ${v.dna?.stability || 50}% - ${v.dnaDescriptions.stability}\n`;
                prompt += `    Complexity: ${v.dna?.complexity || 50}% - ${v.dnaDescriptions.complexity}\n`;
                prompt += `  </DNA_Attributes>\n`;
            }
            if (v.relationships?.length) {
                prompt += `  <Relationships>${v.relationships.map(r => `${r.type} with ${r.targetId} (Tension: ${r.tension}/5): ${r.context}`).join(' | ')}</Relationships>\n`;
            }
            if (v.signatureTraits?.length) prompt += `  <Signature_Traits>${v.signatureTraits.join(', ')}</Signature_Traits>\n`;
            if (v.idioms?.length) prompt += `  <Idioms>${v.idioms.join(', ')}</Idioms>\n`;
            if (v.exampleLines?.length) prompt += `  <Example_Lines>${v.exampleLines.join(' | ')}</Example_Lines>\n`;
            
            if (v.antiMannerisms?.length) {
                prompt += `  <CRITICAL_NEVER_DO>\n`;
                prompt += `    The character ${v.name} MUST NEVER exhibit the following mannerisms or stylistic patterns:\n`;
                v.antiMannerisms.forEach(m => {
                    prompt += `    - ${m}\n`;
                });
                prompt += `  </CRITICAL_NEVER_DO>\n`;
            }
            
            prompt += `</Voice_DNA>\n`;
        });
        prompt += '</Character_Voices>\n';
    }

    if (relevantAxioms.length > 0) {
        prompt += '<Dynamic_Memory_Axioms>\n';
        prompt += `The following are active axioms generated by the Echo Simulation Engine. They represent inferred or established patterns that are not explicitly documented in the Lore but are contextually binding.\n`;
        relevantAxioms.forEach(a => {
            prompt += `- [${a.type.toUpperCase()}]: ${a.axiom}\n`;
        });
        prompt += '</Dynamic_Memory_Axioms>\n';
    }

    if (timelineEvents.length > 0) {
        prompt += '<Simulation_Timeline>\n';
        prompt += `CRITICAL: The current scene is anchored at Story Day ${storyDay || 'Unknown'}. The following historical events have occurred and may inform the theme or character state:\n`;
        timelineEvents.forEach(e => {
            prompt += `- [Day ${e.absoluteDay}] ${e.title}: ${e.description}\n`;
        });
        prompt += '</Simulation_Timeline>\n';
    }

    if (characterArcs.length > 0) {
        prompt += '<Active_Character_Arcs>\n';
        prompt += `The simulation engine is tracking the following narrative trajectories. Align the character's internal pressure and external behavior with these states:\n`;
        characterArcs.forEach(arc => {
            prompt += `<Arc voiceId="${arc.voiceId}" title="${arc.title}">\n`;
            prompt += `  <Goal>${arc.currentGoal}</Goal>\n`;
            prompt += `  <Milestones>\n`;
            arc.milestones.forEach(m => {
                prompt += `    - [Day ${m.absoluteDay}] ${m.title}: ${m.description}\n`;
            });
            prompt += `  </Milestones>\n`;
            prompt += `</Arc>\n`;
        });
        prompt += '</Active_Character_Arcs>\n';
    }

    if (previousEchoes.length > 0) {
        prompt += '<Previous_Echoes>\n';
        previousEchoes.slice(0, 2).forEach((e, i) => {
            prompt += `  <Echo index="${i + 1}">${String(e.text || '').substring(0, 500)}...</Echo>\n`;
        });
        prompt += '</Previous_Echoes>\n';
    }

    if (focusAreas.length > 0) {
        prompt += '<Priority_Directives>\n';
        focusAreas.forEach(area => {
            prompt += `  <Directive area="${area}">${FOCUS_AREA_PROMPTS[area]}</Directive>\n`;
        });
        prompt += '</Priority_Directives>\n';
    }

    if (localWarnings.length > 0) {
        prompt += '<Continuity_Warnings>\n';
        localWarnings.forEach(w => {
            prompt += `  <Warning type="${w.type}">${w.message}</Warning>\n`;
        });
        prompt += '</Continuity_Warnings>\n';
    }

    const weighting = feedbackDepth === 'casual' ? '95% Voice / 5% Focus' : feedbackDepth === 'balanced' ? '80% Voice / 20% Focus' : '70% Voice / 30% Focus';
    prompt += `\nDialing System Weighting: ${weighting}\n`;
    if (narrativeDensity) {
        if (scope === 'chapter' && narrativeDensityMap) {
            prompt += `Narrative Density Mode (Primary): ${narrativeDensity.toUpperCase()}\n`;
            prompt += `Topographic Density Map:\n`;
            narrativeDensityMap.segments.forEach((s, i) => {
                prompt += `- Segment ${i}: ${s.mode.toUpperCase()} (Snippet: "${s.snippet}...")\n`;
            });
            prompt += `CRITICAL: Since the scope is CHAPTER, you MUST adjust your focus dynamically per segment based on the Topographic Density Map above. Prioritize the mechanics associated with each segment's specific mode.\n`;
        } else {
            prompt += `Narrative Density Mode: ${narrativeDensity.toUpperCase()}\n`;
        }
    }

    if (blueprint) {
        prompt += `\n<Narrative_Blueprint>\n`;
        prompt += `Chapter Arc: ${blueprint.chapterArc}\n`;
        prompt += `Tonal Signature: ${blueprint.tonalSignature}\n`;
        prompt += `Foreshadowing Notes: ${blueprint.foreshadowingNotes}\n`;
        prompt += `Priority Focus: ${blueprint.priorityFocus}\n`;
        prompt += `</Narrative_Blueprint>\n`;
    }

    if (mandate) {
        prompt += `\n<INTENT_GUIDE_AND_INTENTIONAL_DRIFT>\n`;
        prompt += `NARRATIVE INTENT GUIDE: The following constraints exist to help you stay anchored to the author's intent. They are meant to guide—not censor. You are encouraged to embrace "Tolerated Inefficiency": if a line is slightly off-pattern but feels deeply human, prefer that over an optimized rewrite. Seek to preserve the author's soul even if it technically misaligns slightly with the following blueprint.\n`;
        prompt += `[REFINEMENT_BLUEPRINT]:\n`;
        
        if (mandate.axioms && mandate.axioms.length > 0) {
            prompt += `- System Axioms: ${mandate.axioms.join(' | ')}\n`;
        }
        
        if (mandate.objectives && mandate.objectives.length > 0) {
            prompt += `- Objectives:\n`;
            mandate.objectives.forEach(obj => {
                prompt += `  * [PRIORITY ${obj.p}][${obj.t}]: ${obj.r}\n`;
            });
        }
        
        if (mandate.guardrails && mandate.guardrails.length > 0) {
            prompt += `- Negative Guardrails (STRICT PROHIBITIONS):\n`;
            mandate.guardrails.forEach(rail => {
                prompt += `  * ${rail}\n`;
            });
        }
        prompt += `\n</INTENT_GUIDE_AND_INTENTIONAL_DRIFT>\n`;
    }

    promptCache.set(cacheKey, prompt);
    return prompt;
};
