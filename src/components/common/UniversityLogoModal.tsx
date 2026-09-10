import React, { useState } from 'react';
import { X, Download, Building2, CheckCircle2, Sparkles, Monitor, Smartphone, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { LOKBHARTI_LOGO } from '../../assets/logo';

interface UniversityLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversityLogoModal: React.FC<UniversityLogoModalProps> = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState<'app_icon' | 'seal'>('app_icon');

  if (!isOpen) return null;

  const handleDownloadLogo = () => {
    const link = document.createElement('a');
    link.href = LOKBHARTI_LOGO;
    link.download = 'Lokbharti_University_Official_Seal.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="university-logo-modal"
      >
        {/* Decorative Background Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Lokbharti App Icon & Official Seal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lokbharti University for Rural Innovation, Sanosara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
            id="close-logo-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs to switch between Desktop/Mobile App Icon View and Seal View */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 relative z-10">
          <button
            type="button"
            onClick={() => setViewMode('app_icon')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'app_icon'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop & Mobile App Icon</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('seal')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              viewMode === 'seal'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Official Institutional Seal</span>
          </button>
        </div>

        {/* Dynamic Display Area */}
        {viewMode === 'app_icon' ? (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-inner space-y-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Desktop & Mobile App Shortcut Preview
            </div>

            {/* Desktop Shortcut Replica Preview */}
            <div className="flex flex-col items-center group cursor-pointer p-4 rounded-2xl hover:bg-white/5 transition-colors">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-2xl ring-4 ring-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img
                  src={LOKBHARTI_LOGO}
                  alt="Lokbharti University Icon"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                {/* Desktop shortcut arrow badge */}
                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-white rounded-md shadow-md border border-slate-200 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <span className="mt-2.5 text-xs font-bold text-slate-100 tracking-wide drop-shadow text-center">
                Lokbharti<br />University
              </span>
            </div>

            <p className="text-[11px] text-slate-400 text-center max-w-sm">
              Your institutional ERP portal appears as a dedicated desktop and mobile app shortcut tile featuring the official <strong>Lokbharti University Seal</strong>.
            </p>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 ring-4 ring-emerald-500/10 shadow-inner">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white p-3 shadow-2xl border-4 border-amber-500/40 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300">
              <img
                src={LOKBHARTI_LOGO}
                alt="Lokbharti University Official Seal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Institutional Emblem & Seal</span>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Institution Name</span>
            <strong className="text-slate-800 dark:text-slate-200 text-xs mt-0.5 block">
              Lokbharti University
            </strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Campus Location</span>
            <strong className="text-slate-800 dark:text-slate-200 text-xs mt-0.5 block">
              Sanosara, Bhavnagar, Gujarat
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 relative z-10">
          <button
            onClick={handleDownloadLogo}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="download-logo-btn"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Logo</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
