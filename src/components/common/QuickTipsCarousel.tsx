import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileCheck2,
  BellRing,
  Clock,
  CreditCard,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  X,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { UserRole } from '../../types';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';

interface QuickTip {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  bgGradient: string;
  targetTab?: string;
  actionText?: string;
}

interface QuickTipsCarouselProps {
  role: UserRole;
  onSelectTab: (tab: string) => void;
}

const STUDENT_TIPS: QuickTip[] = [
  {
    id: 'att_tip',
    title: 'Maintain 75%+ Attendance with Real-Time Tracking',
    category: 'Smart Attendance',
    description: 'Check daily period-wise attendance, submit online leave applications with medical receipts, and avoid exam debarment alerts.',
    badge: 'Essential',
    icon: UserCheck,
    bgGradient: 'from-emerald-900/90 via-slate-900 to-teal-950 border-emerald-500/30 text-emerald-300',
    targetTab: 'attendance',
    actionText: 'View My Attendance',
  },
  {
    id: 'asg_tip',
    title: 'Submit Assignments Before the 24-Hour Post-Due Cutoff',
    category: 'Coursework & Submissions',
    description: 'Upload PDF, Word, or PPT solutions directly from your device. Receive instant teacher grades and qualitative evaluation feedback.',
    badge: 'Assignments',
    icon: FileCheck2,
    bgGradient: 'from-blue-900/90 via-slate-900 to-indigo-950 border-blue-500/30 text-blue-300',
    targetTab: 'assignments',
    actionText: 'Open Assignments',
  },
  {
    id: 'tt_tip',
    title: 'Daily Class Schedule & Lab Timetable Matrix',
    category: 'Academic Timetable',
    description: 'Track daily class timings from 08:30 AM to 06:00 PM, including theory, practical field work, library hours, and sports periods.',
    badge: 'Schedule',
    icon: Clock,
    bgGradient: 'from-purple-900/90 via-slate-900 to-slate-950 border-purple-500/30 text-purple-300',
    targetTab: 'timetable',
    actionText: 'Check Timetable',
  },
  {
    id: 'id_tip',
    title: 'Digital University ID Card & Campus Gate Pass',
    category: 'Digital Identity',
    description: 'Access your QR-coded student ID card with photo verification for campus gate entry, library book issue, and canteen payments.',
    badge: 'Smart Pass',
    icon: CreditCard,
    bgGradient: 'from-amber-900/90 via-slate-900 to-orange-950 border-amber-500/30 text-amber-300',
    targetTab: 'id_card',
    actionText: 'View Digital ID',
  },
  {
    id: 'notices_tip',
    title: 'Official Campus Circulars & Instant Notices',
    category: 'University Bulletins',
    description: 'Stay updated on scholarship deadlines, semester exam dates, festival events, and urgent administrative announcements.',
    badge: 'Announcements',
    icon: BellRing,
    bgGradient: 'from-rose-900/90 via-slate-900 to-slate-950 border-rose-500/30 text-rose-300',
    targetTab: 'notices',
    actionText: 'Browse Notice Board',
  },
];

const TEACHER_TIPS: QuickTip[] = [
  {
    id: 't_att',
    title: 'Take Daily Class Attendance in Seconds',
    category: 'Smart Attendance',
    description: 'Mark students Present/Absent with one-click bulk toggles, review medical leave requests, and track semester attendance trends.',
    badge: 'Faculty Tool',
    icon: UserCheck,
    bgGradient: 'from-indigo-900/90 via-slate-900 to-blue-950 border-indigo-500/30 text-indigo-300',
    targetTab: 'attendance',
    actionText: 'Mark Attendance',
  },
  {
    id: 't_asg',
    title: 'Create Assignments & Export Student Submissions to CSV',
    category: 'Evaluation & Grading',
    description: 'Publish assignments with deadline constraints, grade uploaded student files, and export full class submission records to CSV.',
    badge: 'Assignments',
    icon: FileCheck2,
    bgGradient: 'from-emerald-900/90 via-slate-900 to-slate-950 border-emerald-500/30 text-emerald-300',
    targetTab: 'assignments',
    actionText: 'Manage Assignments',
  },
  {
    id: 't_notices',
    title: 'Save Drafts & Publish Departmental Notices',
    category: 'Announcements',
    description: 'Draft circulars and save them for later review, or broadcast instant announcements to specific classes and departments.',
    badge: 'Notices',
    icon: BellRing,
    bgGradient: 'from-amber-900/90 via-slate-900 to-rose-950 border-amber-500/30 text-amber-300',
    targetTab: 'notices',
    actionText: 'Open Notices',
  },
  {
    id: 't_tt',
    title: 'Faculty Teaching Schedule & Class Matrix',
    category: 'Academic Schedule',
    description: 'View your weekly assigned theory and practical slots across all academic semesters with hall/lab room assignments.',
    badge: 'Timetable',
    icon: Clock,
    bgGradient: 'from-purple-900/90 via-slate-900 to-slate-950 border-purple-500/30 text-purple-300',
    targetTab: 'timetable',
    actionText: 'View Schedule',
  },
];

const ADMIN_HOD_TIPS: QuickTip[] = [
  {
    id: 'a_analytics',
    title: 'Central Departmental & Student Performance Analytics',
    category: 'Executive Overview',
    description: 'Monitor aggregate student attendance, faculty schedules, course completion metrics, and low-attendance warnings in real-time.',
    badge: 'Leadership',
    icon: GraduationCap,
    bgGradient: 'from-purple-900/90 via-slate-900 to-indigo-950 border-purple-500/30 text-purple-300',
    targetTab: 'dashboard',
    actionText: 'View Dashboard',
  },
  {
    id: 'a_notices',
    title: 'Campus-Wide Broadcasts with Draft Management',
    category: 'Central Notice Board',
    description: 'Create pinned announcements with priority badges, save drafts across sessions, and broadcast circulars to all university departments.',
    badge: 'Broadcast',
    icon: BellRing,
    bgGradient: 'from-rose-900/90 via-slate-900 to-amber-950 border-rose-500/30 text-rose-300',
    targetTab: 'notices',
    actionText: 'Manage Notices',
  },
  {
    id: 'a_csv',
    title: 'Batch Export Assignment Submissions & Grade Reports',
    category: 'Data Management',
    description: 'Download comprehensive CSV reports of all submitted assignments, marks awarded, and evaluation statuses for accreditation records.',
    badge: 'Data Export',
    icon: FileCheck2,
    bgGradient: 'from-emerald-900/90 via-slate-900 to-slate-950 border-emerald-500/30 text-emerald-300',
    targetTab: 'assignments',
    actionText: 'Export Submissions',
  },
  {
    id: 'a_dir',
    title: 'Central University Directory & Faculty Roster',
    category: 'Staff & Students',
    description: 'Quickly look up contact details, academic credentials, and department assignments for all university personnel and students.',
    badge: 'Directory',
    icon: BookOpen,
    bgGradient: 'from-blue-900/90 via-slate-900 to-cyan-950 border-blue-500/30 text-blue-300',
    targetTab: 'directory',
    actionText: 'Open Directory',
  },
];

export const QuickTipsCarousel: React.FC<QuickTipsCarouselProps> = ({ role, onSelectTab }) => {
  const tips = role === 'student' ? STUDENT_TIPS : role === 'teacher' ? TEACHER_TIPS : ADMIN_HOD_TIPS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return safeStorageGet<boolean>(`lbu_quicktips_collapsed_${role}`, false);
  });

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    safeStorageSet(`lbu_quicktips_collapsed_${role}`, nextState);
  };

  const activeTip = tips[currentIndex];
  const IconComponent = activeTip.icon;

  if (isCollapsed) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs transition-all">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span><strong>Quick Tips & Feature Guide</strong> ({tips.length} tips available for your role)</span>
        </div>
        <button
          onClick={toggleCollapse}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          Show Tips
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border shadow-lg bg-gradient-to-r ${activeTip.bgGradient} p-5 sm:p-6 text-white transition-all duration-300`}>
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              Get Started Guide
            </span>
            <span className="text-[11px] text-white/70 font-semibold hidden sm:inline">
              Tip {currentIndex + 1} of {tips.length} • {activeTip.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Slide Navigation Buttons */}
            <button
              onClick={prevTip}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 cursor-pointer"
              title="Previous Tip"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTip}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 cursor-pointer"
              title="Next Tip"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/15 ml-1 cursor-pointer"
              title="Minimize Quick Tips"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tip Content Body */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-xs">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  {activeTip.title}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white/90">
                  {activeTip.badge}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed max-w-2xl">
                {activeTip.description}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          {activeTip.targetTab && (
            <button
              onClick={() => onSelectTab(activeTip.targetTab!)}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-white/90 text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer self-start sm:self-center"
            >
              <span>{activeTip.actionText || 'Take Me There'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5 mt-4 pt-2">
          {tips.map((tip, idx) => (
            <button
              key={tip.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              title={`Jump to ${tip.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
