import React from 'react';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { useLoading } from '../../context/LoadingContext';

interface GlobalLoadingScreenProps {
  forceVisible?: boolean;
  customMessage?: string;
}

export const GlobalLoadingScreen: React.FC<GlobalLoadingScreenProps> = ({
  forceVisible = false,
  customMessage,
}) => {
  const { isVisible, isFadingOut, loadingMessage } = useLoading();

  if (!isVisible && !forceVisible) {
    return null;
  }

  const displayMessage = customMessage || loadingMessage || 'Loading University Portal...';

  return (
    <div
      id="global-university-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading Application"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 select-none transition-all duration-350 ease-out backdrop-blur-md ${
        isFadingOut
          ? 'opacity-0 scale-98 pointer-events-none'
          : 'opacity-100 scale-100'
      } bg-slate-950/95 text-slate-100 dark:bg-slate-950/95 dark:text-slate-100`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionDuration: '350ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

      {/* Main Centered Loading Core Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
        {/* Animated University Logo Spinner Shield */}
        <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 mb-6">
          {/* Subtle Outer Glowing Track */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-ping-slow" />

          {/* Smooth Conic Progress Spinner Ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin-smooth"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="3.5"
              className="text-slate-800 dark:text-slate-800/80"
              strokeOpacity="0.4"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="url(#university-emerald-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="339.292"
              strokeDashoffset="120"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient
                id="university-emerald-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Secondary Counter-rotating Micro Orbit */}
          <div
            className="absolute inset-1 rounded-full border border-dashed border-emerald-400/30 animate-spin-reverse-slow"
            aria-hidden="true"
          />

          {/* Central Logo Container with Card Elevation */}
          <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-2xl ring-4 ring-emerald-500/30 overflow-hidden flex items-center justify-center transition-transform transform hover:scale-105">
            <img
              src={LOKBHARTI_LOGO}
              alt="Lokbharti University Official Seal"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* University Brand Header */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Lokbharti University
          </h2>
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            Gramvidyapith • Sanosara
          </p>
        </div>

        {/* Dynamic Contextual Status Message with Animated Pulse */}
        <div className="mt-5 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800/80 shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-300 font-sans tracking-wide">
            {displayMessage}
          </span>
        </div>

        {/* Subtle Minimal Progress Indicator Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full animate-indeterminate-bar" />
        </div>
      </div>
    </div>
  );
};
