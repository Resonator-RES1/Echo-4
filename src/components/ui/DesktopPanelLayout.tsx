import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Search, LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DesktopPanelLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClose: () => void;
  onCreate: () => void;
  createLabel: string;
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  middleColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isMobile?: boolean;
  showMiddleOnMobile?: boolean;
  showRightOnMobile?: boolean;
  onBackMobile?: () => void;
}

export const DesktopPanelLayout: React.FC<DesktopPanelLayoutProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  onCreate,
  createLabel,
  categories,
  activeCategory,
  onCategoryChange,
  middleColumn,
  rightColumn,
  searchQuery,
  onSearchChange,
  isMobile,
  showMiddleOnMobile,
  showRightOnMobile,
  onBackMobile
}) => {
  return (
    <div className="flex-1 w-full h-full bg-surface-container-lowest flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden relative">

      {/* Bioluminescent Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Main Sovereign Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="relative w-full h-full max-w-[1600px] bg-surface-container-low/80 backdrop-blur-md md:rounded-2xl border border-white/5 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Sleek Header */}
        <header className="h-16 flex-shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-surface-container-low/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-primary-glow/20">
              {icon}
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-headline font-bold text-on-surface tracking-tight leading-none">{title}</h2>
              <span className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest mt-1">{subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {onSearchChange && (
              <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search archives..." 
                  className="bg-surface-container-lowest/50 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary/30 w-64 transition-all placeholder:text-on-surface-variant/20"
                />
              </div>
            )}
            
            <button 
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-label text-[10px] uppercase tracking-widest font-bold border border-primary/20 transition-all shadow-primary-glow/10"
            >
              <Plus className="w-3.5 h-3.5" />
              {createLabel}
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-error/10 transition-all group border border-white/5"
            >
              <X className="w-4 h-4 text-on-surface-variant/40 group-hover:text-error transition-colors" />
            </button>
          </div>
        </header>

        {/* 3-Column Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Column 1: Categories (10%) */}
          <aside className="w-16 lg:w-20 flex-shrink-0 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-surface-container-lowest/30">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`group relative flex flex-col items-center gap-1 transition-all ${activeCategory === cat.id ? 'text-primary' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
                title={cat.label}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeCategory === cat.id ? 'bg-primary/10 border border-primary/20 shadow-primary-glow/10' : 'hover:bg-surface-container-highest border border-transparent'}`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap">
                  {cat.label}
                </span>
                {activeCategory === cat.id && (
                  <motion.div 
                    layoutId="activeCategoryIndicator"
                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-primary-glow"
                  />
                )}
              </button>
            ))}
          </aside>

          {/* Column 2: List (30%) */}
          <div className={`w-full md:w-[30%] flex-shrink-0 border-r border-white/5 flex flex-col min-h-0 bg-surface-container-lowest/10 ${isMobile && showRightOnMobile ? 'hidden' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {middleColumn}
            </div>
          </div>

          {/* Column 3: Details (60%) */}
          <main className={`flex-1 flex flex-col min-h-0 bg-surface-container-low/30 relative ${isMobile && !showRightOnMobile ? 'hidden' : 'flex'}`}>
            {isMobile && showRightOnMobile && onBackMobile && (
              <button 
                onClick={onBackMobile}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest/80 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20"
              >
                Back
              </button>
            )}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {rightColumn}
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
};
