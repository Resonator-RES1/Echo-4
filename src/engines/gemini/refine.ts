import { performPreFlightPass, pruneContext } from "./refineUtils";
import { Type, ThinkingLevel } from "@google/genai";
import { 
  FocusArea, 
  LoreEntry, 
  VoiceProfile, 
  RefinedVersion, 
  AuthorVoice, 
  FeedbackDepth, 
  VoiceAudit, 
  AuthorVoiceSuite, 
  VoiceDNA, 
  CalendarConfig, 
  StoryDate,
  RefineDraftOptions,
  RefineDraftResult,
  GenerationConfig,
  NarrativeDensityMap,
  NarrativeBlueprint,
  MechanicalMandate,
  RemediationPayload
} from '../../types';
import { INTENSITY_CONFIG } from '../../constants/polishDepth';
import { ContinuityIssue } from '../../types';
import { callAiApi, countTokens } from './api';
import { getSystemPrompt, buildSystemPrompt } from './prompts';
import { calculateAbsoluteDay } from '../../utils/calendar';
import { getResonanceLabel } from '../../lib/utils';
import { RefinementOutputSchema, AuditOutputSchema, NarrativeAlignmentOutputSchema, PreFlightOutputSchema } from '../../schemas/refinementSchemas';
import { zodToGeminiSchema } from '../../utils/zodToGemini';
import { useConfigStore } from '../../stores/useConfigStore';

import { DEPTH_CONFIG } from '../../constants/refinement';

import { resolveAllProfiles } from '../../utils/profileResolver';
import { safeJsonParse } from "../../utils/safeJsonParse";
import { ZodSchema, ZodError } from "zod";

const validateCognitiveLoad = async (loreEntries: LoreEntry[], voiceProfiles: VoiceProfile[]) => {
    const auditorActiveLore = loreEntries.filter(e => e.isActive);
    const auditorActiveVoices = voiceProfiles.filter(v => v.isActive);

    const loreContext = auditorActiveLore.map(l => 
        `${l.title}: ${l.description} ${l.sensoryPalette || ''}`
    ).join('\n');
    const voiceContext = auditorActiveVoices.map(v => 
        `${v.name}: ${v.soulPattern} ${v.cognitiveSpeech} ${v.coreMotivation}`
    ).join('\n');
    
    const totalContext = loreContext + voiceContext;
    const tokenCount = await countTokens(totalContext);

    if (tokenCount > 8000) { // Approx 8k tokens is a safe "high-fidelity" limit for standard flash
        throw new Error(`Cognitive Overload: Active Context exceeds safe high-fidelity limit (${tokenCount} / 8000 tokens). Deactivate non-essential Lore to protect Audit Fidelity.`);
    }
};

// Removed pruneContext; now in ./refineUtils.ts

const applyTemporalGating = <T extends { isTimelineEnabled?: boolean, isForeshadowing?: boolean, storyDate?: StoryDate, storyDay?: number }>(items: T[], currentAbsoluteDay: number, calendarConfig?: CalendarConfig): T[] => {
    return items.filter(item => {
        if (item.isForeshadowing) return true;
        if (item.isTimelineEnabled === false) return true;
        
        const itemAbsoluteDay = calendarConfig?.useCustomCalendar && item.storyDate
            ? calculateAbsoluteDay(item.storyDate, calendarConfig)
            : item.storyDay;
        if (itemAbsoluteDay === undefined || itemAbsoluteDay === null) return true;
        if (itemAbsoluteDay <= currentAbsoluteDay) return true;
        return false;
    });
};

const segmentText = (text: string): { text: string, start: number, end: number }[] => {
    if (!text.trim()) return [];
    
    // Split by scene breaks first
    const sceneBreaks = [/\n\s*\*\*\*\s*\n/, /\n\s*---\s*\n/, /\n\s*###\s*\n/];
    const segments: { text: string, start: number, end: number }[] = [];
    
    // Simple approach: split by double newlines if no scene breaks found
    const hasSceneBreak = sceneBreaks.some(regex => regex.test(text));
    
    if (hasSceneBreak) {
        // Complex split logic to keep track of offsets
        // For now, let's use a simpler split and approximate
        const parts = text.split(/\n\s*(?:\*\*\*|---|###)\s*\n/);
        let currentPos = 0;
        parts.forEach(part => {
            if (part.trim()) {
                const start = text.indexOf(part, currentPos);
                segments.push({
                    text: part.trim(),
                    start,
                    end: start + part.length
                });
                currentPos = start + part.length;
            }
        });
    } else {
        // Split by paragraph clusters (approx 500 words)
        const paragraphs = text.split(/\n\s*\n/);
        let currentGroup = "";
        let groupStart = 0;
        
        paragraphs.forEach((p, i) => {
            if (currentGroup.split(/\s+/).length > 500 || i === paragraphs.length - 1) {
                if (i === paragraphs.length - 1) currentGroup += (currentGroup ? "\n\n" : "") + p;
                
                const start = text.indexOf(currentGroup, groupStart);
                segments.push({
                    text: currentGroup.trim(),
                    start,
                    end: start + currentGroup.length
                });
                groupStart = start + currentGroup.length;
                currentGroup = "";
            } else {
                currentGroup += (currentGroup ? "\n\n" : "") + p;
            }
        });
    }
    
    return segments.filter(s => s.text.length > 0);
};

// Removed performNarrativeAlignmentPass; now in ./alignment.ts

export async function callWithInstructor<T>(payload: any, schema: ZodSchema<T>, maxRetries = 2): Promise<{ parsed: T, combinedThinking?: string, rawResult: any }> {
    let attempts = 0;
    let currentPrompt = payload.prompt;
    
    while (attempts <= maxRetries) {
        try {
            const apiPayload = {
                ...payload,
                prompt: currentPrompt,
                responseSchema: zodToGeminiSchema(schema)
            };
            
            const result = await callAiApi(apiPayload);
            const rawData = safeJsonParse((result.text || "{}").replace(/^```json\n?/, '').replace(/```$/, '').trim());
            
            const parsed = schema.parse(rawData);
            return {
                parsed,
                combinedThinking: result.candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.thought,
                rawResult: result
            };
        } catch (error) {
            attempts++;
            console.warn(`Instructor Zod Validation warning (Attempt ${attempts}):`, error);
            
            // If we run out of retries, still try to return the best-effort or throw if entirely malformed.
            // Usually, standard Instructor throws on final fail. We will throw.
            if (attempts > maxRetries) {
                if (error instanceof ZodError) {
                   throw new Error(`Instructor Validation Failed after ${maxRetries} retries: ${error.message}`);
                }
                throw error;
            }
            
            // Append Zod errors to prompt to force correction
            if (error instanceof ZodError) {
                currentPrompt += `\n\n[SYSTEM DIRECTIVE - SCHEMA VALIDATION FAILED on previous attempt]\nYou deviated from the JSON schema. Fix the following Zod Validation Errors and return valid JSON:\n${JSON.stringify(error.issues, null, 2)}\n`;
            } else {
                currentPrompt += `\n\n[SYSTEM DIRECTIVE - SCHEMA VALIDATION FAILED on previous attempt]\nUnknown error occurred: ${(error as any).message}\nPlease return valid JSON matching the exact requested schema.\n`;
            }
        }
    }
    throw new Error("Instructor Loop failed unexpectedly.");
}

import { refinementGraph } from './refineGraph';

export const refineDraft = async (options: RefineDraftOptions): Promise<RefineDraftResult> => {
// DELEGATED TO LANGGRAPH
  const store = useConfigStore.getState();
  const refinedOptions = {
      ...options,
      refinementModelOverride: options.refinementModelOverride || store.refinementModelOverride || undefined,
      reportModelOverride: options.reportModelOverride || store.reportModel || undefined,
      healingModelOverride: options.healingModelOverride || store.healingModelOverride || undefined,
  };
  
  const initialState = {
      draft: options.draft,
      options: refinedOptions,
      healingPasses: 0
  };

  const thread_id = options.sceneId ? `${options.sceneId}-${Date.now()}` : `refine-${Date.now()}`;
  const finalState = await refinementGraph.invoke(initialState, {
      configurable: {
          thread_id
      }
  });
  
  const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/^```markdown\n?/, '').replace(/```$/, '').trim();
  };
  
  return {
        text: cleanText(finalState.refinedText || ""),
        title: finalState.parsedRefinement?.title || "",
        summary: finalState.parsedRefinement?.editor_summary || "",
        internalCritique: finalState.parsedRefinement?.internal_critique || "",
        justification: finalState.parsedRefinement?.justification || "",
        collisionAnalysis: finalState.parsedRefinement?.collision_analysis || "",
        syncAudit: finalState.parsedRefinement?.sync_audit || "",
        whyBehindChange: finalState.parsedRefinement?.why_behind_change || "",
        evidenceBasedClaims: finalState.parsedRefinement?.evidence_based_claims || "",
        loreLineage: finalState.parsedRefinement?.lore_lineage || "",
        mirrorEditorCritique: finalState.parsedRefinement?.mirror_editor_critique || "",
        creative_scarring: finalState.parsedRefinement?.creative_scarring || [],
        mandate_compliance: finalState.parsedRefinement?.mandate_compliance || 0,
        restraintLog: finalState.parsedRefinement?.restraint_log || [],
        selfCorrections: (finalState.parsedRefinement?.self_correction_log || []).map((c: any) => ({
            issueDetected: c.issue_detected,
            correctionApplied: c.correction_applied,
            diagnosticRationale: c.diagnostic_rationale,
            originalSnippet: c.original_snippet,
            correctedSnippet: c.corrected_snippet
        })),
        thinking: finalState.combinedThinking || "",
        narrativeDensity: finalState.preFlight?.density?.primary || 'exposition',
        narrativeDensityMap: finalState.preFlight?.density || { primary: 'exposition', segments: [] },
        activeContext: {
            authorVoices: finalState.activeAuthorVoices?.map((v: any) => v.name) || [],
            characterVoices: finalState.activeVoices?.map((v: any) => v.name) || [],
            voiceSuites: (options.voiceSuites || []).filter((s: any) => s.isActive).map((s: any) => s.name),
            loreProfiles: finalState.activeLore?.map((l: any) => l.title) || [],
            focusAreas: options.focusAreas.map((f: any) => f as string),
            semanticLoreIds: finalState.preFlight?.semantic?.loreIds || [],
            semanticVoiceIds: finalState.preFlight?.semantic?.voiceIds || [],
            isReRefinement: options.isReRefinement || false,
            refinementMode: options.refinementMode,
            previousInternalCritique: options.previousInternalCritique,
            isPresetModified: options.isPresetModified || false,
            presetName: options.presetName,
            scope: options.scope || 'scene',
            isSurgical: options.isSurgical || false,
            baselinePillars: options.baselinePillars || false,
            polishDepth: options.feedbackDepth || 'balanced',
            model: finalState.generationConfig?.model || options.generationConfig?.model || 'gemini-3-flash-preview',
            thinkingLevel: finalState.generationConfig?.thinkingConfig?.thinkingLevel || 'default',
            temperature: finalState.generationConfig?.temperature || 1.0,
            customDirectives: options.customFocus || undefined
        },
        blueprint: finalState.blueprint,
        mandate: finalState.mandate,
        analysis: finalState.parsedAudit?.analysis || "Audit analysis skipped or failed.",
        metrics: finalState.parsedAudit?.metrics,
        entropy_metrics: finalState.entropyMetrics,
        audit: finalState.parsedAudit?.audit,
        conflicts: finalState.parsedAudit?.conflicts || [],
        loreCorrections: finalState.parsedAudit?.lore_corrections || [],
        loreFraying: finalState.parsedAudit?.lore_fraying || [],
        voiceAudits: finalState.parsedAudit?.voice_audits || [],
        healingPasses: finalState.healingPasses,
        fidelityScore: finalState.fidelityScore,
        threadId: thread_id,
        isSurgical: options.isSurgical || false,
        wordCountDelta: {
            added: Math.max(0, (finalState.refinedText?.split(/\s+/).length || 0) - (options.draft.split(/\s+/).length || 0)),
            removed: Math.max(0, (options.draft.split(/\s+/).length || 0) - (finalState.refinedText?.split(/\s+/).length || 0))
        }
  };
};