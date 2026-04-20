import { useState, useMemo, useEffect } from 'react';
import { LoreEntry } from '../types';
import { useLoreStore } from '../stores/useLoreStore';

export const useLoreLogic = () => {
  const { loreEntries, loreCategories, addLoreEntry, deleteLoreEntry, importLoreEntries } = useLoreStore();
  const [view, setView] = useState<'index' | 'focus'>('index');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [editingEntry, setEditingEntry] = useState<LoreEntry | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingEvolutionFor, setCreatingEvolutionFor] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleOpenEntry = (e: Event) => {
      const customEvent = e as CustomEvent;
      const entryId = customEvent.detail;
      const entry = loreEntries.find(le => le.id === entryId);
      if (entry) {
        setEditingEntry(entry);
        setIsCreating(false);
        setView('focus');
      }
    };
    window.addEventListener('open-lore-entry', handleOpenEntry);
    return () => window.removeEventListener('open-lore-entry', handleOpenEntry);
  }, [loreEntries]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!initialized && loreCategories.length > 0) {
    setInitialized(true);
    setExpandedCategories(new Set(loreCategories.slice(0, 2).map(c => c.id)));
  }

  const toggleCategory = (catId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(catId)) next.delete(catId);
    else next.add(catId);
    setExpandedCategories(next);
  };

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelectedTags(next);
  };

  const handleSaveEntry = async (entry: LoreEntry) => {
    await addLoreEntry(entry);
    setIsCreating(false);
    setCreatingEvolutionFor(undefined);
    setEditingEntry(entry);
    setView('focus');
  };

  const handleEditEntry = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setIsCreating(false);
    setView('focus');
  };

  const handleAddNew = () => {
    setEditingEntry(undefined);
    setCreatingEvolutionFor(undefined);
    setIsCreating(true);
    setView('focus');
  };

  const handleCreateEvolution = (parentId: string) => {
    setEditingEntry(undefined);
    setCreatingEvolutionFor(parentId);
    setIsCreating(true);
    setView('focus');
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingEntry(undefined);
    setCreatingEvolutionFor(undefined);
    setView('index');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(loreEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-lore-codex.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const entries = JSON.parse(content);
        if (Array.isArray(entries)) {
          await importLoreEntries(entries);
        }
      } catch (error) {
        console.error("Failed to import lore entries:", error);
      }
    };
    reader.readAsText(file);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    loreEntries.forEach(e => e.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [loreEntries]);

  const entriesByCategory = useMemo(() => {
    const map: Record<string, LoreEntry[]> = {};
    loreCategories.forEach(cat => {
      map[cat.id] = loreEntries.filter(e => {
        const matchesParent = !e.parentId;
        const matchesCategory = e.categoryId === cat.id;
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             e.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.size === 0 || 
                           (e.tags && Array.from(selectedTags).every(t => e.tags?.includes(t)));
        
        return matchesParent && matchesCategory && matchesSearch && matchesTags;
      });
    });
    return map;
  }, [loreEntries, loreCategories, searchQuery, selectedTags]);

  return {
    loreEntries,
    loreCategories,
    view,
    setView,
    expandedCategories,
    toggleCategory,
    categoryLimits,
    setCategoryLimits,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    toggleTag,
    editingEntry,
    isCreating,
    isMobile,
    handleSaveEntry,
    handleEditEntry,
    handleAddNew,
    handleCloseForm,
    handleExport,
    handleImport,
    allTags,
    entriesByCategory,
    deleteLoreEntry,
    creatingEvolutionFor,
    handleCreateEvolution
  };
};
