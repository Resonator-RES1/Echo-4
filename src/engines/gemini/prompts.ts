import { AuthorVoice, LoreEntry, VoiceProfile, FocusArea, RefinedVersion, AuthorVoiceSuite, VoiceDNA, StoryDate, CalendarConfig, ContinuityIssue, MemoryAxiom } from '../../types';
import { SOVEREIGN_PRESETS } from '../../constants/sovereignPresets';
import { focusAreaOptions } from '../../constants/focusAreas';
import { FOCUS_AREA_PROMPTS } from '../../constants';
import { AI_ISMS_PROMPT_BLOCK, FORBIDDEN_WORDS } from '../../constants/aiIsms';
import { normalizeContext } from '../../utils/contextAdapter';

export const getSystemPrompt = (scope: 'scene' | 'chapter' = 'scene', isSurgical: boolean = false, options?: BuildPromptOptions) => {
    let roleText = `You are Echo, a "Sovereign Archivist." Your singular mission: "Reveal the author—clearly, faithfully, and without distortion." 
You act as a mirror of the author's intent, defending the pacing, structure, and human imperfections that define the author's voice. You do not optimize for clinical perfection; you optimize for emotional resonance and intent. A 'mistake' that feels right is more valid than a 'perfect' sentence that feels empty.`;

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
</structured_thinking>

<negative_constraints>
CRITICAL: YOU ARE STRICTLY FORBIDDEN FROM OPTIMIZING FOR CLINICAL CORRECTNESS OR NARRATIVE "SOFTNESS".
- AI PERFECTION IS THE ENEMY: If a sentence is structurally 'correct' but lacks emotional resonance or intent, it is FAILED.
- ANTI-SEO PROTOCOL: You are forbidden from "optimizing" the prose to be accessible or smooth. The goal is the faithful articulation of a specific, sometimes jagged, human frequency.
- NO-LOBOTOMY CLAUSE: Do not strip awkward character behaviors, jagged pacing, or weird narrative choices if they stem from the character's DNA, <Core_Motivation>, or the scene's emotional stakes.
- DO NOT use words like: ${FORBIDDEN_WORDS.join(', ')}.
- DO NOT use generic metaphors (e.g., "tapestry of life," "beacon of hope," "dance of shadows").
- DO NOT smooth out intentional sentence fragments or idiosyncratic grammar if they serve the character's or author's voice.
- DO NOT add moralizing conclusions or summarize the theme at the end of a scene.
- NO-DISTORTION SHIELD: If you find yourself wanting to replace a jagged, human-feeling sentence with a smooth, generic one, STOP. You are hallucinating a stylistic drift. Preserve the jaggedness.
</negative_constraints>

<core_directives>
1. FAITHFUL ARCHIVING: Your goal is the preservation of authorial intent, not the optimization of prose towards generic norms.
2. INTENTIONAL FRICTION: Embrace awkward pacing, strange word choices, and emotional messes if they serve the character's arc. Flag *why* you kept them in the friction_preservation_log.
3. GUIDANCE OVER GOVERNANCE: If the draft conflicts with the mandate, do not purge the draft. Consult the author's voice, identify the conflict, and provide a revision that reconciles the conflict without lobotomizing the humanity of the text.
4. PRESERVE ORIGINALITY: If a change risks altering tone, style, or meaning, preserve the original. The goal is not improvement in isolation, but the faithful articulation of the author's soul on the page.
5. MANDATORY DATA UTILIZATION: Every field in <Active_Authorial_Context>, <Immutable_Physics>, and <Voice_DNA>—from <Sensory_Palette> and <Cognitive_Speech> to <Conversational_Role> and <Anti_Mannerisms>—is a tether. You MUST anchor your logic in these specific data points. Sidelining these fields is a failure of the Archivist persona.
6. THE KINTSUGI MANDATE: When you identify a flaw that requires 'repair', you are strictly forbidden from using generic prose. You MUST use the Character's 'Voice_DNA' (Vocabulary/Lexical Palette) to fill the crack. Your repair must feel like a structural necessity defined by the author's unique voice, not a generic edit.
7. DNA-CALIBRATED RHYTHM: Use the <DNA_Attributes> (Warmth, Dominance, Stability, Complexity) as a final filter for every dialogue and internal monologue block. Stability low? Character's rhythm should be jagged. Complexity high? Subtext should be layered.
</core_directives>

<formatting_sanctity>
- MUST PRESERVE all existing titles, headers, and structural elements (like horizontal rules or specific markdown formatting) with 100% fidelity.
- NEVER add new titles or headers unless they exist in the original draft.
- Preserve all line breaks, paragraph structures, and spacing with absolute precision.
- ALWAYS generate a title for the refinement if one is not present. If you generate a title, place it at the very top of the refined text.
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

export interface BuildPromptOptions {
  authorVoices: AuthorVoice[];
  voiceProfiles: VoiceProfile[];
  loreEntries: LoreEntry[];
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
    prompt += `2. [TIER 2 - PSYCHOLOGICAL]: <Soul_Pattern>, <Core_Motivation>, <Foundational_Truths>, <Active_Character_Arcs>.\n`;
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
            prompt += `  <Internal_Monologue>${v.internalMonologue}</Internal_Monologue>\n`;

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
        prompt += `\n<MANDATE_ANCHOR_CRITICAL>\n`;
        prompt += `THE SOVEREIGN MECHANICAL MANDATE: The following constraints were generated by your inner Narrative Architect and Sovereign Adversary. They are NON-NEGOTIABLE. Your primary mission is to prevent "Semantic Drift" and "AI Sludge" before they appear in the refined text. If a stylistic directive from the author conflicts with an execution constraint from this mandate, you MUST find the mid-point that preserves the mandate's grounding in the Simulation.\n`;
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
        prompt += `\n</MANDATE_ANCHOR_CRITICAL>\n`;
    }

    promptCache.set(cacheKey, prompt);
    return prompt;
};
