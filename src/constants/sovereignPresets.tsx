import React from 'react';
import { FocusArea, FeedbackDepth } from '../types';
import { Scan, Sparkles, Scissors, Globe, Zap, Map, Users, Flame, Layers, FlaskConical, EyeOff, Ruler, Fingerprint, Camera, Quote, Palette, Link, GitBranch, UserCircle, Compass } from 'lucide-react';

export type PresetCategory = 'Prose' | 'Structural' | 'Character' | 'Thematic' | 'Pacing';

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  focusAreas: FocusArea[];
  depth: FeedbackDepth;
  model: 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite-preview' | 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.5-flash-lite';
  color: string;
  category: PresetCategory;
  customDirective?: string;
  benefit?: string;
  baselinePillars?: boolean;
}

export const SOVEREIGN_PRESETS: Preset[] = [
  {
    id: 'cynical-mirror',
    name: 'Cynical Mirror',
    description: 'A ruthless audit of narrative logic, causality, and structural integrity.',
    icon: <Scan className="w-5 h-5" />,
    focusAreas: ['plot', 'subtext', 'structural', 'causality', 'transitionLogic'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-primary',
    category: 'Structural',
    customDirective: "Adopt the persona of a ruthless developmental editor. Hunt for 'Deus Ex Machina', convenient plot coincidences, and logical leaps. Every action must be an inevitable consequence of a previous choice or a character flaw. Audit paragraph transitions for logical 'glue' and ensure the narrative physics are consistent.",
    benefit: "The 'Truth Pass.' Use this to expose plot holes and logic failures before they become structural rot.",
    baselinePillars: true
  },
  {
    id: 'bioluminescent-glow',
    name: 'Bioluminescent Glow',
    description: 'Enhance atmospheric depth, prose rhythm, and sensory fidelity.',
    icon: <Sparkles className="w-5 h-5" />,
    focusAreas: ['sensory', 'tone', 'rhythm', 'lexicalPalette'],
    depth: 'balanced',
    model: 'gemini-3-flash-preview',
    color: 'text-accent-emerald',
    category: 'Prose',
    customDirective: "Focus on making the atmosphere palpable. Enhance the lighting, the mood, and the rhythm of the prose. Audit word choice to ensure the 'Lexical Palette' matches the intended atmosphere. Convert abstract descriptions into high-fidelity sensory experiences that ground the reader in the scene's unique 'weather'.",
    benefit: "The 'Atmosphere Pass.' Use this when a scene feels dry, clinical, or lacks a distinct emotional climate.",
    baselinePillars: false
  },
  {
    id: 'surgical-strike',
    name: 'Surgical Strike',
    description: 'High-precision refinement of dialogue, subtext, and emotional beats.',
    icon: <Scissors className="w-5 h-5" />,
    focusAreas: ['dialogue', 'dialogueMechanics', 'subtext', 'emotion'],
    depth: 'casual',
    model: 'gemini-3-flash-preview',
    color: 'text-accent-amber',
    category: 'Prose',
    customDirective: "Sharpen the dialogue. Remove on-the-nose statements and replace them with subtext. Surgically replace weak dialogue tags with action beats that ground the characters in the room. Ensure every line of speech serves a dual purpose: advancing the plot and revealing character depth.",
    benefit: "The 'Dialogue Pass.' Use this to fix clunky speech or when characters are stating their feelings too explicitly.",
    baselinePillars: true
  },
  {
    id: 'deep-pov-immersion',
    name: 'Deep POV Immersion',
    description: 'A strict audit of perspective integrity and character-filtered perception.',
    icon: <Camera className="w-5 h-5" />,
    focusAreas: ['povIntegrity', 'psychological', 'sensory'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-rose',
    category: 'Character',
    customDirective: "Audit for perspective slips and narrative distancing. Ensure every sensory detail is filtered through the character's unique biases, education, and current emotional state. Eliminate 'Head-Hopping' and ensure the reader is locked firmly inside the character's subjective reality.",
    benefit: "The 'Immersion Pass.' Best for ensuring the reader experiences the world through the character's eyes, not the author's.",
    baselinePillars: true
  },
  {
    id: 'dialogue-masterclass',
    name: 'Dialogue Masterclass',
    description: 'Advanced dialogue refinement focusing on rhythm, tags, and the unsaid.',
    icon: <Quote className="w-5 h-5" />,
    focusAreas: ['dialogueMechanics', 'subtext', 'voiceIntegrity'],
    depth: 'balanced',
    model: 'gemini-3-flash-preview',
    color: 'text-accent-indigo',
    category: 'Prose',
    customDirective: "Focus strictly on the rhythm of speech and the power of silence. Replace all 'said' variants with action beats or meaningful pauses. Ensure the subtext is felt in the gaps between lines. Audit for character consistency—every character must have a distinct linguistic DNA.",
    benefit: "The 'Cinematic Pass.' Use this to elevate functional conversation into a high-stakes verbal dance.",
    baselinePillars: true
  },
  {
    id: 'lexical-precision',
    name: 'Lexical Precision',
    description: 'Audit diction against character background, education, and social class.',
    icon: <Palette className="w-5 h-5" />,
    focusAreas: ['lexicalPalette', 'clarity', 'voiceIntegrity'],
    depth: 'balanced',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-teal',
    category: 'Prose',
    customDirective: "Audit the vocabulary for absolute authenticity. If a character is a soldier, they shouldn't use academic jargon. If they are a child, they shouldn't use complex metaphors. Purge 'AI Sludge' and replace generic descriptors with sharp, specific, and gritty observations that fit the character's 'Voice DNA'.",
    benefit: "The 'Authenticity Pass.' Use this to ensure your characters sound distinct and grounded in their personal history.",
    baselinePillars: true
  },
  {
    id: 'mythic-elevation',
    name: 'Mythic Elevation',
    description: 'Elevate themes, lore, and psychological depth to an archetypal level.',
    icon: <Globe className="w-5 h-5" />,
    focusAreas: ['mythic', 'psychological', 'tone', 'imagery'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-indigo',
    category: 'Thematic',
    customDirective: "Look for opportunities to tie immediate actions to the broader lore and themes of the world. Give the prose a sense of history, consequence, and mythic weight. Use symbolic imagery to reinforce the character's internal struggle and the narrative's archetypal resonance.",
    benefit: "The 'Thematic Pass.' Use this to deepen the stakes and ensure your story feels like a myth in the making.",
    baselinePillars: true
  },
  {
    id: 'visceral-impact',
    name: 'Visceral Impact',
    description: 'Maximize physical action, biological reaction, and sensory punch.',
    icon: <Zap className="w-5 h-5" />,
    focusAreas: ['visceral', 'sensory', 'rhythm', 'blocking'],
    depth: 'balanced',
    model: 'gemini-3-flash-preview',
    color: 'text-error',
    category: 'Pacing',
    customDirective: "Strip away abstract emotions. If a character is 'scared,' show the adrenaline, the cold sweat, and the hitch in their breath. Ensure blocking is precise—every movement must have physical weight and spatial consequence. Audit for high-impact verbs and precise nouns.",
    benefit: "The 'Action Pass.' Use this to turn 'telling' into 'showing' during high-tension or high-emotion moments.",
    baselinePillars: true
  },
  {
    id: 'worldweavers-loom',
    name: 'Worldweaver\'s Loom',
    description: 'Flesh out setting, world mechanics, and vivid environmental imagery.',
    icon: <Map className="w-5 h-5" />,
    focusAreas: ['worldbuilding', 'sensory', 'imagery', 'lexicalPalette'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-teal',
    category: 'Prose',
    customDirective: "Ensure the environment is a character in the scene. Audit spatial relationships and ensure the lore is integrated naturally into the prose. Use specific terminology relevant to the world's culture, technology, or magic systems. Ground the reader in the physical reality of the setting.",
    benefit: "The 'Setting Pass.' Use this when entering a new location or when the setting feels like a blank white room.",
    baselinePillars: false
  },
  {
    id: 'character-crucible',
    name: 'Character Crucible',
    description: 'Deepen character arcs, relationships, and internal psychological struggles.',
    icon: <Users className="w-5 h-5" />,
    focusAreas: ['characterArc', 'relationships', 'psychological', 'povIntegrity'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-rose',
    category: 'Character',
    customDirective: "Focus entirely on the psychological reality of the focal character. Ensure their decisions, biases, and flaws dictate their reactions. Audit the dynamic between characters for power imbalances and unspoken history. Ensure every interaction advances the character's established arc.",
    benefit: "The 'Soul Pass.' Use this to ensure characters are acting consistently with their established personalities and growth.",
    baselinePillars: true
  },
  {
    id: 'tension-coil',
    name: 'Tension Coil',
    description: 'Tighten narrative pacing, stakes, and psychological suspense.',
    icon: <Flame className="w-5 h-5" />,
    focusAreas: ['tension', 'plot', 'rhythm', 'subtext'],
    depth: 'balanced',
    model: 'gemini-3-flash-preview',
    color: 'text-accent-amber',
    category: 'Pacing',
    customDirective: "Maximize narrative tension. Shorten sentence length during action, delay gratification, and ensure the stakes are clear and present in the character's mind. Audit the subtext for unspoken threats or hidden agendas. Tighten the pacing to create a sense of mounting urgency.",
    benefit: "The 'Suspense Pass.' Use this when a scene feels slow, predictable, or lacks a sense of consequence.",
    baselinePillars: true
  },
  {
    id: 'sovereign-synthesis',
    name: 'Sovereign Synthesis',
    description: 'A holistic, balanced audit of prose, logic, and narrative immersion.',
    icon: <Sparkles className="w-5 h-5" />,
    focusAreas: ['tone', 'rhythm', 'plot', 'sensory', 'clarity', 'voiceIntegrity', 'transitionLogic'],
    depth: 'balanced',
    model: 'gemini-3.1-pro-preview',
    color: 'text-primary',
    category: 'Structural',
    customDirective: "Perform a holistic, high-fidelity audit. Balance the need for a clear, driving plot with rich sensory details and absolute adherence to the author's voice. Ensure smooth transition logic between paragraphs and purge any 'AI Sludge' that obscures the author's unique intent.",
    benefit: "The 'Final Polish.' The default pass for a completed draft, ensuring all narrative layers are working in harmony.",
    baselinePillars: true
  },
  {
    id: 'ghost-in-the-machine',
    name: 'Ghost in the Machine',
    description: 'Purge AI sludge and genericisms. Enhance precision, clarity, and human grit.',
    icon: <Fingerprint className="w-5 h-5" />,
    focusAreas: ['clarity', 'rhythm', 'visceral', 'subtext', 'lexicalPalette'],
    depth: 'balanced',
    model: 'gemini-3-flash-preview',
    color: 'text-accent-emerald',
    category: 'Prose',
    customDirective: "Hunt down and destroy 'AI Sludge'—generic metaphors, redundant modifiers, and passive constructions. Replace them with sharp, specific, and gritty human observations. Audit diction to ensure it sounds like a human with a specific background, not a machine trying to sound 'literary'.",
    benefit: "The 'Grit Pass.' Use this to make the prose feel more authentic, raw, and distinctly human.",
    baselinePillars: true
  },
  {
    id: 'alchemists-stone',
    name: 'Alchemist\'s Stone',
    description: 'Transform flat prose into high-fidelity sensory and symbolic experiences.',
    icon: <FlaskConical className="w-5 h-5" />,
    focusAreas: ['sensory', 'imagery', 'clarity', 'lexicalPalette'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-teal',
    category: 'Prose',
    customDirective: "Take flat or functional descriptions and elevate them using unexpected metaphors and highly specific sensory details. Use precise, technical, or archaic vocabulary where it adds mythic weight or atmospheric depth. Ensure every word choice is a deliberate act of world-building.",
    benefit: "The 'Elevation Pass.' Use this to upgrade functional descriptions into memorable, evocative imagery.",
    baselinePillars: false
  },
  {
    id: 'silent-witness',
    name: 'Silent Witness',
    description: 'Audit the unsaid. Deepen subtext, emotional restraint, and internal tension.',
    icon: <EyeOff className="w-5 h-5" />,
    focusAreas: ['subtext', 'psychological', 'emotion', 'dialogueMechanics'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-indigo',
    category: 'Character',
    customDirective: "Adopt the perspective of a silent observer. Record only what is unsaid or hidden. Replace explicit emotional statements with action beats that reveal internal tension. Audit for emotional restraint—characters should rarely say exactly how they feel. Ensure the subtext is the primary driver of the scene.",
    benefit: "The 'Subtext Pass.' Best for tense scenes where characters are lying, hiding, or struggling with unspoken desires.",
    baselinePillars: true
  },
  {
    id: 'architects-blueprint',
    name: 'Architect\'s Blueprint',
    description: 'A structural audit of pacing, blocking, and narrative seeds.',
    icon: <Ruler className="w-5 h-5" />,
    focusAreas: ['structural', 'blocking', 'rhythm', 'foreshadowing', 'transitionLogic'],
    depth: 'balanced',
    model: 'gemini-3-flash-preview',
    color: 'text-primary',
    category: 'Structural',
    customDirective: "Focus on the mechanics and physics of the scene. Ensure characters move logically through space, time passes consistently, and narrative seeds are planted for future payoff. Audit the 'glue' between paragraphs for seamless flow and ensure the blocking grounds the reader in the physical environment.",
    benefit: "The 'Mechanics Pass.' Use this to fix confusing action sequences or scenes where characters seem to teleport or lose their physical presence.",
    baselinePillars: true
  },
  {
    id: 'full-chapter-coherence',
    name: 'Full Chapter Coherence',
    description: 'Ensure seamless transitions and narrative flow across scenes.',
    icon: <Layers className="w-5 h-5" />,
    focusAreas: ['structural', 'thematic', 'tension', 'voiceIntegrity', 'transitionLogic'],
    depth: 'casual',
    model: 'gemini-3.1-pro-preview',
    color: 'text-primary',
    category: 'Structural',
    customDirective: "Focus strictly on transitions between scenes and paragraph-level flow. Audit the 'Transition Logic' to ensure the emotional state at the end of Scene A logically leads into the start of Scene B.",
    benefit: "Use this when stitching multiple scenes together to ensure they flow as a single chapter.",
    baselinePillars: true
  },
  {
    id: 'causality-engine',
    name: 'Causality Engine',
    description: 'Audit the logical necessity of scene-to-scene progression.',
    icon: <GitBranch className="w-5 h-5" />,
    focusAreas: ['causalityChain', 'plot', 'structural'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-primary',
    category: 'Structural',
    customDirective: "Audit the 'Therefore/But' chain. Does the outcome of the previous scene logically necessitate the start of this one? Eliminate coincidences. Ensure every action is a consequence of prior choices.",
    benefit: "The 'Causality Pass.' Use this to fix plot inertia.",
    baselinePillars: true
  },
  {
    id: 'agency-driver',
    name: 'Agency Driver',
    description: 'Ensure the protagonist drives the plot through active choices.',
    icon: <UserCircle className="w-5 h-5" />,
    focusAreas: ['agencyAudit', 'characterArc', 'psychological'],
    depth: 'balanced',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-rose',
    category: 'Character',
    customDirective: "Audit for passive protagonists. Is the character making active choices, or just reacting? If reacting, ensure the reaction is a conscious choice, not just a forced necessity.",
    benefit: "The 'Agency Pass.' Use this to fix passive protagonists.",
    baselinePillars: true
  },
  {
    id: 'thematic-resonance',
    name: 'Thematic Resonance',
    description: 'Align scene imagery and actions with core thematic anchors.',
    icon: <Compass className="w-5 h-5" />,
    focusAreas: ['thematicResonance', 'mythic', 'imagery'],
    depth: 'in-depth',
    model: 'gemini-3.1-pro-preview',
    color: 'text-accent-indigo',
    category: 'Thematic',
    customDirective: "Audit scene imagery and actions. Do they reinforce the core theme? If not, adjust them to harmonize with the thematic anchor.",
    benefit: "The 'Theme Pass.' Use this to ensure the scene isn't thematically hollow.",
    baselinePillars: true
  }
];
