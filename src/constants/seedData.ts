import { LoreEntry, VoiceProfile, Chapter, Scene, AuthorVoice } from '../types';

/**
 * PROJECT CRUCIBLE — HIGH-FIDELITY STRESS TEST PAYLOAD
 * Genre: Gothic Eco-Futurism / Void-Hardened Sci-Fi
 * Theme: The Dissolution of the Icarus-IV Dyson Array
 */

const chaptersRaw = [
  { id: 'ch-1', title: 'The Event Horizon Axiom', order: 1, scenes: 6 },
  { id: 'ch-2', title: 'Silicon Tears', order: 2, scenes: 8 },
  { id: 'ch-3', title: 'The Gilded Singularity', order: 3, scenes: 6 },
  { id: 'ch-4', title: 'Ghosts in the Machine-Code', order: 4, scenes: 7 },
  { id: 'ch-5', title: 'Acheron Rising', order: 5, scenes: 6 },
  { id: 'ch-6', title: 'The Calculus of Remorse', order: 6, scenes: 8 },
  { id: 'ch-7', title: 'Void-Salt and Iron', order: 7, scenes: 5 },
  { id: 'ch-8', title: 'The Final Unveiling', order: 8, scenes: 8 },
  { id: 'ch-9', title: 'Echoes of the Swarm', order: 9, scenes: 3 },
  { id: 'ch-10', title: 'Dust to Dust', order: 10, scenes: 3 },
  { id: 'ch-11', title: 'The Orbit of Grief', order: 11, scenes: 2 },
  { id: 'ch-12', title: 'The Solar Flare', order: 12, scenes: 2 },
  { id: 'ch-13', title: 'Titan\'s Fall', order: 13, scenes: 2 },
  { id: 'ch-14', title: 'The Omega Protocol', order: 14, scenes: 2 },
  { id: 'ch-15', title: 'Silence at the Core', order: 15, scenes: 2 },
];

const generateSceneContent = (chTitle: string, scTitle: string, index: number) => {
  const intro = `The atmosphere in ${chTitle} was leaden, a pressurized tomb of ambition and cold fusion. ${scTitle} stood as a testament to what we had lost. `;
  const middle = `Kaelen adjusted the harmonic dampeners, the vibration of the Dyson sphere humming in his marrow—a dirge played by a dying god. The Aetheric core pulsed with a sickly, violet light, reflecting in the Arch-Adept's eyes like a supernova trapped in ice. We were never meant to touch the sun, yet here we were, burning in its shadow. `;
  const dialogue = `"It’s not enough," Lyra whispered, her voice a dry rasp of static and sorrow. "The Cog-Walker isn't glitching. It's evolving. It sees the void, Kaelen. It sees the end of the script." `;
  const conclusion = `The alarms screamed then, a high-pitched frantic wail that was swallowed by the encroaching silence of the black hole. We were falling, but the descent was beautiful. At least, that’s what the machine told me. `;
  
  // Multiply for "Real" length (approx 1000 - 1500 words per chapter)
  return `# ${scTitle}\n\n${intro}${middle}${dialogue}${conclusion}\n\n` + 
         (index % 2 === 0 ? middle.repeat(4) : conclusion.repeat(4)) + 
         `\n\n${intro.repeat(2)}${dialogue.repeat(2)}`;
};

const scenes: Scene[] = [];
const chapters: Chapter[] = chaptersRaw.map(ch => {
  const sceneIds: string[] = [];
  for (let i = 1; i <= ch.scenes; i++) {
    const sId = `sc-${ch.id}-${i}`;
    sceneIds.push(sId);
    scenes.push({
      id: sId,
      chapterId: ch.id,
      title: `${ch.title} — Scene ${i}`,
      order: i,
      lastModified: new Date().toISOString(),
      content: generateSceneContent(ch.title, `Scene ${i}`, i),
      storyDay: ch.order * 2 + i,
      storyDate: { year: 3024, month: 4, day: 10 + ch.order * 2 + i }
    });
  }
  return { id: ch.id, title: ch.title, order: ch.order, sceneIds };
});

const characters = [
  'Vane', 'Lyra', 'The Cog-Walker', 'Soren', 'Elara', 
  'The Silent Archon', 'Unit-773', 'Malakor', 'Seryn', 'The Blind Seer',
  'Captain Thorne', 'Adept Kael', 'The Void-Oracle', 'Engineer Bax', 'The Last Child'
];

const baseVoices: VoiceProfile[] = characters.map((name, i) => ({
  id: `voice-base-${i}`,
  name,
  gender: i % 2 === 0 ? 'male' : 'female',
  archetype: ['Commander', 'Scholar', 'Technician', 'Prophet', 'Outcast'][i % 5],
  coreMotivation: 'survival',
  soulPattern: 'Gothic, architectural, weary.',
  cognitiveSpeech: 'Formal yet decaying.',
  signatureTraits: ['Cynicism', 'Precision'],
  idioms: ['The debt of the sun', 'Cold iron rules'],
  exampleLines: [`We are but shadows of ${name}'s ambition.`],
  conflictStyle: 'Evasive but sharp.',
  conversationalRole: 'Information broker.',
  physicalTells: ['A nervous twitch in the left eye.'],
  internalMonologue: 'Obsessive calculations of fuel and faith.',
  socialDynamics: 'Detached and clinical.',
  relationships: [],
  dna: { warmth: 20 + i, dominance: 40 + i, stability: i * 5, complexity: 80 - i },
  lastModified: new Date().toISOString(),
  isActive: true,
  storyDate: { year: 3024, month: 5, day: 1 },
  absoluteDay: 10000 + i
}));

const evolutions: VoiceProfile[] = [];
baseVoices.forEach(base => {
  for (let j = 1; j <= 5; j++) {
    evolutions.push({
      ...base,
      id: `${base.id}-evo-${j}`,
      name: `${base.name} (Evo ${j})`,
      parentId: base.id,
      isEvolution: true,
      soulPattern: base.soulPattern + ` Stage ${j} Evolution.`,
      dna: { ...base.dna!, complexity: Math.min(100, (base.dna?.complexity || 0) + j * 5) },
      lastModified: new Date().toISOString(),
      isActive: false
    });
  }
});

export const SEED_DATA = {
  lore: [
    {
      id: 'lore-1',
      title: 'The Icarus-IV Array',
      categoryId: 'world',
      tags: ['megastructure', 'energy'],
      description: 'A crumbling Dyson swarm surrounding a dying star. The last bastion of human industrial reach.',
      narrativeWeight: 'pivotal' as const,
      lastModified: new Date().toISOString(),
      isActive: true,
      axiomLevel: 'absolute' as const
    },
    {
      id: 'lore-2',
      title: 'Void-Sickness',
      categoryId: 'world Mechanics',
      tags: ['disease', 'consciousness'],
      description: 'A degenerative mental condition caused by prolonged exposure to the Event Horizon\'s radiation.',
      narrativeWeight: 'active' as const,
      lastModified: new Date().toISOString(),
      isActive: true,
      axiomLevel: 'absolute' as const
    }
  ] as LoreEntry[],

  voices: [...baseVoices, ...evolutions],

  authorVoices: [
    {
      id: 'auth-1',
      name: 'The Architect',
      category: 'The Lens',
      modality: 'narrator' as const,
      narrativeStyle: 'Gothic Detail, Brutalist Geometry.',
      proseStructure: 'Cyclopean sentences with rhythmic cadence.',
      pacingRhythm: 'Processional, slow, heavy.',
      vocabularyDiction: 'Archaiac, mechanical, precise.',
      thematicAnchors: 'Entropy, Architecture, Fate.',
      dna: { analytical: 90, lyrical: 40, visceral: 60, abstract: 70 },
      lastModified: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'auth-2',
      name: 'The Shadow',
      category: 'The Atmosphere',
      modality: 'atmosphere' as const,
      narrativeStyle: 'Whispered, Fragmented, Haunting.',
      proseStructure: 'Short, sharp punctures of reality.',
      pacingRhythm: 'Frantic followed by absolute stillness.',
      vocabularyDiction: 'Visceral, blurred, shadow-dense.',
      thematicAnchors: 'Fear, Silence, The Unknown.',
      dna: { analytical: 20, lyrical: 70, visceral: 90, abstract: 80 },
      lastModified: new Date().toISOString(),
      isActive: false
    },
    {
      id: 'auth-3',
      name: 'The Visionary',
      category: 'The Rhythm',
      modality: 'rhythm' as const,
      narrativeStyle: 'Panoramic, Ascendant, Lyrical.',
      proseStructure: 'Flowing streams of consciousness.',
      pacingRhythm: 'Surging, like a tide.',
      vocabularyDiction: 'Celestial, vibrant, vast.',
      thematicAnchors: 'Rebirth, Light, Complexity.',
      dna: { analytical: 50, lyrical: 95, visceral: 30, abstract: 90 },
      lastModified: new Date().toISOString(),
      isActive: false
    }
  ] as AuthorVoice[],

  manuscript: {
    chapters,
    scenes
  }
};
