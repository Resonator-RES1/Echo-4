import MiniSearch from 'minisearch';
import { LoreEntry, VoiceProfile, Scene, CalendarConfig, ContinuityIssue } from '../types';
import { detectTimelineIssues, checkSocialConsistency, extractKeywords, scanForContext } from './contextScanner';

let miniSearch: MiniSearch | null = null;

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'INIT') {
        const { entries, voices } = payload as { entries: LoreEntry[], voices: VoiceProfile[] };
        
        miniSearch = new MiniSearch({
            fields: ['title', 'name', 'aliases'],
            storeFields: ['id', 'type'],
            searchOptions: {
                boost: { title: 2, name: 2, aliases: 1.5 },
                fuzzy: 0.1,
                prefix: false
            }
        });

        const documents = [
            ...entries.map(e => ({
                id: e.id,
                title: e.title,
                aliases: e.aliases?.join(' ') || '',
                type: 'lore'
            })),
            ...voices.map(v => ({
                id: v.id,
                name: v.name,
                aliases: v.aliases?.join(' ') || '',
                type: 'voice'
            }))
        ];
        
        miniSearch.addAll(documents);
        self.postMessage({ type: 'INIT_COMPLETE' });
    }

    if (type === 'SCAN') {
        const { text, loreEntries, activeVoices, currentScene, calendarConfig } = payload as {
            text: string;
            loreEntries: LoreEntry[];
            activeVoices: VoiceProfile[];
            currentScene: Scene | undefined;
            calendarConfig: CalendarConfig | undefined;
        };

        if (!miniSearch || !text.trim()) {
            self.postMessage({ type: 'SCAN_COMPLETE', issues: [] });
            return;
        }

        const issues: ContinuityIssue[] = [];

        // 1. Hard Matches (Strict Regex)
        const detectedIds = scanForContext(text, loreEntries, activeVoices);
        
        // 2. Conceptual Hits (Refined Fuzzy Search)
        // Instead of searching with the whole text, we extract high-value keywords
        const keywords = extractKeywords(text);
        const conceptualHits: any[] = [];
        
        if (keywords.length > 0) {
            const query = keywords.join(' ');
            const results = miniSearch.search(query, {
                fuzzy: 0.2,
                prefix: false,
                combineWith: 'OR'
            });

            results.forEach(hit => {
                // Only consider it a conceptual hit if it wasn't a hard match
                // and has a decent score
                if (!detectedIds.includes(hit.id) && hit.score > 5) {
                    conceptualHits.push(hit);
                }
            });
        }

        conceptualHits.slice(0, 2).forEach(hit => {
            const entry = loreEntries.find(e => e.id === hit.id);
            if (entry && !entry.isActive) {
                issues.push({
                    id: `conceptual-${hit.id}`,
                    type: 'conceptual',
                    severity: 'low',
                    message: `Thematic Connection: "${entry.title}" seems relevant to this scene's mood or concepts.`,
                    linkedEntryId: entry.id
                });
            }
        });

        // 3. Timeline Guard
        issues.push(...detectTimelineIssues(text, currentScene, loreEntries, calendarConfig));

        // 4. Social dynamics
        issues.push(...checkSocialConsistency(text, activeVoices, loreEntries));

        // 5. Pronoun/Gender checks
        activeVoices.forEach(voice => {
            const nameRegex = new RegExp(`\\b${voice.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            if (nameRegex.test(text)) {
                const checkPronoun = (pronoun: string, replacement: string, idSuffix: string) => {
                    const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
                    if (regex.test(text)) {
                        issues.push({ 
                            id: `pronoun-${idSuffix}-${voice.id}`, 
                            type: 'voice', 
                            severity: 'medium', 
                            message: `Possible pronoun mismatch for ${voice.name} (Profile: ${voice.gender}, but found '${pronoun}').`, 
                            actionable: { original: pronoun, replacement: replacement } 
                        });
                    }
                };

                if (voice.gender === 'male') {
                    checkPronoun('she', 'he', 'she');
                    checkPronoun('her', 'his', 'her');
                }
                if (voice.gender === 'female') {
                    checkPronoun('he', 'she', 'he');
                    checkPronoun('him', 'her', 'him');
                }
            }
        });

        self.postMessage({ type: 'SCAN_COMPLETE', issues, detectedIds });
    }
};
