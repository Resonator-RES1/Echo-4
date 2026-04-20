export function replaceClosestOccurrence(fullText: string, searchText: string, replacementText: string, estimatedIndex: number): string {
    if (!searchText) return fullText;
    
    let bestIndex = -1;
    let minDistance = Infinity;
    let currentIndex = fullText.indexOf(searchText);
    
    while (currentIndex !== -1) {
        const distance = Math.abs(currentIndex - estimatedIndex);
        if (distance < minDistance) {
            minDistance = distance;
            bestIndex = currentIndex;
        }
        currentIndex = fullText.indexOf(searchText, currentIndex + 1);
    }
    
    if (bestIndex !== -1) {
        return fullText.substring(0, bestIndex) + replacementText + fullText.substring(bestIndex + searchText.length);
    }
    
    // Fallback if not found exactly (e.g. due to markdown formatting differences)
    return fullText.replace(searchText, replacementText);
}
