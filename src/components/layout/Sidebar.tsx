import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  Clock,
  BookOpen,
  FileCheck2,
  HelpCircle,
  GraduationCap,
  Calendar,
  BellRing,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  CreditCard,
  FolderLock,
  Sparkles,
  User as UserIcon,
  Code2,
  PlaneTakeoff,
  BrainCircuit,
  FileText,
  X,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../../types';
import { LOKBHARTI_LOGO } from '../../assets/logo';

interface SidebarProps {
  role?: UserRole;
  userRole?: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  attendanceWarningCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  isAIFeature?: boolean;
  roles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  role: directRole,
  userRole,
  activeTab,
  onSelectTab,
  attendanceWarningCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const role = directRole || userRole || 'student';
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'hod', 'admin'] },
    
    // University ERP Core Modules
    { id: 'attendance', label: 'Attendance Register', icon: UserCheck, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'timetable', label: 'Academic Timetable', icon: Clock, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'students', label: 'Student Management', icon: GraduationCap, roles: ['teacher', 'hod', 'admin'] },
    { id: 'directory', label: 'University Directory', icon: Users, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'journey', label: 'Academic Journey', icon: Sparkles, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'idcard', label: 'Digital University ID', icon: CreditCard, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'assignments', label: 'Assignments', icon: FileCheck2, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'quiz', label: 'Interactive Quizzes', icon: HelpCircle, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'results', label: 'Grade & SGPA Results', icon: GraduationCap, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'downloads', label: 'Document Vault', icon: FolderLock, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'notices', label: 'Notice Board', icon: BellRing, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'messaging', label: 'Campus Messaging', icon: MessageSquare, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['teacher', 'hod', 'admin'] },
    { id: 'admin-users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'admin-audit', label: 'Audit & ERP Logs', icon: ShieldCheck, roles: ['admin'] },
    { id: 'profile', label: 'My Digital Profile', icon: UserIcon, roles: ['student', 'teacher', 'hod', 'admin'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['student', 'teacher', 'hod', 'admin'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavList = (isMobileVersion: boolean = false) => (
    <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-1 scrollbar-none">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
              isActive
                ? item.isAIFeature
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : item.isAIFeature
                ? 'text-slate-300 hover:bg-slate-800/80 hover:text-emerald-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : item.isAIFeature
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge ? (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  item.badge === '75% Alert'
                    ? 'bg-rose-500 text-white'
                    : item.badge === 'AI Master'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {item.badge}
              </span>
            ) : isMobileVersion ? (
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                  isActive ? 'text-white/80 opacity-100' : 'text-slate-600 opacity-60'
                }`}
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left Column) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 transition-all duration-300 hidden md:flex rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-6.5rem)] sticky top-20">
        {/* Sidebar Header Brand Logo */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-slate-700">
            <img
              src={LOKBHARTI_LOGO}
              alt="Lokbharti Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-wide uppercase">Lokbharti ERP</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Smart University Portal</div>
          </div>
        </div>

        {/* Role Banner */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
            Active Workspace
          </div>
          <div className="text-xs font-bold text-white capitalize flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {role === 'hod' ? 'HOD Workspace' : `${role} Portal`}
          </div>
        </div>

        {/* Desktop Nav List */}
        {renderNavList(false)}

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          Lokbharti Sanosara • v4.0 LMS
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out Modal on small screens) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex" aria-modal="true" role="dialog">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Menu Container */}
          <div className="relative w-[82vw] max-w-xs bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl border-r border-slate-800 z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-slate-700">
                  <img
                    src={LOKBHARTI_LOGO}
                    alt="Lokbharti Logo"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="text-xs font-black text-white tracking-wide uppercase">Lokbharti ERP</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">University Menu</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Banner */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                  Logged In As
                </div>
                <div className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {role === 'hod' ? 'HOD Workspace' : `${role} Portal`}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {role}
              </span>
            </div>

            {/* Mobile Nav List */}
            {renderNavList(true)}

            {/* Mobile Drawer Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Lokbharti Sanosara</span>
              <button
                type="button"
                onClick={() => {
                  handleItemClick('settings');
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

