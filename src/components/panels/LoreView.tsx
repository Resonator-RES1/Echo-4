import React, { useState, useMemo } from "react";
import {
  BookOpen,
  X,
  ChevronRight,
  Plus,
  Users,
  MapPin,
  Sword,
  Zap,
  Settings,
  Book,
  History,
  ShieldQuestion,
  Calendar,
  Tag,
  Info,
  GitBranch,
  Globe,
  Leaf,
  User,
  Gem,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { LoreEntryForm } from "../forms/LoreEntryForm";
import { motion, AnimatePresence } from "motion/react";
import { EmptyState } from "../ui/EmptyState";
import { useSwipe } from "../../hooks/useSwipe";
import { useLoreLogic } from "../../hooks/useLoreLogic";
import { DesktopPanelLayout } from "../ui/DesktopPanelLayout";
import { EntityInspector } from "../ui/EntityInspector";
import { DOMAIN_FIELD_CONFIG } from "../../constants/domainConfig";

const categoryIcons: Record<string, any> = {
  "cat-mythos": Zap,
  "cat-world": Globe,
  "cat-factions": Users,
  "cat-history": History,
  "cat-relics": Gem,
  "cat-nature": Leaf,
  "cat-characters": User,
  "cat-other": MoreHorizontal,
};

export function LoreScreen({ onClose }: { onClose: () => void }) {
  const {
    loreEntries,
    loreCategories,
    searchQuery,
    setSearchQuery,
    editingEntry,
    isCreating,
    isMobile,
    handleSaveEntry,
    handleEditEntry,
    handleAddNew,
    handleCloseForm,
    entriesByCategory,
    deleteLoreEntry,
    creatingEvolutionFor,
    handleCreateEvolution,
  } = useLoreLogic();

  const [activeCategory, setActiveCategory] = useState(
    loreCategories[0]?.id || "cat-mythos",
  );
  const [isModifying, setIsModifying] = useState(false);

  // Sync active category when loreCategories load
  React.useEffect(() => {
    if (loreCategories.length > 0 && !activeCategory.startsWith("cat-")) {
      setActiveCategory(loreCategories[0].id);
    }
  }, [loreCategories, activeCategory]);

  // Reset isModifying when entry changes
  React.useEffect(() => {
    setIsModifying(false);
  }, [editingEntry]);

  const categories = loreCategories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    icon: categoryIcons[cat.id] || Book,
  }));

  const filteredEntries = useMemo(() => {
    if (searchQuery) {
      return loreEntries.filter((e) => {
        const matchesSearch =
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return !e.parentId && matchesSearch;
      });
    }
    return entriesByCategory[activeCategory] || [];
  }, [loreEntries, entriesByCategory, activeCategory, searchQuery]);

  const middleColumn = useMemo(
    () => (
      <div className="p-4 flex flex-col gap-2">
        {filteredEntries.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest">
              The archives are empty
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => handleEditEntry(entry)}
              className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                editingEntry?.id === entry.id
                  ? "bg-primary/10 border-primary/30 shadow-primary-glow/10"
                  : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-surface-container-highest/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                    editingEntry?.id === entry.id
                      ? "bg-primary/20 border-primary/30 scale-110"
                      : "bg-surface-container-highest border-white/5 group-hover:border-white/10"
                  }`}
                >
                  {React.createElement(
                    categoryIcons[entry.categoryId] || Book,
                    {
                      className: `w-6 h-6 ${editingEntry?.id === entry.id ? "text-primary" : "text-on-surface-variant/40"}`,
                    },
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-xs font-black tracking-tight truncate uppercase ${editingEntry?.id === entry.id ? "text-primary" : "text-on-surface"}`}
                    >
                      {entry.title}
                    </h4>
                    {entry.isForeshadowing && (
                      <Sparkles size={10} className="text-secondary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                      ID: {entry.id.substring(0, 8)}
                    </span>
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest truncate">
                        • {entry.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    ),
    [filteredEntries, editingEntry, handleEditEntry],
  );

  const rightColumn = useMemo(
    () => (
      <div className="h-full">
        {isCreating || (editingEntry && isModifying) ? (
          <div className="h-full">
            <LoreEntryForm
              onClose={() => {
                if (isCreating) handleCloseForm();
                else setIsModifying(false);
              }}
              onSave={handleSaveEntry}
              initialData={editingEntry}
              isModal={false}
              loreEntries={loreEntries}
              parentId={creatingEvolutionFor}
              onCreateEvolution={handleCreateEvolution}
              onEditEvolution={handleEditEntry}
            />
          </div>
        ) : editingEntry ? (
          <EntityInspector
            title={editingEntry.title}
            description={editingEntry.description}
            subtitle="Core Memory Axiom"
            icon={categoryIcons[editingEntry.categoryId] || Book}
            tags={editingEntry.tags}
            metadata={[
              {
                label: "Category",
                value: loreCategories.find(
                  (c) => c.id === editingEntry.categoryId,
                )?.name,
              },
              {
                label: "Created",
                value: editingEntry.lastModified
                  ? new Date(editingEntry.lastModified).toLocaleDateString()
                  : "Ancient",
              },
              {
                label: "Foreshadowing",
                value: editingEntry.isForeshadowing ? "Yes" : "No",
              },
              {
                label: "Absolute Day",
                value: editingEntry.absoluteDay || "Global",
              },
            ]}
            onEdit={() => setIsModifying(true)}
            onDelete={() => {
              if (window.confirm("Strike this axiom from the records?")) {
                deleteLoreEntry(editingEntry.id);
                handleCloseForm();
              }
            }}
            extraContent={
              <div className="space-y-8">
                {/* Domain-Specific Data */}
                {(() => {
                  const domainFields = DOMAIN_FIELD_CONFIG[editingEntry.categoryId] || [];
                  const hasDomainData = domainFields.some(f => editingEntry.domainData?.[f.id]);
                  
                  if (!hasDomainData) return null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {domainFields.map(field => {
                        const value = editingEntry.domainData?.[field.id];
                        if (!value) return null;
                        return (
                          <div key={field.id} className="bg-surface-container-highest/10 rounded-2xl p-6 border border-white/5 space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/80">{field.label}</h3>
                            <p className="text-sm text-on-surface/70 leading-relaxed break-words">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Foundational Truths / Axioms */}
                {editingEntry.foundationalTruths && editingEntry.foundationalTruths.length > 0 && (
                  <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                       <Zap size={12} /> Foundational Truths
                    </h3>
                    <ul className="space-y-3">
                      {editingEntry.foundationalTruths.map((truth, i) => (
                        <li key={i} className="flex gap-3 text-sm text-on-surface/80 leading-relaxed font-mono">
                          <span className="text-primary/40">•</span>
                          {truth}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Secret Subtext (only if present) */}
                {editingEntry.secretSubtext && (
                  <div className="bg-secondary/5 rounded-3xl p-8 border border-secondary/10 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary/60 flex items-center gap-2">
                       <ShieldQuestion size={12} /> The Unseen
                    </h3>
                    <p className="text-sm text-on-surface/60 leading-relaxed italic">
                      {editingEntry.secretSubtext}
                    </p>
                  </div>
                )}

                {/* Evolution History handled by LoreEntryForm or separate list if needed */}
              </div>
            }
          />
        ) : (
          <div className="h-full flex items-center justify-center p-10">
            <EmptyState
              icon={BookOpen}
              title="The Grand Codex"
              description="Select an axiom from the archives to view its details, or create a new one to expand your world."
              action={
                <button
                  onClick={handleAddNew}
                  className="px-10 py-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-primary-glow/10"
                >
                  Create Lore Entry
                </button>
              }
            />
          </div>
        )}
      </div>
    ),
    [
      isCreating,
      editingEntry,
      isModifying,
      loreEntries,
      loreCategories,
      creatingEvolutionFor,
      handleCloseForm,
      handleSaveEntry,
      handleCreateEvolution,
      handleEditEntry,
      handleAddNew,
      deleteLoreEntry,
    ],
  );

  return (
    <DesktopPanelLayout
      title="Lore Codex"
      subtitle="The fundamental axioms and historical records of your world."
      icon={<BookOpen className="w-5 h-5 text-primary" />}
      onClose={onClose}
      onCreate={handleAddNew}
      createLabel="New Axiom"
      categories={categories}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      middleColumn={middleColumn}
      rightColumn={rightColumn}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isMobile={isMobile}
      showMiddleOnMobile={!editingEntry && !isCreating}
      showRightOnMobile={!!editingEntry || isCreating}
      onBackMobile={handleCloseForm}
    />
  );
}

export default LoreScreen;
