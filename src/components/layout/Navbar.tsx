import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Search,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Calendar,
  FileText,
  CheckCheck,
  Award,
  HelpCircle,
  Trash2,
  Mail,
  FileCheck,
  Megaphone,
  BellRing,
  Eye,
  Menu,
  X
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { getCurrentDateAndDay } from '../../utils/dateUtils';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { UniversityLogoModal } from '../common/UniversityLogoModal';
import { UserAvatar } from '../common/UserAvatar';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenSearch: () => void;
  notifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  onSelectTab: (tab: string) => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  darkMode,
  setDarkMode,
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  notifications = [],
  unreadNotificationsCount,
  onSelectTab,
  onNotificationClick,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearNotification,
  onClearAllNotifications,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  const handleNotificationItemClick = (n: NotificationItem) => {
    setShowNotifications(false);
    if (onMarkNotificationAsRead) {
      onMarkNotificationAsRead(n.id);
    }
    if (onNotificationClick) {
      onNotificationClick(n);
    } else {
      if (n.targetTab) {
        onSelectTab(n.targetTab);
      } else if (n.type === 'assignment') {
        onSelectTab('assignments');
      } else if (n.type === 'notice') {
        onSelectTab('notices');
      } else if (n.type === 'quiz') {
        onSelectTab('quiz');
      } else if (n.type === 'result') {
        onSelectTab('results');
      } else if (n.type === 'attendance') {
        onSelectTab('attendance');
      } else if (n.type === 'timetable') {
        onSelectTab('timetable');
      } else if (n.type === 'message') {
        onSelectTab('messaging');
      } else if (n.type === 'document') {
        onSelectTab('materials');
      } else {
        onSelectTab('dashboard');
      }
    }
  };

  const { dayName, monthName, dayNum, year } = getCurrentDateAndDay();

  const effectiveDarkMode = darkMode ?? isDarkMode ?? false;
  const handleToggleDark = () => {
    if (setDarkMode) {
      setDarkMode(!effectiveDarkMode);
    } else if (onToggleDarkMode) {
      onToggleDarkMode();
    }
  };

  const unreadCount =
    unreadNotificationsCount ?? (notifications || []).filter((n) => !n.isRead).length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300';
      case 'hod':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Brand Logo & Name + Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Menu Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            id="mobile-menu-toggle-btn"
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 transition-colors shrink-0"
            title="Open University Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-rose-500" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowLogoModal(true)}
          className="group relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-xs sm:shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer"
          title="Click to View Official University Seal & App Icon (Full HD)"
          id="navbar-logo-seal-button"
        >
          <img
            src={LOKBHARTI_LOGO}
            alt="Lokbharti Logo"
            className="w-full h-full object-contain group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" />
          </div>
        </button>

        <div className="cursor-pointer min-w-0" onClick={() => onSelectTab('dashboard')}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-sm sm:text-base lg:text-lg text-slate-900 dark:text-white tracking-tight hover:text-emerald-600 transition-colors truncate">
              Lokbharti Univ.
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              LMS
            </span>
          </div>
          <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] lg:max-w-none">
            Academic Management & ERP • Sanosara
          </p>
        </div>
      </div>

      {/* Global Search Bar Trigger (Desktop) */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 text-slate-500 dark:text-slate-400 text-sm shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all w-56 lg:w-80 cursor-pointer group shrink-0"
        id="global-search-trigger"
        title="Search sections, courses, notices, students, faculty (⌘K or Ctrl+K)"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
        <span className="flex-1 text-left font-medium text-xs text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
          Search sections, courses...
        </span>
        <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-2xs group-hover:border-emerald-500/40 shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Date & Day Badge (Desktop only) */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs shrink-0"
          title="Current Date & Day"
          id="navbar-date-day-badge"
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white">{dayName},</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">{dayNum} {monthName} {year}</span>
        </div>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Search Everywhere"
          id="mobile-search-btn"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={handleToggleDark}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title={effectiveDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="dark-mode-toggle"
        >
          {effectiveDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative shrink-0"
            id="notification-bell-btn"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-88 sm:w-96 max-w-[90vw] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && onMarkAllNotificationsAsRead && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-[10px] sm:text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Mark read
                    </button>
                  )}
                  {notifications.length > 0 && onClearAllNotifications && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-[10px] sm:text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto my-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Bell className="w-6 h-6 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                    <span>No notifications</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`group relative py-2.5 px-2 rounded-xl transition-colors ${
                        !n.isRead
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 pr-6">
                        <div
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => handleNotificationItemClick(n)}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'attendance' ? (
                              <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                            ) : n.type === 'assignment' ? (
                              <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : n.type === 'quiz' ? (
                              <HelpCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                            ) : n.type === 'result' ? (
                              <Award className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            ) : n.type === 'notice' || n.title.includes('Notice') || n.title.includes('📢') || n.title.includes('Announcement') ? (
                              <Megaphone className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                            ) : n.type === 'request' || n.title.includes('Request') || n.title.includes('📩') || n.title.includes('✅') || n.title.includes('❌') ? (
                              <FileCheck className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                            ) : n.type === 'message' ? (
                              <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            ) : (
                              <Bell className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        {onClearNotification && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearNotification(n.id);
                            }}
                            className="absolute right-1 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 p-1 rounded-md"
                            title="Remove notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onSelectTab('notices');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-xs"
                  >
                    View Notice Board
                  </button>
                  {onClearAllNotifications && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear all
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:pl-2 sm:pr-1.5 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0"
            id="user-profile-menu-btn"
          >
            <UserAvatar
              name={user.name}
              avatar={user.avatar}
              role={user.role}
              size="sm"
              className="ring-2 ring-emerald-500/40 shrink-0"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {user.name}
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  {user.departmentName}{user.semester ? ` • Sem ${user.semester}` : ''}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectTab('profile');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  id="profile-dropdown-item"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  View Profile
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                  id="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official University Seal Modal */}
      <UniversityLogoModal isOpen={showLogoModal} onClose={() => setShowLogoModal(false)} />
    </header>
  );
};
