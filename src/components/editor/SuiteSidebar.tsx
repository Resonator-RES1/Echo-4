import { Plus } from 'lucide-react';

export const SuiteSidebar = ({
  activeTab,
  setActiveTab,
  voiceSuites,
  authorVoices,
  fragments,
  editingSuite,
  editingVoice,
  editingFragment,
  setEditingSuite,
  setEditingVoice,
  setEditingFragment,
  setIsCreating,
  handleCreateNewSuite,
  handleCreateNewVoice,
  handleCreateNewFragment,
}: {
  activeTab: 'suites' | 'voices' | 'fragments';
  setActiveTab: (tab: 'suites' | 'voices' | 'fragments') => void;
  voiceSuites: any[];
  authorVoices: any[];
  fragments: any[];
  editingSuite: any | null;
  editingVoice: any | null;
  editingFragment: any | null;
  setEditingSuite: (suite: any | null) => void;
  setEditingVoice: (voice: any | null) => void;
  setEditingFragment: (fragment: any | null) => void;
  setIsCreating: (isCreating: boolean) => void;
  handleCreateNewSuite: () => void;
  handleCreateNewVoice: () => void;
  handleCreateNewFragment: () => void;
}) => {
  return (
    <div className="w-full lg:w-80 border-r border-white/5 flex flex-col overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex p-4 gap-2 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('suites')}
          className={`flex-1 py-2 rounded-xl text-[9px] font-label uppercase tracking-widest transition-all ${
            activeTab === 'suites' 
              ? 'bg-secondary/20 text-secondary border border-secondary/30' 
              : 'text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-white/5'
          }`}
        >
          Suites
        </button>
        <button 
          onClick={() => setActiveTab('voices')}
          className={`flex-1 py-2 rounded-xl text-[9px] font-label uppercase tracking-widest transition-all ${
            activeTab === 'voices' 
              ? 'bg-secondary/20 text-secondary border border-secondary/30' 
              : 'text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-white/5'
          }`}
        >
          Voices
        </button>
        <button 
          onClick={() => setActiveTab('fragments')}
          className={`flex-1 py-2 rounded-xl text-[9px] font-label uppercase tracking-widest transition-all ${
            activeTab === 'fragments' 
              ? 'bg-secondary/20 text-secondary border border-secondary/30' 
              : 'text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-white/5'
          }`}
        >
          Fragments
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {activeTab === 'suites' ? (
          <>
            <h3 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40">Your Suites</h3>
            <div className="space-y-3">
              {voiceSuites.map(suite => (
                <div 
                  key={suite.id}
                  onClick={() => {
                    setEditingSuite(suite);
                    setEditingVoice(null);
                    setEditingFragment(null);
                    setIsCreating(false);
                  }}
                  className={`p-5 rounded-lg border transition-all cursor-pointer group relative overflow-hidden ${
                    editingSuite?.id === suite.id 
                      ? 'bg-secondary/10 border-secondary/30' 
                      : 'bg-surface-container-low/20 border-white/5 hover:border-secondary/20 hover:bg-secondary/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline font-bold text-on-surface group-hover:text-secondary transition-colors">
                      {suite.name}
                    </h4>
                    {suite.isActive && (
                      <div className="w-2 h-2 rounded-full bg-secondary shadow-secondary-glow" />
                    )}
                  </div>
                  <p className="text-[9px] text-on-surface-variant/40 line-clamp-1">
                    {Object.values(suite.modalities).filter(Boolean).length} Modalities Active
                  </p>
                </div>
              ))}
            </div>
            <button 
              onClick={handleCreateNewSuite}
              className="w-full py-4 rounded-lg bg-surface-container-highest text-secondary border border-secondary/20 hover:bg-secondary/10 transition-all flex items-center justify-center gap-3 font-label text-[9px] uppercase tracking-widest shrink-0 font-black shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Persona Suite
            </button>
          </>
        ) : activeTab === 'voices' ? (
          <>
            <h3 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40">Author Voices</h3>
            <div className="space-y-3">
              {authorVoices.map(voice => (
                <div 
                  key={voice.id}
                  onClick={() => {
                    setEditingVoice(voice);
                    setEditingSuite(null);
                    setEditingFragment(null);
                    setIsCreating(false);
                  }}
                  className={`p-5 rounded-lg border transition-all cursor-pointer group relative overflow-hidden ${
                    editingVoice?.id === voice.id 
                      ? 'bg-secondary/10 border-secondary/30' 
                      : 'bg-surface-container-low/20 border-white/5 hover:border-secondary/20 hover:bg-secondary/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline font-bold text-on-surface group-hover:text-secondary transition-colors">
                      {voice.name}
                    </h4>
                    <span className="text-[8px] font-label uppercase tracking-widest text-secondary/60">
                      {voice.category}
                    </span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant/40 line-clamp-2 italic">
                    {voice.narrativeStyle}
                  </p>
                </div>
              ))}
            </div>
            <button 
              onClick={handleCreateNewVoice}
              className="w-full py-4 rounded-lg bg-surface-container-highest text-secondary border border-secondary/20 hover:bg-secondary/10 transition-all flex items-center justify-center gap-3 font-label text-[9px] uppercase tracking-widest shrink-0 font-black shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Author Voice
            </button>
          </>
        ) : (
          <>
            <h3 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40">Prompt Fragments</h3>
            <div className="space-y-3">
              {fragments.map(fragment => (
                <div 
                  key={fragment.id}
                  onClick={() => {
                    setEditingFragment(fragment);
                    setEditingSuite(null);
                    setEditingVoice(null);
                    setIsCreating(false);
                  }}
                  className={`p-5 rounded-lg border transition-all cursor-pointer group relative overflow-hidden ${
                    editingFragment?.id === fragment.id 
                      ? 'bg-secondary/10 border-secondary/30' 
                      : 'bg-surface-container-low/20 border-white/5 hover:border-secondary/20 hover:bg-secondary/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline font-bold text-on-surface group-hover:text-secondary transition-colors">
                      {fragment.name}
                    </h4>
                    <span className="text-[8px] font-label uppercase tracking-widest text-secondary/60">
                      {fragment.category}
                    </span>
                  </div>
                  <p className="text-[9px] text-on-surface-variant/40 line-clamp-2 italic">
                    {fragment.description}
                  </p>
                </div>
              ))}
            </div>
            <button 
              onClick={handleCreateNewFragment}
              className="w-full py-4 rounded-lg bg-surface-container-highest text-secondary border border-secondary/20 hover:bg-secondary/10 transition-all flex items-center justify-center gap-3 font-label text-[9px] uppercase tracking-widest shrink-0 font-black shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Fragment
            </button>
          </>
        )}
      </div>
    </div>
  );
};
