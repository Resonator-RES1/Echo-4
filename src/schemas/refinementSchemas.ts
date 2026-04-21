import { z } from 'zod';

/**
 * Helper for fields that occasionally arrive as strings from LLMs despite object schema.
 */
const resilientRecord = <T extends z.ZodTypeAny>(valueSchema: T) => 
  z.union([
    z.record(z.string(), valueSchema),
    z.string().transform((val): Record<string, z.infer<T>> => {
      try {
        return JSON.parse(val);
      } catch (e) {
        console.warn("Structural repair: Failed to parse stringified record:", val);
        return {} as Record<string, z.infer<T>>;
      }
    })
  ]);

/**
 * Profile Evolution Signal (VPI v1.0)
 */
export const ProfileEvolutionSchema = z.object({
  profile_id: z.string(),
  shifts: z.object({
    tone: z.string().optional(),
    emotional_access: z.string().optional(),
    speech_style: z.string().optional()
  }).catchall(z.string()).or(z.string().transform(v => {
    try { return JSON.parse(v); } catch(e) { return {}; }
  })).describe("Field-level shifts detected"),
  trigger: z.string().describe("What triggered this shift in the scene"),
  suggested_new_level: z.number().optional().describe("e.g. power_access shift")
});

export const SentenceTraceSchema = z.object({
  sentence_id: z.number(),
  text: z.string(),
  influences: z.object({
    world: z.number().optional(),
    structure: z.number().optional(),
    cpi: z.number().optional(),
    instability: z.number().optional(),
    author_intent: z.number().optional(),
    profile_voice: z.number().optional()
  }).catchall(z.number()).or(z.string().transform(v => {
    try { return JSON.parse(v); } catch(e) { return {}; }
  })).describe("Force weights from World, Identity, CPI, Instability, Author Intent, Structure, Expression"),
  dominant_force: z.string(),
  suppressed_forces: z.array(z.string()),
  coherence_pressure: z.number().min(0).max(1),
  tension: z.number().min(0).max(1).describe("tension = max_force - min_force + variance_between_forces")
});

export const DebugTraceSchema = z.object({
  sentence_map: z.array(SentenceTraceSchema),
  layer_influence_matrix: z.object({
    world: z.number().optional(),
    identity: z.number().optional(),
    structure: z.number().optional(),
    author_intent: z.number().optional()
  }).catchall(z.number()).or(z.string().transform(v => {
    try { return JSON.parse(v); } catch(e) { return {}; }
  })).describe("Global dominance weights for the scene"),
  tension_hotspots: z.array(z.number()).describe("IDs of sentences with High tension (> 0.7)"),
  overcorrection_events: z.array(z.object({
    sentence_id: z.number(),
    type: z.string(),
    cause: z.string(),
    effect: z.string()
  })),
  preserved_conflicts: z.array(z.object({
    conflict: z.string(),
    resolution: z.string(),
    residual_tension: z.number(),
    manifestation: z.string()
  }))
});

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
  structural_audit: z.string().optional().describe("Critique of MRU fulfillment and MSF compliance"),
  
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
  })),
  
  // VPI & TVDI Support (Added to base refinement for pass-through consistency)
  profile_evolution_signals: z.array(ProfileEvolutionSchema).optional().describe("VPI v1.0 Feedback Loop: Suggested identity shifts"),
  debug_trace: DebugTraceSchema.optional().describe("TVDI v1.0: Instrumentation data for diagnostic mapping")
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
    tension_audit: z.array(z.object({
      axis: z.enum(['integrity', 'survival', 'cognition', 'performance', 'social']),
      resolutionScore: z.number().min(0).max(10).describe("How well the prose balanced the character's surface performance vs their hidden essence"),
      is_authentic_inconsistency: z.boolean().describe("Whether this specific line was a 'crack' that was true to the character's deeper truth"),
      diagnostic: z.string()
    })).optional(),
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

/**
 * Layer 1: World Layer Output (Truth Lock)
 */
export const WorldLayerOutputSchema = z.object({
  world_facts: z.array(z.string()).describe("List of facts verified as true against active lore"),
  world_violations: z.array(z.object({
    original_text: z.string(),
    error: z.string(),
    fix: z.string()
  })).describe("Factual contradictions identified"),
  corrected_facts: z.array(z.string()).describe("Factual adjustments passed forward"),
  locked_constraints: z.array(z.string()).describe("Constants that must not be altered by downstream layers"),
  annotated_draft: z.string().describe("The draft with factual corrections applied, but NO stylistic changes")
});

/**
 * Layer 2: Narrative Control Layer Output (Structure Pass)
 */
export const NarrativeLayerOutputSchema = z.object({
  scene_structure: z.object({
    beats: z.array(z.object({
      id: z.string(),
      type: z.enum(['arrival', 'exchange', 'climax', 'revelation', 'sensory', 'action', 'dialogue', 'internal']),
      importance: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string()
    })),
    pacing: z.enum(['slow-burn', 'medium', 'fast', 'frenetic']),
    emotional_curve: z.string().describe("e.g. 'rise → tension spike → concealment'"),
    structural_density: z.enum(['compact', 'standard', 'expansive']).describe("Guidance for paragraph length and MRU depth")
  }),
  focus_weights: z.object({
    sensory: z.number().min(0).max(1),
    dialogue: z.number().min(0).max(1),
    action: z.number().min(0).max(1),
    exposition: z.number().min(0).max(1)
  }),
  reordering_suggestions: z.array(z.string()).describe("Beat IDs in recommended order")
});

/**
 * Layer 3: Expression Planning Layer (Intent + Imperfection Allocation)
 */
export const ExpressionPlanningSchema = z.object({
  render_plan: z.array(z.object({
    beat_id: z.string(),
    intended_tone: z.string(),
    linguistic_style: z.string(),
    allowed_variance: z.enum(['low', 'moderate', 'high'])
  })),
  expression_constraints: z.object({
    coherence_pressure: z.number().min(0).max(1),
    imperfection_budget: z.object({
      hesitations: z.number(),
      redundancies: z.number(),
      rhythm_breaks: z.number(),
      emotional_overlap_events: z.number()
    })
  }),
  human_noise_signature: z.object({
    style_drift: z.number().min(0).max(1),
    attention_instability: z.number().min(0).max(1),
    emotional_overlap: z.number().min(0).max(1)
  }).optional()
});


/**
 * Layer 4: Expression Renderer Output (Final Generation)
 */
export const ExpressionOutputSchema = z.object({
  internal_critique: z.string().describe("Step-by-step reasoning used by the AI before writing"),
  final_text: z.string().describe("The final polished prose with controlled imperfections"),
  title: z.string().optional().describe("Suggested title for the scene/fragment"),
  used_imperfections: z.object({
    hesitations: z.number(),
    redundancies: z.number(),
    rhythm_breaks: z.number()
  }).describe("Accounting of imperfections utilized in the rendering"),
  unresolved_micro_variance: z.array(z.string()).describe("Specific instances of preserved human noise"),
  structural_compliance: z.object({
    mru_fulfillment: z.number().min(0).max(100),
    paragraphing_integrity: z.number().min(0).max(100),
    MSF_adherence: z.string()
  }).describe("SFE v1.0 Structure & Format Engine metrics"),
  profile_evolution_signals: z.array(ProfileEvolutionSchema).optional().describe("VPI v1.0 Feedback Loop: Suggested identity shifts"),
  debug_trace: DebugTraceSchema.optional().describe("TVDI v1.0: Instrumentation data for diagnostic mapping")
});

export type WorldLayerOutput = z.infer<typeof WorldLayerOutputSchema>;
export type NarrativeLayerOutput = z.infer<typeof NarrativeLayerOutputSchema>;
export type ExpressionPlanning = z.infer<typeof ExpressionPlanningSchema>;
export type ExpressionOutput = z.infer<typeof ExpressionOutputSchema>;

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

