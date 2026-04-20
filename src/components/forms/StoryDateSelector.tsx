import React from 'react';
import { Calendar } from 'lucide-react';
import { useLoreStore } from '../../stores/useLoreStore';
import { StoryDate } from '../../types';

interface StoryDateSelectorProps {
  value: StoryDate | undefined;
  onChange: (date: StoryDate) => void;
  className?: string;
}

export const StoryDateSelector: React.FC<StoryDateSelectorProps> = ({ value, onChange, className = '' }) => {
  const { calendarConfig } = useLoreStore();
  
  const date = value || { year: 0, month: 0, day: 1 };

  const handleUpdate = (updates: Partial<StoryDate>) => {
    onChange({ ...date, ...updates });
  };

  const handleYearChange = (val: string) => {
    if (val === '' || val === '-' || /^-?\d*$/.test(val)) {
      handleUpdate({ year: val === '' || val === '-' ? 0 : parseInt(val) });
    }
  };

  const handleDayChange = (val: string) => {
    if (val === '' || /^\d*$/.test(val)) {
      handleUpdate({ day: val === '' ? 0 : parseInt(val) });
    }
  };

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-lg bg-black/20 border border-white/5 shadow-inner ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-3 h-3 text-primary/60" />
        <span className="text-[9px] font-black uppercase tracking-wider text-primary/40">Temporal Anchor</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30 ml-1">Year</span>
          <input
            type="text"
            inputMode="numeric"
            value={date.year === 0 && date.year !== undefined ? '0' : (date.year ?? '')}
            onChange={(e) => handleYearChange(e.target.value)}
            placeholder="0"
            className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30 ml-1">Month</span>
          <select
            value={date.month}
            onChange={(e) => handleUpdate({ month: parseInt(e.target.value) || 0 })}
            className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary/50 transition-colors appearance-none"
          >
            {calendarConfig.months.map((m, idx) => (
              <option key={idx} value={idx}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30 ml-1">Day</span>
          <input
            type="text"
            inputMode="numeric"
            value={date.day === 0 && date.day !== undefined ? '0' : (date.day ?? '')}
            onChange={(e) => handleDayChange(e.target.value)}
            placeholder="1"
            className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
