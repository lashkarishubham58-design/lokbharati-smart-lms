import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Database,
  ShieldCheck,
  Settings,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Calendar,
  UserPlus,
  UserCheck,
  Award,
  PlusCircle,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  History,
  Archive,
  FileCheck,
  Search
} from 'lucide-react';
import { User, UserRole, AuditLog, StudentRequest, formatRequestCategory, NotificationItem } from '../../types';
import { DEPARTMENTS, INITIAL_STUDENT_REQUESTS, getStoredUsers, addCustomUserRecord } from '../../data/mockDatabase';
import { api } from '../../services/api';
import { getCurrentDateAndDay } from '../../utils/dateUtils';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';
import { AdminTimetableManagementModal } from '../admin/AdminTimetableManagementModal';
import { generateAlphabetAvatar } from '../../utils/avatarUtils';

interface AdminDashboardProps {
  user: User;
  auditLogs: AuditLog[];
  studentRequests?: StudentRequest[];
  dashboardAction?: { modal?: string; targetId?: string; requestId?: string; timestamp: number } | null;
  onReviewStudentRequest?: (requestId: string, status: 'Approved' | 'Rejected', comment?: string) => void;
  onDismissStudentRequest?: (requestId: string) => void;
  onClearAllProcessedRequests?: (role?: 'hod' | 'admin', departmentId?: string) => void;
  onSelectTab: (tab: string, deptId?: string) => void;
  onAuditLog?: (action: string, details: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  auditLogs = [],
  studentRequests,
  dashboardAction,
  onReviewStudentRequest,
  onDismissStudentRequest,
  onClearAllProcessedRequests,
  onSelectTab,
  onAuditLog,
}) => {
  const { fullFormatted } = getCurrentDateAndDay();

  // Real-time Database Users State (synchronized simultaneously across ERP)
  const [allUsers, setAllUsers] = useState<User[]>(() => getStoredUsers());

  useEffect(() => {
    const handleUserUpdate = () => {
      setAllUsers(getStoredUsers());
    };
    window.addEventListener('lbu_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('lbu_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  const totalStudents = allUsers.filter((u) => u.role === 'student').length;
  const totalFaculty = allUsers.filter((u) => u.role === 'teacher' || u.role === 'hod').length;

  const getDeptAccurateCounts = (dept: (typeof DEPARTMENTS)[0]) => {
    const deptStudents = allUsers.filter(
      (u) =>
        u.role === 'student' &&
        (u.departmentId === dept.id ||
          u.departmentId === dept.code ||
          (dept.name && u.departmentName?.toLowerCase().includes(dept.name.toLowerCase())) ||
          (dept.code && u.departmentName?.toLowerCase().includes(dept.code.toLowerCase())))
    );
    const deptFaculty = allUsers.filter(
      (u) =>
        (u.role === 'teacher' || u.role === 'hod') &&
        (u.departmentId === dept.id ||
          u.departmentId === dept.code ||
          (dept.name && u.departmentName?.toLowerCase().includes(dept.name.toLowerCase())) ||
          (dept.code && u.departmentName?.toLowerCase().includes(dept.code.toLowerCase())))
    );
    return {
      studentCount: deptStudents.length > 0 ? deptStudents.length : dept.studentCount,
      facultyCount: deptFaculty.length > 0 ? deptFaculty.length : dept.facultyCount,
    };
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showAdminTimetableModal, setShowAdminTimetableModal] = useState(false);

  // Student Requests state fallback
  const [localRequests, setLocalRequests] = useState<StudentRequest[]>(() => {
    return safeStorageGet<StudentRequest[]>('lbu_student_requests', INITIAL_STUDENT_REQUESTS);
  });
  const allRequests = studentRequests && studentRequests.length > 0 ? studentRequests : localRequests;
  const adminRequests = allRequests.filter((r) => !r.recipientRole || r.recipientRole === 'admin' || r.recipientRole === 'hod');
  const activeAdminRequests = adminRequests.filter((r) => !r.isCleared);
  const respondedAdminRequests = adminRequests.filter((r) => r.status === 'Approved' || r.status === 'Rejected');
  const pendingAdminRequestsCount = adminRequests.filter((r) => r.status === 'Pending').length;
  const respondedAdminRequestsCount = respondedAdminRequests.length;

  const [showAdminRequestsModal, setShowAdminRequestsModal] = useState(false);
  const [showAdminHistoryModal, setShowAdminHistoryModal] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'Approved' | 'Rejected'>('all');
  const [historySearch, setHistorySearch] = useState('');

  // React to dashboardAction triggered by notification clicks
  useEffect(() => {
    if (dashboardAction?.modal === 'student_requests') {
      setShowAdminRequestsModal(true);
    } else if (dashboardAction?.modal === 'student_history') {
      setShowAdminHistoryModal(true);
    }
  }, [dashboardAction]);

  const handleAdminProcessRequest = (requestId: string, status: 'Approved' | 'Rejected', comment?: string) => {
    if (onReviewStudentRequest) {
      onReviewStudentRequest(requestId, status, comment);
    } else {
      const updated = localRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              processedAt: Date.now(),
              reviewedBy: user.name || 'System Administrator',
              reviewComment: comment || (status === 'Approved' ? 'Approved by University Administration' : 'Rejected by Administration'),
            }
          : r
      );
      setLocalRequests(updated);
      safeStorageSet('lbu_student_requests', updated);

      const targetReq = localRequests.find((r) => r.id === requestId);
      if (targetReq) {
        const studentNotif: NotificationItem = {
          id: `notif_st_${Date.now()}`,
          userId: targetReq.studentId,
          role: 'student',
          title: status === 'Approved' ? `✅ Request Approved: ${targetReq.subject}` : `❌ Request Rejected: ${targetReq.subject}`,
          message: `Your petition "${targetReq.subject}" (${formatRequestCategory(targetReq.requestType)}) has been ${status.toUpperCase()} by ${user.name || 'System Administrator'}.`,
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
  };

  const handleAdminDismissRequest = (requestId: string) => {
    if (onDismissStudentRequest) {
      onDismissStudentRequest(requestId);
    } else {
      const updated = localRequests.map((r) =>
        r.id === requestId ? { ...r, isCleared: true, clearedAt: Date.now() } : r
      );
      setLocalRequests(updated);
      safeStorageSet('lbu_student_requests', updated);
    }
    showToast('info', 'Request cleared from active queue and archived in Student Request History.');
  };

  const handleAdminClearAllProcessed = () => {
    if (onClearAllProcessedRequests) {
      onClearAllProcessedRequests('admin');
    } else {
      const updated = localRequests.map((r) => {
        if (r.status === 'Pending') return r;
        return { ...r, isCleared: true, clearedAt: Date.now() };
      });
      setLocalRequests(updated);
      safeStorageSet('lbu_student_requests', updated);
    }
    showToast('success', 'Cleared all processed requests. Only pending student requests remain visible.');
  };

  // Quick Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addRole, setAddRole] = useState<UserRole>('student');
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addDepartmentId, setAddDepartmentId] = useState(DEPARTMENTS[0]?.id || 'dept_it');
  const [addSemester, setAddSemester] = useState<number>(1);
  const [addCustomId, setAddCustomId] = useState('');
  const [addDesignation, setAddDesignation] = useState('');

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenAddModal = (role: UserRole) => {
    setAddRole(role);
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddDepartmentId(DEPARTMENTS[0]?.id || 'dept_it');
    setAddSemester(1);
    setAddCustomId('');
    if (role === 'student') setAddDesignation('Undergraduate Student');
    else if (role === 'teacher') setAddDesignation('Assistant Professor');
    else if (role === 'hod') setAddDesignation('Head of Department');
    else setAddDesignation('System Administrator');
    setAddModalOpen(true);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      showToast('error', 'Please provide a valid name and email address.');
      return;
    }

    const selectedDept = DEPARTMENTS.find((d) => d.id === addDepartmentId);
    const deptName = selectedDept ? selectedDept.name : 'Information Technology';

    const generatedEnrollment = addRole === 'student'
      ? (addCustomId.trim() || `2024CS${Math.floor(Math.random() * 8999 + 1000)}`)
      : undefined;

    const generatedEmployeeId = addRole !== 'student'
      ? (addCustomId.trim() || `LBU-FAC-${Math.floor(Math.random() * 899 + 100)}`)
      : undefined;

    const generatedId = addRole === 'student'
      ? (generatedEnrollment || `usr_st_${Date.now()}`)
      : (generatedEmployeeId || `usr_fac_${Date.now()}`);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: addName.trim(),
      email: addEmail.trim(),
      phone: addPhone.trim() || '+91 98250 11000',
      role: addRole,
      departmentId: addDepartmentId,
      departmentName: deptName,
      semester: addRole === 'student' ? Number(addSemester) : undefined,
      enrollmentNo: generatedEnrollment,
      employeeId: generatedEmployeeId,
      designation: addDesignation || (addRole === 'student' ? 'Undergraduate Student' : addRole === 'teacher' ? 'Assistant Professor' : 'Head of Department'),
      joiningDate: new Date().toISOString().split('T')[0],
      avatar: generateAlphabetAvatar(addName.trim(), addRole),
    };

    // Save and simultaneously notify all ERP modules
    addCustomUserRecord(newUser);

    // Update local state instantly
    setAllUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);

    const roleTitle = addRole === 'student' ? 'Student' : addRole === 'teacher' ? 'Teacher' : 'HOD';

    setAddModalOpen(false);
    showToast('success', `Successfully created ${roleTitle} account for ${addName.trim()} (${generatedId}) in ${deptName}.`);

    if (onAuditLog) {
      onAuditLog('CREATE_USER', `Added new ${roleTitle} account for ${addName.trim()} (${addEmail.trim()}) in ${deptName}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-900 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-purple-800/40">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-purple-200 border border-purple-500/30 backdrop-blur-md">
              University Central ERP Control Panel
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <Calendar className="w-3 h-3 text-purple-400" />
              {fullFormatted}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Lokbharti University Administration
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
            Administrator: {user.name} • Email: <span className="font-mono font-bold text-white">{user.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-950/50 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl shrink-0">
            <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0 ring-2 ring-purple-500/30">
              <img
                src={LOKBHARTI_LOGO}
                alt="Lokbharti University Seal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-black tracking-wide uppercase text-white">Lokbharti ERP</div>
              <div className="text-[10px] text-purple-300 font-medium">System Admin Console</div>
            </div>
          </div>

          <button
            onClick={() => setShowAdminRequestsModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer shrink-0 border border-purple-300/30 relative"
            id="admin-student-requests-btn"
          >
            <FileText className="w-4 h-4 text-purple-300" />
            <span>Student Requests</span>
            {pendingAdminRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
                {pendingAdminRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowAdminHistoryModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer shrink-0 border border-purple-300/40 relative"
            id="admin-student-request-history-btn"
            title="View History of all Approved and Rejected Student Requests"
          >
            <History className="w-4 h-4 text-purple-300" />
            <span>Student Request History</span>
            {respondedAdminRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-black">
                {respondedAdminRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowAdminTimetableModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer shrink-0 border border-purple-300/40 relative select-none"
            id="admin-timetable-manager-btn"
            title="Manage, Add, Edit and Delete Timetables for All Departments & Semesters"
          >
            <Clock className="w-4 h-4 text-purple-200" />
            <span>Manage Timetables</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => onSelectTab('students')}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:shadow-md transition-all text-left cursor-pointer group"
                id="stat-total-students-btn"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-purple-600 transition-colors">
                  <span>Total Students</span>
                  <GraduationCap className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {totalStudents.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center justify-between">
                  <span>Across {DEPARTMENTS.length} Departments</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('admin-users')}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all text-left cursor-pointer group"
                id="stat-total-faculty-btn"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                  <span>Total Faculty</span>
                  <Users className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {totalFaculty}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Teachers & HODs</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('attendance')}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-md transition-all text-left cursor-pointer group"
                id="stat-departments-btn"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-amber-600 transition-colors">
                  <span>Departments</span>
                  <Building2 className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {DEPARTMENTS.length}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Active Departments</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('admin-audit')}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all text-left cursor-pointer group"
                id="stat-system-status-btn"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
                  <span>System Status</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-bold text-emerald-600 mt-2">100% Operational</div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>JWT Auth & Audit Logs</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </button>
            </div>

            {/* Departments Grid */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Active University Departments
                </h3>
                <span className="text-xs text-slate-500 font-medium">Click any department to view its students & records</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {DEPARTMENTS.map((dept) => {
                  const counts = getDeptAccurateCounts(dept);
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => onSelectTab('students', dept.id)}
                      className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 active:scale-[0.99] transition-all text-left cursor-pointer group flex flex-col justify-between gap-2.5 relative overflow-hidden min-h-[96px] select-none"
                    >
                      <div className="flex items-start justify-between gap-2 w-full min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug break-words">
                            {dept.name} <span className="text-slate-400 font-normal text-[11px]">({dept.code})</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold whitespace-nowrap">
                          HOD: {dept.hodName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/50 w-full">
                        <div className="flex items-center gap-2 sm:gap-2.5 font-medium text-[11px] sm:text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100/90 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200/60 dark:border-purple-800/50">
                            {counts.studentCount} Students
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200/60 dark:border-slate-700/50">
                            {counts.facultyCount} Faculty
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                          <span>Open Data</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

      {/* Direct Add Actions Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-600" />
              Quick Add & User Provisioning
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instantly register new Students, Teachers, or HODs directly into the Lokbharti ERP
            </p>
          </div>
          <button
            onClick={() => onSelectTab('admin-users')}
            className="text-xs font-bold text-purple-600 hover:text-purple-500 flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            Manage User Directory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Dedicated Add Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Button 1: Add the Student */}
          <button
            onClick={() => handleOpenAddModal('student')}
            className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center gap-4 cursor-pointer"
          >
            <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1">
                1. Add the Student
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Enroll new student into semester batch
              </div>
            </div>
          </button>

          {/* Button 2: Add the Teacher */}
          <button
            onClick={() => handleOpenAddModal('teacher')}
            className="group p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4 cursor-pointer"
          >
            <div className="p-3.5 rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-1">
                2. Add the Teacher
              </div>
              <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                Register new faculty & subject instructor
              </div>
            </div>
          </button>

          {/* Button 3: Add the HOD */}
          <button
            onClick={() => handleOpenAddModal('hod')}
            className="group p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 hover:border-amber-500 hover:shadow-md transition-all text-left flex items-center gap-4 cursor-pointer"
          >
            <div className="p-3.5 rounded-xl bg-amber-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
                3. Add the HOD
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                Appoint Department Head
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Audit Logs Quick View */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent System Audit Logs
          </h3>
          <button
            onClick={() => onSelectTab('audit')}
            className="text-xs text-purple-600 font-bold hover:underline"
          >
            View All Logs
          </button>
        </div>

        <div className="space-y-2">
          {(auditLogs || []).slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{log.action}: </span>
                <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Provision New {addRole.toUpperCase()} Account
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Category
                  </label>
                  <select
                    value={addRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setAddRole(r);
                      if (r === 'student') setAddDesignation('Undergraduate Student');
                      else if (r === 'teacher') setAddDesignation('Assistant Professor');
                      else if (r === 'hod') setAddDesignation('Head of Department');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="hod">HOD (Head of Department)</option>
                  </select>
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={addDepartmentId}
                    onChange={(e) => setAddDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. ramesh.patel@lokbhartiuniversity.edu.in"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Conditional Fields: Semester or Employee Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addRole === 'student' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Semester
                    </label>
                    <select
                      value={addSemester}
                      onChange={(e) => setAddSemester(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Designation
                    </label>
                    <input
                      type="text"
                      value={addDesignation}
                      onChange={(e) => setAddDesignation(e.target.value)}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {addRole === 'student' ? 'Enrollment No (Optional)' : 'Employee ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={addCustomId}
                    onChange={(e) => setAddCustomId(e.target.value)}
                    placeholder={addRole === 'student' ? 'e.g. 2024CS9901 (Auto if blank)' : 'e.g. LBU-FAC-402 (Auto if blank)'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="+91 98250 xxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md"
                >
                  Create {addRole.toUpperCase()} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Student Requests Desk Modal */}
      {showAdminRequestsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2 text-purple-600">
                <FileText className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  University Student Requests & Petitions Central Desk
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowAdminRequestsModal(false);
                    setShowAdminHistoryModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs transition-all flex items-center gap-1.5 border border-purple-500/30 shadow-sm"
                  title="View History of Approved and Rejected Requests"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Request History ({respondedAdminRequestsCount})</span>
                </button>

                {activeAdminRequests.some((r) => r.status !== 'Pending') && (
                  <button
                    onClick={handleAdminClearAllProcessed}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800/60 shadow-sm"
                    title="Clear approved and rejected requests from active queue"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Clear Processed</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAdminRequestsModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                <span>
                  Admin Desk: Review and sanction petitions. Pressing <strong>Clear</strong> or <strong>Clear Processed</strong> removes responded items from active view into <strong>Student Request History</strong>.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {activeAdminRequests.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs font-medium space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">No Pending Student Requests</p>
                    <p className="text-slate-500 mt-1">All university student petitions have been addressed and cleared from active desk.</p>
                  </div>
                  {respondedAdminRequestsCount > 0 && (
                    <button
                      onClick={() => {
                        setShowAdminRequestsModal(false);
                        setShowAdminHistoryModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all shadow-md mt-2"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Open Student Request History ({respondedAdminRequestsCount})</span>
                    </button>
                  )}
                </div>
              ) : (
                activeAdminRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border space-y-3 transition-all ${
                      req.status === 'Approved'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : req.status === 'Rejected'
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{req.studentName}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                            Sem {req.semester || 5}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{req.enrollmentNo}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Target: {req.recipientRole === 'hod' ? 'HOD' : 'Admin'}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-0.5">
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
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {req.status}
                        </span>

                        {req.status !== 'Pending' && (
                          <button
                            onClick={() => handleAdminDismissRequest(req.id)}
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
                      <span className="text-slate-400">Duration: {req.days || `${req.startDate || ''} - ${req.endDate || ''}`} • Submitted: {req.submittedAt}</span>
                    </div>

                    {req.status === 'Pending' ? (
                      <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700/60">
                        <button
                          onClick={() => handleAdminProcessRequest(req.id, 'Approved', 'Approved by University Administration')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Request</span>
                        </button>
                        <button
                          onClick={() => handleAdminProcessRequest(req.id, 'Rejected', 'Declined by Administration')}
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
                            Response recorded by <strong>{req.reviewedBy || 'Admin'}</strong> • Archived in History
                          </span>
                        </span>
                        <button
                          onClick={() => handleAdminDismissRequest(req.id)}
                          className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove now</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Student Request History Modal (Approved & Rejected Only) */}
      {showAdminHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    Student Request History
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-black text-xs">
                      {respondedAdminRequests.length} Responded
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Central Archive of all Approved and Rejected Student Petitions across Lokbharti University
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowAdminHistoryModal(false);
                    setShowAdminRequestsModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Active Desk ({pendingAdminRequestsCount})</span>
                </button>
                <button
                  onClick={() => setShowAdminHistoryModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Responded</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{respondedAdminRequests.length}</div>
                <p className="text-[10px] text-slate-400">All archived records</p>
              </div>
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Approved Requests</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {respondedAdminRequests.filter((r) => r.status === 'Approved').length}
                </div>
                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Sanctioned & granted</p>
              </div>
              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-200 dark:border-rose-900/50">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Rejected Requests</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {respondedAdminRequests.filter((r) => r.status === 'Rejected').length}
                </div>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Declined upon review</p>
              </div>
            </div>

            {/* Controls Bar */}
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
                  All ({respondedAdminRequests.length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('Approved')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyStatusFilter === 'Approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  Approved ({respondedAdminRequests.filter((r) => r.status === 'Approved').length})
                </button>
                <button
                  onClick={() => setHistoryStatusFilter('Rejected')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    historyStatusFilter === 'Rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                  }`}
                >
                  Rejected ({respondedAdminRequests.filter((r) => r.status === 'Rejected').length})
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by student, enrollment, subject..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 pt-1">
              {respondedAdminRequests
                .filter((req) => {
                  if (historyStatusFilter !== 'all' && req.status !== historyStatusFilter) return false;
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
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No History Records</p>
                  <p>All responded requests will be archived and shown here.</p>
                </div>
              ) : (
                respondedAdminRequests
                  .filter((req) => {
                    if (historyStatusFilter !== 'all' && req.status !== historyStatusFilter) return false;
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
                  .map((req) => (
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{req.studentName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                              Sem {req.semester || 5}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{req.enrollmentNo}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Target: {req.recipientRole === 'hod' ? 'HOD' : 'Admin'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                            {formatRequestCategory(req.requestType)} — {req.subject || 'University Petition Application'}
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
                        <span>Attachment: <strong className="font-mono text-purple-600 dark:text-purple-400">{req.attachment || 'None'}</strong></span>
                        <span>Submitted: <strong>{req.submittedAt}</strong></span>
                      </div>

                      {/* Sanction Details */}
                      <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-purple-500" />
                            <span>Official Decision by: <strong>{req.reviewedBy || user.name || 'Administration'}</strong></span>
                          </span>
                          <span className="text-slate-400">
                            {req.processedAt ? new Date(req.processedAt).toLocaleString() : 'Recorded'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                          "{req.reviewComment || (req.status === 'Approved' ? 'Approved by University Administration' : 'Declined upon review')}"
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Timetable Management Modal */}
      {showAdminTimetableModal && (
        <AdminTimetableManagementModal
          isOpen={showAdminTimetableModal}
          onClose={() => setShowAdminTimetableModal(false)}
          currentUser={user}
          onAuditLog={onAuditLog}
        />
      )}
    </div>
  );
};

