import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Building2,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Wand2,
  Copy,
  Printer,
  RotateCcw,
  Sparkles,
  BookOpen,
  UserCheck,
  MapPin,
  Filter,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { User, TimetableSlot, Department } from '../../types';
import {
  DEPARTMENTS,
  SUBJECTS,
  getStoredUsers,
  getStoredTimetables,
  saveStoredTimetables,
  addStoredTimetableSlot,
  addStoredTimetableSlots,
  updateStoredTimetableSlot,
  deleteStoredTimetableSlot,
  clearSemesterStoredTimetables,
  generateAutoSemesterTimetable,
} from '../../data/mockDatabase';
import { getSubjectBadgeStyle } from '../../utils/subjectColorUtils';
import { AdminFullWeekTimetableModal } from './AdminFullWeekTimetableModal';

interface AdminTimetableManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  initialDepartmentId?: string;
  initialSemester?: number;
  onAuditLog?: (action: string, details: string) => void;
}

export const AdminTimetableManagementModal: React.FC<AdminTimetableManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialDepartmentId = 'dept_it',
  initialSemester = 3,
  onAuditLog,
}) => {
  // All Timetable Slots state synced with storage
  const [allSlots, setAllSlots] = useState<TimetableSlot[]>(() => getStoredTimetables());

  // Department & Semester Filter State
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId);
  const [selectedSemester, setSelectedSemester] = useState<number>(initialSemester);
  const [academicCycleFilter, setAcademicCycleFilter] = useState<'odd' | 'even' | 'all'>('odd');

  // Search & Day Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'matrix' | 'cards'>('matrix');

  // Add / Edit Slot Modal State
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Full Week Matrix Modal State
  const [fullWeekModalOpen, setFullWeekModalOpen] = useState(false);

  // Form fields
  const [formDay, setFormDay] = useState<TimetableSlot['dayOfWeek']>('Monday');
  const [formSelectedDays, setFormSelectedDays] = useState<TimetableSlot['dayOfWeek'][]>(['Monday']);
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('10:00 AM');
  const [formSubjectCode, setFormSubjectCode] = useState('');
  const [formSubjectName, setFormSubjectName] = useState('');
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formClassroom, setFormClassroom] = useState('Room B-203');
  const [formDepartmentId, setFormDepartmentId] = useState<string>(initialDepartmentId);
  const [formSemester, setFormSemester] = useState<number>(initialSemester);

  // Copy Schedule Modal State
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceDept, setCopySourceDept] = useState<string>(initialDepartmentId);
  const [copySourceSem, setCopySourceSem] = useState<number>(1);

  // Auto-Generate Confirmation Modal State
  const [autoGenModalOpen, setAutoGenModalOpen] = useState(false);

  // Delete Confirmation State
  const [deletingSlot, setDeletingSlot] = useState<TimetableSlot | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Conflict warning
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync with global database updates
  useEffect(() => {
    const handleUpdated = () => {
      setAllSlots(getStoredTimetables());
    };
    window.addEventListener('lbu_timetables_updated', handleUpdated);
    return () => {
      window.removeEventListener('lbu_timetables_updated', handleUpdated);
    };
  }, []);

  // Update initial department / semester if props change
  useEffect(() => {
    if (initialDepartmentId) setSelectedDeptId(initialDepartmentId);
    if (initialSemester) setSelectedSemester(initialSemester);
  }, [initialDepartmentId, initialSemester]);

  // Days list
  const days: TimetableSlot['dayOfWeek'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Standard Semester Range (Sem 1 to Sem 8)
  const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const displayedSemesters = useMemo(() => {
    if (academicCycleFilter === 'odd') return [1, 3, 5, 7];
    if (academicCycleFilter === 'even') return [2, 4, 6, 8];
    return allSemesters;
  }, [academicCycleFilter]);

  // Selected Department Info
  const currentDept = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  }, [selectedDeptId]);

  // Available subjects for current department & semester
  const availableDepartmentSubjects = useMemo(() => {
    return SUBJECTS.filter(
      (s) => s.departmentId === selectedDeptId && (s.semester === selectedSemester || !s.semester)
    );
  }, [selectedDeptId, selectedSemester]);

  // Available Teachers / Faculties from database
  const availableFaculties = useMemo(() => {
    const users = getStoredUsers();
    return users.filter(
      (u) =>
        u.role === 'teacher' ||
        u.role === 'hod' ||
        u.departmentId === selectedDeptId
    );
  }, [selectedDeptId]);

  // Slots for currently selected department and semester
  const semesterSlots = useMemo(() => {
    return allSlots.filter(
      (s) => s.departmentId === selectedDeptId && Number(s.semester) === Number(selectedSemester)
    );
  }, [allSlots, selectedDeptId, selectedSemester]);

  // Filtered slots according to search query and day filter
  const filteredSemesterSlots = useMemo(() => {
    return semesterSlots.filter((slot) => {
      const matchDay = selectedDayFilter === 'all' || slot.dayOfWeek === selectedDayFilter;
      const matchQuery =
        !searchQuery.trim() ||
        slot.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.classroom.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDay && matchQuery;
    });
  }, [semesterSlots, selectedDayFilter, searchQuery]);

  // Parse time helper
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

  // Distinct time intervals across all slots in this semester
  const uniqueTimeIntervals = useMemo(() => {
    const intervalsMap = new Map<string, { start: string; end: string; startMins: number }>();
    semesterSlots.forEach((slot) => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!intervalsMap.has(key)) {
        intervalsMap.set(key, {
          start: slot.startTime,
          end: slot.endTime,
          startMins: parseTimeToMinutes(slot.startTime),
        });
      }
    });

    if (intervalsMap.size === 0) {
      // Default standard academic slots spanning full day 7:30 AM to 5:00 PM
      return [
        { start: '07:30 AM', end: '08:30 AM', startMins: 450 },
        { start: '08:40 AM', end: '09:40 AM', startMins: 520 },
        { start: '09:50 AM', end: '10:50 AM', startMins: 590 },
        { start: '11:00 AM', end: '12:00 PM', startMins: 660 },
        { start: '01:00 PM', end: '02:00 PM', startMins: 780 },
        { start: '02:00 PM', end: '03:00 PM', startMins: 840 },
        { start: '03:00 PM', end: '04:00 PM', startMins: 900 },
        { start: '04:00 PM', end: '05:00 PM', startMins: 960 },
      ];
    }

    return Array.from(intervalsMap.values()).sort((a, b) => a.startMins - b.startMins);
  }, [semesterSlots]);

  // Open modal for Adding a new slot
  const handleOpenAddSlot = (presetDay?: TimetableSlot['dayOfWeek'], presetTime?: { start: string; end: string }) => {
    setEditingSlotId(null);
    setFormDay(presetDay || 'Monday');
    setFormSelectedDays(presetDay ? [presetDay] : ['Monday']);
    setFormStartTime(presetTime?.start || '09:00 AM');
    setFormEndTime(presetTime?.end || '10:00 AM');
    setFormDepartmentId(selectedDeptId);
    setFormSemester(selectedSemester);

    // Pick first available subject or default
    if (availableDepartmentSubjects.length > 0) {
      setFormSubjectCode(availableDepartmentSubjects[0].code);
      setFormSubjectName(availableDepartmentSubjects[0].name);
    } else {
      setFormSubjectCode(`${currentDept.code}-S${selectedSemester}-101`);
      setFormSubjectName('Core Academic Subject');
    }

    if (availableFaculties.length > 0) {
      setFormTeacherName(availableFaculties[0].name);
    } else {
      setFormTeacherName('Department Faculty');
    }

    setFormClassroom('Room B-203');
    setConflictWarning(null);
    setSlotModalOpen(true);
  };

  // Open modal for Editing an existing slot
  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setFormDay(slot.dayOfWeek);
    setFormSelectedDays([slot.dayOfWeek]);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormSubjectCode(slot.subjectCode);
    setFormSubjectName(slot.subjectName);
    setFormTeacherName(slot.teacherName);
    setFormClassroom(slot.classroom);
    setFormDepartmentId(slot.departmentId);
    setFormSemester(slot.semester);
    setConflictWarning(null);
    setSlotModalOpen(true);
  };

  // Check for timetable conflict
  const checkScheduleConflict = (
    day: string,
    startTime: string,
    teacher: string,
    classroom: string,
    excludeSlotId?: string | null
  ) => {
    return allSlots.find(
      (s) =>
        s.id !== excludeSlotId &&
        s.dayOfWeek === day &&
        s.startTime === startTime &&
        ((teacher && s.teacherName.toLowerCase().trim() === teacher.toLowerCase().trim()) ||
          (classroom && s.classroom.toLowerCase().trim() === classroom.toLowerCase().trim()))
    );
  };

  // Save Add or Edit slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectName.trim() || !formSubjectCode.trim()) {
      showToast('error', 'Please provide a valid Subject Code and Subject Name.');
      return;
    }

    const daysToProcess = editingSlotId
      ? [formDay]
      : formSelectedDays.length > 0
      ? formSelectedDays
      : [formDay];

    // Check collisions for all target days
    for (const targetDay of daysToProcess) {
      const collision = checkScheduleConflict(
        targetDay,
        formStartTime,
        formTeacherName,
        formClassroom,
        editingSlotId
      );

      if (collision) {
        const conflictMsg = `Schedule Conflict on ${targetDay}: ${
          collision.teacherName.toLowerCase().trim() === formTeacherName.toLowerCase().trim()
            ? `Faculty '${formTeacherName}'`
            : `Classroom '${formClassroom}'`
        } is already booked for '${collision.subjectName}' (Dept: ${collision.departmentId}, Sem: ${collision.semester}) on ${targetDay} at ${formStartTime}!`;
        setConflictWarning(conflictMsg);
        return;
      }
    }

    if (editingSlotId) {
      // Update existing single slot
      const updatedSlot: TimetableSlot = {
        id: editingSlotId,
        dayOfWeek: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: `sub_${formSubjectCode.toLowerCase().replace(/\s+/g, '_')}`,
        subjectName: formSubjectName.trim(),
        subjectCode: formSubjectCode.trim().toUpperCase(),
        departmentId: formDepartmentId,
        semester: Number(formSemester),
        teacherId: `usr_fac_${Date.now()}`,
        teacherName: formTeacherName.trim() || 'Department Faculty',
        classroom: formClassroom.trim() || 'Classroom',
      };
      const newSlots = updateStoredTimetableSlot(updatedSlot);
      setAllSlots(newSlots);
      showToast('success', `Successfully updated timetable slot: ${updatedSlot.subjectName} (${updatedSlot.dayOfWeek} ${updatedSlot.startTime})`);

      if (onAuditLog) {
        onAuditLog(
          'UPDATE_TIMETABLE_SLOT',
          `Edited timetable slot ${updatedSlot.subjectCode} for ${currentDept.name} (Sem ${formSemester}) on ${formDay}`
        );
      }
    } else {
      // Add multiple or single new slots
      const timestamp = Date.now();
      const slotsToAdd: TimetableSlot[] = daysToProcess.map((d, idx) => ({
        id: `slot_${formDepartmentId}_sem${formSemester}_${d.toLowerCase()}_${timestamp}_${idx}`,
        dayOfWeek: d,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: `sub_${formSubjectCode.toLowerCase().replace(/\s+/g, '_')}`,
        subjectName: formSubjectName.trim(),
        subjectCode: formSubjectCode.trim().toUpperCase(),
        departmentId: formDepartmentId,
        semester: Number(formSemester),
        teacherId: `usr_fac_${timestamp}_${idx}`,
        teacherName: formTeacherName.trim() || 'Department Faculty',
        classroom: formClassroom.trim() || 'Classroom',
      }));

      const newSlots = addStoredTimetableSlots(slotsToAdd);
      setAllSlots(newSlots);

      if (slotsToAdd.length === 1) {
        showToast('success', `Added new lecture slot: ${slotsToAdd[0].subjectName} (${slotsToAdd[0].dayOfWeek} ${slotsToAdd[0].startTime})`);
      } else if (slotsToAdd.length === 6) {
        showToast('success', `Added ${slotsToAdd[0].subjectName} to the Entire Week (Monday to Saturday) at ${formStartTime}!`);
      } else {
        showToast('success', `Added ${slotsToAdd.length} slots for ${slotsToAdd[0].subjectName} across selected days (${daysToProcess.join(', ')})!`);
      }

      if (onAuditLog) {
        onAuditLog(
          'ADD_TIMETABLE_SLOT',
          `Added ${slotsToAdd.length} slot(s) for ${formSubjectCode} in ${currentDept.name} (Sem ${formSemester}) across ${daysToProcess.join(', ')}`
        );
      }
    }

    setSlotModalOpen(false);
    setEditingSlotId(null);
    setConflictWarning(null);
  };

  // Confirm delete slot
  const handleConfirmDeleteSlot = () => {
    if (!deletingSlot) return;
    const slotToDelete = deletingSlot;
    const newSlots = deleteStoredTimetableSlot(slotToDelete.id);
    setAllSlots(newSlots);
    setDeletingSlot(null);
    showToast('info', `Removed timetable slot: ${slotToDelete.subjectName} (${slotToDelete.dayOfWeek})`);

    if (onAuditLog) {
      onAuditLog(
        'DELETE_TIMETABLE_SLOT',
        `Deleted timetable slot ${slotToDelete.subjectCode} from ${currentDept.name} (Sem ${slotToDelete.semester})`
      );
    }
  };

  // Clear all slots for this semester
  const handleClearSemesterTimetable = () => {
    const newSlots = clearSemesterStoredTimetables(selectedDeptId, selectedSemester);
    setAllSlots(newSlots);
    setClearConfirmOpen(false);
    showToast('info', `Cleared all timetable slots for ${currentDept.name} – Semester ${selectedSemester}.`);

    if (onAuditLog) {
      onAuditLog(
        'CLEAR_SEMESTER_TIMETABLE',
        `Cleared full timetable for ${currentDept.name} (Semester ${selectedSemester})`
      );
    }
  };

  // Auto-generate conflict-free schedule for this semester
  const handleRunAutoGenerator = () => {
    const updated = generateAutoSemesterTimetable(selectedDeptId, selectedSemester);
    setAllSlots(updated);
    setAutoGenModalOpen(false);
    showToast(
      'success',
      `Auto-generated conflict-free timetable schedule for ${currentDept.name} (Semester ${selectedSemester})!`
    );

    if (onAuditLog) {
      onAuditLog(
        'AUTOGEN_TIMETABLE',
        `Auto-generated complete timetable schedule for ${currentDept.name} (Semester ${selectedSemester})`
      );
    }
  };

  // Copy schedule from another semester/department
  const handleCopySchedule = () => {
    const sourceSlots = allSlots.filter(
      (s) => s.departmentId === copySourceDept && Number(s.semester) === Number(copySourceSem)
    );

    if (sourceSlots.length === 0) {
      showToast('error', 'The selected source semester has no timetable slots to copy.');
      return;
    }

    // Keep other slots, remove current target semester slots, copy source slots with new IDs & target department/semester
    const otherSlots = allSlots.filter(
      (s) => !(s.departmentId === selectedDeptId && Number(s.semester) === Number(selectedSemester))
    );

    const copiedSlots: TimetableSlot[] = sourceSlots.map((s, idx) => ({
      ...s,
      id: `copy_${selectedDeptId}_s${selectedSemester}_${Date.now()}_${idx}`,
      departmentId: selectedDeptId,
      semester: selectedSemester,
    }));

    const finalSlots = [...otherSlots, ...copiedSlots];
    saveStoredTimetables(finalSlots);
    setAllSlots(finalSlots);
    setCopyModalOpen(false);
    showToast(
      'success',
      `Successfully copied ${copiedSlots.length} timetable slots from Sem ${copySourceSem} to ${currentDept.name} (Sem ${selectedSemester})!`
    );

    if (onAuditLog) {
      onAuditLog(
        'COPY_TIMETABLE',
        `Copied timetable from ${copySourceDept} (Sem ${copySourceSem}) to ${selectedDeptId} (Sem ${selectedSemester})`
      );
    }
  };

  // Print timetable
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      id="admin-timetable-management-modal"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Central Timetable Admin Control
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Academic Year 2026–27</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              University Timetable Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add, edit, delete, and auto-generate timetables across all departments and semesters with separate semester controls.
            </p>
          </div>

          {/* Top Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFullWeekModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all border border-purple-400/40 animate-pulse"
              id="admin-add-full-week-header-btn"
              title="Add the entire week's schedule (Monday to Saturday) in a single visual table"
            >
              <Calendar className="w-4 h-4 text-purple-200" />
              <span>📅 Add Full Week Timetable</span>
            </button>

            <button
              onClick={() => handleOpenAddSlot()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-400/30"
              id="admin-add-slot-btn"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Slot (Sem {selectedSemester})</span>
            </button>

            <button
              onClick={() => setAutoGenModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 active:scale-95 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all border border-purple-400/30"
              id="admin-autogen-slot-btn"
              title="Generate optimized conflict-free timetable for this semester"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Generate</span>
            </button>

            <button
              onClick={() => {
                setCopySourceDept(selectedDeptId);
                setCopySourceSem(selectedSemester === 1 ? 3 : 1);
                setCopyModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
              title="Copy schedule from another department or semester"
            >
              <Copy className="w-3.5 h-3.5 text-purple-300" />
              <span>Copy</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Print / Save Timetable PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {semesterSlots.length > 0 && (
              <button
                onClick={() => setClearConfirmOpen(true)}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Clear all slots for this semester"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Sem {selectedSemester}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1 border border-slate-700"
              title="Close Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-purple-950/80 border-purple-500/50 text-purple-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Control Bar: Department & Semester Navigation (Key Requirement) */}
        <div className="p-4 sm:p-6 space-y-4 bg-slate-950/40 border-b border-slate-800/80">
          {/* Department Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                Department:
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer max-w-xs sm:max-w-md"
                id="admin-timetable-dept-select"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) — {d.degreeCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Cycle Toggle */}
            <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setAcademicCycleFilter('odd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  academicCycleFilter === 'odd'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Odd Terms (Sem 1, 3, 5, 7)
              </button>
              <button
                type="button"
                onClick={() => setAcademicCycleFilter('even')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  academicCycleFilter === 'even'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Even Terms (Sem 2, 4, 6, 8)
              </button>
              <button
                type="button"
                onClick={() => setAcademicCycleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  academicCycleFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (1–8)
              </button>
            </div>
          </div>

          {/* SEPARATE TIMETABLE MANAGEMENT FOR EACH SEMESTER (Tabs / Pills) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Select Semester to Manage Timetable:
              </div>
              <span className="text-[11px] text-purple-300 font-bold">
                Managing: <span className="text-white font-black underline">{currentDept.name} — Semester {selectedSemester}</span> ({semesterSlots.length} lecture slots scheduled)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {displayedSemesters.map((sem) => {
                const count = allSlots.filter(
                  (s) => s.departmentId === selectedDeptId && Number(s.semester) === Number(sem)
                ).length;
                const isSelected = selectedSemester === sem;

                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center cursor-pointer select-none relative ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 text-white shadow-lg shadow-purple-900/40 ring-2 ring-purple-400/30 font-black'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 font-bold'
                    }`}
                  >
                    <div className="text-xs font-black">Semester {sem}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                          count > 0
                            ? isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {count > 0 ? `${count} slots` : 'Empty'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Day Filter & View Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subject, faculty, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="all">All Days (Mon–Sat)</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewLayout('matrix')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewLayout === 'matrix' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly Matrix Grid
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewLayout === 'cards' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Card List ({filteredSemesterSlots.length})
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {semesterSlots.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">
                  No Timetable Configured for {currentDept.name} (Semester {selectedSemester})
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  This semester currently has an empty schedule. You can create slots individually or use our conflict-free auto-generator to populate the schedule instantly.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setFullWeekModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all border border-purple-400/40"
                >
                  <Calendar className="w-4 h-4 text-purple-200" />
                  <span>📅 Add Entire Week at Once (Full Grid)</span>
                </button>
                <button
                  onClick={() => handleOpenAddSlot()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Slot (Single / Multi-Day)</span>
                </button>
                <button
                  onClick={() => setAutoGenModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Wand2 className="w-4 h-4 text-purple-300" />
                  <span>Auto-Generate</span>
                </button>
              </div>
            </div>
          ) : viewLayout === 'matrix' ? (
            /* Weekly Matrix Grid View */
            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl bg-slate-950/60">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                    <th className="p-3.5 text-xs font-black uppercase tracking-wider text-purple-300 w-36 border-r border-slate-800">
                      Timing / Day
                    </th>
                    {days
                      .filter((d) => selectedDayFilter === 'all' || d === selectedDayFilter)
                      .map((day) => (
                        <th
                          key={day}
                          className="p-3.5 text-xs font-black uppercase tracking-wider text-slate-200 border-r border-slate-800 last:border-r-0 text-center"
                        >
                          {day}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {uniqueTimeIntervals.map((interval) => (
                    <tr key={`${interval.start}-${interval.end}`} className="hover:bg-slate-900/40 transition-colors">
                      {/* Time Column */}
                      <td className="p-3 bg-slate-900/90 font-mono text-[11px] font-bold text-slate-300 border-r border-slate-800 align-top">
                        <div className="flex items-center gap-1.5 text-purple-300">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{interval.start}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pl-5">to {interval.end}</div>
                      </td>

                      {/* Day Columns */}
                      {days
                        .filter((d) => selectedDayFilter === 'all' || d === selectedDayFilter)
                        .map((day) => {
                          const slot = semesterSlots.find(
                            (s) => s.dayOfWeek === day && s.startTime === interval.start
                          );

                          if (!slot) {
                            return (
                              <td
                                key={day}
                                className="p-2 border-r border-slate-800/80 last:border-r-0 align-top text-center group"
                              >
                                <button
                                  onClick={() => handleOpenAddSlot(day, interval)}
                                  className="w-full h-full min-h-[70px] rounded-xl border border-dashed border-slate-800/80 hover:border-purple-500/50 hover:bg-purple-950/20 text-slate-600 hover:text-purple-300 flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all cursor-pointer opacity-40 hover:opacity-100 p-2"
                                  title={`Add slot on ${day} at ${interval.start}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Add Slot</span>
                                </button>
                              </td>
                            );
                          }

                          const badgeStyle = getSubjectBadgeStyle(slot.subjectCode);

                          return (
                            <td
                              key={day}
                              className="p-2 border-r border-slate-800/80 last:border-r-0 align-top"
                            >
                              <div
                                className={`p-3 rounded-xl border transition-all relative group shadow-sm ${
                                  badgeStyle || 'bg-slate-900 border-slate-700 text-white'
                                }`}
                              >
                                {/* Quick Edit / Delete floating action buttons */}
                                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-slate-950/90 rounded-lg p-0.5 shadow-md transition-opacity">
                                  <button
                                    onClick={() => handleOpenEditSlot(slot)}
                                    className="p-1 rounded text-purple-300 hover:text-white hover:bg-purple-600 transition-colors"
                                    title="Edit this slot"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingSlot(slot)}
                                    className="p-1 rounded text-rose-300 hover:text-white hover:bg-rose-600 transition-colors"
                                    title="Delete this slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1 font-mono text-[10px] font-black uppercase tracking-wider opacity-90">
                                  <span>{slot.subjectCode}</span>
                                </div>

                                <div className="text-xs font-black text-white mt-0.5 line-clamp-2">
                                  {slot.subjectName}
                                </div>

                                <div className="mt-2 pt-1.5 border-t border-white/10 flex flex-col gap-0.5 text-[10px]">
                                  <div className="flex items-center gap-1 text-slate-200 font-medium truncate">
                                    <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span className="truncate">{slot.teacherName}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-300 font-mono">
                                    <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                                    <span>{slot.classroom}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card List View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSemesterSlots.map((slot) => {
                const badgeStyle = getSubjectBadgeStyle(slot.subjectCode);

                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black font-mono bg-purple-950/80 text-purple-300 border border-purple-800/60">
                          {slot.dayOfWeek}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-[11px] font-mono font-bold text-emerald-400">
                          {slot.subjectCode}
                        </div>
                        <h4 className="text-sm font-black text-white mt-0.5">
                          {slot.subjectName}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Faculty: <strong className="text-white">{slot.teacherName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Room: <strong className="text-white font-mono">{slot.classroom}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleOpenEditSlot(slot)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-purple-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingSlot(slot)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Total Slots for <strong className="text-white">{currentDept.name} (Sem {selectedSemester})</strong>: <strong className="text-emerald-400">{semesterSlots.length}</strong>
            </span>
            <span>
              Total University Timetable Database Slots: <strong className="text-purple-400">{allSlots.length}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-all self-end sm:self-auto"
          >
            Done / Close
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADD / EDIT SLOT MODAL */}
      {/* ========================================================================= */}
      {slotModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          id="admin-slot-edit-modal"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  {editingSlotId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingSlotId ? 'Edit Timetable Lecture Slot' : 'Add New Timetable Slot'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentDept.name} • Semester {formSemester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSlotModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Alert Banner */}
            {conflictWarning && (
              <div className="p-3 bg-rose-950/90 border-b border-rose-800/80 text-rose-200 text-xs font-bold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{conflictWarning}</div>
                <button
                  onClick={() => setConflictWarning(null)}
                  className="p-0.5 hover:bg-white/10 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSaveSlot} className="p-5 space-y-4 overflow-y-auto flex-1">
              {!editingSlotId && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Full Week Timetable Matrix</div>
                      <div className="text-[11px] text-purple-300/80">Configure all periods for all 6 days at once in one visual table</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSlotModalOpen(false);
                      setFullWeekModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md cursor-pointer shrink-0 transition-all"
                  >
                    Open Matrix
                  </button>
                </div>
              )}

              {/* Day Selection with Entire Week Preset */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Day(s) of Week * {formSelectedDays.length > 1 && <span className="text-purple-400 font-mono">({formSelectedDays.length} Days Selected)</span>}
                  </label>
                  {!editingSlotId && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setFormSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
                          setConflictWarning(null);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-black cursor-pointer transition-colors"
                      >
                        ⭐ Entire Week (Mon–Sat)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
                          setConflictWarning(null);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer transition-colors"
                      >
                        Mon–Fri
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Day Selection Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {days.map((d) => {
                    const isSelected = formSelectedDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setConflictWarning(null);
                          if (editingSlotId) {
                            setFormSelectedDays([d]);
                            setFormDay(d);
                          } else {
                            if (isSelected) {
                              if (formSelectedDays.length > 1) {
                                setFormSelectedDays(formSelectedDays.filter((x) => x !== d));
                              }
                            } else {
                              setFormSelectedDays([...formSelectedDays, d]);
                            }
                          }
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                        }`}
                      >
                        <span>{d.slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>

                {formSelectedDays.length === 6 && (
                  <div className="mt-1.5 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Adding to Entire Week: This slot will be scheduled for all 6 days (Mon to Sat) at once.</span>
                  </div>
                )}
              </div>

              {/* Quick Period Selector (7:30 AM to 5:00 PM) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Daily Period Quick Select (7:30 AM – 5:00 PM)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Click to auto-fill time</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: 'P1: 7:30–8:30 AM', start: '07:30 AM', end: '08:30 AM', title: 'First class: 7:30 AM to 8:30 AM' },
                    { label: 'P2: 8:40–9:40 AM', start: '08:40 AM', end: '09:40 AM', title: 'Second class: 8:40 AM to 9:40 AM' },
                    { label: 'P3: 9:50–10:50 AM', start: '09:50 AM', end: '10:50 AM', title: 'Third class: 9:50 AM to 10:50 AM' },
                    { label: 'P4: 11:00–12:00 PM', start: '11:00 AM', end: '12:00 PM', title: 'Fourth class: 11:00 AM to 12:00 PM' },
                    { label: 'P5: 1:00–2:00 PM', start: '01:00 PM', end: '02:00 PM', title: 'Fifth class: 1:00 PM to 2:00 PM' },
                    { label: 'P6: 2:00–3:00 PM', start: '02:00 PM', end: '03:00 PM', title: 'Sixth class: 2:00 PM to 3:00 PM' },
                    { label: 'P7: 3:00–4:00 PM', start: '03:00 PM', end: '04:00 PM', title: 'Seventh class: 3:00 PM to 4:00 PM' },
                    { label: 'P8: 4:00–5:00 PM', start: '04:00 PM', end: '05:00 PM', title: 'Last class: 4:00 PM to 5:00 PM' },
                  ].map((p) => {
                    const isCurrent = formStartTime === p.start && formEndTime === p.end;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setFormStartTime(p.start);
                          setFormEndTime(p.end);
                          setConflictWarning(null);
                        }}
                        title={p.title}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-left truncate cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-600 border-purple-400 text-white shadow-xs'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => {
                      setFormStartTime(e.target.value);
                      setConflictWarning(null);
                    }}
                    placeholder="07:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    End Time *
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="08:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Department & Semester (Separate Semester Assignment) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    Department *
                  </label>
                  <select
                    value={formDepartmentId}
                    onChange={(e) => setFormDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    Semester (1–8) *
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {allSemesters.map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preset Department Subjects Picker */}
              {availableDepartmentSubjects.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Quick Pick Official Subject
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableDepartmentSubjects.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setFormSubjectCode(sub.code);
                          setFormSubjectName(sub.name);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          formSubjectCode === sub.code
                            ? 'bg-purple-600 border-purple-400 text-white shadow-xs'
                            : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {sub.code} – {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    value={formSubjectCode}
                    onChange={(e) => setFormSubjectCode(e.target.value)}
                    placeholder="e.g. 08BVOCMJ305"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                    Subject / Course Name *
                  </label>
                  <input
                    type="text"
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="e.g. Oops – using C++"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Teacher / Faculty Assignment */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                  <span>Assigned Faculty / Instructor *</span>
                  {availableFaculties.length > 0 && (
                    <span className="text-[10px] text-purple-400 font-mono font-normal">
                      {availableFaculties.length} faculty members registered
                    </span>
                  )}
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={formTeacherName}
                    onChange={(e) => {
                      setFormTeacherName(e.target.value);
                      setConflictWarning(null);
                    }}
                    placeholder="e.g. Mitulgiri Gauswami (MG)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  {availableFaculties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {availableFaculties.slice(0, 6).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setFormTeacherName(f.name);
                            setConflictWarning(null);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          + {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Classroom / Location */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                  Classroom / Lab / Venue *
                </label>
                <input
                  type="text"
                  value={formClassroom}
                  onChange={(e) => {
                    setFormClassroom(e.target.value);
                    setConflictWarning(null);
                  }}
                  placeholder="e.g. Room B-203, Computer Lab 1, Auditorium"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Room B-203', 'Room B-201', 'Computer Lab 1', 'Computer Lab 2', 'Innovation Hub', 'Auditorium', 'Field Lab'].map(
                    (room) => (
                      <button
                        key={room}
                        type="button"
                        onClick={() => {
                          setFormClassroom(room);
                          setConflictWarning(null);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                      >
                        {room}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5 border border-purple-400/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {editingSlotId
                      ? 'Save Changes'
                      : formSelectedDays.length === 6
                      ? '⚡ Create Entire Week Slots (6 Days at once)'
                      : formSelectedDays.length > 1
                      ? `Create ${formSelectedDays.length} Slots (Selected Days)`
                      : 'Create Timetable Slot'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTO-GENERATE SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {autoGenModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
              <Wand2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white">
                Auto-Generate Timetable Schedule
              </h3>
              <p className="text-xs text-slate-300">
                Generate an optimized, non-overlapping weekly schedule (Monday to Saturday) for:
              </p>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-purple-300 font-bold text-xs mt-2">
                {currentDept.name} — Semester {selectedSemester}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-purple-950/30 p-3 rounded-xl border border-purple-800/40">
              ⚡ This will create 36 lecture slots across the week mapped to official subjects and faculty with automatic conflict prevention. Existing slots for this semester will be replaced.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAutoGenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAutoGenerator}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Generate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COPY SCHEDULE MODAL */}
      {/* ========================================================================= */}
      {copyModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-extrabold text-white">Copy Timetable Schedule</h3>
              </div>
              <button
                onClick={() => setCopyModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Clone timetable slots from another department/semester into:
              <strong className="text-purple-300 block mt-1">
                {currentDept.name} (Semester {selectedSemester})
              </strong>
            </p>

            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                  Source Department:
                </label>
                <select
                  value={copySourceDept}
                  onChange={(e) => setCopySourceDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1 block">
                  Source Semester:
                </label>
                <select
                  value={copySourceSem}
                  onChange={(e) => setCopySourceSem(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none"
                >
                  {allSemesters.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCopyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopySchedule}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy into Sem {selectedSemester}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE SINGLE SLOT CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingSlot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-rose-700/60 rounded-3xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-white">Delete Timetable Slot?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to remove <strong className="text-white font-mono">{deletingSlot.subjectCode} – {deletingSlot.subjectName}</strong> ({deletingSlot.dayOfWeek} at {deletingSlot.startTime})?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSlot(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSlot}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Slot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CLEAR FULL SEMESTER CONFIRMATION */}
      {/* ========================================================================= */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-rose-700/60 rounded-3xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-white">Clear All Semester Slots?</h3>
              <p className="text-xs text-slate-300">
                This will delete all <strong>{semesterSlots.length}</strong> scheduled timetable slots for <strong className="text-white">{currentDept.name} (Semester {selectedSemester})</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClearConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearSemesterTimetable}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Slots</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FULL WEEK TIMETABLE MATRIX BUILDER (ALL 6 DAYS AT ONCE) */}
      {/* ========================================================================= */}
      {fullWeekModalOpen && (
        <AdminFullWeekTimetableModal
          isOpen={fullWeekModalOpen}
          onClose={() => setFullWeekModalOpen(false)}
          currentUser={currentUser}
          initialDepartmentId={selectedDeptId}
          initialSemester={selectedSemester}
          onSuccess={(msg) => {
            showToast('success', msg);
            setAllSlots(getStoredTimetables());
          }}
          onAuditLog={onAuditLog}
        />
      )}

    </div>
  );
};
