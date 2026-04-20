import { LoreEntry, VoiceProfile, StoryDate } from '../types';
import { calculateAbsoluteDay } from './calendar';

/**
 * Checks if a value is "empty" or "unset" in the context of a delta override.
 */
const isEmpty = (val: any): boolean => {
  if (val === undefined || val === null) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && Object.keys(val).length === 0) return true;
  return false;
};

/**
 * Resolves the state of a profile (Lore or Voice) at a specific story day.
 * It takes a base profile and an array of all its deltas (evolutions),
 * then merges them chronologically up to the target day.
 */
export const resolveProfileAtDay = <T extends { id: string, parentId?: string, storyDay?: number, storyDate?: StoryDate }>(
  base: T,
  allDeltas: T[],
  targetDay: number,
  calendarConfig?: any
): T => {
  // 1. Filter deltas that belong to this base and occurred on or before the target day
  const applicableDeltas = allDeltas
    .filter(d => {
      if (d.parentId !== base.id) return false;
      
      const deltaDay = calendarConfig?.useCustomCalendar && d.storyDate
        ? calculateAbsoluteDay(d.storyDate, calendarConfig)
        : (d.storyDay ?? 0);
        
      return deltaDay <= targetDay;
    })
    // 2. Sort chronologically
    .sort((a, b) => {
      const dayA = calendarConfig?.useCustomCalendar && a.storyDate
        ? calculateAbsoluteDay(a.storyDate, calendarConfig)
        : (a.storyDay ?? 0);
      const dayB = calendarConfig?.useCustomCalendar && b.storyDate
        ? calculateAbsoluteDay(b.storyDate, calendarConfig)
        : (b.storyDay ?? 0);
      return dayA - dayB;
    });

  // 3. Merge layers
  return applicableDeltas.reduce((acc, delta) => {
    const merged = { ...acc };
    
    // Only overwrite fields that are NOT empty in the delta
    Object.keys(delta).forEach(key => {
      const val = (delta as any)[key];
      
      // Special handling for nested objects like 'dna' or 'relationships'
      if (key === 'dna' || key === 'relationships' || key === 'physicalTells') {
        if (!isEmpty(val)) {
          (merged as any)[key] = val;
        }
      } else if (!isEmpty(val)) {
        // Skip metadata fields that shouldn't be overridden by deltas
        if (key !== 'id' && key !== 'parentId' && key !== 'categoryId' && key !== 'collectionId') {
          (merged as any)[key] = val;
        }
      }
    });
    
    return merged;
  }, base);
};

/**
 * Resolves a list of profiles, separating bases from deltas and applying the resolution.
 */
export const resolveAllProfiles = <T extends { id: string, parentId?: string, storyDay?: number, storyDate?: StoryDate }>(
  items: T[],
  targetDay: number,
  calendarConfig?: any
): T[] => {
  const bases = items.filter(i => !i.parentId);
  const deltas = items.filter(i => !!i.parentId);

  return bases.map(base => resolveProfileAtDay(base, deltas, targetDay, calendarConfig));
};
