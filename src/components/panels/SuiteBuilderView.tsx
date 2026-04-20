import React, { useState, useMemo } from "react";
import {
  Layout,
  Plus,
  Trash2,
  ChevronRight,
  X,
  Check,
  Mic2,
  Eye,
  Zap,
  Clock,
  ChevronDown,
  Sparkles,
  Save,
  Loader2,
  Fingerprint,
  PenTool,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSuiteBuilder } from "../../hooks/useSuiteBuilder";
import { AuthorVoiceSuite, AuthorVoice } from "../../types";
import { Button } from "../ui/button";
import { AuthorVoiceForm } from "../forms/AuthorVoiceForm";
import { DesktopPanelLayout } from "../ui/DesktopPanelLayout";
import { SuiteEditor } from "../editor/SuiteEditor";
import { FragmentEditor } from "../editor/FragmentEditor";
import { VoiceSelectionModal } from "../editor/VoiceSelectionModal";

interface SuiteBuilderViewProps {
  onClose: () => void;
}

export default function SuiteBuilderView({ onClose }: SuiteBuilderViewProps) {
  const {
    voiceDNAs,
    voiceSuites,
    authorVoices,
    fragments,
    activeTab,
    setActiveTab,
    editingSuite,
    setEditingSuite,
    editingVoice,
    setEditingVoice,
    editingFragment,
    setEditingFragment,
    isCreating,
    setIsCreating,
    isSelectingVoice,
    setIsSelectingVoice,
    handleCreateNewSuite,
    handleCreateNewVoice,
    handleCreateNewFragment,
    handleSaveSuite,
    handleSaveVoice,
    handleSaveFragment,
    handleSelectVoice,
    deleteVoiceSuite,
    deleteFragment,
  } = useSuiteBuilder();

  const [isModifying, setIsModifying] = useState(false);

  // Reset isModifying when selection changes
  React.useEffect(() => {
    setIsModifying(false);
  }, [editingSuite, editingVoice, editingFragment]);

  const categories = [
    { id: "suites", label: "Suites", icon: Layout },
    { id: "voices", label: "Voices", icon: Mic2 },
    { id: "fragments", label: "Fragments", icon: PenTool },
  ];

  const middleColumn = (
    <div className="p-4 flex flex-col gap-2">
      {activeTab === "suites" &&
        voiceSuites.map((suite) => (
          <button
            key={suite.id}
            onClick={() => {
              setEditingSuite(suite);
              setEditingVoice(null);
              setEditingFragment(null);
              setIsCreating(false);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
              editingSuite?.id === suite.id
                ? "bg-secondary/10 border-secondary/30 shadow-secondary-glow/10"
                : "bg-surface-container-low/40 border-white/5 hover:border-secondary/20 hover:bg-secondary/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  editingSuite?.id === suite.id
                    ? "bg-secondary/20 border-secondary/30 scale-110"
                    : "bg-surface-container-highest border-white/5 group-hover:border-secondary/20"
                }`}
              >
                <Layout
                  className={`w-6 h-6 ${editingSuite?.id === suite.id ? "text-secondary" : "text-on-surface-variant/40"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`text-xs font-black tracking-tight truncate uppercase ${editingSuite?.id === suite.id ? "text-secondary" : "text-on-surface"}`}
                  >
                    {suite.name}
                  </h4>
                  {suite.isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-secondary-glow" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                    SUITE: {suite.id.substring(0, 8)}
                  </span>
                  <span className="text-[8px] font-bold text-secondary/60 uppercase tracking-widest truncate">
                    • {Object.values(suite.modalities).filter(Boolean).length}{" "}
                    Modalities
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}

      {activeTab === "voices" &&
        authorVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => {
              setEditingVoice(voice);
              setEditingSuite(null);
              setEditingFragment(null);
              setIsCreating(false);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
              editingVoice?.id === voice.id
                ? "bg-secondary/10 border-secondary/30 shadow-secondary-glow/10"
                : "bg-surface-container-low/40 border-white/5 hover:border-secondary/20 hover:bg-secondary/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  editingVoice?.id === voice.id
                    ? "bg-secondary/20 border-secondary/30 scale-110"
                    : "bg-surface-container-highest border-white/5 group-hover:border-secondary/20"
                }`}
              >
                <Mic2
                  className={`w-6 h-6 ${editingVoice?.id === voice.id ? "text-secondary" : "text-on-surface-variant/40"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`text-xs font-black tracking-tight truncate uppercase ${editingVoice?.id === voice.id ? "text-secondary" : "text-on-surface"}`}
                  >
                    {voice.name}
                  </h4>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-secondary/60">
                    {voice.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                    VOC: {voice.id.substring(0, 8)}
                  </span>
                  <p className="text-[8px] font-medium text-on-surface-variant/40 italic truncate max-w-[100px]">
                    {voice.narrativeStyle}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}

      {activeTab === "fragments" &&
        fragments.map((fragment) => (
          <button
            key={fragment.id}
            onClick={() => {
              setEditingFragment(fragment);
              setEditingSuite(null);
              setEditingVoice(null);
              setIsCreating(false);
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
              editingFragment?.id === fragment.id
                ? "bg-secondary/10 border-secondary/30 shadow-secondary-glow/10"
                : "bg-surface-container-low/40 border-white/5 hover:border-secondary/20 hover:bg-secondary/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  editingFragment?.id === fragment.id
                    ? "bg-secondary/20 border-secondary/30 scale-110"
                    : "bg-surface-container-highest border-white/5 group-hover:border-secondary/20"
                }`}
              >
                <PenTool
                  className={`w-6 h-6 ${editingFragment?.id === fragment.id ? "text-secondary" : "text-on-surface-variant/40"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`text-xs font-black tracking-tight truncate uppercase ${editingFragment?.id === fragment.id ? "text-secondary" : "text-on-surface"}`}
                  >
                    {fragment.name}
                  </h4>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-secondary/60">
                    {fragment.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                    DIR: {fragment.id.substring(0, 8)}
                  </span>
                  <p className="text-[8px] font-medium text-on-surface-variant/40 italic truncate max-w-[100px]">
                    {fragment.description}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
    </div>
  );

  const rightColumn = (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {(editingSuite && isModifying) ||
      (isCreating && activeTab === "suites") ? (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
          <SuiteEditor
            editingSuite={
              editingSuite || {
                id: "",
                name: "",
                modalities: {},
                lastModified: new Date().toISOString(),
              }
            }
            setEditingSuite={setEditingSuite}
            deleteVoiceSuite={deleteVoiceSuite}
            setIsSelectingVoice={setIsSelectingVoice}
            handleSaveSuite={() => {
              handleSaveSuite();
              setIsModifying(false);
            }}
            voiceDNAs={voiceDNAs}
            authorVoices={authorVoices}
          />
        </div>
      ) : editingSuite ? (
        <EntityInspector
          title={editingSuite.name}
          subtitle="Orchestration Suite"
          description="A unified set of narrative modalities designed to drive a consistent authorial perspective."
          icon={Layout}
          iconColor="text-secondary"
          tags={Object.values(editingSuite.modalities)
            .filter(Boolean)
            .map((v, i) => `Modality ${i + 1}`)}
          metadata={[
            { label: "Suite ID", value: editingSuite.id.substring(0, 12) },
            {
              label: "Active Status",
              value: editingSuite.isActive ? "Active Node" : "Inactive",
            },
            {
              label: "Revision Date",
              value: new Date(editingSuite.lastModified).toLocaleDateString(),
            },
          ]}
          onEdit={() => setIsModifying(true)}
          onDelete={() => {
            if (window.confirm("Dissolve this persona suite?")) {
              deleteVoiceSuite(editingSuite.id);
              setEditingSuite(null);
            }
          }}
          extraContent={
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(editingSuite.modalities).map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-surface-container-highest/10 border border-white/5 rounded-2xl p-4 space-y-2"
                  >
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">
                      {key}
                    </p>
                    <p className="text-xs font-bold text-secondary truncate">
                      {authorVoices.find((v) => v.id === val)?.name ||
                        "Unassigned"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      ) : (editingVoice && isModifying) ||
        (isCreating && activeTab === "voices") ? (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
          <AuthorVoiceForm
            isModal={false}
            initialData={editingVoice || undefined}
            onClose={() => {
              if (isCreating) {
                setEditingVoice(null);
                setIsCreating(false);
              } else {
                setIsModifying(false);
              }
            }}
            onSave={(v) => {
              handleSaveVoice(v);
              setIsModifying(false);
            }}
          />
        </div>
      ) : editingVoice ? (
        <EntityInspector
          title={editingVoice.name}
          subtitle={`Authorial ${editingVoice.category}`}
          description={editingVoice.narrativeStyle}
          icon={Mic2}
          iconColor="text-secondary"
          tags={[editingVoice.category]}
          metadata={[
            { label: "Voice ID", value: editingVoice.id.substring(0, 12) },
            { label: "Modality Type", value: editingVoice.category },
            { label: "Rhythmic Signature", value: editingVoice.rhythmPattern },
          ]}
          onEdit={() => setIsModifying(true)}
          onDelete={() => {
            // Delete logic if hook supports it
          }}
          extraContent={
            <div className="space-y-6">
              <div className="bg-surface-container-highest/10 border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                  <Box size={12} /> Vocabulary DNA
                </h3>
                <p className="text-sm font-sans italic opacity-80 leading-relaxed">
                  "
                  {editingVoice.vocabularyExpansion ||
                    "No expansion rules defined."}
                  "
                </p>
              </div>
            </div>
          }
        />
      ) : (editingFragment && isModifying) ||
        (isCreating && activeTab === "fragments") ? (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
          <FragmentEditor
            editingFragment={editingFragment!}
            setEditingFragment={setEditingFragment}
            deleteFragment={deleteFragment}
            handleSaveFragment={() => {
              handleSaveFragment();
              setIsModifying(false);
            }}
          />
        </div>
      ) : editingFragment ? (
        <EntityInspector
          title={editingFragment.name}
          subtitle="Mechanical Directive"
          description={editingFragment.description}
          icon={PenTool}
          iconColor="text-secondary"
          tags={[editingFragment.category, ...(editingFragment.tags || [])]}
          metadata={[
            {
              label: "Directive ID",
              value: editingFragment.id.substring(0, 12),
            },
            {
              label: "Operational Status",
              value: editingFragment.isActive ? "Active" : "Standby",
            },
          ]}
          onEdit={() => setIsModifying(true)}
          onDelete={() => {
            if (window.confirm("Delete this mechanical fragment?")) {
              deleteFragment(editingFragment.id);
              setEditingFragment(null);
            }
          }}
          extraContent={
            <div className="space-y-6">
              <div className="bg-surface-container-highest/10 border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                  <FileCode size={12} /> Directive Content
                </h3>
                <div className="font-mono text-[10px] opacity-60 bg-black/20 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
                  {editingFragment.content}
                </div>
              </div>
            </div>
          }
        />
      ) : (
        <div className="h-full flex items-center justify-center p-10">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-20 h-20 bg-surface-container-highest rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              {activeTab === "suites" ? (
                <Layout className="w-10 h-10 text-on-surface-variant/20" />
              ) : activeTab === "voices" ? (
                <Mic2 className="w-10 h-10 text-on-surface-variant/20" />
              ) : (
                <PenTool className="w-10 h-10 text-on-surface-variant/20" />
              )}
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
              {activeTab === "suites"
                ? "No Suite Selected"
                : activeTab === "voices"
                  ? "No Voice Selected"
                  : "No Fragment Selected"}
            </h3>
            <p className="text-xs text-on-surface-variant/60 leading-relaxed mb-8">
              {activeTab === "suites"
                ? "Select a suite from the sidebar or create a new one to begin orchestrating your authorial modalities."
                : activeTab === "voices"
                  ? "Create or select an author voice to define specific narrative modalities for your suites."
                  : "Create or select a prompt fragment to define reusable directives for your refinement process."}
            </p>
            <button
              onClick={
                activeTab === "suites"
                  ? handleCreateNewSuite
                  : activeTab === "voices"
                    ? handleCreateNewVoice
                    : handleCreateNewFragment
              }
              className="px-10 py-4 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-all font-label text-[9px] font-black uppercase tracking-widest shadow-secondary-glow/10"
            >
              {activeTab === "suites"
                ? "Create New Suite"
                : activeTab === "voices"
                  ? "Create New Voice"
                  : "Create New Fragment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DesktopPanelLayout
      title="Persona Architect"
      subtitle="Orchestrate your authorial modalities into a unified suite."
      icon={<Layout className="w-5 h-5 text-secondary" />}
      onClose={onClose}
      onCreate={
        activeTab === "suites"
          ? handleCreateNewSuite
          : activeTab === "voices"
            ? handleCreateNewVoice
            : handleCreateNewFragment
      }
      createLabel={
        activeTab === "suites"
          ? "New Suite"
          : activeTab === "voices"
            ? "New Voice"
            : "New Fragment"
      }
      categories={categories}
      activeCategory={activeTab}
      onCategoryChange={(id: any) => setActiveTab(id)}
      middleColumn={middleColumn}
      rightColumn={rightColumn}
      isMobile={false} // Persona is usually desktop-focused in this layout
    />
  );
}
