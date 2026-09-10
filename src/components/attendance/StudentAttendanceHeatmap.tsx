import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Cell,
  Legend
} from 'recharts';
import { AttendanceRecord, User } from '../../types';

interface StudentAttendanceHeatmapProps {
  user: User;
  attendancePercentage: number;
  attendanceRecords?: AttendanceRecord[];
}

interface DayStatus {
  dayNum: number;
  dateStr: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  status: 'present' | 'absent' | 'leave' | 'holiday' | 'weekend' | 'future';
  lecturesTotal: number;
  lecturesAttended: number;
  notes?: string;
}

const MONTH_OPTIONS = [
  { id: '2026-08', label: 'August 2026 (Current)', daysInMonth: 31, startDayOfWeek: 6 }, // 1st Aug 2026 is Saturday
  { id: '2026-07', label: 'July 2026', daysInMonth: 31, startDayOfWeek: 3 }, // 1st July 2026 is Wednesday
  { id: '2026-06', label: 'June 2026', daysInMonth: 30, startDayOfWeek: 1 }, // 1st June 2026 is Monday
  { id: '2026-09', label: 'September 2026 (Projected)', daysInMonth: 30, startDayOfWeek: 2 }, // 1st Sept 2026 is Tuesday
];

const HISTORICAL_MONTHLY_DATA = [
  { month: 'Jun', fullName: 'June 2026', present: 22, absent: 2, leave: 1, total: 25, percentage: 88 },
  { month: 'Jul', fullName: 'July 2026', present: 23, absent: 3, leave: 0, total: 26, percentage: 88.5 },
  { month: 'Aug', fullName: 'August 2026', present: 16, absent: 2, leave: 1, total: 19, percentage: 84.2 },
  { month: 'Sep (Est)', fullName: 'September 2026', present: 22, absent: 2, leave: 1, total: 25, percentage: 88 },
  { month: 'Oct (Est)', fullName: 'October 2026', present: 20, absent: 3, leave: 1, total: 24, percentage: 83.3 },
];

export const StudentAttendanceHeatmap: React.FC<StudentAttendanceHeatmapProps> = ({
  user,
  attendancePercentage,
  attendanceRecords = [],
}) => {
  const [selectedMonthId, setSelectedMonthId] = useState('2026-08');
  const [activeTab, setActiveTab] = useState<'heatmap' | 'trend'>('heatmap');
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);

  const activeMonthConfig = MONTH_OPTIONS.find((m) => m.id === selectedMonthId) || MONTH_OPTIONS[0];

  // Generate calendar days for the selected month
  const calendarDays: DayStatus[] = [];
  const totalDays = activeMonthConfig.daysInMonth;

  for (let d = 1; d <= totalDays; d++) {
    const dayOfWeek = (activeMonthConfig.startDayOfWeek + (d - 1)) % 7;
    const isSunday = dayOfWeek === 0;
    const dateStr = `${selectedMonthId}-${String(d).padStart(2, '0')}`;

    let status: DayStatus['status'] = 'present';
    let totalLec = 6;
    let attendedLec = 6;
    let notes = 'All scheduled lectures attended';

    if (isSunday) {
      status = 'weekend';
      totalLec = 0;
      attendedLec = 0;
      notes = 'Sunday - Campus Holiday';
    } else if (selectedMonthId === '2026-08' && d === 15) {
      status = 'holiday';
      totalLec = 0;
      attendedLec = 0;
      notes = 'Independence Day (National Holiday)';
    } else if (selectedMonthId === '2026-08' && (d === 6 || d === 13)) {
      status = 'absent';
      totalLec = 6;
      attendedLec = 0;
      notes = 'Absent - Medical reason';
    } else if (selectedMonthId === '2026-08' && d === 10) {
      status = 'leave';
      totalLec = 6;
      attendedLec = 0;
      notes = 'Approved Medical Leave';
    } else if (selectedMonthId === '2026-08' && (d === 3 || d === 17)) {
      status = 'present';
      totalLec = 6;
      attendedLec = 5;
      notes = 'Attended 5 of 6 lectures (Partial)';
    } else if (selectedMonthId === '2026-08' && d > 20) {
      status = 'future';
      totalLec = 6;
      attendedLec = 0;
      notes = 'Upcoming Academic Day';
    }

    calendarDays.push({
      dayNum: d,
      dateStr,
      dayOfWeek,
      status,
      lecturesTotal: totalLec,
      lecturesAttended: attendedLec,
      notes,
    });
  }

  // Summary counts for current viewed month
  const workingDays = calendarDays.filter((d) => d.status !== 'weekend' && d.status !== 'holiday' && d.status !== 'future');
  const presentDays = calendarDays.filter((d) => d.status === 'present');
  const absentDays = calendarDays.filter((d) => d.status === 'absent');
  const leaveDays = calendarDays.filter((d) => d.status === 'leave');
  const monthPercentage = workingDays.length > 0
    ? Math.round(((presentDays.length + leaveDays.length * 0.5) / workingDays.length) * 100)
    : attendancePercentage;

  const getStatusColor = (status: DayStatus['status']) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-600/30';
      case 'absent':
        return 'bg-rose-500 hover:bg-rose-400 text-white border-rose-600/30';
      case 'leave':
        return 'bg-amber-500 hover:bg-amber-400 text-white border-amber-600/30';
      case 'holiday':
        return 'bg-indigo-600/60 text-indigo-200 border-indigo-500/20';
      case 'weekend':
        return 'bg-slate-800/40 text-slate-500 border-slate-700/30';
      case 'future':
        return 'bg-slate-800/20 text-slate-600 border-slate-800/40';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Monthly Attendance Heatmap & Trend Tracker
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Recharts Analytics
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualize daily present/absent logs and semester consistency at a glance
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar Heatmap</span>
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trend'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Semester Trends</span>
            </button>
          </div>
        </div>
      </div>

      {/* MONTH SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold">Active Month Rate</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
            {monthPercentage}%
            <span className="text-[10px] font-bold text-slate-400">({presentDays.length}/{workingDays.length} days)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold">Present Days</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {presentDays.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold">Absent Days</div>
          <div className="text-xl font-black text-rose-400 mt-0.5 flex items-center gap-1">
            <XCircle className="w-4 h-4 text-rose-500" />
            {absentDays.length}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold">University Eligibility</div>
          <div className="text-xs font-bold text-white mt-1 flex items-center gap-1">
            {monthPercentage >= 75 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Eligible (&ge;75%)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> At Risk (&lt;75%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: CALENDAR HEATMAP */}
      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Selected Period:</span>
              <select
                value={selectedMonthId}
                onChange={(e) => {
                  setSelectedMonthId(e.target.value);
                  setSelectedDay(null);
                }}
                className="bg-slate-900 border border-slate-700 text-xs font-bold text-white px-3 py-1.5 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
              >
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Legend Chips */}
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 hidden md:flex">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Absent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Leave
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Holiday
              </span>
            </div>
          </div>

          {/* Calendar Day Grid */}
          <div>
            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400 pb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading padding slots */}
              {Array.from({ length: activeMonthConfig.startDayOfWeek }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="h-14 sm:h-16 rounded-xl bg-slate-950/20 border border-slate-900"
                />
              ))}

              {/* Day Cards */}
              {calendarDays.map((day) => {
                const isSelected = selectedDay?.dayNum === day.dayNum;
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`h-14 sm:h-16 p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between text-left cursor-pointer group relative ${getStatusColor(
                      day.status
                    )} ${isSelected ? 'ring-2 ring-white scale-105 z-10 shadow-lg' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs sm:text-sm font-black">{day.dayNum}</span>
                      {day.status === 'present' && (
                        <span className="text-[9px] font-bold opacity-80 hidden sm:inline">P</span>
                      )}
                      {day.status === 'absent' && (
                        <span className="text-[9px] font-bold opacity-90 hidden sm:inline">A</span>
                      )}
                      {day.status === 'leave' && (
                        <span className="text-[9px] font-bold opacity-90 hidden sm:inline">L</span>
                      )}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-medium truncate opacity-90">
                      {day.status === 'present' && `${day.lecturesAttended}/${day.lecturesTotal} lec`}
                      {day.status === 'absent' && 'Absent'}
                      {day.status === 'leave' && 'Leave'}
                      {day.status === 'holiday' && 'Holiday'}
                      {day.status === 'weekend' && 'Off'}
                      {day.status === 'future' && 'Planned'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Details Card */}
          {selectedDay && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${getStatusColor(
                    selectedDay.status
                  )}`}
                >
                  {selectedDay.dayNum}
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">
                    Date: {selectedDay.dateStr}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {selectedDay.notes} • Status: <strong className="capitalize text-emerald-400">{selectedDay.status}</strong>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-300">
                  Attended: {selectedDay.lecturesAttended} / {selectedDay.lecturesTotal} Lectures
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: RECHARTS SEMESTER TRENDS */}
      {activeTab === 'trend' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-xs text-white">Monthly Attendance Percentage vs. 75% Requirement</h4>
                <p className="text-[11px] text-slate-400">Historical performance across academic terms</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Target: &ge;75%
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={HISTORICAL_MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'percentage') return [`${value}%`, 'Attendance Rate'];
                      if (name === 'present') return [`${value} days`, 'Present Days'];
                      if (name === 'absent') return [`${value} days`, 'Absent Days'];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine
                    y={75}
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: '75% Min. Required',
                      fill: '#f43f5e',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar dataKey="percentage" name="Attendance Rate" fill="#10b981" radius={[8, 8, 0, 0]}>
                    {HISTORICAL_MONTHLY_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.percentage >= 75 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="percentage" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
