import React, { useState } from 'react';
import {
  Database,
  Shield,
  Key,
  Lock,
  Server,
  Layers,
  Code,
  CheckCircle2,
  Table,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

export const DatabaseArchitectureModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'er' | 'security' | 'sql'>('tables');
  const [copiedSql, setCopiedSql] = useState(false);

  const tables = [
    {
      name: 'users',
      description: 'Stores students, faculty, HODs, and system administrators.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Unique User Identifier' },
        { name: 'email', type: 'VARCHAR(128)', key: 'UNIQUE', desc: 'University Email Address' },
        { name: 'password_hash', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'Argon2id Encrypted Password' },
        { name: 'name', type: 'VARCHAR(100)', key: 'NOT NULL', desc: 'Full Official Name' },
        { name: 'role', type: "ENUM('student','teacher','hod','admin')", key: 'INDEX', desc: 'Role Access Level' },
        { name: 'department_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References departments(id)' },
        { name: 'semester', type: 'INT', key: 'NULL', desc: 'Current Student Semester (1-6)' },
        { name: 'enrollment_no', type: 'VARCHAR(32)', key: 'UNIQUE', desc: 'Student Enrollment Code' },
        { name: 'employee_id', type: 'VARCHAR(32)', key: 'UNIQUE', desc: 'Faculty Employee Code' },
      ],
    },
    {
      name: 'attendance_records',
      description: 'Immutable smart attendance entries marked by faculty.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Record ID' },
        { name: 'department_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References departments(id)' },
        { name: 'semester', type: 'INT', key: 'INDEX', desc: 'Semester Number' },
        { name: 'subject_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References subjects(id)' },
        { name: 'teacher_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References users(id)' },
        { name: 'date', type: 'DATE', key: 'INDEX', desc: 'Lecture Date' },
        { name: 'time_slot', type: 'VARCHAR(32)', key: 'NOT NULL', desc: 'Time Period (e.g. 10:00 - 11:00)' },
        { name: 'present_student_ids', type: 'JSON', key: 'JSON', desc: 'Array of Present Student IDs' },
        { name: 'absent_student_ids', type: 'JSON', key: 'JSON', desc: 'Array of Absent Student IDs' },
      ],
    },
    {
      name: 'attendance_edit_requests',
      description: 'Faculty correction requests submitted to HOD for approval.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Request ID' },
        { name: 'attendance_record_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References attendance_records(id)' },
        { name: 'teacher_id', type: 'VARCHAR(64)', key: 'FK', desc: 'Faculty Initiator' },
        { name: 'department_id', type: 'VARCHAR(64)', key: 'FK', desc: 'HOD Department' },
        { name: 'status', type: "ENUM('pending','approved','rejected')", key: 'INDEX', desc: 'HOD Workflow Status' },
        { name: 'reason', type: 'TEXT', key: 'NOT NULL', desc: 'Correction Rationale' },
        { name: 'created_at', type: 'TIMESTAMP', key: 'DEFAULT NOW()', desc: 'Submission Timestamp' },
      ],
    },
    {
      name: 'assignments',
      description: 'Course assignments created by professors.',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', key: 'PK', desc: 'Assignment ID' },
        { name: 'title', type: 'VARCHAR(255)', key: 'NOT NULL', desc: 'Assignment Title' },
        { name: 'subject_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References subjects(id)' },
        { name: 'teacher_id', type: 'VARCHAR(64)', key: 'FK', desc: 'References users(id)' },
        { name: 'due_date', type: 'DATETIME', key: 'INDEX', desc: 'Submission Deadline' },
        { name: 'total_marks', type: 'INT', key: 'NOT NULL', desc: 'Maximum Score' },
      ],
    },
  ];

  const rawSqlSchema = `
-- Lokbharti University ERP & LMS MySQL Database Schema
CREATE TABLE departments (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(16) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  hod_user_id VARCHAR(64) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('student', 'teacher', 'hod', 'admin') NOT NULL,
  department_id VARCHAR(64),
  semester INT NULL,
  enrollment_no VARCHAR(32) UNIQUE NULL,
  employee_id VARCHAR(32) UNIQUE NULL,
  INDEX idx_user_role (role),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_records (
  id VARCHAR(64) PRIMARY KEY,
  department_id VARCHAR(64) NOT NULL,
  semester INT NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  teacher_id VARCHAR(64) NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(32) NOT NULL,
  present_student_ids JSON NOT NULL,
  absent_student_ids JSON NOT NULL,
  INDEX idx_attendance_date (date, department_id, semester),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `.trim();

  const handleCopySql = () => {
    navigator.clipboard.writeText(rawSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Normalized MySQL & Security Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Database ERD & Production Security Spec
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Clean relational schema with foreign key constraints, indexes, JWT session handling, and role-based authorization.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tables' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Schema Tables
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Security & Auth
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sql' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            MySQL DDL
          </button>
        </div>
      </div>

      {/* VIEW 1: TABLES */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {tables.map((t) => (
            <div key={t.name} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Table className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-mono font-extrabold text-base text-slate-900 dark:text-white">
                    {t.name}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">{t.description}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Constraint</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {t.columns.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                          {c.type}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-slate-500">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            c.key === 'PK' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            c.key === 'FK' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {c.key}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {c.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: SECURITY */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" /> Authentication & Password Hashing
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Argon2id Key Derivation</strong>: Passwords are hashed server-side using Argon2id with salt before database persistence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Signed JWT Tokens</strong>: Session bearer tokens signed with RS256 algorithm and rotated upon login.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Auto-Domain Verification</strong>: Only <code>@lokbhartiuniversity.edu.in</code> logins allowed into official portal.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" /> API Guarding & Protection
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span><strong>Role Based Access Control (RBAC)</strong>: Express middleware verifies user roles before allowing attendance edits or mark approvals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span><strong>Prepared SQL Statements</strong>: Eliminates SQL Injection via ORM parameterized queries.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span><strong>CSRF & XSS Protection</strong>: Strict SameSite HTTP-Only cookie policy + content sanitization.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* VIEW 3: DDL SQL */}
      {activeTab === 'sql' && (
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-slate-200 font-mono text-xs space-y-4 relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-slate-400 font-bold text-[11px] uppercase">lokbharti_erp_schema.sql</span>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="overflow-x-auto text-emerald-400 leading-relaxed p-2">{rawSqlSchema}</pre>
        </div>
      )}
    </div>
  );
};
