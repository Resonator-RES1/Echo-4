import React, { useState, useEffect, useCallback } from 'react';
import { Settings2, Trash2, Save } from 'lucide-react';
import { UserPreset, FocusArea, FeedbackDepth } from '../../../types';
import { getUserPresets, putUserPreset, deleteUserPreset } from '../../../services/dbService';
import { useUIStore } from '../../../stores/useUIStore';
import { useConfigStore } from '../../../stores/useConfigStore';

interface UserPresetManagerProps {
    showToast: (message: string) => void;
}

export const UserPresetManager: React.FC<UserPresetManagerProps> = ({ showToast }) => {
    const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
    const [isSavingPreset, setIsSavingPreset] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    const focusAreas = useConfigStore(state => state.focusAreas);
    const setFocusAreas = useConfigStore(state => state.setFocusAreas);
    const model = useConfigStore(state => state.model);
    const setModel = useConfigStore(state => state.setModel);
    const feedbackDepth = useConfigStore(state => state.feedbackDepth);
    const setFeedbackDepth = useConfigStore(state => state.setFeedbackDepth);
    const activePresetIds = useConfigStore(state => state.activePresetIds);
    const setActivePresetIds = useConfigStore(state => state.setActivePresetIds);

    const customDirectives = useUIStore(state => state.customDirectives);
    const setCustomDirectives = useUIStore(state => state.setCustomDirectives);

    const activePresetId = activePresetIds[0];
    const setActivePresetId = (id: string | undefined) => setActivePresetIds(id ? [id] : []);

    const loadUserPresets = useCallback(async () => {
        const presets = await getUserPresets();
        setUserPresets(presets);
    }, []);

    useEffect(() => {
        let isMounted = true;
        getUserPresets().then(presets => {
            if (isMounted) setUserPresets(presets);
        });
        return () => { isMounted = false; };
    }, []);

    const handleSavePreset = async () => {
        if (!newPresetName.trim()) {
            showToast("Please enter a name for your preset.");
            return;
        }

        const newPreset: UserPreset = {
            id: crypto.randomUUID(),
            name: newPresetName.trim(),
            focusAreas,
            depth: feedbackDepth,
            model,
            customFocus: customDirectives.trim() || undefined,
            lastModified: new Date().toISOString()
        };

        await putUserPreset(newPreset);
        await loadUserPresets();
        setNewPresetName('');
        setIsSavingPreset(false);
        setActivePresetId(newPreset.id);
        showToast(`Preset "${newPreset.name}" saved.`);
    };

    const handleDeletePreset = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteUserPreset(id);
        await loadUserPresets();
        if (activePresetId === id) setActivePresetId(undefined);
        showToast("Preset deleted.");
    };

    const handleUserPresetSelect = (preset: UserPreset) => {
        setFocusAreas(preset.focusAreas);
        setModel(preset.model);
        setFeedbackDepth(preset.depth);
        setCustomDirectives(preset.customFocus || '');
        setActivePresetId(preset.id);
        showToast(`User Preset: ${preset.name} activated.`);
    };

    if (userPresets.length === 0 && !isSavingPreset) {
        return (
            <div className="pt-4">
                <button 
                    onClick={() => setIsSavingPreset(true)}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors px-1"
                >
                    <Save className="w-3.5 h-3.5" />
                    Save Current Config as Preset
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {userPresets.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">User Presets</label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {userPresets.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() => handleUserPresetSelect(preset)}
                                className={`
                                    group relative flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer
                                    ${activePresetId === preset.id 
                                        ? 'bg-primary/5 border-primary shadow-lg scale-[1.02] z-10' 
                                        : 'bg-surface-container-highest/10 border-outline-variant/10 hover:border-outline-variant/30 hover:bg-surface-container-highest/20'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start w-full mb-1.5">
                                    <div className={`p-1 rounded bg-surface-container-low border border-white/5 ${activePresetId === preset.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        <Settings2 className="w-3 h-3" />
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeletePreset(e, preset.id)}
                                        className="p-1 rounded hover:bg-error/10 text-on-surface-variant/20 hover:text-error transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className={`text-[9px] font-bold uppercase tracking-wider ${activePresetId === preset.id ? 'text-primary' : 'text-on-surface'}`}>
                                        {preset.name}
                                    </h4>
                                    <p className="text-[8px] text-on-surface-variant/60 leading-tight font-medium">
                                        {preset.focusAreas.length} Focus Areas • {preset.depth}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-2">
                {isSavingPreset ? (
                    <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                        <input 
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="Preset Name..."
                            className="flex-1 bg-surface-container-highest/30 border border-primary/30 rounded-lg px-3 py-1.5 text-[9px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                            autoFocus
                        />
                        <button 
                            onClick={handleSavePreset}
                            className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
                        >
                            Save
                        </button>
                        <button 
                            onClick={() => setIsSavingPreset(false)}
                            className="px-3 py-1.5 bg-surface-container-highest text-on-surface-variant rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsSavingPreset(true)}
                        className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-primary/60 hover:text-primary transition-colors px-1"
                    >
                        <Save className="w-3 h-3" />
                        Save Current Config as Preset
                    </button>
                )}
            </div>
        </div>
    );
};
