import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  BookOpen,
  Bell,
  FileText,
  User as UserIcon,
  ArrowRight,
  Eye,
  LayoutDashboard,
  UserCheck,
  Clock,
  GraduationCap,
  Sparkles,
  CreditCard,
  FolderLock,
  Calendar,
  BellRing,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Code2,
  BrainCircuit,
  FileCheck2,
  HelpCircle,
  Building2,
  PlaneTakeoff,
  Lightbulb,
  FileCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { User, UserRole } from '../../types';
import {
  INITIAL_USERS,
  SUBJECTS,
  INITIAL_NOTICES,
  INITIAL_ASSIGNMENTS,
  INITIAL_QUIZZES,
  INITIAL_MATERIALS,
  DEPARTMENTS,
  getStoredUsers
} from '../../data/mockDatabase';
import { isPast24HoursAfterDueDate } from '../../utils/dateUtils';
import { UserProfileModal } from '../profile/UserProfileModal';
import { UserAvatar } from '../common/UserAvatar';
import { canCommunicate } from '../../utils/communicationRules';
import { matchUserSmart, matchItemSmart } from '../../utils/searchMatching';
import { getTargetUserDisplayName } from '../../utils/studentNameUtils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  user?: User;
  onSendMessageToUser?: (recipient: User) => void;
}

export type SearchCategoryFilter =
  | 'all'
  | 'sections'
  | 'people'
  | 'subjects'
  | 'notices'
  | 'assignments'
  | 'materials'
  | 'quizzes'
  | 'departments';

interface PortalSectionItem {
  id: string;
  tabId: string;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ElementType;
  roles: UserRole[];
  category: 'core' | 'academic' | 'erp' | 'ai' | 'admin';
  accentColor: string;
}

const PORTAL_SECTIONS: PortalSectionItem[] = [
  {
    id: 'sec-dashboard',
    tabId: 'dashboard',
    title: 'University Dashboard',
    subtitle: 'Overview, today’s lectures, notifications, quick statistics & recent updates',
    keywords: ['dashboard', 'home', 'overview', 'summary', 'today classes', 'quick actions', 'stats', 'analytics', 'feed'],
    icon: LayoutDashboard,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'core',
    accentColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'sec-attendance',
    tabId: 'attendance',
    title: 'Smart Attendance Register',
    subtitle: 'Subject-wise attendance tracking, monthly logs, percentage calculator & leave simulator',
    keywords: ['attendance', 'present', 'absent', 'percentage', 'register', 'records', 'leave status', 'punch in', 'roll call'],
    icon: UserCheck,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'core',
    accentColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'sec-timetable',
    tabId: 'timetable',
    title: 'Academic Timetable & Schedule',
    subtitle: 'Weekly class schedule, lecture timings, faculty allocations & classroom details',
    keywords: ['timetable', 'schedule', 'routine', 'classes', 'lectures', 'period', 'slot', 'classroom', 'timing', 'mon to sat'],
    icon: Clock,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'sec-directory',
    tabId: 'directory',
    title: 'University Directory & People',
    subtitle: 'Search all faculty members, HODs, staff, and enrolled students across departments',
    keywords: ['directory', 'people', 'faculty', 'professors', 'teachers', 'students', 'staff', 'contacts', 'phone', 'email', 'hod', 'dean'],
    icon: Users,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'core',
    accentColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'sec-journey',
    tabId: 'journey',
    title: 'Academic Journey & Progression',
    subtitle: 'Curriculum timeline, earned credits, academic milestones, and semester graduation tracking',
    keywords: ['academic journey', 'credits', 'progression', 'milestones', 'curriculum', 'roadmap', 'graduation', 'skills', 'semesters'],
    icon: Sparkles,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'sec-idcard',
    tabId: 'idcard',
    title: 'Digital University ID Card',
    subtitle: 'Official digital identity card with high-resolution seal, barcode & verifiable credentials',
    keywords: ['id card', 'identity card', 'student id', 'digital id', 'barcode', 'enrollment card', 'credential', 'official pass'],
    icon: CreditCard,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'erp',
    accentColor: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
  },
  {
    id: 'sec-materials',
    tabId: 'materials',
    title: 'Study Materials & Notes Vault',
    subtitle: 'Subject syllabi, lecture notes, reference PDFs, PPT slides, video guides & lab manuals',
    keywords: ['study materials', 'notes', 'syllabus', 'pdf', 'ppt', 'books', 'documents', 'lecture notes', 'reference', 'downloads', 'reading'],
    icon: BookOpen,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'sec-assignments',
    tabId: 'assignments',
    title: 'Assignments & Practical Work',
    subtitle: 'Homework submissions, lab assignments, deadlines, grading remarks & scorecards',
    keywords: ['assignments', 'homework', 'tasks', 'submissions', 'due date', 'practical', 'lab report', 'grading', 'deadlines'],
    icon: FileCheck2,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'sec-quiz',
    tabId: 'quiz',
    title: 'Interactive Quizzes & Mock Tests',
    subtitle: 'Multiple-choice test modules, timed subject assessments, immediate score analysis & reviews',
    keywords: ['quiz', 'quizzes', 'tests', 'mock test', 'mcq', 'assessment', 'exam test', 'timer', 'questions', 'scorecard'],
    icon: HelpCircle,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'sec-results',
    tabId: 'results',
    title: 'Grade & SGPA Semester Results',
    subtitle: 'Official semester grade sheets, credit points, SGPA / CGPA analysis & transcript breakdown',
    keywords: ['results', 'grades', 'sgpa', 'cgpa', 'marksheet', 'score', 'percentage', 'transcript', 'semester result', 'exam results', 'pass fail'],
    icon: GraduationCap,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'sec-downloads',
    tabId: 'downloads',
    title: 'Document Vault & Fee Receipts',
    subtitle: 'Download official bonafide certificates, examination hall tickets, fee receipts & notices',
    keywords: ['document vault', 'downloads', 'fee receipt', 'hall ticket', 'bonafide', 'transcript', 'certificates', 'receipts', 'official documents'],
    icon: FolderLock,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'erp',
    accentColor: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
  },
  {
    id: 'sec-calendar',
    tabId: 'calendar',
    title: 'Academic Calendar & Holidays',
    subtitle: 'Semester schedule, examination dates, cultural festivals, vacations & university holidays',
    keywords: ['calendar', 'academic calendar', 'holidays', 'exam dates', 'vacation', 'festival', 'schedule', 'events', 'terms', 'session'],
    icon: Calendar,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'academic',
    accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'sec-notices',
    tabId: 'notices',
    title: 'Notice Board & Official Circulars',
    subtitle: 'University announcements, departmental notices, exam circulars, vacancy alerts & scholarship updates',
    keywords: ['notices', 'notice board', 'circulars', 'announcements', 'news', 'bulletin', 'vacancies', 'scholarships', 'alerts', 'press release'],
    icon: BellRing,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'core',
    accentColor: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
  },
  {
    id: 'sec-messaging',
    tabId: 'messaging',
    title: 'Campus Messaging & Chat',
    subtitle: 'Direct peer-to-faculty messaging, academic consultations, departmental broadcast channels & group chat',
    keywords: ['messaging', 'chat', 'messages', 'inbox', 'faculty consultation', 'direct message', 'broadcast', 'communication', 'talk'],
    icon: MessageSquare,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'core',
    accentColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
  },
  {
    id: 'sec-reports',
    tabId: 'reports',
    title: 'Reports & Academic Analytics',
    subtitle: 'Comprehensive performance summaries, attendance trends, department analytics & exportable CSV reports',
    keywords: ['reports', 'analytics', 'statistics', 'charts', 'department reports', 'performance', 'graphs', 'attendance report', 'exports'],
    icon: BarChart3,
    roles: ['teacher', 'hod', 'admin'],
    category: 'erp',
    accentColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'sec-profile',
    tabId: 'profile',
    title: 'My Digital Profile & Security',
    subtitle: 'Account details, contact info, role credentials, password update & email 2FA verification',
    keywords: ['profile', 'my profile', 'account', 'password', 'change password', 'security', 'settings', 'email otp', 'contact info', 'avatar'],
    icon: UserIcon,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'core',
    accentColor: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
  },
  {
    id: 'sec-admin-users',
    tabId: 'admin-users',
    title: 'User Management & Admin Control',
    subtitle: 'Create, modify, soft-delete, reactivate user accounts, role allocations & department assignment',
    keywords: ['admin users', 'user management', 'accounts', 'create student', 'add teacher', 'purge user', 'roles', 'permissions', 'reactivate'],
    icon: Users,
    roles: ['admin'],
    category: 'admin',
    accentColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'sec-admin-audit',
    tabId: 'admin-audit',
    title: 'Audit & ERP Security Logs',
    subtitle: 'Immutable system access logs, authentication events, password updates & security monitoring',
    keywords: ['audit logs', 'erp logs', 'security events', 'login history', 'audit trail', 'ip addresses', 'system changes'],
    icon: ShieldCheck,
    roles: ['admin'],
    category: 'admin',
    accentColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },

  // ERP & Advanced Modules
  {
    id: 'sec-leave-workflow',
    tabId: 'leave-workflow',
    title: 'Smart Leave & Outpass Workflow',
    subtitle: 'Digital student leave requests, medical certificates, warden outpass approvals & HOD sanctions',
    keywords: ['leave workflow', 'leave application', 'outpass', 'hostel outpass', 'medical leave', 'od leave', 'sanction', 'gate pass'],
    icon: PlaneTakeoff,
    roles: ['student', 'teacher', 'hod', 'admin'],
    category: 'erp',
    accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'sec-teacher-ai-insights',
    tabId: 'teacher-ai-insights',
    title: 'Faculty Remedial AI Analytics',
    subtitle: 'Predictive student performance risk models, attendance intervention alerts & remedial recommendations',
    keywords: ['teacher ai insights', 'faculty analytics', 'student risk', 'remedial classes', 'attendance alerts', 'ai suggestions'],
    icon: Lightbulb,
    roles: ['teacher', 'hod', 'admin'],
    category: 'ai',
    accentColor: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
  },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  user,
  onSendMessageToUser,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategoryFilter>('all');
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const q = query.toLowerCase().trim();
  const userRole = user?.role || 'student';
  const isStudent = userRole === 'student';
  const deptId = user?.departmentId;

  // 1. Sections Matching
  const matchingSections = useMemo(() => {
    return PORTAL_SECTIONS.filter((sec) => {
      // Role check
      if (!sec.roles.includes(userRole)) return false;
      if (!q) return true; // Show all when empty or category filtered

      return matchItemSmart(
        [sec.title, sec.subtitle, sec.tabId, sec.category, ...sec.keywords],
        q
      );
    });
  }, [q, userRole]);

  // 2. Subjects Matching
  const matchingSubjects = useMemo(() => {
    if (!q && activeCategory !== 'subjects') return [];
    return SUBJECTS.filter((s) => {
      const isMatchDept = !isStudent || !deptId || s.departmentId === deptId;
      if (!isMatchDept) return false;
      if (!q) return true;

      return matchItemSmart(
        [s.code, s.name, s.departmentId, `semester ${s.semester}`, `sem ${s.semester}`],
        q
      );
    });
  }, [q, isStudent, deptId, activeCategory]);

  // 3. Notices Matching
  const matchingNotices = useMemo(() => {
    if (!q && activeCategory !== 'notices') return [];
    return INITIAL_NOTICES.filter((n) => {
      const isVacancyNotice =
        n.category === 'vacancy' ||
        n.title.toLowerCase().includes('vacancy') ||
        n.content.toLowerCase().includes('vacancy') ||
        n.title.toLowerCase().includes('recruitment') ||
        n.title.toLowerCase().includes('hiring');

      const isMatchDept =
        !isStudent || !deptId || !n.departmentId || n.departmentId === deptId || isVacancyNotice;

      if (!isMatchDept) return false;
      if (!q) return true;

      return matchItemSmart(
        [n.title, n.content, n.category, n.postedByName, n.departmentName],
        q
      );
    });
  }, [q, isStudent, deptId, activeCategory]);

  // 4. Assignments Matching
  const matchingAssignments = useMemo(() => {
    if (!q && activeCategory !== 'assignments') return [];
    return INITIAL_ASSIGNMENTS.filter((a) => {
      const isMatchDept = !isStudent || !deptId || !a.departmentId || a.departmentId === deptId;
      if (!isMatchDept) return false;
      if (!q) return true;

      return matchItemSmart(
        [a.title, a.description, a.subjectName, a.teacherName],
        q
      );
    });
  }, [q, isStudent, deptId, activeCategory]);

  // 5. People / Users Matching (Students, Faculty, HODs, Admins)
  const matchingUsers = useMemo(() => {
    if (!q && activeCategory !== 'people') return [];
    const allUsers = getStoredUsers();
    return allUsers.filter((u) => {
      if (!q) return true;
      return matchUserSmart(u, q);
    });
  }, [q, activeCategory]);

  // 6. Study Materials Matching
  const matchingMaterials = useMemo(() => {
    if (!q && activeCategory !== 'materials') return [];
    return INITIAL_MATERIALS.filter((m) => {
      const isMatchDept = !isStudent || !deptId || !m.departmentId || m.departmentId === deptId;
      if (!isMatchDept) return false;
      if (!q) return true;

      return matchItemSmart(
        [m.title, m.subjectName, m.description, m.uploadedByName],
        q
      );
    });
  }, [q, isStudent, deptId, activeCategory]);

  // 7. Quizzes Matching
  const matchingQuizzes = useMemo(() => {
    if (!q && activeCategory !== 'quizzes') return [];
    return INITIAL_QUIZZES.filter((qz) => {
      const isMatchDept = !isStudent || !deptId || !qz.departmentId || qz.departmentId === deptId;
      if (!isMatchDept) return false;
      if (!q) return true;

      const questionTexts = (qz.questions || []).flatMap((qst) => [qst.question, qst.explanation || '']);
      return matchItemSmart(
        [qz.title, qz.subjectName, ...questionTexts],
        q
      );
    });
  }, [q, isStudent, deptId, activeCategory]);

  // 8. Departments Matching
  const matchingDepartments = useMemo(() => {
    if (!q && activeCategory !== 'departments') return [];
    return DEPARTMENTS.filter((d) => {
      if (!q) return true;
      return matchItemSmart(
        [d.name, d.code, d.hodName, d.degreeFullName, d.degreeCode, d.subDepartmentName, d.description],
        q
      );
    });
  }, [q, activeCategory]);

  // Horizontal Scroll & Mouse Wheel / Drag State for Category Filter Chips
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const updateScrollState = () => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(updateScrollState, 60);
    const el = tabsScrollRef.current;
    if (!el) return () => clearTimeout(timer);

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    // Smooth horizontal mouse-wheel handling on category chips
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        updateScrollState();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [
    isOpen,
    matchingSections.length,
    matchingUsers.length,
    matchingSubjects.length,
    matchingNotices.length,
    matchingAssignments.length,
    matchingMaterials.length,
    matchingQuizzes.length,
    matchingDepartments.length,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsDragging(true);
    dragStartXRef.current = e.pageX - el.offsetLeft;
    dragScrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = tabsScrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.2;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = dragScrollLeftRef.current - walk;
    updateScrollState();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const categoryTabs: Array<{
    id: SearchCategoryFilter;
    label: string;
    count?: number;
    icon?: React.ElementType;
  }> = [
    { id: 'all', label: 'All Results' },
    { id: 'sections', label: 'Sections', count: matchingSections.length, icon: LayoutDashboard },
    { id: 'people', label: 'People', count: matchingUsers.length, icon: Users },
    { id: 'subjects', label: 'Courses', count: matchingSubjects.length, icon: BookOpen },
    { id: 'notices', label: 'Notices', count: matchingNotices.length, icon: Bell },
    { id: 'assignments', label: 'Assignments', count: matchingAssignments.length, icon: FileText },
    { id: 'materials', label: 'Materials', count: matchingMaterials.length, icon: FolderLock },
    { id: 'quizzes', label: 'Quizzes', count: matchingQuizzes.length, icon: HelpCircle },
    { id: 'departments', label: 'Departments', count: matchingDepartments.length, icon: Building2 },
  ];

  if (!isOpen) return null;

  const totalResultsCount =
    (activeCategory === 'all' || activeCategory === 'sections' ? matchingSections.length : 0) +
    (activeCategory === 'all' || activeCategory === 'people' ? matchingUsers.length : 0) +
    (activeCategory === 'all' || activeCategory === 'subjects' ? matchingSubjects.length : 0) +
    (activeCategory === 'all' || activeCategory === 'notices' ? matchingNotices.length : 0) +
    (activeCategory === 'all' || activeCategory === 'assignments' ? matchingAssignments.length : 0) +
    (activeCategory === 'all' || activeCategory === 'materials' ? matchingMaterials.length : 0) +
    (activeCategory === 'all' || activeCategory === 'quizzes' ? matchingQuizzes.length : 0) +
    (activeCategory === 'all' || activeCategory === 'departments' ? matchingDepartments.length : 0);

  const handleNavigateToTab = (tabId: string) => {
    onSelectTab(tabId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-12 md:pt-16 px-3 sm:px-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all sections, courses, notices, faculty, assignments, materials..."
            className="w-full px-3 py-1 text-sm sm:text-base bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium"
            autoFocus
            id="global-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-xs font-semibold"
              title="Clear search"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Close Search (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="relative w-full bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center">
          {/* Scroll Left Button & Gradient Fade Mask */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-2 pr-6 bg-gradient-to-r from-slate-50 via-slate-50/95 dark:from-slate-950 dark:via-slate-950/95 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                className="pointer-events-auto p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                title="Scroll categories left"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Categories Row */}
          <div
            ref={tabsScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`w-full px-4 sm:px-5 py-2.5 flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    if (hasDraggedRef.current) return;
                    setActiveCategory(tab.id);
                    (e.currentTarget as HTMLElement).scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                      inline: 'center',
                    });
                  }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-700/80 text-emerald-100'
                          : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button & Gradient Fade Mask */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pr-2 pl-6 bg-gradient-to-l from-slate-50 via-slate-50/95 dark:from-slate-950 dark:via-slate-950/95 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                className="pointer-events-auto p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                title="Scroll categories right"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Empty Query Default State: Quick Navigation Sections */}
          {!q && activeCategory === 'all' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Popular & Available Portal Sections</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Click any section to open immediately</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchingSections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      id={`quick-sec-${sec.tabId}`}
                      type="button"
                      onClick={() => handleNavigateToTab(sec.tabId)}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 text-left transition-all group cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg shrink-0 border ${sec.accentColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {sec.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {sec.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1. SECTIONS RESULTS */}
          {(activeCategory === 'all' || activeCategory === 'sections') && (q || activeCategory === 'sections') && matchingSections.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Portal Sections & Modules ({matchingSections.length})</span>
                <span className="text-[10px] text-emerald-500 font-semibold">Direct Navigation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingSections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      id={`search-sec-${sec.tabId}`}
                      type="button"
                      onClick={() => handleNavigateToTab(sec.tabId)}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg shrink-0 border ${sec.accentColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {sec.title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {sec.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. PEOPLE & DIRECTORY USERS */}
          {(activeCategory === 'all' || activeCategory === 'people') && matchingUsers.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Students, Faculty, Staff & HODs ({matchingUsers.length})</span>
                <span className="text-[10px] text-purple-500 font-semibold">University Directory</span>
              </div>
              <div className="space-y-1.5">
                {matchingUsers.slice(0, 10).map((u) => {
                  const displayedName = getTargetUserDisplayName(u, user);
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserForProfile(u)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={displayedName}
                          avatar={u.avatar}
                          role={u.role}
                          size="sm"
                          className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {displayedName}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono border border-purple-200 dark:border-purple-800">
                              {u.role}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{u.departmentName || u.departmentId}</span>
                            {u.enrollmentNo && <span>• Roll: {u.enrollmentNo}</span>}
                            {u.employeeId && <span>• Emp ID: {u.employeeId}</span>}
                          </div>
                        </div>
                      </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserForProfile(u);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-purple-500" />
                        <span>Profile</span>
                      </button>
                      {(!user || canCommunicate(user.role, u.role)) && user?.id !== u.id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToTab('messaging');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Message</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
                {matchingUsers.length > 10 && (
                  <button
                    type="button"
                    onClick={() => handleNavigateToTab('directory')}
                    className="w-full py-2 text-center text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View all {matchingUsers.length} matching people in University Directory →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. COURSES & SUBJECTS */}
          {(activeCategory === 'all' || activeCategory === 'subjects') && matchingSubjects.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Courses & Subject Syllabi ({matchingSubjects.length})</span>
                <span className="text-[10px] text-emerald-500 font-semibold">Academic Curriculum</span>
              </div>
              <div className="space-y-1.5">
                {matchingSubjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleNavigateToTab('materials')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {s.code}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {s.name}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Semester {s.semester}</span>
                          <span>• {s.credits} Credits</span>
                          <span>• {s.departmentId.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>View Study Materials</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. NOTICES & CIRCULARS */}
          {(activeCategory === 'all' || activeCategory === 'notices') && matchingNotices.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Notices & Official Circulars ({matchingNotices.length})</span>
                <span className="text-[10px] text-amber-500 font-semibold">Campus Circulars</span>
              </div>
              <div className="space-y-1.5">
                {matchingNotices.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNavigateToTab('notices')}
                    className="w-full flex items-start justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block">
                          {n.title}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {n.content}
                        </p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1 font-medium">
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase font-mono text-[9px] font-bold">
                            {n.category}
                          </span>
                          <span>{n.date}</span>
                          <span>• {n.postedByName || 'Dean Office'}</span>
                          {n.departmentName && <span>• {n.departmentName}</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0 mt-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. ASSIGNMENTS & HOMEWORK */}
          {(activeCategory === 'all' || activeCategory === 'assignments') && matchingAssignments.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Assignments & Practical Tasks ({matchingAssignments.length})</span>
                <span className="text-[10px] text-blue-500 font-semibold">Submissions</span>
              </div>
              <div className="space-y-1.5">
                {matchingAssignments.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleNavigateToTab('assignments')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                          {a.title}
                        </span>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{a.subjectName}</span>
                          <span>• Total Marks: {a.totalMarks || 25}</span>
                          <span>• Faculty: {a.teacherName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        Due: {a.dueDate}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. STUDY MATERIALS */}
          {(activeCategory === 'all' || activeCategory === 'materials') && matchingMaterials.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Study Materials & Documents ({matchingMaterials.length})</span>
                <span className="text-[10px] text-teal-500 font-semibold">Notes Vault</span>
              </div>
              <div className="space-y-1.5">
                {matchingMaterials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleNavigateToTab('materials')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0">
                        <FolderLock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block">
                          {m.title}
                        </span>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{m.subjectName}</span>
                          <span className="uppercase font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                            {m.type || 'PDF'}
                          </span>
                          <span>• By {m.uploadedByName}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. QUIZZES */}
          {(activeCategory === 'all' || activeCategory === 'quizzes') && matchingQuizzes.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>Interactive Quizzes & Mock Assessments ({matchingQuizzes.length})</span>
                <span className="text-[10px] text-rose-500 font-semibold">Assessments</span>
              </div>
              <div className="space-y-1.5">
                {matchingQuizzes.map((qz) => (
                  <button
                    key={qz.id}
                    type="button"
                    onClick={() => handleNavigateToTab('quiz')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors block">
                          {qz.title}
                        </span>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{qz.subjectName}</span>
                          <span>• {qz.durationMinutes} Minutes</span>
                          <span>• {qz.questions?.length || 5} Questions</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. DEPARTMENTS */}
          {(activeCategory === 'all' || activeCategory === 'departments') && matchingDepartments.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-2.5 tracking-wider flex items-center justify-between">
                <span>University Academic Departments ({matchingDepartments.length})</span>
                <span className="text-[10px] text-indigo-500 font-semibold">Academic Wings</span>
              </div>
              <div className="space-y-1.5">
                {matchingDepartments.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleNavigateToTab('directory')}
                    className="w-full flex items-start justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            [{d.code}]
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {d.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {d.description}
                        </p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1 font-medium">
                          <span>HOD: {d.hodName}</span>
                          <span>• {d.studentCount} Students</span>
                          <span>• {d.facultyCount} Faculty Members</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform shrink-0 mt-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS STATE */}
          {q && totalResultsCount === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching results found for "{query}"
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for sections like "Timetable", "Attendance", "Results", "ID Card", course codes like "BVOC", or faculty names.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery('Timetable')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  Timetable
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Attendance')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('ID Card')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  Digital ID Card
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('Results')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  SGPA Results
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Hotkeys Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Esc
              </kbd>
              <span>to close</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">
                Click
              </kbd>
              <span>to navigate</span>
            </span>
          </div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            Lokbharti ERP Global Search
          </div>
        </div>
      </div>

      {/* User Profile Quick Inspector Modal */}
      {selectedUserForProfile && (
        <UserProfileModal
          user={selectedUserForProfile}
          currentUser={user}
          onClose={() => setSelectedUserForProfile(null)}
          onSendMessage={(targetUser) => {
            setSelectedUserForProfile(null);
            onClose();
            if (onSendMessageToUser) {
              onSendMessageToUser(targetUser);
            } else {
              onSelectTab('messaging');
            }
          }}
        />
      )}
    </div>
  );
};
