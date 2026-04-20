import { z } from 'zod';

export const relationshipSchema = z.object({
  targetId: z.string().min(1, "Target is required"),
  type: z.string().min(1, "Type is required"),
  tension: z.number().min(1).max(5),
  context: z.string().optional(),
});

export const storyDateSchema = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
});

export const loreEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.string().optional(), // Comma separated
  description: z.string().optional(),
  foundationalTruths: z.string().optional(), // We'll handle split in form or keep as string handled by form array
  secretSubtext: z.string().optional(),
  domainData: z.record(z.string()).optional(),
  narrativeWeight: z.enum(['background', 'active', 'pivotal']).optional(), // NEW
  aliases: z.string().optional(), // Comma separated
  gender: z.string().optional(),
  sensoryPalette: z.string().optional(),
  relations: z.string().optional(),
  storyDay: z.number().optional(),
  storyDate: storyDateSchema.optional(),
  isForeshadowing: z.boolean().optional(),
  isTimelineEnabled: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  axiomLevel: z.enum(['absolute', 'malleable']).optional(),
  relationships: z.array(relationshipSchema).optional(),
  isEvolution: z.boolean().optional(),
  parentId: z.string().optional(),
});

export type LoreEntryFormValues = z.infer<typeof loreEntrySchema>;

export const authorialGoldStandardSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  snippet: z.string().min(1, "Snippet is required"),
  createdAt: z.string(),
});

export const voiceProfileSchema = z.object({
  id: z.string().optional(),
  collectionId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  gender: z.enum(['male', 'female', 'non-binary', 'unspecified', 'other']).optional(),
  archetype: z.string().optional(),
  arcState: z.enum(['introduction', 'development', 'climax', 'resolution']).optional(), // NEW
  emotionalBaseline: z.enum(['stoic', 'volatile', 'melancholic', 'optimistic']).optional(), // NEW
  coreMotivation: z.string().optional(),
  soulPattern: z.string().optional(),
  cognitiveSpeech: z.string().optional(),
  conflictStyle: z.string().optional(),
  conversationalRole: z.string().optional(),
  physicalTells: z.array(z.object({ value: z.string() })).optional(),
  internalMonologue: z.string().optional(),
  socialDynamics: z.string().optional(),
  storyDay: z.number().optional(),
  storyDate: storyDateSchema.optional(),
  isForeshadowing: z.boolean().optional(),
  isTimelineEnabled: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  antiMannerisms: z.string().optional(), // Comma separated
  signatureTraits: z.string().optional(), // Comma separated
  idioms: z.string().optional(), // Comma separated
  exampleLines: z.array(z.object({ value: z.string() })).optional(),
  aliases: z.string().optional(), // Comma separated
  relationships: z.array(relationshipSchema).optional(),
  isEvolution: z.boolean().optional(),
  parentId: z.string().optional(),
  goldStandardSnippets: z.array(authorialGoldStandardSchema).optional(),
  dna: z.object({
    warmth: z.number().min(0).max(100),
    dominance: z.number().min(0).max(100),
    stability: z.number().min(0).max(100),
    complexity: z.number().min(0).max(100),
  }).optional(),
  dnaDescriptions: z.object({
    warmth: z.string().optional(),
    dominance: z.string().optional(),
    stability: z.string().optional(),
    complexity: z.string().optional(),
  }).optional(),
});

export type VoiceProfileFormValues = z.infer<typeof voiceProfileSchema>;

export const authorVoiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  modality: z.enum(['lens', 'rhythm', 'temporal', 'narrator', 'lexicon', 'atmosphere']).optional(),
  narrativeStyle: z.string().optional(),
  proseStructure: z.string().optional(),
  pacingRhythm: z.string().optional(),
  vocabularyDiction: z.string().optional(),
  thematicAnchors: z.string().optional(),
  stylisticConstraints: z.array(z.string()).optional(), // NEW
  storyDay: z.number().optional(),
  storyDate: storyDateSchema.optional(),
  isForeshadowing: z.boolean().optional(),
  isTimelineEnabled: z.boolean().optional(),
  sideVoicePreviewSnippet: z.string().optional(),
  isEvolution: z.boolean().optional(),
  parentId: z.string().optional(),
  dna: z.object({
    analytical: z.number().min(0).max(100),
    lyrical: z.number().min(0).max(100),
    visceral: z.number().min(0).max(100),
    abstract: z.number().min(0).max(100),
  }).optional(),
});

export type AuthorVoiceFormValues = z.infer<typeof authorVoiceSchema>;

export const voiceDNASchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  proseDNA: z.object({
    analytical: z.number().min(0).max(100),
    lyrical: z.number().min(0).max(100),
    visceral: z.number().min(0).max(100),
    abstract: z.number().min(0).max(100),
  }),
  narrativeStyle: z.string().min(1, "Narrative Style is required"),
  proseStructure: z.string().min(1, "Prose Structure is required"),
  pacingRhythm: z.string().min(1, "Pacing & Rhythm is required"),
  vocabularyDiction: z.string().min(1, "Vocabulary & Diction is required"),
  thematicAnchors: z.string().min(1, "Thematic Anchors is required"),
  storyDay: z.number().optional(),
  storyDate: storyDateSchema.optional(),
  isForeshadowing: z.boolean().optional(),
  isTimelineEnabled: z.boolean().optional(),
  isEvolution: z.boolean().optional(),
  parentId: z.string().optional(),
  exampleSnippets: z.array(z.object({ value: z.string() })).optional(),
});

export type VoiceDNAFormValues = z.infer<typeof voiceDNASchema>;

export const authorVoiceSuiteSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  modalities: z.object({
    narrator: z.string().optional(),
    lens: z.string().optional(),
    rhythm: z.string().optional(),
    temporal: z.string().optional(),
    lexicon: z.string().optional(),
    atmosphere: z.string().optional(),
  }),
});

export type AuthorVoiceSuiteFormValues = z.infer<typeof authorVoiceSuiteSchema>;

export const masterVoiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  narrativeStyle: z.string().min(1, "Narrative Style is required"),
  tone: z.string().min(1, "Tone is required"),
  vocabularyLevel: z.string().min(1, "Vocabulary Level is required"),
  pacingPreference: z.string().min(1, "Pacing Preference is required"),
  description: z.string().min(1, "Description is required"),
  signaturePhrases: z.array(z.object({ value: z.string() })).optional(),
});

export type MasterVoiceFormValues = z.infer<typeof masterVoiceSchema>;
