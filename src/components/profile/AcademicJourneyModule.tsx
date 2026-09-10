import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  Award,
  BookOpen,
  FileCheck2,
  Briefcase,
  Layers,
  Sparkles,
  Download,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { User } from '../../types';

interface AcademicJourneyModuleProps {
  user: User;
}

interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  year: string;
  sgpa?: number;
  attendancePct?: number;
  subjects: string[];
  achievements: string[];
  projects: string[];
  certificates: string[];
}

export const AcademicJourneyModule: React.FC<AcademicJourneyModuleProps> = ({ user }) => {
  const milestones: Milestone[] = [
    {
      id: 'admission',
      title: 'University Admission & Orientation',
      subtitle: 'Enrolled in B.Tech Computer Science Engineering',
      status: 'completed',
      year: 'August 2024',
      subjects: ['Orientation to Higher Education', 'Lokbharti Ethics & Values', 'Basic Computer Systems'],
      achievements: ['Awarded Lokbharti Merit Scholarship', 'Top 5% Entrance Score'],
      projects: ['Personal Academic Portfolio Website'],
      certificates: ['University Admission Letter', 'Lokbharti Honor Code Certificate'],
    },
    {
      id: 'sem1',
      title: 'Semester 1',
      subtitle: 'Foundational Science & Programming',
      status: 'completed',
      year: 'Dec 2024',
      sgpa: 8.92,
      attendancePct: 94.2,
      subjects: ['Mathematics I', 'Programming in C/C++', 'Digital Logic & Design', 'Communication Skills'],
      achievements: ['Semester Dean List', '100% Attendance Badge'],
      projects: ['C-based Student Management CLI'],
      certificates: ['Semester 1 Grade Sheet (SGPA: 8.92)', 'C Programming Mastery Certificate'],
    },
    {
      id: 'sem2',
      title: 'Semester 2',
      subtitle: 'Core Data Structures & Hardware',
      status: 'completed',
      year: 'May 2025',
      sgpa: 9.15,
      attendancePct: 91.8,
      subjects: ['Data Structures & Algorithms', 'Mathematics II', 'Computer Organization', 'Environmental Studies'],
      achievements: ['Winner: Lokbharti Hackathon 2025', 'Class Representative'],
      projects: ['Graph Theory Route Planner', '8-bit ALU Simulator'],
      certificates: ['Semester 2 Grade Sheet (SGPA: 9.15)', 'Hackathon First Prize Certificate'],
    },
    {
      id: 'sem3',
      title: 'Semester 3',
      subtitle: 'Software Engineering & Databases',
      status: 'completed',
      year: 'Dec 2025',
      sgpa: 8.85,
      attendancePct: 88.5,
      subjects: ['Database Management Systems', 'Object Oriented Programming (Java)', 'Discrete Mathematics', 'Web Development Basics'],
      achievements: ['Database Management Top Scoring Student'],
      projects: ['Library Management System in Java', 'SQL Optimization Toolkit'],
      certificates: ['Semester 3 Grade Sheet (SGPA: 8.85)', 'Oracle SQL Fundamentals'],
    },
    {
      id: 'sem4',
      title: 'Semester 4 (Current)',
      subtitle: 'Operating Systems & Networks',
      status: 'in_progress',
      year: 'Ongoing - May 2026',
      sgpa: 9.0,
      attendancePct: 88.5,
      subjects: ['Operating Systems', 'Computer Networks', 'Design & Analysis of Algorithms', 'Theory of Computation'],
      achievements: ['Smart Attendance Master', 'Lead Developer Lokbharti Tech Club'],
      projects: ['Full Stack University LMS + ERP', 'Virtual Memory Page Replacement Simulator'],
      certificates: ['Mid-Term Academic Distinction Certificate'],
    },
    {
      id: 'internship',
      title: 'Summer Industry Internship',
      subtitle: 'Mandatory 8-week Tech Internship',
      status: 'upcoming',
      year: 'June 2026 - July 2026',
      subjects: ['Industry Software Engineering', 'Cloud Deployment & DevOps', 'Agile Methodologies'],
      achievements: ['Pre-placement Offer Target'],
      projects: ['Corporate Cloud Application Microservices'],
      certificates: ['Internship Recommendation Letter'],
    },
    {
      id: 'sem5',
      title: 'Semester 5',
      subtitle: 'AI, Cloud Computing & Electives',
      status: 'upcoming',
      year: 'Dec 2026',
      subjects: ['Artificial Intelligence & ML', 'Cloud Computing Architecture', 'Compiler Design', 'Software Testing'],
      achievements: ['Research Paper Publication Target'],
      projects: ['AI-Powered Academic Predictor'],
      certificates: ['AWS Certified Cloud Practitioner Target'],
    },
    {
      id: 'sem6',
      title: 'Semester 6 & Capstone Project',
      subtitle: 'Advanced Electives & Thesis',
      status: 'upcoming',
      year: 'May 2027',
      subjects: ['Cyber Security & Cryptography', 'Big Data Analytics', 'Major Capstone Project'],
      achievements: ['University Best Project Nominee'],
      projects: ['Distributed Blockchain Academic Ledger'],
      certificates: ['Capstone Excellence Award Target'],
    },
    {
      id: 'graduation',
      title: 'Graduation & Convocation',
      subtitle: 'Conferment of B.Tech Degree',
      status: 'upcoming',
      year: 'July 2027',
      subjects: ['Degree Conferment', 'Alumni Association Entry'],
      achievements: ['Lokbharti University Alumni Medal'],
      projects: ['Final Year Degree Portfolio'],
      certificates: ['Official Lokbharti Degree Certificate', 'Transcript of Records'],
    },
  ];

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(milestones[4]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Student Academic Journey</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Degree Progression & Milestones
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your 4-year academic evolution at Lokbharti University from Admission to Convocation.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Overall CGPA</div>
              <div className="text-2xl font-black text-emerald-400">8.98 / 10</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Credits Earned</div>
              <div className="text-2xl font-black text-indigo-300">84 / 160</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Horizontal/Vertical Timeline on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Index (4 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white px-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Milestone Timeline
          </h2>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {milestones.map((m, idx) => {
              const isSelected = selectedMilestone.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMilestone(m)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-md'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.status === 'completed'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : m.status === 'in_progress'
                        ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {m.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {m.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {m.year}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {m.subtitle}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 self-center transition-transform ${
                      isSelected ? 'translate-x-1 text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Details View (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {selectedMilestone.status.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-slate-500">{selectedMilestone.year}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {selectedMilestone.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedMilestone.subtitle}
            </p>

            {/* Metrics if available */}
            {(selectedMilestone.sgpa || selectedMilestone.attendancePct) && (
              <div className="grid grid-cols-2 gap-3 pt-3">
                {selectedMilestone.sgpa && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Semester SGPA</div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {selectedMilestone.sgpa} / 10
                    </div>
                  </div>
                )}

                {selectedMilestone.attendancePct && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Attendance Record</div>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {selectedMilestone.attendancePct}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enrolled Subjects */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Academic Subjects & Courses
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedMilestone.subjects.map((s, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Achievements & Projects */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Achievements & Projects
            </h4>
            <div className="space-y-2">
              {selectedMilestone.achievements.map((a, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 font-medium flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
              {selectedMilestone.projects.map((p, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 font-medium flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Project: {p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Downloadable Certificates */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" /> Issued Certificates & Documents
            </h4>
            <div className="space-y-2">
              {selectedMilestone.certificates.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c}</span>
                  <button
                    onClick={() => alert(`Downloading verified document: ${c}`)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
