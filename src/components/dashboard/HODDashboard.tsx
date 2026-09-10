import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  CheckCircle,
  Clock,
  BarChart2,
  FileText,
  ArrowRight,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Search,
  Mail,
  Phone,
  BookOpen,
  Bell,
  Activity,
  Filter,
  Check,
  Sparkles,
  TrendingUp,
  X,
  Layers,
  Award,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Briefcase,
  Sliders,
  UserX,
  Trash2,
  History,
  Archive,
  FileCheck,
  Printer,
  Download,
  RotateCcw,
  Lock,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import {
  User,
  AttendanceEditRequest,
  AttendanceRecord,
  Notice,
  AuditLog,
  Assignment,
  StudentRequest,
  formatRequestCategory,
  NotificationItem
} from '../../types';
import { getCurrentDateAndDay } from '../../utils/dateUtils';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import {
  DEPARTMENTS,
  INITIAL_USERS,
  SUBJECTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_NOTICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDENT_REQUESTS
} from '../../data/mockDatabase';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';

interface HODDashboardProps {
  user: User;
  editRequests?: AttendanceEditRequest[];
  attendanceRecords?: AttendanceRecord[];
  notices?: Notice[];
  auditLogs?: AuditLog[];
  assignments?: Assignment[];
  studentRequests?: StudentRequest[];
  dashboardAction?: { modal?: string; targetId?: string; requestId?: string; timestamp: number } | null;
  onReviewStudentRequest?: (requestId: string, status: 'Approved' | 'Rejected', comment?: string) => void;
  onDismissStudentRequest?: (requestId: string) => void;
  onClearAllProcessedRequests?: (role?: 'hod' | 'admin', departmentId?: string) => void;
  onSelectTab: (tab: string) => void;
  onApproveEdit: (requestId: string, status: 'approved' | 'rejected', comment?: string) => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({
  user,
  editRequests = [],
  attendanceRecords = INITIAL_ATTENDANCE_RECORDS,
  notices = INITIAL_NOTICES,
  auditLogs = INITIAL_AUDIT_LOGS,
  assignments = INITIAL_ASSIGNMENTS,
  studentRequests,
  dashboardAction,
  onReviewStudentRequest,
  onDismissStudentRequest,
  onClearAllProcessedRequests,
  onSelectTab,
  onApproveEdit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'students' | 'teachers' | 'attendance' | 'performance' | 'pending' | 'activities'>('overview');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSemFilter, setStudentSemFilter] = useState<string>('all');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [activityFilter, setActivityFilter] = useState<'all' | 'attendance' | 'notice' | 'audit'>('all');

  // Modal States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'Academic' | 'Exam & Quiz' | 'Event' | 'Urgent Directive'>('Academic');
  const [noticeAudience, setNoticeAudience] = useState<'All Department' | 'Department Students' | 'Department Teachers'>('All Department');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeSuccessMsg, setNoticeSuccessMsg] = useState<string | null>(null);

  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedProfId, setSelectedProfId] = useState('');
  const [selectedSubjId, setSelectedSubjId] = useState('');
  const [allocatedWeeklyHours, setAllocatedWeeklyHours] = useState('6');
  const [allocationSuccessMsg, setAllocationSuccessMsg] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const triggerActionFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'Approved' | 'Rejected'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historySemFilter, setHistorySemFilter] = useState<string>('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

  // React to dashboardAction triggered by notification clicks
  useEffect(() => {
    if (dashboardAction?.modal === 'student_requests') {
      setShowRequestsModal(true);
    } else if (dashboardAction?.modal === 'student_history') {
      setShowHistoryModal(true);
    }
  }, [dashboardAction]);

  const [localRequests, setLocalRequests] = useState<StudentRequest[]>(() => {
    return safeStorageGet<StudentRequest[]>('lbu_student_requests', INITIAL_STUDENT_REQUESTS);
  });

  // Effective requests: prefer prop, otherwise fallback to local safeStorage
  const allStudentRequests = studentRequests && studentRequests.length > 0 ? studentRequests : localRequests;
  
  // Resolve current HOD's department info
  const deptId = user.departmentId || 'dept_it';
  const departmentObj =
    DEPARTMENTS.find((d) => d.id === deptId || d.code === deptId) ||
    DEPARTMENTS.find((d) => d.id === 'dept_it') ||
    DEPARTMENTS[0];

  // Requests regarding students in this department:
  // Includes requests direct to HOD (actionable) AND requests sent to Central Administration regarding students (read-only for HOD)
  const deptStudentRequests = allStudentRequests.filter((req) => {
    if (req.departmentId && req.departmentId !== deptId && req.departmentId !== 'dept_it') {
      const student = departmentStudents.find((s) => s.id === req.studentId);
      if (!student && req.departmentName && !req.departmentName.toLowerCase().includes('information technology')) {
        return false;
      }
    }
    return true;
  });

  // Actionable requests for HOD
  const hodActionableRequests = deptStudentRequests.filter((req) => !req.recipientRole || req.recipientRole === 'hod');
  // Admin-directed requests regarding students -> Read-Only mode for HOD
  const adminReadOnlyRequests = deptStudentRequests.filter((req) => req.recipientRole === 'admin');

  // Active requests: shown on the review desk (only those pending approval or rejection, plus any newly reviewed before clearing)
  const activeStudentRequests = deptStudentRequests.filter((req) => {
    if (req.isCleared) return false;
    return true;
  });

  // Responded requests for Student Request History: stores ONLY Approved or Rejected requests
  const respondedStudentRequests = deptStudentRequests.filter(
    (req) => req.status === 'Approved' || req.status === 'Rejected'
  );

  const pendingStudentRequestsCount = deptStudentRequests.filter((r) => r.status === 'Pending').length;
  const pendingHODCount = hodActionableRequests.filter((r) => r.status === 'Pending').length;
  const pendingAdminReadOnlyCount = adminReadOnlyRequests.filter((r) => r.status === 'Pending').length;
  const respondedStudentRequestsCount = respondedStudentRequests.length;

  // Modals and filter states for request desk
  const [requestsRoleFilter, setRequestsRoleFilter] = useState<'all' | 'hod' | 'admin'>('all');
  const [requestsSearch, setRequestsSearch] = useState('');
  const [historyRecipientFilter, setHistoryRecipientFilter] = useState<'all' | 'hod' | 'admin'>('all');
  const [inspectingRequest, setInspectingRequest] = useState<StudentRequest | null>(null);

  const handleProcessRequest = (requestId: string, status: 'Approved' | 'Rejected', comment?: string) => {
    const targetReq = allStudentRequests.find((r) => r.id === requestId);
    if (targetReq && targetReq.recipientRole === 'admin') {
      triggerActionFeedback('Access Restricted: Petitions submitted to University Administration are in Read-Only mode for HOD.');
      return;
    }

    if (onReviewStudentRequest) {
      onReviewStudentRequest(requestId, status, comment);
    } else {
      const updated = localRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              processedAt: Date.now(),
              reviewedBy: user.name || 'Head of Department',
              reviewComment: comment || (status === 'Approved' ? 'Approved with Department Official Stamp' : 'Declined upon departmental review'),
            }
          : r
      );
      setLocalRequests(updated);
      safeStorageSet('lbu_student_requests', updated);

      if (targetReq) {
        const studentNotif: NotificationItem = {
          id: `notif_st_${Date.now()}`,
          userId: targetReq.studentId,
          role: 'student',
          title: status === 'Approved' ? `✅ Request Approved: ${targetReq.subject}` : `❌ Request Rejected: ${targetReq.subject}`,
          message: `Your request "${targetReq.subject}" (${formatRequestCategory(targetReq.requestType)}) has been ${status.toUpperCase()} by ${user.name || 'Head of Department'}.`,
          type: 'request',
          targetTab: 'dashboard',
          targetModal: 'student_requests',
          targetId: targetReq.id,
          isRead: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const currentNotifs = safeStorageGet<NotificationItem[]>('lbu_notifications', []);
        safeStorageSet('lbu_notifications', [studentNotif, ...currentNotifs]);
      }
    }
    triggerActionFeedback(`Request marked as ${status}. It is saved to Student Request History.`);
  };

  const handleDismissRequest = (requestId: string) => {
    if (onDismissStudentRequest) {
      onDismissStudentRequest(requestId);
    } else {
      const updated = localRequests.map((r) =>
        r.id === requestId ? { ...r, isCleared: true, clearedAt: Date.now() } : r
      );
      setLocalRequests(updated);
      safeStorageSet('lbu_student_requests', updated);
    }
    triggerActionFeedback('Request cleared from active desk. All details are safely stored in Student Request History.');
  };

  const handleClearAllProcessed = () => {
    if (onClearAllProcessedRequests) {
      onClearAllProcessedRequests('hod', deptId);
    } else {
      const updated = localRequests.map((r) => {
        if (r.status === 'Pending') return r;
        return { ...r, isCleared: true, clearedAt: Date.now() };
      });
      setLocalRequests(updated);
      safeStorageSet('lbu_student_requests', updated);
    }
    triggerActionFeedback('Cleared processed requests. Only pending student requests remain visible.');
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deptSettings, setDeptSettings] = useState({
    academicYear: '2025-2026',
    activeSemesters: 'Semester 3 & Semester 5',
    minAttendancePct: '75',
    hodOfficeHours: 'Mon - Fri (10:00 AM - 04:00 PM)',
  });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  const { fullFormatted } = getCurrentDateAndDay();

  // Resolve Department Students
  const departmentStudents = INITIAL_USERS.filter(
    (u) =>
      u.role === 'student' &&
      (u.departmentId === deptId ||
        (deptId === 'dept_it' && (u.departmentId === 'dept_it' || u.departmentName?.toLowerCase().includes('information technology'))))
  );
  const totalStudents = departmentStudents.length > 0 ? departmentStudents.length : departmentObj.studentCount || 180;

  // Semester breakdown map
  const semesterBreakdown: Record<number, number> = {};
  departmentStudents.forEach((s) => {
    const sem = s.semester || 1;
    semesterBreakdown[sem] = (semesterBreakdown[sem] || 0) + 1;
  });

  // Resolve Department Faculty/Teachers
  const departmentTeachers = INITIAL_USERS.filter(
    (u) =>
      (u.role === 'teacher' || u.role === 'hod') &&
      (u.departmentId === deptId ||
        (deptId === 'dept_it' && (u.departmentId === 'dept_it' || u.departmentName?.toLowerCase().includes('information technology'))))
  );
  const totalTeachers = departmentTeachers.length > 0 ? departmentTeachers.length : departmentObj.facultyCount || 12;

  // Resolve Department Subjects
  const departmentSubjects = SUBJECTS.filter(
    (s) =>
      s.departmentId === deptId ||
      (deptId === 'dept_it' && (s.departmentId === 'dept_it' || s.departmentId === 'dept_cs'))
  );

  // Resolve Department Attendance Records
  const departmentAttendanceRecords = attendanceRecords.filter(
    (r) =>
      r.departmentId === deptId ||
      (deptId === 'dept_it' && (r.departmentId === 'dept_it' || r.departmentId === 'dept_cs'))
  );

  // Calculate Overall Department Attendance Percentage
  const allDeptEntries = departmentAttendanceRecords.flatMap((r) => r.studentEntries || []);
  const totalDeptPresent = allDeptEntries.filter((e) => e.status === 'present').length;
  const avgAttendancePct =
    allDeptEntries.length > 0
      ? Math.round((totalDeptPresent / allDeptEntries.length) * 1000) / 10
      : 84.2;

  // Per-student attendance health for low attendance warnings (<75%)
  const studentStatsMap: Record<string, { name: string; sem: number; total: number; present: number; enrollmentNo?: string }> = {};
  departmentAttendanceRecords.forEach((rec) => {
    (rec.studentEntries || []).forEach((entry) => {
      if (!studentStatsMap[entry.studentId]) {
        const studentUser = departmentStudents.find((s) => s.id === entry.studentId);
        studentStatsMap[entry.studentId] = {
          name: entry.studentName,
          sem: rec.semester || studentUser?.semester || 3,
          total: 0,
          present: 0,
          enrollmentNo: studentUser?.enrollmentNo,
        };
      }
      studentStatsMap[entry.studentId].total += 1;
      if (entry.status === 'present') {
        studentStatsMap[entry.studentId].present += 1;
      }
    });
  });

  const lowAttendanceStudents = Object.entries(studentStatsMap)
    .map(([id, data]) => {
      const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 100;
      return { id, name: data.name, sem: data.sem, pct, total: data.total, enrollmentNo: data.enrollmentNo };
    })
    .filter((s) => s.pct < 75)
    .sort((a, b) => a.pct - b.pct);

  // Pending Attendance Correction Requests
  const pendingRequests = (editRequests || []).filter((r) => r.status === 'pending');

  // Departmental Administrative Pending Tasks
  const staticPendingTasks = [
    {
      id: 'task_cia_1',
      title: 'Continuous Internal Assessment (CIA-I) Marks Endorsement',
      type: 'Exam & Assessment',
      dueDate: '2026-08-15',
      priority: 'high',
      description: 'Review and verify midterm assessment scores submitted by course faculty prior to portal upload.',
    },
    {
      id: 'task_syl_2',
      title: 'Semester 4 Syllabus Progress Audit',
      type: 'Academic Audit',
      dueDate: '2026-08-18',
      priority: 'medium',
      description: 'Audit unit completion percentages for Database Systems and Java OOP modules.',
    },
    {
      id: 'task_leave_3',
      title: 'Student Medical Duty Leave Applications (3 Pending)',
      type: 'Student Welfare',
      dueDate: '2026-08-14',
      priority: 'medium',
      description: 'Review leave certificates submitted by Semester 3 students for industrial visit attendance credit.',
    },
  ];

  const activePendingTasks = staticPendingTasks.filter((t) => !completedTaskIds.includes(t.id));

  // Recent Departmental Activity Logs Stream
  const activityLogsList = [
    ...departmentAttendanceRecords.slice(0, 5).map((r) => ({
      id: `act_att_${r.id}`,
      type: 'attendance' as const,
      title: `Attendance Marked: ${r.subjectName}`,
      desc: `Faculty ${r.teacherName} recorded attendance (${r.studentEntries.filter((e) => e.status === 'present').length}/${r.studentEntries.length} Present)`,
      time: r.submittedAt || r.date,
      badge: `${r.semester ? `Sem ${r.semester}` : 'Class'}`,
    })),
    ...notices
      .filter((n) => !n.departmentId || n.departmentId === deptId || n.departmentId === 'dept_it')
      .slice(0, 3)
      .map((n) => ({
        id: `act_not_${n.id}`,
        type: 'notice' as const,
        title: `Notice Published: ${n.title}`,
        desc: `Posted by ${n.postedBy} • ${n.content.slice(0, 80)}...`,
        time: n.date,
        badge: n.category || 'Announcement',
      })),
    ...auditLogs
      .filter((a) => a.details.toLowerCase().includes('attendance') || a.details.toLowerCase().includes('department') || a.details.toLowerCase().includes('hod'))
      .slice(0, 3)
      .map((a) => ({
        id: `act_aud_${a.id}`,
        type: 'audit' as const,
        title: `${a.action}`,
        desc: `User: ${a.userName} (${a.role}) — ${a.details}`,
        time: a.timestamp,
        badge: 'Audit Log',
      })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const filteredActivities = activityLogsList.filter((a) => {
    if (activityFilter === 'all') return true;
    return a.type === activityFilter;
  });

  // Filtered Students List
  const filteredStudents = departmentStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesSem = studentSemFilter === 'all' || String(s.semester) === studentSemFilter;
    return matchesSearch && matchesSem;
  });

  // Filtered Faculty List
  const filteredTeachers = departmentTeachers.filter((t) => {
    return (
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.designation && t.designation.toLowerCase().includes(teacherSearch.toLowerCase())) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner for in-app feedback */}
      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 hover:bg-emerald-750 rounded-lg text-emerald-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner / HOD Workspace Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Head of Department Control Center
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <Calendar className="w-3 h-3 text-amber-400" />
                {fullFormatted}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight text-white flex items-center gap-2">
              Department of {departmentObj.name}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/80 mt-1">
              {departmentObj.degreeFullName} ({departmentObj.degreeCode}) • HOD: <span className="font-bold text-white">{user.name}</span> (ID: <span className="font-mono text-amber-300">{user.employeeId || 'LBU-HOD-101'}</span>)
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-950/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-xl shrink-0">
            <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0 ring-2 ring-amber-500/40">
              <img
                src={LOKBHARTI_LOGO}
                alt="Lokbharti University Seal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-black tracking-wide uppercase text-white">Lokbharti University</div>
              <div className="text-[11px] text-amber-300 font-medium">{departmentObj.subDepartmentName || 'Department Workspace'}</div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5 font-bold">Grade A+ Accredited</div>
            </div>
          </div>
        </div>

        {/* HOD Direct Command Action Bar */}
        <div className="mt-5 pt-4 border-t border-amber-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNoticeModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>

            <button
              onClick={() => setShowAllocationModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-500/30"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Allocate Subject</span>
            </button>

            <button
              onClick={() => setShowRequestsModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-500/30 relative"
              id="hod-student-requests-btn"
              title="Review Active and Pending Student Petitions"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Requests</span>
              {pendingStudentRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse">
                  {pendingStudentRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-500/40 relative shadow-sm"
              id="hod-student-request-history-btn"
              title="View History of all Approved and Rejected Student Requests"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Request History</span>
              {respondedStudentRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-600 text-white font-black">
                  {respondedStudentRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-500/30"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Dept Settings</span>
            </button>
          </div>

          <div className="text-[11px] font-medium text-amber-200/80 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>HOD Department Scope Active</span>
          </div>
        </div>

        {/* Quick Sub-Navigation Tabs */}
        <div className="mt-4 pt-4 border-t border-amber-800/40 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Department Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'students'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>2. Total Students ({totalStudents})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('teachers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'teachers'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. Faculty ({totalTeachers})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'attendance'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>4. Attendance ({avgAttendancePct}%)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('performance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'performance'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>5. Performance & Weak Students</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>6. Pending ({pendingRequests.length + activePendingTasks.length})</span>
            {pendingRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('activities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'activities'
                ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>7. Activities & Stream</span>
          </button>
        </div>
      </div>

      {/* 6 Core Quick High-Level Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveSubTab('overview')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">{departmentObj.code}</div>
          <p className="text-[10px] text-amber-600 font-semibold mt-1">Overview & Info</p>
        </div>

        <div
          onClick={() => setActiveSubTab('students')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Students</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalStudents}</div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Enrolled & Active</p>
        </div>

        <div
          onClick={() => setActiveSubTab('teachers')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Teachers</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalTeachers}</div>
          <p className="text-[10px] text-blue-600 font-semibold mt-1">Faculty & Staff</p>
        </div>

        <div
          onClick={() => setActiveSubTab('attendance')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/50 transition-all cursor-pointer"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dept Attendance</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{avgAttendancePct}%</div>
          <p className="text-[10px] text-slate-500 mt-1">Above target threshold</p>
        </div>

        <div
          onClick={() => setActiveSubTab('pending')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-500/40 shadow-sm hover:border-amber-500 transition-all cursor-pointer bg-amber-50/20 dark:bg-amber-950/10"
        >
          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Tasks</span>
            {pendingRequests.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {pendingRequests.length + activePendingTasks.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{pendingRequests.length} Attendance Requests</p>
        </div>

        <div
          onClick={() => setActiveSubTab('activities')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-all cursor-pointer"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recent Logs</div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">{activityLogsList.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Activity Stream</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: OVERALL DEPARTMENT OVERVIEW */}
      {/* ========================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    1. Overall Department Overview
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive organizational structure, degree details, and key administrative contacts
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectTab('directory')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
              >
                <span>View Full University Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Department Info Details Card */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-md">
                      {departmentObj.degreeCode} • Code: {departmentObj.code}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                      Department of {departmentObj.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Academic Year 2026-27 Active
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {departmentObj.description ||
                    'Focuses on modern curriculum delivery, practical field work, continuous internal assessments, and industry/community aligned learning.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Degree Level</div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">{departmentObj.degreeFullName}</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Active Semesters</div>
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Semesters 1 - 6</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Active Subjects</div>
                    <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{departmentSubjects.length || 8} Courses</div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Accreditation</div>
                    <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">Grade A+ (NAAC)</div>
                  </div>
                </div>
              </div>

              {/* HOD Officer Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-slate-50 to-amber-500/5 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 p-5 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Head of Department
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{user.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.designation || 'HOD & Senior Faculty'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Employee ID: <strong className="text-slate-900 dark:text-white font-mono">{user.employeeId || 'LBU-HOD-101'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{user.phone || '+91 98250 44556'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTab('timetable')}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Department Timetable</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: TOTAL STUDENTS (IN THE DEPARTMENT) */}
      {/* ========================================================= */}
      {(activeSubTab === 'overview' || activeSubTab === 'students') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    2. Total Department Students
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                    {totalStudents} Enrolled
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Student count and active academic semester distribution for {departmentObj.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all w-44 sm:w-56"
                />
              </div>

              <select
                value={studentSemFilter}
                onChange={(e) => setStudentSemFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
              </select>

              <button
                onClick={() => onSelectTab('students')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Manage All Students</span>
              </button>
            </div>
          </div>

          {/* Semester Distribution Pill Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((semNum) => {
              const count = semesterBreakdown[semNum] || (semNum === 3 ? Math.round(totalStudents * 0.4) : Math.round(totalStudents * 0.12));
              return (
                <div
                  key={semNum}
                  onClick={() => {
                    setActiveSubTab('students');
                    setStudentSemFilter(String(semNum));
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    studentSemFilter === String(semNum)
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Semester {semNum}</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{count}</div>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Students</p>
                </div>
              );
            })}
          </div>

          {/* Students Directory Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 sticky top-0 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Enrollment No</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No students found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.slice(0, 10).map((st) => {
                      const stStat = studentStatsMap[st.id];
                      const pct = stStat && stStat.total > 0 ? Math.round((stStat.present / stStat.total) * 100) : 88;
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-center shrink-0">
                              {st.name.charAt(0)}
                            </div>
                            <span>{st.name}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{st.enrollmentNo || '25221103001'}</td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Sem {st.semester || 3}</td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                                pct >= 75
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {pct}% Attendance
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredStudents.length > 10 && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 text-center text-xs text-slate-500 font-semibold border-t border-slate-200 dark:border-slate-800">
                Showing 10 of {filteredStudents.length} department students. Search or filter by semester to refine.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: TOTAL TEACHERS (IN THE DEPARTMENT) */}
      {/* ========================================================= */}
      {(activeSubTab === 'overview' || activeSubTab === 'teachers') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    3. Total Department Faculty & Teachers
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs">
                    {totalTeachers} Teachers
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Teaching staff, professors, and subject instructors assigned to {departmentObj.name}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all w-52 sm:w-64"
              />
            </div>
          </div>

          {/* Department Faculty Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((prof) => (
              <div
                key={prof.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500/50 transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md overflow-hidden shrink-0">
                    {prof.avatar ? (
                      <img src={prof.avatar} alt={prof.name} className="w-full h-full object-cover" />
                    ) : (
                      prof.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{prof.name}</span>
                      {prof.role === 'hod' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase">
                          HOD
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{prof.designation || 'Assistant Professor'}</p>
                    <div className="text-[10px] text-blue-600 font-mono font-bold mt-0.5">ID: {prof.employeeId || 'LBU-FAC-100'}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{prof.phone || '+91 98250 12001'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {prof.name.includes('Rishu')
                        ? 'Software Eng. / Database Systems'
                        : prof.name.includes('Mehta')
                        ? 'Object-Oriented Programming (Java)'
                        : 'Department Modules'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: ATTENDANCE SUMMARY */}
      {/* ========================================================= */}
      {(activeSubTab === 'overview' || activeSubTab === 'attendance') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  4. Department Attendance Summary
                </h2>
                <p className="text-xs text-slate-500">
                  Overall department percentage, subject breakdown, and low attendance student warnings
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('attendance')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Open Smart Attendance Module</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Gauge Bar Card */}
            <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-purple-800/40 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-800">
                  Overall Aggregate
                </span>
                <div className="text-4xl font-black text-emerald-400 mt-3">{avgAttendancePct}%</div>
                <p className="text-xs text-purple-200 mt-1">Average Attendance Rate across all courses</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-purple-200 font-semibold">
                  <span>Target Threshold: 75.0%</span>
                  <span className="text-emerald-400 font-bold">+{(avgAttendancePct - 75).toFixed(1)}% Safe Margin</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full" style={{ width: `${avgAttendancePct}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-purple-800/40 text-[11px] text-purple-300 flex items-center justify-between">
                <span>Total Classes Conducted: <strong className="text-white">{departmentAttendanceRecords.length || 32}</strong></span>
                <span>Active Term</span>
              </div>
            </div>

            {/* Subject-Wise Breakdown Bars */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>Subject-Wise Attendance Rate</span>
                <span className="text-slate-500 text-[11px] normal-case font-normal">{departmentSubjects.length || 4} Subjects</span>
              </h3>

              <div className="space-y-3 pt-1">
                {(departmentSubjects.length > 0 ? departmentSubjects : SUBJECTS.slice(0, 4)).map((sub) => {
                  const records = departmentAttendanceRecords.filter(
                    (r) => r.subjectId === sub.id || (r.subjectName && r.subjectName.toLowerCase().includes(sub.name.toLowerCase()))
                  );
                  const entries = records.flatMap((r) => r.studentEntries || []);
                  const present = entries.filter((e) => e.status === 'present').length;
                  const pct = entries.length > 0 ? Math.round((present / entries.length) * 100) : 84;

                  return (
                    <div key={sub.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {sub.code} - {sub.name}
                        </span>
                        <span className={`font-black ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Low Attendance Warning Panel (<75%) */}
          {lowAttendanceStudents.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Low Attendance Warnings (&lt;75% Threshold) — {lowAttendanceStudents.length} Students At Risk
                  </h3>
                </div>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Action Required by HOD</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowAttendanceStudents.slice(0, 6).map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">{st.name}</div>
                      <div className="text-[10px] text-slate-500">Sem {st.sem} • {st.enrollmentNo || 'Reg #25221'}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-black text-xs bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {st.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: PENDING TASKS & REQUESTS */}
      {/* ========================================================= */}
      {(activeSubTab === 'overview' || activeSubTab === 'pending') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    5. Pending Department Tasks & Requests
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-xs">
                    {pendingRequests.length + activePendingTasks.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Faculty attendance edit approvals and administrative departmental review items
                </p>
              </div>
            </div>
          </div>

          {/* Pending Attendance Correction Requests */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Faculty Attendance Correction Requests ({pendingRequests.length})</span>
            </h3>

            {pendingRequests.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                No pending attendance correction requests from faculty.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {req.subjectName} ({req.date})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Sem {req.semester || 4}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Faculty: <strong className="text-slate-800 dark:text-slate-200">{req.teacherName}</strong> • Reason: {req.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onApproveEdit(req.id, 'approved', 'Approved by HOD')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onApproveEdit(req.id, 'rejected', 'Rejected by HOD')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Leave & Petitions Queue for HOD */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>
                  Student Petitions & Requests ({pendingStudentRequestsCount} Pending
                  {pendingAdminReadOnlyCount > 0 ? ` • ${pendingAdminReadOnlyCount} Admin Read-Only` : ''})
                </span>
              </h3>
              <button
                onClick={() => setShowRequestsModal(true)}
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                <span>View Full Desk</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {deptStudentRequests.filter((r) => r.status === 'Pending').length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                All departmental student requests have been processed or archived.
              </div>
            ) : (
              <div className="space-y-3">
                {deptStudentRequests
                  .filter((r) => r.status === 'Pending')
                  .slice(0, 4)
                  .map((req) => {
                    const isAdminDirected = req.recipientRole === 'admin';
                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isAdminDirected
                            ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {req.studentName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Sem {req.semester || 5}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{req.enrollmentNo}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              {formatRequestCategory(req.requestType)}
                            </span>
                            {isAdminDirected ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center gap-1 border border-purple-300 dark:border-purple-800">
                                <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span>To: Admin [Read-Only]</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                To: HOD [Actionable]
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{req.subject}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{req.reason}</p>
                          <div className="text-[10px] text-slate-400">
                            Duration: {req.days || `${req.startDate} to ${req.endDate}`} • Submitted: {req.submittedAt}
                          </div>
                        </div>

                        {isAdminDirected ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold text-[11px] border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 shadow-sm">
                              <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Read-Only Mode</span>
                            </span>
                            <button
                              onClick={() => setInspectingRequest(req)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                              title="Inspect request details in Read-Only mode"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-500" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleProcessRequest(req.id, 'Approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleProcessRequest(req.id, 'Rejected')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Departmental Administrative Review Tasks */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Department Administrative Action Items ({activePendingTasks.length})</span>
            </h3>

            {activePendingTasks.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                All administrative tasks completed!
              </div>
            ) : (
              <div className="space-y-2">
                {activePendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{task.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {task.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                    </div>

                    <button
                      onClick={() => setCompletedTaskIds((prev) => [...prev, task.id])}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-white transition-all shrink-0"
                    >
                      Mark Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5 (NEW): ACADEMIC PERFORMANCE & WEAK STUDENT MONITOR */}
      {/* ========================================================= */}
      {(activeSubTab === 'overview' || activeSubTab === 'performance') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Academic Performance & Weak Student Analytics
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-xs">
                    HOD Monitoring
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Track SGPA distribution, internal exam performance, and flag students requiring academic intervention
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('results')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              <span>View Department Results & Marksheets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department Avg SGPA</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">7.84 / 10</div>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">↑ +0.32 vs Last Semester</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pass Percentage</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">92.5%</div>
              <p className="text-[11px] text-slate-500 mt-1">Midterm CIA Examinations</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weak Students (&lt; 6.0 SGPA / Low Att.)</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">4 Flagged</div>
              <p className="text-[11px] text-amber-600 font-bold mt-1">Academic Mentoring Scheduled</p>
            </div>
          </div>

          {/* Flagged Weak Students Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Students Identified for Academic Mentoring</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">SGPA</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Internal Test (Avg)</th>
                    <th className="p-3 text-right">HOD Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      Manthan Solanki
                      <div className="text-[10px] text-slate-400 font-mono font-normal">24222201016</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Sem 5</td>
                    <td className="p-3 font-black text-rose-600">5.42 / 10</td>
                    <td className="p-3 font-bold text-rose-600">62.5%</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-mono">14.5 / 30</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => triggerActionFeedback('Probation Advisory notice generated and dispatched to guardian for Manthan Solanki.')}
                        className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-200"
                      >
                        Issue Advisory
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      Arav Sharma
                      <div className="text-[10px] text-slate-400 font-mono font-normal">2024CS0401</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Sem 3</td>
                    <td className="p-3 font-black text-rose-600">5.80 / 10</td>
                    <td className="p-3 font-bold text-rose-600">68.0%</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-mono">16.0 / 30</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => triggerActionFeedback('Faculty mentor successfully assigned for Arav Sharma.')}
                        className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-200"
                      >
                        Assign Mentor
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: RECENT ACTIVITIES */}
      {/* ========================================================= */}
      {(activeSubTab === 'overview' || activeSubTab === 'activities') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  7. Recent Department Activities & Audit Stream
                </h2>
                <p className="text-xs text-slate-500">
                  Live departmental event feed, notice releases, and attendance submission history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityFilter === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActivityFilter('attendance')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityFilter === 'attendance'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActivityFilter('notice')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityFilter === 'notice'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Notices
              </button>
              <button
                onClick={() => setActivityFilter('audit')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activityFilter === 'audit'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Audit Logs
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activities matching filter.</p>
            ) : (
              filteredActivities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {act.type === 'attendance' ? (
                        <BarChart2 className="w-4 h-4 text-emerald-500" />
                      ) : act.type === 'notice' ? (
                        <Bell className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-cyan-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{act.title}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PUBLISH DEPARTMENT NOTICE */}
      {/* ========================================================= */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Bell className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Publish Department Notice
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowNoticeModal(false);
                  setNoticeSuccessMsg(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {noticeSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{noticeSuccessMsg}</div>
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    setNoticeSuccessMsg(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!noticeTitle.trim() || !noticeContent.trim()) return;
                  setNoticeSuccessMsg(`Notice '${noticeTitle}' published successfully to ${noticeAudience}!`);
                  setNoticeTitle('');
                  setNoticeContent('');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Notice Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Midterm Exam Schedule & Room Allocations"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Category</label>
                    <select
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Exam & Quiz">Exam & Quiz</option>
                      <option value="Event">Event</option>
                      <option value="Urgent Directive">Urgent Directive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Target Audience</label>
                    <select
                      value={noticeAudience}
                      onChange={(e) => setNoticeAudience(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="All Department">All Department</option>
                      <option value="Department Students">Department Students</option>
                      <option value="Department Teachers">Department Teachers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Notice Description / Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter official departmental notice message details..."
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoticeModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all shadow-md"
                  >
                    Broadcast Notice
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ALLOCATE SUBJECT TO TEACHER */}
      {/* ========================================================= */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Faculty Subject & Workload Allocation
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAllocationModal(false);
                  setAllocationSuccessMsg(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {allocationSuccessMsg ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto" />
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300">{allocationSuccessMsg}</div>
                <button
                  onClick={() => {
                    setShowAllocationModal(false);
                    setAllocationSuccessMsg(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedProfId || !selectedSubjId) {
                    alert('Please select both faculty member and department subject.');
                    return;
                  }
                  const prof = departmentTeachers.find((t) => t.id === selectedProfId);
                  const subj = departmentSubjects.find((s) => s.id === selectedSubjId);
                  setAllocationSuccessMsg(
                    `Subject '${subj?.name || 'Selected Module'}' allocated to ${prof?.name || 'Faculty'} (${allocatedWeeklyHours} Hrs/Week)!`
                  );
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Select Faculty Member</label>
                  <select
                    required
                    value={selectedProfId}
                    onChange={(e) => setSelectedProfId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">-- Choose Faculty --</option>
                    {departmentTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.designation || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Select Department Subject Module</label>
                  <select
                    required
                    value={selectedSubjId}
                    onChange={(e) => setSelectedSubjId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">-- Choose Subject Module --</option>
                    {(departmentSubjects.length > 0 ? departmentSubjects : SUBJECTS.slice(0, 5)).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} (4 Credits)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Weekly Teaching Hours</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={allocatedWeeklyHours}
                      onChange={(e) => setAllocatedWeeklyHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Target Semester</label>
                    <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none">
                      <option value="3">Semester 3</option>
                      <option value="5">Semester 5</option>
                      <option value="1">Semester 1</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllocationModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md"
                  >
                    Save Subject Allocation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: REVIEW STUDENT REQUESTS (WITH READ-ONLY FOR ADMIN REQUESTS) */}
      {/* ========================================================= */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2 text-amber-600">
                <FileText className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Departmental Student Petitions & Requests
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review academic leaves, duty requests, and monitor administrative petitions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRequestsModal(false);
                    setShowHistoryModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 border border-amber-500/30 shadow-sm"
                  title="View History of Approved and Rejected Requests"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Request History ({respondedStudentRequestsCount})</span>
                </button>

                {activeStudentRequests.some((r) => r.status !== 'Pending') && (
                  <button
                    onClick={handleClearAllProcessed}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800/60 shadow-sm"
                    title="Clear approved and rejected requests from active queue"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Clear Processed</span>
                  </button>
                )}

                <button
                  onClick={() => setShowRequestsModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Read-Only Policy Guidance Banner */}
            <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Departmental Governance & Read-Only Policy</span>
              </div>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                • <strong>Direct HOD Requests:</strong> Full authority to approve with departmental stamp or reject.<br />
                • <strong>Central Admin Petitions:</strong> The HOD is kept in <strong>Read-Only Mode</strong> to monitor student status without overriding university administration decisions.
              </p>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  onClick={() => setRequestsRoleFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    requestsRoleFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({activeStudentRequests.length})
                </button>
                <button
                  onClick={() => setRequestsRoleFilter('hod')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    requestsRoleFilter === 'hod'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  To HOD ({activeStudentRequests.filter((r) => !r.recipientRole || r.recipientRole === 'hod').length})
                </button>
                <button
                  onClick={() => setRequestsRoleFilter('admin')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    requestsRoleFilter === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin [Read-Only] ({activeStudentRequests.filter((r) => r.recipientRole === 'admin').length})</span>
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={requestsSearch}
                  onChange={(e) => setRequestsSearch(e.target.value)}
                  placeholder="Search student, enrollment, subject..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-3">
              {activeStudentRequests
                .filter((req) => {
                  if (requestsRoleFilter === 'hod' && req.recipientRole === 'admin') return false;
                  if (requestsRoleFilter === 'admin' && req.recipientRole !== 'admin') return false;
                  if (requestsSearch.trim()) {
                    const q = requestsSearch.toLowerCase();
                    const matchName = req.studentName.toLowerCase().includes(q);
                    const matchEnroll = req.enrollmentNo.toLowerCase().includes(q);
                    const matchSubject = (req.subject || '').toLowerCase().includes(q);
                    const matchReason = (req.reason || '').toLowerCase().includes(q);
                    if (!matchName && !matchEnroll && !matchSubject && !matchReason) return false;
                  }
                  return true;
                })
                .length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs font-medium space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">No Matching Student Requests</p>
                    <p className="text-slate-500 mt-1">All requests in this category have been processed or cleared.</p>
                  </div>
                  {respondedStudentRequestsCount > 0 && (
                    <button
                      onClick={() => {
                        setShowRequestsModal(false);
                        setShowHistoryModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-md mt-2"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Open Student Request History ({respondedStudentRequestsCount})</span>
                    </button>
                  )}
                </div>
              ) : (
                activeStudentRequests
                  .filter((req) => {
                    if (requestsRoleFilter === 'hod' && req.recipientRole === 'admin') return false;
                    if (requestsRoleFilter === 'admin' && req.recipientRole !== 'admin') return false;
                    if (requestsSearch.trim()) {
                      const q = requestsSearch.toLowerCase();
                      const matchName = req.studentName.toLowerCase().includes(q);
                      const matchEnroll = req.enrollmentNo.toLowerCase().includes(q);
                      const matchSubject = (req.subject || '').toLowerCase().includes(q);
                      const matchReason = (req.reason || '').toLowerCase().includes(q);
                      if (!matchName && !matchEnroll && !matchSubject && !matchReason) return false;
                    }
                    return true;
                  })
                  .map((req) => {
                    const isAdminDirected = req.recipientRole === 'admin';
                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border space-y-3 transition-all ${
                          isAdminDirected
                            ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50'
                            : req.status === 'Approved'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{req.studentName}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                Sem {req.semester || 5}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{req.enrollmentNo}</span>
                              {isAdminDirected ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center gap-1 border border-purple-300 dark:border-purple-800">
                                  <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                  <span>To: Central Admin [Read-Only for HOD]</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                  To: HOD [Actionable]
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              {formatRequestCategory(req.requestType)} {req.subject ? `— ${req.subject}` : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                                req.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : isAdminDirected
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                              {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                              {req.status === 'Pending' && isAdminDirected && <Lock className="w-3 h-3" />}
                              {req.status}
                            </span>

                            {req.status !== 'Pending' && (
                              <button
                                onClick={() => handleDismissRequest(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-300 text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 border border-rose-200 dark:border-rose-800"
                                title="Clear this request from active view"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                <span>Clear</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">{req.reason}</p>

                        <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 gap-1">
                          <span className="text-slate-400 font-mono">Attachment: {req.attachment || 'None'}</span>
                          <span className="text-slate-400">
                            Duration: {req.days || `${req.startDate || ''} - ${req.endDate || ''}`} • Submitted: {req.submittedAt}
                          </span>
                        </div>

                        {/* Action Buttons or Read-Only Mode Panel */}
                        {isAdminDirected ? (
                          req.status === 'Pending' ? (
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-purple-200/60 dark:border-purple-800/40 bg-purple-50/60 dark:bg-purple-950/30 -mx-4 -mb-4 p-3 rounded-b-2xl">
                              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-xs">
                                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span>Administrative Oversight: Read-Only Mode (Awaiting Admin Decision)</span>
                              </div>
                              <button
                                onClick={() => setInspectingRequest(req)}
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-700 shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                              >
                                <Eye className="w-3.5 h-3.5 text-purple-500" />
                                <span>Inspect Application</span>
                              </button>
                            </div>
                          ) : (
                            <div className="pt-2 flex items-center justify-between border-t border-purple-200/60 dark:border-purple-800/40 text-[10px] bg-purple-50/40 dark:bg-purple-950/20 -mx-4 -mb-4 p-3 rounded-b-2xl">
                              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                <span>
                                  Admin Decision: <strong>{req.status}</strong> by <strong>{req.reviewedBy || 'Administration'}</strong> • "{req.reviewComment}"
                                </span>
                              </span>
                              <button
                                onClick={() => handleDismissRequest(req.id)}
                                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove from Active</span>
                              </button>
                            </div>
                          )
                        ) : req.status === 'Pending' ? (
                          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700/60">
                            <button
                              onClick={() => handleProcessRequest(req.id, 'Approved', 'Approved with Official HOD Seal & Stamp')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve with HOD Stamp</span>
                            </button>
                            <button
                              onClick={() => handleProcessRequest(req.id, 'Rejected', 'Declined upon HOD review')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject Request</span>
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/40 text-[10px]">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>
                                Response recorded by <strong>{req.reviewedBy || 'HOD'}</strong> • Stored in Request History
                              </span>
                            </span>
                            <button
                              onClick={() => handleDismissRequest(req.id)}
                              className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove now</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STUDENT REQUEST HISTORY (APPROVED & REJECTED ONLY) */}
      {/* ========================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    Student Request History
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-xs">
                      {respondedStudentRequests.length} Responded
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Archive of all approved and rejected student petitions for Department of {departmentObj.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setShowRequestsModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Active Requests ({pendingStudentRequestsCount})</span>
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Responded</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{respondedStudentRequests.length}</div>
                <p className="text-[10px] text-slate-400">All archived decisions</p>
              </div>
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Approved Requests</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {respondedStudentRequests.filter((r) => r.status === 'Approved').length}
                </div>
                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Sanctioned decisions</p>
              </div>
              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-200 dark:border-rose-900/50">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Rejected Requests</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {respondedStudentRequests.filter((r) => r.status === 'Rejected').length}
                </div>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Declined upon review</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  onClick={() => setHistoryStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyStatusFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({respondedStudentRequests.length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('Approved')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyStatusFilter === 'Approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  Approved ({respondedStudentRequests.filter((r) => r.status === 'Approved').length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('Rejected')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyStatusFilter === 'Rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                  }`}
                >
                  Rejected ({respondedStudentRequests.filter((r) => r.status === 'Rejected').length})
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by student, enrollment, subject..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <select
                  value={historyRecipientFilter}
                  onChange={(e) => setHistoryRecipientFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  <option value="all">All Recipients</option>
                  <option value="hod">HOD Sanctions</option>
                  <option value="admin">Admin Decisions [Read-Only]</option>
                </select>

                <select
                  value={historySemFilter}
                  onChange={(e) => setHistorySemFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                </select>
              </div>
            </div>

            {/* Responded Requests List */}
            <div className="space-y-3 pt-1">
              {respondedStudentRequests
                .filter((req) => {
                  if (historyStatusFilter !== 'all' && req.status !== historyStatusFilter) return false;
                  if (historyRecipientFilter === 'hod' && req.recipientRole === 'admin') return false;
                  if (historyRecipientFilter === 'admin' && req.recipientRole !== 'admin') return false;
                  if (historySemFilter !== 'all' && String(req.semester) !== historySemFilter) return false;
                  if (historySearch.trim()) {
                    const q = historySearch.toLowerCase();
                    const matchName = req.studentName.toLowerCase().includes(q);
                    const matchEnroll = req.enrollmentNo.toLowerCase().includes(q);
                    const matchSubject = (req.subject || '').toLowerCase().includes(q);
                    const matchReason = (req.reason || '').toLowerCase().includes(q);
                    const matchReviewer = (req.reviewedBy || '').toLowerCase().includes(q);
                    if (!matchName && !matchEnroll && !matchSubject && !matchReason && !matchReviewer) return false;
                  }
                  return true;
                })
                .length === 0 ? (
                <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs font-medium space-y-2">
                  <Archive className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No History Records Found</p>
                  <p>
                    {respondedStudentRequests.length === 0
                      ? 'No student requests have been approved or rejected yet. Once responded to, they will automatically be stored here.'
                      : 'No records match the current filter or search criteria.'}
                  </p>
                </div>
              ) : (
                respondedStudentRequests
                  .filter((req) => {
                    if (historyStatusFilter !== 'all' && req.status !== historyStatusFilter) return false;
                    if (historyRecipientFilter === 'hod' && req.recipientRole === 'admin') return false;
                    if (historyRecipientFilter === 'admin' && req.recipientRole !== 'admin') return false;
                    if (historySemFilter !== 'all' && String(req.semester) !== historySemFilter) return false;
                    if (historySearch.trim()) {
                      const q = historySearch.toLowerCase();
                      const matchName = req.studentName.toLowerCase().includes(q);
                      const matchEnroll = req.enrollmentNo.toLowerCase().includes(q);
                      const matchSubject = (req.subject || '').toLowerCase().includes(q);
                      const matchReason = (req.reason || '').toLowerCase().includes(q);
                      const matchReviewer = (req.reviewedBy || '').toLowerCase().includes(q);
                      if (!matchName && !matchEnroll && !matchSubject && !matchReason && !matchReviewer) return false;
                    }
                    return true;
                  })
                  .map((req) => {
                    const isAdminDirected = req.recipientRole === 'admin';
                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border space-y-3 transition-all ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{req.studentName}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                Sem {req.semester || 5}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{req.enrollmentNo}</span>
                              {isAdminDirected ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-purple-600" />
                                  <span>Admin Jurisdiction [Read-Only Archive]</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                  To: HOD [Departmental Action]
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              {formatRequestCategory(req.requestType)} — {req.subject || 'Student Petition Application'}
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 self-start sm:self-auto ${
                              req.status === 'Approved'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-rose-600 text-white shadow-sm'
                            }`}
                          >
                            {req.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {req.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold text-slate-900 dark:text-white">Student Reason: </span>
                          {req.reason}
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 gap-2">
                          <span>Duration: <strong>{req.days || `${req.startDate || ''} to ${req.endDate || ''}`}</strong></span>
                          <span>Attachment: <strong className="font-mono text-amber-600 dark:text-amber-400">{req.attachment || 'None'}</strong></span>
                          <span>Submitted: <strong>{req.submittedAt}</strong></span>
                        </div>

                        {/* Official Sanction & Decision Panel */}
                        <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                              <span>Official Decision by: <strong>{req.reviewedBy || (isAdminDirected ? 'Central Administration' : user.name || 'Head of Department')}</strong></span>
                            </span>
                            <span className="text-slate-400">
                              {req.processedAt ? new Date(req.processedAt).toLocaleString() : 'Recorded'}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                            "{req.reviewComment || (req.status === 'Approved' ? 'Approved with Official Seal' : 'Declined upon review')}"
                          </p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: READ-ONLY INSPECTION DIALOG (FOR ADMIN-DIRECTED STUDENT PETITIONS) */}
      {/* ========================================================= */}
      {inspectingRequest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-200 dark:border-purple-900/60 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Read-Only Application Details
                  </h3>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                    Student Petition to Central Administration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>HOD Read-Only Mode</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                This request was submitted directly to University Central Administration. You have full read-only visibility for student mentoring and departmental records. Actionable review buttons are strictly restricted to University Administrators.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{inspectingRequest.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Enrollment No</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{inspectingRequest.enrollmentNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Department & Semester</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {departmentObj.name} • Sem {inspectingRequest.semester || 5}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                  <span className={`inline-block font-extrabold uppercase text-[10px] px-2 py-0.5 rounded ${
                    inspectingRequest.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : inspectingRequest.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {inspectingRequest.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Subject</span>
                <div className="font-bold text-slate-900 dark:text-white p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  {inspectingRequest.subject}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Detailed Reason</span>
                <div className="text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {inspectingRequest.reason}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                <span>Duration: <strong>{inspectingRequest.days || `${inspectingRequest.startDate || ''} to ${inspectingRequest.endDate || ''}`}</strong></span>
                <span>Submitted: <strong>{inspectingRequest.submittedAt}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingRequest(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all shadow-md"
              >
                Close Read-Only View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DEPARTMENT SETTINGS */}
      {/* ========================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Sliders className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Department Configuration & Settings
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setSettingsSavedMsg(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settingsSavedMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{settingsSavedMsg}</div>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSettingsSavedMsg(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSettingsSavedMsg('Department settings updated successfully!');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={deptSettings.academicYear}
                    onChange={(e) => setDeptSettings({ ...deptSettings, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Active Term Semesters</label>
                  <input
                    type="text"
                    value={deptSettings.activeSemesters}
                    onChange={(e) => setDeptSettings({ ...deptSettings, activeSemesters: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Minimum Mandatory Attendance (%)</label>
                  <input
                    type="number"
                    value={deptSettings.minAttendancePct}
                    onChange={(e) => setDeptSettings({ ...deptSettings, minAttendancePct: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">HOD Official Office Hours</label>
                  <input
                    type="text"
                    value={deptSettings.hodOfficeHours}
                    onChange={(e) => setDeptSettings({ ...deptSettings, hodOfficeHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all shadow-md"
                  >
                    Save Dept Settings
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
