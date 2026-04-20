import { RefineDraftResult } from '../types';

export interface HighlightRange {
  start: number;
  end: number;
  type: 'restraint' | 'lore' | 'fraying';
  metadata: any;
}

/**
 * Finds the indices of snippets mentioned in the restraintLog, loreCorrections, and loreFraying
 * within the refined text.
 */
export const getHighlightRanges = (refinedText: string, result: any): HighlightRange[] => {
  const ranges: HighlightRange[] = [];
  if (!result) return ranges;

  // 1. Lore Corrections (Red) - Highest Priority
  if (result.loreCorrections && Array.isArray(result.loreCorrections)) {
    result.loreCorrections.forEach((correction: any) => {
      if (correction.snippet && correction.snippet.length > 0) {
        let index = refinedText.indexOf(correction.snippet);
        while (index !== -1) {
          const exists = ranges.some(r => r.start === index && r.end === index + correction.snippet.length && r.type === 'lore');
          if (!exists) {
            ranges.push({
              start: index,
              end: index + correction.snippet.length,
              type: 'lore',
              metadata: correction
            });
          }
          index = refinedText.indexOf(correction.snippet, index + 1);
        }
      }
    });
  }

  // 2. Lore Fraying (Amber) - Medium Priority
  if (result.loreFraying && Array.isArray(result.loreFraying)) {
    result.loreFraying.forEach((query: any) => {
      if (query.snippet && query.snippet.length > 0) {
        let index = refinedText.indexOf(query.snippet);
        while (index !== -1) {
          // Check if this range already exists as a LORE correction. 
          const overlapsWithLore = ranges.some(r => 
            r.type === 'lore' && 
            Math.max(r.start, index) < Math.min(r.end, index + query.snippet.length)
          );
          
          const exists = ranges.some(r => r.start === index && r.end === index + query.snippet.length && r.type === 'fraying');
          
          if (!exists && !overlapsWithLore) {
            ranges.push({
              start: index,
              end: index + query.snippet.length,
              type: 'fraying',
              metadata: query
            });
          }
          index = refinedText.indexOf(query.snippet, index + 1);
        }
      }
    });
  }

  // 3. Restraint Log (Blue) - Lowest Priority
  if (result.restraintLog && Array.isArray(result.restraintLog)) {
    result.restraintLog.forEach((log: any) => {
      if (log.snippet && log.snippet.length > 0) {
        let index = refinedText.indexOf(log.snippet);
        while (index !== -1) {
          // Check if this range already exists as a LORE correction or FRAYING query. 
          // Lore corrections and Fraying take priority.
          const overlapsWithHigherPriority = ranges.some(r => 
            (r.type === 'lore' || r.type === 'fraying') && 
            Math.max(r.start, index) < Math.min(r.end, index + log.snippet.length)
          );
          
          const exists = ranges.some(r => r.start === index && r.end === index + log.snippet.length);
          
          if (!exists && !overlapsWithHigherPriority) {
            ranges.push({
              start: index,
              end: index + log.snippet.length,
              type: 'restraint',
              metadata: log
            });
          }
          index = refinedText.indexOf(log.snippet, index + 1);
        }
      }
    });
  }

  // Sort ranges by start index
  return ranges.sort((a, b) => a.start - b.start);
};
