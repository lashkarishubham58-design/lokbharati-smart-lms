import React, { useState } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsModuleProps {
  logs: AuditLog[];
}

export const AuditLogsModule: React.FC<AuditLogsModuleProps> = ({ logs = [] }) => {
  const [search, setSearch] = useState('');

  const filtered = (logs || []).filter(
    (l) =>
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              System Audit & Security Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log trail of administrative actions, attendance corrections, and user authentications
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none w-56"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase">
                <th className="p-3.5 pl-6">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5 pr-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 pl-6 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                    {log.userName} ({log.role.toUpperCase()})
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{log.details}</td>
                  <td className="p-3.5 pr-6 font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
