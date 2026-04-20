import React, { useMemo } from 'react';
import { diffWordsWithSpace } from 'diff';

export const RecentChangesList: React.FC<{ original: string; current: string }> = React.memo(({ original, current }) => {
    const diffResult = useMemo(() => {
        return diffWordsWithSpace(original, current);
    }, [original, current]);

    const changes = useMemo(() => {
        const list: React.ReactNode[] = [];
        let contextBefore = "";
        
        diffResult.forEach((part, index) => {
            if (part.added || part.removed) {
                const snippet = contextBefore.slice(-40).trimStart();
                list.push(
                    <div key={index} className="p-3 bg-surface-container-highest/30 rounded-lg border border-outline-variant/10 mb-2">
                        {snippet && <span className="text-on-surface-variant/50 text-xs">...{snippet} </span>}
                        {part.added ? (
                            <span className="bg-primary/20 text-primary rounded px-1 text-sm">{part.value}</span>
                        ) : (
                            <span className="bg-error/20 text-error rounded px-1 text-sm line-through">{part.value}</span>
                        )}
                    </div>
                );
            }
            if (!part.added && !part.removed) {
                contextBefore += part.value;
            }
        });
        
        // Reverse to show most recent changes first (if we assume later in text is more recent, 
        // though it's actually just order in text. We'll just show them in order).
        return list;
    }, [diffResult]);

    if (changes.length === 0) {
        return <div className="p-4 text-center text-on-surface-variant/50 italic text-xs">No recent changes detected.</div>;
    }

    return (
        <div className="flex flex-col gap-1">
            {changes.slice(-20).reverse()} {/* Show last 20 changes, newest at top if we assume bottom is newest */}
        </div>
    );
});
