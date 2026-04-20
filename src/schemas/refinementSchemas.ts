import { z } from 'zod';

/**
 * Narrative Metrics (The "Pulse" of the prose)
 */
export const ProseMetricSchema = z.object({
  score: z.number().min(0).max(10).describe("0-10 scale of fidelity/quality"),
  note: z.string().describe("Brief explanation of why this score was given"),
  qualifier: z.enum(['By Design', 'Opportunity']).describe("'By Design' = character quirk, 'Opportunity' = area for technical improvement")
});

export const ProseHistorySchema = z.object({
  sensory_vividness: ProseMetricSchema,
  pacing_rhythm: ProseMetricSchema,
  dialogue_authenticity: ProseMetricSchema,
  voice_consistency: ProseMetricSchema
});

/**
 * Creative Scarring / Friction Preservation
 * Based on the Kintsugi philosophy: we don't fix what makes the author unique.
 */
export const CreativeScarringSchema = z.object({
  snippet: z.string().describe("The specific awkward, non-standard, or 'ugly' line that was preserved"),
  rationale: z.string().describe("Why this line was left alone (e.g., 'Character voice requires this specific linguistic friction')"),
  dna_alignment: z.string().describe("Which Voice DNA trait this maps to")
});

/**
 * The Refinement Logic (Pass 2)
 */
export const RefinementOutputSchema = z.object({
  internal_critique: z.string().describe("Step-by-step reasoning used by the AI before writing"),
  refined_text: z.string().describe("The final polished prose"),
  title: z.string().optional().describe("Suggested title for the scene/fragment"),
  editor_summary: z.string().describe("High-level overview of the narrative intent behind the changes"),
  justification: z.string().describe("Mechanical reasons for the most significant shifts"),
  collision_analysis: z.string().describe("How character relationships interacted in this draft"),
  sync_audit: z.string().describe("Integrity check between internal mental state and physical action"),
  
  // High-Fidelity Simulator Fields
  why_behind_change: z.string().optional().describe("The socio-narrative or technical 'Why' behind the specific shifts"),
  evidence_based_claims: z.string().optional().describe("Specific lore or voice anchors used to defend this refinement"),
  lore_lineage: z.string().optional().describe("Analysis of how this refinement maintains continuity with previous drafts and world facts"),
  mirror_editor_critique: z.string().optional().describe("Self-critical analysis of the refinement's potential stylistic drift"),
  
  creative_scarring: z.array(CreativeScarringSchema).describe("List of intentional 'flaws' preserved to maintain author frequency"),
  mandate_compliance: z.number().min(0).max(100).describe("0-100 score of how well the AI followed the Mechanical Mandate"),
  
  restraint_log: z.array(z.object({
    category: z.string(),
    target: z.string(),
    justification: z.string(),
    original_snippet: z.string(),
    corrected_snippet: z.string()
  })),
  
  self_correction_log: z.array(z.object({
    issue_detected: z.string(),
    correction_applied: z.string(),
    diagnostic_rationale: z.string().describe("The reasoning behind why this self-correction was necessary"),
    original_snippet: z.string(),
    corrected_snippet: z.string()
  }))
});

export const EntropySegmentSchema = z.object({
  id: z.string(),
  text: z.string().describe("The specific fragment of text"),
  entropy_score: z.number().min(0).max(1).describe("0 is Sludge (Red), 1 is Grit (Green)"),
  violation: z.enum(["low_perplexity", "low_burstiness", "ai_ism", "grammatical_perfection", "none"]).optional(),
  fix_suggestion: z.string().optional(),
});

export const EntropyMetricsSchema = z.object({
  type_token_ratio: z.number().describe("Lexical diversity (Unique words / Total words)"),
  sentence_variance: z.number().describe("Burstiness (Sigma)"),
  polarity_score: z.number().describe("Percentage of sequences following the 'Jagged Heartbeat' (Long followed by punchy short)"),
  sludge_density: z.number().describe("Percentage of detected AI-isms or placeholder phrases"),
  entropy_map: z.array(EntropySegmentSchema).describe("Surgical blueprint for refinement")
});

/**
 * The Audit Logic (Pass 3 - The Cynical Mirror)
 */
export const AuditOutputSchema = z.object({
  analysis: z.string().describe("Deep diagnostic analysis of the refined prose"),
  metrics: ProseHistorySchema.describe("Technical prose performance metrics (Sensory, Pacing, Dialogue, Voice Consistency)"),
  entropy_metrics: EntropyMetricsSchema.optional().describe("Advanced entropy and diagnostic metrics (Entropy-Hardened)"),
  audit: z.object({
    voiceFidelityScore: z.number().min(0).max(10),
    voiceFidelityReasoning: z.string(),
    loreCompliance: z.number().min(0).max(10),
    loreComplianceReasoning: z.string(),
    voiceAdherence: z.number().min(0).max(10),
    voiceAdherenceReasoning: z.string(),
    focusAreaAlignment: z.number().min(0).max(10),
    focusAreaAlignmentReasoning: z.string(),
    evolution_audit: z.object({
      improvement_delta: z.number().describe("0-10 score of how effectively previous critiques were addressed"),
      analysis: z.string().describe("How the prose has evolved since the last iteration"),
      is_success: z.boolean().describe("Whether this pass effectively improved upon the previous version")
    }).optional(),
    strategy: z.object({
      recommendedFocusAreas: z.array(z.string()).describe("MUST be valid labels from the focusAreaOptions listing"),
      recommendedPresets: z.array(z.string()).describe("MUST be valid names from the SOVEREIGN_PRESETS listing"),
      customDirectives: z.array(z.string()),
      reasoning: z.string()
    })
  }),
  conflicts: z.array(z.object({
    sentence: z.string(),
    reason: z.string()
  })),
  lore_corrections: z.array(z.object({
    original: z.string(),
    refined: z.string(),
    reason: z.string(),
    original_snippet: z.string(),
    corrected_snippet: z.string()
  })),
  lore_fraying: z.array(z.object({
    snippet: z.string(),
    conflict: z.string(),
    suggestion: z.string()
  })),
  thematic_resonance: z.object({
    score: z.number().min(0).max(10),
    alignment_analysis: z.string().describe("How this prose serves the Chapter Arc and Tonal Signature from the blueprint"),
    impact_verdict: z.string().describe("The emotional or narrative 'So What?' factor of the refinement")
  }),
  narrative_entropy: z.object({
    drift_score: z.number().min(0).max(10).describe("0 = perfectly stable, 10 = extreme structural decay"),
    sludge_score: z.number().min(0).max(10).describe("0 = Zero Sludge, 10 = Clinical/Generic prose"),
    analysis: z.string().describe("Longitudinal analysis of how the prose style is shifting compared to previous echoes and AI propensities"),
    stability_verdict: z.enum(['Stable', 'Intentional Drift', 'Structural Fraying', 'AI_Sludge_Saturation'])
  }),
  voice_audits: z.array(z.object({
    characterName: z.string(),
    resonanceScore: z.number().min(0).max(10),
    dissonanceReason: z.string().optional(),
    arc_intent: z.object({
      type: z.enum(['alignment', 'divergence', 'intentional_evolution']),
      rationale: z.string().describe("Explanation for why this voice has shifted (or stayed the same) relative to its 'Evolutions' history")
    })
  })),
  axiom_collisions: z.array(z.object({
    axiomId: z.string(),
    axiomSummary: z.string().describe("The text of the violated axiom"),
    violationSnippet: z.string().describe("The snippet in the refined text that violates the axiom"),
    diagnostic: z.string().describe("Detailed logical breakdown of why this is a collision")
  })).describe("Direct contradictions found against the synthesized Echo Dynamic Memory")
});

export type RefinementOutput = z.infer<typeof RefinementOutputSchema>;
export type AuditOutput = z.infer<typeof AuditOutputSchema>;
export type CreativeScarring = z.infer<typeof CreativeScarringSchema>;

/**
 * Pre-Flight Scoping Logic (Pass 1a)
 */
export const PreFlightOutputSchema = z.object({
  density: z.object({
    primary: z.enum(['action', 'dialogue', 'exposition']),
    segments: z.array(z.object({
      startIndex: z.number(),
      endIndex: z.number(),
      mode: z.enum(['action', 'dialogue', 'exposition']),
      snippet: z.string()
    }))
  }),
  semantic: z.object({
    loreIds: z.array(z.string()),
    voiceIds: z.array(z.string()),
    axiomIds: z.array(z.string()).describe("IDs of specific Memory Axioms detected in the text.")
  })
});

/**
 * Narrative Alignment Logic (Pass 1b)
 */
export const NarrativeAlignmentOutputSchema = z.object({
  blueprint: z.object({
    chapterArc: z.string(),
    tonalSignature: z.string(),
    foreshadowingNotes: z.string(),
    priorityFocus: z.string()
  }),
  mandate: z.object({
    axioms: z.array(z.string()),
    objectives: z.array(z.object({
      p: z.number(),
      t: z.string(),
      r: z.string()
    })),
    guardrails: z.array(z.string())
  })
});

export type PreFlightOutput = z.infer<typeof PreFlightOutputSchema>;
export type NarrativeAlignmentOutput = z.infer<typeof NarrativeAlignmentOutputSchema>;

