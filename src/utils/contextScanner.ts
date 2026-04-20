import MiniSearch from 'minisearch';
import { LoreEntry, VoiceProfile, Scene, CalendarConfig, ContinuityIssue, ScannerInstances } from '../types';
import { getStoredSearchIndex, putStoredSearchIndex } from '../services/dbService';
import { calculateAbsoluteDay } from './calendar';

const STOP_WORDS = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'they', 'have', 'were',
    'what', 'when', 'where', 'who', 'how', 'will', 'your', 'their', 'there',
    'about', 'would', 'could', 'should', 'been', 'than', 'then', 'them',
    'some', 'into', 'over', 'under', 'after', 'before', 'just', 'more',
    'very', 'only', 'also', 'even', 'back', 'well', 'down', 'upon', 'within'
]);

export const extractKeywords = (text: string): string[] => {
    // Extract words that look like proper nouns (Capitalized) or unique terms
    // Filter out common stop words
    const words = text.match(/\b[A-Z][a-z]+\b|\b[a-z]{5,}\b/g) || [];
    return Array.from(new Set(words))
        .filter(word => !STOP_WORDS.has(word.toLowerCase()));
};

export const createScanner = async (entries: LoreEntry[], voices: VoiceProfile[], projectId?: string): Promise<ScannerInstances> => {
    const miniSearch = new MiniSearch({
        fields: ['title', 'name', 'aliases'],
        storeFields: ['id', 'type'],
        searchOptions: {
            boost: { title: 2, name: 2, aliases: 1.5 },
            fuzzy: 0.1,
            prefix: false
        }
    });

    if (projectId) {
        const stored = await getStoredSearchIndex(projectId);
        if (stored) {
            try {
                const loadedSearch = MiniSearch.loadJSON(stored, {
                    fields: ['title', 'name', 'aliases'],
                    storeFields: ['id', 'type'],
                    searchOptions: {
                        boost: { title: 2, name: 2, aliases: 1.5 },
                        fuzzy: 0.1,
                        prefix: false
                    }
                });
                return { miniSearch: loadedSearch };
            } catch (e) {
                console.error("Failed to load search index", e);
            }
        }
    }

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

    if (projectId) {
        await putStoredSearchIndex(projectId, JSON.stringify(miniSearch));
    }
    
    return { miniSearch };
};

export const scanForContext = (text: string, loreEntries: LoreEntry[], voiceProfiles: VoiceProfile[]) => {
    if (!text.trim()) return [];
    
    const detectedIds: string[] = [];

    // Use strict regex matching for active detection instead of fuzzy search
    // This prevents "Cat" matching "Category"
    loreEntries.forEach(entry => {
        const terms = [entry.title, ...(entry.aliases || [])];
        const found = terms.some(term => {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            return regex.test(text);
        });
        if (found) detectedIds.push(entry.id);
    });

    voiceProfiles.forEach(voice => {
        const terms = [voice.name, ...(voice.aliases || [])];
        const found = terms.some(term => {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            return regex.test(text);
        });
        if (found) detectedIds.push(voice.id);
    });

    return detectedIds;
};

export const detectTimelineIssues = (
    text: string, 
    currentScene: Scene | undefined, 
    loreEntries: LoreEntry[],
    calendarConfig?: CalendarConfig
): ContinuityIssue[] => {
    const issues: ContinuityIssue[] = [];
    if (!currentScene) return issues;

    const currentDay = calendarConfig?.useCustomCalendar && currentScene.storyDate
        ? calculateAbsoluteDay(currentScene.storyDate, calendarConfig)
        : currentScene.storyDay;

    if (currentDay === undefined) return issues;

    const timelineEntries = loreEntries.filter(e => e.categoryId === 'history' && (e.storyDay !== undefined || e.storyDate !== undefined));
    
    timelineEntries.forEach(entry => {
        const titleRegex = new RegExp(`\\b${entry.title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
        if (titleRegex.test(text)) {
            const entryDay = calendarConfig?.useCustomCalendar && entry.storyDate
                ? calculateAbsoluteDay(entry.storyDate, calendarConfig)
                : entry.storyDay;

            if (entryDay !== undefined && currentDay < entryDay) {
                const currentDisplay = calendarConfig?.useCustomCalendar && currentScene.storyDate
                    ? `${calendarConfig.months[currentScene.storyDate.month]?.name} ${currentScene.storyDate.day}, Year ${currentScene.storyDate.year}`
                    : `Day ${currentScene.storyDay}`;

                const entryDisplay = calendarConfig?.useCustomCalendar && entry.storyDate
                    ? `${calendarConfig.months[entry.storyDate.month]?.name} ${entry.storyDate.day}, Year ${entry.storyDate.year}`
                    : `Day ${entry.storyDay}`;

                issues.push({
                    id: `timeline-${entry.id}`,
                    type: 'timeline',
                    severity: 'high',
                    message: `Chronological Anomaly: Scene occurs on ${currentDisplay}, but references "${entry.title}" which happens on ${entryDisplay}.`
                });
            }
        }
    });

    return issues;
};

export const checkSocialConsistency = (text: string, activeVoices: VoiceProfile[], loreEntries: LoreEntry[]): ContinuityIssue[] => {
    const issues: ContinuityIssue[] = [];
    
    // Friendly keywords that might contradict tense relationships
    const friendlyKeywords = ['smiled warmly', 'laughed together', 'hugged', 'best friend', 'trusted', 'kindly', 'gentle touch', 'softly said'];
    
    activeVoices.forEach(voice => {
        const characterLore = loreEntries.find(e => e.title.toLowerCase() === voice.name.toLowerCase() && e.categoryId === 'characters');
        if (!characterLore || !characterLore.relationships) return;

        characterLore.relationships.forEach(rel => {
            if (rel.type.toLowerCase().includes('combustive') || rel.type.toLowerCase().includes('tense') || rel.tension >= 4) {
                const targetVoice = activeVoices.find(v => v.id === rel.targetId);
                if (targetVoice) {
                    const voiceRegex = new RegExp(`\\b${voice.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
                    const targetRegex = new RegExp(`\\b${targetVoice.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
                    
                    // Find positions of mentions
                    const voiceMatches: number[] = [];
                    let m;
                    while ((m = voiceRegex.exec(text)) !== null) voiceMatches.push(m.index);
                    
                    const targetMatches: number[] = [];
                    while ((m = targetRegex.exec(text)) !== null) targetMatches.push(m.index);

                    if (voiceMatches.length > 0 && targetMatches.length > 0) {
                        // Check proximity (within 500 characters ~ 100 words)
                        const isProximal = voiceMatches.some(vPos => 
                            targetMatches.some(tPos => Math.abs(vPos - tPos) < 500)
                        );

                        if (isProximal) {
                            const foundFriendly = friendlyKeywords.find(k => {
                                const kRegex = new RegExp(`\\b${k}\\b`, 'gi');
                                // Check if friendly keyword is near either character
                                let km;
                                while ((km = kRegex.exec(text)) !== null) {
                                    if (voiceMatches.some(vPos => Math.abs(vPos - km!.index) < 300) || 
                                        targetMatches.some(tPos => Math.abs(tPos - km!.index) < 300)) {
                                        return true;
                                    }
                                }
                                return false;
                            });

                            if (foundFriendly) {
                                issues.push({
                                    id: `social-${voice.id}-${targetVoice.id}`,
                                    type: 'social',
                                    severity: 'medium',
                                    message: `Social Dissonance: ${voice.name} and ${targetVoice.name} have a ${rel.type} relationship, but the text suggests warmth ("${foundFriendly}") in their proximity.`,
                                    linkedEntryId: voice.id
                                });
                            }
                        }
                    }
                }
            }
        });
    });

    return issues;
};

export const performLocalScan = (
    text: string, 
    loreEntries: LoreEntry[], 
    activeVoices: VoiceProfile[], 
    currentScene: Scene | undefined,
    miniSearch: MiniSearch,
    calendarConfig?: CalendarConfig
): ContinuityIssue[] => {
    const issues: ContinuityIssue[] = [];
    if (!text.trim() || !miniSearch) return issues;

    // 1. Hard Matches (MiniSearch)
    const hardMatches = miniSearch.search(text);
    
    // 2. Conceptual Hits (Fuzzy MiniSearch)
    const conceptualHits = miniSearch.search(text, {
        fuzzy: 0.2,
        prefix: false
    }).filter(hit => !hardMatches.find(hm => hm.id === hit.id));

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

    // 5. Pronoun/Gender checks & Alias checks
    activeVoices.forEach(voice => {
        const nameRegex = new RegExp(`\\b${voice.name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
        const isNameMentioned = nameRegex.test(text);
        
        // Alias Check
        if (voice.aliases && voice.aliases.length > 0) {
            voice.aliases.forEach(alias => {
                const aliasRegex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
                if (aliasRegex.test(text)) {
                    issues.push({
                        id: `alias-${alias}-${voice.id}`,
                        type: 'voice',
                        severity: 'low',
                        message: `Alias Detected: "${alias}" used for ${voice.name}. Consider standardizing.`,
                        actionable: { original: alias, replacement: voice.name }
                    });
                }
            });
        }

        if (isNameMentioned) {
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

    return issues;
};

import { DensityMap, DensityPoint } from '../types';

export const calculateDensityMap = (
    text: string,
    loreEntries: LoreEntry[],
    activeVoices: VoiceProfile[],
    issues: ContinuityIssue[] = []
): DensityMap => {
    const points: DensityPoint[] = [];
    const textLength = text.length;
    if (textLength === 0) return { points };

    // 1. Map Lore Mentions
    loreEntries.forEach(entry => {
        const terms = [entry.title, ...(entry.aliases || [])];
        terms.forEach(term => {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                points.push({
                    offset: (match.index / textLength) * 100,
                    type: 'lore',
                    id: entry.id,
                    label: entry.title
                });
            }
        });
    });

    // 2. Map Voice Mentions
    activeVoices.forEach(voice => {
        const terms = [voice.name, ...(voice.aliases || [])];
        terms.forEach(term => {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                points.push({
                    offset: (match.index / textLength) * 100,
                    type: 'voice',
                    id: voice.id,
                    label: voice.name
                });
            }
        });
    });

    // 3. Map Issues (if they have actionable snippets we can find, or just general mapping)
    // For now, we'll map issues that have 'actionable.original' text
    issues.forEach(issue => {
        if (issue.actionable?.original) {
            const regex = new RegExp(`\\b${issue.actionable.original.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                points.push({
                    offset: (match.index / textLength) * 100,
                    type: 'issue',
                    id: issue.id,
                    label: issue.message,
                    severity: issue.severity
                });
            }
        }
    });

    return { points: points.sort((a, b) => a.offset - b.offset) };
};
