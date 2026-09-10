import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  FileCheck2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  HelpCircle,
  Upload,
  Award,
  Bell,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Send,
  PlusCircle,
  PlayCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { User, TimetableSlot, Assignment, AssignmentSubmission, Quiz } from '../../types';
import { getCurrentDateAndDay } from '../../utils/dateUtils';
import { LOKBHARTI_LOGO } from '../../assets/logo';

interface TeacherDashboardProps {
  user: User;
  todayLectures: TimetableSlot[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  quizzes?: Quiz[];
  onCreateQuiz?: (quiz: Quiz) => void;
  onToggleQuizStatus?: (id: string) => void;
  onDeleteQuiz?: (id: string) => void;
  onStartQuiz?: (id: string) => void;
  onSelectTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  todayLectures = [],
  assignments = [],
  submissions = [],
  quizzes = [],
  onCreateQuiz,
  onToggleQuizStatus,
  onDeleteQuiz,
  onStartQuiz,
  onSelectTab,
}) => {
  const pendingCheckSubmissions = (submissions || []).filter((s) => s.status === 'submitted');
  const { fullFormatted } = getCurrentDateAndDay();

  // Assigned subjects for this teacher
  const [assignedSubjects] = useState([
    {
      code: 'CS501',
      name: 'Operating System Concepts',
      sem: 5,
      enrolledStudents: 64,
      weeklyHours: 4,
      progressPct: 68,
      classroom: 'Lab 302',
    },
    {
      code: 'CS502',
      name: 'Database Management Systems',
      sem: 5,
      enrolledStudents: 64,
      weeklyHours: 4,
      progressPct: 75,
      classroom: 'Hall 105',
    },
    {
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      sem: 3,
      enrolledStudents: 58,
      weeklyHours: 3,
      progressPct: 82,
      classroom: 'Lab 201',
    },
  ]);

  // At-risk students state for teacher's subjects
  const [atRiskStudents] = useState([
    {
      id: 'st_201',
      name: 'Rohan Mehta',
      enrollmentNo: '24222201044',
      sem: 5,
      subjectCode: 'CS501',
      attendancePct: 68.5,
      ciaMarks: '11/30',
      reason: 'Low Attendance (<75%) & Low Internal Marks',
    },
    {
      id: 'st_202',
      name: 'Neha Patel',
      enrollmentNo: '24222201088',
      sem: 5,
      subjectCode: 'CS502',
      attendancePct: 71.0,
      ciaMarks: '14/30',
      reason: 'Consecutive 3 Lecture Absences',
    },
  ]);

  const [notifiedStudentIds, setNotifiedStudentIds] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-indigo-500/30 backdrop-blur-md">
                Faculty Workspace • {user.designation}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <Calendar className="w-3 h-3 text-indigo-400" />
                {fullFormatted}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Class & Subject Level Scope
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/80 mt-1">
              Department of {user.departmentName} • Employee ID: <span className="font-mono font-bold text-white">{user.employeeId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-950/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-xl shrink-0">
            <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0 ring-2 ring-indigo-500/30">
              <img
                src={LOKBHARTI_LOGO}
                alt="Lokbharti University Seal"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-black tracking-wide uppercase text-white">Lokbharti University</div>
              <div className="text-[11px] text-indigo-300 font-medium">Faculty Portal • Sanosara</div>
              <div className="text-[10px] text-indigo-400 font-mono mt-0.5 font-bold">Grade A+ Accredited</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('students')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-indigo-500/40 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Enrolled Students</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            186
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Across 3 Assigned Subjects</p>
        </div>

        <div
          onClick={() => onSelectTab('attendance')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-blue-500/40 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Lectures Scheduled Today</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {todayLectures.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Smart Attendance Synced</p>
        </div>

        <div
          onClick={() => onSelectTab('assignments')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-amber-500/40 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Submissions to Grade</span>
            <FileCheck2 className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {pendingCheckSubmissions.length || 5}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Pending student assignments</p>
        </div>

        <div
          onClick={() => onSelectTab('materials')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer hover:border-purple-500/40 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Course Resources</span>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            18
          </div>
          <p className="text-[11px] text-slate-500 mt-1">PDF Notes & Slides Uploaded</p>
        </div>
      </div>

      {/* Quick Action Launchpad */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Faculty Quick Management Launchpad
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            onClick={() => onSelectTab('attendance')}
            className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold leading-tight">Mark Attendance</span>
          </button>

          <button
            onClick={() => onSelectTab('assignments')}
            className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-bold leading-tight">Assignments</span>
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-[11px] font-bold leading-tight">Create Quiz</span>
          </button>

          <button
            onClick={() => onSelectTab('materials')}
            className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold leading-tight">Upload Notes</span>
          </button>

          <button
            onClick={() => onSelectTab('results')}
            className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-bold leading-tight">Enter Marks</span>
          </button>

          <button
            onClick={() => onSelectTab('notices')}
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="text-[11px] font-bold leading-tight">Post Notice</span>
          </button>

          <button
            onClick={() => onSelectTab('messaging')}
            className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-[11px] font-bold leading-tight">Messages</span>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 flex flex-col items-center text-center space-y-1.5 transition-all"
          >
            <BarChart3 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span className="text-[11px] font-bold leading-tight">Class Reports</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Assigned Subjects & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule & Assigned Subjects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Lectures Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's Teaching Schedule ({user.name})
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lectures auto-assigned to your faculty schedule
                </p>
              </div>

              <button
                onClick={() => onSelectTab('attendance')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md flex items-center gap-1.5 shrink-0"
              >
                Mark Class Attendance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-3">Time Slot</th>
                    <th className="p-3">Dept & Sem</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Classroom</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {todayLectures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No lectures assigned for today. Use the Timetable module to configure slots.
                      </td>
                    </tr>
                  ) : (
                    todayLectures.map((slot) => (
                      <tr
                        key={slot.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {slot.startTime} – {slot.endTime}
                        </td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                            {slot.departmentId.replace('dept_', '').toUpperCase()} • Sem {slot.semester}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono mr-1.5">
                            {slot.subjectCode}
                          </span>
                          {slot.subjectName}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                          {slot.classroom}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onSelectTab('attendance')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            Take Attendance
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* My Assigned Subjects & Syllabus Progress */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  My Assigned Subjects & Courses
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('materials')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Upload Course Notes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignedSubjects.map((sub) => (
                <div
                  key={sub.code}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Sem {sub.sem} • {sub.classroom}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                      {sub.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {sub.enrolledStudents} Enrolled • {sub.weeklyHours} Hours/Week
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <span>Syllabus Covered</span>
                      <span>{sub.progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${sub.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Low Attendance Alerts & Pending Submissions */}
        <div className="space-y-6">
          {/* Low Attendance & Academic Risk Warnings */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  At-Risk Student Alerts
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {atRiskStudents.length} Flagged
              </span>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map((st) => {
                const isNotified = notifiedStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {st.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {st.enrollmentNo} • Sem {st.sem} ({st.subjectCode})
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                        {st.attendancePct}% Attd
                      </span>
                    </div>

                    <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                      ⚠️ {st.reason} (Internal: {st.ciaMarks})
                    </p>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          if (!isNotified) {
                            setNotifiedStudentIds((prev) => [...prev, st.id]);
                          }
                        }}
                        disabled={isNotified}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          isNotified
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {isNotified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Advisory Sent</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Send Attendance Advisory</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Submissions Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pending Assignment Submissions
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('assignments')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Grade All
              </button>
            </div>

            <div className="space-y-3">
              {pendingCheckSubmissions.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  No pending student submissions to grade!
                </div>
              ) : (
                pendingCheckSubmissions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.studentName}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Submitted: {sub.submittedAt}
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectTab('assignments')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shrink-0"
                    >
                      Review & Score
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Quiz Management & Activation Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Create / Activate Quizzes
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('quiz')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                + New Quiz <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {quizzes.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                  <p>No quizzes configured yet.</p>
                  <button
                    onClick={() => onSelectTab('quiz')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Create First Quiz
                  </button>
                </div>
              ) : (
                quizzes.slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {q.title}
                        </h4>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            q.isPublished
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {q.isPublished ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        {q.subjectName} • {q.questions?.length || 0} Qs • {q.durationMinutes}m
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onToggleQuizStatus && (
                        <button
                          onClick={() => onToggleQuizStatus(q.id)}
                          title={q.isPublished ? 'Deactivate Quiz' : 'Activate Quiz for Students'}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            q.isPublished
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-200 dark:bg-slate-700 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {q.isPublished ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5" />
                              Activate
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

