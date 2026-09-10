import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  UserCheck,
  FileCheck2,
  HelpCircle,
  Bell,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Calendar,
  CheckCircle,
  MapPin,
  Building2,
  Sparkles,
  CheckCircle2,
  PieChart,
  Info,
  Download,
  FileText,
  Printer,
  BellRing,
  Send,
  X,
  FilePlus,
  ShieldCheck,
  Ban,
  Lock,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import {
  User,
  TimetableSlot,
  Assignment,
  Quiz,
  Notice,
  StudyMaterial,
  AttendanceRecord,
  StudentRequest,
  StudentRequestCategory,
  STUDENT_REQUEST_CATEGORIES,
  formatRequestCategory,
  NotificationItem,
} from '../../types';
import { getCurrentDateAndDay, formatDateWithDay, isPast24HoursAfterDueDate, doDateRangesOverlap, getNextDayDateStr, formatDateRange } from '../../utils/dateUtils';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { TIMETABLES, INITIAL_STUDENT_REQUESTS } from '../../data/mockDatabase';
import { getSubjectBadgeStyle } from '../../utils/subjectColorUtils';
import { useLoading } from '../../context/LoadingContext';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';

interface StudentDashboardProps {
  user: User;
  todayClasses: TimetableSlot[];
  assignments: Assignment[];
  quizzes: Quiz[];
  notices: Notice[];
  readNoticeIds?: string[];
  materials: StudyMaterial[];
  attendancePercentage: number;
  attendanceRecords?: AttendanceRecord[];
  studentRequests?: StudentRequest[];
  dashboardAction?: { modal?: string; targetId?: string; requestId?: string; timestamp: number } | null;
  onSubmitStudentRequest?: (req: Omit<StudentRequest, 'id' | 'submittedAt' | 'status'>) => void;
  onSelectTab: (tab: string) => void;
  onStartQuiz: (quizId: string) => void;
  onMarkNoticeAsRead?: (noticeId: string) => void;
  onTriggerToast?: (notice: Notice) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  todayClasses = [],
  assignments = [],
  quizzes = [],
  notices = [],
  readNoticeIds = [],
  materials = [],
  attendancePercentage = 85,
  attendanceRecords = [],
  studentRequests,
  dashboardAction,
  onSubmitStudentRequest,
  onSelectTab,
  onStartQuiz,
  onMarkNoticeAsRead,
  onTriggerToast,
}) => {
  const isLowAttendance = attendancePercentage < 75;
  const { dayName, monthName, dayNum, year, fullFormatted } = getCurrentDateAndDay();

  const { withLoading } = useLoading();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'create' | 'history'>('create');
  const [recipientRole, setRecipientRole] = useState<'hod' | 'admin'>('hod');
  const [requestCategory, setRequestCategory] = useState<StudentRequestCategory>('general_leave');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // React to dashboardAction triggered by notification clicks
  useEffect(() => {
    if (dashboardAction?.modal === 'student_requests') {
      setIsLeaveModalOpen(true);
      setModalTab('history');
    }
  }, [dashboardAction]);
  const [localRequests, setLocalRequests] = useState<StudentRequest[]>(() => {
    return safeStorageGet<StudentRequest[]>('lbu_student_requests', INITIAL_STUDENT_REQUESTS);
  });

  // Effective student requests
  const allRequests = studentRequests && studentRequests.length > 0 ? studentRequests : localRequests;
  const myRequests = allRequests.filter(
    (r) =>
      r.studentId === user.id ||
      (user.enrollmentNo && r.enrollmentNo === user.enrollmentNo) ||
      (user.name && r.studentName.toLowerCase() === user.name.toLowerCase())
  );

  const pendingMyRequestsCount = myRequests.filter((r) => r.status === 'Pending').length;

  // Find all approved leaves / sanction requests for this student
  const approvedLeaves = useMemo(() => {
    return myRequests.filter(
      (r) => r.status === 'Approved' && r.startDate && r.endDate
    );
  }, [myRequests]);

  // Determine if the current date selection overlaps with any approved leave
  const overlappingApprovedLeave = useMemo(() => {
    if (!startDate || !endDate) return null;
    return (
      approvedLeaves.find((approved) =>
        doDateRangesOverlap(startDate, endDate, approved.startDate, approved.endDate)
      ) || null
    );
  }, [approvedLeaves, startDate, endDate]);

  // Calculate next eligible date immediately following the conflicting approved leave
  const nextAvailableStartDate = useMemo(() => {
    if (!overlappingApprovedLeave) return null;
    const latestEnd =
      overlappingApprovedLeave.startDate <= overlappingApprovedLeave.endDate
        ? overlappingApprovedLeave.endDate
        : overlappingApprovedLeave.startDate;
    return getNextDayDateStr(latestEnd);
  }, [overlappingApprovedLeave]);

  // Helper to quickly adjust date picker to first available unblocked date
  const handleShiftToNextAvailableDate = () => {
    if (nextAvailableStartDate) {
      setStartDate(nextAvailableStartDate);
      setEndDate(nextAvailableStartDate);
    }
  };

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLeaveModalOpen) {
        setIsLeaveModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeaveModalOpen]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim() || !requestReason.trim()) return;

    if (overlappingApprovedLeave) {
      alert(
        `Leave Submission Blocked: You already have an Approved leave from ${formatDateRange(
          overlappingApprovedLeave.startDate,
          overlappingApprovedLeave.endDate
        )} ("${overlappingApprovedLeave.subject}"). Once approved, university regulations strictly prohibit applying for another leave up to ${
          overlappingApprovedLeave.endDate
        }.`
      );
      return;
    }

    await withLoading(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newReqPayload: Omit<StudentRequest, 'id' | 'submittedAt' | 'status'> = {
        studentId: user.id,
        studentName: user.name,
        enrollmentNo: user.enrollmentNo || '24222201016',
        departmentId: user.departmentId || 'dept_it',
        departmentName: user.departmentName || 'Information Technology',
        semester: user.semester || 5,
        recipientRole,
        requestType: requestCategory,
        subject: requestSubject.trim(),
        reason: requestReason.trim(),
        startDate,
        endDate,
        days: `${startDate} to ${endDate}`,
        attachment: 'Student_Application_Details.pdf',
      };

      if (onSubmitStudentRequest) {
        onSubmitStudentRequest(newReqPayload);
      } else {
        const fullReq: StudentRequest = {
          ...newReqPayload,
          id: `req_${Date.now()}`,
          submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'Pending',
        };
        const updated = [fullReq, ...localRequests];
        setLocalRequests(updated);
        safeStorageSet('lbu_student_requests', updated);

        // Notify both HOD and Admin
        const hodNotif: NotificationItem = {
          id: `notif_hod_${Date.now()}`,
          role: 'hod',
          title: `📩 New Student Request: ${fullReq.studentName}`,
          message: `${fullReq.studentName} (${fullReq.enrollmentNo}, Sem ${fullReq.semester}) submitted: "${fullReq.subject}"`,
          type: 'request',
          targetTab: 'dashboard',
          targetModal: 'student_requests',
          targetId: fullReq.id,
          isRead: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const adminNotif: NotificationItem = {
          id: `notif_admin_${Date.now() + 1}`,
          role: 'admin',
          title: `📩 New Student Request: ${fullReq.studentName}`,
          message: `${fullReq.studentName} (${fullReq.enrollmentNo}, Sem ${fullReq.semester}) submitted: "${fullReq.subject}"`,
          type: 'request',
          targetTab: 'dashboard',
          targetModal: 'student_requests',
          targetId: fullReq.id,
          isRead: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const curNotifs = safeStorageGet<NotificationItem[]>('lbu_notifications', []);
        safeStorageSet('lbu_notifications', [hodNotif, adminNotif, ...curNotifs]);
      }

      setRequestSubject('');
      setRequestReason('');
      setModalTab('history');
    }, `Sending Request directly to ${recipientRole === 'hod' ? 'Head of Department (HOD)' : 'University Administration'}...`);
  };

  // Extract student's specific absence logs with date, day, lecture time window, extent & subject
  const studentAbsenceLogs = (attendanceRecords || [])
    .map((record) => {
      const entry = (record.studentEntries || []).find((e) => e.studentId === user.id);
      return {
        recordId: record.id,
        date: record.date,
        subjectName: record.subjectName,
        teacherName: record.teacherName,
        classroom: record.classroom,
        lectureTime: record.lectureTime || '09:00 AM - 10:00 AM',
        status: entry?.status || 'present',
        remarks: entry?.remarks || 'Class session completed',
      };
    })
    .filter((item) => item.status === 'absent' || item.status === 'late');

  // Helper to parse time string like "09:00 AM" or "02:00 PM" into minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : 'AM';

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  // Get live current time in minutes
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Sort single-day classes chronologically
  const sortedSingleDayClasses = [...todayClasses].sort(
    (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );

  // Dynamic chronologically next class identifier
  let liveIndex = -1;
  let nextIndex = -1;

  sortedSingleDayClasses.forEach((slot, idx) => {
    const startMins = parseTimeToMinutes(slot.startTime);
    const endMins = parseTimeToMinutes(slot.endTime);
    if (currentMinutes >= startMins && currentMinutes < endMins) {
      liveIndex = idx;
    }
  });

  if (liveIndex !== -1) {
    if (liveIndex + 1 < sortedSingleDayClasses.length) {
      nextIndex = liveIndex + 1;
    }
  } else {
    nextIndex = sortedSingleDayClasses.findIndex(
      (slot) => currentMinutes < parseTimeToMinutes(slot.endTime)
    );
  }

  // Attendance Analytics calculation for today
  const totalTodayClasses = sortedSingleDayClasses.length;
  const completedTodayClasses = sortedSingleDayClasses.filter(
    (s) => currentMinutes >= parseTimeToMinutes(s.endTime)
  ).length;

  const todayAbsenceCount = studentAbsenceLogs.filter((log) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return log.date === todayStr || log.date === '2026-08-08';
  }).length;

  const classesAttendedToday = Math.max(
    0,
    (completedTodayClasses > 0 ? completedTodayClasses : totalTodayClasses) - todayAbsenceCount
  );

  const displayTodayPercent = totalTodayClasses > 0
    ? Math.round((classesAttendedToday / totalTodayClasses) * 100)
    : Math.round(attendancePercentage);

  // SVG Donut Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const svgCircumference = circumference;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, displayTodayPercent))) / 100;

  // 30-Day Attendance Trend Dataset for Recharts
  const attendanceTrendData = useMemo(() => {
    const daysMap: Record<string, { date: string; displayDate: string; present: number; total: number }> = {};
    const todayObj = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[dateStr] = { date: dateStr, displayDate, present: 0, total: 0 };
    }

    (attendanceRecords || []).forEach((record) => {
      if (daysMap[record.date]) {
        const entry = (record.studentEntries || []).find((e) => e.studentId === user.id);
        daysMap[record.date].total += 1;
        if (entry && (entry.status === 'present' || entry.status === 'late')) {
          daysMap[record.date].present += 1;
        }
      }
    });

    return Object.values(daysMap).map((item, index) => {
      let pct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 85;
      if (item.total === 0) {
        const pseudoVal = 82 + ((index * 9 + 3) % 17);
        pct = Math.min(100, Math.max(72, pseudoVal));
      }
      return {
        date: item.displayDate,
        fullDate: item.date,
        attendance: pct,
        attended: item.total > 0 ? item.present : Math.round((pct / 100) * 4),
        total: item.total > 0 ? item.total : 4,
      };
    });
  }, [attendanceRecords, user.id]);

  // Trigger Toast Notification for 10-Min Pre-Class Alert
  const handleTriggerNextClassToast = () => {
    const nextSlot = nextIndex !== -1 ? sortedSingleDayClasses[nextIndex] : sortedSingleDayClasses[0];
    if (!nextSlot) return;

    const alertNotice: Notice = {
      id: `toast_pre_class_${nextSlot.id}_${Date.now()}`,
      title: `⏰ Next Class Alert: ${nextSlot.subjectCode} - ${nextSlot.subjectName}`,
      content: `Your class starts in 10 minutes at ${nextSlot.startTime} in Room ${nextSlot.classroom} with Prof. ${nextSlot.teacherName}.`,
      category: 'urgent',
      postedBy: 'system',
      postedByName: 'Automated Schedule Reminder',
      postedByRole: 'SYSTEM',
      date: new Date().toISOString().split('T')[0],
      isPinned: true,
      departmentName: user.departmentName || 'Lokbharati ERP',
    };

    if (onTriggerToast) {
      onTriggerToast(alertNotice);
    }
  };

  // Export Attendance PDF Report Handler
  const handleExportAttendancePDF = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) return;

    const reportDate = new Date().toLocaleDateString('en-US', { dateStyle: 'full' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Transcript - ${user.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 3px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .university-title { font-size: 24px; font-weight: 800; color: #065f46; text-transform: uppercase; margin: 0; }
            .sub-title { font-size: 13px; color: #475569; margin-top: 4px; }
            .student-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
            .student-card strong { color: #0f172a; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
            .stat-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; text-align: center; }
            .stat-num { font-size: 22px; font-weight: 800; color: #047857; }
            .stat-label { font-size: 10px; text-transform: uppercase; color: #065f46; font-weight: 700; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge-good { color: #047857; font-weight: 700; background: #d1fae5; padding: 3px 8px; border-radius: 4px; font-size: 10px; }
            .badge-warn { color: #be123c; font-weight: 700; background: #ffe4e6; padding: 3px 8px; border-radius: 4px; font-size: 10px; }
            .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; pt: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="university-title">Lokbharati University</h1>
              <div class="sub-title">Department of ${user.departmentName || 'Computer Science & IT'} • Official Attendance Report</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Issued Date: <strong>${reportDate}</strong>
            </div>
          </div>

          <div class="student-card">
            <div><strong>Student Name:</strong> ${user.name}</div>
            <div><strong>Enrollment No:</strong> ${user.enrollmentNo || 'LOK2026CS409'}</div>
            <div><strong>Department:</strong> ${user.departmentName || 'Computer Science'}</div>
            <div><strong>Academic Semester:</strong> Semester ${user.semester || 4}</div>
          </div>

          <div class="summary-grid">
            <div class="stat-box">
              <div class="stat-num">${attendancePercentage}%</div>
              <div class="stat-label">Cumulative Attendance</div>
            </div>
            <div class="stat-box" style="background: #eff6ff; border-color: #bfdbfe;">
              <div class="stat-num" style="color: #1d4ed8;">${attendanceTrendData.slice(-30).reduce((acc, curr) => acc + curr.attended, 0)}</div>
              <div class="stat-label" style="color: #1e40af;">Classes Attended (30d)</div>
            </div>
            <div class="stat-box" style="background: #fef2f2; border-color: #fecaca;">
              <div class="stat-num" style="color: #b91c1c;">${studentAbsenceLogs.length}</div>
              <div class="stat-label" style="color: #991b1b;">Absences Logged</div>
            </div>
            <div class="stat-box" style="background: #fefce8; border-color: #fef08a;">
              <div class="stat-num" style="color: #a16207;">75%</div>
              <div class="stat-label" style="color: #854d0e;">Minimum Threshold</div>
            </div>
          </div>

          <h3 style="margin-bottom: 8px;">30-Day Attendance Ledger Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Classes Attended</th>
                <th>Daily Rate %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceTrendData.map((row) => `
                <tr>
                  <td>${row.fullDate}</td>
                  <td>${row.date}</td>
                  <td>${row.attended} / ${row.total}</td>
                  <td><strong>${row.attendance}%</strong></td>
                  <td>
                    <span class="${row.attendance >= 75 ? 'badge-good' : 'badge-warn'}">
                      ${row.attendance >= 75 ? 'SATISFACTORY' : 'ATTENTION REQ.'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Verified Academic Record • Lokbharati ERP System</div>
            <div>Page 1 of 1</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-emerald-500/30 backdrop-blur-md">
                Monsoon Semester 2026 • {user.departmentName}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <Calendar className="w-3 h-3 text-emerald-400" />
                {fullFormatted}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
              Enrollment No: <span className="font-mono font-bold text-white">{user.enrollmentNo}</span> • Semester {user.semester}
            </p>

            {/* Quick Action Button: Student Requests */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                id="btn-hero-student-requests"
                type="button"
                onClick={() => {
                  setModalTab('create');
                  setIsLeaveModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 text-white font-bold text-xs border border-amber-500/80 shadow-lg shadow-black/50 hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                title="Send Leave Application or Official Petition to HOD / Admin"
                aria-label="Open Student Requests and Petitions Desk"
              >
                <FileText className="w-4 h-4 text-amber-400 shrink-0 group-hover:rotate-6 transition-transform" />
                <span className="tracking-wide">Student Requests Desk</span>
                {pendingMyRequestsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                    {pendingMyRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Official Lokbharti University Emblem Logo */}
          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-950/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-xl shrink-0">
            <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0 ring-2 ring-emerald-500/30">
              <img
                src={LOKBHARTI_LOGO}
                alt="Lokbharti University Seal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-black tracking-wide uppercase text-white">Lokbharti University</div>
              <div className="text-[11px] text-emerald-300 font-medium">Gramvidyapith • Sanosara</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 font-bold">NAAC Grade A+ Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards & Attendance Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div
          onClick={() => onSelectTab('attendance')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            isLowAttendance
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 text-rose-900 dark:text-rose-100'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Overall Attendance</span>
            <UserCheck className={`w-5 h-5 ${isLowAttendance ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${isLowAttendance ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
              {attendancePercentage}%
            </span>
            {isLowAttendance && (
              <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Warning (&lt;75%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isLowAttendance ? 'Immediate attendance required to avoid debarment' : 'You meet academic eligibility standards'}
          </p>
        </div>

        {/* Pending Assignments */}
        <div
          onClick={() => onSelectTab('assignments')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Assignments</span>
            <FileCheck2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {assignments.filter((a) => !isPast24HoursAfterDueDate(a.dueDate)).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Auto-removes 24h post-deadline</p>
        </div>

        {/* Upcoming Quiz */}
        <div
          onClick={() => onSelectTab('quiz')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Quizzes</span>
            <HelpCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {quizzes.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Timed MCQ tests available</p>
        </div>

        {/* Study Materials */}
        <div
          onClick={() => onSelectTab('materials')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Study Materials</span>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {materials.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">PDFs, PPTs, & Recorded Lectures</p>
        </div>
      </div>

      {/* ATTENDANCE ANALYTICS CARD WITH RECHARTS TREND CHART & PDF EXPORT */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-800/50 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Circular Progress Donut */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className={displayTodayPercent >= 75 ? "text-emerald-400" : "text-amber-400"}
                  strokeWidth="8"
                  strokeDasharray={svgCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black tracking-tight text-white">{displayTodayPercent}%</span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300">Today</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <PieChart className="w-3 h-3 text-emerald-400" /> Attendance Analytics
                </span>
                <span className="text-xs text-slate-400 font-mono">{dayName}, {monthName} {dayNum}</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Attendance Analytics
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Classes Attended Today: <strong className="text-emerald-400 font-extrabold">{classesAttendedToday}</strong> / Total Today: <strong className="text-white font-extrabold">{totalTodayClasses}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Present Today: {classesAttendedToday}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Overall Avg: {attendancePercentage}%
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Min Threshold: 75%
                </span>
              </div>
            </div>
          </div>

          {/* Export PDF & Quick Navigation Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              onClick={handleExportAttendancePDF}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-300"
            >
              <Download className="w-4 h-4" /> Export Attendance PDF
            </button>
            <button
              onClick={() => onSelectTab('attendance')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" /> Full Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule & Quiz Launcher */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Class Schedule & Faculty Allocation Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's Department Schedule ({user.departmentName})
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Semester {user.semester} • Hover any slot for professor & classroom details
                </p>
              </div>
            </div>

            {/* Next Class Spotlight Banner */}
            {nextIndex !== -1 && sortedSingleDayClasses[nextIndex] && (() => {
              const nextSlot = sortedSingleDayClasses[nextIndex];
              const nextBadgeStyle = getSubjectBadgeStyle(nextSlot.subjectCode, nextSlot.subjectName);
              return (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                          Next Class Spotlight
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${nextBadgeStyle.bg} ${nextBadgeStyle.text} ${nextBadgeStyle.border}`}>
                          {nextSlot.subjectCode}
                        </span>
                        <span className="text-xs font-mono text-amber-300 font-bold">
                          {nextSlot.startTime} - {nextSlot.endTime}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white mt-0.5">
                        {nextSlot.subjectName}
                      </h4>
                      <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-0.5">
                        <span>Faculty: <strong className="text-amber-200">{nextSlot.teacherName}</strong></span>
                        <span>Venue: <strong className="text-amber-200">{nextSlot.classroom}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={handleTriggerNextClassToast}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-300"
                    >
                      <BellRing className="w-3.5 h-3.5 animate-bounce" /> Notify 10m Before Class
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* TODAY'S SCHEDULE TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-3">Time Slot</th>
                    <th className="p-3">Subject & Badge</th>
                    <th className="p-3">Faculty / Teacher</th>
                    <th className="p-3">Classroom / Venue</th>
                    <th className="p-3 text-right">Live Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {sortedSingleDayClasses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No lectures scheduled for today ({dayName}).
                      </td>
                    </tr>
                  ) : (
                    sortedSingleDayClasses.map((slot, idx) => {
                      const startMins = parseTimeToMinutes(slot.startTime);
                      const endMins = parseTimeToMinutes(slot.endTime);

                      const isCompleted = currentMinutes >= endMins;
                      const isLive = idx === liveIndex;
                      const isNextClass = idx === nextIndex;
                      const badgeStyle = getSubjectBadgeStyle(slot.subjectCode, slot.subjectName);

                      return (
                        <tr
                          key={slot.id}
                          className={`transition-all relative group ${
                            isCompleted
                              ? 'opacity-40 grayscale hover:opacity-75 bg-slate-50/60 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500'
                              : isNextClass
                              ? 'bg-amber-500/10 dark:bg-amber-950/50 text-slate-900 dark:text-white shadow-md border-l-4 border-amber-500 font-bold ring-1 ring-amber-500/20'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <td className={`p-3 font-mono whitespace-nowrap ${
                            isNextClass
                              ? 'text-amber-500 dark:text-amber-400 font-extrabold'
                              : isCompleted
                              ? 'text-slate-400 dark:text-slate-500 line-through'
                              : 'font-bold text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {slot.startTime} – {slot.endTime}
                          </td>

                          {/* Subject Cell with Color-Coded Badge & Hover Tooltip */}
                          <td className="p-3 relative">
                            <div className="flex items-center gap-2 cursor-pointer">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-black border shadow-xs ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                                {slot.subjectCode}
                              </span>
                              <span className={isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : isNextClass ? 'font-black text-amber-900 dark:text-amber-200' : 'font-bold text-slate-900 dark:text-white'}>
                                {slot.subjectName}
                              </span>
                            </div>

                            {/* Hover Tooltip Popover */}
                            <div className="absolute left-4 bottom-full mb-2 hidden group-hover:flex flex-col p-3 rounded-xl bg-slate-950 text-white text-xs shadow-2xl border border-slate-700 z-50 min-w-[240px] pointer-events-none transition-all animate-fadeIn">
                              <div className="font-bold text-emerald-400 text-xs flex items-center justify-between">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${badgeStyle.bg} ${badgeStyle.text}`}>
                                  {slot.subjectCode}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="text-xs font-extrabold text-white mt-1">{slot.subjectName}</div>
                              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-2">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Professor: <strong>{slot.teacherName}</strong></span>
                              </div>
                              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Designated Room: <strong>{slot.classroom}</strong></span>
                              </div>
                            </div>
                          </td>

                          <td className={`p-3 ${isNextClass ? 'text-amber-900 dark:text-amber-100 font-bold' : isCompleted ? 'text-slate-400 dark:text-slate-500' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                            {slot.teacherName}
                          </td>

                          <td className={`p-3 ${isNextClass ? 'text-amber-800 dark:text-amber-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                            {slot.classroom}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap">
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200/60 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                Completed
                              </span>
                            )}
                            {isNextClass && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 font-bold shadow-xs inline-flex items-center gap-1 animate-bounce-short">
                                <Clock className="w-3 h-3" /> Next Class
                              </span>
                            )}
                            {isLive && !isNextClass && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                In Progress
                              </span>
                            )}
                            {!isCompleted && !isLive && !isNextClass && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Scheduled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* SUBJECT COLOR BADGE LEGEND */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Subject Color Badges:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { code: 'CS101', name: 'Database Systems' },
                  { code: 'CS102', name: 'Data Structures' },
                  { code: 'CS103', name: 'Web Dev' },
                  { code: 'CS104', name: 'Cloud Computing' },
                  { code: 'EE201', name: 'Digital Logic' },
                  { code: 'MA301', name: 'Discrete Math' },
                ].map((item) => {
                  const b = getSubjectBadgeStyle(item.code, item.name);
                  return (
                    <span
                      key={item.code}
                      className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border shadow-2xs ${b.bg} ${b.text} ${b.border}`}
                    >
                      {item.code}: {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Absence & Class Timestamp Details Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    My Recorded Absences & Class Timestamps
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Exact date, day, lecture time window, and extent for missed or late sessions
                </p>
              </div>

              <button
                onClick={() => onSelectTab('attendance')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                View Full Attendance Ledger <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {studentAbsenceLogs.length === 0 ? (
              <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">100% Perfect Class Record</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    No recorded absences or late arrivals logged for your account. Keep up the excellent work!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {studentAbsenceLogs.map((log) => {
                  const dateInfo = formatDateWithDay(log.date);
                  return (
                    <div
                      key={log.recordId}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        log.status === 'absent'
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            log.status === 'absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {log.status === 'absent' ? 'ABSENT (1.0 HR EXTENT)' : 'LATE ARRIVAL'}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {dateInfo.fullDateStr || log.date}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pt-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{log.subjectName}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Session Time: {log.lectureTime}
                          </span>
                          <span>Faculty: {log.teacherName}</span>
                          <span>Venue: {log.classroom}</span>
                        </div>

                        {log.remarks && (
                          <p className="text-[11px] italic text-slate-500 dark:text-slate-400 pt-0.5">
                            Note: {log.remarks}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onSelectTab('attendance')}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs shrink-0 self-start sm:self-center"
                      >
                        Request Correction
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Leave Requests & Institutional Petitions Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Student Leave Requests & Official Petitions
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Submit formal leave applications, medical exemptions, and official petitions directly to HOD or University Administration
                </p>
              </div>

              {/* Exact Styled Pill Button matching user image */}
              <button
                id="btn-student-requests-leave"
                type="button"
                onClick={() => {
                  setModalTab('create');
                  setIsLeaveModalOpen(true);
                }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-850 text-white font-bold text-xs border border-amber-500/80 shadow-lg shadow-black/50 hover:border-amber-400 hover:shadow-amber-500/25 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer group shrink-0 self-start sm:self-center focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                aria-label="Open Student Requests and Petitions Form"
              >
                <FileText className="w-4 h-4 text-amber-400 shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span className="tracking-wide text-white">Student Requests</span>
                {pendingMyRequestsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500 text-slate-950 font-black">
                    {pendingMyRequestsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Existing Submissions List */}
            {myRequests.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <FilePlus className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No Active Leave Requests
                </p>
                <p className="text-[11px] text-slate-500">
                  Click the &quot;Student Requests&quot; button above to submit a new leave or on-duty permission.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : req.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Recipient: {req.recipientRole === 'hod' ? 'Department Head (HOD)' : 'Dean / Admin'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          • {req.startDate} to {req.endDate}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {req.subject}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                        {req.reason}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 shrink-0 sm:text-right">
                      <span>Submitted: {req.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Quiz Widget */}
          {quizzes.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                  Active Quiz Ready
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {quizzes[0].title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subject: {quizzes[0].subjectName} • Duration: {quizzes[0].durationMinutes} Mins
                </p>
              </div>
              <button
                onClick={() => onStartQuiz(quizzes[0].id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" /> Start Quiz
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Notices */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Notices</h3>
              </div>
              <button
                onClick={() => onSelectTab('notices')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => {
                const isRead = readNoticeIds.includes(notice.id);
                return (
                  <div
                    key={notice.id}
                    onClick={() => {
                      if (!isRead && onMarkNoticeAsRead) onMarkNoticeAsRead(notice.id);
                      onSelectTab('notices');
                    }}
                    className={`p-3.5 rounded-2xl border transition-all space-y-1.5 cursor-pointer hover:scale-[1.01] ${
                      !isRead
                        ? 'bg-gradient-to-r from-emerald-50/80 to-white dark:from-emerald-950/30 dark:to-slate-800/80 border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800/60 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!isRead && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-amber-500 text-white shadow-sm animate-pulse">
                            <Sparkles className="w-2.5 h-2.5" /> NEW
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            notice.category === 'urgent' || notice.category === 'general'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : notice.category === 'exam'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : notice.category === 'academic'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : notice.category === 'admission'
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : notice.category === 'scholarship'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : notice.category === 'events'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                              : notice.category === 'placement' || notice.category === 'vacancy'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : notice.category === 'hostel'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                              : notice.category === 'finance'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {notice.category === 'exam'
                            ? 'Examination'
                            : notice.category === 'placement' || notice.category === 'vacancy'
                            ? 'Placement'
                            : notice.category === 'events'
                            ? 'Events'
                            : notice.category === 'finance'
                            ? 'Finance'
                            : notice.category === 'hostel'
                            ? 'Hostel'
                            : notice.category === 'general'
                            ? 'General'
                            : notice.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{notice.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {notice.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                      {notice.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Student Request Modal */}
      {isLeaveModalOpen && (
        <div
          id="student-leave-request-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLeaveModalOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Student Requests & Leave Applications
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official requests sent directly to Head of Department (HOD) or Administration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setModalTab('create')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === 'create'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Submit New Request</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('history')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === 'history'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>My Submitted Requests ({myRequests.length})</span>
                {pendingMyRequestsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Form Content / History View */}
            {modalTab === 'create' ? (
              <form onSubmit={handleSubmitLeave} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Active Approved Leaves Notice */}
                {approvedLeaves.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Active Approved Leaves ({approvedLeaves.length})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                        Sanctioned
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mb-2 leading-relaxed">
                      You have active approved leave periods on record. New leave applications cannot overlap with any of these sanctioned dates:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {approvedLeaves.map((al) => (
                        <div
                          key={al.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 shadow-sm"
                        >
                          <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{formatDateRange(al.startDate, al.endDate)}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                            ({formatRequestCategory(al.requestType)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recipient Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Recipient *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecipientRole('hod')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        recipientRole === 'hod'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold">Head of Dept (HOD)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Academic, Attendance, Medical & Exam Leaves
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientRole('admin')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        recipientRole === 'admin'
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold">Dean / Administration</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Hostel, Campus, Fees & General Petitions
                      </p>
                    </button>
                  </div>
                </div>

                {/* Request Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Request Nature / Category
                  </label>
                  <select
                    value={requestCategory}
                    onChange={(e) => {
                      const sel = e.target.value as StudentRequestCategory;
                      setRequestCategory(sel);
                      const catConfig = STUDENT_REQUEST_CATEGORIES.find((c) => c.id === sel);
                      if (catConfig?.defaultRecipient) {
                        setRecipientRole(catConfig.defaultRecipient);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {STUDENT_REQUEST_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {STUDENT_REQUEST_CATEGORIES.find((c) => c.id === requestCategory)?.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pl-0.5">
                      {STUDENT_REQUEST_CATEGORIES.find((c) => c.id === requestCategory)?.description}
                    </p>
                  )}
                </div>

                {/* Date Ranges */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        From Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStartDate(val);
                          if (endDate < val) setEndDate(val);
                        }}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-medium text-slate-900 dark:text-slate-100 ${
                          overlappingApprovedLeave
                            ? 'border-rose-400 ring-2 ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        To Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEndDate(val);
                          if (val < startDate) setStartDate(val);
                        }}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-medium text-slate-900 dark:text-slate-100 ${
                          overlappingApprovedLeave
                            ? 'border-rose-400 ring-2 ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Overlap Restriction Alert Banner */}
                  {overlappingApprovedLeave && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-start gap-2.5 text-rose-900 dark:text-rose-200">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Leave Overlap Prohibited — Approved Leave Active</p>
                          <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                            You already have an <strong>Approved</strong> leave from{' '}
                            <strong>
                              {formatDateRange(overlappingApprovedLeave.startDate, overlappingApprovedLeave.endDate)}
                            </strong>{' '}
                            (<em>"{overlappingApprovedLeave.subject}"</em>). Once approved, you cannot take or apply for another leave up to{' '}
                            <strong>{formatDateWithDay(overlappingApprovedLeave.endDate).shortDateStr}</strong>.
                          </p>
                        </div>
                      </div>
                      {nextAvailableStartDate && (
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-rose-200/60 dark:border-rose-800/40">
                          <span className="text-[11px] text-rose-800 dark:text-rose-300">
                            Next available eligible date:{' '}
                            <strong className="font-mono">{formatDateWithDay(nextAvailableStartDate).shortDateStr}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={handleShiftToNextAvailableDate}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Select Next Available Date ({formatDateWithDay(nextAvailableStartDate).shortDateStr})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Duty Leave Sanction for Inter-University NSS Event"
                    value={requestSubject}
                    onChange={(e) => setRequestSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Reason Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Explanation / Justification *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="State complete details, event location, medical certificate references, or reasons for leave..."
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!overlappingApprovedLeave}
                    title={
                      overlappingApprovedLeave
                        ? `Blocked: Overlaps with approved leave until ${overlappingApprovedLeave.endDate}`
                        : ''
                    }
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all ${
                      overlappingApprovedLeave
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer'
                    }`}
                  >
                    {overlappingApprovedLeave ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-rose-500" />
                        <span>Dates Overlap with Approved Leave</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit to {recipientRole === 'hod' ? 'HOD' : 'Admin'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-3 overflow-y-auto flex-1 max-h-[60vh]">
                {myRequests.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No Sent Requests</p>
                    <p>You have not submitted any leave or official petition requests yet.</p>
                    <button
                      type="button"
                      onClick={() => setModalTab('create')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 mt-2"
                    >
                      Submit a Request Now
                    </button>
                  </div>
                ) : (
                  myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {req.subject}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              To: {req.recipientRole === 'hod' ? 'HOD' : 'Admin'}
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                            {req.days || `${req.startDate} to ${req.endDate}`} • {formatRequestCategory(req.requestType)}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : req.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/40">
                        {req.reason}
                      </p>

                      {req.reviewComment && (
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{req.recipientRole === 'admin' ? 'Administration Decision' : 'HOD Decision'}: <strong>{req.reviewComment}</strong> {req.reviewedBy ? `(by ${req.reviewedBy})` : ''}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                        <span>ID: {req.id}</span>
                        <span>Submitted: {req.submittedAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
