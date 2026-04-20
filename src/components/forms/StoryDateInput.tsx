import React, { useEffect } from 'react';
import { UseFormRegister, Control, useWatch, Controller, useFormContext } from 'react-hook-form';
import { Calendar, Hash } from 'lucide-react';
import { useLoreStore } from '../../stores/useLoreStore';
import { calculateAbsoluteDay, absoluteDayToDate } from '../../utils/calendar';

interface StoryDateInputProps {
  namePrefix?: string;
}

export const StoryDateInput: React.FC<StoryDateInputProps> = ({ namePrefix = 'storyDate' }) => {
  const { calendarConfig } = useLoreStore();
  const { control, setValue, watch } = useFormContext();
  const isTimelineEnabled = watch('isTimelineEnabled') ?? true;
  const dateValue = watch(namePrefix);
  const dayValue = watch('storyDay');

  // Sync storyDay when storyDate changes (only if custom calendar is active)
  useEffect(() => {
    if (isTimelineEnabled && calendarConfig.useCustomCalendar && dateValue) {
      const absDay = calculateAbsoluteDay(dateValue, calendarConfig);
      if (absDay !== dayValue) {
        setValue('storyDay', absDay, { shouldDirty: true });
      }
    }
  }, [isTimelineEnabled, dateValue, calendarConfig, dayValue, setValue]);

  if (!isTimelineEnabled) return null;

  if (calendarConfig.useCustomCalendar) {
    return (
      <div className="space-y-4 p-4 rounded-xl bg-surface-container-low/40 border border-white/5 shadow-inner">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Calendar className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <span className="block text-[9px] font-black uppercase tracking-wider text-secondary/60">
              Temporal Anchor
            </span>
            <span className="text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest">Calendar Positioning</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-1">
              Year
            </label>
            <Controller
              control={control}
              name={`${namePrefix}.year`}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  value={field.value === 0 && field.value !== undefined ? '0' : (field.value ?? '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-' || /^-?\d*$/.test(val)) {
                      field.onChange(val === '' || val === '-' ? 0 : parseInt(val));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all shadow-inner"
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-1">
              Month
            </label>
            <div className="relative">
              <Controller
                control={control}
                name={`${namePrefix}.month`}
                render={({ field }) => (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all appearance-none shadow-inner"
                  >
                    {calendarConfig.months.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-1">
              Day
            </label>
            <Controller
              control={control}
              name={`${namePrefix}.day`}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  value={field.value === 0 && field.value !== undefined ? '0' : (field.value ?? '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*$/.test(val)) {
                      field.onChange(val === '' ? 0 : parseInt(val));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all shadow-inner"
                />
              )}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-1 rounded-full bg-secondary/40" />
          <p className="text-[9px] text-on-surface-variant/40 italic font-serif">
            Absolute Day: {dayValue}
          </p>
        </div>
      </div>
    );
  }

  // Fallback to Story Day if no custom calendar
  return (
    <div className="space-y-4 p-4 rounded-xl bg-surface-container-low/40 border border-white/5 shadow-inner">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Hash className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="block text-[9px] font-black uppercase tracking-wider text-primary/60">
            Story Timeline
          </span>
          <span className="text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest">Absolute Day Offset</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-1">
          Absolute Day
        </label>
        <Controller
          control={control}
          name="storyDay"
          render={({ field }) => (
            <input
              type="text"
              inputMode="numeric"
              value={field.value === 0 && field.value !== undefined ? '0' : (field.value ?? '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*$/.test(val)) {
                  const num = val === '' ? 0 : parseInt(val);
                  field.onChange(num);
                  // Sync storyDate automatically
                  const newDate = absoluteDayToDate(num, calendarConfig);
                  setValue(namePrefix, newDate, { shouldDirty: true });
                }
              }}
              placeholder="e.g. 42"
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner"
            />
          )}
        />
      </div>
      
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-1 rounded-full bg-primary/40" />
        <p className="text-[9px] text-on-surface-variant/40 italic font-serif">
          No custom calendar active. Using linear day count.
        </p>
      </div>
    </div>
  );
};
