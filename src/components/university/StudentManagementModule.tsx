import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  FileText,
  Mail,
  Phone,
  Building2,
  ChevronRight,
  Sliders,
  X,
  ShieldAlert,
  Edit3,
  Save,
  Download,
  TrendingUp,
  BarChart2,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
  FileCheck,
  Check,
  ExternalLink,
  Info,
  ShieldCheck,
  Trash2,
  RotateCcw,
  History,
  AlertCircle,
  Archive,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import {
  User,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  StudentResult,
  DeletedStudentRecord
} from '../../types';
import {
  DEPARTMENTS,
  INITIAL_USERS,
  SUBJECTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_RESULTS,
  TIMETABLES,
  INITIAL_DELETED_STUDENTS,
  getStoredUsers,
  softDeleteUserAccount,
  purgeUserAccount,
  restoreUserAccount
} from '../../data/mockDatabase';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';
import { canCommunicate, getCommunicationPolicyMessage } from '../../utils/communicationRules';
import { UserAvatar } from '../common/UserAvatar';
import { matchUserSmart } from '../../utils/searchMatching';
import { formatStudentDisplayName } from '../../utils/studentNameUtils';

interface StudentManagementModuleProps {
  currentUser: User;
  initialDeptFilter?: string;
  attendanceRecords?: AttendanceRecord[];
  assignments?: Assignment[];
  submissions?: AssignmentSubmission[];
  results?: StudentResult[];
  onNavigateTab?: (tab: string, deptId?: string) => void;
  onAuditLog?: (action: string, details: string) => void;
  onSendMessageToUser?: (recipient: User) => void;
}

export type StudentStatusType = 'Active' | 'On Probation' | 'Medical Leave' | 'Debarred' | 'Suspended' | 'Graduated';

export interface ExtendedStudentInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  departmentId: string;
  departmentName: string;
  semester: number;
  enrollmentNo: string;
  rollNo: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  admissionDate: string;
  academicBatch: string;
  status: StudentStatusType;
  statusRemark?: string;
  statusUpdatedAt?: string;
}

export const StudentManagementModule: React.FC<StudentManagementModuleProps> = ({
  currentUser,
  initialDeptFilter,
  attendanceRecords = INITIAL_ATTENDANCE_RECORDS,
  assignments = INITIAL_ASSIGNMENTS,
  submissions = INITIAL_SUBMISSIONS,
  results = INITIAL_RESULTS,
  onNavigateTab,
  onAuditLog,
  onSendMessageToUser,
}) => {
  // Primary Department context
  const defaultDeptId = currentUser.departmentId || 'dept_it';
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(() => {
    if (initialDeptFilter && initialDeptFilter !== 'all') {
      return initialDeptFilter;
    }
    return currentUser.role === 'admin' ? 'all' : defaultDeptId;
  });

  useEffect(() => {
    if (initialDeptFilter) {
      setSelectedDeptFilter(initialDeptFilter);
    }
  }, [initialDeptFilter]);
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Active student list state
  const [activeStudentUsers, setActiveStudentUsers] = useState<User[]>(() => {
    return getStoredUsers().filter((u) => u.role === 'student');
  });

  // Listen for real-time database updates
  useEffect(() => {
    const handleUserUpdated = () => {
      setActiveStudentUsers(getStoredUsers().filter((u) => u.role === 'student'));
    };
    window.addEventListener('lbu_user_updated', handleUserUpdated);
    window.addEventListener('storage', handleUserUpdated);
    return () => {
      window.removeEventListener('lbu_user_updated', handleUserUpdated);
      window.removeEventListener('storage', handleUserUpdated);
    };
  }, []);

  // Deleted students history store (persists in safe storage)
  const [deletedStudentsList, setDeletedStudentsList] = useState<DeletedStudentRecord[]>(() => {
    const stored = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', []);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    return [...INITIAL_DELETED_STUDENTS];
  });

  // Listen to deleted records update events
  useEffect(() => {
    const handleDeletedRecordsUpdated = () => {
      const records = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', []);
      if (Array.isArray(records)) {
        setDeletedStudentsList(records.length > 0 ? records : [...INITIAL_DELETED_STUDENTS]);
      }
    };
    window.addEventListener('lbu_deleted_records_updated', handleDeletedRecordsUpdated);
    window.addEventListener('storage', handleDeletedRecordsUpdated);
    return () => {
      window.removeEventListener('lbu_deleted_records_updated', handleDeletedRecordsUpdated);
      window.removeEventListener('storage', handleDeletedRecordsUpdated);
    };
  }, []);

  // Keyboard shortcut to close history modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDeletedHistoryOpen(false);
        setPurgingRecord(null);
        setDeletingStudentModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync custom students and deleted records safely
  useEffect(() => {
    const initialIds = new Set(INITIAL_USERS.map((u) => u.id));
    const customStudents = activeStudentUsers.filter((u) => !initialIds.has(u.id));
    const allCustom = safeStorageGet<User[]>('lbu_custom_users', []);
    const nonStudentCustom = allCustom.filter((u) => u.role !== 'student');
    const mergedCustom = [...customStudents, ...nonStudentCustom];
    if (mergedCustom.length > 0) {
      safeStorageSet('lbu_custom_users', mergedCustom);
    }
  }, [activeStudentUsers]);

  useEffect(() => {
    if (deletedStudentsList.length > 0) {
      safeStorageSet('lbu_deleted_students', deletedStudentsList);
    }
  }, [deletedStudentsList]);

  // Permissions: Delete History is only accessible to Admin & HOD (not visible to teachers or students)
  const canManageDeleteHistory = currentUser.role === 'admin' || currentUser.role === 'hod';

  // Selected Student for Inspector Drawer
  const [inspectStudentId, setInspectStudentId] = useState<string | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'profile' | 'academic' | 'performance' | 'status' | 'history'>('profile');

  // Modal States
  const [isDeletedHistoryOpen, setIsDeletedHistoryOpen] = useState<boolean>(false);
  const [deletingStudentModal, setDeletingStudentModal] = useState<ExtendedStudentInfo | null>(null);
  const [purgingRecord, setPurgingRecord] = useState<DeletedStudentRecord | null>(null);
  const [deletionReasonInput, setDeletionReasonInput] = useState<string>('');
  const [deletedSearchQuery, setDeletedSearchQuery] = useState<string>('');
  const [deletedDeptFilter, setDeletedDeptFilter] = useState<string>('all');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (type: 'success' | 'info' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Custom student status state store (persists in session state)
  const [customStudentStatuses, setCustomStudentStatuses] = useState<Record<string, { status: StudentStatusType; remark: string; updatedAt: string }>>({
    'usr_student_arav': { status: 'Active', remark: 'Academic achiever - Distinction holder', updatedAt: '2026-08-01' },
    'usr_student_priya': { status: 'Active', remark: 'Regular attendance', updatedAt: '2026-08-01' },
    'usr_st_it_302': { status: 'On Probation', remark: 'Academic review: Requires mentoring in Core Programming & Systems', updatedAt: '2026-08-05' },
    'usr_st_it_304': { status: 'Debarred', remark: 'Attendance 61.2% below 75% mandatory threshold in Semester 3', updatedAt: '2026-08-10' },
    'usr_st_it_307': { status: 'Medical Leave', remark: 'Sanctioned medical leave for health recovery', updatedAt: '2026-08-08' },
    'usr_st_agro_501': { status: 'Debarred', remark: 'Attendance 62.5% below 75% threshold', updatedAt: '2026-08-10' },
    'usr_st_agro_502': { status: 'On Probation', remark: 'SGPA 5.8 in previous semester', updatedAt: '2026-08-05' },
    'usr_st_horti_501': { status: 'Medical Leave', remark: 'Sanctioned leave for hospital stay', updatedAt: '2026-08-08' },
  });

  // Action status form state
  const [pendingStatus, setPendingStatus] = useState<StudentStatusType>('Active');
  const [pendingRemark, setPendingRemark] = useState<string>('');
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  // Status Change History Audit Store
  const [statusHistoryLogs, setStatusHistoryLogs] = useState<Array<{ id: string; studentId: string; oldStatus: string; newStatus: string; remark: string; date: string; updatedBy: string }>>([
    {
      id: 'log_1',
      studentId: 'usr_st_agro_501',
      oldStatus: 'Active',
      newStatus: 'Debarred',
      remark: 'Attendance 62.5% below mandatory 75% threshold as per Academic Regulations Sec 4.2',
      date: '2026-08-10 10:30',
      updatedBy: 'HOD Ramesh Bhai Patel'
    },
    {
      id: 'log_2',
      studentId: 'usr_st_agro_502',
      oldStatus: 'Active',
      newStatus: 'On Probation',
      remark: 'Academic performance review: SGPA 5.8 requires close mentoring',
      date: '2026-08-05 14:15',
      updatedBy: 'Dr. Kirit Kumar Joshi'
    }
  ]);

  // Map active students into rich ExtendedStudentInfo
  const studentList: ExtendedStudentInfo[] = useMemo(() => {
    return activeStudentUsers.map((st, index) => {
      const custom = customStudentStatuses[st.id];
      const deptObj = DEPARTMENTS.find((d) => d.id === st.departmentId || d.code === st.departmentId) || DEPARTMENTS[0];
      const rollNum = String((index % 60) + 1).padStart(2, '0');
      
      return {
        id: st.id,
        name: st.name,
        email: st.email,
        avatar: st.avatar,
        departmentId: st.departmentId || 'dept_it',
        departmentName: st.departmentName || deptObj.name,
        semester: st.semester || 3,
        enrollmentNo: st.enrollmentNo || `2522${st.departmentId === 'dept_it' ? '1103' : '2201'}${String(index + 1).padStart(3, '0')}`,
        rollNo: `ROLL-${st.semester || 3}-${rollNum}`,
        phone: st.phone || `+91 9825${String((index * 13) % 90 + 10).padStart(2, '0')} ${String((index * 37) % 9000 + 1000).padStart(4, '0')}`,
        guardianName: `Shri ${st.name.split(' ').slice(-1)[0] || 'Father'}`,
        guardianPhone: `+91 9426${String((index * 19) % 90 + 10).padStart(2, '0')} ${String((index * 41) % 9000 + 1000).padStart(4, '0')}`,
        address: `Sanosara Village Rd, Block ${String.fromCharCode(65 + (index % 4))}-${(index % 20) + 1}, Bhavnagar, Gujarat`,
        admissionDate: st.joiningDate || '2024-08-01',
        academicBatch: '2024 - 2027 Academic Batch',
        status: custom ? custom.status : 'Active',
        statusRemark: custom ? custom.remark : 'Good Academic Standing',
        statusUpdatedAt: custom ? custom.updatedAt : '2024-08-01',
      };
    });
  }, [activeStudentUsers, customStudentStatuses]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      // Dept filter
      if (selectedDeptFilter !== 'all') {
        const matchesDept = st.departmentId === selectedDeptFilter || 
          (selectedDeptFilter === 'dept_it' && (st.departmentId === 'dept_it' || st.departmentId === 'dept_cs'));
        if (!matchesDept) return false;
      }
      // Semester filter
      if (selectedSemFilter !== 'all' && String(st.semester) !== selectedSemFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'all' && st.status.toLowerCase() !== selectedStatusFilter.toLowerCase()) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        if (!matchUserSmart(st, searchQuery)) return false;
      }
      return true;
    });
  }, [studentList, selectedDeptFilter, selectedSemFilter, selectedStatusFilter, searchQuery]);

  // Filtered Deleted Students for the Delete History modal
  const filteredDeletedStudents = useMemo(() => {
    return deletedStudentsList.filter((rec) => {
      if (deletedDeptFilter !== 'all' && rec.departmentId !== deletedDeptFilter) {
        return false;
      }
      if (deletedSearchQuery.trim()) {
        return matchUserSmart(rec, deletedSearchQuery);
      }
      return true;
    });
  }, [deletedStudentsList, deletedDeptFilter, deletedSearchQuery]);

  // Base Students for Stats (dept & semester constrained, independent of status filter so counts stay accurate)
  const baseStudentsForStats = useMemo(() => {
    return studentList.filter((st) => {
      // Dept filter
      if (selectedDeptFilter !== 'all') {
        const matchesDept = st.departmentId === selectedDeptFilter || 
          (selectedDeptFilter === 'dept_it' && (st.departmentId === 'dept_it' || st.departmentId === 'dept_cs'));
        if (!matchesDept) return false;
      }
      // Semester filter
      if (selectedSemFilter !== 'all' && String(st.semester) !== selectedSemFilter) {
        return false;
      }
      return true;
    });
  }, [studentList, selectedDeptFilter, selectedSemFilter]);

  // Overall Department Analytics Calculations
  const stats = useMemo(() => {
    const total = baseStudentsForStats.length;
    const active = baseStudentsForStats.filter((s) => s.status === 'Active').length;
    const probation = baseStudentsForStats.filter((s) => s.status === 'On Probation').length;
    const debarred = baseStudentsForStats.filter((s) => s.status === 'Debarred').length;
    const medical = baseStudentsForStats.filter((s) => s.status === 'Medical Leave').length;

    // Calculate average attendance for displayed students
    let totalAttSum = 0;
    let attCount = 0;

    baseStudentsForStats.forEach((st) => {
      const records = attendanceRecords.filter((r) =>
        r.studentEntries.some((e) => e.studentId === st.id)
      );
      const entries = records.flatMap((r) => r.studentEntries.filter((e) => e.studentId === st.id));
      if (entries.length > 0) {
        const present = entries.filter((e) => e.status === 'present').length;
        totalAttSum += (present / entries.length) * 100;
        attCount += 1;
      } else {
        totalAttSum += 86.5; // default fallback for realistic statistics
        attCount += 1;
      }
    });

    const avgAtt = attCount > 0 ? Math.round((totalAttSum / attCount) * 10) / 10 : 85.2;

    return { total, active, probation, debarred, medical, avgAtt };
  }, [baseStudentsForStats, attendanceRecords]);

  // Active Inspected Student Object
  const inspectedStudent = useMemo(() => {
    if (!inspectStudentId) return null;
    return studentList.find((s) => s.id === inspectStudentId) || null;
  }, [inspectStudentId, studentList]);

  // Specific attendance calculation for inspected student
  const inspectedStudentAttendance = useMemo(() => {
    if (!inspectedStudent) return { overallPct: 88, totalClasses: 24, presentClasses: 21, subjectBreakdown: [] };

    const studentRecs = attendanceRecords.filter((r) =>
      r.studentEntries.some((e) => e.studentId === inspectedStudent.id)
    );

    const entries = studentRecs.flatMap((r) => r.studentEntries.filter((e) => e.studentId === inspectedStudent.id));
    const presentCount = entries.filter((e) => e.status === 'present').length;
    const overallPct = entries.length > 0 ? Math.round((presentCount / entries.length) * 100) : 88;

    // Subject breakdown
    const deptSubjects = SUBJECTS.filter(
      (s) => s.departmentId === inspectedStudent.departmentId && (!inspectedStudent.semester || s.semester === inspectedStudent.semester)
    );

    const activeSubjectsList = deptSubjects.length > 0 ? deptSubjects : SUBJECTS.filter((s) => s.departmentId === inspectedStudent.departmentId);

    const subjectBreakdown = activeSubjectsList.map((sub) => {
      const subRecs = studentRecs.filter(
        (r) => r.subjectId === sub.id || (r.subjectName && r.subjectName.toLowerCase().includes(sub.name.toLowerCase()))
      );
      const subEntries = subRecs.flatMap((r) => r.studentEntries.filter((e) => e.studentId === inspectedStudent.id));
      const subPresent = subEntries.filter((e) => e.status === 'present').length;
      const pct = subEntries.length > 0 ? Math.round((subPresent / subEntries.length) * 100) : 85;

      return {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        total: subEntries.length || 8,
        present: subPresent || 7,
        pct,
      };
    });

    return {
      overallPct,
      totalClasses: entries.length || 24,
      presentClasses: presentCount || 21,
      subjectBreakdown,
    };
  }, [inspectedStudent, attendanceRecords]);

  // Specific assignment submissions for inspected student
  const inspectedStudentAssignments = useMemo(() => {
    if (!inspectedStudent) return [];
    return submissions.filter(
      (sub) => sub.studentId === inspectedStudent.id || sub.studentName.toLowerCase() === inspectedStudent.name.toLowerCase()
    );
  }, [inspectedStudent, submissions]);

  // Specific Academic Results (CGPA/SGPA) for inspected student
  const inspectedStudentResult = useMemo(() => {
    if (!inspectedStudent) return null;
    return (
      results.find(
        (r) => r.studentId === inspectedStudent.id || r.studentName.toLowerCase() === inspectedStudent.name.toLowerCase()
      ) || {
        id: `res_default_${inspectedStudent.id}`,
        studentId: inspectedStudent.id,
        studentName: inspectedStudent.name,
        enrollmentNo: inspectedStudent.enrollmentNo,
        departmentId: inspectedStudent.departmentId,
        semester: inspectedStudent.semester,
        academicYear: '2025-2026',
        subjects: [
          { subjectCode: 'MOD-101', subjectName: 'Core Theory & Concepts', credits: 4, internalMarks: 28, externalMarks: 62, totalMarks: 90, grade: 'A+', gradePoint: 10 },
          { subjectCode: 'MOD-102', subjectName: 'Practical Lab & Field Work', credits: 3, internalMarks: 27, externalMarks: 58, totalMarks: 85, grade: 'A', gradePoint: 9 },
          { subjectCode: 'MOD-103', subjectName: 'Continuous Evaluation', credits: 3, internalMarks: 26, externalMarks: 54, totalMarks: 80, grade: 'A', gradePoint: 9 },
        ],
        sgpa: 9.1,
        cgpa: 8.95,
        remarks: 'Consistent First Class with Distinction',
      }
    );
  }, [inspectedStudent, results]);

  // Handle Opening Student Drawer
  const handleOpenInspector = (studentId: string, tab: 'profile' | 'academic' | 'performance' | 'status' | 'history' = 'profile') => {
    setInspectStudentId(studentId);
    setActiveInspectorTab(tab);
    const target = studentList.find((s) => s.id === studentId);
    if (target) {
      setPendingStatus(target.status);
      setPendingRemark(target.statusRemark || '');
    }
    setStatusSuccessMessage(null);
  };

  // Handle Saving Updated Status
  const handleSaveStatusChange = () => {
    if (!inspectedStudent) return;

    const oldStatus = inspectedStudent.status;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Update Status Map
    setCustomStudentStatuses((prev) => ({
      ...prev,
      [inspectedStudent.id]: {
        status: pendingStatus,
        remark: pendingRemark || 'Updated status by department authority',
        updatedAt: now,
      },
    }));

    // Add to Status History Log
    const newLog = {
      id: `log_${Date.now()}`,
      studentId: inspectedStudent.id,
      oldStatus,
      newStatus: pendingStatus,
      remark: pendingRemark || 'Updated by department officer',
      date: now,
      updatedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
    };

    setStatusHistoryLogs((prev) => [newLog, ...prev]);

    // Audit Log Call
    if (onAuditLog) {
      onAuditLog(
        `Student Status Updated (${inspectedStudent.name})`,
        `Changed status from ${oldStatus} to ${pendingStatus}. Reason: ${pendingRemark}`
      );
    }

    setStatusSuccessMessage(`Status successfully updated to '${pendingStatus}' for ${inspectedStudent.name}!`);
    setTimeout(() => {
      setStatusSuccessMessage(null);
    }, 4000);
  };

  // Handle Triggering Deletion Modal
  const handlePromptDeleteStudent = (st: ExtendedStudentInfo) => {
    setDeletingStudentModal(st);
    setDeletionReasonInput('');
  };

  // Handle Confirm Deletion
  const handleConfirmDeleteStudent = () => {
    if (!deletingStudentModal) return;
    const st = deletingStudentModal;
    const reason = deletionReasonInput.trim() || 'Official administrative removal from student roster';

    const deletedRecord = softDeleteUserAccount(
      {
        id: st.id,
        name: st.name,
        email: st.email,
        role: 'student',
        departmentId: st.departmentId,
        departmentName: st.departmentName,
        semester: st.semester,
        enrollmentNo: st.enrollmentNo,
        phone: st.phone,
        rollNo: st.rollNo,
      } as any,
      reason,
      `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      currentUser.role
    );

    setActiveStudentUsers((prev) => prev.filter((u) => u.id !== st.id));
    setDeletedStudentsList((prev) => [deletedRecord, ...prev.filter((d) => d.id !== st.id)]);

    if (inspectStudentId === st.id) {
      setInspectStudentId(null);
    }

    setDeletingStudentModal(null);
    setDeletionReasonInput('');

    if (onAuditLog) {
      onAuditLog('DELETE_STUDENT', `Deleted student record for ${st.name} (${st.enrollmentNo}). Reason: ${reason}`);
    }

    showToast('info', `Removed student "${st.name}" and saved record to Delete History. Login access disabled.`);
  };

  // Handle Restoring Student
  const handleRestoreStudent = (rec: DeletedStudentRecord) => {
    if (!rec || !rec.id) return;
    const restoredUser = restoreUserAccount(rec.id, rec.email);
    setDeletedStudentsList((prev) => prev.filter((s) => s.id !== rec.id));

    const restoredObj: User = restoredUser || {
      id: rec.id,
      name: rec.name,
      email: rec.email,
      role: 'student',
      departmentId: rec.departmentId,
      departmentName: rec.departmentName,
      semester: rec.semester || 3,
      enrollmentNo: rec.enrollmentNo,
      phone: rec.phone,
      joiningDate: '2024-08-01',
    };

    setActiveStudentUsers((prev) => [
      restoredObj,
      ...prev.filter(
        (u) =>
          u.id.toLowerCase().trim() !== rec.id.toLowerCase().trim() &&
          (!rec.email || u.email.toLowerCase().trim() !== rec.email.toLowerCase().trim())
      ),
    ]);

    if (onAuditLog) {
      onAuditLog('RESTORE_STUDENT', `Restored student record for ${rec.name} (${rec.enrollmentNo}) back to active roster.`);
    }

    showToast('success', `Restored student "${rec.name}" back to active department roster! Login re-enabled.`);
  };

  // Handle Permanent Delete (Purge)
  const handlePermanentDeleteStudent = (rec: DeletedStudentRecord) => {
    setPurgingRecord(rec);
  };

  const confirmPurgeStudent = () => {
    if (!purgingRecord) return;
    const rec = purgingRecord;
    purgeUserAccount(rec.id, rec.email);
    setDeletedStudentsList((prev) => prev.filter((s) => s.id !== rec.id));
    setActiveStudentUsers((prev) => prev.filter((s) => s.id !== rec.id && s.email !== rec.email));

    if (onAuditLog) {
      onAuditLog('PURGE_STUDENT', `Permanently purged student record for ${rec.name} (${rec.email}). Login access revoked.`);
    }
    showToast('error', `Permanently purged record for "${rec.name}". Access permanently revoked.`);
    setPurgingRecord(null);
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status: StudentStatusType) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case 'On Probation':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 w-max">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>On Probation</span>
          </span>
        );
      case 'Debarred':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1 w-max">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Debarred</span>
          </span>
        );
      case 'Medical Leave':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1 w-max">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Medical Leave</span>
          </span>
        );
      case 'Suspended':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-700 flex items-center gap-1 w-max">
            <UserX className="w-3 h-3 text-slate-600" />
            <span>Suspended</span>
          </span>
        );
      case 'Graduated':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1 w-max">
            <GraduationCap className="w-3 h-3 text-purple-600" />
            <span>Graduated</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-lg animate-fadeIn transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 text-emerald-900 dark:text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 text-rose-900 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 text-indigo-900 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-indigo-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                Department Student Management Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight text-white flex items-center gap-2">
              Student Records & Performance Monitoring
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Comprehensive roster management, academic performance tracking, attendance monitoring, and administrative status governance for all enrolled department students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* PROMINENT DELETE HISTORY BUTTON (Only for Admin, removed from HOD dashboard) */}
            {canManageDeleteHistory && currentUser.role !== 'hod' && (
              <button
                id="btn-delete-history-header"
                onClick={() => setIsDeletedHistoryOpen(true)}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-2xl border border-rose-400/40 shadow-xl font-black text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                title="Click to view history of deleted students"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>Delete History</span>
                <span className="bg-white text-rose-700 font-black px-2 py-0.5 rounded-full text-[11px] shadow-sm">
                  {deletedStudentsList.length}
                </span>
              </button>
            )}

            <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-lg">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-300">Authorized Operator</div>
                <div className="text-sm font-black text-white">{currentUser.name}</div>
                <div className="text-[11px] text-emerald-400 font-medium capitalize">{currentUser.role} Portal</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base shadow-md">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Metric Dashboard Cards */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${canManageDeleteHistory ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-3`}>
        <button
          type="button"
          id="kpi-total-enrolled"
          onClick={() => setSelectedStatusFilter('all')}
          className={`text-left p-4 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
            selectedStatusFilter === 'all'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to view all enrolled students"
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
            {selectedStatusFilter === 'all' && (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                Active
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active Students</p>
        </button>

        <button
          type="button"
          id="kpi-active-status"
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Active' ? 'all' : 'Active')}
          className={`text-left p-4 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
            selectedStatusFilter === 'Active'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
          }`}
          title={selectedStatusFilter === 'Active' ? 'Click to clear filter' : 'Click to filter Active students'}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Status</div>
            {selectedStatusFilter === 'Active' && (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">
                Filtered
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.active}</div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Good standing</span>
            <span className="text-[9px] text-emerald-600 font-bold">{selectedStatusFilter === 'Active' ? '✕ Clear' : 'Filter →'}</span>
          </p>
        </button>

        <button
          type="button"
          id="kpi-on-probation"
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'On Probation' ? 'all' : 'On Probation')}
          className={`text-left p-4 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
            selectedStatusFilter === 'On Probation'
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
              : 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400 hover:shadow-md'
          }`}
          title={selectedStatusFilter === 'On Probation' ? 'Click to clear filter' : 'Click to filter students On Probation'}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">On Probation</div>
            {selectedStatusFilter === 'On Probation' ? (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950">
                Filtered
              </span>
            ) : (
              <span className="text-[8px] font-bold text-amber-600/80">Click</span>
            )}
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.probation}</div>
          <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center justify-between">
            <span>Requires Mentoring</span>
            <span className="text-[9px] font-bold">{selectedStatusFilter === 'On Probation' ? '✕ Clear' : 'Filter →'}</span>
          </p>
        </button>

        <button
          type="button"
          id="kpi-debarred"
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Debarred' ? 'all' : 'Debarred')}
          className={`text-left p-4 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
            selectedStatusFilter === 'Debarred'
              ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/50 shadow-md'
              : 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 hover:border-rose-400 hover:shadow-md'
          }`}
          title={selectedStatusFilter === 'Debarred' ? 'Click to clear filter' : 'Click to filter Debarred students (<75% Attendance)'}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Debarred (&lt;75%)</div>
            {selectedStatusFilter === 'Debarred' ? (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500 text-white">
                Filtered
              </span>
            ) : (
              <span className="text-[8px] font-bold text-rose-600/80">Click</span>
            )}
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{stats.debarred}</div>
          <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center justify-between">
            <span>Attendance Action</span>
            <span className="text-[9px] font-bold">{selectedStatusFilter === 'Debarred' ? '✕ Clear' : 'Filter →'}</span>
          </p>
        </button>

        <button
          type="button"
          id="kpi-medical-leave"
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Medical Leave' ? 'all' : 'Medical Leave')}
          className={`text-left p-4 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
            selectedStatusFilter === 'Medical Leave'
              ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/50 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-md'
          }`}
          title={selectedStatusFilter === 'Medical Leave' ? 'Click to clear filter' : 'Click to filter students on Medical Leave'}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medical Leave</div>
            {selectedStatusFilter === 'Medical Leave' ? (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500 text-white">
                Filtered
              </span>
            ) : (
              <span className="text-[8px] font-bold text-blue-600/80">Click</span>
            )}
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{stats.medical}</div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Leave sanctioned</span>
            <span className="text-[9px] font-bold text-blue-600">{selectedStatusFilter === 'Medical Leave' ? '✕ Clear' : 'Filter →'}</span>
          </p>
        </button>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Attendance</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{stats.avgAtt}%</div>
          <p className="text-[10px] text-slate-500 mt-1">Department Mean</p>
        </div>

        {/* PROMINENT DELETED STUDENTS KPI CARD BUTTON (Only for Admin & HOD) */}
        {canManageDeleteHistory && (
          <div
            id="card-delete-history-kpi"
            onClick={() => setIsDeletedHistoryOpen(true)}
            className="bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 p-4 rounded-2xl border border-rose-300 dark:border-rose-800 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group flex flex-col justify-between"
            title="Click to open Delete History records modal"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Deleted Records
                </div>
                <History className="w-3.5 h-3.5 text-rose-600 group-hover:rotate-180 transition-transform" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {deletedStudentsList.length}
              </div>
            </div>
            <p className="text-[10px] text-rose-700 dark:text-rose-300 font-extrabold mt-1 group-hover:underline flex items-center gap-1">
              <span>Delete History</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        )}
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Department Quick Filter Pills */}
        <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              Department Specific Views:
            </span>
            {selectedDeptFilter !== 'all' && (
              <button
                onClick={() => setSelectedDeptFilter('all')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Show All Departments ({studentList.length})</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDeptFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Departments ({studentList.length})
            </button>
            {DEPARTMENTS.map((dept) => {
              const matchesCount = studentList.filter(
                (st) =>
                  st.departmentId === dept.id ||
                  (dept.id === 'dept_it' && (st.departmentId === 'dept_it' || st.departmentId === 'dept_cs')) ||
                  (dept.id === 'dept_brs_agronomy' && (st.departmentId === 'dept_brs_agronomy' || st.departmentId === 'dept_agro')) ||
                  (dept.id === 'dept_bvoc_afp' && (st.departmentId === 'dept_bvoc_afp' || st.departmentId === 'dept_afp'))
              ).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptFilter(dept.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedDeptFilter === dept.id
                      ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400'
                      : 'bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{dept.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedDeptFilter === dept.id ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {matchesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Department Banner if filtered */}
        {selectedDeptFilter !== 'all' && (
          <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="font-bold">
                Active Department View: {DEPARTMENTS.find((d) => d.id === selectedDeptFilter)?.name || selectedDeptFilter} ({DEPARTMENTS.find((d) => d.id === selectedDeptFilter)?.code})
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                ({filteredStudents.length} Students)
              </span>
            </div>
            <button
              onClick={() => setSelectedDeptFilter('all')}
              className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Active Academic Status Banner if filtered */}
        {selectedStatusFilter !== 'all' && (
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span className="font-bold">
                Filtering Academic Status: <span className="underline">{selectedStatusFilter}</span>
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                ({filteredStudents.length} Students matching)
              </span>
            </div>
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Statuses</span>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, enrollment no, roll no, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Delete History Action */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter (Admin / HOD) */}
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              disabled={currentUser.role === 'student'}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>

            {/* Academic Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Academic Statuses</option>
              <option value="Active">Active</option>
              <option value="On Probation">On Probation</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Debarred">Debarred (&lt;75% Att.)</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Grid
              </button>
            </div>

            {/* PROMINENT DELETE HISTORY CONTROL BAR BUTTON (Only for Admin & HOD) */}
            {canManageDeleteHistory && (
              <button
                id="btn-delete-history-bar"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDeletedHistoryOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 select-none"
                title="Open Delete History records modal"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>Delete History ({deletedStudentsList.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong>{filteredStudents.length}</strong> active students in view
            {canManageDeleteHistory && ` (${deletedStudentsList.length} deleted in history)`}
          </span>
          {(selectedDeptFilter !== 'all' || selectedSemFilter !== 'all' || selectedStatusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDeptFilter(currentUser.role === 'admin' ? 'all' : defaultDeptId);
                setSelectedSemFilter('all');
                setSelectedStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-emerald-600 font-bold hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Student Directory Content Area */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Student Name</th>
                  <th className="p-3.5">Enrollment & Roll</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Sem</th>
                  <th className="p-3.5">Attendance</th>
                  <th className="p-3.5">CGPA</th>
                  <th className="p-3.5">Academic Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No active students found matching your search or filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const studentRecs = attendanceRecords.filter((r) =>
                      r.studentEntries.some((e) => e.studentId === st.id)
                    );
                    const entries = studentRecs.flatMap((r) => r.studentEntries.filter((e) => e.studentId === st.id));
                    const present = entries.filter((e) => e.status === 'present').length;
                    const attPct = entries.length > 0 ? Math.round((present / entries.length) * 100) : 88;

                    const res = results.find((r) => r.studentId === st.id) || { cgpa: 8.8 };

                    const isStudentViewer = currentUser.role === 'student';
                    const stDisplayName = isStudentViewer && currentUser.id !== st.id ? formatStudentDisplayName(st.name) : st.name;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                        <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={stDisplayName}
                              avatar={st.avatar}
                              role="student"
                              size="md"
                              className="w-9 h-9 rounded-xl shadow-sm ring-1 ring-emerald-500/30 shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-white">{stDisplayName}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{st.enrollmentNo}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{st.rollNo}</div>
                        </td>

                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                          {st.departmentName}
                        </td>

                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          Sem {st.semester}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[11px] ${
                              attPct >= 80
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : attPct >= 75
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {attPct}% Att.
                          </span>
                        </td>

                        <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                          {res.cgpa || 8.8} CGPA
                        </td>

                        <td className="p-3.5">
                          {getStatusBadge(st.status)}
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenInspector(st.id, 'profile')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs transition-all flex items-center gap-1"
                            >
                              <UserIcon className="w-3 h-3" />
                              <span>Profile</span>
                            </button>

                            <button
                              onClick={() => handleOpenInspector(st.id, 'performance')}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs transition-all flex items-center gap-1"
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>Performance</span>
                            </button>

                            <button
                              onClick={() => handleOpenInspector(st.id, 'status')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 font-bold text-xs transition-all flex items-center gap-1"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Status</span>
                            </button>

                            {/* MESSAGE STUDENT BUTTON (Subject to Communication Matrix) */}
                            {canCommunicate(currentUser.role, 'student') && onSendMessageToUser && (
                              <button
                                id={`btn-student-msg-${st.id}`}
                                type="button"
                                onClick={() => {
                                  onSendMessageToUser({
                                    id: st.id,
                                    name: st.name,
                                    email: st.email,
                                    role: 'student',
                                    departmentId: st.departmentId,
                                    departmentName: st.departmentName,
                                    semester: st.semester,
                                    enrollmentNo: st.enrollmentNo,
                                    phone: st.phone,
                                  });
                                }}
                                title={`Send direct message to ${st.name}`}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs transition-all flex items-center gap-1 border border-indigo-200 dark:border-indigo-900 cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                <span>Message</span>
                              </button>
                            )}

                            {/* DELETE BUTTON ON STUDENT ROW (Admin & HOD only) */}
                            {(currentUser.role === 'admin' || currentUser.role === 'hod') && (
                              <button
                                onClick={() => handlePromptDeleteStudent(st)}
                                title="Delete & Move to Delete History"
                                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs transition-all flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => {
            const studentRecs = attendanceRecords.filter((r) =>
              r.studentEntries.some((e) => e.studentId === st.id)
            );
            const entries = studentRecs.flatMap((r) => r.studentEntries.filter((e) => e.studentId === st.id));
            const present = entries.filter((e) => e.status === 'present').length;
            const attPct = entries.length > 0 ? Math.round((present / entries.length) * 100) : 88;
            const res = results.find((r) => r.studentId === st.id) || { cgpa: 8.8 };
            const isStudentViewer = currentUser.role === 'student';
            const stCardDisplayName = isStudentViewer && currentUser.id !== st.id ? formatStudentDisplayName(st.name) : st.name;

            return (
              <div
                key={st.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={stCardDisplayName}
                        avatar={st.avatar}
                        role="student"
                        size="md"
                        className="w-11 h-11 rounded-xl shadow-md ring-1 ring-emerald-500/30 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{stCardDisplayName}</h4>
                        <div className="text-[11px] font-mono text-slate-500">{st.enrollmentNo}</div>
                      </div>
                    </div>
                    {getStatusBadge(st.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Semester & Dept</div>
                      <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                        Sem {st.semester} • {st.departmentName}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Attendance</div>
                      <div className={`font-black mt-0.5 ${attPct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {attPct}% Attended
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{st.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInspector(st.id, 'profile')}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleOpenInspector(st.id, 'status')}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>

                  {/* MESSAGE BUTTON ON GRID CARD */}
                  {canCommunicate(currentUser.role, 'student') && onSendMessageToUser && (
                    <button
                      id={`btn-grid-msg-${st.id}`}
                      type="button"
                      onClick={() => {
                        onSendMessageToUser({
                          id: st.id,
                          name: st.name,
                          email: st.email,
                          role: 'student',
                          departmentId: st.departmentId,
                          departmentName: st.departmentName,
                          semester: st.semester,
                          enrollmentNo: st.enrollmentNo,
                          phone: st.phone,
                        });
                      }}
                      title={`Send direct message to ${st.name}`}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Message</span>
                    </button>
                  )}

                  {/* DELETE BUTTON ON GRID CARD (Admin & HOD only) */}
                  {(currentUser.role === 'admin' || currentUser.role === 'hod') && (
                    <button
                      onClick={() => handlePromptDeleteStudent(st)}
                      title="Delete & Move to Delete History"
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION & REASON MODAL */}
      {/* ========================================================================= */}
      {deletingStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-rose-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Delete Student & Move to History</h3>
                  <p className="text-xs text-rose-200">Department Roster Archival Governance</p>
                </div>
              </div>
              <button
                onClick={() => setDeletingStudentModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Target Student Account</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">{deletingStudentModal.name}</div>
                <div className="text-xs font-mono text-slate-500">
                  {deletingStudentModal.enrollmentNo} • {deletingStudentModal.departmentName} (Sem {deletingStudentModal.semester})
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Audit Record Preservation:</strong> Removing this student will take them off active rosters. The record will be archived in <span className="font-extrabold underline">Delete History</span> so it can be audited or restored at any time.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mandatory Reason for Deletion
                </label>
                <textarea
                  rows={3}
                  value={deletionReasonInput}
                  onChange={(e) => setDeletionReasonInput(e.target.value)}
                  placeholder="E.g. Transferred to another university, Voluntary academic withdrawal, Duplicate record..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Presets:</span>
                  {[
                    'Transferred to another institution',
                    'Voluntary academic withdrawal',
                    'Duplicate enrollment record',
                    'Disciplinary removal'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDeletionReasonInput(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingStudentModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Move to Delete History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETED RECORDS HISTORY MODAL */}
      {/* ========================================================================= */}
      {isDeletedHistoryOpen && canManageDeleteHistory && (
        <div
          id="modal-student-delete-history-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeletedHistoryOpen(false);
          }}
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white p-6 flex items-start justify-between border-b border-rose-900/40 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shrink-0 border border-rose-400/30">
                  <History className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">Deleted Students History Log</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 font-extrabold text-xs">
                      {deletedStudentsList.length} Archived Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Official audit archive for removed student records. Authorized administrators and HODs can review deletion justifications, view timestamps, or restore students back to the active roster.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDeletedHistoryOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Control & Search Bar */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search deleted by name, enrollment, reason..."
                  value={deletedSearchQuery}
                  onChange={(e) => setDeletedSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                />
                {deletedSearchQuery && (
                  <button
                    onClick={() => setDeletedSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={deletedDeptFilter}
                  onChange={(e) => setDeletedDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>

                <div className="text-xs text-slate-500 font-bold hidden md:block">
                  Total: {filteredDeletedStudents.length} match(es)
                </div>
              </div>
            </div>

            {/* Modal List Area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              {filteredDeletedStudents.length === 0 ? (
                <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Archive className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No Deleted Student Records Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No deleted student accounts match your filter criteria. When students are removed, their audit log and restore entry will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletedStudentsList([...INITIAL_DELETED_STUDENTS]);
                      safeStorageSet('lbu_deleted_students', [...INITIAL_DELETED_STUDENTS]);
                      showToast('info', 'Reset and loaded sample student audit deletion history.');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Sample Archive Records</span>
                  </button>
                </div>
              ) : (
                filteredDeletedStudents.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-400/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-sm flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-800">
                          <UserX className="w-5 h-5 text-rose-600" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">{rec.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              DELETED RECORD
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">
                            {rec.enrollmentNo} • {rec.departmentName} (Sem {rec.semester || 3})
                          </p>
                        </div>
                      </div>

                      {/* Deletion Audit Callout Box */}
                      <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="text-rose-900 dark:text-rose-300 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            Deleted At: <strong>{rec.deletedAt}</strong>
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-bold">
                            Deleted By: <strong className="text-slate-900 dark:text-white">{rec.deletedBy}</strong>
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 font-medium italic">
                          "{rec.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 md:flex-col md:items-end">
                      <button
                        id={`btn-student-restore-${rec.id}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRestoreStudent(rec);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer select-none ring-offset-2 focus:ring-2 focus:ring-emerald-500"
                        title="Restore student back to active department roster"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore Student</span>
                      </button>

                      <button
                        id={`btn-student-purge-${rec.id}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePermanentDeleteStudent(rec);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 select-none"
                        title="Permanently remove record from database"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Purge</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Lokbharti University ERP • Deleted Student Records Audit Console
              </span>
              <button
                onClick={() => setIsDeletedHistoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED STUDENT INSPECTOR MODAL / DRAWER */}
      {/* ========================================================================= */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={inspectedStudent.name}
                  avatar={inspectedStudent.avatar}
                  role="student"
                  size="lg"
                  className="w-14 h-14 rounded-2xl shadow-xl ring-2 ring-emerald-400/40 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{inspectedStudent.name}</h2>
                    {getStatusBadge(inspectedStudent.status)}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Enrollment No: <strong className="font-mono text-emerald-300">{inspectedStudent.enrollmentNo}</strong> • Roll: <strong className="font-mono text-white">{inspectedStudent.rollNo}</strong> • Semester {inspectedStudent.semester} ({inspectedStudent.departmentName})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canCommunicate(currentUser.role, 'student') && onSendMessageToUser && (
                  <button
                    id="btn-inspector-msg-student"
                    type="button"
                    onClick={() => {
                      setInspectStudentId(null);
                      onSendMessageToUser({
                        id: inspectedStudent.id,
                        name: inspectedStudent.name,
                        email: inspectedStudent.email,
                        role: 'student',
                        departmentId: inspectedStudent.departmentId,
                        departmentName: inspectedStudent.departmentName,
                        semester: inspectedStudent.semester,
                        enrollmentNo: inspectedStudent.enrollmentNo,
                        phone: inspectedStudent.phone,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    title={`Send direct message to ${inspectedStudent.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                )}

                <button
                  onClick={() => setInspectStudentId(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-2 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActiveInspectorTab('profile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeInspectorTab === 'profile'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>1. Profile & Details</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('academic')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeInspectorTab === 'academic'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>2. Academic Info</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('performance')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeInspectorTab === 'performance'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>3. Performance Monitor</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('status')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeInspectorTab === 'status'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>4. Manage Status</span>
              </button>

              <button
                onClick={() => setActiveInspectorTab('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeInspectorTab === 'history'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>5. Status History</span>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* ======================================================== */}
              {/* TAB 1: PROFILE & DETAILS */}
              {/* ======================================================== */}
              {activeInspectorTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Particulars Card */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <UserIcon className="w-4 h-4 text-emerald-600" />
                        <span>Basic Particulars</span>
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Full Name</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{inspectedStudent.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Enrollment Number</span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-white">{inspectedStudent.enrollmentNo}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Class Roll Number</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{inspectedStudent.rollNo}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Academic Batch</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{inspectedStudent.academicBatch}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500 font-medium">Admission Date</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{inspectedStudent.admissionDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Guardian Information Card */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>Contact & Guardian Details</span>
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Student Phone</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{inspectedStudent.phone}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Parent / Guardian</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{inspectedStudent.guardianName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Guardian Contact</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{inspectedStudent.guardianPhone}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500 font-medium">Residential Address</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[200px]">{inspectedStudent.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-extrabold text-emerald-700 dark:text-emerald-400">Current Academic Standing</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{inspectedStudent.statusRemark || 'In Good Academic Standing'}</div>
                      <p className="text-[10px] text-slate-500">Last updated: {inspectedStudent.statusUpdatedAt}</p>
                    </div>

                    <button
                      onClick={() => setActiveInspectorTab('status')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: ACADEMIC INFORMATION */}
              {/* ======================================================== */}
              {activeInspectorTab === 'academic' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-black text-emerald-600">Active Program</span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Semester {inspectedStudent.semester} • {inspectedStudent.departmentName}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        24 Total Credits
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Enrolled Subject Modules</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SUBJECTS.filter((s) => s.departmentId === inspectedStudent.departmentId && (!inspectedStudent.semester || s.semester === inspectedStudent.semester))
                          .map((sub) => (
                            <div key={sub.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-900 dark:text-white">{sub.code}</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">{sub.credits || 4} Credits</span>
                              </div>
                              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{sub.name}</div>
                              <p className="text-[10px] text-slate-400">Instructor: Department Faculty</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Mentor & Advisor Contact */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-extrabold text-blue-700 dark:text-blue-400">Assigned Department Advisor</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Prof. Rishu Raj (HOD, IT / Department Mentor)</div>
                        <p className="text-[10px] text-slate-500">Office: IT Block Room 101 • hod.it@lokbhartiuniversity.edu.in</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab && onNavigateTab('timetable')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Student Timetable</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: PERFORMANCE MONITOR */}
              {/* ======================================================== */}
              {activeInspectorTab === 'performance' && (
                <div className="space-y-6">
                  {/* Summary Performance Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Attendance Rate</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {inspectedStudentAttendance.overallPct}%
                      </div>
                      <p className="text-[10px] text-slate-500">{inspectedStudentAttendance.presentClasses} of {inspectedStudentAttendance.totalClasses} classes attended</p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800">
                      <div className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">Cumulative CGPA</div>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                        {inspectedStudentResult?.cgpa || 8.95} / 10.0
                      </div>
                      <p className="text-[10px] text-slate-500">Sem {inspectedStudent.semester} Grade Point</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <div className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">Assignment Submissions</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                        {inspectedStudentAssignments.length || 4} Uploaded
                      </div>
                      <p className="text-[10px] text-slate-500">100% Submission compliance</p>
                    </div>
                  </div>

                  {/* Subject-wise Attendance Breakdown */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Subject-Wise Attendance Breakdown
                    </h3>

                    <div className="space-y-3">
                      {inspectedStudentAttendance.subjectBreakdown.map((sb) => (
                        <div key={sb.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-800 dark:text-slate-200">{sb.code} - {sb.name}</span>
                            <span className={sb.pct >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{sb.pct}% ({sb.present}/{sb.total})</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sb.pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${sb.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marks & Grade Breakdown Table */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Semester Grade & Exam Score Sheet
                    </h3>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="p-2.5">Subject</th>
                            <th className="p-2.5">Internal (30)</th>
                            <th className="p-2.5">External (70)</th>
                            <th className="p-2.5">Total (100)</th>
                            <th className="p-2.5 text-right">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {(inspectedStudentResult?.subjects || []).map((sb, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-extrabold text-slate-900 dark:text-white">{sb.subjectName} ({sb.subjectCode})</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">{sb.internalMarks}</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400">{sb.externalMarks}</td>
                              <td className="p-2.5 font-bold text-slate-900 dark:text-white">{sb.totalMarks}</td>
                              <td className="p-2.5 text-right font-black text-emerald-600">{sb.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: MANAGE STATUS & OFFICIAL ACTIONS */}
              {/* ======================================================== */}
              {activeInspectorTab === 'status' && (
                <div className="space-y-6">
                  {statusSuccessMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{statusSuccessMessage}</span>
                    </div>
                  )}

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <Sliders className="w-4 h-4 text-emerald-600" />
                      <span>Academic Status Governance Form</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Select New Academic Status for {inspectedStudent.name}
                        </label>
                        <select
                          value={pendingStatus}
                          onChange={(e) => setPendingStatus(e.target.value as StudentStatusType)}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Active">Active (Good Standing)</option>
                          <option value="On Probation">On Probation (Academic Mentoring Required)</option>
                          <option value="Medical Leave">Medical Leave (Sanctioned Absence)</option>
                          <option value="Debarred">Debarred (&lt;75% Attendance Restriction)</option>
                          <option value="Suspended">Suspended (Disciplinary Review)</option>
                          <option value="Graduated">Graduated (Degree Conferred)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Official Administrative Reason / Remark
                        </label>
                        <textarea
                          rows={3}
                          value={pendingRemark}
                          onChange={(e) => setPendingRemark(e.target.value)}
                          placeholder="Enter administrative justification or HOD decision notes..."
                          className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <button
                        onClick={handleSaveStatusChange}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update & Commit Student Status</span>
                      </button>
                    </div>
                  </div>

                  {/* Administrative Actions Quick Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setPendingStatus('Debarred');
                        setPendingRemark('Official Attendance Warning Letter Issued for falling below mandatory 75% attendance.');
                        handleSaveStatusChange();
                      }}
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs transition-all flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Issue Attendance Warning</span>
                    </button>

                    <button
                      onClick={() => {
                        setPendingStatus('On Probation');
                        setPendingRemark('Probationary Advisory Notice issued due to academic performance review.');
                        handleSaveStatusChange();
                      }}
                      className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-bold text-xs transition-all flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Issue Probation Advisory</span>
                    </button>

                    {/* DELETE STUDENT FROM INSPECTOR DRAWER (Admin & HOD only) */}
                    {(currentUser.role === 'admin' || currentUser.role === 'hod') && (
                      <button
                        onClick={() => handlePromptDeleteStudent(inspectedStudent)}
                        className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                        <span>Delete Student Record</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: STATUS HISTORY LOG */}
              {/* ======================================================== */}
              {activeInspectorTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Status Modification Audit Trail for {inspectedStudent.name}</span>
                  </h3>

                  <div className="space-y-3">
                    {statusHistoryLogs
                      .filter((l) => l.studentId === inspectedStudent.id)
                      .map((log) => (
                        <div key={log.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-800 dark:text-slate-200">
                              Status changed from <strong className="text-amber-600">{log.oldStatus}</strong> to <strong className="text-emerald-600">{log.newStatus}</strong>
                            </span>
                            <span className="text-[10px] text-slate-400">{log.date}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 italic">"{log.remark}"</p>
                          <div className="text-[10px] text-slate-400 font-semibold">Updated By: {log.updatedBy}</div>
                        </div>
                      ))}

                    {statusHistoryLogs.filter((l) => l.studentId === inspectedStudent.id).length === 0 && (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No prior manual status changes recorded for this student. Default status is Active.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">Lokbharti University ERP • Student Governance Module</span>
              <button
                onClick={() => setInspectStudentId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Permanent Purge Confirmation Modal */}
      {purgingRecord && (
        <div
          id="modal-student-purge-confirmation-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPurgingRecord(null);
          }}
          className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-800">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Permanently Purge Record?
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">Irreversible Action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p>
                <strong>Student:</strong> {purgingRecord.name}
              </p>
              <p>
                <strong>Email:</strong> {purgingRecord.email}
              </p>
              <p>
                <strong>Enrollment No:</strong> {purgingRecord.enrollmentNo}
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to <strong>permanently purge</strong> this student record? This action cannot be undone and login access for this account will be permanently revoked.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-cancel-purge-student"
                type="button"
                onClick={() => setPurgingRecord(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-purge-student"
                type="button"
                onClick={confirmPurgeStudent}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
