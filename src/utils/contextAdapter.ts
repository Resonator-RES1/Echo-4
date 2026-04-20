import { AuthorVoice, AuthorVoiceSuite, ActiveContext, VoiceDNA } from '../types';

export function normalizeContext(
  selection: AuthorVoiceSuite | AuthorVoice | null,
  voiceDNAs: VoiceDNA[] = [],
  authorVoices: AuthorVoice[] = []
): ActiveContext | null {
  if (!selection) return null;

  // Check if it's a suite (has modalities property)
  if ('modalities' in selection) {
    const suite = selection as AuthorVoiceSuite;
    
    // Build prompt instructions from modalities
    let promptInstructions = `Persona Suite: ${suite.name}\n`;
    if (suite.description) {
      promptInstructions += `Intent: ${suite.description}\n\n`;
    }
    
    // SYNTHESIS DIRECTIVE: Force the model to balance the modalities
    promptInstructions += `SYNTHESIS DIRECTIVE: You MUST balance these modalities to create a unified voice. Do not treat them as isolated components. If 'The Lens' conflicts with 'The Rhythm', prioritize 'The Rhythm' for prose flow, but 'The Lens' for character perspective.\n\n`;
    
    const modalityLabels: Record<string, string> = {
      narrator: 'Narrator',
      lens: 'The Lens (Perspective)',
      rhythm: 'The Rhythm (Prose Mode)',
      temporal: 'The Temporal Filter (Tense/Tone)',
      lexicon: 'The Lexicon (Diction)',
      atmosphere: 'The Atmosphere (Vibe)'
    };

    let hasModalities = false;
    Object.entries(suite.modalities).forEach(([modality, voiceId]) => {
      if (voiceId) {
        const dna = voiceDNAs.find(v => v.id === voiceId) || authorVoices.find(v => v.id === voiceId);
        if (dna) {
          hasModalities = true;
          promptInstructions += `[${modalityLabels[modality] || modality}]:\n`;
          if (dna.narrativeStyle) promptInstructions += `- Style: ${dna.narrativeStyle}\n`;
          if (dna.proseStructure) promptInstructions += `- Structure: ${dna.proseStructure}\n`;
          if (dna.pacingRhythm) promptInstructions += `- Pacing: ${dna.pacingRhythm}\n`;
          if (dna.vocabularyDiction) promptInstructions += `- Diction: ${dna.vocabularyDiction}\n`;
          if (dna.thematicAnchors) promptInstructions += `- Themes: ${dna.thematicAnchors}\n`;
          promptInstructions += '\n';
        }
      }
    });

    if (!hasModalities) {
      promptInstructions += "No specific modalities defined for this suite.\n";
    }

    return {
      type: 'suite',
      id: suite.id,
      name: suite.name,
      promptInstructions: promptInstructions.trim(),
      displayInfo: {
        icon: 'Layout',
        description: 'Orchestrated Authorial Identity'
      }
    };
  } else {
    // It's an AuthorVoice
    const voice = selection as AuthorVoice;
    
    let promptInstructions = `Author Voice: ${voice.name}\n`;
    promptInstructions += `Category: ${voice.category}\n\n`;
    
    if (voice.narrativeStyle) promptInstructions += `- Style: ${voice.narrativeStyle}\n`;
    if (voice.proseStructure) promptInstructions += `- Structure: ${voice.proseStructure}\n`;
    if (voice.pacingRhythm) promptInstructions += `- Pacing: ${voice.pacingRhythm}\n`;
    if (voice.vocabularyDiction) promptInstructions += `- Diction: ${voice.vocabularyDiction}\n`;
    if (voice.thematicAnchors) promptInstructions += `- Themes: ${voice.thematicAnchors}\n`;

    return {
      type: 'voice',
      id: voice.id,
      name: voice.name,
      promptInstructions: promptInstructions.trim(),
      displayInfo: {
        icon: 'PenTool',
        description: 'Standalone Stylistic Persona'
      }
    };
  }
}
