import React, { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useProjectStore } from '../stores/useProjectStore';
import { Theme } from '../types';

export const ThemeManager: React.FC = () => {
  const { currentTheme, setTheme, showTextures, setShowTextures } = useProjectStore();

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-label font-bold text-on-surface">Atmospheric Textures</span>
        </div>
        <button
          onClick={() => setShowTextures(!showTextures)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            showTextures ? 'bg-primary' : 'bg-surface-container-highest'
          }`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-on-primary-fixed transition-transform ${
            showTextures ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ethereal Card */}
        <button
          onClick={() => handleThemeChange('ethereal')}
          className={`relative group overflow-hidden rounded-lg transition-all duration-300 text-left ${
            currentTheme === 'ethereal' 
              ? 'bg-surface-container-high' 
              : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Ethereal</span>
              {currentTheme === 'ethereal' && (
                <div className="bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#080a0f] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#a78bfa] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#252b3d] shadow-lg" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Cosmic void and soft lavender. Ethereal and expansive.
            </p>
          </div>
        </button>

        {/* Midnight Card */}
        <button
          onClick={() => handleThemeChange('midnight')}
          className={`relative group overflow-hidden rounded-lg transition-all duration-300 text-left ${
            currentTheme === 'midnight' 
              ? 'bg-surface-container-high' 
              : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Midnight</span>
              {currentTheme === 'midnight' && (
                <div className="bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#020617] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#818cf8] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#475569] shadow-lg" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Deep slate and indigo. Professional and focused.
            </p>
          </div>
        </button>

        {/* Parchment Card */}
        <button
          onClick={() => handleThemeChange('parchment')}
          className={`relative group overflow-hidden rounded-lg transition-all duration-300 text-left ${
            currentTheme === 'parchment' 
              ? 'bg-[#e6d5b8]' 
              : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Parchment</span>
              {currentTheme === 'parchment' && (
                <div className="bg-[#85664d] text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#fdf6e3] shadow-sm" />
              <div className="w-12 h-12 rounded-lg bg-[#85664d] shadow-sm" />
              <div className="w-12 h-12 rounded-lg bg-[#bdae93] shadow-sm" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Warm cream and rich brown. Traditional and scholarly.
            </p>
          </div>
        </button>

        {/* Obsidian Card */}
        <button
          onClick={() => handleThemeChange('obsidian')}
          className={`relative group overflow-hidden rounded-lg transition-all duration-300 text-left ${
            currentTheme === 'obsidian' 
              ? 'bg-surface-container-high' 
              : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Obsidian</span>
              {currentTheme === 'obsidian' && (
                <div className="bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#000000] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#e5e5e5] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#404040] shadow-lg" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Pure black and stark silver. Brutalist and sharp.
            </p>
          </div>
        </button>

        {/* Forest Card */}
        <button
          onClick={() => handleThemeChange('forest')}
          className={`relative group overflow-hidden rounded-lg transition-all duration-300 text-left ${
            currentTheme === 'forest' 
              ? 'bg-surface-container-high' 
              : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Forest</span>
              {currentTheme === 'forest' && (
                <div className="bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#022c22] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#10b981] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#059669] shadow-lg" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Deep emerald and lush green. Organic and calming.
            </p>
          </div>
        </button>

        {/* Crimson Card */}
        <button
          onClick={() => handleThemeChange('crimson')}
          className={`relative group overflow-hidden rounded-lg transition-all duration-300 text-left ${
            currentTheme === 'crimson' 
              ? 'bg-surface-container-high' 
              : 'bg-surface-container-low hover:bg-surface-container'
          }`}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label font-bold text-on-surface">Crimson</span>
              {currentTheme === 'crimson' && (
                <div className="bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Preview */}
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg bg-[#2c0606] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#e11d48] shadow-lg" />
              <div className="w-12 h-12 rounded-lg bg-[#be123c] shadow-lg" />
            </div>
            
            <p className="text-xs text-on-surface-variant">
              Royal burgundy and rose. Dramatic and intense.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
