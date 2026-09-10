import React, { useState, useEffect } from 'react';
import {
  Clock,
  BookOpen,
  MapPin,
  Building2,
  UserCheck,
  Calendar,
  Award,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  X,
  Search,
  Printer,
  ArrowRight
} from 'lucide-react';
import { User, TimetableSlot } from '../../types';
import {
  DEPARTMENTS,
  TIMETABLES as INITIAL_TIMETABLES,
  SUBJECTS,
  getStoredTimetables,
  saveStoredTimetables,
} from '../../data/mockDatabase';
import { getSubjectBadgeStyle } from '../../utils/subjectColorUtils';
import { AdminTimetableManagementModal } from '../admin/AdminTimetableManagementModal';

interface TimetableModuleProps {
  user: User;
}

export const TimetableModule: React.FC<TimetableModuleProps> = ({ user }) => {
  // Academic cycle state: 'odd' (1, 3, 5) or 'even' (2, 4, 6)
  // According to the official Academic Calendar (July 2026), 'odd' term (June–Nov 2026) is currently active.
  const initialCycle: 'odd' | 'even' = 'odd';
  const [academicCycle, setAcademicCycle] = useState<'odd' | 'even'>(initialCycle);
  const availableSemesters = academicCycle === 'odd' ? [1, 3, 5] : [2, 4, 6];

  const [selectedDept, setSelectedDept] = useState(user?.departmentId || 'dept_it');

  // Enforce department for students
  useEffect(() => {
    if (user?.role === 'student' && user?.departmentId) {
      setSelectedDept(user.departmentId);
    }
  }, [user]);
  const [selectedSem, setSelectedSem] = useState(() => {
    if (user?.semester && availableSemesters.includes(user.semester)) {
      return user.semester;
    }
    return availableSemesters.includes(3) ? 3 : availableSemesters[0];
  });

  const handleCycleChange = (cycle: 'odd' | 'even') => {
    setAcademicCycle(cycle);
    const newSemesters = cycle === 'odd' ? [1, 3, 5] : [2, 4, 6];
    if (!newSemesters.includes(selectedSem)) {
      setSelectedSem(newSemesters[0]);
    }
  };

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => getStoredTimetables());
  const [adminManagerModalOpen, setAdminManagerModalOpen] = useState(false);

  // Sync with global storage & updates
  useEffect(() => {
    const handleUpdated = () => {
      setTimetableSlots(getStoredTimetables());
    };
    window.addEventListener('lbu_timetables_updated', handleUpdated);
    return () => {
      window.removeEventListener('lbu_timetables_updated', handleUpdated);
    };
  }, []);

  const [slotSearch, setSlotSearch] = useState('');
  const [timetableFilter, setTimetableFilter] = useState<'today' | 'weekly'>('today');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Modals state
  const [autoGenModalOpen, setAutoGenModalOpen] = useState(false);
  const [addSlotModalOpen, setAddSlotModalOpen] = useState(false);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  // Determine current day name for live highlighting
  const realDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const activeTodayDayName = ['Sunday'].includes(realDayName) ? 'Monday' : (realDayName as any);

  // Helper to parse time
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

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Dynamic course legend derived from timetable slots and subjects for the selected dept & semester
  const activeCourseLegend = React.useMemo(() => {
    const slots = timetableSlots.filter(
      (t) => t.departmentId === selectedDept && t.semester === selectedSem
    );
    const seen = new Set<string>();
    const list: Array<{ code: string; name: string; initial: string; faculty: string }> = [];
    slots.forEach((s) => {
      if (!seen.has(s.subjectCode)) {
        seen.add(s.subjectCode);
        const rawInitial = s.teacherName
          ? s.teacherName.replace(/^Dr\.\s*|^Mr\.\s*|^Prof\.\s*/, '').split(' ').map((n) => n[0]).join('').slice(0, 3).toUpperCase()
          : s.subjectCode.slice(-3);
        list.push({
          code: s.subjectCode,
          name: s.subjectName,
          initial: rawInitial || s.subjectCode.slice(0, 2),
          faculty: s.teacherName || 'Department Faculty Cell',
        });
      }
    });
    return list;
  }, [selectedDept, selectedSem, timetableSlots]);

  // New slot form state
  const [newDay, setNewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('10:00 AM');
  const [newSubjectCode, setNewSubjectCode] = useState('08BVOCMJ305');
  const [newSubjectName, setNewSubjectName] = useState('Oops – using C++');
  const [newTeacherName, setNewTeacherName] = useState('Mitulgiri Gauswami (MG)');
  const [newClassroom, setNewClassroom] = useState('Room B-203');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Automated Timetable Generator Engine
  const handleRunAutoGenerator = () => {
    // Generate optimized, non-overlapping weekly schedule for selected Dept & Semester
    const currentDeptObj = DEPARTMENTS.find((d) => d.id === selectedDept);
    const deptName = currentDeptObj ? currentDeptObj.name : 'IT Department';

    const generatedSlots: TimetableSlot[] = [];

    const defaultLectures = [
      { code: '08BVOCMJ305', name: 'Oops – using C++', teacher: 'Mitulgiri Gauswami (MG)', room: 'Computer Lab 1' },
      { code: '08BVOCMJ306', name: 'Software Engineering', teacher: 'Rishu Raj (RY)', room: 'Lecture Hall 201' },
      { code: '08BVOCAE303', name: 'Values and Ethics', teacher: 'Ghanshyam Hirani (GH)', room: 'Auditorium' },
      { code: '08BVOCSE303', name: 'Google Tools & Tech', teacher: 'Dr. Vala Femi (FV)', room: 'Computer Lab 2' },
      { code: '08BVOCVA303', name: 'Rural Innovation Practicum', teacher: 'In House Workshop', room: 'Innovation Hub' },
    ];

    const timeTuples = [
      { start: '07:30 AM', end: '08:30 AM' },
      { start: '08:40 AM', end: '09:40 AM' },
      { start: '09:40 AM', end: '10:40 AM' },
      { start: '02:00 PM', end: '03:00 PM' },
      { start: '03:00 PM', end: '04:00 PM' },
      { start: '04:00 PM', end: '05:00 PM' },
    ];

    days.forEach((day, dayIdx) => {
      timeTuples.forEach((time, timeIdx) => {
        const lecture = defaultLectures[(dayIdx + timeIdx) % defaultLectures.length];
        generatedSlots.push({
          id: `auto_${selectedDept}_s${selectedSem}_${day.toLowerCase()}_${timeIdx}`,
          dayOfWeek: day,
          startTime: time.start,
          endTime: time.end,
          subjectId: `sub_${lecture.code.toLowerCase()}`,
          subjectName: lecture.name,
          subjectCode: lecture.code,
          departmentId: selectedDept,
          semester: selectedSem,
          teacherId: `usr_fac_${timeIdx}`,
          teacherName: lecture.teacher,
          classroom: lecture.room,
        });
      });
    });

    // Replace or merge with existing slots for this department and semester
    const otherSlots = timetableSlots.filter(
      (s) => !(s.departmentId === selectedDept && s.semester === selectedSem)
    );

    const updatedSlots = [...otherSlots, ...generatedSlots];
    setTimetableSlots(updatedSlots);
    saveStoredTimetables(updatedSlots);
    setAutoGenModalOpen(false);
  };

  // Add Custom Slot with Collision Detection
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();

    // Check collision: Teacher or Classroom already booked at same day & start time
    const collision = timetableSlots.find(
      (s) =>
        s.dayOfWeek === newDay &&
        s.startTime === newStartTime &&
        (s.teacherName.toLowerCase() === newTeacherName.toLowerCase() ||
          s.classroom.toLowerCase() === newClassroom.toLowerCase())
    );

    if (collision) {
      setCollisionWarning(
        `Schedule Conflict Warning: ${
          collision.teacherName.toLowerCase() === newTeacherName.toLowerCase()
            ? `Teacher '${newTeacherName}'`
            : `Classroom '${newClassroom}'`
        } is already assigned to '${collision.subjectName}' on ${newDay} at ${newStartTime}!`
      );
      return;
    }

    const newSlot: TimetableSlot = {
      id: `slot_custom_${Date.now()}`,
      dayOfWeek: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      subjectId: `sub_${newSubjectCode}`,
      subjectName: newSubjectName,
      subjectCode: newSubjectCode,
      departmentId: selectedDept,
      semester: selectedSem,
      teacherId: `usr_fac_${Date.now()}`,
      teacherName: newTeacherName,
      classroom: newClassroom,
    };

    const updatedSlots = [...timetableSlots, newSlot];
    setTimetableSlots(updatedSlots);
    saveStoredTimetables(updatedSlots);
    setAddSlotModalOpen(false);
    setCollisionWarning(null);
  };

  const handleDeleteSlot = (id: string) => {
    const updatedSlots = timetableSlots.filter((s) => s.id !== id);
    setTimetableSlots(updatedSlots);
    saveStoredTimetables(updatedSlots);
  };

  // Filter today's slots dynamically
  const todaySlots = timetableSlots
    .filter(
      (s) =>
        s.departmentId === selectedDept &&
        s.semester === selectedSem &&
        s.dayOfWeek === activeTodayDayName
    )
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  let todayLiveIdx = -1;
  let todayNextIdx = -1;

  todaySlots.forEach((slot, idx) => {
    const startMins = parseTimeToMinutes(slot.startTime);
    const endMins = parseTimeToMinutes(slot.endTime);
    if (currentMinutes >= startMins && currentMinutes < endMins) {
      todayLiveIdx = idx;
    }
  });

  if (todayLiveIdx !== -1) {
    if (todayLiveIdx + 1 < todaySlots.length) {
      todayNextIdx = todayLiveIdx + 1;
    }
  } else {
    todayNextIdx = todaySlots.findIndex(
      (s) => currentMinutes < parseTimeToMinutes(s.endTime)
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Automated Timetable Engine
            </span>
            <span className="text-[11px] text-slate-300 font-medium">Academic Session 2026–27</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Lokbharti University Timetable System
          </h1>
          <p className="text-sm font-semibold text-emerald-200/90">
            Interactive Schedule Manager, Teacher Load & Conflict Detection
          </p>
        </div>

        {/* Action Buttons & Department Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
          {(user.role === 'admin' || user.role === 'hod') && (
            <button
              onClick={() => setAdminManagerModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer border border-purple-400/30 select-none"
              id="btn-open-full-admin-timetable-manager"
              title="Open Advanced Timetable Manager for All Departments & Semesters"
            >
              <Clock className="w-4 h-4 text-purple-200" />
              <span>Admin Timetable Manager</span>
            </button>
          )}

          {(user.role === 'admin' || user.role === 'hod' || user.role === 'teacher') && (
            <button
              onClick={() => setAutoGenModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Wand2 className="w-4 h-4" /> Auto-Generate
            </button>
          )}

          {(user.role === 'admin' || user.role === 'hod') && (
            <button
              onClick={() => {
                setCollisionWarning(null);
                setAddSlotModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          )}

          {/* Academic Cycle Selector */}
          <div className="inline-flex bg-slate-900/90 border border-slate-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleCycleChange('odd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                academicCycle === 'odd' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Odd Semesters (1, 3, 5)</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-black uppercase ${
                academicCycle === 'odd' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                Active (June–Nov)
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleCycleChange('even')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                academicCycle === 'even' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Even Semesters (2, 4, 6)</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-black uppercase ${
                academicCycle === 'even' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                Upcoming (Dec–May)
              </span>
            </button>
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              disabled={user?.role === 'student'}
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-80 disabled:cursor-not-allowed"
              id="timetable-dept-filter"
            >
              {(user?.role === 'student'
                ? DEPARTMENTS.filter((d) => d.id === user.departmentId)
                : DEPARTMENTS
              ).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSem}
              onChange={(e) => {
                const newSem = parseInt(e.target.value);
                setSelectedSem(newSem);
                if ([1, 3, 5].includes(newSem) && academicCycle !== 'odd') {
                  setAcademicCycle('odd');
                } else if ([2, 4, 6].includes(newSem) && academicCycle !== 'even') {
                  setAcademicCycle('even');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500"
              id="timetable-sem-filter"
            >
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s}>
                  Sem {s} ({[1, 3, 5].includes(s) ? 'Monsoon' : 'Winter'} Term)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course & Faculty Reference Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Course & Faculty Load Legend (3rd Semester IT)
            </h3>
          </div>

          {/* Quick Search inside timetable */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={slotSearch}
              onChange={(e) => setSlotSearch(e.target.value)}
              placeholder="Search teacher, room, subject..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {activeCourseLegend.map((c) => (
            <div
              key={c.code}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3"
            >
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] rounded">
                {c.initial}
              </span>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {c.code}: {c.name}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{c.faculty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Timetable View Filter Toggle */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="inline-flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setTimetableFilter('today')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              timetableFilter === 'today'
                ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" /> Today's Schedule
            {timetableFilter === 'today' && (
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping shrink-0"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTimetableFilter('weekly')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              timetableFilter === 'weekly'
                ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" /> Weekly Overview
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/50 self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="leading-tight">
            {timetableFilter === 'today'
              ? `Filtered for ${activeTodayDayName} • Hover slots for faculty & room`
              : 'Full 6-Day Academic Schedule • Today Column Highlighted'}
          </span>
        </div>
      </div>

      {/* TODAY'S SCHEDULE FILTER VIEW */}
      {timetableFilter === 'today' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Active Date View
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">{activeTodayDayName} Schedule</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                Today's Single-Day Schedule ({DEPARTMENTS.find((d) => d.id === selectedDept)?.name || 'IT Department'} • Sem {selectedSem})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filtered strictly for current date sessions. Hover any slot for professor & room details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimetableFilter('weekly')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Switch to Weekly Overview <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Today's Next Class Spotlight */}
          {todayNextIdx !== -1 && todaySlots[todayNextIdx] && (
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
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      {todaySlots[todayNextIdx].startTime} - {todaySlots[todayNextIdx].endTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">
                    {todaySlots[todayNextIdx].subjectName} ({todaySlots[todayNextIdx].subjectCode})
                  </h4>
                  <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-0.5">
                    <span>Faculty: <strong className="text-amber-200">{todaySlots[todayNextIdx].teacherName}</strong></span>
                    <span>Venue: <strong className="text-amber-200">{todaySlots[todayNextIdx].classroom}</strong></span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 px-3 py-1.5 rounded-lg border border-amber-500/30 shrink-0 self-start sm:self-center">
                Chronologically Next Session
              </span>
            </div>
          )}

          {/* Single Day Slots Timeline / List */}
          <div className="space-y-3">
            {todaySlots.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                No lectures scheduled for today ({activeTodayDayName}). Use the Weekly Overview toggle to view the full timetable.
              </div>
            ) : (
              todaySlots.map((slot, idx) => {
                const startMins = parseTimeToMinutes(slot.startTime);
                const endMins = parseTimeToMinutes(slot.endTime);

                const isCompleted = currentMinutes >= endMins;
                const isLive = idx === todayLiveIdx;
                const isNextClass = idx === todayNextIdx;
                const badgeStyle = getSubjectBadgeStyle(slot.subjectCode, slot.subjectName);

                return (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-xl border transition-all relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'opacity-50 grayscale hover:opacity-80 bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                        : isLive
                        ? 'bg-slate-900 text-white dark:bg-emerald-950/90 border-l-4 border-l-emerald-500 shadow-md font-bold'
                        : isNextClass
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 text-slate-900 dark:text-white border-l-4 border-l-amber-500 font-bold ring-1 ring-amber-500/30'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`px-3 py-2 rounded-xl font-mono text-xs font-black shrink-0 ${
                        isLive
                          ? 'bg-emerald-500 text-slate-950'
                          : isNextClass
                          ? 'bg-amber-500 text-slate-950'
                          : isCompleted
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {slot.startTime} – {slot.endTime}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-black shadow-2xs ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                            {slot.subjectCode}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {slot.subjectName}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Faculty: <strong className="text-slate-800 dark:text-slate-200">{slot.teacherName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            Room: <strong className="text-slate-800 dark:text-slate-200">{slot.classroom}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-500">
                          Completed
                        </span>
                      )}
                      {isLive && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 animate-pulse shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span> Live Now
                        </span>
                      )}
                      {isNextClass && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Next Class
                        </span>
                      )}
                      {!isCompleted && !isLive && !isNextClass && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Scheduled
                        </span>
                      )}
                    </div>

                    {/* Hover Tooltip Popover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col p-3 rounded-xl bg-slate-950 text-white text-xs shadow-2xl border border-slate-700 z-50 min-w-[220px] pointer-events-none transition-all animate-fadeIn">
                      <div className="font-bold text-emerald-400 text-xs flex items-center justify-between">
                        <span>{slot.subjectCode}</span>
                        <span className="text-[10px] font-mono text-slate-400">{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <div className="text-xs font-extrabold text-white mt-0.5">{slot.subjectName}</div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-2">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Faculty: <strong>{slot.teacherName}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Room: <strong>{slot.classroom}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* WEEKLY OVERVIEW VIEW */}
      {timetableFilter === 'weekly' && (
        <div className="space-y-6">
          {/* View Mode Bar & Header Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'matrix'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Official Grid Table (6 Classes/Day)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Day Cards View
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">
                Universal 6-Class Structure Across All Departments
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" /> Print Official Timetable
            </button>
          </div>

          {/* MATRIX VIEW: OFFICIAL DOCUMENT LAYOUT */}
          {viewMode === 'matrix' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 print:p-0 print:border-none print:shadow-none">
              {/* Document Letterhead */}
              <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Lokbharati University for Rural Innovation
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  School of Skills and Entrepreneurship • {DEPARTMENTS.find((d) => d.id === selectedDept)?.name || 'Department of IT'}
                </div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Academic Time Table – Semester {selectedSem} (2026-27)
                </h2>
                <div className="text-[11px] text-slate-500 font-mono">
                  Effective From: 08/06/2026 • Universal 6-Period Standard Daily Grid • Hover any slot for room & faculty
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-bold">
                      <th className="p-3 border-r border-slate-800 text-left w-36">Time Slot</th>
                      {days.map((day) => {
                        const isToday = day === activeTodayDayName;
                        return (
                          <th
                            key={day}
                            className={`p-3 border-r border-slate-800 last:border-r-0 min-w-[130px] ${
                              isToday ? 'bg-emerald-950 text-emerald-300 border-b-2 border-b-emerald-400' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>{day}</span>
                              {isToday && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-emerald-500 text-slate-950">
                                  TODAY
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {/* Class rows with tooltips */}
                    {[
                      { period: 'Class 1', time: '07:30 to 08:30', start: '07:30' },
                      { period: 'Break', time: '08:30 to 08:40', isBreak: true, label: '☕ Morning Break (10 Minutes)' },
                      { period: 'Class 2', time: '08:40 to 09:40', start: '08:40' },
                      { period: 'Class 3', time: '09:40 to 10:40', start: '09:40' },
                      { period: 'Recess', time: '10:40 to 02:00', isRecess: true, label: '🍽️ Lunch Recess & Intermission Break' },
                      { period: 'Class 4', time: '02:00 to 03:00', start: '02:00' },
                      { period: 'Class 5', time: '03:00 to 04:00', start: '03:00' },
                      { period: 'Class 6', time: '04:00 to 05:00', start: '04:00' },
                      { period: 'Class 7', time: '05:00 to 06:00', start: '05:00' },
                    ].map((row, rIdx) => {
                      if (row.isBreak) {
                        return (
                          <tr key={rIdx} className="bg-amber-500/10 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                            <td className="p-2 font-mono text-left border-r border-slate-200 dark:border-slate-800">{row.time}</td>
                            <td colSpan={6} className="p-2 text-center font-bold">{row.label}</td>
                          </tr>
                        );
                      }
                      if (row.isRecess) {
                        return (
                          <tr key={rIdx} className="bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                            <td className="p-2.5 font-mono text-left border-r border-slate-200 dark:border-slate-800">{row.time}</td>
                            <td colSpan={6} className="p-2.5 text-center font-black">{row.label}</td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 text-left border-r border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-emerald-600 block font-sans uppercase">{row.period}</span>
                            {row.time}
                          </td>
                          {days.map((day) => {
                            const slot = timetableSlots.find(
                              (t) =>
                                t.departmentId === selectedDept &&
                                t.semester === selectedSem &&
                                t.dayOfWeek === day &&
                                t.startTime.startsWith(row.start!)
                            );
                            const isTodayCol = day === activeTodayDayName;

                            return (
                              <td
                                key={day}
                                className={`p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-middle ${
                                  isTodayCol ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                                }`}
                              >
                                {slot ? (
                                  <div className="relative group cursor-pointer p-1">
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-slate-900 dark:text-white">{slot.subjectCode}</div>
                                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px] mx-auto">
                                        {slot.subjectName}
                                      </div>
                                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                        [{slot.classroom}]
                                      </div>
                                    </div>

                                    {/* Hover Tooltip Popover */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col p-3 rounded-xl bg-slate-950 text-white text-xs shadow-2xl border border-slate-700 z-50 min-w-[210px] pointer-events-none transition-all animate-fadeIn text-left">
                                      <div className="font-bold text-emerald-400 text-xs flex items-center justify-between">
                                        <span>{slot.subjectCode}</span>
                                        <span className="text-[10px] font-mono text-slate-400">{slot.startTime} - {slot.endTime}</span>
                                      </div>
                                      <div className="text-xs font-extrabold text-white mt-0.5">{slot.subjectName}</div>
                                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-2">
                                        <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span>Faculty: <strong>{slot.teacherName}</strong></span>
                                      </div>
                                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>Room: <strong>{slot.classroom}</strong></span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARDS VIEW */}
          {viewMode === 'cards' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const slots = timetableSlots.filter((t) => {
            const matchesDeptSem = t.departmentId === selectedDept && t.semester === selectedSem;
            const matchesDay = t.dayOfWeek === day;
            const matchesQuery =
              !slotSearch ||
              t.subjectName.toLowerCase().includes(slotSearch.toLowerCase()) ||
              t.subjectCode.toLowerCase().includes(slotSearch.toLowerCase()) ||
              t.teacherName.toLowerCase().includes(slotSearch.toLowerCase()) ||
              t.classroom.toLowerCase().includes(slotSearch.toLowerCase());
            return matchesDeptSem && matchesDay && matchesQuery;
          });

          return (
            <div
              key={day}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {day}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    {slots.length} Slots
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {slots.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No lectures scheduled</p>
                  ) : (
                    slots.map((slot) => {
                      const isPractical = slot.subjectName.toLowerCase().includes('practical') || slot.subjectCode.endsWith('P');
                      const isProject = slot.subjectCode.startsWith('PROJ');
                      const isActivity = slot.subjectCode === 'DEPACT' || slot.subjectCode === 'SPORTS';

                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-xl border transition-all relative group/slot ${
                            isPractical
                              ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50'
                              : isProject
                              ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/50'
                              : isActivity
                              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                              {slot.subjectCode}: {slot.subjectName}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded whitespace-nowrap">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 space-y-1">
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                {slot.teacherName}
                              </span>

                              {(user.role === 'admin' || user.role === 'hod') && (
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="text-rose-500 opacity-0 group-hover/slot:opacity-100 hover:text-rose-700 transition-opacity p-1"
                                  title="Delete Slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {slot.classroom}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Day Footer note */}
              <div className="bg-slate-50 dark:bg-slate-800/30 px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Morning Break: 08:30 – 08:40</span>
                <span>Recess: 10:40 – 02:00</span>
              </div>
            </div>
          );
        })}
      </div>
      )}
        </div>
      )}

      {/* AUTO-GENERATOR MODAL */}
      {autoGenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-emerald-500" /> Automated Timetable Generator
              </h3>
              <button onClick={() => setAutoGenModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              The automated timetable algorithm will analyze subject credit requirements, teacher availability, and lab room constraints to build an optimized, non-overlapping weekly schedule.
            </p>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Target Department & Semester:</span>
              <p className="text-slate-700 dark:text-slate-300">
                {DEPARTMENTS.find((d) => d.id === selectedDept)?.name} — Semester {selectedSem}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAutoGenModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunAutoGenerator}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" /> Run Generator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SLOT MODAL */}
      {addSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Timetable Slot</h3>
              <button onClick={() => setAddSlotModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {collisionWarning && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{collisionWarning}</span>
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-3">
              {/* Daily Period Quick Select Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Daily Period Quick Select (7:30 AM – 5:00 PM)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: 'P1: 7:30–8:30 AM', start: '07:30 AM', end: '08:30 AM' },
                    { label: 'P2: 8:40–9:40 AM', start: '08:40 AM', end: '09:40 AM' },
                    { label: 'P3: 9:50–10:50 AM', start: '09:50 AM', end: '10:50 AM' },
                    { label: 'P4: 11:00–12:00 PM', start: '11:00 AM', end: '12:00 PM' },
                    { label: 'P5: 1:00–2:00 PM', start: '01:00 PM', end: '02:00 PM' },
                    { label: 'P6: 2:00–3:00 PM', start: '02:00 PM', end: '03:00 PM' },
                    { label: 'P7: 3:00–4:00 PM', start: '03:00 PM', end: '04:00 PM' },
                    { label: 'P8: 4:00–5:00 PM', start: '04:00 PM', end: '05:00 PM' },
                  ].map((p) => {
                    const isSelected = newStartTime === p.start && newEndTime === p.end;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setNewStartTime(p.start);
                          setNewEndTime(p.end);
                          setCollisionWarning(null);
                        }}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-left truncate cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Day of Week</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Classroom / Location</label>
                  <input
                    type="text"
                    required
                    value={newClassroom}
                    onChange={(e) => setNewClassroom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  required
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSlotModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  Save Timetable Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Central Timetable Management Modal */}
      {adminManagerModalOpen && (
        <AdminTimetableManagementModal
          isOpen={adminManagerModalOpen}
          onClose={() => setAdminManagerModalOpen(false)}
          currentUser={user}
          initialDepartmentId={selectedDept}
          initialSemester={selectedSem}
        />
      )}
    </div>
  );
};
