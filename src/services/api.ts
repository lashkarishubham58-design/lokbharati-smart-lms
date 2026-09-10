import {
  User,
  AttendanceRecord,
  AttendanceEditRequest,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizResult,
  Notice,
  MessageThread,
  StudyMaterial,
  AuditLog
} from '../types';

export const api = {
  async login(email: string, password?: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Authentication failed. Please check your credentials.`);
      }
      return await res.json();
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) {
        throw e;
      }
      console.warn('API connection error, falling back to local database validation:', e);
      return null;
    }
  },

  async fetchSmartAttendance(departmentId: string, semester: number) {
    try {
      const res = await fetch(`/api/attendance/smart-fetch?departmentId=${departmentId}&semester=${semester}`);
      if (!res.ok) throw new Error('Failed to fetch smart attendance');
      return await res.json();
    } catch (e) {
      console.warn('Smart attendance fetch error:', e);
      return null;
    }
  },

  async submitAttendance(record: Partial<AttendanceRecord>) {
    try {
      const res = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Submit attendance error:', e);
      return { success: false };
    }
  },

  async requestAttendanceEdit(request: Partial<AttendanceEditRequest>) {
    try {
      const res = await fetch('/api/attendance/edit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Request edit error:', e);
      return { success: false };
    }
  },

  async approveEditRequest(requestId: string, status: 'approved' | 'rejected', hodComment?: string) {
    try {
      const res = await fetch('/api/attendance/approve-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, hodComment }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Approve edit error:', e);
      return { success: false };
    }
  },

  async fetchAssignments() {
    try {
      const res = await fetch('/api/assignments');
      return await res.json();
    } catch (e) {
      return { assignments: [], submissions: [] };
    }
  },

  async createAssignment(assignment: Partial<Assignment>) {
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async submitAssignment(submission: Partial<AssignmentSubmission>) {
    try {
      const res = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async fetchQuizzes() {
    try {
      const res = await fetch('/api/quizzes');
      return await res.json();
    } catch (e) {
      return { quizzes: [], quizResults: [] };
    }
  },

  async submitQuiz(result: Partial<QuizResult>) {
    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async fetchNotices() {
    try {
      const res = await fetch('/api/notices');
      return await res.json();
    } catch (e) {
      return { notices: [] };
    }
  },

  async createNotice(notice: Partial<Notice>) {
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice),
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async sendMessage(payload: any) {
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  downloadDatabaseBackup() {
    window.location.href = '/api/admin/backup';
  },
};
