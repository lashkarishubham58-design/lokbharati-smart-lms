import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Lock,
  Edit3,
  AlertTriangle,
  Send,
  BarChart2,
  TrendingUp,
  Download,
  Filter,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  CalendarDays,
  RotateCcw
} from 'lucide-react';

const getDayOfWeekName = (dateStr: string) => {
  if (!dateStr) return 'Tuesday';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(dateStr + 'T12:00:00');
  return days[d.getDay()] || 'Tuesday';
};

const parseSlotMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hrs = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && hrs < 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const parse24hTimeInMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  return h * 60 + m;
};

const formatTime12hDisplay = (timeStr: string): string => {
  if (!timeStr) return '08:40 AM';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  User,
  AttendanceRecord,
  AttendanceEditRequest,
  AttendanceStatus,
  Department
} from '../../types';
import { DEPARTMENTS, SUBJECTS, INITIAL_USERS, TIMETABLES } from '../../data/mockDatabase';
import { exportToCSV, printFormattedPDFReport } from '../../utils/exporter';
import { formatDateWithDay } from '../../utils/dateUtils';

interface SmartAttendanceProps {
  user: User;
  attendanceRecords: AttendanceRecord[];
  editRequests: AttendanceEditRequest[];
  onSubmitAttendance: (record: AttendanceRecord) => void;
  onRequestEdit: (req: Partial<AttendanceEditRequest>) => void;
  onApproveEdit: (requestId: string, status: 'approved' | 'rejected', comment?: string) => void;
}

export const SmartAttendance: React.FC<SmartAttendanceProps> = ({
  user,
  attendanceRecords = [],
  editRequests = [],
  onSubmitAttendance = (_record) => {},
  onRequestEdit = (_req) => {},
  onApproveEdit = (_requestId, _status, _comment) => {},
}) => {
  // Academic term cycle state: 'odd' (1, 3, 5) or 'even' (2, 4, 6)
  // According to the official Academic Calendar (July 2026), 'odd' term (June–Nov 2026) is currently active.
  const initialCycle: 'odd' | 'even' = 'odd';
  const [academicCycle, setAcademicCycle] = useState<'odd' | 'even'>(initialCycle);

  const availableSemesters = academicCycle === 'odd' ? [1, 3, 5] : [2, 4, 6];

  const [selectedDepartment, setSelectedDepartment] = useState(user.departmentId || 'dept_it');
  const [selectedSemester, setSelectedSemester] = useState(() => {
    if (user.semester && availableSemesters.includes(user.semester)) {
      return user.semester;
    }
    return availableSemesters.includes(3) ? 3 : availableSemesters[0];
  });

  useEffect(() => {
    if (user.role === 'student' && user.departmentId) {
      setSelectedDepartment(user.departmentId);
    }
  }, [user]);
  const [activeTab, setActiveTab] = useState<'mark' | 'history' | 'requests' | 'analytics'>('mark');

  const handleCycleChange = (cycle: 'odd' | 'even') => {
    setAcademicCycle(cycle);
    const newSemesters = cycle === 'odd' ? [1, 3, 5] : [2, 4, 6];
    if (!newSemesters.includes(selectedSemester)) {
      setSelectedSemester(newSemesters[0]);
    }
  };

  // Attendance marking state (Separate Date & Time)
  const getInitialDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getInitialTimeStr = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDateStr);
  const [selectedTime, setSelectedTime] = useState<string>(getInitialTimeStr);

  const selectedDayName = getDayOfWeekName(selectedDate);

  // Auto-detect matching Department, Semester, and Slot for logged-in faculty/user based on Date & Time
  const autoDetectSlot = (dateStr: string, timeStr: string) => {
    const dayName = getDayOfWeekName(dateStr);
    const targetMins = parse24hTimeInMinutes(timeStr);

    const isUserTeacherOfSlot = (slotTeacherName?: string, slotTeacherId?: string) => {
      if (!slotTeacherName && !slotTeacherId) return false;
      if (slotTeacherId && slotTeacherId === user.id) return true;
      const uName = (user.name || '').toLowerCase();
      const sName = (slotTeacherName || '').toLowerCase();
      if (uName.includes('rishu') && sName.includes('rishu')) return true;
      if (uName.includes('raj') && sName.includes('rishu')) return true;
      const userTokens = uName.replace(/(prof|dr|mr|mrs|ms)\.?\s+/gi, '').split(' ').filter(Boolean);
      return userTokens.some((tok) => tok.length > 2 && sName.includes(tok));
    };

    const validDeptIds = new Set(DEPARTMENTS.map((d) => d.id));

    let daySlots = TIMETABLES.filter(
      (t) => validDeptIds.has(t.departmentId) && t.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );
    if (daySlots.length === 0) {
      daySlots = TIMETABLES.filter((t) => validDeptIds.has(t.departmentId));
    }

    let teacherSlots = daySlots.filter((t) => isUserTeacherOfSlot(t.teacherName, t.teacherId));
    if (teacherSlots.length === 0 && user.departmentId && validDeptIds.has(user.departmentId)) {
      teacherSlots = daySlots.filter((t) => t.departmentId === user.departmentId);
    }

    const candidatePool = teacherSlots.length > 0 ? teacherSlots : daySlots;

    if (candidatePool.length > 0) {
      let bestSlot = candidatePool[0];
      let minDiff = Infinity;

      for (const slot of candidatePool) {
        const startMins = parseSlotMinutes(slot.startTime);
        const endMins = parseSlotMinutes(slot.endTime);

        if (targetMins >= startMins && targetMins <= endMins) {
          bestSlot = slot;
          minDiff = 0;
          break;
        }

        const diff = Math.abs(targetMins - startMins);
        if (diff < minDiff) {
          minDiff = diff;
          bestSlot = slot;
        }
      }

      if (bestSlot) {
        setSelectedDepartment(bestSlot.departmentId);
        setSelectedSemester(bestSlot.semester);
        setSelectedSlotId(bestSlot.id);

        if ([1, 3, 5].includes(bestSlot.semester)) {
          setAcademicCycle('odd');
        } else if ([2, 4, 6].includes(bestSlot.semester)) {
          setAcademicCycle('even');
        }
      }
    }
  };

  // Automatically trigger schedule detection when user logs in or mounts
  useEffect(() => {
    autoDetectSlot(selectedDate, selectedTime);
  }, [user.id, user.role]);

  const handleSetCurrentDateTime = () => {
    const dStr = getInitialDateStr();
    const tStr = getInitialTimeStr();
    setSelectedDate(dStr);
    setSelectedTime(tStr);
    autoDetectSlot(dStr, tStr);
  };

  // Resolve timetable slots & subjects for selected Department & Semester
  const matchingTimetableSlots = TIMETABLES.filter(
    (t) => t.departmentId === selectedDepartment && t.semester === selectedSemester
  );
  const matchingSubjects = SUBJECTS.filter(
    (s) => s.departmentId === selectedDepartment && s.semester === selectedSemester
  );

  // Available unique subjects for selected Department & Semester
  const availableSubjects = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    matchingSubjects.forEach((s) => {
      map.set(s.code, { code: s.code, name: s.name });
    });
    matchingTimetableSlots.forEach((slot) => {
      if (slot.subjectCode && !map.has(slot.subjectCode)) {
        map.set(slot.subjectCode, { code: slot.subjectCode, name: slot.subjectName });
      }
    });
    return Array.from(map.values());
  }, [matchingSubjects, matchingTimetableSlots]);

  // Available unique lecture time slots for selected Department & Semester
  const availableTimeSlots = useMemo(() => {
    const map = new Map<string, { startTime: string; endTime: string; label: string }>();
    matchingTimetableSlots.forEach((slot) => {
      const key = `${slot.startTime} - ${slot.endTime}`;
      if (key !== '08:30 AM - 09:30 AM' && !map.has(key)) {
        map.set(key, {
          startTime: slot.startTime,
          endTime: slot.endTime,
          label: key,
        });
      }
    });
    if (map.size === 0) {
      const defaultTimes = [
        '07:30 AM - 08:30 AM',
        '08:40 AM - 09:40 AM',
        '09:40 AM - 10:40 AM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM',
      ];
      defaultTimes.forEach((dt) => {
        const [st, et] = dt.split(' - ');
        map.set(dt, { startTime: st, endTime: et, label: dt });
      });
    }
    return Array.from(map.values()).sort(
      (a, b) => parseSlotMinutes(a.startTime) - parseSlotMinutes(b.startTime)
    );
  }, [matchingTimetableSlots]);

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    if (matchingTimetableSlots.length > 0) {
      const exists = matchingTimetableSlots.some((s) => s.id === selectedSlotId);
      if (!exists) {
        const targetMins = parse24hTimeInMinutes(selectedTime);
        let bestSlot = matchingTimetableSlots[0];
        let minDiff = Infinity;
        for (const slot of matchingTimetableSlots) {
          const startMins = parseSlotMinutes(slot.startTime);
          const endMins = parseSlotMinutes(slot.endTime);
          if (targetMins >= startMins && targetMins <= endMins) {
            bestSlot = slot;
            break;
          }
          const diff = Math.abs(targetMins - startMins);
          if (diff < minDiff) {
            minDiff = diff;
            bestSlot = slot;
          }
        }
        setSelectedSlotId(bestSlot.id);
        setSelectedSubjectCode(bestSlot.subjectCode);
        setSelectedTimeSlot(`${bestSlot.startTime} - ${bestSlot.endTime}`);
      } else {
        const current = matchingTimetableSlots.find((s) => s.id === selectedSlotId);
        if (current) {
          setSelectedSubjectCode(current.subjectCode);
          setSelectedTimeSlot(`${current.startTime} - ${current.endTime}`);
        }
      }
    } else {
      setSelectedSlotId('');
      if (availableSubjects.length > 0) setSelectedSubjectCode(availableSubjects[0].code);
      if (availableTimeSlots.length > 0) setSelectedTimeSlot(availableTimeSlots[0].label);
    }
  }, [selectedDepartment, selectedSemester, selectedTime, selectedSlotId, matchingTimetableSlots, availableSubjects, availableTimeSlots]);

  const currentSlot = matchingTimetableSlots.find((s) => s.id === selectedSlotId) || matchingTimetableSlots[0];

  const deptObj = DEPARTMENTS.find((d) => d.id === selectedDepartment);
  const deptCode = deptObj?.code || 'CS';

  const activeSubjectObj =
    availableSubjects.find((s) => s.code === selectedSubjectCode) ||
    (currentSlot ? { code: currentSlot.subjectCode, name: currentSlot.subjectName } : null) ||
    matchingSubjects[0] || {
      code: `${deptCode}-${selectedSemester}01`,
      name: `${deptObj?.name || 'Department'} Core Subject`,
    };

  const activeSubjectName = activeSubjectObj.name;
  const activeSubjectCode = activeSubjectObj.code;
  const activeTeacher = currentSlot?.teacherName || user.name || 'Assigned Faculty';
  const activeClassroom = currentSlot?.classroom || `Lecture Hall ${selectedSemester}01`;
  const activeTime = selectedTimeSlot || (currentSlot ? `${currentSlot.startTime} - ${currentSlot.endTime}` : '09:00 AM - 10:00 AM');

  // Enrolled students for selected Department & Semester
  const enrolledStudents = INITIAL_USERS.filter(
    (u) => u.role === 'student' && u.departmentId === selectedDepartment && u.semester === selectedSemester
  );

  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const init: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      init[s.id] = 'present';
    });
    return init;
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<AttendanceRecord | null>(null);
  const [editReason, setEditReason] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editNewStatus, setEditNewStatus] = useState<AttendanceStatus>('present');

  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'absent' | 'late' | 'present'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const [isSubmittedToday, setIsSubmittedToday] = useState(false);

  // Subject Calendar Breakdown Modal State
  const [calendarSubjectItem, setCalendarSubjectItem] = useState<{
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    credits: number;
    totalClasses: number;
    attendedClasses: number;
    absentClasses: number;
    percentage: number;
    isLow: boolean;
  } | null>(null);
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(new Date(2026, 7, 1)); // Aug 2026
  const [selectedCalendarDateDetail, setSelectedCalendarDateDetail] = useState<{
    dateStr: string;
    dayName: string;
    displayDateStr: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    timeWindow: string;
    teacherName: string;
    classroom: string;
    remarks?: string;
  } | null>(null);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach((s) => {
      updated[s.id] = 'present';
    });
    setStudentStatuses(updated);
  };

  const handleSubmit = () => {
    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      timetableSlotId: currentSlot?.id || 'slot_auto',
      date: selectedDate,
      departmentId: selectedDepartment,
      semester: selectedSemester,
      subjectId: currentSlot?.subjectId || matchingSubjects[0]?.id || `sub_${selectedDepartment}_${selectedSemester}`,
      subjectName: activeSubjectName,
      teacherId: user.id,
      teacherName: activeTeacher,
      classroom: activeClassroom,
      lectureTime: `${formatTime12hDisplay(selectedTime)} (${activeTime})`,
      isSubmitted: true,
      submittedAt: `${selectedDate} ${selectedTime}:00`,
      studentEntries: enrolledStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        enrollmentNo: s.enrollmentNo || '2024CS0000',
        status: studentStatuses[s.id] || 'present',
      })),
    };

    onSubmitAttendance(record);
    setIsSubmittedToday(true);
  };

  const handleEditRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForEdit || !editReason || !editStudentId) return;

    const student = enrolledStudents.find((s) => s.id === editStudentId);
    const studentName = student?.name || (editStudentId === user.id ? user.name : 'Student');
    const currentStatus =
      selectedRecordForEdit.studentEntries?.find((s) => s.studentId === editStudentId)?.status || 'absent';

    onRequestEdit({
      attendanceRecordId: selectedRecordForEdit.id,
      subjectName: selectedRecordForEdit.subjectName,
      date: selectedRecordForEdit.date,
      teacherId: selectedRecordForEdit.teacherId || user.id,
      teacherName: selectedRecordForEdit.teacherName || user.name,
      departmentId: selectedDepartment,
      semester: selectedSemester,
      reason: editReason,
      requestedChanges: [
        {
          studentId: editStudentId,
          studentName: studentName,
          oldStatus: currentStatus,
          newStatus: editNewStatus,
        },
      ],
    });

    setEditModalOpen(false);
    setEditReason('');
  };

  // Filter roster for student privacy: students only see their own entry
  const displayedStudentsInRoster =
    user.role === 'student'
      ? enrolledStudents.filter((s) => s.id === user.id).length > 0
        ? enrolledStudents.filter((s) => s.id === user.id)
        : [user]
      : enrolledStudents;

  // Compute subject-wise attendance for student view
  const subjectsForAttendance =
    matchingSubjects.length > 0
      ? matchingSubjects
      : SUBJECTS.filter((s) => s.departmentId === selectedDepartment && s.semester === selectedSemester);

  const studentSubjectAttendance = subjectsForAttendance.map((subj) => {
    let recordedTotal = 0;
    let recordedAttended = 0;

    attendanceRecords.forEach((r) => {
      const isSubjMatch =
        r.subjectId === subj.id ||
        (r.subjectName && subj.name && r.subjectName.toLowerCase().includes(subj.name.toLowerCase()));
      if (isSubjMatch) {
        const entry = r.studentEntries?.find((e) => e.studentId === user.id);
        if (entry) {
          recordedTotal += 1;
          if (entry.status === 'present' || entry.status === 'late') {
            recordedAttended += 1;
          }
        }
      }
    });

    // Baseline stats per subject
    let defaultTotal = 18;
    let defaultAttended = 15;

    const lowerName = subj.name.toLowerCase();
    if (lowerName.includes('django') || lowerName.includes('python') || subj.code === '08BVOCMJ307') {
      defaultTotal = 18;
      defaultAttended = 17; // 17 out of 18 (94.4%)
    } else if (lowerName.includes('oops') || subj.code === '08BVOCMJ305') {
      defaultTotal = 18;
      defaultAttended = 15; // 15 out of 18 classes attended (83.3%)
    } else if (lowerName.includes('software') || subj.code === '08BVOCMJ306') {
      defaultTotal = 18;
      defaultAttended = 16; // 16 out of 18 (88.9%)
    } else if (lowerName.includes('values') || subj.code === '08BVOCAE303') {
      defaultTotal = 15;
      defaultAttended = 14; // 14 out of 15 (93.3%)
    } else if (lowerName.includes('google') || subj.code === '08BVOCSE303') {
      defaultTotal = 12;
      defaultAttended = 11; // 11 out of 12 (91.7%)
    } else if (lowerName.includes('rural') || subj.code === '08BVOCVA303') {
      defaultTotal = 10;
      defaultAttended = 8; // 8 out of 10 (80.0%)
    } else if (lowerName.includes('training') || lowerName.includes('internship') || subj.code === '08BVOCOJT303') {
      defaultTotal = 20;
      defaultAttended = 18; // 18 out of 20 (90.0%)
    } else if (lowerName.includes('database') || subj.code === 'CS-401') {
      defaultTotal = 18;
      defaultAttended = 15; // 15 out of 18 (83.3%)
    } else if (lowerName.includes('java') || subj.code === 'CS-402') {
      defaultTotal = 16;
      defaultAttended = 14; // 14 out of 16 (87.5%)
    } else {
      defaultTotal = 16;
      defaultAttended = 14;
    }

    const totalClasses = defaultTotal + recordedTotal;
    const attendedClasses = defaultAttended + recordedAttended;
    const absentClasses = Math.max(0, totalClasses - attendedClasses);
    const percentage = totalClasses > 0 ? parseFloat(((attendedClasses / totalClasses) * 100).toFixed(1)) : 100;

    return {
      subjectId: subj.id,
      subjectCode: subj.code,
      subjectName: subj.name,
      credits: subj.credits,
      totalClasses,
      attendedClasses,
      absentClasses,
      percentage,
      isLow: percentage < 75,
    };
  });

  const totalStudentClassesHeld = studentSubjectAttendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const totalStudentClassesAttended = studentSubjectAttendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallStudentAttendancePct =
    totalStudentClassesHeld > 0
      ? parseFloat(((totalStudentClassesAttended / totalStudentClassesHeld) * 100).toFixed(1))
      : 85.0;

  // Subject & Day Filter State & Helper for Today's Classes
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const nowDayIdx = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayDayName = weekDays[nowDayIdx - 1] || 'Monday'; // Default to Monday if Sunday

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Today');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  const activeDayName = selectedDayFilter === 'Today' ? todayDayName : selectedDayFilter;

  // Filter slots for active day
  const slotsForActiveDay = matchingTimetableSlots.filter((slot) => slot.dayOfWeek === activeDayName);

  const todayClassSlots =
    slotsForActiveDay.length > 0
      ? slotsForActiveDay
      : matchingSubjects.map((s, idx) => ({
          id: `slot_${s.code}_${activeDayName}`,
          subjectId: s.id,
          subjectName: s.name,
          subjectCode: s.code,
          dayOfWeek: activeDayName,
          startTime: idx === 0 ? '08:40 AM' : idx === 1 ? '09:40 AM' : idx === 2 ? '11:00 AM' : '02:00 PM',
          endTime: idx === 0 ? '09:40 AM' : idx === 1 ? '10:40 AM' : idx === 2 ? '12:00 PM' : '04:00 PM',
          classroom: `Lecture Hall ${selectedSemester}0${idx + 1}`,
          teacherName: 'Faculty Instructor',
        }));

  const filteredClassSlotsForStudent =
    selectedSubjectFilter === 'all'
      ? todayClassSlots
      : todayClassSlots.filter((slot) => slot.subjectCode === selectedSubjectFilter || slot.id === selectedSubjectFilter);

  const getStudentClassStatus = (slot: { subjectId?: string; subjectName: string; id: string }): AttendanceStatus => {
    const record = attendanceRecords.find(
      (r) =>
        r.date === selectedDate &&
        (r.timetableSlotId === slot.id ||
          r.subjectId === slot.subjectId ||
          (r.subjectName && slot.subjectName && r.subjectName.toLowerCase().includes(slot.subjectName.toLowerCase())))
    );
    if (record && record.studentEntries) {
      const entry = record.studentEntries.find((s) => s.studentId === user.id);
      if (entry) return entry.status;
    }
    return studentStatuses[user.id] || 'present';
  };

  // Analytics Calculation for Faculty/HOD
  const analyticsData = enrolledStudents.map((s) => {
    let presentCount = 0;
    let totalClasses = 0;

    attendanceRecords.forEach((r) => {
      const entry = r.studentEntries?.find((e) => e.studentId === s.id);
      if (entry) {
        totalClasses += 1;
        if (entry.status === 'present' || entry.status === 'late') presentCount += 1;
      }
    });

    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 85;

    return {
      name: s.name,
      enrollmentNo: s.enrollmentNo,
      percentage,
      isLow: percentage < 75,
    };
  });

  const departmentOverviewData = [
    { name: 'Present', value: 82, color: '#10b981' },
    { name: 'Absent', value: 10, color: '#f43f5e' },
    { name: 'Late', value: 5, color: '#f59e0b' },
    { name: 'Leave', value: 3, color: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Attendance Module</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Auto-linked timetable synchronization & HOD-approved attendance correction workflow
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mark'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {user.role === 'student' ? 'View Attendance' : 'Mark Class'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            History & Logs
          </button>
          {(user.role === 'hod' || user.role === 'teacher') && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'requests'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Edit Requests ({(editRequests || []).filter((r) => r.status === 'pending').length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* MARK ATTENDANCE VIEW */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Academic Term & Cycle Banner Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                Academic Timetable Constraint: Semesters Run in Alternating Terms
              </span>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                Semesters do not all run concurrently. Either <strong>Odd Semesters (1, 3, 5)</strong> or <strong>Even Semesters (2, 4, 6)</strong> are active in a given academic session. The semester options below reflect the active academic timetable.
              </p>
            </div>
          </div>

          {/* Date & Time Selection & Auto-Sync Bar */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Separate Date Picker */}
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" /> Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    autoDetectSlot(newDate, selectedTime);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-100 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  id="attendance-date-input"
                />
              </div>

              {/* Separate Time Picker */}
              <div>
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" /> Session Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    setSelectedTime(newTime);
                    autoDetectSlot(selectedDate, newTime);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-100 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  id="attendance-time-input"
                />
              </div>

              {/* Day of Week Badge */}
              <div className="pt-2 sm:pt-0">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Day</div>
                <div className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-md mt-0.5 inline-block">
                  {selectedDayName}
                </div>
              </div>
            </div>

            {/* Set to Current Real-time Button */}
            <button
              type="button"
              onClick={handleSetCurrentDateTime}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition-all cursor-pointer self-stretch sm:self-auto justify-center"
              id="set-current-datetime-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Set to Current Time</span>
            </button>
          </div>

          {/* Department, Academic Cycle & Semester Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Academic Cycle Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Academic Term Cycle
                </label>
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleCycleChange('odd')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      academicCycle === 'odd'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Odd Semesters (1, 3, 5)</span>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-black uppercase ${
                      academicCycle === 'odd' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      Active (June–Nov)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleChange('even')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      academicCycle === 'even'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Even Semesters (2, 4, 6)</span>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-black uppercase ${
                      academicCycle === 'even' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      Upcoming (Dec–May)
                    </span>
                  </button>
                </div>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Select Department
                </label>
                <select
                  value={user.role === 'student' ? user.departmentId || 'dept_it' : selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={user.role === 'student'}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                  id="attendance-dept-select"
                >
                  {(user.role === 'student'
                    ? DEPARTMENTS.filter((d) => d.id === user.departmentId)
                    : DEPARTMENTS
                  ).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Dropdown (Filtered by Cycle) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Active Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => {
                    const newSem = parseInt(e.target.value);
                    setSelectedSemester(newSem);
                    if ([1, 3, 5].includes(newSem) && academicCycle !== 'odd') {
                      setAcademicCycle('odd');
                    } else if ([2, 4, 6].includes(newSem) && academicCycle !== 'even') {
                      setAcademicCycle('even');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                  id="attendance-sem-select"
                >
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <option key={s} value={s}>
                      Semester {s} ({[1, 3, 5].includes(s) ? 'Monsoon' : 'Winter'} Term)
                    </option>
                  ))}
                </select>
              </div>

              {/* Separate Subject / Course Dropdown */}
              {availableSubjects.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Subject / Course
                  </label>
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setSelectedSubjectCode(newCode);
                      const matchingSlot =
                        matchingTimetableSlots.find(
                          (s) => s.subjectCode === newCode && `${s.startTime} - ${s.endTime}` === selectedTimeSlot
                        ) || matchingTimetableSlots.find((s) => s.subjectCode === newCode);
                      if (matchingSlot) {
                        setSelectedSlotId(matchingSlot.id);
                        setSelectedTimeSlot(`${matchingSlot.startTime} - ${matchingSlot.endTime}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                    id="attendance-subject-select"
                  >
                    {availableSubjects.map((sub) => (
                      <option key={sub.code} value={sub.code}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Separate Lecture Time Slot Dropdown */}
              {availableTimeSlots.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Lecture Time Slot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setSelectedTimeSlot(newTime);
                      const matchingSlot =
                        matchingTimetableSlots.find(
                          (s) => `${s.startTime} - ${s.endTime}` === newTime && s.subjectCode === selectedSubjectCode
                        ) || matchingTimetableSlots.find((s) => `${s.startTime} - ${s.endTime}` === newTime);
                      if (matchingSlot) {
                        setSelectedSlotId(matchingSlot.id);
                        setSelectedSubjectCode(matchingSlot.subjectCode);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                    id="attendance-time-slot-select"
                  >
                    {availableTimeSlots.map((ts) => (
                      <option key={ts.label} value={ts.label}>
                        {ts.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {user.role !== 'student' && (
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-200 transition-colors"
              >
                Mark All Present
              </button>
            )}
          </div>

          {/* Auto-Fetched Lecture Timetable Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-mono tracking-wider uppercase bg-white/20 inline-block px-2.5 py-0.5 rounded text-white font-bold">
                Auto-Fetched Timetable Data • {academicCycle === 'odd' ? 'Odd' : 'Even'} Cycle (Sem {selectedSemester})
              </div>
              <span className="text-xs bg-black/20 px-2.5 py-0.5 rounded-full font-medium">
                {deptObj?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <div>
                <div className="text-[10px] text-emerald-100 font-medium">Date & Time</div>
                <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedDate} ({selectedDayName}) • {formatTime12hDisplay(selectedTime)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-emerald-100 font-medium">Auto-Detected Subject</div>
                <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5 truncate">
                  <BookOpen className="w-3.5 h-3.5" />
                  {activeSubjectCode}: {activeSubjectName}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-emerald-100 font-medium">Assigned Teacher</div>
                <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  {activeTeacher}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-emerald-100 font-medium">Classroom Venue</div>
                <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  {activeClassroom}
                </div>
              </div>
            </div>
          </div>

          {/* Student Personal Subject-Wise Attendance Overview */}
          {user.role === 'student' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    My Course-Wise Attendance Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official attendance summary per subject for Semester {selectedSemester}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Overall Attendance:</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                      overallStudentAttendancePct >= 75
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {overallStudentAttendancePct}% ({totalStudentClassesAttended} / {totalStudentClassesHeld} Classes)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentSubjectAttendance.map((item) => (
                  <div
                    key={item.subjectId}
                    onClick={() => {
                      setCalendarSubjectItem(item);
                      setSelectedCalendarDateDetail(null);
                    }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                          {item.subjectCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.subjectName}
                        </h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-black font-mono shrink-0 ${
                          item.isLow
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <span className="font-semibold">Classes Attended:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.attendedClasses} / {item.totalClasses}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.isLow ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>{item.absentClasses} {item.absentClasses === 1 ? 'Class' : 'Classes'} Absent</span>
                      <span className="font-medium text-slate-400">{item.credits} Credits</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        View Calendar Breakdown
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Roster & Today's Classes Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">
                  {user.role === 'student'
                    ? selectedDayFilter === 'Today'
                      ? "My Today's Class Attendance Status"
                      : `My Class Attendance Status (${selectedDayFilter})`
                    : `Enrolled Student Roster (${enrolledStudents.length} Students)`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {user.role === 'student'
                    ? `Showing ${filteredClassSlotsForStudent.length} scheduled class ${filteredClassSlotsForStudent.length === 1 ? 'session' : 'sessions'} for ${selectedDayFilter === 'Today' ? `Today (${todayDayName})` : selectedDayFilter}`
                    : `Active Subject: ${activeSubjectCode} - ${activeSubjectName} (${activeTime})`}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(isSubmittedToday || user.role === 'student') && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Lock className="w-3.5 h-3.5" /> Read-Only Record
                  </span>
                )}
              </div>
            </div>

            {/* Day Selector Bar for Students */}
            {user.role === 'student' && (
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Day Schedule:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDayFilter('Today');
                    setSelectedSubjectFilter('all');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedDayFilter === 'Today'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>Today</span>
                  <span className="opacity-80 text-[10px] font-normal">({todayDayName})</span>
                </button>
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDayFilter(day);
                      setSelectedSubjectFilter('all');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedDayFilter === day
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {/* Subject Filter Pills for Students */}
            {user.role === 'student' && todayClassSlots.length > 0 && (
              <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-emerald-500" /> Filter Class:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedSubjectFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All Today's Classes ({todayClassSlots.length})
                </button>
                {todayClassSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSubjectFilter(slot.subjectCode || slot.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      selectedSubjectFilter === (slot.subjectCode || slot.id)
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{slot.subjectCode}</span>
                    <span className="opacity-75 font-normal max-w-[120px] truncate">{slot.subjectName}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase">
                    {user.role === 'student' ? (
                      <>
                        <th className="p-3.5 pl-6">Subject / Class</th>
                        <th className="p-3.5">Enrollment No</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5 text-center">Attendance Status</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3.5 pl-6">Enrollment No</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Subject / Class Session</th>
                        <th className="p-3.5 text-center">Attendance Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                  {user.role === 'student' ? (
                    filteredClassSlotsForStudent.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                              No Classes Found
                            </p>
                            <p className="text-xs text-slate-500">
                              There are no class schedules matching the selected subject filter for today.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClassSlotsForStudent.map((slot) => {
                        const status = getStudentClassStatus(slot);
                        return (
                          <tr key={slot.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            {/* Subject / Class Column */}
                            <td className="p-3.5 pl-6">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20 shrink-0">
                                    {slot.subjectCode || 'SUB-01'}
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                                    {slot.subjectName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span>•</span>
                                  <span>{slot.classroom || 'Classroom'}</span>
                                  <span>•</span>
                                  <span className="text-slate-600 dark:text-slate-300 font-medium">{slot.teacherName || 'Faculty'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Enrollment No */}
                            <td className="p-3.5 font-mono font-semibold text-slate-500">
                              {user.enrollmentNo || '25221103010'}
                            </td>

                            {/* Student Name */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {user.name}
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                                    You
                                  </span>
                                </span>
                              </div>
                            </td>

                            {/* Attendance Status */}
                            <td className="p-3.5 text-center">
                              <span
                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide inline-flex items-center gap-1.5 ${
                                  status === 'present'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : status === 'absent'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                    : status === 'late'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    status === 'present'
                                      ? 'bg-emerald-500'
                                      : status === 'absent'
                                      ? 'bg-rose-500'
                                      : status === 'late'
                                      ? 'bg-amber-500'
                                      : 'bg-indigo-500'
                                  }`}
                                />
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : (
                    /* Faculty View */
                    displayedStudentsInRoster.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <UserCheck className="w-8 h-8 text-slate-400" />
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                              0 Enrolled Students
                            </p>
                            <p className="text-xs text-slate-500">
                              There are 0 registered students in {deptObj?.name || 'Information Technology'} Semester {selectedSemester} for this academic session.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayedStudentsInRoster.map((student) => {
                        const status = studentStatuses[student.id] || 'present';
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3.5 pl-6 font-mono font-semibold text-slate-500">
                              {student.enrollmentNo || '2024CS0400'}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {student.name}
                                  {student.id === user.id && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                                      You
                                    </span>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20">
                                  {activeSubjectCode}
                                </span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {activeSubjectName}
                                </span>
                                <span className="text-[11px] text-slate-400 ml-1">
                                  ({activeTime})
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                {(['present', 'absent', 'late', 'leave'] as AttendanceStatus[]).map((st) => (
                                  <button
                                    key={st}
                                    disabled={isSubmittedToday}
                                    onClick={() => handleStatusChange(student.id, st)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                                      status === st
                                        ? st === 'present'
                                          ? 'bg-emerald-500 text-white shadow-sm'
                                          : st === 'absent'
                                          ? 'bg-rose-500 text-white shadow-sm'
                                          : st === 'late'
                                          ? 'bg-amber-500 text-white shadow-sm'
                                          : 'bg-indigo-500 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Submit Action or Read-Only Notice */}
            {user.role !== 'student' ? (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmittedToday}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmittedToday ? 'Attendance Submitted' : 'Submit & Lock Attendance'}
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Official Attendance Ledger — Verified and logged by course faculty
                  </span>
                </div>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Read-Only Mode
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Past Attendance & Session Extent Logs
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Detailed record of dates, days, lecture time windows, and attendance extent
              </p>
            </div>

            <button
              onClick={() =>
                exportToCSV(
                  `lokbharti_attendance_history_${selectedDepartment}_sem${selectedSemester}`,
                  attendanceRecords.map((r) => {
                    const myEntry = r.studentEntries?.find((e) => e.studentId === user.id);
                    const dateInfo = formatDateWithDay(r.date);
                    return {
                      'Formatted Date': dateInfo.fullDateStr || r.date,
                      'Day of Week': dateInfo.dayName || '',
                      'Lecture Time Window': r.lectureTime || '09:00 AM - 10:00 AM',
                      Subject: r.subjectName,
                      Teacher: r.teacherName,
                      Classroom: r.classroom,
                      Status: user.role === 'student' ? (myEntry?.status || 'present').toUpperCase() : 'Marked',
                      Remarks: myEntry?.remarks || '',
                      SubmittedAt: r.submittedAt,
                    };
                  })
                )
              }
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Detailed CSV
            </button>
          </div>

          {/* Student Absence Summary Cards */}
          {user.role === 'student' && (() => {
            const myRecords = attendanceRecords.map((r) => ({
              record: r,
              entry: r.studentEntries?.find((e) => e.studentId === user.id),
            }));

            const totalLogged = myRecords.length;
            const absentCount = myRecords.filter((m) => m.entry?.status === 'absent').length;
            const lateCount = myRecords.filter((m) => m.entry?.status === 'late').length;
            const presentCount = myRecords.filter((m) => m.entry?.status === 'present').length;
            const missedHoursExtent = absentCount * 1.0; // 1 hour per missed session

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Recorded Sessions</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{totalLogged} Sessions</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Present</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{presentCount} Sessions</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase block">Absences (Extent)</span>
                  <span className="text-lg font-black text-rose-600 mt-0.5 block">
                    {absentCount} Missed ({missedHoursExtent.toFixed(1)} Hrs)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase block">Late Arrivals</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{lateCount} Sessions</span>
                </div>
              </div>
            );
          })()}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setHistoryStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  historyStatusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => setHistoryStatusFilter('absent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
                  historyStatusFilter === 'absent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Absences Only
              </button>
              <button
                onClick={() => setHistoryStatusFilter('late')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
                  historyStatusFilter === 'late'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Late Arrivals
              </button>
              <button
                onClick={() => setHistoryStatusFilter('present')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
                  historyStatusFilter === 'present'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Presents
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search subject, date, teacher..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Record List */}
          <div className="space-y-3">
            {attendanceRecords
              .filter((record) => {
                const myEntry = record.studentEntries?.find((e) => e.studentId === user.id);
                const status = user.role === 'student' ? (myEntry?.status || 'present') : 'present';

                // Apply status filter
                if (historyStatusFilter !== 'all' && user.role === 'student') {
                  if (status !== historyStatusFilter) return false;
                }

                // Apply text search filter
                if (historySearchQuery) {
                  const q = historySearchQuery.toLowerCase();
                  const dateInfo = formatDateWithDay(record.date);
                  const matchSubject = record.subjectName.toLowerCase().includes(q);
                  const matchTeacher = record.teacherName.toLowerCase().includes(q);
                  const matchDate = record.date.includes(q) || (dateInfo.fullDateStr && dateInfo.fullDateStr.toLowerCase().includes(q));
                  return matchSubject || matchTeacher || matchDate;
                }

                return true;
              })
              .map((record) => {
                const dateInfo = formatDateWithDay(record.date);
                const myEntry = record.studentEntries?.find((e) => e.studentId === user.id);
                const status = myEntry?.status || 'present';
                const remarks = myEntry?.remarks;

                return (
                  <div
                    key={record.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      user.role === 'student' && status === 'absent'
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : user.role === 'student' && status === 'late'
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Date & Time Header */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {dateInfo.fullDateStr || record.date}
                        </span>

                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {record.lectureTime || '09:00 AM - 10:00 AM'}
                        </span>

                        <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                          Extent: 1 Hour Session
                        </span>
                      </div>

                      {/* Subject & Teacher Info */}
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {record.subjectName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Faculty: <span className="font-medium text-slate-700 dark:text-slate-300">{record.teacherName}</span> • Venue: <span className="font-medium text-slate-700 dark:text-slate-300">{record.classroom}</span> • Submission Time: {record.submittedAt ? new Date(record.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:55 AM'}
                        </p>
                      </div>

                      {/* Remarks if present */}
                      {remarks && (
                        <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 italic">
                          Remark / Detail: {remarks}
                        </div>
                      )}
                    </div>

                    {/* Status & Action Side */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                      {user.role === 'student' ? (
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                              status === 'absent'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                                : status === 'late'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : status === 'leave'
                                ? 'bg-purple-600 text-white border-purple-700'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            }`}
                          >
                            {status === 'absent' && <XCircle className="w-3.5 h-3.5" />}
                            {status === 'late' && <Clock className="w-3.5 h-3.5" />}
                            {status === 'present' && <CheckCircle className="w-3.5 h-3.5" />}
                            STATUS: {status.toUpperCase()}
                            {status === 'absent' && ' (1 HR MISSED)'}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedRecordForEdit(record);
                              setEditStudentId(user.id);
                              setEditModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Request Absence Correction
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            {record.studentEntries?.length || 0} Students Marked
                          </span>
                          <button
                            onClick={() => {
                              setSelectedRecordForEdit(record);
                              setEditModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Request Correction
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* EDIT REQUESTS APPROVAL VIEW (HOD / TEACHER) */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Attendance Edit Requests (HOD Review)
          </h3>

          {editRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No edit requests pending approval.</p>
          ) : (
            <div className="space-y-4">
              {editRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {req.subjectName} ({req.date})
                      </span>
                      <p className="text-[11px] text-slate-500">Requested by: {req.teacherName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        req.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Reason: </span>
                    {req.reason}
                  </p>

                  {user.role === 'hod' && req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onApproveEdit(req.id, 'approved', 'Approved by HOD.')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                      >
                        Approve Correction
                      </button>
                      <button
                        onClick={() => onApproveEdit(req.id, 'rejected', 'Insufficient justification.')}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        user.role === 'student' ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-emerald-600" />
                    My Subject-Wise Attendance Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visual breakdown of classes held, attended, and eligibility across Semester {selectedSemester} subjects
                  </p>
                </div>
                <button
                  onClick={() =>
                    printFormattedPDFReport(
                      `My Academic Attendance Statement - ${user.name}`,
                      `${user.departmentName || 'Lokbharti University'} (Sem ${selectedSemester})`,
                      ['Subject Code', 'Subject Name', 'Total Classes', 'Attended', 'Absent', 'Attendance %', 'Status'],
                      studentSubjectAttendance.map((d) => [
                        d.subjectCode,
                        d.subjectName,
                        `${d.totalClasses}`,
                        `${d.attendedClasses}`,
                        `${d.absentClasses}`,
                        `${d.percentage}%`,
                        d.isLow ? 'DEBARMENT RISK (<75%)' : 'Eligible',
                      ])
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export Personal Statement (PDF)
                </button>
              </div>

              {/* Overall Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Classes Held</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">{totalStudentClassesHeld}</span>
                  <span className="text-[11px] text-slate-500">Across all semester courses</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Classes Attended</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{totalStudentClassesAttended}</span>
                  <span className="text-[11px] text-slate-500">{totalStudentClassesHeld - totalStudentClassesAttended} classes absent</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Aggregate Attendance</span>
                  <span className={`text-xl font-black mt-0.5 block ${overallStudentAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {overallStudentAttendancePct}%
                  </span>
                  <span className={`text-[11px] font-bold ${overallStudentAttendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {overallStudentAttendancePct >= 75 ? '✓ Exam Eligible (≥ 75%)' : '⚠️ Debarment Warning (< 75%)'}
                  </span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-72 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentSubjectAttendance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="subjectName" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Attendance']}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar dataKey="percentage" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="p-3 pl-4">Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3 text-center">Classes Held</th>
                      <th className="p-3 text-center">Attended</th>
                      <th className="p-3 text-center">Absent</th>
                      <th className="p-3 text-center">Percentage</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {studentSubjectAttendance.map((item) => (
                      <tr key={item.subjectId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-500">{item.subjectCode}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.subjectName}</td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">{item.totalClasses}</td>
                        <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{item.attendedClasses}</td>
                        <td className="p-3 text-center font-bold text-rose-500">{item.absentClasses}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-black ${
                            item.isLow ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {item.percentage}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.isLow ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          }`}>
                            {item.isLow ? 'Warning' : 'Eligible'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance % by Student */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Student Attendance (%) Analytics</span>
                <button
                  onClick={() =>
                    printFormattedPDFReport(
                      'Student Attendance Summary',
                      'Department of CS',
                      ['Student Name', 'Enrollment', 'Attendance %', 'Status'],
                      analyticsData.map((d) => [
                        d.name,
                        d.enrollmentNo || '',
                        `${d.percentage}%`,
                        d.isLow ? 'DEBARRED (<75%)' : 'Eligible',
                      ])
                    )
                  }
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold underline"
                >
                  Print PDF Report
                </button>
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Low Attendance Warning Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Students Below 75% Threshold (Auto-Alerted):
                </span>
                {analyticsData
                  .filter((d) => d.isLow)
                  .map((d) => (
                    <div
                      key={d.name}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-rose-800 dark:text-rose-300">{d.name}</span>
                      <span className="font-bold text-rose-600">{d.percentage}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Overall Distribution */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Attendance Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentOverviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentOverviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {departmentOverviewData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Correction Edit Request Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {user.role === 'student' ? 'Submit Absence Correction / Medical Leave Slip' : 'Submit Attendance Correction Request'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sent directly to Head of Department (HOD) and Course Faculty for formal review
              </p>
            </div>

            {selectedRecordForEdit && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedRecordForEdit.subjectName}
                </div>
                <div className="text-slate-500 flex items-center gap-2">
                  <span>📅 {formatDateWithDay(selectedRecordForEdit.date).fullDateStr || selectedRecordForEdit.date}</span>
                  <span>⏰ {selectedRecordForEdit.lectureTime || '09:00 AM - 10:00 AM'}</span>
                </div>
                <div className="text-slate-500">
                  Faculty: {selectedRecordForEdit.teacherName} • Venue: {selectedRecordForEdit.classroom}
                </div>
              </div>
            )}

            <form onSubmit={handleEditRequestSubmit} className="space-y-4">
              {user.role === 'student' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Student Details
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white">
                    {user.name} ({user.enrollmentNo || '2024CS0001'})
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Select Student
                  </label>
                  <select
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Select Student...</option>
                    {enrolledStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.enrollmentNo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Requested Status
                </label>
                <select
                  value={editNewStatus}
                  onChange={(e) => setEditNewStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="present">Present (Marked Absent By Error)</option>
                  <option value="leave">Official / Medical Leave</option>
                  <option value="late">Late Arrival</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Reason & Proof Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder={
                    user.role === 'student'
                      ? 'e.g. Was present at Lab B or attending official university event (Medical certificate attached / slip ref #1029)...'
                      : 'e.g. Student presented medical leave slip approved by Dean...'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT ATTENDANCE CALENDAR MODAL WITH GREEN & RED DOTS */}
      {calendarSubjectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold">
                    {calendarSubjectItem.subjectCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono ${
                      calendarSubjectItem.isLow
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {calendarSubjectItem.percentage}% Attendance
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {calendarSubjectItem.subjectName} — Lecture Attendance Calendar
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed dates on which classes were held with session extent, status, and proof markers.
                </p>
              </div>

              <button
                onClick={() => {
                  setCalendarSubjectItem(null);
                  setSelectedCalendarDateDetail(null);
                }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Summary Metrics & Color Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Classes Attended</span>
                    <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">{calendarSubjectItem.attendedClasses} / {calendarSubjectItem.totalClasses} Sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    Green Dot (●)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Classes Missed</span>
                    <span className="text-lg font-black text-rose-800 dark:text-rose-300">{calendarSubjectItem.absentClasses} {calendarSubjectItem.absentClasses === 1 ? 'Session' : 'Sessions'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-pulse"></span>
                    Red Dot (●)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Session Duration / Extent</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">1 Hour per Class</span>
                  </div>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Calendar Controls & Month View */}
              {(() => {
                // Generate session map for this subject
                const map = new Map<string, {
                  dateStr: string;
                  dayName: string;
                  displayDateStr: string;
                  status: 'present' | 'absent' | 'late' | 'leave';
                  timeWindow: string;
                  teacherName: string;
                  classroom: string;
                  remarks?: string;
                }>();

                // 1. Gather dynamic records
                attendanceRecords.forEach((r) => {
                  const isMatch =
                    r.subjectId === calendarSubjectItem.subjectId ||
                    (r.subjectName && r.subjectName.toLowerCase().includes(calendarSubjectItem.subjectName.toLowerCase())) ||
                    (calendarSubjectItem.subjectName && calendarSubjectItem.subjectName.toLowerCase().includes((r.subjectName || '').toLowerCase()));

                  if (isMatch) {
                    const entry = r.studentEntries?.find((e) => e.studentId === user.id);
                    if (entry) {
                      const dInfo = formatDateWithDay(r.date);
                      map.set(r.date, {
                        dateStr: r.date,
                        dayName: dInfo.dayName || 'Lecture Day',
                        displayDateStr: dInfo.fullDateStr || r.date,
                        status: entry.status,
                        timeWindow: r.lectureTime || '09:00 AM - 10:00 AM',
                        teacherName: r.teacherName || 'Faculty',
                        classroom: r.classroom || 'Lab 204',
                        remarks: entry.remarks,
                      });
                    }
                  }
                });

                // 2. Generate baseline session dates for remaining held classes up to Aug 5, 2026
                const totalNeeded = calendarSubjectItem.totalClasses;
                const absentCount = calendarSubjectItem.absentClasses;

                if (map.size < totalNeeded) {
                  let curr = new Date(2026, 7, 5); // Aug 5, 2026
                  let added = 0;
                  const neededNew = totalNeeded - map.size;
                  let absentLeft = absentCount - Array.from(map.values()).filter(v => v.status === 'absent').length;
                  const presetAbsent = new Set(['2026-08-03', '2026-07-26', '2026-07-15']);

                  while (added < neededNew) {
                    const day = curr.getDay();
                    const isClassDay = day === 1 || day === 3 || day === 5; // Mon, Wed, Fri
                    const yyyy = curr.getFullYear();
                    const mm = String(curr.getMonth() + 1).padStart(2, '0');
                    const dd = String(curr.getDate()).padStart(2, '0');
                    const dateKey = `${yyyy}-${mm}-${dd}`;

                    if (isClassDay && !map.has(dateKey)) {
                      let status: 'present' | 'absent' = 'present';
                      if (presetAbsent.has(dateKey) || (absentLeft > 0 && added % 4 === 1)) {
                        status = 'absent';
                        absentLeft--;
                      }

                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                      map.set(dateKey, {
                        dateStr: dateKey,
                        dayName: dayNames[curr.getDay()],
                        displayDateStr: `${monthNames[curr.getMonth()]} ${curr.getDate()}, ${curr.getFullYear()}`,
                        status: status,
                        timeWindow: '09:00 AM - 10:00 AM',
                        teacherName: 'Prof. M. Trivedi',
                        classroom: 'Lab 204 (CS Dept)',
                        remarks: status === 'absent' ? 'Logged absent by faculty' : 'Attended session',
                      });
                      added++;
                    }

                    curr.setDate(curr.getDate() - 1);
                  }
                }

                const year = calendarMonthDate.getFullYear();
                const month = calendarMonthDate.getMonth();
                const monthName = calendarMonthDate.toLocaleString('default', { month: 'short' });

                const firstDayOfWeek = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();

                const calendarGridCells = [];

                // Prev month padding
                for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                  calendarGridCells.push({
                    dayNum: daysInPrevMonth - i,
                    isCurrentMonth: false,
                    dateKey: '',
                  });
                }

                // Current month days
                for (let d = 1; d <= daysInMonth; d++) {
                  const mmStr = String(month + 1).padStart(2, '0');
                  const ddStr = String(d).padStart(2, '0');
                  const dateKey = `${year}-${mmStr}-${ddStr}`;
                  calendarGridCells.push({
                    dayNum: d,
                    isCurrentMonth: true,
                    dateKey,
                  });
                }

                // Next month padding
                const rem = 7 - (calendarGridCells.length % 7);
                if (rem < 7) {
                  for (let d = 1; d <= rem; d++) {
                    calendarGridCells.push({
                      dayNum: d,
                      isCurrentMonth: false,
                      dateKey: '',
                    });
                  }
                }

                const monthNamesFull = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ];

                return (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                    {/* Header Controls matching user screenshot */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCalendarMonthDate(new Date(year, month - 1, 1))}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <select
                          value={month}
                          onChange={(e) => setCalendarMonthDate(new Date(year, parseInt(e.target.value, 10), 1))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          {monthNamesFull.map((m, idx) => (
                            <option key={m} value={idx}>{m.substring(0, 3)}</option>
                          ))}
                        </select>

                        <select
                          value={year}
                          onChange={(e) => setCalendarMonthDate(new Date(parseInt(e.target.value, 10), month, 1))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value={2025}>2025</option>
                          <option value={2026}>2026</option>
                          <option value={2027}>2027</option>
                        </select>

                        <button
                          onClick={() => setCalendarMonthDate(new Date(year, month + 1, 1))}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCalendarMonthDate(new Date(2026, 7, 1))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          Today (Aug 2026)
                        </button>
                      </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider pb-1">
                      <div>SUN</div>
                      <div>MON</div>
                      <div>TUE</div>
                      <div>WED</div>
                      <div>THU</div>
                      <div>FRI</div>
                      <div>SAT</div>
                    </div>

                    {/* Month Days Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {calendarGridCells.map((cell, idx) => {
                        if (!cell.isCurrentMonth) {
                          return (
                            <div
                              key={idx}
                              className="h-14 sm:h-16 rounded-xl p-1 sm:p-2 text-slate-300 dark:text-slate-700 text-xs font-medium flex flex-col justify-between select-none"
                            >
                              <span>{cell.dayNum}</span>
                            </div>
                          );
                        }

                        const session = map.get(cell.dateKey);
                        const isToday = cell.dateKey === '2026-08-05';
                        const isSelected = selectedCalendarDateDetail?.dateStr === cell.dateKey;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (session) {
                                setSelectedCalendarDateDetail({
                                  dateStr: session.dateStr,
                                  dayName: session.dayName,
                                  displayDateStr: session.displayDateStr,
                                  status: session.status,
                                  timeWindow: session.timeWindow,
                                  teacherName: session.teacherName,
                                  classroom: session.classroom,
                                  remarks: session.remarks,
                                });
                              }
                            }}
                            className={`h-14 sm:h-16 rounded-xl p-1.5 sm:p-2 flex flex-col justify-between transition-all relative cursor-pointer border ${
                              isSelected
                                ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                                : session
                                ? session.status === 'absent'
                                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 hover:border-rose-400'
                                  : 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400'
                                : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold ${
                                  isToday
                                    ? 'px-1.5 py-0.5 rounded-md border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold bg-white dark:bg-slate-900 shadow-xs'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {cell.dayNum}
                              </span>

                              {/* Green Dot (Attended) or Red Dot (Missed) */}
                              {session && (
                                <div className="flex items-center gap-1">
                                  {session.status === 'present' && (
                                    <span
                                      className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs"
                                      title="Attended Class (Green Dot)"
                                    ></span>
                                  )}
                                  {session.status === 'absent' && (
                                    <span
                                      className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 shadow-xs animate-pulse"
                                      title="Missed Class / Absent (Red Dot)"
                                    ></span>
                                  )}
                                  {session.status === 'late' && (
                                    <span
                                      className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-xs"
                                      title="Late Arrival (Amber Dot)"
                                    ></span>
                                  )}
                                  {session.status === 'leave' && (
                                    <span
                                      className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 shadow-xs"
                                      title="Approved Leave (Purple Dot)"
                                    ></span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Indicator Label inside cell */}
                            {session ? (
                              <div className="text-[10px] font-bold truncate">
                                {session.status === 'present' && (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-black">Attended</span>
                                )}
                                {session.status === 'absent' && (
                                  <span className="text-rose-600 dark:text-rose-400 font-black">Absent</span>
                                )}
                                {session.status === 'late' && (
                                  <span className="text-amber-600 dark:text-amber-400 font-black">Late</span>
                                )}
                                {session.status === 'leave' && (
                                  <span className="text-purple-600 dark:text-purple-400 font-black">Leave</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-[9px] text-slate-300 dark:text-slate-700 italic">No class</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Clicked Date Details Popover / Banner */}
                    {selectedCalendarDateDetail && (
                      <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 space-y-2 shadow-lg animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="font-extrabold text-sm text-white">
                              {selectedCalendarDateDetail.displayDateStr} ({selectedCalendarDateDetail.dayName})
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
                              selectedCalendarDateDetail.status === 'absent'
                                ? 'bg-rose-600 text-white'
                                : selectedCalendarDateDetail.status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {selectedCalendarDateDetail.status === 'absent' && <XCircle className="w-3.5 h-3.5" />}
                            {selectedCalendarDateDetail.status === 'present' && <CheckCircle className="w-3.5 h-3.5" />}
                            {selectedCalendarDateDetail.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase block font-bold">Lecture Window</span>
                            <span className="font-semibold text-white">{selectedCalendarDateDetail.timeWindow}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase block font-bold">Assigned Faculty</span>
                            <span className="font-semibold text-white">{selectedCalendarDateDetail.teacherName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase block font-bold">Classroom Venue</span>
                            <span className="font-semibold text-white">{selectedCalendarDateDetail.classroom}</span>
                          </div>
                        </div>

                        {selectedCalendarDateDetail.remarks && (
                          <div className="text-[11px] text-slate-400 italic bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 mt-1">
                            Remarks: {selectedCalendarDateDetail.remarks}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chronological All Sessions Ledger */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          All Scheduled Sessions Ledger ({map.size} Total Classes)
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          🟢 {calendarSubjectItem.attendedClasses} Attended • 🔴 {calendarSubjectItem.absentClasses} Missed
                        </span>
                      </div>

                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {Array.from(map.values())
                          .sort((a, b) => b.dateStr.localeCompare(a.dateStr))
                          .map((sess) => (
                            <div
                              key={sess.dateStr}
                              onClick={() => setSelectedCalendarDateDetail(sess)}
                              className={`p-3 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                sess.status === 'absent'
                                  ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/40'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {sess.status === 'present' ? (
                                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" title="Green Dot: Attended"></span>
                                ) : sess.status === 'absent' ? (
                                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" title="Red Dot: Missed"></span>
                                ) : (
                                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                                )}

                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">
                                    {sess.displayDateStr} ({sess.dayName})
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {sess.timeWindow} • Venue: {sess.classroom} • Faculty: {sess.teacherName}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                  sess.status === 'absent'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                }`}
                              >
                                {sess.status === 'absent' ? 'ABSENT' : 'ATTENDED'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Lokbharti University Official Course Ledger • Sem {selectedSemester}
              </span>

              <button
                onClick={() => {
                  setCalendarSubjectItem(null);
                  setSelectedCalendarDateDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
