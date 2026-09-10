import { SmartLeaveRequest, LeaveApprovalState } from '../types';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

export const INITIAL_LEAVE_REQUESTS: SmartLeaveRequest[] = [
  {
    id: 'leave_101',
    studentId: 'usr_std_01',
    studentName: 'Aarav Patel',
    enrollmentNo: 'LBU2023CS001',
    departmentId: 'dept_cs',
    departmentName: 'Computer Science & IT',
    semester: 4,
    leaveType: 'medical',
    startDate: '2025-02-25',
    endDate: '2025-02-27',
    totalDays: 3,
    reason: 'Severe viral fever and medical consultation at Bhavnagar Civil Hospital.',
    submittedAt: '2025-02-24 09:15',
    overallStatus: 'pending',
    stages: {
      hod: {
        role: 'hod',
        title: 'Department Head (HOD)',
        approverName: 'Dr. Ramesh Solanki',
        status: 'approved',
        updatedAt: '2025-02-24 11:30',
        comment: 'Medical certificate verified. Approved for academic attendance dispensation.'
      },
      hostel: {
        role: 'hostel_head',
        title: 'Hostel Warden / Rector',
        approverName: 'Prof. Bharat Dave',
        status: 'pending',
        updatedAt: undefined,
        comment: 'Awaiting parent telephonic verification.'
      },
      registrar: {
        role: 'registrar',
        title: 'University Registrar Office',
        approverName: 'Shri K. M. Joshi',
        status: 'not_started',
        updatedAt: undefined
      }
    }
  }
];

export const getSmartLeaves = (): SmartLeaveRequest[] => {
  const leaves = safeStorageGet<SmartLeaveRequest[]>('lbu_smart_leaves', INITIAL_LEAVE_REQUESTS);
  return leaves && leaves.length > 0 ? leaves : INITIAL_LEAVE_REQUESTS;
};

export const createSmartLeaveRequest = (
  studentId: string,
  studentName: string,
  enrollmentNo: string,
  departmentId: string,
  departmentName: string,
  semester: number,
  leaveType: SmartLeaveRequest['leaveType'],
  startDate: string,
  endDate: string,
  reason: string
): SmartLeaveRequest => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const newReq: SmartLeaveRequest = {
    id: `leave_${Date.now()}`,
    studentId,
    studentName,
    enrollmentNo,
    departmentId,
    departmentName,
    semester,
    leaveType,
    startDate,
    endDate,
    totalDays: isNaN(diffDays) ? 1 : diffDays,
    reason,
    submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    overallStatus: 'pending',
    stages: {
      hod: {
        role: 'hod',
        title: 'Department Head (HOD)',
        status: 'pending'
      },
      hostel: {
        role: 'hostel_head',
        title: 'Hostel Warden / Rector',
        status: 'not_started'
      },
      registrar: {
        role: 'registrar',
        title: 'University Registrar Office',
        status: 'not_started'
      }
    }
  };

  const leaves = getSmartLeaves();
  leaves.unshift(newReq);
  safeStorageSet('lbu_smart_leaves', leaves);
  return newReq;
};

export const updateLeaveStage = (
  leaveId: string,
  stage: 'hod' | 'hostel' | 'registrar',
  status: LeaveApprovalState,
  approverName: string,
  comment?: string
): SmartLeaveRequest | null => {
  const leaves = getSmartLeaves();
  const leave = leaves.find((l) => l.id === leaveId);
  if (!leave) return null;

  leave.stages[stage] = {
    role: stage === 'hod' ? 'hod' : stage === 'hostel' ? 'hostel_head' : 'registrar',
    title: stage === 'hod' ? 'Department Head (HOD)' : stage === 'hostel' ? 'Hostel Warden / Rector' : 'University Registrar Office',
    approverName,
    status,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    comment
  };

  // Progression logic
  if (status === 'rejected') {
    leave.overallStatus = 'rejected';
  } else if (status === 'approved') {
    if (stage === 'hod') {
      if (leave.stages.hostel.status === 'not_started') {
        leave.stages.hostel.status = 'pending';
      }
    } else if (stage === 'hostel') {
      if (leave.stages.registrar.status === 'not_started') {
        leave.stages.registrar.status = 'pending';
      }
    } else if (stage === 'registrar') {
      if (leave.stages.hod.status === 'approved' && leave.stages.hostel.status === 'approved') {
        leave.overallStatus = 'approved';
      }
    }
  }

  safeStorageSet('lbu_smart_leaves', leaves);
  return leave;
};
