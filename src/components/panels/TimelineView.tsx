import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  BookOpen,
  Users,
  PenTool,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Map as MapIcon,
  ArrowLeft,
  Layout,
  Zap,
  Target,
  Plus,
  GitBranch,
  CalendarDays,
  History,
  Info,
  Activity,
} from "lucide-react";
import { useTimelineData } from "../../hooks/useTimelineData";
import { useManuscriptStore } from "../../stores/useManuscriptStore";
import { useTimelineStore } from "../../stores/useTimelineStore";
import { TimelineNode, Screen } from "../../types";
import { formatStoryDate, absoluteDayToDate } from "../../utils/calendar";
import { useNavigate } from "react-router-dom";
import { LoreScreen } from "./LoreView";
import { CharacterVoicesScreen } from "./CharacterVoicesView";
import SuiteBuilderView from "./SuiteBuilderView";
import { DesktopPanelLayout } from "../ui/DesktopPanelLayout";
import { TimelineEventForm } from "../forms/TimelineEventForm";
import { CharacterArcForm } from "../forms/CharacterArcForm";
import { EntityInspector } from "../ui/EntityInspector";
import { EmptyState } from "../ui/EmptyState";

interface TimelineViewProps {
  setActiveHUD: (hud: Screen) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ setActiveHUD }) => {
  const { timelineNodes, timelessNodes, calendarConfig } = useTimelineData();
  const {
    arcs,
    events,
    fetchTimelineData,
    deleteTimelineEvent,
    deleteCharacterArc,
  } = useTimelineStore();
  const { setCurrentSceneId } = useManuscriptStore();
  const [activeTab, setActiveTab] = useState<
    "spine" | "timeless" | "arcs" | "auditor"
  >("spine");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedArcId, setSelectedArcId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [localHUD, setLocalHUD] = useState<Screen>(null);
  const [isModifying, setIsModifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

  const activeArc = useMemo(
    () => arcs.find((a) => a.id === selectedArcId),
    [arcs, selectedArcId],
  );
  const activeEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId],
  );

  // Group nodes by absoluteDay for the vertical spine
  const groupedNodes = useMemo(() => {
    const groups = new Map<number, TimelineNode[]>();
    timelineNodes.forEach((node) => {
      if (!groups.has(node.absoluteDay)) {
        groups.set(node.absoluteDay, []);
      }
      groups.get(node.absoluteDay)!.push(node);
    });
    return Array.from(groups.entries()).sort(([dayA], [dayB]) => dayA - dayB);
  }, [timelineNodes]);

  const categories = [
    { id: "spine", label: "Spine", icon: Clock },
    { id: "timeless", label: "Timeless", icon: Sparkles },
    { id: "arcs", label: "Arcs", icon: GitBranch },
    { id: "auditor", label: "Auditor", icon: Zap },
  ];

  const getNodeIcon = (type: TimelineNode["type"]) => {
    switch (type) {
      case "scene":
        return <BookOpen size={14} />;
      case "lore":
        return <MapIcon size={14} />;
      case "voice":
        return <Users size={14} />;
      case "authorVoice":
        return <PenTool size={14} />;
      case "event":
        return <History size={14} />;
      case "arcMilestone":
        return <Zap size={14} />;
    }
  };

  const getNodeColorClass = (
    type: TimelineNode["type"],
    isForeshadowing?: boolean,
  ) => {
    const base = isForeshadowing ? "border-dashed border-2 " : "border ";
    switch (type) {
      case "scene":
        return base + "bg-primary/10 border-primary/30 text-primary";
      case "lore":
        return base + "bg-purple-500/10 border-purple-500/30 text-purple-400";
      case "voice":
        return base + "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "authorVoice":
        return base + "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "event":
        return (
          base + "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        );
      case "arcMilestone":
        return base + "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
    }
  };

  const handleNodeClick = (node: TimelineNode) => {
    if (node.type === "scene" && node.sceneId) {
      setCurrentSceneId(node.sceneId);
      navigate("/workspace");
    } else if (node.type === "lore" && node.loreId) {
      window.dispatchEvent(
        new CustomEvent("open-lore-entry", { detail: node.loreId }),
      );
      navigate("/lore");
    } else if (node.type === "voice" && node.voiceId) {
      window.dispatchEvent(
        new CustomEvent("open-voice-profile", { detail: node.voiceId }),
      );
      navigate("/voices");
    } else if (node.type === "authorVoice" && node.authorVoiceId) {
      window.dispatchEvent(
        new CustomEvent("open-author-voice", { detail: node.authorVoiceId }),
      );
      navigate("/suite");
    } else if (node.type === "event" && node.eventId) {
      setSelectedEventId(node.eventId);
    } else if (node.type === "arcMilestone" && node.arcId) {
      setSelectedArcId(node.arcId);
    }
  };

  const middleColumn = (
    <div className="p-4 flex flex-col gap-2">
      {activeTab === "spine" &&
        groupedNodes.map(([day, nodes]) => {
          const sampleNode = nodes.find(
            (n) => n.storyDate || n.storyDay !== undefined,
          );
          const displayDate =
            sampleNode?.storyDate && calendarConfig?.useCustomCalendar
              ? formatStoryDate(sampleNode.storyDate, calendarConfig)
              : `Day ${day}`;
          const hasScene = nodes.some((n) => n.type === "scene");

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
                selectedDay === day
                  ? "bg-primary/10 border-primary/30 shadow-primary-glow/10"
                  : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-surface-container-highest/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                    selectedDay === day
                      ? "bg-primary/20 border-primary/30 scale-110"
                      : "bg-surface-container-highest border-white/5 group-hover:border-white/10"
                  }`}
                >
                  <Clock
                    size={24}
                    className={
                      selectedDay === day
                        ? "text-primary"
                        : "text-on-surface-variant/40"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-xs font-black tracking-tight truncate uppercase ${selectedDay === day ? "text-primary" : "text-on-surface"}`}
                    >
                      {displayDate}
                    </h4>
                    {hasScene && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-primary-glow" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                      EPOCH: {day.toString().padStart(4, "0")}
                    </span>
                    <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest truncate">
                      • {nodes.length} Events Recorded
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

      {activeTab === "timeless" &&
        timelessNodes.map((node) => (
          <button
            key={node.id}
            onClick={() => handleNodeClick(node)}
            className="w-full text-left p-4 rounded-2xl border border-white/5 bg-surface-container-low/40 hover:border-white/10 hover:bg-surface-container-highest/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNodeColorClass(node.type, node.isForeshadowing)}`}
              >
                {getNodeIcon(node.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black tracking-tight truncate text-on-surface group-hover:text-primary transition-colors uppercase">
                  {node.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold opacity-30 uppercase tracking-widest">
                    NODE: {node.id.substring(0, 8)}
                  </span>
                  <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">
                    • {node.type}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}

      {activeTab === "arcs" &&
        arcs.map((arc) => (
          <button
            key={arc.id}
            onClick={() => setSelectedArcId(arc.id)}
            className={`w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden ${
              selectedArcId === arc.id
                ? "bg-primary/10 border-primary/30 shadow-primary-glow/10"
                : "bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-surface-container-highest/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  selectedArcId === arc.id
                    ? "bg-primary/20 border-primary/30 scale-110"
                    : "bg-surface-container-highest border-white/5 group-hover:border-white/10"
                }`}
              >
                <GitBranch
                  className={`w-6 h-6 ${selectedArcId === arc.id ? "text-primary" : "text-on-surface-variant/40"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={`text-xs font-black tracking-tight truncate uppercase ${selectedArcId === arc.id ? "text-primary" : "text-on-surface"}`}
                  >
                    {arc.title}
                  </h4>
                  <div className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[8px] font-black tracking-widest uppercase opacity-60">
                    {arc.milestones.length}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold text-on-surface-variant/40 uppercase tracking-widest whitespace-nowrap">
                    ARC: {arc.id.substring(0, 8)}
                  </span>
                  <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest truncate">
                    • {arc.voiceId}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}

      {activeTab === "auditor" && (
        <div className="p-10 text-center opacity-20">
          <Activity size={48} className="mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Pacing Auditor Active
          </p>
        </div>
      )}
    </div>
  );

  const rightColumn = (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {isCreating || isModifying ? (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
          {activeTab === "arcs" || (activeArc && isModifying) ? (
            <CharacterArcForm
              arc={activeArc}
              onClose={() => {
                if (isCreating) setIsCreating(false);
                else setIsModifying(false);
              }}
              showToast={(m) =>
                window.dispatchEvent(new CustomEvent("toast", { detail: m }))
              }
            />
          ) : (
            <TimelineEventForm
              event={activeEvent}
              onClose={() => {
                if (isCreating) setIsCreating(false);
                else setIsModifying(false);
              }}
              showToast={(m) =>
                window.dispatchEvent(new CustomEvent("toast", { detail: m }))
              }
            />
          )}
        </div>
      ) : activeTab === "spine" && selectedDay !== null ? (
        <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-12">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-white/5 shadow-inner flex-shrink-0 text-primary">
              <Clock size={32} />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                Chronological Snapshot
              </span>
              <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight leading-tight">
                {calendarConfig?.useCustomCalendar
                  ? formatStoryDate(
                      absoluteDayToDate(selectedDay, calendarConfig),
                      calendarConfig,
                    )
                  : `Day ${selectedDay}`}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedNodes
              .find(([day]) => day === selectedDay)?.[1]
              .map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleNodeClick(node)}
                  className={`p-6 rounded-3xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl border ${getNodeColorClass(node.type, node.isForeshadowing)}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/10">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                      {node.type}
                    </span>
                  </div>
                  <h4 className="text-xl font-headline font-bold mb-2 uppercase">
                    {node.title}
                  </h4>
                  {node.description && (
                    <p className="text-sm opacity-70 leading-relaxed font-sans font-light line-clamp-3 italic">
                      "{node.description}"
                    </p>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      ) : activeTab === "arcs" && activeArc ? (
        <EntityInspector
          title={activeArc.title}
          subtitle={`Character Growth Pattern: ${activeArc.voiceId}`}
          description={activeArc.currentGoal}
          icon={GitBranch}
          tags={["Character Arc", activeArc.voiceId]}
          metadata={[
            { label: "Milestones", value: activeArc.milestones.length },
            { label: "Sync State", value: "Authoritative" },
            { label: "Impact Factor", value: "High" },
          ]}
          onEdit={() => setIsModifying(true)}
          onDelete={() => {
            if (
              window.confirm(
                "Delete this character arc and all its milestones?",
              )
            ) {
              deleteCharacterArc(activeArc.id);
              setSelectedArcId(null);
            }
          }}
          extraContent={
            <div className="relative pl-10 space-y-12 py-6">
              <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/5" />
              {activeArc.milestones.map((m, idx) => (
                <div key={m.id} className="relative group">
                  <div className="absolute -left-[27px] top-2 w-4 h-4 rounded-full bg-surface-container border-2 border-primary shadow-primary-glow group-hover:scale-125 transition-all" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                        Day {m.absoluteDay}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest border border-primary/20">
                        {m.arcStatus}
                      </span>
                    </div>
                    <h4 className="text-2xl font-headline font-bold text-on-surface uppercase tracking-tight">
                      {m.title}
                    </h4>
                    <div className="flex flex-wrap gap-4 text-[10px] font-mono text-on-surface-variant/40">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-secondary" />
                        <span>EMOTIONAL_DNA: {m.emotionalState}</span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface/70 leading-relaxed max-w-2xl font-sans italic">
                      "{m.description}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          }
        />
      ) : (
        <div className="h-full flex items-center justify-center p-10">
          <EmptyState
            icon={Clock}
            title="Temporal Orchestration"
            description={
              activeTab === "arcs"
                ? "Track the complex growth cycles of your cast across time."
                : "Navigate the unified temporal spine to audit events, scenes, and lore intersections."
            }
          />
        </div>
      )}
    </div>
  );

  const handleCreate = () => {
    setIsCreating(true);
  };

  return (
    <div className="h-full w-full relative">
      <DesktopPanelLayout
        title="Chronos Loom"
        subtitle="The unified temporal spine. Map scenes against worldbuilding."
        icon={<Clock className="w-5 h-5 text-primary" />}
        onClose={() => navigate("/workspace")}
        onCreate={handleCreate}
        createLabel={activeTab === "arcs" ? "New Arc" : "New Event"}
        categories={categories}
        activeCategory={activeTab}
        onCategoryChange={(id: any) => setActiveTab(id)}
        middleColumn={middleColumn}
        rightColumn={rightColumn}
        isMobile={false}
      />
    </div>
  );
};
