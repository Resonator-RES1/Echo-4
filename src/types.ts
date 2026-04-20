export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  absoluteDay: number;
  storyDay?: number;
  storyDate?: StoryDate;
  color?: string;
  icon?: string;
  tags?: string[];
  linkedEntityIds?: string[]; // Lore or Character IDs involved
  importance: 'background' | 'major' | 'catastrophic';
  isActive?: boolean;
  lastModified: string;
}

export interface ArcMilestone {
  id: string;
  absoluteDay: number;
  title: string;
  description: string;
  emotionalState: string;
  arcStatus: 'introduction' | 'development' | 'climax' | 'resolution';
}

export interface CharacterArc {
  id: string;
  voiceId: string; // Linked character
  title: string;
  description: string;
  milestones: ArcMilestone[];
  currentGoal: string;
  isActive?: boolean;
  lastModified: string;
}

export interface MemoryAxiom {
  id: string; // usually auto-generated or derived
  type: 'world_rule' | 'character_fact' | 'historical_event' | 'relationship_dynamic';
  scope: 'global' | 'local'; // global = always applies, local = specific to an entity
  entityIds: string[]; // Linked lore/voice IDs
  axiom: string; // The unbreakable rule, e.g., "Arin is missing his left hand."
  context?: string;
  lastSynthesized: string;
}

export interface ActiveContext {
  type: 'suite' | 'voice';
  id: string;
  name: string;
  promptInstructions: string;
  displayInfo: {
    icon: string;
    description: string;
  };
}

export interface ContinuityIssue {
    id: string;
    type: 'lore' | 'voice' | 'general' | 'timeline' | 'social' | 'conceptual' | 'fraying';
    message: string;
    suggestion?: string;
    severity: 'low' | 'medium' | 'high';
    actionable?: {
        original: string;
        replacement: string;
        suggestion?: string;
    };
    linkedEntryId?: string;
    suggestedProfileName?: string;
}

export interface NarrativeBlueprint {
  chapterArc: string;
  tonalSignature: string;
  foreshadowingNotes: string;
  priorityFocus: string;
}

export interface MechanicalMandate {
  axioms: string[];
  objectives: {
    p: number;
    t: string;
    r: string;
  }[];
  guardrails: string[];
}

export interface RemediationPayload {
  violation: string;
  segmentedDraft: string;
  context: string;
}

export interface ScannerInstances {
    miniSearch: any; // MiniSearch instance
}

export interface EditorProps {
    draft: string;
    setDraft: (draft: string) => void;
    scenes: SceneMetadata[];
    chapters: Chapter[];
    currentSceneId: string | null;
    setCurrentSceneId: (id: string) => void;
    setScenes: React.Dispatch<React.SetStateAction<SceneMetadata[]>>;
    setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onVersionCountChange?: (count: number) => void;
    onVersionHistoryChange?: (history: RefinedVersion[]) => void;
    versionHistory: RefinedVersion[];
    onAddVersion: (version: RefinedVersion) => void;
    onClearVersionHistory: () => void;
    onDeleteVersion: (id: string) => void;
    onUpdateVersion: (version: RefinedVersion) => void;
    onAcceptVersion: (version: RefinedVersion) => void;
}

export interface RefinePanelProps {
    draft: string;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onNewVersion: (version: RefinedVersion) => void;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    currentSceneId: string | null;
    sceneTitle?: string;
    chapterTitle?: string;
    projectName?: string;
    storyDay?: number;
    storyDate?: any;
    calendarConfig?: any;
    selection?: { text: string; start: number; end: number } | null;
    editorRef?: React.MutableRefObject<any>;
    setActiveTab?: (tab: WorkspaceTab) => void;
    localWarnings?: ContinuityIssue[];
}

export interface RefinementPresetsProps {
    getDraft: () => string;
    selection: { text: string; start: number; end: number } | null;
    isRefining: boolean;
    setIsRefining: (isRefining: boolean) => void;
    showToast: (message: string) => void;
    onNewVersion: (version: RefinedVersion) => void;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    authorVoices: AuthorVoice[];
    voiceSuites?: AuthorVoiceSuite[];
    voiceDNAs?: VoiceDNA[];
    onAddLoreEntry: (entry: LoreEntry) => void;
    onAddVoiceProfile: (profile: VoiceProfile) => void;
    onAddAuthorVoice: (voice: AuthorVoice) => void;
    currentSceneId: string | null;
    sceneTitle?: string;
    chapterTitle?: string;
    projectName?: string;
    storyDay?: number;
    storyDate?: any;
    calendarConfig?: any;
    editorRef?: React.MutableRefObject<any>;
    setActiveTab?: (tab: WorkspaceTab) => void;
    localWarnings?: ContinuityIssue[];
    preFetchedContext?: {
        lore: LoreEntry[];
        voices: VoiceProfile[];
        authorVoices?: AuthorVoice[];
        voiceSuites?: AuthorVoiceSuite[];
        voiceDNAs?: VoiceDNA[];
        isReady: boolean;
    };
}

export interface ArchivePanelProps {
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    originalDraft: string;
    onSelectVersion: (index: number) => void;
    onDeleteVersion: (id: string) => void;
    onUpdateVersion?: (version: RefinedVersion) => void;
    onClearHistory: () => void;
    showToast: (message: string) => void;
    setActiveTab: (tab: WorkspaceTab) => void;
    setActiveReviewVersion?: (version: RefinedVersion | null) => void;
}

export interface GenerationConfig {
    model: 'gemini-3.1-flash-lite-preview' | 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview';
    temperature?: number;
    thinkingConfig?: {
        thinkingLevel: 'minimal' | 'low' | 'default' | 'high';
    };
}

export interface AiPayload {
    model?: string;
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    thinkingConfig?: {
        thinkingLevel: 'minimal' | 'low' | 'default' | 'high';
    };
    responseSchema?: any;
    feedbackDepth?: FeedbackDepth;
    onStream?: (chunk: { text?: string; thinking?: string }) => void;
}

export interface RefineDraftOptions {
  draft: string;
  fullContextDraft?: string;
  selection?: { start: number; end: number; text: string };
  generationConfig: GenerationConfig;
  reportGenerationConfig: GenerationConfig;
  focusAreas: FocusArea[];
  customFocus?: string;
  loreEntries?: LoreEntry[];
  voiceProfiles?: VoiceProfile[];
  authorVoices?: AuthorVoice[];
  voiceSuites?: AuthorVoiceSuite[];
  voiceDNAs?: VoiceDNA[];
  customInstruction?: string;
  baselinePillars?: boolean;
  isPresetModified?: boolean;
  presetName?: string;
  chapterNumber?: number;
  storyDay?: number;
  storyDate?: StoryDate;
  calendarConfig?: CalendarConfig;
  previousEchoes?: RefinedVersion[];
  feedbackDepth?: FeedbackDepth;
  localWarnings?: ContinuityIssue[];
  isSurgical?: boolean;
  scope?: 'scene' | 'chapter';
  healingLoopActive?: boolean;
  isReRefinement?: boolean;
  previousInternalCritique?: string;
  loreComplianceThreshold?: number;
  draftingStance?: DraftingStance;
  onStream?: (chunk: { text?: string; thinking?: string }) => void;
}

export interface SelfCorrection {
  issueDetected: string;
  correctionApplied: string;
  diagnosticRationale: string;
  originalSnippet?: string;
  correctedSnippet?: string;
}

export interface NarrativeDensityMap {
  primary: 'action' | 'dialogue' | 'exposition';
  segments: {
    startIndex: number;
    endIndex: number;
    mode: 'action' | 'dialogue' | 'exposition';
    snippet: string;
  }[];
}

export interface RefineDraftResult {
  text: string;
  title: string;
  summary: string;
  internalCritique?: string;
  thinking?: string;
  analysis?: string;
  justification?: string;
  evidenceBasedClaims?: string;
  whyBehindChange?: string;
  loreLineage?: string;
  mirrorEditorCritique?: string;
  conflicts?: LoreConflict[];
  metrics?: ProseMetrics;
  creative_scarring?: CreativeScarring[];
  mandate_compliance?: number;
  expressionProfile?: { vibe: string; score: number; qualifier: 'By Design' | 'Opportunity'; note: string }[];
  loreCorrections: LoreCorrection[];
  loreFraying?: LoreFraying[];
  voiceAudits?: VoiceAudit[];
  thematic_resonance?: {
    score: number;
    alignment_analysis: string;
    impact_verdict: string;
  };
  narrative_entropy?: {
    drift_score: number;
    analysis: string;
    stability_verdict: 'Stable' | 'Intentional Drift' | 'Structural Fraying';
  };
  audit?: RefinementAudit;
  entropy_metrics?: EntropyMetrics;
  restraintLog?: { 
    category: string; 
    target: string; 
    justification: string; 
    originalSnippet: string;
    correctedSnippet: string;
  }[];
  selfCorrections?: SelfCorrection[];
  collisionAnalysis?: string;
  syncAudit?: string;
  blueprint?: NarrativeBlueprint;
  mandate?: MechanicalMandate;
  healingPasses?: number;
  narrativeDensity?: 'action' | 'dialogue' | 'exposition';
  narrativeDensityMap?: NarrativeDensityMap;
  activeContext: {
    authorVoices: string[];
    characterVoices: string[];
    voiceSuites: string[];
    loreProfiles: string[];
    focusAreas: string[];
    semanticLoreIds?: string[];
    semanticVoiceIds?: string[];
    scope: 'scene' | 'chapter';
    isSurgical: boolean;
    baselinePillars: boolean;
    feedbackDepth: string;
    model: string;
    temperature: number;
    thinkingLevel: string;
    polishDepth: string;
    isPresetModified: boolean;
    presetName?: string;
    customDirectives?: string;
  };
  isSurgical: boolean;
  threadId?: string;
}

export type FocusArea = 'tone' | 'rhythm' | 'emotion' | 'plot' | 'sensory' | 'mythic' | 'dialogue' | 'structural' | 'subtext' | 'visceral' | 'psychological' | 'worldbuilding' | 'imagery' | 'characterArc' | 'relationships' | 'tension' | 'thematic' | 'blocking' | 'voiceIntegrity' | 'clarity' | 'foreshadowing' | 'causality' | 'pov' | 'povIntegrity' | 'dialogueMechanics' | 'lexicalPalette' | 'transitionLogic' | 'causalityChain' | 'agencyAudit' | 'thematicResonance' | 'narrativeArc' | 'pacingPulsation';

export type Theme = 'ethereal' | 'midnight' | 'parchment' | 'obsidian' | 'forest' | 'crimson';

export type Gender = 'male' | 'female' | 'non-binary' | 'unspecified';

export interface Relationship {
  targetId: string;
  type: string;
  tension: 1 | 2 | 3 | 4 | 5;
  context: string;
}

export type VoiceModality = 'lens' | 'rhythm' | 'temporal' | 'narrator' | 'lexicon' | 'atmosphere';

export interface CalendarMonth {
  name: string;
  days: number;
}

export interface CalendarConfig {
  months: CalendarMonth[];
  useCustomCalendar: boolean;
  daysPerWeek?: number;
  eraName?: string;
  epochAnchor?: string; // The "Day 0" event description
}

export interface ChronologicalPoint {
  absoluteDay: number; // The integer source of truth
  anchorId?: string;   // Optional reference to a Lore Entry (e.g., "The Great Fire")
  offset?: number;     // Days relative to the anchor
}

export interface StoryDate {
  year: number;
  month: number; // 0-indexed
  day: number;
}

export interface VoiceDNA {
  id: string;
  name: string;
  proseDNA: {
    analytical: number;
    lyrical: number;
    visceral: number;
    abstract: number;
  };
  narrativeStyle: string;
  proseStructure: string;
  pacingRhythm: string;
  vocabularyDiction: string;
  thematicAnchors: string;
  exampleSnippets: string[];
  absoluteDay?: number;
  storyDay?: number;
  storyDate?: StoryDate;
  isForeshadowing?: boolean;
  isTimelineEnabled?: boolean;
  isEvolution?: boolean;
  parentId?: string;
  lastModified: string;
}

export interface AuthorVoiceSuite {
  id: string;
  name: string;
  description?: string;
  modalities: {
    narrator?: string; // VoiceDNA ID
    lens?: string;     // VoiceDNA ID
    rhythm?: string;   // VoiceDNA ID
    temporal?: string; // VoiceDNA ID
    lexicon?: string;  // VoiceDNA ID
    atmosphere?: string; // VoiceDNA ID
  };
  isActive?: boolean;
  lastModified: string;
}

export interface AuthorVoice {
  id: string;
  name: string;
  category: string; // e.g., "The Lens", "The Rhythm", "The Temporal Filter"
  modality: VoiceModality;
  icon?: string;
  voicePreview?: string;
  sideVoicePreviewSnippet?: string;
  narrativeStyle: string;
  proseStructure: string;
  pacingRhythm: string;
  vocabularyDiction: string;
  thematicAnchors: string;
  stylisticConstraints?: string[]; // NEW
  dna?: {
    analytical: number; // 0-100
    lyrical: number;
    visceral: number;
    abstract: number;
  };
  absoluteDay?: number;
  storyDay?: number;
  storyDate?: StoryDate;
  isForeshadowing?: boolean;
  isEvolution?: boolean;
  parentId?: string;
  lastModified: string;
  isActive?: boolean;
}

export interface MasterVoice {
  id: string;
  name: string;
  narrativeStyle: string;
  tone: string;
  vocabularyLevel: string;
  pacingPreference: string;
  description: string;
  signaturePhrases: string[];
  lastModified: string;
  isActive: boolean;
}

export interface LoreEntry {
  id: string;
  title: string;
  categoryId: string; // Reference to LoreCategory
  tags: string[];
  description: string;
  foundationalTruths?: string[]; // The "Axioms" or "Hard Rules" for the AI
  secretSubtext?: string;        // Hidden info the AI knows but doesn't reveal
  domainData?: Record<string, string>; // Unique fields tailored per domain type
  narrativeWeight?: 'background' | 'active' | 'pivotal'; // NEW
  aliases?: string[];
  gender?: string;
  sensoryPalette?: string;
  relations?: string;
  relationships?: Relationship[];
  lastModified: string;
  isActive?: boolean;
  absoluteDay?: number;
  storyDay?: number;
  storyDate?: StoryDate;
  isForeshadowing?: boolean;
  isTimelineEnabled?: boolean;
  isChronologicalAnchor?: boolean;
  isEvolution?: boolean;
  linkedEntityIds?: string[];
  embedding?: number[];
  isPinned?: boolean;
  axiomLevel?: 'absolute' | 'malleable';
  parentId?: string;
}

export interface LoreCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface VoiceCollection {
  id: string;
  name: string;
  description?: string;
  type: 'author' | 'character';
}


export interface AuthorialGoldStandard {
  id: string;
  label: string;
  snippet: string;
  createdAt: string;
}

export interface VoiceProfile {
  id: string;
  collectionId?: string;
  name: string;
  icon?: string;
  preview?: string;
  gender: Gender | 'other';
  archetype: string;
  arcState?: 'introduction' | 'development' | 'climax' | 'resolution'; // NEW
  emotionalBaseline?: 'stoic' | 'volatile' | 'melancholic' | 'optimistic'; // NEW
  coreMotivation: string;
  soulPattern: string;
  cognitiveSpeech: string;
  signatureTraits: string[];
  idioms: string[];
  exampleLines: string[];
  conflictStyle: string;
  conversationalRole: string;
  physicalTells: string[];
  internalMonologue: string;
  socialDynamics: string;
  relationships: Relationship[];
  aliases?: string[];
  dna?: {
    warmth: number;
    dominance: number;
    stability: number;
    complexity: number;
  };
  dnaDescriptions?: {
    warmth: string;
    dominance: string;
    stability: string;
    complexity: string;
  };
  absoluteDay?: number;
  storyDay?: number;
  storyDate?: StoryDate;
  isForeshadowing?: boolean;
  isTimelineEnabled?: boolean;
  lastModified: string;
  isActive?: boolean;
  isPinned?: boolean;
  antiMannerisms?: string[];
  isEvolution?: boolean;
  parentId?: string;
  goldStandardSnippets?: AuthorialGoldStandard[];
}

export interface LoreConflict {
  sentence: string;
  reason: string;
}

export interface ProseMetric {
  score: number;
  note: string;
  qualifier: 'By Design' | 'Opportunity';
  tierLabel?: string;
}

export interface ProseMetrics {
  sensory_vividness: ProseMetric;
  pacing_rhythm: ProseMetric;
  dialogue_authenticity: ProseMetric;
  voice_consistency: Omit<ProseMetric, 'qualifier'> & { qualifier: 'By Design' };
}

export interface RefinementAudit {
  voiceFidelityScore: number;
  voiceFidelityReasoning: string;
  loreCompliance: number;
  loreComplianceReasoning: string;
  voiceAdherence: number;
  voiceAdherenceReasoning: string;
  focusAreaAlignment: number;
  focusAreaAlignmentReasoning: string;
  tierLabel?: string;
  evolution_audit?: {
    improvement_delta: number;
    analysis: string;
    is_success: boolean;
  };
  strategy?: {
    recommendedFocusAreas: FocusArea[];
    recommendedPresets: string[];
    customDirectives: string[];
    reasoning: string;
  };
}

export interface EntropySegment {
  id: string;
  text: string;
  entropy_score: number;
  violation?: 'low_perplexity' | 'low_burstiness' | 'ai_ism' | 'grammatical_perfection' | 'none';
  fix_suggestion?: string;
}

export interface EntropyMetrics {
  type_token_ratio: number;
  sentence_variance: number;
  polarity_score: number;
  sludge_density: number;
  entropy_map: EntropySegment[];
}

export interface LoreCorrection {
  original: string;
  refined: string;
  reason: string;
  originalSnippet?: string;
  correctedSnippet?: string;
}

export interface LoreFraying {
  snippet: string;
  conflict: string;
  suggestion: string;
}

export interface VoiceAudit {
  characterName: string;
  resonanceScore: number; // 0-10 scale
  dissonanceReason?: string; // e.g., "Anya sounds too formal here."
  snippet?: string;
  arc_intent?: {
    type: 'alignment' | 'divergence' | 'intentional_evolution';
    rationale: string;
  };
}

export interface DisplayPrefs {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  maxWidth: string;
  fontFamily: 'serif' | 'sans';
  dynamicFontScaling?: boolean;
}

export interface RefinedVersion {
  healingPasses?: number;
  threadId?: string;
  id: string;
  text: string;
  timestamp: string;
  internalCritique?: string;
  thinking?: string;
  title?: string;
  summary?: string;
  analysis?: string;
  justification?: string;
  evidenceBasedClaims?: string;
  whyBehindChange?: string;
  loreLineage?: string;
  mirrorEditorCritique?: string;
  conflicts?: LoreConflict[];
  metrics?: ProseMetrics;
  creative_scarring?: CreativeScarring[];
  mandate_compliance?: number;
  loreCorrections?: LoreCorrection[];
  loreFraying?: LoreFraying[];
  voiceAudits?: VoiceAudit[];
  thematic_resonance?: {
    score: number;
    alignment_analysis: string;
    impact_verdict: string;
  };
  narrative_entropy?: {
    drift_score: number;
    analysis: string;
    stability_verdict: 'Stable' | 'Intentional Drift' | 'Structural Fraying';
  };
  audit?: RefinementAudit;
  entropy_metrics?: EntropyMetrics;
  restraintLog?: { 
    category: string; 
    target: string; 
    justification: string; 
    originalSnippet: string;
    correctedSnippet: string;
  }[];
  selfCorrections?: SelfCorrection[];
  collisionAnalysis?: string;
  syncAudit?: string;
  blueprint?: NarrativeBlueprint;
  mandate?: MechanicalMandate;
  narrativeDensity?: 'action' | 'dialogue' | 'exposition';
  narrativeDensityMap?: NarrativeDensityMap;
  expressionProfile?: { vibe: string; score: number; qualifier: 'By Design' | 'Opportunity'; note: string }[];
  activeContext?: {
    authorVoices: string[];
    characterVoices: string[];
    voiceSuites: string[];
    loreProfiles: string[];
    focusAreas: string[];
    semanticLoreIds?: string[];
    semanticVoiceIds?: string[];
    isPresetModified: boolean;
    presetName?: string;
    scope?: 'scene' | 'chapter';
    isSurgical?: boolean;
    baselinePillars?: boolean;
    isReRefinement?: boolean;
    refinementMode?: 'regular' | 'post-audit';
    previousInternalCritique?: string;
    polishDepth?: string;
    model?: string;
    thinkingLevel?: string;
    temperature?: number;
    customDirectives?: string;
  };
  sceneId?: string;
  isAccepted?: boolean;
  isSurgical?: boolean;
  isPinned?: boolean;
  milestoneLabel?: string;
  wordCountDelta?: { added: number; removed: number };
  originalText?: string;
  originalSelection?: string;
  refinedSelection?: string;
  usedProfiles?: {
    authorVoices?: string[];
    characterVoices?: string[];
    voiceSuites?: string[];
    loreEntries?: string[];
    focusAreas?: FocusArea[];
  };
}

export interface UserPreset {
  id: string;
  name: string;
  description?: string;
  focusAreas: FocusArea[];
  depth: FeedbackDepth;
  model: 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview';
  customFocus?: string;
  lastModified: string;
}

export interface PromptFragment {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'style' | 'constraint' | 'directive' | 'character' | 'world';
  tags: string[];
  lastModified: string;
  isActive: boolean;
}

export interface WritingGoal {
  targetWords: number;
  deadline?: string;
  dailyTarget?: number;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  sceneIds: string[];
}

export type DraftStage = 'outline' | 'draft-zero' | 'script' | 'prose' | 'polished';

export type DraftingStance = 'Standard Prose' | 'Treatment Expansion' | 'Script-to-Prose' | 'Vomit Refinement' | 'Epistolary';

export interface SceneMetadata {
  id: string;
  projectId?: string;
  chapterId?: string;
  title: string;
  order: number;
  lastModified: string;
  hasEcho?: boolean;
  absoluteDay?: number;
  storyDay?: number;
  storyDate?: StoryDate;
  storyTime?: string;
  wordCount?: number;
  draftStage?: DraftStage;
}

export interface Scene extends SceneMetadata {
  content: string;
}

export interface SurgicalSnapshot {
  id: string;
  sceneId: string;
  text: string;
  timestamp: string;
  label?: string;
}

export interface DensityPoint {
  offset: number; // 0-100 percentage
  type: 'lore' | 'voice' | 'issue';
  id: string;
  label: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface DensityMap {
  points: DensityPoint[];
}

export type TimelineNodeType = 'scene' | 'lore' | 'voice' | 'authorVoice' | 'event' | 'arcMilestone';

export interface TimelineNode {
  id: string;
  type: TimelineNodeType;
  title: string;
  description?: string;
  absoluteDay: number;
  storyDate?: StoryDate;
  storyDay?: number;
  isForeshadowing?: boolean;
  color?: string;
  icon?: string;
  tags?: string[];
  // Specific references
  sceneId?: string;
  loreId?: string;
  voiceId?: string;
  authorVoiceId?: string;
  eventId?: string;
  arcId?: string;
}

export type Screen = 'welcome' | 'workspace' | 'lore' | 'voices' | 'manuscript' | 'settings' | 'timeline';

export type WorkspaceTab = 'draft' | 'context' | 'workbench' | 'refine' | 'archive' | 'report' | 'polished';

export type RefineMode = 'collaborative' | 'review' | 'reaction';
export type ReviewPerspective = 'editor' | 'reader' | 'critic';
export type FeedbackDepth = 'casual' | 'balanced' | 'in-depth';

export interface CreativeScarring {
  snippet: string;
  rationale: string;
  dna_alignment: string;
}

export interface IntensityProfile {
    maxHealingPasses: number;
    auditComplexity: 'standard' | 'ruthless' | 'exhaustive';
    temperatureBias: number;
}

export interface GuideExample {
  before: string;
  after: string;
}

export interface GuideItem {
  title: string;
  description: string;
  example?: GuideExample;
  proTips?: string[];
}

export interface GuideCategory {
  title: string;
  items: GuideItem[];
}

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  features?: string[];
  categories: GuideCategory[];
  hideFromQuickGuide?: boolean;
}
