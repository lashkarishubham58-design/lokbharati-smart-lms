import React, { useState } from 'react';
import {
  PlaneTakeoff,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  UserCheck,
  Building,
  FileText,
  ChevronRight,
  Filter,
  MessageSquare
} from 'lucide-react';
import { User, SmartLeaveRequest, LeaveApprovalState } from '../../types';
import {
  getSmartLeaves,
  createSmartLeaveRequest,
  updateLeaveStage
} from '../../services/smartLeaveService';

interface SmartLeaveWorkflowViewProps {
  user: User;
}

export const SmartLeaveWorkflowView: React.FC<SmartLeaveWorkflowViewProps> = ({ user }) => {
  const [leaves, setLeaves] = useState<SmartLeaveRequest[]>(() => getSmartLeaves());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [leaveType, setLeaveType] = useState<SmartLeaveRequest['leaveType']>('medical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isFacultyOrAdmin = user.role === 'teacher' || user.role === 'hod' || user.role === 'admin';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    createSmartLeaveRequest(
      user.id,
      user.name,
      user.enrollmentNo || 'LBU2023CS001',
      user.departmentId || 'dept_cs',
      user.departmentName || 'Computer Science & IT',
      user.semester || 4,
      leaveType,
      startDate,
      endDate,
      reason
    );

    setLeaves(getSmartLeaves());
    setIsApplyModalOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    alert('✅ Leave application submitted to HOD for Tier-1 approval.');
  };

  const handleFacultyAction = (
    leaveId: string,
    stage: 'hod' | 'hostel' | 'registrar',
    action: 'approved' | 'rejected',
    comment: string
  ) => {
    updateLeaveStage(leaveId, stage, action, user.name, comment);
    setLeaves(getSmartLeaves());
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filterStatus === 'all') return true;
    return l.overallStatus === filterStatus;
  });

  const getStatusBadge = (state: LeaveApprovalState) => {
    switch (state) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-300">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] border border-slate-300">
            ⚪ Not Started
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <PlaneTakeoff className="w-3.5 h-3.5" />
            University ERP Multi-Tier Leave Approval Engine
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Smart Leave & Outpass Management
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Multi-tier sequential approval workflow: Student Application ➔ HOD Clearance ➔ Hostel Warden Verification ➔ Registrar Endorsement.
          </p>
        </div>

        {/* Apply Leave Button (Student) */}
        {!isFacultyOrAdmin && (
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply New Leave</span>
          </button>
        )}
      </div>

      {/* Leave Requests List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Active Leave Applications ({filteredLeaves.length})
          </h2>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No leave applications found under selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((l) => (
              <div
                key={l.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4 shadow-sm"
              >
                {/* Top Info Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {l.studentName} ({l.enrollmentNo})
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                        {l.leaveType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {l.departmentName} • {l.startDate} to {l.endDate} ({l.totalDays} Days)
                    </p>
                  </div>

                  <div>
                    {getStatusBadge(l.overallStatus as any)}
                  </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{l.reason}"
                </p>

                {/* Multi-Tier Approval Stages Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {/* Stage 1: HOD */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>1. HOD Approval</span>
                      {getStatusBadge(l.stages.hod.status)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {l.stages.hod.approverName || 'Department Head'}
                    </div>
                    {l.stages.hod.comment && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        Note: {l.stages.hod.comment}
                      </p>
                    )}
                  </div>

                  {/* Stage 2: Hostel Warden */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>2. Hostel Outpass</span>
                      {getStatusBadge(l.stages.hostel.status)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {l.stages.hostel.approverName || 'Hostel Rector'}
                    </div>
                    {l.stages.hostel.comment && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        Note: {l.stages.hostel.comment}
                      </p>
                    )}
                  </div>

                  {/* Stage 3: Registrar */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>3. Registrar Office</span>
                      {getStatusBadge(l.stages.registrar.status)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {l.stages.registrar.approverName || 'University Office'}
                    </div>
                    {l.stages.registrar.comment && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        Note: {l.stages.registrar.comment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Faculty Quick Approvals (For HOD/Admin role) */}
                {isFacultyOrAdmin && l.overallStatus === 'pending' && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleFacultyAction(l.id, 'hod', 'rejected', 'Disapproved by Faculty.')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleFacultyAction(l.id, 'hod', 'approved', 'Approved for academic exemption.')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                    >
                      Approve (HOD Level)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Apply for Formal Academic Leave / Outpass
            </h3>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="medical">Medical Consultation / Hospitalization</option>
                  <option value="hostel_outpass">Hostel Overnight Outpass</option>
                  <option value="academic">Academic Conference / Seminar Duty</option>
                  <option value="family_emergency">Family Emergency / Function</option>
                  <option value="sports_cultural">University Sports & Cultural Event</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detailed Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the academic, medical, or family justification..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
