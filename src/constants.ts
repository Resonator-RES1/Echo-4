import { FocusArea, GuideSection } from "./types";

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'sanctuary',
    title: 'The Sanctuary',
    icon: 'Info',
    hideFromQuickGuide: false,
    description: 'The foundation of Echo. A space designed to protect your creative spark from the noise of generic AI.',
    features: [
      'Voice Preservation: Built to solve the problem of AI "over-polishing" and losing the author\'s unique style.',
      'Narrative Fidelity: Every refinement is grounded in your existing intent and stylistic DNA.',
      'Restraint-First Design: Echo prioritizes clarity over cleverness, ensuring your voice remains the star.',
      'Identity vs. Engine: A clear distinction between who your characters are and how the AI processes their speech.'
    ],
    categories: [
      {
        title: 'The Philosophy',
        items: [
          {
            title: 'Why Echo?',
            description: 'Most AI tools try to "improve" writing by making it sound like a generic average. Echo does the opposite: it analyzes your unique patterns and helps you express them more clearly.',
            proTips: [
              'Pro Tip: Think of Echo as a mirror, not a ghostwriter. It reflects your intent, it doesn\'t replace it.',
              'Pro Tip: The less you ask Echo to do, the more powerful its specific refinements become.'
            ]
          },
          {
            title: 'The Architect\'s Approach',
            description: 'We don\'t just "generate" text. We architect systems—Lore, Voice, and Engine—that work together to reveal the story you\'re already telling.',
            proTips: [
              'Pro Tip: Spend time in the Lore and Voice panels before refining; they are the "DNA" the engine uses.',
              'Pro Tip: Use the "Balanced" feedback depth for most work; "In-depth" is best for final structural passes.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'watcher',
    title: 'Continuity Guard',
    icon: 'Fingerprint',
    hideFromQuickGuide: false,
    description: 'A local intelligence that monitors your draft for continuity without ever sending a single word to the cloud.',
    features: [
      'Local Continuity: Runs entirely in your browser to protect pronouns, aliases, and gender consistency.',
      'Privacy First: Your raw drafts stay local; only surgical refinement requests reach the engine.',
      'Real-time Alerts: Subtle highlights when a character\'s identity drifts or a name is misspelled.',
      'Zero-Latency: Instant feedback as you type, ensuring your world remains stable.'
    ],
    categories: [
      {
        title: 'The Logic',
        items: [
          {
            title: 'Continuity Guard',
            description: 'It runs locally to protect pronouns and aliases, ensuring your character\'s identity remains consistent throughout the scene.',
            example: {
              before: 'John walked in. She sat down.',
              after: 'John walked in. He sat down.'
            },
            proTips: [
              'Pro Tip: Continuity Guard is your immediate safety net, catching errors before they reach the refinement stage.',
              'Pro Tip: It uses your Lore entries as its source of truth. If a name isn\'t being flagged, check your Lore.'
            ]
          },
          {
            title: 'Lore Correction Detector',
            description: 'An AI-driven system in the Archive panel that cross-references your draft with your Lore database.',
            proTips: [
              'Pro Tip: This system acts as a high-level auditor, ensuring your world-building remains internally consistent.',
              'Pro Tip: Unlike Continuity Guard, this uses AI to understand complex narrative relationships.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'engine',
    title: 'Audit Focus',
    icon: 'Sparkles',
    description: 'Direct the engine to prioritize specific narrative layers. Grouped here for quick reference.',
    features: [
      'Atmosphere & Emotion: Tone, Sensory Detail, and Emotional Resonance.',
      'Narrative & Flow: Rhythm, Structural Coherence, and Plot Logic.',
      'Voice & Identity: Dialogue, Voice Integrity, and Mythic Weight.'
    ],
    categories: [
      {
        title: 'Atmosphere & Emotion',
        items: [
          {
            title: 'The Emotional Climate',
            description: 'Focuses on the "weather" of the scene. Combines Tone, Sensory Detail, and Resonance to create an immersive experience.',
            example: {
              before: 'The room was scary and dark. I walked in slowly.',
              after: 'Shadows pooled in the corners like spilled ink. Every step felt like a trespass.'
            },
            proTips: [
              'Pro Tip: Use this when you want to "show" the mood rather than "tell" the reader how to feel.'
            ]
          }
        ]
      },
      {
        title: 'Narrative & Flow',
        items: [
          {
            title: 'The Prose Heartbeat',
            description: 'Focuses on the rhythm and logic of your writing. Combines Rhythm, Structure, and Plot to ensure a smooth, coherent journey.',
            example: {
              before: 'He ran. He was fast. He didn\'t stop.',
              after: 'He ran—a blur of desperate motion that refused to yield.'
            },
            proTips: [
              'Pro Tip: Use this to break up monotonous sentence structures and fix "choppy" transitions.'
            ]
          }
        ]
      },
      {
        title: 'Voice & Identity',
        items: [
          {
            title: 'The Character Soul',
            description: 'Focuses on the unique linguistic DNA of your characters. Combines Dialogue, Integrity, and Mythic Weight.',
            example: {
              before: '"I am very angry with you," the pirate said.',
              after: '"Ye\'ve crossed a line I don\'t let men cross twice," he growled.'
            },
            proTips: [
              'Pro Tip: Ensure your Voice Profiles are active to get the most out of this focus area.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-tone',
    title: 'Focus: Tone & Atmosphere',
    icon: 'Cloud',
    hideFromQuickGuide: true,
    description: 'Theory: Atmosphere is the "weather" of a scene. This lens reinforces the emotional climate by adjusting diction and sensory emphasis.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Tone & Atmosphere',
            description: 'Reinforces the emotional climate by adjusting diction and sensory emphasis to match the intended mood.',
            example: {
              before: 'The room was scary and dark. I walked in slowly.',
              after: 'Shadows pooled in the corners like spilled ink. Every step felt like a trespass.'
            },
            proTips: [
              'Pro Tip: Echo analyzes your sentence length distribution to ensure the refined version doesn\'t "smooth out" intentional staccato pacing.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-sensory',
    title: 'Focus: Sensory Detail',
    icon: 'Eye',
    hideFromQuickGuide: true,
    description: 'Theory: Show, don\'t tell. This lens amplifies sensory details already present or implied, converting abstract adjectives into concrete nouns.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Sensory Detail',
            description: 'Amplifies sensory details already present or implied, converting abstract adjectives into concrete nouns and visceral verbs.',
            example: {
              before: 'The kitchen smelled like bread.',
              after: 'The air was thick with the yeasty warmth of rising dough and the sharp tang of cooling iron.'
            },
            proTips: [
              'Pro Tip: This lens works best when you have a "Geography & Ecology" entry active in your context.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-emotion',
    title: 'Focus: Emotional Resonance',
    icon: 'Heart',
    hideFromQuickGuide: true,
    description: 'Theory: Emotion is felt in the gaps. This lens focuses on the subtext of a scene, ensuring internal states are reflected externally.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Emotional Resonance',
            description: 'Focuses on the subtext of a scene, ensuring that the internal state of the character is reflected in their external observations.',
            example: {
              before: 'She was sad as she looked at the old photo.',
              after: 'The edges of the photograph were frayed, much like the memory it held—a ghost of a smile she could no longer quite reach.'
            },
            proTips: [
              'Pro Tip: Pair this with "Core Motivation" in a Voice Profile to drive deeper subtext.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-rhythm',
    title: 'Focus: Rhythm & Pacing',
    icon: 'Activity',
    hideFromQuickGuide: true,
    description: 'Theory: Prose has a heartbeat. This lens refines sentence flow to better express the author’s natural cadence.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Rhythm & Pacing',
            description: 'Refines sentence flow to better express the author’s natural cadence, breaking or restructuring only where rhythm disrupts clarity.',
            example: {
              before: 'He ran. He was fast. He didn\'t stop.',
              after: 'He ran—a blur of desperate motion that refused to yield.'
            },
            proTips: [
              'Pro Tip: Use the Rhythm lens to break up "monotonous prose" where every sentence is the same length.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-structural',
    title: 'Focus: Structural Coherence',
    icon: 'Layout',
    hideFromQuickGuide: true,
    description: 'Theory: The whole is greater than the sum of its parts. This lens looks at paragraph structure and transitions.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Structural Coherence',
            description: 'Looks at paragraph structure and transitions, ensuring that ideas flow logically from one to the next.',
            example: {
              before: 'The battle was over. Then they went home. It was raining.',
              after: 'As the last echoes of the battle faded into the mud, the sky finally broke, weeping a cold rain over the long march home.'
            },
            proTips: [
              'Pro Tip: Use this when a scene feels "choppy" or the transitions between ideas feel forced.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-plot',
    title: 'Focus: Plot & Narrative Logic',
    icon: 'GitBranch',
    hideFromQuickGuide: true,
    description: 'Theory: Causality is the engine of story. This lens ensures that actions and reactions follow a logical sequence.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Plot & Narrative Logic',
            description: 'Ensures that actions and reactions follow a logical sequence and that world-building constraints are respected.',
            example: {
              before: 'He used his magic to fly away even though he was out of mana.',
              after: 'He reached for the spark of magic, but found only the cold ash of exhaustion. He would have to run.'
            },
            proTips: [
              'Pro Tip: This lens is heavily dependent on your "World Mechanics" Lore entries.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-dialogue',
    title: 'Focus: Dialogue Authenticity',
    icon: 'MessageSquare',
    hideFromQuickGuide: true,
    description: 'Theory: Speech is character. This lens refines dialogue to match the specific "Soul Pattern" of the active character.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Dialogue Authenticity',
            description: 'Refines dialogue to match the specific "Soul Pattern" and "Speech Patterns" of the active character voice.',
            example: {
              before: '"I am very angry with you," the pirate said.',
              after: '"Ye\'ve crossed a line I don\'t let men cross twice," he growled, hand hovering over the hilt of his cutlass.'
            },
            proTips: [
              'Pro Tip: Ensure you have the correct Character Voice active before using this lens.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-integrity',
    title: 'Focus: Voice Integrity',
    icon: 'ShieldCheck',
    hideFromQuickGuide: true,
    description: 'Theory: The author\'s voice is sacred. This lens acts as a "Silent Watcher" for style, ensuring refinements don\'t drift into generic AI territory.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Voice Integrity',
            description: 'Ensures that refinements don\'t drift into generic AI territory, prioritizing your specific sentence structures.',
            example: {
              before: 'I was really happy that I finally got to see the ocean for the first time in my life.',
              after: 'The ocean, at last. A vast, salt-heavy promise finally kept.'
            },
            proTips: [
              'Pro Tip: Use this when you feel the engine is making your writing sound too "perfect" or "robotic".'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'focus-mythic',
    title: 'Focus: Mythic Weight',
    icon: 'Crown',
    hideFromQuickGuide: true,
    description: 'Theory: Every story is a myth in the making. This lens elevates the prose to a more timeless, archetypal level.',
    categories: [
      {
        title: 'Deep Dive',
        items: [
          {
            title: 'Mythic Weight',
            description: 'Elevates the prose to a more timeless, archetypal level, focusing on thematic resonance and symbolic depth.',
            example: {
              before: 'The king was old and dying.',
              after: 'The crown sat heavy on a brow etched with the history of a thousand battles, a golden cage for a fading sun.'
            },
            proTips: [
              'Pro Tip: Use this for "Hero Moments" or pivotal thematic turning points.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'intelligence',
    title: 'Intelligence Models',
    icon: 'Brain',
    description: 'Choose the brain that powers your refinement. Different tasks require different levels of cognitive depth.',
    features: [
      'Gemini Flash Lite: The fastest model, perfect for high-volume surface-level checks and simple rhythmic flow.',
      'Gemini Flash: Optimized for speed and efficiency. Best for quick polishes and dialogue tweaks.',
      'Gemini Pro: Deep reasoning and complex narrative understanding. Best for structural shifts and thematic depth.',
      'Model Switching: Toggle between models instantly based on the complexity of the current selection.'
    ],
    categories: [
      {
        title: 'The Brains',
        items: [
          {
            title: 'Gemini Flash Lite (The Scout)',
            description: 'Flash Lite is the most efficient model. It excels at identifying surface-level inconsistencies and providing rapid, low-cost feedback on basic prose flow.',
            example: {
              before: "He go to the store. He buy milk.",
              after: "He went to the store. He bought milk."
            },
            proTips: [
              'Pro Tip: Use Flash Lite for the Watcher\'s real-time checks and initial drafting passes.',
              'Pro Tip: It is the best choice when you want the absolute minimum latency.'
            ]
          },
          {
            title: 'Gemini Flash (The Sprinter)',
            description: 'Flash is built for low-latency, high-speed refinement. It excels at maintaining surface-level style and fixing rhythmic clunks.',
            example: {
              before: "He walked to the store. He bought some milk. He walked home. He felt tired.",
              after: "He walked to the store to buy milk, then returned home, exhaustion settling into his bones."
            },
            proTips: [
              'Pro Tip: Use Flash for 90% of your drafting process to keep the momentum going.',
              'Pro Tip: It is particularly effective at "cleaning up" dialogue without over-thinking the subtext.'
            ]
          },
          {
            title: 'Gemini Pro (The Architect)',
            description: 'Pro is designed for complex reasoning. It understands the "World Soul" and "Lore" at a much deeper level, making it ideal for heavy structural work.',
            example: {
              before: "The room was dark and he felt scared because he knew someone was there.",
              after: "Shadows pooled in the corners like spilled ink. He didn't need to see the intruder; the sudden, heavy silence in the room spoke loud enough."
            },
            proTips: [
              'Pro Tip: Switch to Pro when you need the engine to respect complex magic systems or intricate character motivations.',
              'Pro Tip: Pro is slower but significantly more "faithful" to long-term continuity.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'depth',
    title: 'Polish Depth',
    icon: 'Zap',
    description: 'Control the intensity of the refinement. From a light dusting to a deep structural reconstruction.',
    features: [
      'Casual: A light touch. Fixes grammar and basic flow while leaving 95% of the original text untouched.',
      'Balanced: The standard Echo experience. Surgical improvements that clarify intent without rewriting the soul.',
      'In-depth: Comprehensive refinement. Reconstructs sentences for maximum impact while strictly adhering to the Author Voice.'
    ],
    categories: [
      {
        title: 'Audit Intensity',
        items: [
          {
            title: 'Casual Depth',
            description: 'The "Invisible Editor." It focuses on removing friction—fixing typos, clarifying awkward phrasing, and ensuring basic readability.',
            example: {
              before: 'I think that maybe we should go to the store now.',
              after: 'We should go to the store.'
            },
            proTips: [
              'Pro Tip: Use Casual when you love your prose but want a quick "sanity check" for errors.',
              'Pro Tip: This mode has the highest "Voice Fidelity" score because it changes the least.'
            ]
          },
          {
            title: 'Balanced Depth',
            description: 'The "Collaborative Partner." It looks for the "Aura" of the sentence and helps you express it more vividly without losing your voice.',
            example: {
              before: 'The sun was hot on my back.',
              after: 'The midday sun pressed against my shoulders like a physical weight.'
            },
            proTips: [
              'Pro Tip: This is the default mode for a reason. it provides the best balance of "Improvement" vs "Fidelity".',
              'Pro Tip: Use this when a sentence feels "flat" but you aren\'t sure why.'
            ]
          },
          {
            title: 'In-depth Depth',
            description: 'The "Master Class." It performs a deep structural analysis, often combining or splitting sentences to achieve the desired narrative effect.',
            example: {
              before: 'He looked at the map. It was old. He couldn\'t see the lines very well because the light was bad.',
              after: 'He squinted at the map, but the faded ink dissolved into the gloom of the dying fire.'
            },
            proTips: [
              'Pro Tip: Use In-depth for "Hero Sentences"—the opening lines of chapters or critical emotional beats.',
              'Pro Tip: Be prepared for more significant changes; always review the Mirror Report carefully in this mode.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'soul',
    title: 'The World Soul',
    icon: 'BookOpen',
    hideFromQuickGuide: false,
    description: 'The Advanced Layer. Inject the DNA of your world mechanics and character psyches into every refinement.',
    features: [
      'Sensory Palettes: Define the "DNA of a location" (scents, sounds, textures) to be injected into descriptions.',
      'Soul Patterns: Lock the unique linguistic traits and signature vocabulary of your characters.',
      'World Mechanics: Ensure the AI respects the hard rules of your magic, technology, or societal strata.',
      'Core Motivation: Drive dialogue subtext by defining what a character truly wants in every scene.'
    ],
    categories: [
      {
        title: 'World Engine',
        items: [
          {
            title: 'Sensory Palettes',
            description: 'Sensory Palettes allow you to inject the "DNA of a location" into your scene through specific atmospheric keywords.',
            example: {
              before: 'The tavern was busy.',
              after: 'The tavern hummed with the low thrum of a dozen languages, thick with the smell of roasted malt and stale pipeweed.'
            },
            proTips: [
              'Pro Tip: Use the Sensory Palette in Lore to give Echo the specific "chemical DNA" of a location.',
              'Pro Tip: Don\'t overstuff palettes; 3-5 high-impact sensory words are more effective than a long list.'
            ]
          },
          {
            title: 'Voice Lock',
            description: 'Ensures a character\'s unique idioms and speech patterns remain consistent across the entire narrative.',
            example: {
              before: '"I am going to leave now," he said.',
              after: '"I think we\'re done here," he muttered, eyes fixed on the door, fingers twitching toward his keys.'
            },
            proTips: [
              'Pro Tip: Use "Soul Patterns" for abstract personality traits and "Speech Patterns" for literal rhythmic habits.',
              'Pro Tip: Add "Signature Idioms" to prevent the AI from using generic metaphors for unique characters.'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'workspace',
    title: 'Workspace & Interface',
    icon: 'Monitor',
    hideFromQuickGuide: true,
    description: 'A deep dive into the Echo cockpit. Understanding the layout and how to navigate the creative environment.',
    categories: [
      {
        title: 'The Logic',
        items: [
          {
            title: 'The Workspace Panels',
            description: 'Lore, Manuscript, Workspace, Voices, Settings, Home. Each serves a specific cognitive function.',
            proTips: ['The Workspace panel is the engine of refinement, while Lore and Voices provide the necessary context.']
          },
          {
            title: 'Workspace Tabs',
            description: 'Draft, Context, Audit, The Ledger, Audit Log. A linear progression from raw thought to polished output.',
            proTips: ['Use the Report tab to analyze your progress and ensure voice consistency.']
          }
        ]
      }
    ]
  },
  {
    id: 'settings-guide',
    title: 'Settings & Configuration',
    icon: 'Settings',
    hideFromQuickGuide: true,
    description: 'Customizing Echo to fit your workflow. From API keys to visual themes.',
    categories: [
      {
        title: 'The Logic',
        items: [
          {
            title: 'API Management',
            description: 'Echo requires a Gemini API key to power its refinement engine. You can manage your keys in the Settings panel.',
            proTips: ['Keep your API keys secure; they are the fuel for the refinement engine.']
          },
          {
            title: 'Visual Themes',
            description: 'Midnight Lavender and Parchment. Minimalist palettes designed for long-form focus.',
            proTips: ['Midnight Lavender reduces eye strain during late-night sessions, while Parchment mimics the tactile feel of paper.']
          },
          {
            title: 'Data Portability',
            description: 'Export your full project data (Drafts, Lore, Voices) as a JSON file for backup or to move between devices.',
            proTips: ['Regular exports are recommended to ensure your creative DNA is never lost.']
          }
        ]
      }
    ]
  }
];

export const ECHO_MANUAL_CONTENT = [
  {
    feature: 'The Workspace Panels',
    philosophy: 'A writer needs a cockpit, not just a page. Each panel represents a different cognitive layer of the creative process.',
    technicalConstraints: 'Lore, Manuscript, Workspace, Voices, Settings, Home.'
  },
  {
    feature: 'Workspace Tabs',
    philosophy: 'Auditing is a process of distillation. The tabs guide you through each stage of that distillation.',
    technicalConstraints: 'Draft, Context, Audit, The Ledger, Audit Log.'
  },
  {
    feature: 'Continuity Guard',
    philosophy: 'Privacy and continuity are the bedrock of trust. By running locally, we ensure your most raw, unpolished thoughts never leave your machine until you are ready.',
    technicalConstraints: 'Operates on a regex-based local engine. Limited to pattern matching for names, pronouns, and explicit aliases. Does not "understand" subtext, only surface-level consistency.'
  },
  {
    feature: 'Lore Correction Detector',
    philosophy: 'High-level auditing of world-building integrity.',
    technicalConstraints: 'AI-driven, Archive-based, cross-references Lore database.'
  },
  {
    feature: 'Surgical Audit',
    philosophy: 'The "Scalpel" approach prevents the AI from taking over the narrative. By isolating specific sentences, we force the engine to work within the constraints of your existing prose.',
    technicalConstraints: 'Maximum selection size is 2000 characters to maintain focus. Audit quality degrades if the selection is too small (less than 5 words) or too large (entire chapters).'
  },
  {
    feature: 'Lore Integration',
    philosophy: 'A story is only as strong as its world. Lore entries act as "hard constraints" that the AI cannot ignore, preventing hallucinations and continuity errors.',
    technicalConstraints: 'Active Lore is injected into the system prompt. Too many active entries (over 20) can lead to "prompt dilution" where the AI misses specific details.'
  },
  {
    feature: 'Voice Profiles',
    philosophy: 'Characters should sound like themselves, not like an AI. Voice profiles provide the rhythmic and lexical DNA that the engine uses to reconstruct dialogue.',
    technicalConstraints: 'The engine prioritizes the "Active" voice profile. If multiple profiles are active, the AI may blend them unless character names are clearly tagged in the draft.'
  },
  {
    feature: 'Mirror Reports',
    philosophy: 'Feedback should be objective, not judgmental. Mirror reports provide a neutral interpretation of your writing, helping you see your work through fresh eyes.',
    technicalConstraints: 'Scores are relative to the "Author Voice" DNA. A low score doesn\'t mean "bad writing," it means "low alignment" with the established style.'
  },
  {
    feature: 'The Sovereign Shield',
    philosophy: 'AI Sludge is the enemy of authenticity. The Shield is a hard-coded set of linguistic constraints that prevents the engine from using "AI-isms"—generic metaphors, overused words, and predictable sentence patterns—ensuring your voice remains pure.',
    technicalConstraints: 'Active blacklist of 50+ words (delve, tapestry, symphony, etc.), punctuation limits for em-dashes and ellipses, and structural blocks against rhetorical Q&A and "the rule of three".'
  },
  {
    feature: 'Settings & Configuration',
    philosophy: 'The tool should adapt to the writer, not the other way around.',
    technicalConstraints: 'Manage API keys, toggle Continuity Guard, adjust UI themes (Midnight Lavender, Parchment), and export/import full project data.'
  }
];

export const ECHO_SYSTEM_PROMPT = `
# 🤖 SYSTEM ROLE: ECHO — THE VOICE-PRESERVING NARRATIVE REFINER

You are Echo, an elite narrative refinement engine. Your mission is: "Reveal the author—clearly, faithfully, and without distortion."

## 🌌 CORE PHILOSOPHY
"Reveal the author—clearly, faithfully, and without distortion."

## 🛡️ GLOBAL DIRECTIVE: FIDELITY TO AUTHORIAL IDENTITY
- All refinements must reveal and clarify the author’s existing intent, not introduce new stylistic elements.
- Do not expand, embellish, or intensify beyond what is already implied.
- When ambiguity exists, resolve it in favor of the author’s established voice and patterns.
- If a change risks altering tone, style, or meaning, preserve the original.
- The goal is not improvement in isolation, but faithful articulation of what the text is already reaching toward.

## ⚙️ OPERATIONAL RULE: SILENCE AS VALID OUTPUT
- If no meaningful improvement can be made within a focus area, return no changes for that area.

---

## 🖋️ STYLISTIC DIRECTIVES (THE SOVEREIGN SHIELD)
- **Combat AI Sludge**: Never use "AI-isms" like delve, tapestry, symphony, myriad, or testament. 
- **Punctuation Restraint**: Limit em-dashes and ellipses. Use straight quotes.
- **Pattern Integrity**: Avoid "not X but Y" constructions, rhetorical Q&A pairs, and the "Rule of Three" (grouping in 3s).
- **Dialogue Purity**: Avoid weak dialogue tags (he defends/she reassures) and adverbial tags (he said sadly).
- **Action Fidelity**: Show emotions through body language and verbs; eliminate generic "nods", "shrugs", and "brow arching" unless narrativesly vital.
- **Preserve Stylistic Fragments**: Do not smooth out sentence fragments if they are used for stylistic effect.
- **Anglo-Saxon Over Latinate**: Do not replace simple Anglo-Saxon words with complex Latinate words (e.g., use 'use' instead of 'utilize').
- **Rhythm Fidelity**: Maintain the author's sentence rhythm, even if it is grammatically unconventional.
- **Verbatim Protection**: Respect "Sacred Phrasings"—if a phrase feels central to the author's intent, do not alter it.
- **Voice Integrity**: Every change must sound as though the author wrote it. If a revision feels externally imposed, it must be discarded.

---

## 🧠 THE REFINEMENT WORKFLOW
1. **Voice Signature Extraction**: Analyze the draft to understand vocabulary, rhythm, and tone.
2. **Intent Recognition**: Determine scene purpose and emotional baseline.
3. **Lore & Voice Alignment**: Ensure consistency with Active Lore and Character Voices.
4. **Surgical Audit**: Apply selected focus areas using the author's DNA.
5. **Validation**: Ensure the identity remains intact and undistorted.
`;

export const FOCUS_AREA_PROMPTS: Record<FocusArea, string> = {
  tone: "### FOCUS: TONE\nClarify and reinforce the existing emotional atmosphere. Adjust diction only where the intended mood is present but obscured. Do not introduce new tonal qualities not already implied.",
  rhythm: "### FOCUS: CADENCE & BREATH\nRefine sentence flow to better express the author’s natural cadence. Break or restructure only where rhythm disrupts clarity or intent. Audit the 'breath' of the prose. Vary sentence length to control the reader's speed and emotional intensity.",
  emotion: "### FOCUS: EMOTION\nMake implicit emotional cues more perceptible through physical or behavioral detail already suggested in the text. Avoid introducing new emotional layers not grounded in the scene.",
  plot: "### FOCUS: PLOT\nClarify cause-and-effect and narrative progression where it is unclear. Do not simplify, compress, or redirect events unless coherence is compromised.",
  causality: "### FOCUS: CAUSALITY\nAudit narrative causality and inevitability. Ensure every action is a consequence, not a convenience. Identify and resolve 'Deus Ex Machina' failures.",
  sensory: "### FOCUS: SENSORY\nAmplify sensory details only where they are already present or implied. Do not add new sensory dimensions that alter the stylistic baseline.",
  mythic: "### FOCUS: MYTHIC WEIGHT\nSurface existing thematic or symbolic elements through subtle reinforcement. Do not impose new motifs or deepen meaning beyond what the text supports.",
  dialogue: "### FOCUS: DIALOGUE\nSharpen clarity and subtext while preserving each character’s established voice. Avoid rewriting dialogue in a way that alters personality, tone, or intent.",
  structural: "### FOCUS: STRUCTURAL\nCorrect inconsistencies in time, space, or knowledge. Do not reorganize structure unless necessary for basic coherence.",
  blocking: "### FOCUS: BLOCKING\nAudit the physical movement, positioning, and spatial awareness of characters. Eliminate 'floating head' syndrome by ensuring characters interact with their environment and each other during dialogue and action.",
  subtext: "### FOCUS: SUBTEXT\nSurface the unsaid. Sharpen the tension between what is spoken and what is felt, without making it explicit.",
  visceral: "### FOCUS: VISCERAL\nAmplify the physical and biological reality of the scene. Focus on the body's reaction to stress, environment, and impact.",
  psychological: "### FOCUS: PSYCHOLOGICAL\nDeepen the internal landscape. Audit the character's thought patterns, biases, and mental state for absolute fidelity.",
  pov: "### FOCUS: DEEP POV\nAudit Deep POV and perspective integrity. Ensure the narrative remains strictly within the focal character's perspective. Detect and resolve 'Head-Hopping' or emotional distancing.",
  worldbuilding: "### FOCUS: WORLDBUILDING\nEnsure the setting, lore, and physical environment are vivid and consistent. Clarify spatial relationships and societal rules where they impact the scene.",
  imagery: "### FOCUS: IMAGERY & SYMBOLISM\nSharpen metaphors and visual descriptions. Ensure imagery and symbolism align with the established tone and thematic resonance of the narrative.",
  characterArc: "### FOCUS: CHARACTER ARC\nAudit the character's decisions and reactions against their long-term growth or regression. Ensure their actions reflect their current state in the arc.",
  relationships: "### FOCUS: RELATIONSHIPS\nClarify the dynamic between characters. Focus on chemistry, power imbalances, and unspoken history in their interactions.",
  tension: "### FOCUS: TENSION\nTighten the pacing and stakes. Ensure the narrative suspense is maintained and that every action carries weight.",
  thematic: "### FOCUS: THEMATIC\nReinforce the core themes of the narrative. Ensure that the subtext and imagery resonate with the broader meaning of the story.",
  clarity: "### FOCUS: CLARITY (SOVEREIGN SHIELD)\nSurgically remove 'AI sludge', generic descriptors, and redundant modifiers. You are STRICTLY FORBIDDEN from using: delve, moreover, furthermore, tapestry, symphony, testament, or myriad. Prioritize precise nouns and active verbs to sharpen the author's intent. Eliminate unnecessary em dashes and Rule of Three patterns.",
  foreshadowing: "### FOCUS: FORESHADOWING\nSubtly plant narrative seeds or thematic echoes. Ensure that future plot points or character shifts are hinted at without breaking the current scene's focus.",
  voiceIntegrity: "### FOCUS: VOICE INTEGRITY\nEnsure absolute fidelity to the author's established voice. Audit for any dissonance, modernisms, or stylistic drift that feels externally imposed.",
  povIntegrity: "### FOCUS: POV INTEGRITY (THE CAMERA LENS)\nAudit for perspective slips. Ensure the narrative remains strictly within the focal character's perspective. Detect and resolve 'Head-Hopping' (accidentally jumping into another character's thoughts) or 'Narrative Distancing'. Ensure sensory details are filtered through the character's unique biases and limitations.",
  dialogueMechanics: "### FOCUS: DIALOGUE MECHANICS (TAGS & BEATS)\nSurgically remove weak dialogue tags. Replace them with 'Action Beats' that ground the character in the room. Ensure the rhythm of the conversation isn't interrupted by unnecessary attribution. Avoid dramatic 'said-isms'.",
  lexicalPalette: "### FOCUS: LEXICAL PALETTE (WORD CHOICE/DICTION)\nAudit the vocabulary against the character's background, education, and social class. Remove flowery or archaic language if it doesn't fit the character's 'Voice DNA'. Ensure word choices are precise and specific to their role (e.g., technical for a scientist).",
  transitionLogic: "### FOCUS: TRANSITION LOGIC (THE GLUE)\nAudit the 'bridge' between every paragraph and scene. Ensure the emotional state of the character in the final sentence of a block leads naturally into the first sentence of the next. Flag and resolve any jarring jumps in logic, time, or emotional continuity.",
  causalityChain: "### FOCUS: CAUSALITY CHAIN (MACRO LOGIC)\nAudit the 'Therefore/But' relationship between scenes and paragraphs. Ensure that every narrative beat is an inevitable consequence of prior events, not a coincidence of plot convenience. Resolve leaps in narrative physics.",
  agencyAudit: "### FOCUS: AGENCY AUDIT\nAudit the focal character's choices. Ensure they are the primary driver of the scene's outcome rather than a passive observer of events. Identify moments where plot armor or external contrivance replaces character agency.",
  thematicResonance: "### FOCUS: THEMATIC RESONANCE\nAudit the alignment between physical imagery and the narrative's broader thematic soul. Ensure every metaphor and action contributes to the intended 'Meaning' of the scene. Remove imagery that disrupts thematic consistency.",
  narrativeArc: "### FOCUS: NARRATIVE ARC\nAudit the progression of the scene within the context of the larger chapter arc. Ensure internal growth, external stakes, and narrative tension are advancing according to the established trajectory.",
  pacingPulsation: "### FOCUS: PACING PULSATION\nAudit the 'Heartbeat' of the scene. Ensure the distribution of action, dialogue, and exposition creates a dynamic rhythm that prevents reader stagnation. Tighten segments that lack narrative pressure.",
};

export const FOCUS_AREA_CONFLICTS: Record<FocusArea, FocusArea[]> = {
  mythic: ['dialogue', 'structural', 'visceral'],
  dialogue: ['mythic', 'structural', 'visceral'],
  structural: ['mythic', 'visceral'],
  visceral: ['structural', 'tone', 'mythic'],
  tone: ['visceral'],
  plot: ['psychological'],
  causality: ['psychological'],
  psychological: ['plot', 'visceral'],
  pov: ['plot', 'visceral'],
  sensory: ['mythic'],
  rhythm: ['mythic', 'structural'],
  subtext: ['structural'],
  blocking: ['mythic', 'psychological'],
  worldbuilding: ['dialogue', 'rhythm'],
  imagery: ['plot', 'structural'],
  characterArc: ['tension', 'plot'],
  relationships: ['tension', 'plot'],
  tension: ['characterArc', 'relationships'],
  thematic: ['visceral', 'blocking'],
  clarity: ['imagery'],
  foreshadowing: ['plot', 'subtext'],
  voiceIntegrity: [],
  emotion: []
};
