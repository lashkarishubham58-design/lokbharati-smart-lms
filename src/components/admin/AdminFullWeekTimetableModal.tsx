import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Wand2,
  BookOpen,
  UserCheck,
  MapPin,
  RotateCcw,
  ArrowRight,
  Layers
} from 'lucide-react';
import { User, TimetableSlot, Department } from '../../types';
import {
  DEPARTMENTS,
  SUBJECTS,
  getStoredUsers,
  getStoredTimetables,
  replaceSemesterStoredTimetables,
  addStoredTimetableSlots,
} from '../../data/mockDatabase';
import { getSubjectBadgeStyle } from '../../utils/subjectColorUtils';

interface AdminFullWeekTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User | null;
  initialDepartmentId?: string;
  initialSemester?: number;
  onSuccess?: (message: string) => void;
  onAuditLog?: (action: string, details: string) => void;
}

const DAYS_OF_WEEK: TimetableSlot['dayOfWeek'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface CellData {
  enabled: boolean;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  classroom: string;
}

interface PeriodRow {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  days: Record<TimetableSlot['dayOfWeek'], CellData>;
}

export interface StandardPeriodTemplate {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  description: string;
}

export const FULL_DAY_PERIOD_TEMPLATES: Record<string, { name: string; periods: StandardPeriodTemplate[] }> = {
  standard: {
    name: 'Full Day (8 Periods: 7:30 AM – 5:00 PM)',
    periods: [
      { id: 'p1', label: 'Period 1 (Morning)', startTime: '07:30 AM', endTime: '08:30 AM', description: 'First Class' },
      { id: 'p2', label: 'Period 2 (Morning)', startTime: '08:40 AM', endTime: '09:40 AM', description: 'Second Class' },
      { id: 'p3', label: 'Period 3 (Core)', startTime: '09:50 AM', endTime: '10:50 AM', description: 'Third Class' },
      { id: 'p4', label: 'Period 4 (Pre-Lunch)', startTime: '11:00 AM', endTime: '12:00 PM', description: 'Fourth Class' },
      { id: 'p5', label: 'Period 5 (Post-Lunch)', startTime: '01:00 PM', endTime: '02:00 PM', description: 'Fifth Class' },
      { id: 'p6', label: 'Period 6 (Afternoon)', startTime: '02:00 PM', endTime: '03:00 PM', description: 'Sixth Class' },
      { id: 'p7', label: 'Period 7 (Afternoon)', startTime: '03:00 PM', endTime: '04:00 PM', description: 'Seventh Class' },
      { id: 'p8', label: 'Period 8 (Final)', startTime: '04:00 PM', endTime: '05:00 PM', description: 'Last Class' },
    ],
  },
  continuous: {
    name: 'Continuous 10-Min Intervals (7:30 AM – 5:00 PM)',
    periods: [
      { id: 'p1', label: 'Period 1', startTime: '07:30 AM', endTime: '08:30 AM', description: 'First Class' },
      { id: 'p2', label: 'Period 2', startTime: '08:40 AM', endTime: '09:40 AM', description: 'Second Class' },
      { id: 'p3', label: 'Period 3', startTime: '09:50 AM', endTime: '10:50 AM', description: 'Third Class' },
      { id: 'p4', label: 'Period 4', startTime: '11:00 AM', endTime: '12:00 PM', description: 'Fourth Class' },
      { id: 'p5', label: 'Period 5', startTime: '12:10 PM', endTime: '01:10 PM', description: 'Fifth Class' },
      { id: 'p6', label: 'Period 6', startTime: '01:20 PM', endTime: '02:20 PM', description: 'Sixth Class' },
      { id: 'p7', label: 'Period 7', startTime: '02:30 PM', endTime: '03:30 PM', description: 'Seventh Class' },
      { id: 'p8', label: 'Period 8', startTime: '04:00 PM', endTime: '05:00 PM', description: 'Last Class' },
    ],
  },
  morningOnly: {
    name: 'Morning Shift (7:30 AM – 12:00 PM)',
    periods: [
      { id: 'p1', label: 'Period 1 (Morning)', startTime: '07:30 AM', endTime: '08:30 AM', description: 'First Class' },
      { id: 'p2', label: 'Period 2 (Morning)', startTime: '08:40 AM', endTime: '09:40 AM', description: 'Second Class' },
      { id: 'p3', label: 'Period 3 (Core)', startTime: '09:50 AM', endTime: '10:50 AM', description: 'Third Class' },
      { id: 'p4', label: 'Period 4 (Core)', startTime: '11:00 AM', endTime: '12:00 PM', description: 'Fourth Class' },
    ],
  },
  afternoonOnly: {
    name: 'Afternoon Shift (1:00 PM – 5:00 PM)',
    periods: [
      { id: 'p5', label: 'Period 5 (Post-Lunch)', startTime: '01:00 PM', endTime: '02:00 PM', description: 'Fifth Class' },
      { id: 'p6', label: 'Period 6 (Afternoon)', startTime: '02:00 PM', endTime: '03:00 PM', description: 'Sixth Class' },
      { id: 'p7', label: 'Period 7 (Afternoon)', startTime: '03:00 PM', endTime: '04:00 PM', description: 'Seventh Class' },
      { id: 'p8', label: 'Period 8 (Final)', startTime: '04:00 PM', endTime: '05:00 PM', description: 'Last Class' },
    ],
  },
};

const DEFAULT_TIME_PERIODS = FULL_DAY_PERIOD_TEMPLATES.standard.periods;

export const AdminFullWeekTimetableModal: React.FC<AdminFullWeekTimetableModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialDepartmentId = 'dept_it',
  initialSemester = 3,
  onSuccess,
  onAuditLog,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId);
  const [selectedSemester, setSelectedSemester] = useState<number>(initialSemester);
  const [saveMode, setSaveMode] = useState<'replace' | 'merge'>('replace');
  const [activeTabDay, setActiveTabDay] = useState<TimetableSlot['dayOfWeek'] | 'all'>('all');
  const [bulkClassroom, setBulkClassroom] = useState('Room B-203');
  const [bulkFaculty, setBulkFaculty] = useState('');
  const [conflictErrors, setConflictErrors] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const currentDept = useMemo(() => {
    return DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  }, [selectedDeptId]);

  const availableSubjects = useMemo(() => {
    return SUBJECTS.filter(
      (s) => s.departmentId === selectedDeptId && (s.semester === selectedSemester || !s.semester)
    );
  }, [selectedDeptId, selectedSemester]);

  const availableFaculties = useMemo(() => {
    const users = getStoredUsers();
    return users.filter(
      (u) =>
        u.role === 'teacher' ||
        u.role === 'hod' ||
        u.departmentId === selectedDeptId
    );
  }, [selectedDeptId]);

  // Initial Grid Initialization helper
  const createInitialGrid = (deptId: string, sem: number): PeriodRow[] => {
    const deptSubjects = SUBJECTS.filter(
      (s) => s.departmentId === deptId && (s.semester === sem || !s.semester)
    );

    const existingSlots = getStoredTimetables().filter(
      (s) => s.departmentId === deptId && Number(s.semester) === Number(sem)
    );

    return DEFAULT_TIME_PERIODS.map((period, periodIdx) => {
      const daysRecord: Record<TimetableSlot['dayOfWeek'], CellData> = {} as any;

      DAYS_OF_WEEK.forEach((day, dayIdx) => {
        // Check if there is an existing slot
        const existing = existingSlots.find(
          (s) => s.dayOfWeek === day && s.startTime === period.startTime
        );

        if (existing) {
          daysRecord[day] = {
            enabled: true,
            subjectCode: existing.subjectCode,
            subjectName: existing.subjectName,
            teacherName: existing.teacherName,
            classroom: existing.classroom,
          };
        } else if (deptSubjects.length > 0) {
          const subject = deptSubjects[(dayIdx + periodIdx) % deptSubjects.length];
          daysRecord[day] = {
            enabled: true,
            subjectCode: subject.code,
            subjectName: subject.name,
            teacherName: availableFaculties[periodIdx % (availableFaculties.length || 1)]?.name || 'Department Faculty',
            classroom: 'Room B-203',
          };
        } else {
          daysRecord[day] = {
            enabled: true,
            subjectCode: `${deptId.replace('dept_', '').toUpperCase().slice(0, 4)}S${sem}-10${periodIdx + 1}`,
            subjectName: `Subject ${periodIdx + 1}`,
            teacherName: 'Faculty In-Charge',
            classroom: 'Room B-203',
          };
        }
      });

      return {
        id: `period_row_${periodIdx}`,
        label: period.label,
        startTime: period.startTime,
        endTime: period.endTime,
        days: daysRecord,
      };
    });
  };

  const [periodRows, setPeriodRows] = useState<PeriodRow[]>(() =>
    createInitialGrid(initialDepartmentId, initialSemester)
  );

  // Rebuild grid when department or semester changes
  useEffect(() => {
    setPeriodRows(createInitialGrid(selectedDeptId, selectedSemester));
    setConflictErrors([]);
  }, [selectedDeptId, selectedSemester]);

  // Update a single cell
  const handleCellChange = (
    rowId: string,
    day: TimetableSlot['dayOfWeek'],
    updates: Partial<CellData>
  ) => {
    setPeriodRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          days: {
            ...row.days,
            [day]: {
              ...row.days[day],
              ...updates,
            },
          },
        };
      })
    );
  };

  // Update time for a period row
  const handlePeriodTimeChange = (rowId: string, startTime: string, endTime: string) => {
    setPeriodRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, startTime, endTime } : row))
    );
  };

  // Add custom period row
  const handleAddPeriodRow = () => {
    const newIdx = periodRows.length + 1;
    const newRowId = `period_row_${Date.now()}`;
    const defaultSubject = availableSubjects[0] || {
      code: `${currentDept.code}-S${selectedSemester}-10${newIdx}`,
      name: `Core Subject ${newIdx}`,
    };

    const daysRecord: Record<TimetableSlot['dayOfWeek'], CellData> = {} as any;
    DAYS_OF_WEEK.forEach((day) => {
      daysRecord[day] = {
        enabled: true,
        subjectCode: defaultSubject.code,
        subjectName: defaultSubject.name,
        teacherName: availableFaculties[0]?.name || 'Department Faculty',
        classroom: 'Room B-203',
      };
    });

    setPeriodRows((prev) => [
      ...prev,
      {
        id: newRowId,
        label: `Period ${newIdx}`,
        startTime: '05:00 PM',
        endTime: '06:00 PM',
        days: daysRecord,
      },
    ]);
  };

  // Remove period row
  const handleRemovePeriodRow = (rowId: string) => {
    if (periodRows.length <= 1) {
      alert('You must have at least one period row in the weekly schedule.');
      return;
    }
    setPeriodRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  // Copy Monday column to all days (Tuesday to Saturday)
  const handleCopyMondayToAllDays = () => {
    setPeriodRows((prev) =>
      prev.map((row) => {
        const mondayData = row.days['Monday'];
        const newDays: Record<TimetableSlot['dayOfWeek'], CellData> = { ...row.days };
        DAYS_OF_WEEK.forEach((d) => {
          if (d !== 'Monday') {
            newDays[d] = { ...mondayData };
          }
        });
        return { ...row, days: newDays };
      })
    );
    setToastMsg({
      type: 'success',
      text: "Copied Monday's schedule across all 6 days (Tue–Sat) successfully!",
    });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Copy a specific day to other days
  const handleCopyDayToAllDays = (sourceDay: TimetableSlot['dayOfWeek']) => {
    setPeriodRows((prev) =>
      prev.map((row) => {
        const srcData = row.days[sourceDay];
        const newDays: Record<TimetableSlot['dayOfWeek'], CellData> = { ...row.days };
        DAYS_OF_WEEK.forEach((d) => {
          if (d !== sourceDay) {
            newDays[d] = { ...srcData };
          }
        });
        return { ...row, days: newDays };
      })
    );
    setToastMsg({
      type: 'success',
      text: `Copied ${sourceDay}'s schedule across the entire week successfully!`,
    });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Auto-distribute curriculum subjects across week
  const handleAutoDistributeSubjects = () => {
    if (availableSubjects.length === 0) {
      alert('No registered subjects found for this semester. Creating generic structure.');
    }
    const subjectsPool = availableSubjects.length > 0 ? availableSubjects : [
      { code: `${currentDept.code}-S${selectedSemester}-101`, name: 'Core Foundations' },
      { code: `${currentDept.code}-S${selectedSemester}-102`, name: 'Practical Systems Lab' },
      { code: `${currentDept.code}-S${selectedSemester}-103`, name: 'Technical Analysis' },
      { code: `${currentDept.code}-S${selectedSemester}-104`, name: 'Applied Methods' },
    ];

    setPeriodRows((prev) =>
      prev.map((row, rIdx) => {
        const newDays: Record<TimetableSlot['dayOfWeek'], CellData> = { ...row.days };
        DAYS_OF_WEEK.forEach((day, dIdx) => {
          const sub = subjectsPool[(dIdx * 2 + rIdx) % subjectsPool.length];
          const fac = availableFaculties[(rIdx + dIdx) % (availableFaculties.length || 1)]?.name || 'Department Faculty';
          newDays[day] = {
            enabled: true,
            subjectCode: sub.code,
            subjectName: sub.name,
            teacherName: fac,
            classroom: rIdx >= 3 ? 'Computer Lab 1' : 'Room B-203',
          };
        });
        return { ...row, days: newDays };
      })
    );
    setToastMsg({
      type: 'success',
      text: `Auto-distributed curriculum subjects across Monday to Saturday for Semester ${selectedSemester}!`,
    });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load a full day schedule template (8 periods from 7:30 AM to 5:00 PM)
  const handleApplyTemplate = (templateKey: keyof typeof FULL_DAY_PERIOD_TEMPLATES) => {
    const template = FULL_DAY_PERIOD_TEMPLATES[templateKey];
    if (!template) return;

    const subjectsPool = availableSubjects.length > 0 ? availableSubjects : [
      { code: `${currentDept.code}-S${selectedSemester}-101`, name: 'Core Foundations' },
      { code: `${currentDept.code}-S${selectedSemester}-102`, name: 'Practical Systems Lab' },
      { code: `${currentDept.code}-S${selectedSemester}-103`, name: 'Technical Analysis' },
      { code: `${currentDept.code}-S${selectedSemester}-104`, name: 'Applied Methods' },
    ];

    const newRows: PeriodRow[] = template.periods.map((p, pIdx) => {
      const daysRecord: Record<TimetableSlot['dayOfWeek'], CellData> = {} as any;
      DAYS_OF_WEEK.forEach((day, dIdx) => {
        const sub = subjectsPool[(dIdx * 2 + pIdx) % subjectsPool.length];
        const fac = availableFaculties[(pIdx + dIdx) % (availableFaculties.length || 1)]?.name || 'Department Faculty';
        daysRecord[day] = {
          enabled: true,
          subjectCode: sub.code,
          subjectName: sub.name,
          teacherName: fac,
          classroom: pIdx >= 4 ? 'Computer Lab 1' : 'Room B-203',
        };
      });
      return {
        id: `period_${templateKey}_${pIdx}_${Date.now()}`,
        label: p.label,
        startTime: p.startTime,
        endTime: p.endTime,
        days: daysRecord,
      };
    });

    setPeriodRows(newRows);
    setToastMsg({
      type: 'success',
      text: `Applied "${template.name}" with ${template.periods.length} daily time slots (7:30 AM to 5:00 PM)!`,
    });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Bulk Apply Classroom to all enabled slots
  const handleApplyBulkClassroom = () => {
    if (!bulkClassroom.trim()) return;
    setPeriodRows((prev) =>
      prev.map((row) => {
        const newDays: Record<TimetableSlot['dayOfWeek'], CellData> = { ...row.days };
        DAYS_OF_WEEK.forEach((day) => {
          newDays[day] = { ...newDays[day], classroom: bulkClassroom.trim() };
        });
        return { ...row, days: newDays };
      })
    );
    setToastMsg({
      type: 'success',
      text: `Applied classroom '${bulkClassroom}' to all slots in the weekly timetable.`,
    });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Bulk Apply Faculty to all slots
  const handleApplyBulkFaculty = () => {
    if (!bulkFaculty.trim()) return;
    setPeriodRows((prev) =>
      prev.map((row) => {
        const newDays: Record<TimetableSlot['dayOfWeek'], CellData> = { ...row.days };
        DAYS_OF_WEEK.forEach((day) => {
          newDays[day] = { ...newDays[day], teacherName: bulkFaculty.trim() };
        });
        return { ...row, days: newDays };
      })
    );
    setToastMsg({
      type: 'success',
      text: `Assigned faculty '${bulkFaculty}' to all slots in the weekly timetable.`,
    });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Enable/Disable All Slots
  const handleToggleAllSlots = (enable: boolean) => {
    setPeriodRows((prev) =>
      prev.map((row) => {
        const newDays: Record<TimetableSlot['dayOfWeek'], CellData> = { ...row.days };
        DAYS_OF_WEEK.forEach((day) => {
          newDays[day] = { ...newDays[day], enabled: enable };
        });
        return { ...row, days: newDays };
      })
    );
  };

  // Calculate total active slots
  const totalEnabledSlots = useMemo(() => {
    let count = 0;
    periodRows.forEach((row) => {
      DAYS_OF_WEEK.forEach((day) => {
        if (row.days[day]?.enabled && row.days[day]?.subjectCode?.trim()) {
          count++;
        }
      });
    });
    return count;
  }, [periodRows]);

  // Save the entire week's timetable at once
  const handleSaveEntireWeek = () => {
    const slotsToSave: TimetableSlot[] = [];
    const existingOtherSlots = getStoredTimetables().filter(
      (s) => !(s.departmentId === selectedDeptId && Number(s.semester) === Number(selectedSemester))
    );

    const timestamp = Date.now();
    let slotIndex = 0;

    periodRows.forEach((row) => {
      DAYS_OF_WEEK.forEach((day) => {
        const cell = row.days[day];
        if (cell && cell.enabled && cell.subjectCode?.trim()) {
          slotsToSave.push({
            id: `slot_${selectedDeptId}_sem${selectedSemester}_${day.toLowerCase()}_${slotIndex++}_${timestamp}`,
            dayOfWeek: day,
            startTime: row.startTime.trim(),
            endTime: row.endTime.trim(),
            subjectId: `sub_${cell.subjectCode.toLowerCase().replace(/\s+/g, '_')}`,
            subjectName: cell.subjectName.trim() || 'Academic Subject',
            subjectCode: cell.subjectCode.trim().toUpperCase(),
            departmentId: selectedDeptId,
            semester: Number(selectedSemester),
            teacherId: `usr_fac_${slotIndex}`,
            teacherName: cell.teacherName.trim() || 'Department Faculty',
            classroom: cell.classroom.trim() || 'Room B-203',
          });
        }
      });
    });

    if (slotsToSave.length === 0) {
      alert('Please enable at least one timetable slot with a subject before saving.');
      return;
    }

    if (saveMode === 'replace') {
      replaceSemesterStoredTimetables(selectedDeptId, selectedSemester, slotsToSave);
    } else {
      addStoredTimetableSlots(slotsToSave);
    }

    const successMessage = `Successfully saved entire weekly timetable (${slotsToSave.length} lecture slots across Monday–Saturday) for ${currentDept.name} (Semester ${selectedSemester})!`;

    if (onSuccess) {
      onSuccess(successMessage);
    }

    if (onAuditLog) {
      onAuditLog(
        'BATCH_SAVE_WEEKLY_TIMETABLE',
        `Saved entire weekly timetable with ${slotsToSave.length} slots for ${currentDept.name} (Semester ${selectedSemester})`
      );
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      id="admin-full-week-timetable-modal"
    >
      <div className="bg-slate-900 border border-purple-500/50 rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/80 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Full Week Timetable Creator
                </span>
                <span className="text-[11px] text-slate-400 font-mono">All 6 Days at Once</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Add Entire Week's Timetable (Monday to Saturday)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveEntireWeek}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all border border-purple-400/30"
              id="btn-save-entire-week-header"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Entire Week ({totalEnabledSlots} Slots)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div
            className={`mx-4 mt-3 p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="p-0.5 hover:bg-white/10 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Selection Bar: Department & Semester Selection */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Department Select */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Department:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = dept.id === selectedDeptId;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setSelectedDeptId(dept.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {dept.code} ({dept.name})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Semester Select */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Semester:
              </label>
              <div className="flex gap-1">
                {allSemesters.map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      sem === selectedSemester
                        ? 'bg-purple-500 text-white shadow-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Tools Toolbar */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {/* Daily Schedule Preset Templates */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                Daily Periods Template:
              </span>
              <button
                type="button"
                onClick={() => handleApplyTemplate('standard')}
                className="px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/40 text-purple-200 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="8 Periods spanning 7:30 AM to 5:00 PM with lunch break"
              >
                <span>⭐ Full Day: 8 Periods (7:30 AM – 5:00 PM)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('continuous')}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                title="Continuous 10-minute interval sequence from 7:30 AM to 5:00 PM"
              >
                <span>Continuous 10-Min Gap (7:30 AM – 5:00 PM)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('morningOnly')}
                className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
              >
                <span>Morning Shift (7:30 AM – 12:00 PM)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('afternoonOnly')}
                className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
              >
                <span>Afternoon Shift (1:00 PM – 5:00 PM)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoDistributeSubjects}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Automatically distribute department curriculum across the week"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                  <span>Auto-Distribute Curriculum</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMondayToAllDays}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Copy Monday's schedule to Tuesday, Wednesday, Thursday, Friday, and Saturday"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy Monday to Entire Week (Tue–Sat)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddPeriodRow}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Period Time</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleAllSlots(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Enable All
                </button>
              </div>

            {/* Quick Bulk Setting for Room / Teacher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                <MapPin className="w-3 h-3 text-purple-400" />
                <input
                  type="text"
                  value={bulkClassroom}
                  onChange={(e) => setBulkClassroom(e.target.value)}
                  placeholder="Bulk Room"
                  className="bg-transparent text-xs text-white w-24 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkClassroom}
                  className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold"
                >
                  Apply Room
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <select
                  value={bulkFaculty}
                  onChange={(e) => setBulkFaculty(e.target.value)}
                  className="bg-slate-900 text-xs text-slate-200 max-w-[130px] outline-none"
                >
                  <option value="">Select Faculty...</option>
                  {availableFaculties.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyBulkFaculty}
                  disabled={!bulkFaculty}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold"
                >
                  Apply Faculty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Weekly Timetable Table Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Day View Toggle on Mobile */}
          <div className="lg:hidden flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400">View Day:</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveTabDay('all')}
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  activeTabDay === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                All Days
              </button>
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveTabDay(d)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    activeTabDay === d ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl bg-slate-950/60">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-200">
                  <th className="p-3 text-xs font-black uppercase tracking-wider text-purple-300 w-36 border-r border-slate-800">
                    Period / Timing
                  </th>
                  {DAYS_OF_WEEK.filter((d) => activeTabDay === 'all' || d === activeTabDay).map(
                    (day) => (
                      <th
                        key={day}
                        className="p-3 text-xs font-black uppercase tracking-wider text-slate-200 border-r border-slate-800 last:border-r-0 text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{day}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyDayToAllDays(day)}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-purple-300"
                            title={`Clone ${day} to all other days of the week`}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                    )
                  )}
                  <th className="p-3 text-xs font-black uppercase tracking-wider text-slate-400 w-14 text-center">
                    Row
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">
                {periodRows.map((row, rowIdx) => (
                  <tr key={row.id} className="hover:bg-slate-900/30 transition-colors">
                    {/* Period Timing Column */}
                    <td className="p-3 bg-slate-900/90 font-mono text-xs border-r border-slate-800 align-top">
                      <div className="space-y-1.5">
                        <div className="font-sans text-[11px] font-black text-purple-300">
                          {row.label}
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <input
                            type="text"
                            value={row.startTime}
                            onChange={(e) => handlePeriodTimeChange(row.id, e.target.value, row.endTime)}
                            className="w-20 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold font-mono text-[11px] outline-none"
                            placeholder="09:00 AM"
                          />
                          <span className="text-slate-500">–</span>
                          <input
                            type="text"
                            value={row.endTime}
                            onChange={(e) => handlePeriodTimeChange(row.id, row.startTime, e.target.value)}
                            className="w-20 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold font-mono text-[11px] outline-none"
                            placeholder="10:00 AM"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {DAYS_OF_WEEK.filter((d) => activeTabDay === 'all' || d === activeTabDay).map(
                      (day) => {
                        const cell = row.days[day];
                        const badgeStyle = getSubjectBadgeStyle(cell.subjectCode);

                        return (
                          <td
                            key={day}
                            className="p-2 border-r border-slate-800/80 last:border-r-0 align-top"
                          >
                            <div
                              className={`p-2.5 rounded-xl border transition-all space-y-2 ${
                                cell.enabled
                                  ? 'bg-slate-900/90 border-slate-700/80'
                                  : 'bg-slate-950/40 border-slate-800/40 opacity-40'
                              }`}
                            >
                              {/* Cell Enable Toggle & Quick Pick */}
                              <div className="flex items-center justify-between gap-1">
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={cell.enabled}
                                    onChange={(e) =>
                                      handleCellChange(row.id, day, { enabled: e.target.checked })
                                    }
                                    className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                  />
                                  <span>{cell.enabled ? 'Lecture' : 'Off / Free'}</span>
                                </label>

                                {cell.enabled && availableSubjects.length > 0 && (
                                  <select
                                    value={cell.subjectCode}
                                    onChange={(e) => {
                                      const matched = availableSubjects.find(
                                        (s) => s.code === e.target.value
                                      );
                                      if (matched) {
                                        handleCellChange(row.id, day, {
                                          subjectCode: matched.code,
                                          subjectName: matched.name,
                                        });
                                      }
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-[10px] font-mono text-purple-200 outline-none max-w-[110px]"
                                  >
                                    <option value="">Quick Subject...</option>
                                    {availableSubjects.map((s) => (
                                      <option key={s.id} value={s.code}>
                                        {s.code} ({s.name})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>

                              {cell.enabled && (
                                <div className="space-y-1.5 pt-1">
                                  {/* Subject Code & Name Input */}
                                  <div>
                                    <input
                                      type="text"
                                      value={cell.subjectCode}
                                      onChange={(e) =>
                                        handleCellChange(row.id, day, {
                                          subjectCode: e.target.value,
                                        })
                                      }
                                      placeholder="Sub Code"
                                      className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono font-black text-emerald-400 outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={cell.subjectName}
                                      onChange={(e) =>
                                        handleCellChange(row.id, day, {
                                          subjectName: e.target.value,
                                        })
                                      }
                                      placeholder="Subject Title"
                                      className="w-full px-2 py-1 mt-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-white outline-none"
                                    />
                                  </div>

                                  {/* Faculty Input / Dropdown */}
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={cell.teacherName}
                                      onChange={(e) =>
                                        handleCellChange(row.id, day, {
                                          teacherName: e.target.value,
                                        })
                                      }
                                      placeholder="Faculty Name"
                                      className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-200 outline-none"
                                    />
                                  </div>

                                  {/* Classroom Input */}
                                  <div>
                                    <input
                                      type="text"
                                      value={cell.classroom}
                                      onChange={(e) =>
                                        handleCellChange(row.id, day, {
                                          classroom: e.target.value,
                                        })
                                      }
                                      placeholder="Classroom"
                                      className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono text-purple-300 outline-none"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      }
                    )}

                    {/* Row Delete Button */}
                    <td className="p-2 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleRemovePeriodRow(row.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Remove period row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Submit Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Save Action:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === 'replace'}
                  onChange={() => setSaveMode('replace')}
                  className="text-purple-600"
                />
                <span>Replace Semester {selectedSemester} Schedule</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold ml-2">
                <input
                  type="radio"
                  name="saveMode"
                  checked={saveMode === 'merge'}
                  onChange={() => setSaveMode('merge')}
                  className="text-purple-600"
                />
                <span>Append / Merge with existing</span>
              </label>
            </div>

            <span>
              Configured Slots: <strong className="text-emerald-400">{totalEnabledSlots}</strong> across Monday–Saturday
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveEntireWeek}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer transition-all flex items-center gap-1.5 border border-purple-400/30"
              id="btn-confirm-save-entire-week"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Entire Week's Timetable at Once</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
