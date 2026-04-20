import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  User,
  X,
  ChevronRight,
  Users,
  Star,
  UserPlus,
  UserMinus,
  ShieldQuestion,
  Heart,
  Target,
  Brain,
  Sparkles,
} from "lucide-react";
import { VoiceProfileForm } from "../forms/VoiceProfileForm";
import { motion, AnimatePresence } from "motion/react";
import { EmptyState } from "../ui/EmptyState";
import { useSwipe } from "../../hooks/useSwipe";
import { useVoiceLogic } from "../../hooks/useVoiceLogic";
import { DesktopPanelLayout } from "../ui/DesktopPanelLayout";
import { VoiceProfileCard } from "../voices/VoiceProfileCard";
import { EntityInspector } from "../ui/EntityInspector";

export function CharacterVoicesScreen({ onClose }: { onClose: () => void }) {
  const {
    voiceProfiles,
    searchQuery,
    setSearchQuery,
    editingProfile,
    isCreating,
    isMobile,
    handleSaveProfile,
    handleEditProfile,
    handleAddNew,
    handleCloseForm,
    deleteVoiceProfile,
    creatingEvolutionFor,
    handleCreateEvolution,
  } = useVoiceLogic();

  const [activeCategory, setActiveCategory] = useState("main");
  const [isModifying, setIsModifying] = useState(false);

  // Reset isModifying when profile changes
  React.useEffect(() => {
    setIsModifying(false);
  }, [editingProfile]);

  const categories = [
    { id: "main", label: "Main", icon: Star },
    { id: "secondary", label: "Secondary", icon: UserPlus },
    { id: "minor", label: "Minor", icon: UserMinus },
    { id: "others", label: "Others", icon: ShieldQuestion },
  ];

  const filteredVoices = useMemo(() => {
    return voiceProfiles.filter((v) => {
      // Only show base profiles in the list
      if (v.parentId) return false;

      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.archetype?.toLowerCase().includes(searchQuery.toLowerCase());

      if (searchQuery) return matchesSearch;

      // Filter by category based on archetype (case-insensitive)
      const arch = v.archetype?.toLowerCase() || "";
      if (activeCategory === "main")
        return arch.includes("main") || arch.includes("protagonist");
      if (activeCategory === "secondary")
        return arch.includes("secondary") || arch.includes("deuteragonist");
      if (activeCategory === "minor")
        return arch.includes("minor") || arch.includes("supporting");
      if (activeCategory === "others") {
        const isKnown =
          arch.includes("main") ||
          arch.includes("protagonist") ||
          arch.includes("secondary") ||
          arch.includes("deuteragonist") ||
          arch.includes("minor") ||
          arch.includes("supporting");
        return !isKnown;
      }

      return matchesSearch;
    });
  }, [voiceProfiles, searchQuery, activeCategory]);

  const middleColumn = useMemo(
    () => (
      <div className="p-4 flex flex-col gap-2">
        {filteredVoices.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest">
              No resonance found
            </p>
          </div>
        ) : (
          filteredVoices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => handleEditProfile(voice)}
              className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                editingProfile?.id === voice.id
                  ? "bg-primary/10 border-primary/30 shadow-primary-glow/10"
                  : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-surface-container-highest/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                    editingProfile?.id === voice.id
                      ? "bg-primary/20 border-primary/30 scale-110"
                      : "bg-surface-container-highest border-white/5 group-hover:border-white/10"
                  }`}
                >
                  <User
                    className={`w-6 h-6 ${editingProfile?.id === voice.id ? "text-primary" : "text-on-surface-variant/40"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-xs font-black tracking-tight truncate uppercase ${editingProfile?.id === voice.id ? "text-primary" : "text-on-surface"}`}
                    >
                      {voice.name}
                    </h4>
                    {voice.isForeshadowing && (
                      <Sparkles size={10} className="text-secondary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                      RES: {voice.id.substring(0, 8)}
                    </span>
                    <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest truncate">
                      • {voice.archetype || "Unnamed Archetype"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    ),
    [filteredVoices, editingProfile, handleEditProfile],
  );

  const rightColumn = useMemo(
    () => (
      <div className="h-full">
        {isCreating || (editingProfile && isModifying) ? (
          <div className="h-full">
            <VoiceProfileForm
              onClose={() => {
                if (isCreating) handleCloseForm();
                else setIsModifying(false);
              }}
              onSave={handleSaveProfile}
              initialData={editingProfile}
              isModal={false}
              voiceProfiles={voiceProfiles}
              parentId={creatingEvolutionFor}
              onCreateEvolution={handleCreateEvolution}
              onEditEvolution={handleEditProfile}
            />
          </div>
        ) : editingProfile ? (
          <EntityInspector
            title={editingProfile.name}
            subtitle={editingProfile.archetype || "Character Identity"}
            description={editingProfile.coreMotivation}
            icon={User}
            tags={[
              editingProfile.archetype || "",
              ...(editingProfile.traits || []),
            ].filter(Boolean)}
            metadata={[
              { label: "Role", value: editingProfile.archetype },
              {
                label: "DNA Resonance",
                value: editingProfile.id.substring(0, 12),
              },
              { label: "Internal Goal", value: editingProfile.internalGoal },
              {
                label: "Last Refined",
                value: editingProfile.lastModified
                  ? new Date(editingProfile.lastModified).toLocaleDateString()
                  : "Ancient",
              },
            ]}
            onEdit={() => setIsModifying(true)}
            onDelete={() => {
              if (
                window.confirm("Strike this resonance from the soul-archives?")
              ) {
                deleteVoiceProfile(editingProfile.id);
                handleCloseForm();
              }
            }}
            extraContent={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-highest/10 rounded-3xl p-6 border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                    <Heart size={12} /> Internal Conflict
                  </h3>
                  <p className="text-sm text-on-surface/80 leading-relaxed font-sans">
                    {editingProfile.internalConflict ||
                      "No internal friction recorded."}
                  </p>
                </div>
                <div className="bg-surface-container-highest/10 rounded-3xl p-6 border border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                    <Brain size={12} /> Intellectual Profile
                  </h3>
                  <p className="text-sm text-on-surface/80 leading-relaxed font-sans">
                    {editingProfile.voiceTraits?.diction ||
                      "No diction pattern synthesized."}
                  </p>
                </div>
              </div>
            }
          />
        ) : (
          <div className="h-full flex items-center justify-center p-10">
            <EmptyState
              icon={User}
              title="The Soul Archives"
              description="Select a character from the archives to view their soul-pattern, or create a new one to begin their journey."
              action={
                <button
                  onClick={handleAddNew}
                  className="px-10 py-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-primary-glow/10"
                >
                  Create Character Voice
                </button>
              }
            />
          </div>
        )}
      </div>
    ),
    [
      isCreating,
      editingProfile,
      isModifying,
      voiceProfiles,
      creatingEvolutionFor,
      handleCloseForm,
      handleSaveProfile,
      handleCreateEvolution,
      handleEditProfile,
      handleAddNew,
      deleteVoiceProfile,
    ],
  );

  return (
    <DesktopPanelLayout
      title="Character Voice DNA"
      subtitle="Soul-patterns and stylistic fingerprints of character expression."
      icon={<Users className="w-5 h-5 text-primary" />}
      onClose={onClose}
      onCreate={handleAddNew}
      createLabel="New Resonance"
      categories={categories}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      middleColumn={middleColumn}
      rightColumn={rightColumn}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isMobile={isMobile}
      showMiddleOnMobile={!editingProfile && !isCreating}
      showRightOnMobile={!!editingProfile || isCreating}
      onBackMobile={handleCloseForm}
    />
  );
}

export default CharacterVoicesScreen;
