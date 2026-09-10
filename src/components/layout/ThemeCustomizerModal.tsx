import React from 'react';
import { Palette, X, Check, Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAccent: string;
  onChangeAccent: (accent: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  activeAccent,
  onChangeAccent,
  isDarkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  const themes = [
    { id: 'emerald', name: 'Lokbharti Emerald', color: 'bg-emerald-600', ring: 'ring-emerald-500' },
    { id: 'indigo', name: 'Royal Blue', color: 'bg-indigo-600', ring: 'ring-indigo-500' },
    { id: 'purple', name: 'Academic Purple', color: 'bg-purple-600', ring: 'ring-purple-500' },
    { id: 'orange', name: 'Sunrise Orange', color: 'bg-orange-500', ring: 'ring-orange-500' },
    { id: 'teal', name: 'Ocean Glass', color: 'bg-teal-600', ring: 'ring-teal-500' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Appearance & Custom Theme
              </h3>
              <p className="text-[11px] text-slate-500">
                Personalize your Lokbharti ERP workspace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Interface Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (isDarkMode) onToggleDarkMode();
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                !isDarkMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Theme</span>
            </button>

            <button
              onClick={() => {
                if (!isDarkMode) onToggleDarkMode();
              }}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Accent Theme Palette
          </label>
          <div className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeAccent(t.id)}
                className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                  activeAccent === t.id
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full ${t.color} shadow-sm`} />
                  <span className="text-slate-800 dark:text-slate-200">{t.name}</span>
                </div>
                {activeAccent === t.id && <Check className="w-4 h-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
        >
          Save Theme Preferences
        </button>
      </div>
    </div>
  );
};
