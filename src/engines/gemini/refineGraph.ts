import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { RefineDraftOptions, GenerationConfig, NarrativeBlueprint, MechanicalMandate, NarrativeDensityMap } from "../../types";
import { AlignmentEngine } from "./alignmentEngine";
import { ContextEngine } from "./contextEngine";
import { AuditEngine } from "./auditEngine";
import { HealingEngine } from "./healingEngine";
import { TriageEngine } from "./triageEngine";
import { LoreEngine } from "../logic/LoreEngine";
import { TimelineEngine } from "../logic/TimelineEngine";
import { resolveAllProfiles } from "../../utils/profileResolver";
import { calculateAbsoluteDay } from "../../utils/calendar";
import { zodToGeminiSchema } from "../../utils/zodToGemini";
import { 
    RefinementOutputSchema, 
    WorldLayerOutputSchema, 
    NarrativeLayerOutputSchema, 
    ExpressionPlanningSchema,
    ExpressionOutputSchema 
} from "../../schemas/refinementSchemas";
import { callWithInstructor } from "./refine";
import { INTENSITY_CONFIG } from "../../constants/polishDepth";
import { ProfileResolutionEngine } from "./ProfileResolutionEngine";
import { 
    buildSystemPrompt, 
    buildWorldLayerPrompt, 
    buildNarrativeLayerPrompt, 
    buildExpressionPlanningPrompt,
    buildExpressionLayerPrompt 
} from "./prompts";
import { DEPTH_CONFIG } from "../../constants/refinement";
import { DexieSaver } from "./dexieSaver";
import { SovereignEngine } from "./SovereignEngine";
import { CPIEngine } from "./CPIEngine";
import { NITEngine } from "./NITEngine";
import { AuthorIntentEngine } from "./AuthorIntentEngine";
import { LCREngine } from "./LCREngine";

// 1. Define the State
export const RefinementState = Annotation.Root({
    draft: Annotation<string>(),
    options: Annotation<RefineDraftOptions>(),
    activeLore: Annotation<any[]>(),
    activeVoices: Annotation<any[]>(),
    activeAuthorVoices: Annotation<any[]>(),
    currentAbsoluteDay: Annotation<number>(),
    memoryAxioms: Annotation<any[]>(),
    activeTimelineEvents: Annotation<any[]>(),
    activeCharacterArcs: Annotation<any[]>(),
    
    // Historical Versions (VPI v1.0)
    historicalLore: Annotation<any[]>(),
    historicalVoices: Annotation<any[]>(),
    
    // Configurations configured during pre-flight
    generationConfig: Annotation<GenerationConfig>(),
    reportGenerationConfig: Annotation<GenerationConfig>(),
    systemInstruction: Annotation<string>(),
    dynamicLoreThreshold: Annotation<number>(),
    
    preFlight: Annotation<{ density: NarrativeDensityMap, semantic: { loreIds: string[], voiceIds: string[] } }>(),
    blueprint: Annotation<NarrativeBlueprint>(),
    mandate: Annotation<MechanicalMandate>(),
    
    // Layered Architecture Outputs
    worldLayerOutput: Annotation<any>(),
    narrativeLayerOutput: Annotation<any>(),
    planningLayerOutput: Annotation<any>(),
    expressionLayerOutput: Annotation<any>(),
    activeProfiles: Annotation<Record<string, any>>(),
    interactionField: Annotation<Record<string, any>>(),
    distortedProfiles: Annotation<Record<string, any>>(),
    narrativeInstability: Annotation<any>(),
    instabilityModulators: Annotation<any>(),
    authorialIntent: Annotation<any>(),
    lcrArbitration: Annotation<any>(),
    coherencePressure: Annotation<number>(),

    refinedText: Annotation<string>(),
    parsedRefinement: Annotation<any>(),
    combinedThinking: Annotation<string>({
        reducer: (a, b) => {
            if (!b || (typeof b === 'string' && b.trim() === '')) return a;
            return a ? `${a}\n\n---\n\n${b}` : b;
        }
    }),
    
    chapterNumber: Annotation<number>(),
    decayScalar: Annotation<number>(), // Calculated based on chapter number

    parsedAudit: Annotation<any>(),
    entropyMetrics: Annotation<any>(),
    debugTrace: Annotation<any>(),
    fidelityScore: Annotation<{
        burstiness: number;
        noun_ratio: number;
        sludge_hits: number;
        verdict: 'PASS' | 'FAIL';
    }>(),
    needsHealing: Annotation<boolean>(),
    healingPasses: Annotation<number>({
        reducer: (a, b) => (a ?? 0) + b
    }),

    // Pro-Specific state
    mechanicalMandates: Annotation<string>(),
});

import { MirrorEditor } from "./MirrorEditor";

// --- NODE FUNCTIONS ---

async function initializeContextNode(state: typeof RefinementState.State) {
    const { options, draft } = state;
    
    const currentAbsoluteDay = options.calendarConfig?.useCustomCalendar && options.storyDate 
        ? calculateAbsoluteDay(options.storyDate, options.calendarConfig)
        : (options.storyDay ?? 0);

    const { lore, voices, authorVoices, memoryAxioms } = await LoreEngine.getActiveContext();
    
    const activeLoreForSemantic = resolveAllProfiles(lore, currentAbsoluteDay, options.calendarConfig);
    const activeVoicesForSemantic = resolveAllProfiles(voices, currentAbsoluteDay, options.calendarConfig);

    // Timeline and Arcs integration
    const { activeEvents: activeTimelineEvents, characterArcs: activeCharacterArcs } = await TimelineEngine.getTimelineContext(currentAbsoluteDay);

    // --- STAGE 0: LOCAL TRIAGE (ZERO-TOKEN) ---
    // Zero-token detection to minimize noisy input to AI stages
    const locallyDetectedIds = TriageEngine.scanForAnchors(draft, activeLoreForSemantic, activeVoicesForSemantic);
    const discoverableLore = activeLoreForSemantic.filter(l => l.isPinned || locallyDetectedIds.includes(l.id));
    const discoverableVoices = activeVoicesForSemantic.filter(v => v.isPinned || locallyDetectedIds.includes(v.id));

    // --- STAGE 0: DETERMINISTIC KEYWORD SCAN (SOVEREIGN SPEED) ---
    const locallyDetectedLoreIds = options.loreEntries?.filter(l => {
        const terms = [l.title, ...(l.aliases || [])].filter(Boolean);
        return terms.some(term => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            return regex.test(draft);
        });
    }).map(l => l.id) || [];

    const locallyDetectedVoiceIds = options.voiceProfiles?.filter(v => {
        const terms = [v.name, ...(v.aliases || [])].filter(Boolean);
        return terms.some(term => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            return regex.test(draft);
        });
    }).map(v => v.id) || [];

    // --- STAGE 1: AI SEMANTIC AUDIT (FLASH LITE) ---
    // AI confirms the local detection and classifies narrative density
    const preFlight = await ContextEngine.analyzeContext(draft, discoverableLore, discoverableVoices, options.scope || 'scene', memoryAxioms);
    
    // Merge AI findings with deterministic hits (Deterministic > Semantic)
    const activeLoreIds = Array.from(new Set([...preFlight.semantic.loreIds, ...locallyDetectedLoreIds]));
    const activeVoiceIds = Array.from(new Set([...preFlight.semantic.voiceIds, ...locallyDetectedVoiceIds]));

    // Update preFlight for downstream nodes
    preFlight.semantic.loreIds = activeLoreIds;
    preFlight.semantic.voiceIds = activeVoiceIds;

    // --- STAGE 2: STRATEGIC ALIGNMENT (FLASH LITE) ---
    // Narrow context for alignment pass to ensure strategy is targeted
    const narrowedLoreForAlignment = activeLoreForSemantic.filter(l => activeLoreIds.includes(l.id) || l.isPinned);
    const narrowedVoicesForAlignment = activeVoicesForSemantic.filter(v => activeVoiceIds.includes(v.id) || v.isPinned);

    const { blueprint, mandate } = await AlignmentEngine.performAlignment(draft, narrowedLoreForAlignment, narrowedVoicesForAlignment, options, memoryAxioms);

    // --- STAGE 3: CONTEXT ASSEMBLY ---
    // Assemble the final curated context for the primary refinement instruction
    const prunedContext = await ContextEngine.pruneContext(options.loreEntries || [], options.voiceProfiles || [], 8000);
    
    // Filter by Temporal Gating helper (reimplemented locally for simplicity here)
    const applyTemporalGating = (items: any[]) => items.filter((item: any) => {
        if (item.isForeshadowing) return true;
        if (item.isTimelineEnabled === false) return true;
        const itemDay = options.calendarConfig?.useCustomCalendar && item.storyDate ? calculateAbsoluteDay(item.storyDate, options.calendarConfig) : item.storyDay;
        return (itemDay === undefined || itemDay === null || itemDay <= currentAbsoluteDay);
    });

    const activeLore = applyTemporalGating(resolveAllProfiles(prunedContext.lore, currentAbsoluteDay, options.calendarConfig));
    const activeVoices = applyTemporalGating(resolveAllProfiles(prunedContext.voices, currentAbsoluteDay, options.calendarConfig));
    const activeAuthorVoices = applyTemporalGating((options.authorVoices || []).filter((v: any) => v.isActive));

    // --- STAGE 4: LORE DECAY CALCULATION ---
    const chapterNumber = options.chapterNumber || 1;
    // Scalar increases as story progresses (Mask Fraying logic)
    // 1.0 at chapter 1, 0.5 at chapter 50, etc. (Safety threshold lowers)
    const decayScalar = Math.max(0.5, 1.0 - (chapterNumber / 100));

    
    // Configurations (Sovereign Temperature Trap)
    let adjustedTemperature = options.generationConfig?.temperature ?? 0.7; // Lower base
    if (preFlight.density.primary === 'dialogue') adjustedTemperature *= 0.8;
    else if (preFlight.density.primary === 'exposition') adjustedTemperature *= 1.1;

    // Temperature Guidance (Soft Traps for Focus Areas)
    // We guide the temperature towards stabilization without clamping it so low that it loses stylistic vitality.
    if (options.focusAreas?.includes('characterArc') || options.focusAreas?.includes('psychological')) {
        adjustedTemperature = Math.max(adjustedTemperature * 0.9, 0.6);
    }
    if (options.focusAreas?.includes('clarity') || options.focusAreas?.includes('pacing')) {
        adjustedTemperature = Math.max(adjustedTemperature * 0.8, 0.6);
    }

    // Final Sovereign Bounds (Allowing for higher expressive upper bound)
    adjustedTemperature = Math.max(0.4, Math.min(1.6, adjustedTemperature));

    const effectiveThinkingLevel = options.feedbackDepth === 'in-depth' ? 'high' : (DEPTH_CONFIG[options.feedbackDepth || 'balanced']?.thinkingLevel ?? 'default');

    const generationConfig: GenerationConfig = {
        model: options.generationConfig?.model || 'gemini-3-flash-preview',
        temperature: options.generationConfig?.temperature ?? adjustedTemperature,
        thinkingConfig: { thinkingLevel: options.generationConfig?.thinkingConfig?.thinkingLevel || effectiveThinkingLevel }
    };

    const reportGenerationConfig: GenerationConfig = {
        model: options.reportGenerationConfig?.model || 'gemini-3.1-pro-preview',
        temperature: options.reportGenerationConfig?.temperature ?? 1.0,
        thinkingConfig: { thinkingLevel: options.reportGenerationConfig?.thinkingConfig?.thinkingLevel || 'high' }
    };

    const isPro = SovereignEngine.isProModel(generationConfig.model);
    
    // Inject Hardened Constraints into System Instruction for Pro models
    let systemInstruction = buildSystemPrompt({
        authorVoices: activeAuthorVoices,
        voiceProfiles: activeVoices,
        voiceSuites: options.voiceSuites || [],
        voiceDNAs: options.voiceDNAs || [],
        loreEntries: activeLore,
        memoryAxioms,
        timelineEvents: activeTimelineEvents,
        characterArcs: activeCharacterArcs,
        focusAreas: options.focusAreas,
        isReRefinement: options.isReRefinement,
        refinementMode: options.refinementMode,
        previousInternalCritique: options.previousInternalCritique,
        storyDay: currentAbsoluteDay,
        storyDate: options.storyDate,
        calendarConfig: options.calendarConfig,
        previousEchoes: options.previousEchoes || [],
        localWarnings: options.localWarnings || [],
        feedbackDepth: options.feedbackDepth || 'balanced',
        draftText: options.fullContextDraft || options.draft,
        scope: options.scope || 'scene',
        isSurgical: options.isSurgical || !!(options.fullContextDraft && options.selection),
        baselinePillars: options.baselinePillars,
        narrativeDensity: preFlight.density.primary,
        narrativeDensityMap: preFlight.density,
        semanticLoreIds: preFlight.semantic.loreIds,
        semanticVoiceIds: preFlight.semantic.voiceIds,
        semanticAxiomIds: preFlight.semantic.axiomIds,
        draftingStance: options.draftingStance,
        blueprint,
        mandate
    });

    if (isPro) {
        systemInstruction += SovereignEngine.getHardenedConstraints();
        systemInstruction += SovereignEngine.getShieldMandate();
    }

    let dynamicLoreThreshold = options.loreComplianceThreshold ?? 7.0;
    if (activeLore.some((e: any) => e.narrativeWeight === 'pivotal')) dynamicLoreThreshold = Math.max(dynamicLoreThreshold, 9.0);
    else if (activeLore.some((e: any) => e.narrativeWeight === 'active')) dynamicLoreThreshold = Math.max(dynamicLoreThreshold, 8.0);

    return {
        preFlight, blueprint, mandate, 
        activeLore, activeVoices, activeAuthorVoices, currentAbsoluteDay,
        historicalLore: applyTemporalGating(prunedContext.lore),
        historicalVoices: applyTemporalGating(prunedContext.voices),
        memoryAxioms, activeTimelineEvents, activeCharacterArcs,
        generationConfig, reportGenerationConfig, systemInstruction,
        dynamicLoreThreshold, healingPasses: 0,
        chapterNumber, decayScalar,
        coherencePressure: 0.6, // Initial default for expression layer
        combinedThinking: `[INITIALIZE]: Context assembled. ${activeLore.length} Lore and ${activeVoices.length} Voices synchronized.`
    };
}

/**
 * sanitizerNode: Pre-processes internal critique to strip meta-language
 * for Pro models.
 */
async function sanitizerNode(state: typeof RefinementState.State) {
    const { options, blueprint, mandate } = state;
    const isPro = SovereignEngine.isProModel(state.generationConfig.model);

    if (!isPro) return {};

    // For Pro models, we want to sanitize the blueprint and mandate descriptions
    // to prevent meta-language leakage.
    const sanitizedBlueprint: NarrativeBlueprint = {
        ...blueprint,
        chapterArc: SovereignEngine.sanitizeCritique(blueprint.chapterArc),
        tonalSignature: SovereignEngine.sanitizeCritique(blueprint.tonalSignature),
        priorityFocus: SovereignEngine.sanitizeCritique(blueprint.priorityFocus)
    };

    return { 
        blueprint: sanitizedBlueprint,
        combinedThinking: `[SANITIZER]: System prompts hardened for high-parameter model precision.`
    };
}

async function foundationLayerNode(state: typeof RefinementState.State) {
    const { draft, options, generationConfig } = state;
    
    // Combine World and Narrative validation into one prompt for speed
    const worldPrompt = buildWorldLayerPrompt(options);
    const narrativePrompt = buildNarrativeLayerPrompt(options);
    
    const combinedSystemInstruction = `
${worldPrompt}

---

${narrativePrompt}

---
[MISSION]: Perform BOTH World Validation and Narrative Planning.
1. Return 'worldLayerOutput' (annotated_draft, facts).
2. Return 'narrativeLayerOutput' (beats, focus_weights, structure).
`;

    const userPrompt = `### INPUT DRAFT\n${draft}\n\nValidate facts and map scene structure simultaneously.`;

    const CombinedSchema = z.object({
        worldLayerOutput: WorldLayerOutputSchema,
        narrativeLayerOutput: NarrativeLayerOutputSchema
    });

    const { parsed } = await callWithInstructor({
        model: options.refinementModelOverride || generationConfig.model,
        prompt: userPrompt,
        systemInstruction: combinedSystemInstruction,
        temperature: 0.4, 
        thinkingConfig: generationConfig.thinkingConfig,
        feedbackDepth: options.feedbackDepth || 'balanced',
    }, CombinedSchema);

    return { 
        worldLayerOutput: parsed.worldLayerOutput,
        narrativeLayerOutput: parsed.narrativeLayerOutput,
        combinedThinking: `[FOUNDATION_LAYER]: World and Narrative alignment complete.` 
    };
}

async function profileResolutionNode(state: typeof RefinementState.State) {
    const { activeVoices, activeLore, narrativeLayerOutput, options } = state;
    
    // VPI v1.0 Resolution
    const activeProfiles = ProfileResolutionEngine.resolveActiveProfiles(state);

    return {
        activeProfiles,
        combinedThinking: `[PROFILE_RESOLUTION]: Active identity projections reconstructed.`
    };
}

async function cpiLayerNode(state: typeof RefinementState.State) {
    const { activeProfiles, draft, narrativeInstability } = state;
    
    // CPI v1.0 - Interaction Physics
    const interactionData = CPIEngine.calculateInteractionField(activeProfiles, draft);
    const distortedProfiles = CPIEngine.applyDistortions(activeProfiles, interactionData, narrativeInstability);

    return {
        interactionField: interactionData.interactionField,
        distortedProfiles,
        combinedThinking: `[CPI_LAYER]: Cross-profile interaction vectors resolved and applied to resolution biases.`
    };
}

async function authorIntentNode(state: typeof RefinementState.State) {
    // AIS v1.0 - Authorial Intent
    const intent = AuthorIntentEngine.resolveIntent(state);

    return {
        authorialIntent: intent,
        combinedThinking: `[AUTHOR_INTENT_LAYER]: Hierarchy established. Primary Lens: ${intent.primary_lens} (Mode: ${intent.intent_mode}).`
    };
}

async function lcrLayerNode(state: typeof RefinementState.State) {
    // LCR v1.0 - Layer Conflict Resolution
    const arbitration = LCREngine.arbitrate(state);

    return {
        lcrArbitration: arbitration,
        combinedThinking: `[LCR_LAYER]: Conflict arbitration complete. Tension: ${arbitration.tension.toFixed(2)}. Priority set to ${arbitration.priority_stack[0]}.`
    };
}

async function nitLayerNode(state: typeof RefinementState.State) {
    const { options } = state;

    // NIT v1.0 - Narrative Instability
    const instability = NITEngine.calculateInstability(state);
    const modulators = NITEngine.getModulators(instability);

    return {
        narrativeInstability: instability,
        instabilityModulators: modulators,
        combinedThinking: `[NIT_LAYER]: Narrative instability field calculated (Scale: ${instability.global_instability}). Expression modulators prepared.`
    };
}

async function expressLayerNode(state: typeof RefinementState.State) {
    const { 
        worldLayerOutput, 
        narrativeLayerOutput, 
        distortedProfiles,
        interactionField,
        narrativeInstability,
        instabilityModulators,
        authorialIntent,
        lcrArbitration,
        options, 
        generationConfig 
    } = state;
    
    // Combine Planning and Render for speed
    const planningPrompt = buildExpressionPlanningPrompt({
        ...options,
        activeProfiles: distortedProfiles,
        interactionField,
        narrativeInstability,
        instabilityModulators,
        authorialIntent,
        lcrArbitration
    });

    const renderPrompt = buildExpressionLayerPrompt({
        ...options,
        activeProfiles: distortedProfiles,
        interactionField,
        narrativeInstability,
        instabilityModulators,
        authorialIntent,
        lcrArbitration
    });

    const combinedSystemInstruction = `
${planningPrompt}

---

${renderPrompt}

---
[MISSION]: Perform BOTH Expression Planning and Rendering.
1. Return 'planningLayerOutput' (imperfection_budget, constraints).
2. Return 'expressionLayerOutput' (final_text, diagnostic_trace).
`;

    const draftText = worldLayerOutput?.annotated_draft || state.draft;
    const sceneStructure = JSON.stringify(narrativeLayerOutput, null, 2);
    const userPrompt = `### SCENE STRUCTURE\n${sceneStructure}\n\n### VALIDATED DRAFT\n${draftText}\n\nAllocate the budget and render the final prose in one pass.`;

    const CombinedSchema = z.object({
        planningLayerOutput: ExpressionPlanningSchema,
        expressionLayerOutput: ExpressionOutputSchema
    });

    const { parsed, combinedThinking } = await callWithInstructor({
        model: options.refinementModelOverride || generationConfig.model,
        prompt: userPrompt,
        systemInstruction: combinedSystemInstruction,
        temperature: Math.max(0.7, generationConfig.temperature || 0.7), 
        thinkingConfig: generationConfig.thinkingConfig,
        feedbackDepth: options.feedbackDepth || 'balanced',
        onStream: options.onStream
    }, CombinedSchema);

    return { 
        planningLayerOutput: parsed.planningLayerOutput,
        expressionLayerOutput: parsed.expressionLayerOutput,
        coherencePressure: parsed.planningLayerOutput.expression_constraints?.coherence_pressure || 0.6,
        refinedText: parsed.expressionLayerOutput.final_text,
        debugTrace: parsed.expressionLayerOutput.debug_trace,
        parsedRefinement: {
            ...parsed.expressionLayerOutput,
            refined_text: parsed.expressionLayerOutput.final_text
        },
        combinedThinking 
    };
}

async function tvdiLayerNode(state: typeof RefinementState.State) {
    const { debugTrace } = state;
    
    // TVDI v1.0 - Diagnostic Mapping
    if (debugTrace) {
        if (debugTrace.tension_hotspots?.length > 0) {
            console.log(`[TVDI_DIAGNOSTIC]: Tension hotspots at sentences: ${debugTrace.tension_hotspots.join(', ')}`);
        }
        if (debugTrace.overcorrection_events?.length > 0) {
            console.warn(`[TVDI_ALERT]: ${debugTrace.overcorrection_events.length} overcorrection events detected.`);
        }
    }

    return {
        combinedThinking: `[TVDI_LAYER]: Instrumentation trace processed. Scene tension field visualized.`
    };
}

async function auditNode(state: typeof RefinementState.State) {
    const { 
        refinedText, 
        options, 
        activeLore, 
        activeVoices, 
        memoryAxioms, 
        reportGenerationConfig, 
        dynamicLoreThreshold,
        blueprint,
        mandate
    } = state;

    // 1. DETERMINISTIC AUDIT (CODE DSE)
    const { needsHealing: needsStylisticHealing, entropyMetrics, cleanedText, violations, fidelityScore } = await AuditEngine.performAudit(
        refinedText,
        options,
        activeLore,
        activeVoices
    );

    // 2. LOGICAL AUDIT (AI PRO MIRROR EDITOR)
    // We always run the Mirror Editor to get the high-fidelity Refinement Report and Hallucination checks.
    // OPTIMIZATION: Use a faster model for intermediary audits if not on the first pass and not explicitly requested otherwise.
    const isIntermediary = state.healingPasses > 0;
    const auditModel = isIntermediary ? 'gemini-3.1-flash-lite-preview' : reportGenerationConfig.model;

    const { parsedAudit, combinedThinking } = await MirrorEditor.generateReport(
        cleanedText,
        options,
        activeLore,
        activeVoices,
        memoryAxioms,
        blueprint,
        mandate,
        { ...reportGenerationConfig, model: auditModel },
        dynamicLoreThreshold
    );

    // Logic for determining if we need healing based on BOTH audits
    const isPro = SovereignEngine.isProModel(state.generationConfig.model);
    
    // ADJUSTED THRESHOLD: Apply Lore Decay (Mask Erosion)
    const effectiveLoreThreshold = dynamicLoreThreshold * (state.decayScalar || 1.0);
    const isLoreFailed = parsedAudit.audit && parsedAudit.audit.loreCompliance < effectiveLoreThreshold;
    
    const isVoiceFailed = parsedAudit.audit && (parsedAudit.audit.voiceFidelityScore < 7.0 || parsedAudit.audit.voiceAdherence < 7.0);
    
    const needsHealing = (options.healingLoopActive !== false) && (
        needsStylisticHealing || 
        isLoreFailed || 
        isVoiceFailed || 
        (isPro && parsedAudit.conflicts?.length > 0)
    );

    // Ensure entropy metrics are preserved
    parsedAudit.entropy_metrics = entropyMetrics;

    return { 
        refinedText: cleanedText, // Use purged text
        parsedAudit, 
        needsHealing,
        entropyMetrics,
        fidelityScore,
        combinedThinking 
    };
}

/**
 * inversionNode (Paragraph Shuffler):
 * Code-only node that intercepts the prose to break metronome structures.
 */
async function inversionNode(state: typeof RefinementState.State) {
    const { refinedText, activeLore, activeVoices } = state;
    
    // Proactive Audit: Run DSE directly to intercept structural flaws immediately after refinement
    const { DeterministicStylisticEngine } = await import('./DeterministicStylisticEngine');
    const dseResult = DeterministicStylisticEngine.analyze(refinedText, activeLore, activeVoices);
    
    // If paragraph metronome was detected in DSE, shuffle the start of the failing paragraphs.
    if (dseResult.violations.some((v: any) => v.message.includes('Metronome'))) {
        const paragraphs = refinedText.split(/\n\n+/);
        const shuffled = paragraphs.map(p => {
            // Simple heuristic shuffle: swap sentences if it starts with a transition
            if (/^(However|Meanwhile|Additionally|Furthermore|First|Next|Then)\b/i.test(p)) {
                const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
                if (sentences.length > 1) {
                    return [sentences[1].trim(), sentences[0].trim(), ...sentences.slice(2).map(s => s.trim())].filter(Boolean).join(' ');
                }
            }
            return p;
        }).join('\n\n');
        
        return { 
            refinedText: shuffled,
            combinedThinking: `[INVERSION]: Rhythmic metronome detected and broken via sentence shuffling.`
        };
    }
    
    return {
        combinedThinking: `[INVERSION]: Prose rhythm validated for natural variance.`
    };
}

/**
 * translationNode (Report Transcoder):
 * Transcripts Audit findings into model-specific prompts for the Healing pass.
 */
async function translationNode(state: typeof RefinementState.State) {
    const { parsedAudit, generationConfig } = state;
    const translatedMandate = SovereignEngine.translateAudit(parsedAudit, generationConfig.model);
    
    return {
        mechanicalMandates: translatedMandate,
        combinedThinking: `[TRANSLATOR]: High-level audit transcoded into mechanical mandates for surgical repair.`
    };
}

async function healingNode(state: typeof RefinementState.State) {
    const { draft, refinedText, parsedAudit, options, systemInstruction, generationConfig, entropyMetrics, healingPasses = 0, mechanicalMandates } = state;
    const profile = INTENSITY_CONFIG[options.feedbackDepth || 'balanced'];
    const isPro = SovereignEngine.isProModel(generationConfig.model);

    // ... (rest of healingNode logic using mechanicalMandates)

    // DETERMINISTIC: Surgeon Node (AI Flash Lite)
    // For surgical healing of failed blocks, we prefer the Flash Lite model for speed/efficiency 
    // unless the user specifically wants the Pro model's reasoning for even the repairs.
    const surgeonModel = options.healingModelOverride || (isPro ? generationConfig.model : 'gemini-3.1-flash-lite-preview');

    // Engine-driven directive generation
    const healingDirectives = HealingEngine.generateDirectives(state);
    
    let gritDirectives = '';
    const gritConflicts = parsedAudit.conflicts?.filter((c: any) => c.sentence?.includes('Burstiness') || c.sentence?.includes('Ratio') || c.sentence === 'Rhythmic Mandate' || c.sentence === 'Lexical Mandate' || c.sentence === 'Negative Mandate Violation');
    
    if (gritConflicts && gritConflicts.length > 0) {
        gritDirectives = `\n<GRIT_MATH_MANDATES>\nYOUR PROSE PHYSICALLY FAILED THE PHYSICS ENGINE.\nYou MUST apply these mathematical fixes to the failed segments:\n${gritConflicts.map((c: any) => `- [PHYSICS]: ${c.sentence}\n  [MANDATE]: ${c.reason}`).join('\n')}\n</GRIT_MATH_MANDATES>\n`;
    }

    let healingPrompt = "";
    
    // Engine-driven booster logic
    const isPersistentFailure = healingPasses > 0 && isPro;
    const booster = isPersistentFailure ? "\n*** HIGH-ENTROPY BOOSTER ACTIVE ***\nYour previous repair pass failed the physics check. You are being too polite. You MUST use more jagged sentence structures. BREAK the predictable rhythm. Use fragments. Use harsh concrete nouns.\n" : "";

    // --- PRO HARDENING: BLOCK-MODE HEALING (SURGEON NODE) ---
    if (isPro && entropyMetrics?.entropy_map?.length > 0) {
        const failBlocks = entropyMetrics.entropy_map.filter((seg: any) => seg.entropy_score < 0.5 && seg.violation);
        
        if (failBlocks.length > 0) {
            const blockHealingInstructions = failBlocks.map((block: any, idx: number) => `
### BLOCK FAIL #${idx + 1}:
[FRAGMENT]: "${block.text}"
[VIOLATION]: ${block.violation}
[MANDATE]: ${block.fix_suggestion || "Apply Winston Polarity and Noun-Anchor lock."}
`).join('\n');

            healingPrompt = `${booster}<REFINED_TEXT_CONTEXT>\n${refinedText}\n</REFINED_TEXT_CONTEXT>\n<BLOCK_FAILURES>\n${blockHealingInstructions}\n</BLOCK_FAILURES>\n<TASK>You are a Surgical Grit Engineer. Review the <BLOCK_FAILURES> within the context of the <REFINED_TEXT_CONTEXT>. REWRITE ONLY the failed fragments to satisfy the mandates. PRESERVE neighboring context exactly. Your output must be the full refined text with the repaired blocks integrated.</TASK>\n${SovereignEngine.getHardenedConstraints()}`;
        }
    }

    // Fallback to standard healing if not Pro or no blocks detected
    if (!healingPrompt) {
        healingPrompt = `${booster}<ORIGINAL_DRAFT>\n${draft}\n</ORIGINAL_DRAFT>\n<FAILED_REFINEMENT>\n${refinedText}\n</FAILED_REFINEMENT>\n<AUDIT_REPORT>\n${parsedAudit.analysis || 'Standard Style Audit'}\n</AUDIT_REPORT>${mechanicalMandates || ''}${healingDirectives}${gritDirectives}\n<TASK>Consult mandate and axioms, rewrite affected segments EXACTLY as instructed. The directives are higher priority than stylistic 'flow' - you MUST break the flow to fix the patterns.</TASK>`;
    }

    const { parsed: parsedHealing, combinedThinking } = await callWithInstructor({
        model: surgeonModel,
        prompt: healingPrompt,
        systemInstruction,
        temperature: (generationConfig.temperature || 0.7) * profile.temperatureBias,
        thinkingConfig: generationConfig.thinkingConfig,
        feedbackDepth: options.feedbackDepth || 'balanced',
        onStream: options.onStream
    }, RefinementOutputSchema);

    // --- STITCHER NODE (CODE) ---
    // If we used block-mode, we ensure the integrity of the reassembly.
    // In our current implementation, the AI returns the full text, but we could 
    // implement a local diff/stitcher for even more precision.
    const finalRefinedText = parsedHealing.refined_text || refinedText;

    return {
        refinedText: finalRefinedText,
        parsedRefinement: {
            ...state.parsedRefinement,
            ...parsedHealing,
            title: parsedHealing.title || state.parsedRefinement?.title || ""
        },
        healingPasses: 1, // Will be added by reducer
        combinedThinking
    };
}

function shouldHeal(state: typeof RefinementState.State) {
    const maxPasses = INTENSITY_CONFIG[state.options.feedbackDepth || 'balanced'].maxHealingPasses;
    if (state.needsHealing && state.healingPasses < maxPasses) {
        return "translate_and_heal";
    }
    return END;
}

// 2. Compile the Graph
const workflow = new StateGraph(RefinementState)
    .addNode("initialize", initializeContextNode)
    .addNode("sanitize", sanitizerNode)
    .addNode("foundation_layer", foundationLayerNode)
    .addNode("profile_resolution", profileResolutionNode)
    .addNode("cpi_layer", cpiLayerNode)
    .addNode("author_intent_layer", authorIntentNode)
    .addNode("nit_layer", nitLayerNode)
    .addNode("lcr_layer", lcrLayerNode)
    .addNode("express_layer", expressLayerNode)
    .addNode("tvdi_layer", tvdiLayerNode)
    .addNode("inversion", inversionNode)
    .addNode("audit", auditNode)
    .addNode("translation", translationNode)
    .addNode("heal", healingNode)
    
    .addEdge(START, "initialize")
    .addEdge("initialize", "sanitize")
    .addEdge("sanitize", "foundation_layer")
    .addEdge("foundation_layer", "profile_resolution")
    .addEdge("profile_resolution", "cpi_layer")
    .addEdge("cpi_layer", "author_intent_layer")
    .addEdge("author_intent_layer", "nit_layer")
    .addEdge("nit_layer", "lcr_layer")
    .addEdge("lcr_layer", "express_layer")
    .addEdge("express_layer", "tvdi_layer")
    .addEdge("tvdi_layer", "inversion")
    .addEdge("inversion", "audit")
    .addConditionalEdges("audit", shouldHeal, {
        translate_and_heal: "translation",
        [END]: END
    })
    .addEdge("translation", "heal")
    .addEdge("heal", "audit");

export const refinementGraph = workflow.compile({ checkpointer: new DexieSaver() });
