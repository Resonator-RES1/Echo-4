import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { RefineDraftOptions, GenerationConfig, NarrativeBlueprint, MechanicalMandate, NarrativeDensityMap } from "../../types";
import { AlignmentEngine } from "./alignmentEngine";
import { ContextEngine } from "./contextEngine";
import { AuditEngine } from "./auditEngine";
import { HealingEngine } from "./healingEngine";
import { TriageEngine } from "./triageEngine";
import { entropyEngine } from "./entropyEngine";
import { injectGritIntoAudit } from "./gritEngine";
import { getMemoryAxioms, getActiveTimelineEvents, getCharacterArcs } from "../../services/dbService";
import { resolveAllProfiles } from "../../utils/profileResolver";
import { calculateAbsoluteDay } from "../../utils/calendar";
import { zodToGeminiSchema } from "../../utils/zodToGemini";
import { RefinementOutputSchema } from "../../schemas/refinementSchemas";
import { callWithInstructor } from "./refine";
import { INTENSITY_CONFIG } from "../../constants/polishDepth";
import { buildSystemPrompt } from "./prompts";
import { DEPTH_CONFIG } from "../../constants/refinement";
import { DexieSaver } from "./dexieSaver";

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
    
    // Configurations configured during pre-flight
    generationConfig: Annotation<GenerationConfig>(),
    reportGenerationConfig: Annotation<GenerationConfig>(),
    systemInstruction: Annotation<string>(),
    dynamicLoreThreshold: Annotation<number>(),
    
    preFlight: Annotation<{ density: NarrativeDensityMap, semantic: { loreIds: string[], voiceIds: string[] } }>(),
    blueprint: Annotation<NarrativeBlueprint>(),
    mandate: Annotation<MechanicalMandate>(),
    
    refinedText: Annotation<string>(),
    parsedRefinement: Annotation<any>(),
    combinedThinking: Annotation<string>({
        reducer: (a, b) => (a ? `${a}\n\n---\n\n${b}` : b)
    }),
    
    parsedAudit: Annotation<any>(),
    entropyMetrics: Annotation<any>(),
    needsHealing: Annotation<boolean>(),
    healingPasses: Annotation<number>({
        reducer: (a, b) => a + b
    }),
});

// Helper for Safe JSON Parsing
const safeJsonParse = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        const fixedJson = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        try { return JSON.parse(fixedJson); } catch (e2) { throw e; }
    }
};

// --- NODE FUNCTIONS ---

async function initializeContextNode(state: typeof RefinementState.State) {
    const { options, draft } = state;
    
    const currentAbsoluteDay = options.calendarConfig?.useCustomCalendar && options.storyDate 
        ? calculateAbsoluteDay(options.storyDate, options.calendarConfig)
        : (options.storyDay ?? 0);

    const activeLoreForSemantic = resolveAllProfiles((options.loreEntries||[]).filter((e: any) => e.isActive), currentAbsoluteDay, options.calendarConfig);
    const activeVoicesForSemantic = resolveAllProfiles((options.voiceProfiles||[]).filter((v: any) => v.isActive), currentAbsoluteDay, options.calendarConfig);
    
    // Echo Dynamic Memory Integration
    const memoryAxioms = await getMemoryAxioms();

    // Timeline and Arcs integration
    const timelineEvents = await getActiveTimelineEvents();
    const activeTimelineEvents = timelineEvents.filter(e => e.absoluteDay <= currentAbsoluteDay || e.importance === 'catastrophic');
    
    const characterArcs = await getCharacterArcs();
    const activeCharacterArcs = characterArcs.filter(arc => 
        activeLoreForSemantic.some(l => l.id === arc.voiceId) || 
        activeVoicesForSemantic.some(v => v.id === arc.voiceId)
    );

    // --- STAGE 0: LOCAL TRIAGE (ZERO-TOKEN) ---
    // Zero-token detection to minimize noisy input to AI stages
    const locallyDetectedIds = TriageEngine.scanForAnchors(draft, activeLoreForSemantic, activeVoicesForSemantic);
    const discoverableLore = activeLoreForSemantic.filter(l => l.isPinned || locallyDetectedIds.includes(l.id));
    const discoverableVoices = activeVoicesForSemantic.filter(v => v.isPinned || locallyDetectedIds.includes(v.id));

    // --- STAGE 1: AI SEMANTIC AUDIT (FLASH LITE) ---
    // AI confirms the local detection and classifies narrative density
    const preFlight = await ContextEngine.analyzeContext(draft, discoverableLore, discoverableVoices, options.scope || 'scene', memoryAxioms);
    
    // --- STAGE 2: STRATEGIC ALIGNMENT (FLASH LITE) ---
    // Narrow context for alignment pass to ensure strategy is targeted
    const narrowedLoreForAlignment = activeLoreForSemantic.filter(l => preFlight.semantic.loreIds.includes(l.id) || l.isPinned);
    const narrowedVoicesForAlignment = activeVoicesForSemantic.filter(v => preFlight.semantic.voiceIds.includes(v.id) || v.isPinned);

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

    const systemInstruction = buildSystemPrompt({
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

    let dynamicLoreThreshold = options.loreComplianceThreshold ?? 7.0;
    if (activeLore.some((e: any) => e.narrativeWeight === 'pivotal')) dynamicLoreThreshold = Math.max(dynamicLoreThreshold, 9.0);
    else if (activeLore.some((e: any) => e.narrativeWeight === 'active')) dynamicLoreThreshold = Math.max(dynamicLoreThreshold, 8.0);

    return {
        preFlight, blueprint, mandate, 
        activeLore, activeVoices, activeAuthorVoices, currentAbsoluteDay,
        memoryAxioms, activeTimelineEvents, activeCharacterArcs,
        generationConfig, reportGenerationConfig, systemInstruction,
        dynamicLoreThreshold, healingPasses: 0
    };
}

async function refinementNode(state: typeof RefinementState.State) {
    const { draft, options, systemInstruction, generationConfig } = state;
    let preamble = '';
    if (options.localWarnings && options.localWarnings.length > 0) {
        preamble += `\n*** PRE-AUDIT WARNINGS ACTIVE ***\nThe local scanner has identified potential continuity issues... You MUST address them.\n`;
    }

    let userPrompt = '';
    const masterIntent = (options.customFocus || options.customInstruction) ? `[MASTER INTENT]: ${options.customFocus || options.customInstruction}\n\n` : '';

    if (options.fullContextDraft && options.selection) {
        preamble += `\n*** SURGICAL REFINEMENT MODE ***\nONLY refine the text provided in <TARGET_SELECTION>.\n`;
        userPrompt = `${preamble}<CONTEXT>\n${options.fullContextDraft}\n</CONTEXT>\n<TARGET_SELECTION>\n${options.selection.text}\n</TARGET_SELECTION>\n<TASK>\n${masterIntent}Refine the <TARGET_SELECTION> based on instructions.\n</TASK>`;
    } else {
        preamble += `\n*** FULL CHAPTER REFINEMENT MODE ***\nPRESERVE all titles, headers, etc.\n`;
        userPrompt = `${preamble}<DRAFT>\n${draft}\n</DRAFT>\n<TASK>\n${masterIntent}Refine.\n</TASK>`;
    }

    const { parsed: parsedRefinement, combinedThinking } = await callWithInstructor({
        model: generationConfig.model,
        prompt: userPrompt,
        systemInstruction,
        temperature: generationConfig.temperature,
        thinkingConfig: generationConfig.thinkingConfig,
        feedbackDepth: options.feedbackDepth || 'balanced',
        onStream: options.onStream
    }, RefinementOutputSchema);

    return { 
        refinedText: parsedRefinement.refined_text, 
        parsedRefinement, 
        combinedThinking 
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

    const { parsedAudit, needsHealing, entropyMetrics, combinedThinking } = await AuditEngine.performAudit(
        refinedText,
        options,
        activeLore,
        activeVoices,
        memoryAxioms,
        blueprint,
        mandate,
        reportGenerationConfig,
        dynamicLoreThreshold
    );

    return { 
        parsedAudit, 
        needsHealing,
        entropyMetrics,
        combinedThinking 
    };
}

async function healingNode(state: typeof RefinementState.State) {
    const { draft, refinedText, parsedAudit, options, systemInstruction, generationConfig } = state;
    const profile = INTENSITY_CONFIG[options.feedbackDepth || 'balanced'];
    
    // Engine-driven directive generation
    const healingDirectives = HealingEngine.generateDirectives(state);
    
    let gritDirectives = '';
    const gritConflicts = parsedAudit.conflicts?.filter((c: any) => c.sentence.includes('Burstiness') || c.sentence.includes('Ratio') || c.sentence === 'Rhythmic Mandate' || c.sentence === 'Lexical Mandate');
    
    if (gritConflicts && gritConflicts.length > 0) {
        gritDirectives = `\n<GRIT_MATH_MANDATES>\nYOUR PROSE PHYSICALLY FAILED THE PHYSICS ENGINE.\nYou MUST apply these mathematical fixes to the failed segments:\n${gritConflicts.map((c: any) => `- [PHYSICS]: ${c.sentence}\n  [MANDATE]: ${c.reason}`).join('\n')}\n</GRIT_MATH_MANDATES>\n`;
    }

    const healingPrompt = `<ORIGINAL_DRAFT>\n${draft}\n</ORIGINAL_DRAFT>\n<FAILED_REFINEMENT>\n${refinedText}\n</FAILED_REFINEMENT>\n<AUDIT_REPORT>\n${parsedAudit.analysis}\n</AUDIT_REPORT>${healingDirectives}${gritDirectives}\n<TASK>Consult mandate and axioms, rewrite affected segments EXACTLY as instructed. The directives are higher priority than stylistic 'flow' - you MUST break the flow to fix the patterns.</TASK>`;

    const { parsed: parsedHealing, combinedThinking } = await callWithInstructor({
        model: generationConfig.model,
        prompt: healingPrompt,
        systemInstruction,
        temperature: (generationConfig.temperature || 0.7) * profile.temperatureBias,
        thinkingConfig: generationConfig.thinkingConfig,
        feedbackDepth: options.feedbackDepth || 'balanced',
        onStream: options.onStream
    }, RefinementOutputSchema);

    return {
        refinedText: parsedHealing.refined_text || refinedText,
        parsedRefinement: parsedHealing,
        healingPasses: 1, // Will be added by reducer
        combinedThinking
    };
}

function shouldHeal(state: typeof RefinementState.State) {
    const maxPasses = INTENSITY_CONFIG[state.options.feedbackDepth || 'balanced'].maxHealingPasses;
    if (state.needsHealing && state.healingPasses < maxPasses) {
        return "heal";
    }
    return END;
}

// 2. Compile the Graph
const workflow = new StateGraph(RefinementState)
    .addNode("initialize", initializeContextNode)
    .addNode("refine", refinementNode)
    .addNode("audit", auditNode)
    .addNode("heal", healingNode)
    
    .addEdge(START, "initialize")
    .addEdge("initialize", "refine")
    .addEdge("refine", "audit")
    .addConditionalEdges("audit", shouldHeal, {
        heal: "heal",
        [END]: END
    })
    .addEdge("heal", "audit");

export const refinementGraph = workflow.compile({ checkpointer: new DexieSaver() });
