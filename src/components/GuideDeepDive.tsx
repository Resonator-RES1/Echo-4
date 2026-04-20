import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Copy, 
  Check, 
  ChevronRight, 
  Scroll, 
  Shield, 
  Sparkles, 
  Zap,
  Target,
  Brain
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { GUIDE_SECTIONS, ECHO_MANUAL_CONTENT } from '../constants';
import { copyFullGuideToClipboard } from '../utils/guideUtils';

export const GuideDeepDive: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredSections = GUIDE_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.categories.some(cat => 
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.items.some(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  const handleCopy = () => {
    copyFullGuideToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollPos = elementTop - containerTop + scrollContainerRef.current.scrollTop;
      
      scrollContainerRef.current.scrollTo({
        top: scrollPos - 20,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  // Simple intersection observer to update active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace('section-', ''));
          }
        });
      },
      { threshold: 0.2, root: scrollContainerRef.current }
    );

    const sections = document.querySelectorAll('[id^="section-"]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [searchQuery]);

  return (
    <div className="flex h-full bg-surface-container-low text-on-surface overflow-hidden font-body selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-72 border-r border-outline-variant/10 flex flex-col h-full bg-surface-container-high/30 z-10">
        <div className="p-4 space-y-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <Scroll className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-headline font-light tracking-tight uppercase">The Codex</h2>
          </div>
          
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/40" />
            <input 
              type="text"
              placeholder="Search the manual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-highest/30 border border-outline-variant/10 rounded-lg pl-9 pr-4 py-2 text-[9px] font-label uppercase tracking-widest focus:outline-none focus:border-primary/30 transition-colors"
            />
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-on-primary rounded-xl text-[9px] font-black hover:opacity-90 transition-opacity uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Full Codex'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-wider text-primary/60 mb-4 px-2">Focus Areas</h3>
            <ul className="space-y-1">
              {filteredSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                      activeSection === section.id 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'text-on-surface-variant hover:bg-surface-container-highest/50'
                    }`}
                  >
                    <ChevronRight className={`w-3 h-3 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[9px] font-black uppercase tracking-wider text-primary/60 mb-4 px-2">The Manual</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => scrollToSection('manual')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                    activeSection === 'manual' 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-on-surface-variant hover:bg-surface-container-highest/50'
                  }`}
                >
                  <ChevronRight className={`w-3 h-3 transition-transform ${activeSection === 'manual' ? 'rotate-90' : ''}`} />
                  Technical Specs
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Content Area */}
      <main 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth bg-surface-container-low relative"
      >
        <div className="max-w-3xl mx-auto space-y-24 pb-32 relative z-10">
          {/* Introduction */}
          <section id="section-introduction" className="space-y-6">
            <h1 className="text-5xl font-headline font-light tracking-tighter border-b border-outline-variant/20 pb-4">
              The Architect's Codex
            </h1>
            <p className="text-xl font-headline leading-relaxed opacity-80 italic text-on-surface-variant">
              "Reveal the author—clearly, faithfully, and without distortion."
            </p>
            <div className="h-1 w-24 bg-primary/30 rounded-full" />
            <p className="text-lg leading-relaxed text-on-surface-variant">
              This document serves as the definitive guide to Echo's internal logic, philosophy, and technical boundaries. 
              It is designed for writers who seek to master the system, not just use it.
            </p>
          </section>

          {/* Focus Areas */}
          {filteredSections.map((section) => {
            const IconComponent = (Icons as any)[section.icon] || Sparkles;
            return (
              <section key={section.id} id={`section-${section.id}`} className="space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-headline font-light tracking-tight">{section.title}</h2>
                  </div>
                  <p className="text-lg text-on-surface-variant border-l-4 border-primary/20 pl-6 italic leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="space-y-16">
                  {section.categories.map((category, catIdx) => (
                    <div key={catIdx} className="space-y-8">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-primary/40 border-b border-outline-variant/10 pb-2">
                        {category.title}
                      </h3>
                      
                      <div className="space-y-16">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="grid grid-cols-1 gap-5">
                            <div className="space-y-6">
                              <h4 className="text-2xl font-headline font-light">{item.title}</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-primary/60">
                                    <Brain className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">The Theory</span>
                                  </div>
                                  <p className="text-sm leading-relaxed text-on-surface-variant">
                                    {item.description}
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-primary/60">
                                    <Target className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">The Logic</span>
                                  </div>
                                  <p className="text-sm leading-relaxed text-on-surface-variant italic">
                                    {item.proTips?.[0] || "Echo prioritizes structural integrity over stylistic flair, ensuring the core intent remains visible."}
                                  </p>
                                </div>
                              </div>

                              {item.example && (
                                <div className="space-y-4 bg-surface-container-highest/10 p-4 rounded-xl border border-outline-variant/10">
                                  <div className="flex items-center gap-2 text-primary/60 mb-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">The Example</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-tighter text-on-surface-variant/40">Original Draft</span>
                                      <p className="text-xs italic text-on-surface-variant/70 leading-relaxed">"{item.example.before}"</p>
                                    </div>
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black uppercase tracking-tighter text-primary/40">Echo Audited</span>
                                      <p className="text-xs font-medium text-on-surface leading-relaxed">"{item.example.after}"</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.proTips && item.proTips.length > 1 && (
                                <div className="flex items-start gap-4 p-5 rounded-lg bg-primary/5 border border-primary/10">
                                  <Zap className="w-5 h-5 text-primary shrink-0 mt-1" />
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">The Pro-Tip</span>
                                    <p className="text-sm font-medium italic text-on-surface">
                                      {item.proTips[1]}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* The Manual */}
          <section id="section-manual" className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-headline font-light tracking-tight">The Manual</h2>
              </div>
              <p className="text-lg text-on-surface-variant border-l-4 border-primary/20 pl-6 italic leading-relaxed">
                Technical boundaries and the philosophy of restraint.
              </p>
            </div>

            <div className="space-y-8">
              {ECHO_MANUAL_CONTENT.map((manual, idx) => (
                <div key={idx} className="p-5 border border-outline-variant/10 rounded-xl space-y-6 bg-surface-container-highest/5">
                  <h3 className="text-2xl font-headline font-light border-b border-outline-variant/10 pb-2">
                    {manual.feature}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Philosophy</span>
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        {manual.philosophy}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-accent-rose/60">Technical Constraints</span>
                      <p className="text-sm leading-relaxed italic text-on-surface-variant/80">
                        {manual.technicalConstraints}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-24 pb-12 text-center space-y-4 border-t border-outline-variant/10">
            <Scroll className="w-8 h-8 mx-auto text-primary/20" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/30">
              End of Codex • Version 1.0.4
            </p>
          </footer>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(208, 192, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(208, 192, 255, 0.4);
        }
      `}} />
    </div>
  );
};
