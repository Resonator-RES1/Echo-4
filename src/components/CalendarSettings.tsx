import React, { useState } from 'react';
import { useLoreStore } from '../stores/useLoreStore';
import { CalendarConfig, CalendarMonth } from '../types';
import { Plus, Trash2, Save, Calendar, Info, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';

export const CalendarSettings: React.FC = () => {
  const { calendarConfig, setCalendarConfig } = useLoreStore();
  const [config, setConfig] = useState<CalendarConfig>(calendarConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleCustom = (enabled: boolean) => {
    setConfig(prev => ({ ...prev, useCustomCalendar: enabled }));
  };

  const handleUpdateMonth = (index: number, updates: Partial<CalendarMonth>) => {
    const newMonths = [...config.months];
    newMonths[index] = { ...newMonths[index], ...updates };
    setConfig(prev => ({ ...prev, months: newMonths }));
  };

  const handleAddMonth = () => {
    setConfig(prev => ({
      ...prev,
      months: [...prev.months, { name: 'New Month', days: 30 }]
    }));
  };

  const handleRemoveMonth = (index: number) => {
    if (config.months.length <= 1) return;
    const newMonths = config.months.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, months: newMonths }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setCalendarConfig(config);
    } finally {
      setIsSaving(false);
    }
  };

  const totalDaysInYear = config.months.reduce((sum, m) => sum + m.days, 0);

  const presets = [
    {
      name: 'Gregorian',
      description: 'Standard 12-month Earth calendar.',
      months: [
        { name: 'January', days: 31 }, { name: 'February', days: 28 }, { name: 'March', days: 31 },
        { name: 'April', days: 30 }, { name: 'May', days: 31 }, { name: 'June', days: 30 },
        { name: 'July', days: 31 }, { name: 'August', days: 31 }, { name: 'September', days: 30 },
        { name: 'October', days: 31 }, { name: 'November', days: 30 }, { name: 'December', days: 31 }
      ]
    },
    {
      name: 'Fantasy (360)',
      description: '12 months, exactly 30 days each.',
      months: Array(12).fill(null).map((_, i) => ({ name: `Month ${i + 1}`, days: 30 }))
    },
    {
      name: 'Lunar (13)',
      description: '13 months, exactly 28 days each.',
      months: Array(13).fill(null).map((_, i) => ({ name: `Moon ${i + 1}`, days: 28 }))
    }
  ];

  const applyPreset = (presetMonths: CalendarMonth[]) => {
    setConfig(prev => ({ ...prev, months: presetMonths, useCustomCalendar: true }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Temporal Architect</h3>
          <p className="text-sm text-on-surface-variant/60">Define the unique chronological structure of your narrative world.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full border border-white/5">
          <button
            onClick={() => handleToggleCustom(false)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${!config.useCustomCalendar ? 'bg-primary text-surface shadow-lg shadow-primary/20' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
          >
            Standard
          </button>
          <button
            onClick={() => handleToggleCustom(true)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${config.useCustomCalendar ? 'bg-primary text-surface shadow-lg shadow-primary/20' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
          >
            Custom
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {config.useCustomCalendar ? (
          <motion.div
            key="custom-calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Presets Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-wider text-primary/60">Architectural Presets</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.months)}
                    className="p-4 rounded-lg bg-surface-container-low border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                  >
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface group-hover:text-primary mb-1">{preset.name}</h4>
                    <p className="text-[9px] text-on-surface-variant/40 italic leading-relaxed">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low/50 border border-white/5 rounded-xl p-5 space-y-8 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-on-surface uppercase tracking-widest">Year Structure</span>
                    <span className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest">Manual Configuration</span>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-black/20 border border-white/5 text-[9px] font-mono text-primary/60">
                  Total Days: {totalDaysInYear}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.months.map((month, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-surface-container-highest/20 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary shadow-inner">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={month.name}
                        onChange={(e) => handleUpdateMonth(idx, { name: e.target.value })}
                        className="bg-transparent border-none h-6 p-0 text-xs font-bold focus-visible:ring-0 placeholder:text-on-surface-variant/20"
                        placeholder="Month Name"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30">Days:</span>
                        <input
                          type="number"
                          value={month.days}
                          onChange={(e) => handleUpdateMonth(idx, { days: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-black/20 border border-white/5 rounded-lg px-2 py-0.5 text-[9px] text-center font-mono text-on-surface outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMonth(idx)}
                      className="p-2 text-on-surface-variant/20 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={handleAddMonth}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add Month
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[9px] text-on-surface-variant/70 leading-relaxed">
                Changing your calendar structure will update how all Lore and Voice entries are gated. Existing entries will retain their month index, which may point to new names or day counts.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-on-primary rounded-full px-8 py-2 text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                {isSaving ? 'Saving...' : 'Apply Calendar Structure'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="standard-calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-highest/30 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-on-surface-variant/20" />
            </div>
            <div className="max-w-xs space-y-2">
              <h4 className="font-bold text-on-surface/60">Using Standard Earth Calendar</h4>
              <p className="text-xs text-on-surface-variant/40">The system is currently using the Gregorian calendar (12 months, 28-31 days).</p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleToggleCustom(true)}
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-full px-6"
            >
              Switch to Custom
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
