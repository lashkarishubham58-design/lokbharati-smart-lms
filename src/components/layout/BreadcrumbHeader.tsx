import React, { useState } from 'react';
import {
  ChevronLeft,
  Home,
  LayoutDashboard,
  Plus,
  Search,
  UserCheck,
  FileUp,
  BellPlus,
  Calendar,
  GraduationCap,
  CreditCard,
  FolderLock,
  Sparkles,
  Command,
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';
import { getCurrentDateAndDay } from '../../utils/dateUtils';

interface BreadcrumbHeaderProps {
  activeTab: string;
  historyStack?: string[];
  canGoBack?: boolean;
  onBack?: () => void;
  onGoBack?: () => void;
  onSelectTab?: (tab: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenSearch?: () => void;
  user?: User;
}

export const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({
  activeTab,
  historyStack = [],
  canGoBack,
  onBack,
  onGoBack,
  onSelectTab,
  onNavigateTab,
  onOpenSearch = () => {},
  user,
}) => {
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const { dayName, monthName, dayNum, year } = getCurrentDateAndDay();

  const handleBack = onBack || onGoBack || (() => {});
  const handleTabSelect = onSelectTab || onNavigateTab || (() => {});
  const isBackEnabled = canGoBack ?? (historyStack.length > 1);

  // Build human readable breadcrumbs
  const getBreadcrumbItems = () => {
    const items = [{ id: 'dashboard', label: 'Dashboard' }];

    switch (activeTab) {
      case 'leave-workflow':
        items.push({ id: 'erp', label: 'University ERP' });
        items.push({ id: 'leave-workflow', label: 'Smart Leave & Outpass Workflow' });
        break;
      case 'teacher-ai-insights':
        items.push({ id: 'faculty', label: 'Faculty Portal' });
        items.push({ id: 'teacher-ai-insights', label: 'Faculty Remedial AI Analytics' });
        break;
      case 'attendance':
        items.push({ id: 'attendance', label: 'Smart Attendance' });
        if (user?.departmentName) {
          items.push({ id: 'dept', label: user.departmentName });
        }
        if (user?.semester) {
          items.push({ id: 'sem', label: `Semester ${user.semester}` });
        }
        break;
      case 'timetable':
        items.push({ id: 'academic', label: 'Academic' });
        items.push({ id: 'timetable', label: 'Timetable & Schedule' });
        break;
      case 'assignments':
        items.push({ id: 'academic', label: 'LMS' });
        items.push({ id: 'assignments', label: 'Assignments & Review' });
        break;
      case 'quiz':
        items.push({ id: 'academic', label: 'LMS' });
        items.push({ id: 'quiz', label: 'Interactive Quizzes' });
        break;
      case 'results':
        items.push({ id: 'academic', label: 'Evaluation' });
        items.push({ id: 'results', label: 'Grade & SGPA Results' });
        break;
      case 'journey':
        items.push({ id: 'profile', label: 'Profile' });
        items.push({ id: 'journey', label: 'Academic Journey Timeline' });
        break;
      case 'idcard':
        items.push({ id: 'profile', label: 'Profile' });
        items.push({ id: 'idcard', label: 'Digital University ID' });
        break;
      case 'materials':
        items.push({ id: 'academic', label: 'LMS' });
        items.push({ id: 'materials', label: 'Study Materials & Vault' });
        break;
      case 'calendar':
        items.push({ id: 'academic', label: 'Academic' });
        items.push({ id: 'calendar', label: 'Academic Calendar' });
        break;
      case 'notices':
        items.push({ id: 'notices', label: 'Notice Board & Alerts' });
        break;
      case 'messaging':
      case 'messages':
        items.push({ id: 'messages', label: 'Campus Messaging' });
        break;
      case 'reports':
        items.push({ id: 'reports', label: 'Reports & Analytics' });
        break;
      case 'downloads':
        items.push({ id: 'downloads', label: 'Download Center & Document Vault' });
        break;
      case 'architecture':
        items.push({ id: 'architecture', label: 'MySQL Schema & Security Spec' });
        break;
      case 'admin-users':
      case 'users':
        items.push({ id: 'admin-users', label: 'User & Role Management' });
        break;
      case 'admin-audit':
      case 'audit':
        items.push({ id: 'admin-audit', label: 'Audit & System Activity Logs' });
        break;
      case 'profile':
        items.push({ id: 'profile', label: 'User Digital Profile' });
        break;
      case 'settings':
        items.push({ id: 'settings', label: 'System Settings & Themes' });
        break;
      default:
        break;
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbItems();
  const currentTabItem = breadcrumbs[breadcrumbs.length - 1] || { id: 'dashboard', label: 'Dashboard' };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sticky top-16 z-30 transition-all duration-200">
      <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto w-full">
        {/* Left Navigation Buttons & Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={!isBackEnabled}
            id="nav-back-button"
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              isBackEnabled
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer active:scale-95'
                : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            title="Go to previous screen (Alt + Left)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back</span>
          </button>

          {/* Home Button */}
          <button
            onClick={() => handleTabSelect('dashboard')}
            id="nav-home-button"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
            title="Go to Home / Dashboard"
          >
            <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Current Active Section Badge (Mobile) */}
          <div className="md:hidden flex items-center min-w-0 truncate">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 sm:px-2.5 py-1 rounded-lg truncate max-w-[120px] xs:max-w-[160px] sm:max-w-xs">
              {currentTabItem.label}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 mx-0.5 hidden md:inline shrink-0">|</span>

          {/* Breadcrumb Trail (Tablet & Desktop) */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium overflow-x-auto py-0.5 min-w-0">
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={item.id + idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  {isLast ? (
                    <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg truncate">
                      {item.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTabSelect(item.id)}
                      className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer truncate"
                    >
                      {item.label}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Date & Day Indicator */}
          <div
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs shrink-0 whitespace-nowrap"
            title="Today's Date & Day"
            id="breadcrumb-date-day-badge"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">{dayName.slice(0, 3)},</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">{dayNum} {monthName.slice(0, 3)}</span>
          </div>

          {/* Quick Actions Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickActionsOpen(!quickActionsOpen);
              }}
              id="quick-actions-menu-btn"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs sm:shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
              title="Quick University Shortcuts"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Quick Actions</span>
              <span className="xs:hidden">Actions</span>
            </button>

            {quickActionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickActionsOpen(false)}
                />
                <div
                  className="absolute right-0 mt-2 w-60 max-w-[90vw] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 px-3 py-1.5">
                    University Shortcuts
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('attendance');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">Take / Check Attendance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('assignments');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <FileUp className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">Upload / Review Assignment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('notices');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <BellPlus className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">Add Notice Board Post</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('calendar');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="truncate">Open Academic Calendar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenSearch) onOpenSearch();
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="truncate">Search Student / Course</span>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('journey');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">Academic Journey Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('idcard');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">Digital University ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleTabSelect('downloads');
                      setQuickActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <FolderLock className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="truncate">Document Vault</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Desktop Search Shortcut Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            id="breadcrumb-search-trigger"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Press Ctrl+K or ⌘K to open command search"
          >
            <Command className="w-3.5 h-3.5 text-slate-500" />
            <kbd className="font-mono text-[10px]">Ctrl K</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};

