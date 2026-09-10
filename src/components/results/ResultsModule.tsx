import React from 'react';
import {
  GraduationCap,
  Award,
  Download,
  Printer,
  BarChart2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { User, StudentResult } from '../../types';
import { INITIAL_RESULTS } from '../../data/mockDatabase';
import { printFormattedPDFReport } from '../../utils/exporter';

interface ResultsModuleProps {
  user: User;
}

export const ResultsModule: React.FC<ResultsModuleProps> = ({ user }) => {
  const resultObj = INITIAL_RESULTS.find((r) => r.studentId === user.id) || INITIAL_RESULTS[0];

  const handlePrintGradeSheet = () => {
    printFormattedPDFReport(
      'Official Grade Sheet & Result Statement',
      `Semester ${resultObj.semester} • Academic Year ${resultObj.academicYear}`,
      ['Subject Code', 'Subject Title', 'Internal (30)', 'External (70)', 'Total (100)', 'Grade'],
      resultObj.subjects.map((s) => [
        s.subjectCode,
        s.subjectName,
        String(s.internalMarks),
        String(s.externalMarks),
        String(s.totalMarks),
        s.grade,
      ])
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Academic Results & Cumulative GPA
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official internal and external marks breakdown verified by Lokbharti University Controller of Examinations
          </p>
        </div>

        <button
          onClick={handlePrintGradeSheet}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
          id="print-grade-sheet-btn"
        >
          <Printer className="w-4 h-4" /> Download Official Grade Sheet PDF
        </button>
      </div>

      {/* GPA Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-tr from-purple-800 to-indigo-900 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Semester GPA (SGPA)
          </div>
          <div className="text-4xl font-black mt-2">{resultObj.sgpa}</div>
          <p className="text-xs text-purple-300 mt-1">Semester {resultObj.semester} Performance</p>
        </div>

        <div className="bg-gradient-to-tr from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
            Cumulative GPA (CGPA)
          </div>
          <div className="text-4xl font-black mt-2">{resultObj.cgpa}</div>
          <p className="text-xs text-emerald-300 mt-1">Overall Academic Standing</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase">Division & Classification</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {resultObj.remarks}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> First Class with Distinction
          </span>
        </div>
      </div>

      {/* Detailed Marks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Detailed Subject Marks Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase">
                <th className="p-3.5 pl-6">Code</th>
                <th className="p-3.5">Subject Title</th>
                <th className="p-3.5 text-center">Credits</th>
                <th className="p-3.5 text-center">Internal (30)</th>
                <th className="p-3.5 text-center">External (70)</th>
                <th className="p-3.5 text-center">Total (100)</th>
                <th className="p-3.5 text-center pr-6">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
              {resultObj.subjects.map((s) => (
                <tr key={s.subjectCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 pl-6 font-mono font-bold text-purple-600 dark:text-purple-400">
                    {s.subjectCode}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                    {s.subjectName}
                  </td>
                  <td className="p-3.5 text-center font-mono">{s.credits}</td>
                  <td className="p-3.5 text-center font-mono">{s.internalMarks}</td>
                  <td className="p-3.5 text-center font-mono">{s.externalMarks}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {s.totalMarks}
                  </td>
                  <td className="p-3.5 text-center pr-6 font-bold">
                    <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono">
                      {s.grade}
                    </span>
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
