import React, { useState, useEffect } from 'react';
import { User, UserRole, Assignment, AssignmentSubmission, Quiz, QuizResult, Notice, StudyMaterial, AttendanceRecord, AttendanceEditRequest, MessageThread, AuditLog, NotificationItem, StudentRequest, formatRequestCategory } from './types';
import { api } from './services/api';
import { mockOtpService } from './services/mockOtpService';
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZZES,
  INITIAL_QUIZ_RESULTS,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MATERIALS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_EDIT_REQUESTS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_STUDENT_REQUESTS,
  INITIAL_USERS,
  TIMETABLES,
  getStoredUsers,
  saveUserProfileOverride,
  isAccountPurgedOrDeleted,
  isAccountPermanentlyPurged,
  unpurgeOrReactivateAccount
} from './data/mockDatabase';
import {
  findUserCredential,
  getActiveUserPassword,
  saveActiveUserPassword,
  cleanIdentifier,
  normalizeEmailDomain
} from './data/credentials';
import {
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  pruneStorageIfFull
} from './utils/storage';
import { canCommunicate, cleanUserName, getCommunicationPolicyMessage } from './utils/communicationRules';
import { useLoading } from './context/LoadingContext';
import { doDateRangesOverlap, formatDateRange } from './utils/dateUtils';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BreadcrumbHeader } from './components/layout/BreadcrumbHeader';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ThemeCustomizerModal } from './components/layout/ThemeCustomizerModal';
import { LoginPage } from './components/auth/LoginPage';

import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { HODDashboard } from './components/dashboard/HODDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

import { SmartAttendance } from './components/attendance/SmartAttendance';
import { TimetableModule } from './components/timetable/TimetableModule';
import { AssignmentsModule } from './components/assignments/AssignmentsModule';
import { QuizModule } from './components/quiz/QuizModule';
import { ResultsModule } from './components/results/ResultsModule';
import { MaterialsModule } from './components/materials/MaterialsModule';
import { AcademicCalendarModule } from './components/calendar/AcademicCalendarModule';
import { NoticeBoardModule } from './components/notices/NoticeBoardModule';
import { NoticeToastContainer, ToastItem } from './components/notices/NoticeToastContainer';
import { MessagingModule } from './components/messaging/MessagingModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { ProfileModule } from './components/profile/ProfileModule';
import { AcademicJourneyModule } from './components/profile/AcademicJourneyModule';
import { DigitalIDCardModule } from './components/profile/DigitalIDCardModule';
import { DocumentVaultModule } from './components/documents/DocumentVaultModule';
import { DatabaseArchitectureModule } from './components/architecture/DatabaseArchitectureModule';
import { AdminManagementModule } from './components/admin/AdminManagementModule';
import { AuditLogsModule } from './components/admin/AuditLogsModule';
import { UniversityDirectoryModule } from './components/university/UniversityDirectoryModule';
import { StudentManagementModule } from './components/university/StudentManagementModule';

import { SmartLeaveWorkflowView } from './components/erp/SmartLeaveWorkflowView';
import { TeacherAIInsightsView } from './components/analytics/TeacherAIInsightsView';

export function App() {
  const { withLoading } = useLoading();
  // Prune any oversized legacy cache keys on initial app load
  useEffect(() => {
    pruneStorageIfFull();
  }, []);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const parsed = safeStorageGet<User | null>('lbu_user', null);
      if (parsed) {
        const cleanId = parsed.id ? parsed.id.trim() : '';
        const cleanEmail = parsed.email ? parsed.email.toLowerCase().trim() : '';
        const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
        const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');

        // Check if there is an official user in INITIAL_USERS
        const officialUser = INITIAL_USERS.find(
          (u) =>
            (cleanId && u.id === cleanId) ||
            (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
            (normEmail1 && u.email && u.email.toLowerCase().trim() === normEmail1) ||
            (normEmail2 && u.email && u.email.toLowerCase().trim() === normEmail2) ||
            (parsed.employeeId && u.employeeId && u.employeeId === parsed.employeeId)
        );

        const profilesMap = safeStorageGet<Record<string, Partial<User>>>('lbu_user_profiles', {});
        const profileUpdate =
          (cleanId && profilesMap[cleanId]) ||
          (cleanEmail && profilesMap[cleanEmail]) ||
          (normEmail1 && profilesMap[normEmail1]) ||
          (normEmail2 && profilesMap[normEmail2]) ||
          {};

        let mergedAvatar = profileUpdate.avatar !== undefined ? profileUpdate.avatar : (parsed.avatar || '');
        // Clear any old unsplash or pre-bundled avatar paths
        if (
          typeof mergedAvatar === 'string' &&
          (mergedAvatar.includes('images.unsplash.com') ||
            mergedAvatar.startsWith('/images/dr_') ||
            mergedAvatar.startsWith('/images/mr_') ||
            mergedAvatar.startsWith('/images/ms_') ||
            mergedAvatar.startsWith('/images/miss_'))
        ) {
          mergedAvatar = '';
        }

        const mergedUser = {
          ...(officialUser || {}),
          ...parsed,
          ...profileUpdate,
          avatar: mergedAvatar || '',
        };
        safeStorageSet('lbu_user', mergedUser);
        return mergedUser;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return null;
  });

  // Listen to profile updates across components to keep root user state synchronized
  useEffect(() => {
    const handleUserUpdateEvent = (e: any) => {
      const { userId, email, updates } = e.detail || {};
      if (!updates) return;
      setUser((current) => {
        if (!current) return current;
        const curCleanEmail = current.email ? current.email.toLowerCase().trim() : '';
        const curCleanId = current.id ? current.id.trim() : '';
        const normEmail = curCleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
        const targetCleanEmail = email ? email.toLowerCase().trim() : '';
        const targetNormEmail = targetCleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');

        const isMatch =
          (userId && curCleanId === userId) ||
          (targetCleanEmail && curCleanEmail === targetCleanEmail) ||
          (targetNormEmail && normEmail === targetNormEmail);

        if (isMatch) {
          const updated = { ...current, ...updates };
          safeStorageSet('lbu_user', updated);
          return updated;
        }
        return current;
      });
    };
    window.addEventListener('lbu_user_updated', handleUserUpdateEvent);
    return () => window.removeEventListener('lbu_user_updated', handleUserUpdateEvent);
  }, []);

  const [activeTab, setActiveTab] = useState<string>(() => {
    return safeStorageGet<string>('lbu_active_tab', 'dashboard');
  });
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(() => {
    return safeStorageGet<string>('lbu_selected_dept_filter', 'all');
  });
  const [historyStack, setHistoryStack] = useState<string[]>(() => {
    const saved = safeStorageGet<string[]>('lbu_history_stack', ['dashboard']);
    return Array.isArray(saved) && saved.length > 0 ? saved : ['dashboard'];
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return safeStorageGet<boolean>('lbu_dark_mode', true);
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeAccent, setActiveAccent] = useState<string>('emerald');
  const [themeModalOpen, setThemeModalOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [activeQuizId, setActiveQuizId] = useState<string | undefined>(undefined);

  // Application Data State with Safe Storage Persistence
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = safeStorageGet<Assignment[] | null>('lbu_assignments', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      const existingIds = new Set(saved.map((a: Assignment) => a.id));
      const missingInitial = INITIAL_ASSIGNMENTS.filter((a) => !existingIds.has(a.id));
      return [...saved, ...missingInitial];
    }
    return INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    return safeStorageGet<AssignmentSubmission[]>('lbu_submissions', INITIAL_SUBMISSIONS);
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    return safeStorageGet<Quiz[]>('lbu_quizzes', INITIAL_QUIZZES);
  });

  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    return safeStorageGet<QuizResult[]>('lbu_quiz_results', INITIAL_QUIZ_RESULTS);
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    return safeStorageGet<Notice[]>('lbu_notices', INITIAL_NOTICES);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return safeStorageGet<NotificationItem[]>('lbu_notifications', INITIAL_NOTIFICATIONS);
  });
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(['not_vac_3', 'not_1', 'not_2']);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    return safeStorageGet<StudyMaterial[]>('lbu_materials', INITIAL_MATERIALS);
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    return safeStorageGet<AttendanceRecord[]>('lbu_attendance_records', INITIAL_ATTENDANCE_RECORDS);
  });

  const [editRequests, setEditRequests] = useState<AttendanceEditRequest[]>(() => {
    return safeStorageGet<AttendanceEditRequest[]>('lbu_edit_requests', INITIAL_EDIT_REQUESTS);
  });

  const [threads, setThreads] = useState<MessageThread[]>(() => {
    return safeStorageGet<MessageThread[]>('lbu_threads', INITIAL_MESSAGES);
  });

  const [targetMessageRecipient, setTargetMessageRecipient] = useState<User | null>(null);
  const [targetMessageThreadId, setTargetMessageThreadId] = useState<string | null>(null);

  const handleStartMessageWithUser = (recipient: User) => {
    if (!user || !recipient) return;

    if (!canCommunicate(user.role, recipient.role)) {
      alert(`Communication Policy: ${getCommunicationPolicyMessage(user.role, recipient.role)}`);
      return;
    }

    const cleanCurrentName = cleanUserName(user.name);
    const cleanRecipientName = cleanUserName(recipient.name);

    // Look for an existing thread between current user and recipient
    const existingThread = threads.find((t) => {
      const isSenderMe = t.senderId === user.id || cleanUserName(t.senderName) === cleanCurrentName;
      const isReceiverMe = t.receiverId === user.id || cleanUserName(t.receiverName) === cleanCurrentName;

      const isSenderRecipient = t.senderId === recipient.id || cleanUserName(t.senderName) === cleanRecipientName;
      const isReceiverRecipient = t.receiverId === recipient.id || cleanUserName(t.receiverName) === cleanRecipientName;

      return (isSenderMe && isReceiverRecipient) || (isReceiverMe && isSenderRecipient);
    });

    if (existingThread) {
      // Un-delete if deleted previously by current user
      if (Array.isArray(existingThread.deletedByUserIds) && existingThread.deletedByUserIds.length > 0) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === existingThread.id
              ? {
                  ...t,
                  deletedByUserIds: (t.deletedByUserIds || []).filter(
                    (uid) =>
                      uid !== user.id &&
                      uid !== cleanCurrentName &&
                      uid !== (user.email || '').toLowerCase().trim()
                  ),
                }
              : t
          )
        );
      }
      setTargetMessageThreadId(existingThread.id);
      setTargetMessageRecipient(recipient);
      handleTabChange('messaging');
    } else {
      // Immediately create a direct 1-to-1 conversation thread so the chat opens directly without prompts
      const newThreadId = `thr_dm_${user.id}_${recipient.id}_${Date.now()}`;
      const newThread: MessageThread = {
        id: newThreadId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverId: recipient.id,
        receiverName: recipient.name,
        receiverRole: recipient.role,
        subject: `Direct Conversation with ${recipient.name}`,
        lastUpdated: new Date().toISOString(),
        messages: [],
      };

      setThreads((prev) => [newThread, ...prev]);
      setTargetMessageThreadId(newThreadId);
      setTargetMessageRecipient(recipient);
      handleTabChange('messaging');
    }
  };

  const handleDeleteThread = (threadId: string) => {
    if (!user) return;
    const currentUserId = user.id;
    const currentUserName = cleanUserName(user.name);
    const currentUserEmail = (user.email || '').toLowerCase().trim();

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const currentDeleted = Array.isArray(t.deletedByUserIds) ? t.deletedByUserIds : [];
        const newDeleted = Array.from(
          new Set([...currentDeleted, currentUserId, currentUserName, currentUserEmail].filter(Boolean))
        );
        return {
          ...t,
          deletedByUserIds: newDeleted,
        };
      })
    );
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return safeStorageGet<AuditLog[]>('lbu_audit_logs', INITIAL_AUDIT_LOGS);
  });

  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>(() => {
    const saved = safeStorageGet<StudentRequest[] | null>('lbu_student_requests', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    // Also check if there were old format leave requests in storage
    const oldLeaveReqs = safeStorageGet<any[]>('lbu_student_leave_requests', null);
    if (oldLeaveReqs && Array.isArray(oldLeaveReqs) && oldLeaveReqs.length > 0) {
      const converted: StudentRequest[] = oldLeaveReqs.map((o) => ({
        id: o.id || `req_${Date.now()}`,
        studentId: o.studentId || 'usr_st_2',
        studentName: o.studentName || 'Student',
        enrollmentNo: o.enrollmentNo || '24222201016',
        departmentId: o.departmentId || 'dept_it',
        departmentName: o.departmentName || 'Information Technology',
        semester: o.semester || 5,
        recipientRole: o.recipientRole || 'hod',
        requestType: o.requestType || 'leave',
        subject: o.subject || 'Leave Application',
        reason: o.reason || '',
        startDate: o.startDate || new Date().toISOString().split('T')[0],
        endDate: o.endDate || new Date().toISOString().split('T')[0],
        days: `${o.startDate || ''} to ${o.endDate || ''}`,
        submittedAt: o.submittedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: o.status === 'approved' ? 'Approved' : o.status === 'rejected' ? 'Rejected' : 'Pending',
      }));
      return [...converted, ...INITIAL_STUDENT_REQUESTS];
    }
    return INITIAL_STUDENT_REQUESTS;
  });

  // Sync state changes to safe storage with quota protection
  useEffect(() => {
    safeStorageSet('lbu_assignments', assignments);
  }, [assignments]);

  useEffect(() => {
    safeStorageSet('lbu_submissions', submissions);
  }, [submissions]);

  useEffect(() => {
    safeStorageSet('lbu_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    safeStorageSet('lbu_quizzes', quizzes);
  }, [quizzes]);

  useEffect(() => {
    safeStorageSet('lbu_quiz_results', quizResults);
  }, [quizResults]);

  useEffect(() => {
    safeStorageSet('lbu_notices', notices);
  }, [notices]);

  useEffect(() => {
    safeStorageSet('lbu_materials', materials);
  }, [materials]);

  useEffect(() => {
    safeStorageSet('lbu_attendance_records', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    safeStorageSet('lbu_edit_requests', editRequests);
  }, [editRequests]);

  useEffect(() => {
    safeStorageSet('lbu_threads', threads);
  }, [threads]);

  useEffect(() => {
    // Keep audit logs trimmed to latest 100 entries to avoid quota bloat
    const trimmedLogs = auditLogs.slice(0, 100);
    safeStorageSet('lbu_audit_logs', trimmedLogs);
  }, [auditLogs]);

  useEffect(() => {
    safeStorageSet('lbu_student_requests', studentRequests);
  }, [studentRequests]);

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const [dashboardAction, setDashboardAction] = useState<{
    modal?: string;
    targetId?: string;
    requestId?: string;
    timestamp: number;
  } | null>(null);

  const [highlightedNoticeId, setHighlightedNoticeId] = useState<string | null>(null);

  const handleNotificationClick = (n: NotificationItem) => {
    handleMarkNotificationAsRead(n.id);

    // 1. Official Notice Board notification
    const isNotice =
      n.type === 'notice' ||
      n.targetTab === 'notices' ||
      n.title.toLowerCase().includes('notice') ||
      n.title.toLowerCase().includes('announcement') ||
      n.title.toLowerCase().includes('circular') ||
      n.title.toLowerCase().includes('vacancy') ||
      n.title.toLowerCase().includes('📢') ||
      n.message.toLowerCase().includes('circular') ||
      n.message.toLowerCase().includes('notice board');

    if (isNotice) {
      handleTabChange('notices');
      setHighlightedNoticeId(n.targetId || null);
      return;
    }

    // 2. Student Request notification
    const isStudentRequest =
      n.type === 'request' ||
      n.targetModal === 'student_requests' ||
      n.title.toLowerCase().includes('student request') ||
      n.title.toLowerCase().includes('request approved') ||
      n.title.toLowerCase().includes('request rejected') ||
      n.title.toLowerCase().includes('leave request') ||
      n.message.toLowerCase().includes('request') ||
      n.message.toLowerCase().includes('petition');

    if (isStudentRequest) {
      handleTabChange('dashboard');
      setDashboardAction({
        modal: 'student_requests',
        requestId: n.targetId,
        timestamp: Date.now(),
      });
      return;
    }

    // 3. Attendance Edit Request (for HOD or Teacher)
    if (n.title.toLowerCase().includes('attendance edit request') || n.message.toLowerCase().includes('edit for')) {
      handleTabChange('attendance');
      return;
    }

    // 4. If explicit targetModal or targetTab
    if (n.targetModal) {
      handleTabChange(n.targetTab || 'dashboard');
      setDashboardAction({
        modal: n.targetModal,
        requestId: n.targetId,
        timestamp: Date.now(),
      });
      return;
    }

    if (n.targetTab) {
      handleTabChange(n.targetTab);
      if (n.targetTab === 'notices' && n.targetId) {
        setHighlightedNoticeId(n.targetId);
      }
      return;
    }

    // 5. Direct Private Message notifications
    const isMessage =
      n.type === 'message' ||
      n.targetTab === 'messaging' ||
      n.title.toLowerCase().includes('message') ||
      n.title.toLowerCase().includes('💬') ||
      n.message.toLowerCase().includes('message');

    if (isMessage) {
      handleTabChange('messaging');
      if (n.targetId) {
        setTargetMessageThreadId(n.targetId);
      }
      return;
    }

    // 6. Default categories mapping
    if (n.type === 'assignment' || n.title.toLowerCase().includes('assignment') || n.title.toLowerCase().includes('submission')) {
      handleTabChange('assignments');
    } else if (n.type === 'quiz' || n.title.toLowerCase().includes('quiz')) {
      handleTabChange('quiz');
    } else if (n.type === 'result' || n.title.toLowerCase().includes('result') || n.title.toLowerCase().includes('grade') || n.title.toLowerCase().includes('graded')) {
      handleTabChange('results');
    } else if (n.type === 'attendance' || n.title.toLowerCase().includes('attendance')) {
      handleTabChange('attendance');
    } else if (n.type === 'timetable' || n.title.toLowerCase().includes('timetable') || n.title.toLowerCase().includes('schedule')) {
      handleTabChange('timetable');
    } else if (n.type === 'document' || n.title.toLowerCase().includes('material') || n.title.toLowerCase().includes('syllabus')) {
      handleTabChange('materials');
    } else {
      handleTabChange('dashboard');
    }
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setNotifications((prev) =>
      prev.filter((n) => {
        if (n.userId && n.userId === user.id) return false;
        if (n.role && n.role === user.role) return false;
        if (!n.userId && !n.role) return false;
        return true;
      })
    );
  };

  const handleAddMaterial = (newMaterial: StudyMaterial) => {
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      userEmail: user ? user.email : 'admin@lokbhartiuniversity.edu.in',
      userName: user ? user.name : 'System Administrator',
      role: user ? user.role : 'admin',
      ipAddress: '192.168.1.105',
      timestamp: new Date().toLocaleString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handle password updates with integrated OTP verification step
  const handleUpdatePassword = (
    newPassword: string,
    otp?: string,
    targetEmail?: string
  ): { success: boolean; error?: string } => {
    const activeEmail = targetEmail || user?.email;
    if (!activeEmail) {
      return { success: false, error: 'User email is required to update security password.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters in length.' };
    }

    // Step 1: Verification step using mockOtpService
    if (otp) {
      const verifyResult = mockOtpService.verifyOtp(activeEmail, otp);
      if (!verifyResult.success) {
        return { success: false, error: verifyResult.error || 'Invalid or expired OTP verification code.' };
      }
    } else {
      // Check if email was pre-verified via OTP or if current user session is valid
      const isVerified = mockOtpService.isEmailVerified(activeEmail);
      if (!isVerified && !user) {
        return {
          success: false,
          error: 'Security verification required: Please enter the 6-digit OTP dispatched to your university email.',
        };
      }
    }

    // Step 2: Apply password update across memory, safeStorage, and persistent database overrides
    const cleanEmail = activeEmail.toLowerCase().trim();
    const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
    const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');

    saveActiveUserPassword(cleanEmail, newPassword);
    saveActiveUserPassword(normEmail1, newPassword);
    saveActiveUserPassword(normEmail2, newPassword);

    const passMap = safeStorageGet<Record<string, string>>('lbu_user_passwords', {});
    passMap[cleanEmail] = newPassword;
    passMap[normEmail1] = newPassword;
    passMap[normEmail2] = newPassword;

    if (user && (user.email.toLowerCase().trim() === cleanEmail || user.id)) {
      if (user.id) {
        passMap[user.id.trim()] = newPassword;
        saveActiveUserPassword(user.id, newPassword);
      }
      if (user.enrollmentNo) {
        passMap[user.enrollmentNo.trim()] = newPassword;
        saveActiveUserPassword(user.enrollmentNo, newPassword);
      }
      const updated = { ...user, password: newPassword };
      setUser(updated);
      safeStorageSet('lbu_user', updated);
      saveUserProfileOverride(user.id, user.email, { password: newPassword });
    } else {
      // Find matching stored user
      const usersList = getStoredUsers();
      const found = usersList.find((u) => {
        const uEmail = (u.email || '').toLowerCase().trim();
        return uEmail === cleanEmail || uEmail === normEmail1 || uEmail === normEmail2;
      });
      if (found) {
        if (found.id) {
          passMap[found.id.trim()] = newPassword;
          saveActiveUserPassword(found.id, newPassword);
        }
        if (found.enrollmentNo) {
          passMap[found.enrollmentNo.trim()] = newPassword;
          saveActiveUserPassword(found.enrollmentNo, newPassword);
        }
        saveUserProfileOverride(found.id, found.email, { password: newPassword });
      }
    }

    safeStorageSet('lbu_user_passwords', passMap);

    // Call server to persist in mockDatabase.ts, credentials.ts, and database store
    fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: activeEmail,
        newPassword,
        otp: otp ? otp.trim() : undefined,
      }),
    }).catch((err) => {
      console.warn('Server password persistence notice:', err);
    });

    // Clear OTP verification session
    mockOtpService.clearOtp(activeEmail);

    handleAuditLog(
      'UPDATE_PASSWORD',
      `User ${user?.name || activeEmail} successfully updated security password after email OTP verification.`
    );

    return { success: true };
  };

  // Handle profile updates with immediate database persistence
  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      safeStorageSet('lbu_user', updated);

      // Save user profile updates to database storage and in-memory models
      saveUserProfileOverride(user.id, user.email, updatedFields);

      handleAuditLog(
        'UPDATE_PROFILE',
        `User ${updated.name} (${updated.email}) updated profile details in database (${Object.keys(updatedFields).join(', ')}).`
      );
    }
  };

  // Unified Tab Navigation Handler with History Stack
  const handleTabChange = (newTab: string, deptId?: string) => {
    if (deptId) {
      setSelectedDeptFilter(deptId);
    }
    if (newTab === 'settings') {
      setThemeModalOpen(true);
      return;
    }
    if (newTab !== activeTab) {
      setHistoryStack((prev) => [...prev, newTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop();
      const prevTab = updated[updated.length - 1];
      setHistoryStack(updated);
      setActiveTab(prevTab);
    }
  };

  // Sync activeTab and history to localStorage
  useEffect(() => {
    safeStorageSet('lbu_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    safeStorageSet('lbu_selected_dept_filter', selectedDeptFilter);
  }, [selectedDeptFilter]);

  useEffect(() => {
    safeStorageSet('lbu_history_stack', historyStack);
  }, [historyStack]);

  // Sync dark mode class on html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    safeStorageSet('lbu_dark_mode', isDarkMode);
  }, [isDarkMode]);

  // Subscribe to real-time email simulation events for instant user awareness
  useEffect(() => {
    const unsubscribe = mockOtpService.onEmailReceived((simulatedEmail) => {
      const emailNotice: Notice = {
        id: `notice_mail_${Date.now()}`,
        title: `📧 Simulated University Email: OTP ${simulatedEmail.otp}`,
        content: `Dispatched to: ${simulatedEmail.to} • Subject: ${simulatedEmail.subject} • Verification code: ${simulatedEmail.otp} (Valid for 10 min)`,
        category: 'urgent',
        postedBy: 'identity_system',
        postedByName: 'Lokbharti IAM System',
        postedByRole: 'ADMIN',
        date: new Date().toISOString().split('T')[0],
        isPinned: true,
        departmentName: 'Access Management Cell',
      };
      triggerNoticeToast(emailNotice);

      const emailNotif: NotificationItem = {
        id: `notif_email_${Date.now()}`,
        title: `📧 Simulated Email Received`,
        message: `OTP Code [${simulatedEmail.otp}] sent to ${simulatedEmail.to} for password reset.`,
        type: 'notice',
        isRead: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [emailNotif, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K, Alt+Left, Ctrl+H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K -> Universal Search Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Ctrl+H or Cmd+H -> Go Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handleTabChange('dashboard');
      }
      // Alt + Left Arrow -> Go Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStack, activeTab]);

  const handleLogin = (email: string, password?: string) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter your university email address or student ID.');
    }

    const trimmedInput = email.trim();
    if (trimmedInput.includes('@') && /[A-Z]/.test(trimmedInput)) {
      throw new Error("Invalid Email Case: University email address must be in lowercase only. Capital letters are not allowed (e.g., 'shubham.lashkari@lokbhartiuniversity.edu.in').");
    }

    const usersList = getStoredUsers();
    
    // Resolve user account strictly (no fuzzy guessing)
    const matchResult = findUserCredential(email, usersList);
    
    if (!matchResult.matchedUser && !matchResult.credential) {
      throw new Error(`Invalid Credentials: No university account matching '${email}' was found. Please check for any typos or mistakes in your email or ID.`);
    }

    const found = matchResult.matchedUser || (matchResult.credential as unknown as User);
    const resolvedEmail = found.email || matchResult.matchedEmail || email;

    // Strictly check if account is purged or soft deleted from database
    if (
      isAccountPurgedOrDeleted(email) ||
      isAccountPermanentlyPurged(email) ||
      isAccountPurgedOrDeleted(resolvedEmail) ||
      isAccountPermanentlyPurged(resolvedEmail) ||
      (found.id && isAccountPermanentlyPurged(found.id))
    ) {
      throw new Error(`Account Access Revoked: This user account (${resolvedEmail}) has been permanently deleted or deactivated from the university database. Login is strictly forbidden.`);
    }

    // Active expected password for this account retrieved from separate credentials engine & local overrides
    const expectedPassword = getActiveUserPassword(found);

    // Strict validation: Character-exact case-sensitive match. Even a minor typo or space error will strictly fail.
    const isPasswordValid = password !== undefined && password === expectedPassword;

    if (!isPasswordValid) {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }

    // Check for saved profile updates in safeStorage
    const profilesMap = safeStorageGet<Record<string, Partial<User>>>('lbu_user_profiles', {});
    const cleanId = found.id ? found.id.trim() : '';
    const cleanEmail = found.email ? cleanIdentifier(found.email) : '';
    const normEmail = found.email ? normalizeEmailDomain(found.email) : '';
    const empId = found.employeeId ? found.employeeId.trim() : '';

    const savedProfileUpdates =
      (cleanId && profilesMap[cleanId]) ||
      (cleanEmail && profilesMap[cleanEmail]) ||
      (normEmail && profilesMap[normEmail]) ||
      (empId && profilesMap[empId]) ||
      {};

    const loggedInUser = { ...found, ...savedProfileUpdates, password: expectedPassword };
    setUser(loggedInUser);
    safeStorageSet('lbu_user', loggedInUser);
    setActiveTab('dashboard');
    setHistoryStack(['dashboard']);
    safeStorageSet('lbu_active_tab', 'dashboard');
    safeStorageSet('lbu_history_stack', ['dashboard']);
  };

  const handleLogout = () => {
    withLoading(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setUser(null);
      safeStorageRemove('lbu_user');
      safeStorageRemove('lbu_token');
      safeStorageRemove('lbu_active_tab');
      safeStorageRemove('lbu_history_stack');
      safeStorageRemove('lbu_selected_dept_filter');
      setActiveTab('dashboard');
      setHistoryStack(['dashboard']);
    }, 'Signing out of Academic Session...');
  };

  const handleCreateAssignment = (asg: Partial<Assignment>) => {
    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      title: asg.title || 'Untitled Assignment',
      description: asg.description || '',
      subjectId: asg.subjectId || 'sub_cs401',
      subjectName: asg.subjectName || 'Database Management Systems',
      departmentId: asg.departmentId || user?.departmentId || 'dept_it',
      semester: asg.semester || user?.semester || 4,
      teacherId: user?.id || 'usr_teacher_1',
      teacherName: user?.name || 'Dr. Rajesh Mehta',
      createdAt: new Date().toISOString(),
      dueDate: asg.dueDate || '2026-08-05 23:59',
      totalMarks: asg.totalMarks || 50,
      attachmentName: asg.attachmentName,
      attachmentUrl: asg.attachmentUrl,
    };
    setAssignments((prev) => [newAsg, ...prev]);

    // Create Notification for Students
    const assignmentNotice: Notice = {
      id: `notice_asg_${Date.now()}`,
      title: `📚 New Assignment: ${newAsg.title}`,
      content: `A new assignment "${newAsg.title}" for ${newAsg.subjectName} has been assigned by ${newAsg.teacherName}. Due Date: ${newAsg.dueDate}. Total Marks: ${newAsg.totalMarks}`,
      category: 'academic' as any,
      postedBy: newAsg.teacherId,
      postedByName: newAsg.teacherName,
      postedByRole: 'FACULTY',
      date: new Date().toISOString().split('T')[0],
      isPinned: true,
      departmentName: newAsg.subjectName,
    };

    setNotices((prev) => [assignmentNotice, ...prev]);
    triggerNoticeToast(assignmentNotice);

    const newNotif: NotificationItem = {
      id: `notif_asg_${Date.now()}`,
      role: 'student',
      title: `📚 New Assignment: ${newAsg.title}`,
      message: `Assigned by ${newAsg.teacherName} for ${newAsg.subjectName}. Due: ${newAsg.dueDate}.`,
      type: 'assignment',
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleSubmitAssignment = (sub: Partial<AssignmentSubmission>) => {
    const newSub: AssignmentSubmission = {
      id: `sub_${Date.now()}`,
      assignmentId: sub.assignmentId || '',
      studentId: user?.id || '',
      studentName: user?.name || '',
      enrollmentNo: user?.enrollmentNo || '',
      submittedAt: new Date().toISOString(),
      fileName: sub.fileName || 'Assignment.pdf',
      fileUrl: sub.fileUrl || '#',
      comments: sub.comments,
      status: 'submitted',
      isLate: sub.isLate || false,
    };
    setSubmissions((prev) => [newSub, ...prev]);

    // Find target assignment for context
    const targetAsg = assignments.find((a) => a.id === newSub.assignmentId);
    const asgTitle = targetAsg ? targetAsg.title : 'Assignment';

    // Create Notification for Teachers
    const submissionNotice: Notice = {
      id: `notice_sub_${Date.now()}`,
      title: `📥 New Assignment Submission: ${newSub.studentName}`,
      content: `${newSub.studentName} (${newSub.enrollmentNo || 'Student'}) has submitted assignment "${asgTitle}" (${newSub.fileName}).`,
      category: 'department',
      postedBy: newSub.studentId,
      postedByName: newSub.studentName,
      postedByRole: 'STUDENT',
      date: new Date().toISOString().split('T')[0],
      isPinned: false,
      departmentName: targetAsg?.subjectName || 'Academic Submissions',
    };

    setNotices((prev) => [submissionNotice, ...prev]);
    triggerNoticeToast(submissionNotice);

    const newNotif: NotificationItem = {
      id: `notif_sub_${Date.now()}`,
      role: 'teacher',
      title: `📥 New Submission: ${newSub.studentName}`,
      message: `Submitted assignment "${asgTitle}" (${newSub.fileName}).`,
      type: 'assignment',
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleGradeSubmission = (submissionId: string, marksObtained: number, feedback: string) => {
    setSubmissions((prev) => {
      const targetSub = prev.find((s) => s.id === submissionId);
      if (targetSub) {
        const targetAsg = assignments.find((a) => a.id === targetSub.assignmentId);
        const gradeNotice: Notice = {
          id: `notice_grade_${Date.now()}`,
          title: `📝 Assignment Graded: ${targetAsg?.title || 'Assignment'}`,
          content: `Your submission for "${targetAsg?.title || 'Assignment'}" has been graded. Marks: ${marksObtained}/${targetAsg?.totalMarks || 50}. ${feedback ? `Feedback: "${feedback}"` : ''}`,
          category: 'academic' as any,
          postedBy: user?.id || 'usr_teacher_1',
          postedByName: user?.name || 'Faculty',
          postedByRole: 'FACULTY',
          date: new Date().toISOString().split('T')[0],
          isPinned: false,
          departmentName: targetAsg?.subjectName || 'Grading & Evaluation',
        };
        setNotices((nPrev) => [gradeNotice, ...nPrev]);
        triggerNoticeToast(gradeNotice);

        const newNotif: NotificationItem = {
          id: `notif_grade_${Date.now()}`,
          userId: targetSub.studentId,
          role: 'student',
          title: `📝 Assignment Graded: ${targetAsg?.title || 'Assignment'}`,
          message: `Your submission received ${marksObtained}/${targetAsg?.totalMarks || 50} marks.`,
          type: 'result',
          isRead: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setNotifications((nPrev) => [newNotif, ...nPrev]);
      }
      return prev.map((s) => (s.id === submissionId ? { ...s, marksObtained, feedback, status: 'graded' } : s));
    });
  };

  const handleSubmitQuizResult = (res: Partial<QuizResult>) => {
    const newRes: QuizResult = {
      id: res.id || `qres_${Date.now()}`,
      quizId: res.quizId || '',
      quizTitle: res.quizTitle || '',
      studentId: user?.id || '',
      studentName: user?.name || '',
      score: res.score || 0,
      totalMarks: res.totalMarks || 50,
      percentage: res.percentage || 0,
      completedAt: new Date().toISOString(),
      timeTakenSeconds: res.timeTakenSeconds || 120,
    };
    setQuizResults([newRes, ...quizResults]);
  };

  const handleCreateQuiz = (quizData: Partial<Quiz>) => {
    const isPublished = quizData.isPublished ?? true;
    const newQuiz: Quiz = {
      id: quizData.id || `qz_${Date.now()}`,
      title: quizData.title || 'Untitled Assessment Quiz',
      subjectId: quizData.subjectId || 'sub_cs501',
      subjectName: quizData.subjectName || 'Operating System Concepts',
      departmentId: quizData.departmentId || user?.departmentId || 'dept_cs',
      semester: quizData.semester || 5,
      teacherId: user?.id || 'usr_teacher_1',
      durationMinutes: quizData.durationMinutes || 20,
      totalMarks: quizData.totalMarks || (quizData.questions ? quizData.questions.length * 10 : 50),
      questions: quizData.questions && quizData.questions.length > 0 ? quizData.questions : [
        {
          id: `q_${Date.now()}_1`,
          question: 'What is the primary role of an operating system kernel?',
          options: [
            'Resource management and core hardware abstraction',
            'Compiling user source code directly into binaries',
            'Rendering web browsers in graphical mode',
            'Configuring optical hardware exclusively',
          ],
          correctAnswer: 0,
          explanation: 'The kernel manages CPU, memory, and devices directly.',
        },
      ],
      dueDate: quizData.dueDate || '2026-08-30 23:59',
      isPublished: isPublished,
      createdAt: new Date().toISOString(),
    };

    setQuizzes((prev) => [newQuiz, ...prev]);

    if (isPublished) {
      const quizNotice: Notice = {
        id: `notice_qz_${Date.now()}`,
        title: `🎯 Interactive Quiz Live: ${newQuiz.title}`,
        content: `A new interactive quiz "${newQuiz.title}" for ${newQuiz.subjectName} (Sem ${newQuiz.semester}) is now active! Duration: ${newQuiz.durationMinutes} mins. Total Marks: ${newQuiz.totalMarks}.`,
        category: 'exam' as any,
        postedBy: user?.id || 'usr_teacher_1',
        postedByName: user?.name || 'Faculty Member',
        postedByRole: 'FACULTY',
        date: new Date().toISOString().split('T')[0],
        isPinned: true,
        departmentName: newQuiz.subjectName,
      };
      setNotices((prev) => [quizNotice, ...prev]);
      triggerNoticeToast(quizNotice);

      const newNotif: NotificationItem = {
        id: `notif_qz_${Date.now()}`,
        role: 'student',
        title: `🎯 Quiz Activated: ${newQuiz.title}`,
        message: `Quiz for ${newQuiz.subjectName} is now active. Time limit: ${newQuiz.durationMinutes}m.`,
        type: 'quiz',
        targetTab: 'quiz',
        isRead: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    const auditLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: user?.email || 'teacher@lokbharti.edu.in',
      userName: user?.name || 'Faculty Member',
      role: user?.role || 'teacher',
      action: 'QUIZ_CREATED',
      details: `Created quiz "${newQuiz.title}" (${newQuiz.subjectName}) - Status: ${isPublished ? 'Active/Published' : 'Draft/Inactive'}`,
      ipAddress: '192.168.1.105',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);
  };

  const handleToggleQuizStatus = (quizId: string) => {
    let toggledQuiz: Quiz | undefined;
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          const updated = { ...q, isPublished: !q.isPublished };
          toggledQuiz = updated;
          return updated;
        }
        return q;
      })
    );

    if (toggledQuiz) {
      const isNowActive = toggledQuiz.isPublished;
      if (isNowActive) {
        const newNotif: NotificationItem = {
          id: `notif_qz_act_${Date.now()}`,
          role: 'student',
          title: `🟢 Quiz Activated: ${toggledQuiz.title}`,
          message: `The quiz for ${toggledQuiz.subjectName} is now live and available for submission.`,
          type: 'quiz',
          targetTab: 'quiz',
          isRead: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }

      const auditLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userEmail: user?.email || 'teacher@lokbharti.edu.in',
        userName: user?.name || 'Faculty Member',
        role: user?.role || 'teacher',
        action: 'QUIZ_STATUS_TOGGLED',
        details: `${isNowActive ? 'Activated' : 'Deactivated'} quiz "${toggledQuiz.title}" (${toggledQuiz.subjectName})`,
        ipAddress: '192.168.1.105',
      };
      setAuditLogs((prev) => [auditLog, ...prev]);
    }
  };

  const handleUpdateQuiz = (updatedQuiz: Quiz) => {
    setQuizzes((prev) => prev.map((q) => (q.id === updatedQuiz.id ? updatedQuiz : q)));
    const auditLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: user?.email || 'teacher@lokbharti.edu.in',
      userName: user?.name || 'Faculty Member',
      role: user?.role || 'teacher',
      action: 'QUIZ_UPDATED',
      details: `Updated quiz "${updatedQuiz.title}" (${updatedQuiz.subjectName}) - Status: ${updatedQuiz.isPublished ? 'Active' : 'Draft'}`,
      ipAddress: '192.168.1.105',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);
  };

  const handleDeleteQuiz = (quizId: string) => {
    const target = quizzes.find((q) => q.id === quizId);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));

    const auditLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: user?.email || 'teacher@lokbharti.edu.in',
      userName: user?.name || 'Faculty Member',
      role: user?.role || 'teacher',
      action: 'QUIZ_DELETED',
      details: `Deleted quiz "${target?.title || quizId}"`,
      ipAddress: '192.168.1.105',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);
  };

  const handleSubmitStudentRequest = (req: Omit<StudentRequest, 'id' | 'submittedAt' | 'status'>) => {
    // Validate if student already has an approved leave overlapping this date range
    if (req.startDate && req.endDate) {
      const existingApproved = studentRequests.find(
        (sr) =>
          sr.status === 'Approved' &&
          (sr.studentId === req.studentId || (req.enrollmentNo && sr.enrollmentNo === req.enrollmentNo)) &&
          sr.startDate &&
          sr.endDate &&
          doDateRangesOverlap(req.startDate, req.endDate, sr.startDate, sr.endDate)
      );

      if (existingApproved) {
        const errorNotice: Notice = {
          id: `notice_err_${Date.now()}`,
          title: `❌ Request Submission Blocked`,
          content: `You already have an approved leave from ${formatDateRange(existingApproved.startDate, existingApproved.endDate)} ("${existingApproved.subject}"). Once approved, you cannot apply for another leave up to ${existingApproved.endDate}.`,
          category: 'urgent',
          postedBy: 'system',
          postedByName: 'Academic Office',
          postedByRole: 'ADMIN',
          date: new Date().toISOString().split('T')[0],
          isPinned: false,
          departmentName: 'Leave Sanction Cell',
        };
        triggerNoticeToast(errorNotice);
        return;
      }
    }

    const newReq: StudentRequest = {
      ...req,
      id: `req_${Date.now()}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending',
    };
    setStudentRequests((prev) => [newReq, ...prev]);

    // Create Audit Log
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      userEmail: user?.email || '',
      userName: user?.name || req.studentName,
      role: user?.role || 'student',
      action: 'STUDENT_REQUEST_SUBMITTED',
      details: `Submitted ${newReq.subject} (${formatRequestCategory(newReq.requestType)}) to ${newReq.recipientRole === 'hod' ? 'Head of Department' : 'University Administration'}`,
      ipAddress: '192.168.1.102',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // 1. Create Notification for HOD
    const hodNotif: NotificationItem = {
      id: `notif_hod_${Date.now()}`,
      role: 'hod',
      title: `📩 New Student Request: ${newReq.studentName}`,
      message: `${newReq.studentName} (${newReq.enrollmentNo}, Sem ${newReq.semester}) submitted: "${newReq.subject}" for ${newReq.recipientRole === 'hod' ? 'HOD review' : 'administrative petition'}.`,
      type: 'request',
      targetTab: 'dashboard',
      targetModal: 'student_requests',
      targetId: newReq.id,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 2. Create Notification for Admin
    const adminNotif: NotificationItem = {
      id: `notif_admin_${Date.now() + 1}`,
      role: 'admin',
      title: `📩 New Student Request: ${newReq.studentName}`,
      message: `${newReq.studentName} (${newReq.enrollmentNo}, Sem ${newReq.semester}, Dept: ${newReq.departmentName || 'Information Technology'}) submitted: "${newReq.subject}" for ${newReq.recipientRole === 'hod' ? 'HOD review' : 'administrative sanction'}.`,
      type: 'request',
      targetTab: 'dashboard',
      targetModal: 'student_requests',
      targetId: newReq.id,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNotifications((prev) => [hodNotif, adminNotif, ...prev]);

    // Create Toast
    const requestNotice: Notice = {
      id: `notice_req_${Date.now()}`,
      title: `📩 Student Request Received: ${newReq.studentName}`,
      content: `${newReq.studentName} submitted "${newReq.subject}" for ${newReq.recipientRole === 'hod' ? 'HOD review' : 'Administrative sanction'}.`,
      category: 'department',
      postedBy: newReq.studentId,
      postedByName: newReq.studentName,
      postedByRole: 'STUDENT',
      date: new Date().toISOString().split('T')[0],
      isPinned: false,
      departmentName: newReq.departmentName || 'Student Petitions Cell',
    };
    triggerNoticeToast(requestNotice);
  };

  const handleReviewStudentRequest = (
    requestId: string,
    status: 'Approved' | 'Rejected',
    comment?: string
  ) => {
    const reviewerName = user?.name || (user?.role === 'hod' ? 'Head of Department' : 'Dean / Administrator');
    const reviewerRole = user?.role === 'hod' ? 'Head of Department' : 'University Administration';

    let targetReq: StudentRequest | undefined;

    setStudentRequests((prev) => {
      const updated = prev.map((r) => {
        if (r.id === requestId) {
          const processed: StudentRequest = {
            ...r,
            status,
            processedAt: Date.now(),
            reviewedBy: reviewerName,
            reviewComment: comment || (status === 'Approved' ? `Approved with official sanction from ${reviewerRole}` : `Declined upon review by ${reviewerRole}`),
          };
          targetReq = processed;
          return processed;
        }
        return r;
      });
      return updated;
    });

    const req = targetReq || studentRequests.find((r) => r.id === requestId);
    if (req) {
      // 1. Notify Student directly
      const studentNotif: NotificationItem = {
        id: `notif_st_${Date.now()}`,
        userId: req.studentId,
        role: 'student',
        title: status === 'Approved' ? `✅ Request Approved: ${req.subject}` : `❌ Request Rejected: ${req.subject}`,
        message: `Your request "${req.subject}" (${formatRequestCategory(req.requestType)}) submitted to ${req.recipientRole === 'hod' ? 'HOD' : 'University Administration'} has been ${status.toUpperCase()} by ${reviewerName}. Remark: "${comment || (status === 'Approved' ? 'Approved with official departmental sanction' : 'Declined upon review')}"`,
        type: 'request',
        targetTab: 'dashboard',
        targetModal: 'student_requests',
        targetId: req.id,
        isRead: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [studentNotif, ...prev]);

      // 2. Trigger active notification toast in session
      const reviewNotice: Notice = {
        id: `notice_rev_${Date.now()}`,
        title: status === 'Approved' ? `✅ Request Approved: ${req.subject}` : `❌ Request Rejected: ${req.subject}`,
        content: `Application from ${req.studentName} (${req.enrollmentNo}) has been ${status.toLowerCase()} by ${reviewerName}.`,
        category: 'department',
        postedBy: user?.id || 'official',
        postedByName: reviewerName,
        postedByRole: reviewerRole,
        date: new Date().toISOString().split('T')[0],
        isPinned: false,
        departmentName: req.departmentName || 'Lokbharti University',
      };
      triggerNoticeToast(reviewNotice);

      // 3. Audit Log
      const auditLog: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        userEmail: user?.email || '',
        userName: reviewerName,
        role: user?.role || 'hod',
        action: `STUDENT_REQUEST_${status.toUpperCase()}`,
        details: `${status} request from ${req.studentName} (${req.enrollmentNo}): ${req.subject}. Reviewer: ${reviewerName}`,
        ipAddress: '192.168.1.102',
      };
      setAuditLogs((prev) => [auditLog, ...prev]);
    }
  };

  const handleDismissStudentRequest = (requestId: string) => {
    setStudentRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, isCleared: true, clearedAt: Date.now() } : r))
    );
  };

  const handleClearAllProcessedRequests = (recipientRole?: 'hod' | 'admin', departmentId?: string) => {
    setStudentRequests((prev) =>
      prev.map((r) => {
        if (r.status === 'Pending') return r;
        if (recipientRole && r.recipientRole && r.recipientRole !== recipientRole) return r;
        if (departmentId && r.departmentId && r.departmentId !== departmentId && r.departmentId !== 'dept_it') return r;
        return { ...r, isCleared: true, clearedAt: Date.now() };
      })
    );
  };

  const handleMarkNoticeAsRead = (noticeId: string) => {
    setReadNoticeIds((prev) => (prev.includes(noticeId) ? prev : [...prev, noticeId]));
  };

  const handleMarkAllNoticesAsRead = () => {
    setReadNoticeIds(notices.map((n) => n.id));
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerNoticeToast = (notice: Notice) => {
    const newToast: ToastItem = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      notice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  };

  const handleDeleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    handleAuditLog('DELETE_NOTICE', `Deleted notice record (${noticeId})`);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    handleAuditLog('DELETE_ASSIGNMENT', `Deleted assignment record (${assignmentId})`);
  };

  const handleCreateNotice = (notice: Partial<Notice>) => {
    const newNotice: Notice = {
      id: `notice_${Date.now()}`,
      title: notice.title || 'Notice',
      content: notice.content || '',
      category: notice.category || 'general',
      postedBy: user?.id || '',
      postedByName: user?.name || '',
      postedByRole: user?.role.toUpperCase() || 'ADMIN',
      date: new Date().toISOString().split('T')[0],
      isPinned: notice.isPinned || false,
      departmentId: notice.departmentId || user?.departmentId || undefined,
      departmentName: notice.departmentName || user?.departmentName || 'All Departments',
    };
    setNotices((prev) => [newNotice, ...prev]);
    triggerNoticeToast(newNotice);

    // Generate University-wide notification item for Official Notice Board
    const newNoticeNotif: NotificationItem = {
      id: `notif_notice_${Date.now()}`,
      title: `📢 Official Notice: ${newNotice.title}`,
      message: `${newNotice.departmentName ? `[${newNotice.departmentName}] ` : ''}${newNotice.content.slice(0, 130)}${newNotice.content.length > 130 ? '...' : ''}`,
      type: 'notice',
      targetTab: 'notices',
      targetId: newNotice.id,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [newNoticeNotif, ...prev]);
  };

  const handleSimulateNotice = () => {
    const samples: Partial<Notice>[] = [
      {
        title: '📚 Academic: Monsoon Semester Syllabus & Lab Manuals Released',
        content: 'All faculty and students can now download the updated syllabus and practical lab guides from the course repository.',
        category: 'academic',
        postedByName: 'Academic Dean Office',
        postedByRole: 'DEAN ACADEMICS',
        departmentName: 'Academic Council',
      },
      {
        title: '📝 Examination Schedule Update: Mid-Term Monsoon 2026',
        content: 'Mid-term exam hall tickets and seating arrangements are now live in student dashboards. Download and verify subject codes immediately.',
        category: 'exam',
        postedByName: 'Controller of Examinations',
        postedByRole: 'EXAM CELL',
        departmentName: 'Central Examination Board',
      },
      {
        title: '🎓 Admission Notice: Postgraduate & Diploma Admissions 2026-27',
        content: 'Online applications for M.Sc. Agriculture, Rural Economics, and Social Work programs are now open on the admission portal.',
        category: 'admission',
        postedByName: 'Admissions Office',
        postedByRole: 'ADMISSION COMMITTEE',
        departmentName: 'Directorate of Admissions',
      },
      {
        title: '🏆 Scholarship Announcement: Post-Matric & Merit Freeship Scheme',
        content: 'Eligible SC/ST/OBC and merit students can submit digital applications and income certificates before Aug 30.',
        category: 'scholarship',
        postedByName: 'Student Welfare Cell',
        postedByRole: 'DSW',
        departmentName: 'Financial Aid Section',
      },
      {
        title: '🎉 Events & Activities: Annual Lokotsav Cultural Festival 2026',
        content: 'Auditions for folk dance, debate, theatre, and organic culinary competitions start next Monday at the Central Amphitheatre.',
        category: 'events',
        postedByName: 'Cultural Council',
        postedByRole: 'FACULTY CONVENOR',
        departmentName: 'Student Affairs',
      },
      {
        title: '💼 Placement & Career: Campus Recruitment Drive 2026',
        content: 'Top agribusiness and IT firms are conducting pooled campus recruitment on Aug 20. Interested final year students must register.',
        category: 'placement',
        postedByName: 'Training & Placement Cell',
        postedByRole: 'TPO DIRECTOR',
        departmentName: 'Lokbharti Career Hub',
      },
      {
        title: '🏛️ Department Notice: Organic Farm Machinery Maintenance Workshop',
        content: 'Mandatory practical workshop on renewable bio-energy implements scheduled this Friday for Agriculture students.',
        category: 'department',
        postedByName: 'Prof. Ramesh Patel',
        postedByRole: 'HOD',
        departmentName: 'Organic Agriculture',
      },
      {
        title: '🏠 Hostel & Student Affairs: Monsoon Room Allocation & Mess Committee',
        content: 'Hostel block reallocation lists and the revised dietary mess menu are now displayed on the hostel wardens portal.',
        category: 'hostel',
        postedByName: 'Chief Warden Office',
        postedByRole: 'WARDEN',
        departmentName: 'Hostel Affairs',
      },
      {
        title: '💳 Fees & Finance: Semester Tuition Fee Clearance Reminder',
        content: 'Students can clear upcoming semester installments online with zero transaction surcharges before the due date.',
        category: 'finance',
        postedByName: 'Finance & Accounts',
        postedByRole: 'CHIEF ACCOUNTS OFFICER',
        departmentName: 'Bursar Office',
      },
      {
        title: '📢 General / Important: University Clean Green Campus Initiative',
        content: 'Lokbharti will observe zero plastic day and tree plantation drive across all campus avenues this Thursday.',
        category: 'general',
        postedByName: 'Dr. R. K. Shastri',
        postedByRole: 'REGISTRAR',
        departmentName: 'University Administration',
      },
    ];

    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    const simulatedNotice: Notice = {
      id: `notice_${Date.now()}`,
      title: randomSample.title!,
      content: randomSample.content!,
      category: randomSample.category!,
      postedBy: 'sim_user',
      postedByName: randomSample.postedByName!,
      postedByRole: randomSample.postedByRole!,
      date: new Date().toISOString().split('T')[0],
      isPinned: true,
      departmentName: randomSample.departmentName,
    };

    setNotices((prev) => [simulatedNotice, ...prev]);
    triggerNoticeToast(simulatedNotice);

    const simulatedNoticeNotif: NotificationItem = {
      id: `notif_notice_${Date.now()}`,
      title: `📢 Official Notice: ${simulatedNotice.title}`,
      message: `${simulatedNotice.departmentName ? `[${simulatedNotice.departmentName}] ` : ''}${simulatedNotice.content.slice(0, 130)}${simulatedNotice.content.length > 130 ? '...' : ''}`,
      type: 'notice',
      targetTab: 'notices',
      targetId: simulatedNotice.id,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [simulatedNoticeNotif, ...prev]);
  };

  const handleSendMessage = (payload: any) => {
    // Validate role communication permissions (Disallow Student <-> Student, allow all other pairs)
    if (!canCommunicate(payload.senderRole, payload.receiverRole)) {
      console.warn(
        `Communication blocked: ${payload.senderRole} is not permitted to message ${payload.receiverRole}`
      );
      return;
    }

    const existingThread = threads.find((t) => t.id === payload.threadId);
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: payload.senderId,
      senderName: payload.senderName,
      text: payload.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let targetThreadId = payload.threadId;

    if (existingThread) {
      setThreads(
        threads.map((t) =>
          t.id === payload.threadId
            ? {
                ...t,
                lastUpdated: new Date().toISOString(),
                // If participants deleted previous history, new messages restore active visibility for sender and receiver
                deletedByUserIds: (t.deletedByUserIds || []).filter(
                  (id) =>
                    id !== payload.senderId &&
                    id !== payload.receiverId &&
                    id !== cleanUserName(payload.senderName) &&
                    id !== cleanUserName(payload.receiverName)
                ),
                messages: [...t.messages, newMsg],
              }
            : t
        )
      );
    } else {
      const newThread: MessageThread = {
        id: payload.threadId,
        subject: payload.subject || 'Academic Consultation',
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        receiverId: payload.receiverId,
        receiverName: payload.receiverName,
        receiverRole: payload.receiverRole,
        lastUpdated: new Date().toISOString(),
        messages: [newMsg],
      };
      setThreads([newThread, ...threads]);
      targetThreadId = newThread.id;
    }

    // USER-SPECIFIC OR ROLE-BROADCAST NOTIFICATION CREATION
    const isBroadcast = typeof payload.receiverId === 'string' && payload.receiverId.startsWith('all_');
    let targetUserId: string | undefined = payload.receiverId;
    let targetRole: UserRole | undefined = undefined;

    if (isBroadcast) {
      targetUserId = undefined;
      if (payload.receiverId === 'all_hod') targetRole = 'hod';
      else if (payload.receiverId === 'all_faculty' || payload.receiverId === 'all_teacher') targetRole = 'teacher';
      else if (payload.receiverId === 'all_admin') targetRole = 'admin';
      else if (payload.receiverId === 'all_students' || payload.receiverId === 'all_student') targetRole = 'student';
    }

    const messageNotif: NotificationItem = {
      id: `notif_msg_${Date.now()}`,
      userId: targetUserId,
      role: targetRole,
      title: isBroadcast ? `📢 Broadcast from ${payload.senderName}` : `💬 New Message from ${payload.senderName}`,
      message: `${payload.senderName} (${(payload.senderRole || '').toUpperCase()}): "${payload.text.slice(0, 110)}${payload.text.length > 110 ? '...' : ''}"`,
      type: 'message',
      targetTab: 'messaging',
      targetId: targetThreadId,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNotifications((prev) => [messageNotif, ...prev]);
  };

  const handleApproveEditRequest = (requestId: string, status: 'approved' | 'rejected') => {
    setEditRequests(
      editRequests.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const handleSubmitAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords([record, ...attendanceRecords]);
  };

  const handleRequestEditAttendance = (req: Partial<AttendanceEditRequest>) => {
    const newReq: AttendanceEditRequest = {
      id: `req_${Date.now()}`,
      attendanceRecordId: req.attendanceRecordId || '',
      subjectName: req.subjectName || '',
      date: req.date || '',
      teacherId: req.teacherId || user?.id || '',
      teacherName: req.teacherName || user?.name || '',
      departmentId: req.departmentId || 'dept_it',
      semester: req.semester || 4,
      reason: req.reason || '',
      status: 'pending',
      requestedChanges: req.requestedChanges || [],
      createdAt: new Date().toISOString(),
    };
    setEditRequests([newReq, ...editRequests]);
  };

  const handleSelectTabFromSearch = (tab: string) => {
    setActiveTab(tab);
  };

  // Determine current day of week dynamically
  const liveDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const activeDay = ['Saturday', 'Sunday'].includes(liveDayName) ? 'Monday' : liveDayName;

  // Filter today's timetable slots for student's department & semester
  const studentDept = user?.departmentId || 'dept_it';
  const studentSem = user?.semester || 4;

  let todayClasses = TIMETABLES.filter(
    (t) =>
      t.dayOfWeek.toLowerCase() === activeDay.toLowerCase() &&
      t.departmentId === studentDept &&
      t.semester === studentSem
  );

  if (todayClasses.length === 0) {
    todayClasses = TIMETABLES.filter(
      (t) =>
        t.dayOfWeek === 'Monday' &&
        t.departmentId === studentDept &&
        t.semester === studentSem
    );
  }

  // Filter today's lectures strictly for the logged-in professor / teacher
  const isSlotAssignedToTeacher = (slot: (typeof TIMETABLES)[0], u: User | null) => {
    if (!u) return false;
    if (slot.teacherId && (slot.teacherId === u.id || slot.teacherId === u.employeeId)) {
      return true;
    }
    if (!u.name || !slot.teacherName) return false;

    const clean = (str: string) =>
      str.toLowerCase().replace(/^(prof\.|dr\.|mr\.|mrs\.|ms\.)\s+/i, '').trim();

    const userNameClean = clean(u.name);
    const slotTeacherClean = clean(slot.teacherName);

    if (userNameClean === slotTeacherClean) return true;
    if (userNameClean && slotTeacherClean.includes(userNameClean)) return true;
    if (slotTeacherClean && userNameClean.includes(slotTeacherClean)) return true;

    const uParts = userNameClean.split(/\s+/).filter((p) => p.length > 2);
    const tParts = slotTeacherClean.split(/\s+/).filter((p) => p.length > 2);

    return uParts.some((up) => tParts.some((tp) => tp === up || tp.includes(up) || up.includes(tp)));
  };

  let teacherTodayLectures = TIMETABLES.filter((t) => {
    const isToday = t.dayOfWeek.toLowerCase() === activeDay.toLowerCase();
    return isToday && isSlotAssignedToTeacher(t, user);
  });

  if (teacherTodayLectures.length === 0) {
    teacherTodayLectures = TIMETABLES.filter(
      (t) => t.dayOfWeek === 'Monday' && isSlotAssignedToTeacher(t, user)
    );
  }

  // Unauthenticated screen
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Department filtered data for students
  const displayAssignments = user.role === 'student'
    ? assignments.filter((a) => !a.departmentId || a.departmentId === user.departmentId)
    : assignments;

  const displayQuizzes = user.role === 'student'
    ? quizzes.filter((q) => !q.departmentId || q.departmentId === user.departmentId)
    : quizzes;

  const displayNotices = notices.filter((n) => {
    if (user.role === 'admin' || user.role === 'hod') return true;

    // Vacancy announcements from any department are received by all students & teachers
    const isVacancyNotice =
      n.category === 'vacancy' ||
      n.title.toLowerCase().includes('vacancy') ||
      n.content.toLowerCase().includes('vacancy') ||
      n.title.toLowerCase().includes('recruitment') ||
      n.title.toLowerCase().includes('job opening') ||
      n.title.toLowerCase().includes('hiring');

    if (isVacancyNotice) return true;

    // For departmental notices, check user department match
    if (user.role === 'student' || user.role === 'teacher') {
      return !n.departmentId || n.departmentId === user.departmentId;
    }

    return true;
  });

  const displayMaterials = user.role === 'student'
    ? materials.filter((m) => !m.departmentId || m.departmentId === user.departmentId)
    : materials;

  const userNotifications = notifications.filter((n) => {
    if (n.userId) return n.userId === user?.id;
    if (n.role) return n.role === user?.role;
    return true;
  });

  const unreadNotifCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        user={user}
        notifications={userNotifications}
        unreadNotificationsCount={unreadNotifCount}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onClearNotification={handleClearNotification}
        onClearAllNotifications={handleClearAllNotifications}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSearch={() => setSearchOpen(true)}
        onLogout={handleLogout}
        onSelectTab={handleTabChange}
        onNotificationClick={handleNotificationClick}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6 min-w-0">
        {/* Sidebar */}
        <Sidebar
          userRole={user.role}
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Universal Navigation Header with Back Button, Breadcrumbs & Quick Actions */}
          <BreadcrumbHeader
            activeTab={activeTab}
            historyStack={historyStack}
            canGoBack={historyStack.length > 1}
            onBack={handleGoBack}
            onGoBack={handleGoBack}
            onSelectTab={handleTabChange}
            onNavigateTab={handleTabChange}
            onOpenSearch={() => setSearchOpen(true)}
            user={user}
          />

          {activeTab === 'dashboard' && (
            <>
              {user.role === 'student' && (
                <StudentDashboard
                  user={user}
                  todayClasses={todayClasses}
                  assignments={displayAssignments}
                  quizzes={displayQuizzes}
                  notices={displayNotices}
                  readNoticeIds={readNoticeIds}
                  materials={displayMaterials}
                  attendancePercentage={88.5}
                  attendanceRecords={attendanceRecords}
                  studentRequests={studentRequests}
                  dashboardAction={dashboardAction}
                  onSubmitStudentRequest={handleSubmitStudentRequest}
                  onSelectTab={handleTabChange}
                  onMarkNoticeAsRead={handleMarkNoticeAsRead}
                  onTriggerToast={triggerNoticeToast}
                  onStartQuiz={(id) => {
                    setActiveQuizId(id);
                    handleTabChange('quiz');
                  }}
                />
              )}

              {user.role === 'teacher' && (
                <TeacherDashboard
                  user={user}
                  todayLectures={teacherTodayLectures}
                  assignments={assignments}
                  submissions={submissions}
                  quizzes={quizzes}
                  onCreateQuiz={handleCreateQuiz}
                  onToggleQuizStatus={handleToggleQuizStatus}
                  onDeleteQuiz={handleDeleteQuiz}
                  onStartQuiz={(id) => {
                    setActiveQuizId(id);
                    handleTabChange('quiz');
                  }}
                  onSelectTab={handleTabChange}
                />
              )}

              {user.role === 'hod' && (
                <HODDashboard
                  user={user}
                  editRequests={editRequests}
                  attendanceRecords={attendanceRecords}
                  notices={notices}
                  auditLogs={auditLogs}
                  assignments={assignments}
                  studentRequests={studentRequests}
                  dashboardAction={dashboardAction}
                  onReviewStudentRequest={handleReviewStudentRequest}
                  onDismissStudentRequest={handleDismissStudentRequest}
                  onClearAllProcessedRequests={handleClearAllProcessedRequests}
                  onSelectTab={handleTabChange}
                  onApproveEdit={handleApproveEditRequest}
                />
              )}

              {user.role === 'admin' && (
                <AdminDashboard
                  user={user}
                  auditLogs={auditLogs}
                  studentRequests={studentRequests}
                  dashboardAction={dashboardAction}
                  onReviewStudentRequest={handleReviewStudentRequest}
                  onDismissStudentRequest={handleDismissStudentRequest}
                  onClearAllProcessedRequests={handleClearAllProcessedRequests}
                  onSelectTab={handleTabChange}
                  onAuditLog={handleAuditLog}
                />
              )}
            </>
          )}

          {activeTab === 'attendance' && (
            <SmartAttendance
              user={user}
              attendanceRecords={attendanceRecords}
              editRequests={editRequests}
              onSubmitAttendance={handleSubmitAttendance}
              onRequestEdit={handleRequestEditAttendance}
              onApproveEdit={handleApproveEditRequest}
            />
          )}
          {activeTab === 'timetable' && <TimetableModule user={user} />}
          {activeTab === 'students' && (
            <StudentManagementModule
              currentUser={user}
              initialDeptFilter={selectedDeptFilter}
              attendanceRecords={attendanceRecords}
              assignments={assignments}
              submissions={submissions}
              results={quizResults ? [] : []}
              onNavigateTab={handleTabChange}
              onAuditLog={(action, details) => {
                const newLog: AuditLog = {
                  id: `log_${Date.now()}`,
                  timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                  userEmail: user.email,
                  userName: user.name,
                  role: user.role,
                  action,
                  details,
                  ipAddress: '192.168.1.102',
                };
                setAuditLogs((prev) => [newLog, ...prev]);
              }}
              onSendMessageToUser={handleStartMessageWithUser}
            />
          )}
          {activeTab === 'leave-workflow' && <SmartLeaveWorkflowView user={user} />}
          {activeTab === 'teacher-ai-insights' && <TeacherAIInsightsView user={user} />}

          {activeTab === 'directory' && (
            <UniversityDirectoryModule
              currentUser={user}
              onNavigateTab={handleTabChange}
              onSendMessageToUser={handleStartMessageWithUser}
            />
          )}
          {activeTab === 'journey' && <AcademicJourneyModule user={user} />}
          {activeTab === 'idcard' && <DigitalIDCardModule user={user} />}
          {activeTab === 'assignments' && (
            <AssignmentsModule
              user={user}
              assignments={displayAssignments}
              submissions={submissions}
              onCreateAssignment={handleCreateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onSubmitAssignment={handleSubmitAssignment}
              onGradeSubmission={handleGradeSubmission}
            />
          )}
          {activeTab === 'quiz' && (
            <QuizModule
              user={user}
              quizzes={displayQuizzes}
              quizResults={quizResults}
              onSubmitQuizResult={handleSubmitQuizResult}
              activeQuizId={activeQuizId}
              onCreateQuiz={handleCreateQuiz}
              onUpdateQuiz={handleUpdateQuiz}
              onToggleQuizStatus={handleToggleQuizStatus}
              onDeleteQuiz={handleDeleteQuiz}
            />
          )}
          {activeTab === 'results' && <ResultsModule user={user} />}
          {activeTab === 'materials' && (
            <MaterialsModule
              user={user}
              materials={displayMaterials}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
            />
          )}
          {activeTab === 'downloads' && <DocumentVaultModule user={user} />}
          {activeTab === 'calendar' && <AcademicCalendarModule />}
          {activeTab === 'notices' && (
            <NoticeBoardModule
              user={user}
              notices={displayNotices}
              readNoticeIds={readNoticeIds}
              highlightedNoticeId={highlightedNoticeId}
              onCreateNotice={handleCreateNotice}
              onDeleteNotice={handleDeleteNotice}
              onMarkNoticeAsRead={handleMarkNoticeAsRead}
              onMarkAllNoticesAsRead={handleMarkAllNoticesAsRead}
              onSimulateNotice={handleSimulateNotice}
            />
          )}
          {activeTab === 'messaging' && (
            <MessagingModule
              user={user}
              threads={threads}
              onSendMessage={handleSendMessage}
              onDeleteThread={handleDeleteThread}
              targetThreadId={targetMessageThreadId}
              onClearTargetThreadId={() => setTargetMessageThreadId(null)}
              initialRecipient={targetMessageRecipient}
              onClearInitialRecipient={() => setTargetMessageRecipient(null)}
            />
          )}
          {activeTab === 'reports' && <ReportsModule user={user} />}
          {activeTab === 'architecture' && <DatabaseArchitectureModule />}
          {activeTab === 'profile' && (
            <ProfileModule
              user={user}
              onUpdatePassword={handleUpdatePassword}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {activeTab === 'admin-users' && (
            <AdminManagementModule
              currentUser={user}
              onAuditLog={handleAuditLog}
              onSendMessageToUser={handleStartMessageWithUser}
              onViewTimetable={() => handleTabChange('timetable')}
              onViewIDCard={() => handleTabChange('idcard')}
            />
          )}
          {activeTab === 'admin-audit' && <AuditLogsModule logs={auditLogs} />}
        </main>
      </div>

      {/* Global Command & Search Palette Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTab={handleSelectTabFromSearch}
        user={user}
        onSendMessageToUser={handleStartMessageWithUser}
      />

      {/* Theme Customizer Drawer */}
      <ThemeCustomizerModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        activeAccent={activeAccent}
        onChangeAccent={setActiveAccent}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Floating Notice Toast Notification System */}
      <NoticeToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onViewNotice={(notice) => {
          handleMarkNoticeAsRead(notice.id);
          const isRequestNotice =
            notice.title.toLowerCase().includes('student request') ||
            notice.title.toLowerCase().includes('request approved') ||
            notice.title.toLowerCase().includes('request rejected') ||
            notice.content.toLowerCase().includes('submitted "') ||
            notice.content.toLowerCase().includes('application from');

          if (isRequestNotice) {
            handleTabChange('dashboard');
            setDashboardAction({
              modal: 'student_requests',
              timestamp: Date.now(),
            });
          } else {
            handleTabChange('notices');
            setHighlightedNoticeId(notice.id);
          }
        }}
        onMarkAsRead={handleMarkNoticeAsRead}
      />
    </div>
  );
}

export default App;

