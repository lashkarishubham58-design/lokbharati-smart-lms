import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  AlertTriangle,
  Send,
  UserCheck,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  GraduationCap,
  Users,
  Clock,
  BookOpen
} from 'lucide-react';
import { User } from '../../types';
import { INITIAL_USERS } from '../../data/mockDatabase';

interface TeacherAIInsightsViewProps {
  user: User;
}

export const TeacherAIInsightsView: React.FC<TeacherAIInsightsViewProps> = ({ user }) => {
  const [selectedDept, setSelectedDept] = useState<string>(user.departmentId || 'dept_cs');
  const [sentAlerts, setSentAlerts] = useState<Set<string>>(new Set());

  // Roster of students with realistic attendance
  const students = INITIAL_USERS.filter((u) => u.role === 'student' && u.departmentId === selectedDept);

  const atRiskStudents = [
    { id: 'usr_std_04', name: 'Rohan Joshi', enrollment: 'LBU2023CS004', attendancePct: 64.2, weakSubject: 'Operating Systems', riskLevel: 'Critical' },
    { id: 'usr_std_07', name: 'Kavya Trivedi', enrollment: 'LBU2023CS007', attendancePct: 71.8, weakSubject: 'DBMS Normalization', riskLevel: 'High' },
    { id: 'usr_std_12', name: 'Vikram Jadeja', enrollment: 'LBU2023CS012', attendancePct: 69.5, weakSubject: 'C++ Object Oriented', riskLevel: 'High' },
    { id: 'usr_std_18', name: 'Priya Dave', enrollment: 'LBU2023CS018', attendancePct: 73.0, weakSubject: 'Web Frameworks', riskLevel: 'Moderate' }
  ];

  const handleSendRemedialAlert = (studentId: string, name: string) => {
    setSentAlerts((prev) => new Set([...prev, studentId]));
    alert(`📢 Remedial Advisory & Parent Notification dispatched for ${name}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Faculty & HOD Academic Remedial AI Copilot
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Teacher & HOD AI Academic Analytics
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Live departmental attendance health, early warning detection for at-risk students (&lt;75%), and automated AI remedial action recommendations.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px] shrink-0">
          <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
            At-Risk Cohort
          </div>
          <div className="text-3xl font-black text-rose-400">
            {atRiskStudents.length} Students
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Below 75% Attendance Threshold
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
            <span>Average Class Attendance</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">86.4%</div>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +2.1% from last month
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
            <span>Diagnosed Knowledge Gaps</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">OS Deadlocks & BCNF</div>
          <p className="text-xs text-slate-500">Highest quiz error frequency in semester 4</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
            <span>Average Semester SGPA</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">8.42 / 10.0</div>
          <p className="text-xs text-purple-600 font-semibold">92% Exam Eligibility Standing</p>
        </div>
      </div>

      {/* At-Risk Students Early Intervention Roster */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              At-Risk Students Roster (&lt;75% Attendance)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Requires immediate counseling and remedial class scheduling before University Semester Examinations.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Enrollment No</th>
                <th className="pb-3">Attendance %</th>
                <th className="pb-3">Identified Weak Topic</th>
                <th className="pb-3">Risk Tier</th>
                <th className="pb-3 text-right">Remedial Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {atRiskStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="py-3 font-mono text-slate-500">{s.enrollment}</td>
                  <td className="py-3 font-bold text-rose-600 dark:text-rose-400">{s.attendancePct}%</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{s.weakSubject}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      s.riskLevel === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {s.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleSendRemedialAlert(s.id, s.name)}
                      disabled={sentAlerts.has(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                        sentAlerts.has(s.id)
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                      }`}
                    >
                      {sentAlerts.has(s.id) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Alert Dispatched</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Remedial Notice</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
