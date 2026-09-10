import React, { useEffect, useState } from 'react';
import { BellRing, Check, ExternalLink, X, Sparkles, Building2, AlertTriangle, Briefcase, GraduationCap, BookOpen, Award, Calendar, Home, CreditCard, Megaphone, HelpCircle } from 'lucide-react';
import { Notice } from '../../types';

export interface ToastItem {
  id: string;
  notice: Notice;
  timestamp?: string;
}

interface NoticeToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onViewNotice: (notice: Notice) => void;
  onMarkAsRead?: (noticeId: string) => void;
}

export const NoticeToastContainer: React.FC<NoticeToastContainerProps> = ({
  toasts,
  onDismiss,
  onViewNotice,
  onMarkAsRead,
}) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onViewNotice={onViewNotice}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

const SingleToast: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
  onViewNotice: (notice: Notice) => void;
  onMarkAsRead?: (noticeId: string) => void;
}> = ({ toast, onDismiss, onViewNotice, onMarkAsRead }) => {
  const { notice } = toast;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const duration = 6000; // 6 seconds
    const intervalTime = 50;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPaused, toast.id, onDismiss]);

  const getCategoryTheme = () => {
    switch (notice.category) {
      case 'academic':
        return {
          bg: 'bg-blue-950/90 dark:bg-blue-950/95 border-blue-500/50',
          badge: 'bg-blue-500 text-white',
          label: 'Academic',
          icon: <BookOpen className="w-4 h-4 text-blue-400" />,
          accent: 'from-blue-500 to-indigo-600',
        };
      case 'admission':
        return {
          bg: 'bg-teal-950/90 dark:bg-teal-950/95 border-teal-500/50',
          badge: 'bg-teal-500 text-white',
          label: 'Admission',
          icon: <GraduationCap className="w-4 h-4 text-teal-400" />,
          accent: 'from-teal-400 to-emerald-500',
        };
      case 'scholarship':
        return {
          bg: 'bg-amber-950/90 dark:bg-amber-950/95 border-amber-500/50',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          label: 'Scholarship',
          icon: <Award className="w-4 h-4 text-amber-300" />,
          accent: 'from-amber-400 to-yellow-500',
        };
      case 'events':
        return {
          bg: 'bg-pink-950/90 dark:bg-pink-950/95 border-pink-500/50',
          badge: 'bg-pink-500 text-white',
          label: 'Events & Activities',
          icon: <Calendar className="w-4 h-4 text-pink-300" />,
          accent: 'from-pink-500 to-rose-500',
        };
      case 'placement':
      case 'vacancy':
        return {
          bg: 'bg-indigo-950/90 dark:bg-indigo-950/95 border-indigo-500/50',
          badge: 'bg-indigo-500 text-white font-bold',
          label: 'Placement & Career',
          icon: <Briefcase className="w-4 h-4 text-indigo-300" />,
          accent: 'from-indigo-400 to-blue-600',
        };
      case 'hostel':
        return {
          bg: 'bg-orange-950/90 dark:bg-orange-950/95 border-orange-500/50',
          badge: 'bg-orange-500 text-white',
          label: 'Hostel & Affairs',
          icon: <Home className="w-4 h-4 text-orange-300" />,
          accent: 'from-orange-400 to-amber-500',
        };
      case 'finance':
        return {
          bg: 'bg-cyan-950/90 dark:bg-cyan-950/95 border-cyan-500/50',
          badge: 'bg-cyan-500 text-slate-950 font-bold',
          label: 'Fees & Finance',
          icon: <CreditCard className="w-4 h-4 text-cyan-300" />,
          accent: 'from-cyan-400 to-teal-500',
        };
      case 'urgent':
        return {
          bg: 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/50',
          badge: 'bg-rose-500 text-white',
          label: 'Urgent Alert',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />,
          accent: 'from-rose-500 to-red-600',
        };
      case 'exam':
        return {
          bg: 'bg-purple-950/90 dark:bg-purple-950/95 border-purple-500/50',
          badge: 'bg-purple-500 text-white',
          label: 'Examination',
          icon: <GraduationCap className="w-4 h-4 text-purple-300" />,
          accent: 'from-purple-500 to-indigo-600',
        };
      case 'department':
        return {
          bg: 'bg-slate-900/95 dark:bg-slate-950/95 border-emerald-500/50',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          label: 'Department',
          icon: <Building2 className="w-4 h-4 text-emerald-400" />,
          accent: 'from-emerald-400 to-teal-500',
        };
      case 'general':
        return {
          bg: 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/50',
          badge: 'bg-rose-500 text-white',
          label: 'General / Important',
          icon: <Megaphone className="w-4 h-4 text-rose-300" />,
          accent: 'from-rose-500 to-orange-500',
        };
      default:
        return {
          bg: 'bg-slate-900/95 dark:bg-slate-950/95 border-slate-700',
          badge: 'bg-blue-500 text-white',
          label: notice.category || 'Notice',
          icon: <BellRing className="w-4 h-4 text-blue-400" />,
          accent: 'from-blue-500 to-indigo-600',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => {
        if (onMarkAsRead) onMarkAsRead(notice.id);
        onViewNotice(notice);
        onDismiss(toast.id);
      }}
      className={`pointer-events-auto rounded-2xl border ${theme.bg} backdrop-blur-xl p-4 shadow-2xl text-white transform transition-all duration-300 ease-out translate-y-0 scale-100 relative overflow-hidden group cursor-pointer hover:ring-2 hover:ring-amber-400/50`}
    >
      {/* Top Banner Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.accent}`} />

      {/* Main Toast Content */}
      <div className="flex items-start gap-3 pt-1">
        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md shrink-0 border border-white/10 shadow-inner">
          {theme.icon}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-sm animate-pulse">
              <Sparkles className="w-2.5 h-2.5" /> NEW
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${theme.badge}`}>
              {theme.label}
            </span>
            {notice.departmentName && (
              <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[140px]">
                • {notice.departmentName}
              </span>
            )}
          </div>

          <h4 className="text-xs font-extrabold text-white leading-snug line-clamp-1 group-hover:line-clamp-2 transition-all">
            {notice.title}
          </h4>

          <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2 leading-relaxed">
            {notice.content}
          </p>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10">
            <span className="text-[10px] text-slate-400 font-medium">
              By {notice.postedByName} ({notice.postedByRole})
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMarkAsRead) onMarkAsRead(notice.id);
                  onViewNotice(notice);
                  onDismiss(toast.id);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                View Notice Board <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar Timer */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className={`h-full bg-gradient-to-r ${theme.accent} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
