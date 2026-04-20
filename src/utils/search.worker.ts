import { Scene, LoreEntry, VoiceProfile, AuthorVoice } from '../types';

interface SearchMatch {
  id: string;
  type: string;
  title: string;
  text: string;
  index: number;
  item: any;
}

const getSnippet = (text: string | undefined, index: number, length: number) => {
    if (!text) return '';
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + length + 30);
    return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
};

self.onmessage = (e: MessageEvent) => {
    const { query, scenes, loreEntries, voiceProfiles, authorVoices } = e.data;

    if (!query.trim() || query.length < 2) {
        self.postMessage({ matches: [] });
        return;
    }

    const results: SearchMatch[] = [];
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    // Search Scenes
    scenes.forEach((scene: Scene) => {
      let match;
      if (scene.content) {
        while ((match = searchRegex.exec(scene.content)) !== null) {
          results.push({
            id: `scene-${scene.id}-${match.index}`,
            type: 'scene',
            title: `Scene: ${scene.title}`,
            text: getSnippet(scene.content, match.index, query.length),
            index: match.index,
            item: scene
          });
        }
      }
    });

    // Search Lore
    loreEntries.forEach((lore: LoreEntry) => {
      let match;
      if (lore.description) {
        while ((match = searchRegex.exec(lore.description)) !== null) {
          results.push({
            id: `lore-${lore.id}-${match.index}`,
            type: 'lore',
            title: `Lore: ${lore.title}`,
            text: getSnippet(lore.description, match.index, query.length),
            index: match.index,
            item: lore
          });
        }
      }
    });

    // Search Voice Profiles
    voiceProfiles.forEach((vp: VoiceProfile) => {
        const fullText = `${vp.soulPattern} ${vp.cognitiveSpeech} ${vp.conversationalRole} ${vp.coreMotivation} ${vp.conflictStyle} ${vp.preview} ${vp.internalMonologue} ${vp.physicalTells}`;
        let match;
        while ((match = searchRegex.exec(fullText)) !== null) {
          results.push({
            id: `voice-${vp.id}-${match.index}`,
            type: 'voiceProfile',
            title: `Voice: ${vp.name}`,
            text: getSnippet(fullText, match.index, query.length),
            index: match.index,
            item: vp
          });
        }
    });

    // Search Author Voices
    authorVoices.forEach((av: AuthorVoice) => {
        const fullText = `${av.narrativeStyle} ${av.proseStructure} ${av.pacingRhythm} ${av.vocabularyDiction} ${av.thematicAnchors}`;
        let match;
        while ((match = searchRegex.exec(fullText)) !== null) {
          results.push({
            id: `author-${av.id}-${match.index}`,
            type: 'authorVoice',
            title: `Author Voice: ${av.name}`,
            text: getSnippet(fullText, match.index, query.length),
            index: match.index,
            item: av
          });
        }
    });

    self.postMessage({ matches: results });
};
