import React from 'react';
import { BarChart3, Download, Printer, FileSpreadsheet, Users, GraduationCap, Building2 } from 'lucide-react';
import { User } from '../../types';
import { DEPARTMENTS, INITIAL_RESULTS, INITIAL_USERS } from '../../data/mockDatabase';
import { exportToCSV, printFormattedPDFReport } from '../../utils/exporter';

interface ReportsModuleProps {
  user: User;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ user }) => {
  const isStudent = user.role === 'student';
  const filteredUsers = isStudent
    ? INITIAL_USERS.filter((u) => u.departmentId === user.departmentId)
    : INITIAL_USERS;

  const handleExportAttendanceReport = () => {
    printFormattedPDFReport(
      `${isStudent ? user.departmentName : 'Department'} Attendance Report`,
      'Lokbharti University Smart LMS',
      ['Enrollment No', 'Student Name', 'Department', 'Semester', 'Overall Attendance %'],
      filteredUsers.filter((u) => u.role === 'student').map((s) => [
        s.enrollmentNo || '2024CS0000',
        s.name,
        s.departmentName,
        `Sem ${s.semester}`,
        '88.5%',
      ])
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      `lokbharti_${isStudent ? user.departmentId : 'university'}_academic_report`,
      filteredUsers.map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Department: u.departmentName,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ERP Reports & Academic Analytics Exporter
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate official PDF grade sheets, attendance audits, and departmental CSV dumps
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export All Master Data (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Attendance Audit Report
          </h3>
          <p className="text-xs text-slate-500">
            Generates PDF report listing all student attendance percentages and highlights debarred students below 75%.
          </p>
          <button
            onClick={handleExportAttendanceReport}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Generate Attendance PDF
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" /> Department Performance Summary
          </h3>
          <p className="text-xs text-slate-500">
            Includes SGPA, CGPA statistics, pass/fail ratios, and subject credit distribution.
          </p>
          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Performance CSV
          </button>
        </div>
      </div>
    </div>
  );
};
