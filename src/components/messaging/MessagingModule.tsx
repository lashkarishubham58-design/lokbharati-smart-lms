import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  Search,
  Plus,
  Eye,
  ShieldAlert,
  CheckCircle2,
  Users,
  AlertCircle,
  Lock,
  Sparkles,
  Trash2,
  CheckCheck,
  Building2,
  GraduationCap,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Filter,
  UserCheck,
  HelpCircle,
  FileText
} from 'lucide-react';
import { User, MessageThread, UserRole } from '../../types';
import { getStoredUsers } from '../../data/mockDatabase';
import { UserProfileModal } from '../profile/UserProfileModal';
import { canCommunicate, getCommunicationPolicyMessage, isThreadParticipant, isThreadDeletedForUser, cleanUserName } from '../../utils/communicationRules';
import { matchUserSmart, matchItemSmart } from '../../utils/searchMatching';

interface MessagingModuleProps {
  user: User;
  threads: MessageThread[];
  onSendMessage: (payload: {
    threadId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    receiverId: string;
    receiverName: string;
    receiverRole: UserRole;
    subject?: string;
    text: string;
  }) => void;
  onDeleteThread?: (threadId: string) => void;
  targetThreadId?: string | null;
  onClearTargetThreadId?: () => void;
  initialRecipient?: User | null;
  onClearInitialRecipient?: () => void;
}

export const MessagingModule: React.FC<MessagingModuleProps> = ({
  user,
  threads = [],
  onSendMessage,
  onDeleteThread,
  targetThreadId,
  onClearTargetThreadId,
  initialRecipient,
  onClearInitialRecipient,
}) => {
  // STRICT PRIVACY ENFORCEMENT & ACCOUNT-SPECIFIC INBOX:
  // 1. Never show threads that this specific account has deleted.
  // 2. Only display threads where the current user is an explicit participant (sender or receiver).
  // 3. The other participant(s) retain their full chat history when one user deletes the chat.
  const allowedThreads = useMemo(() => {
    return (threads || []).filter((t) => {
      // If deleted from this specific user's account, hide from their inbox
      if (isThreadDeletedForUser(t, user)) return false;

      const isParticipant = isThreadParticipant(t, user);
      if (!isParticipant) return false;

      const otherRole = t.senderId === user.id ? t.receiverRole : t.senderRole;
      return canCommunicate(user.role, otherRole);
    });
  }, [threads, user]);

  const [activeThreadId, setActiveThreadId] = useState<string>(
    targetThreadId || allowedThreads[0]?.id || ''
  );
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const [text, setText] = useState('');
  const [newThreadModal, setNewThreadModal] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactRoleFilter, setContactRoleFilter] = useState<'all' | 'hod' | 'teacher' | 'admin' | 'student'>('all');
  const [subject, setSubject] = useState('');
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [deleteConfirmThreadId, setDeleteConfirmThreadId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of active conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThreadId, allowedThreads]);

  // Handle deep-linking to specific thread (e.g. from Notification click)
  useEffect(() => {
    if (targetThreadId) {
      const exists = allowedThreads.some((t) => t.id === targetThreadId);
      if (exists) {
        setActiveThreadId(targetThreadId);
      }
      if (onClearTargetThreadId) {
        onClearTargetThreadId();
      }
    }
  }, [targetThreadId, allowedThreads, onClearTargetThreadId]);

  // Ensure activeThreadId is valid
  useEffect(() => {
    if (!activeThreadId && allowedThreads.length > 0) {
      setActiveThreadId(allowedThreads[0].id);
    } else if (activeThreadId && !allowedThreads.some((t) => t.id === activeThreadId)) {
      setActiveThreadId(allowedThreads[0]?.id || '');
    }
  }, [allowedThreads, activeThreadId]);

  // When initialRecipient is provided, auto-switch to existing thread or create/select direct thread immediately
  useEffect(() => {
    if (!initialRecipient) return;

    if (!canCommunicate(user.role, initialRecipient.role)) {
      alert(`Communication Policy: ${getCommunicationPolicyMessage(user.role, initialRecipient.role)}`);
      if (onClearInitialRecipient) onClearInitialRecipient();
      return;
    }

    const cleanCurrentName = cleanUserName(user.name);
    const cleanRecipientName = cleanUserName(initialRecipient.name);

    const matchingThread = allowedThreads.find(
      (t) =>
        (t.senderId === user.id && (t.receiverId === initialRecipient.id || cleanUserName(t.receiverName) === cleanRecipientName)) ||
        (t.receiverId === user.id && (t.senderId === initialRecipient.id || cleanUserName(t.senderName) === cleanRecipientName))
    );

    if (matchingThread) {
      setActiveThreadId(matchingThread.id);
      setNewThreadModal(false);
    } else {
      // Auto-create direct conversation thread so user doesn't have to select or fill modal
      const newThreadId = `thr_dm_${user.id}_${initialRecipient.id}_${Date.now()}`;
      onSendMessage({
        threadId: newThreadId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverId: initialRecipient.id,
        receiverName: initialRecipient.name,
        receiverRole: initialRecipient.role,
        subject: `Direct Conversation with ${initialRecipient.name}`,
        text: `Hello ${initialRecipient.name}!`,
      });
      setActiveThreadId(newThreadId);
      setNewThreadModal(false);
    }

    if (onClearInitialRecipient) {
      onClearInitialRecipient();
    }
  }, [initialRecipient, allowedThreads, user, onClearInitialRecipient, onSendMessage]);

  // Filtered active threads based on user search
  const filteredThreads = useMemo(() => {
    if (!threadSearchQuery.trim()) return allowedThreads;
    const q = threadSearchQuery.toLowerCase().trim();
    return allowedThreads.filter((t) => {
      const otherName = (t.senderId === user.id ? t.receiverName : t.senderName) || '';
      const otherRole = (t.senderId === user.id ? t.receiverRole : t.senderRole) || '';
      const sub = t.subject || '';
      const msgs = t.messages.map((m) => m.text);
      return matchItemSmart([otherName, otherRole, sub, ...msgs], q);
    });
  }, [allowedThreads, threadSearchQuery, user]);

  const activeThread = allowedThreads.find((t) => t.id === activeThreadId) || allowedThreads[0];

  const isBroadcastThread = (thread: MessageThread) => {
    return (thread?.receiverId || '').startsWith('all_');
  };

  // Helper to determine other participant details
  const getOtherParticipant = (thread: MessageThread) => {
    const isSender = thread.senderId === user.id || cleanUserName(thread.senderName) === cleanUserName(user.name);
    return {
      id: isSender ? thread.receiverId : thread.senderId,
      name: isSender ? thread.receiverName : thread.senderName,
      role: (isSender ? thread.receiverRole : thread.senderRole) as UserRole,
      isBroadcast: (thread.receiverId || '').startsWith('all_'),
    };
  };

  const getRoleBadgeStyle = (role?: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (r === 'hod') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (r === 'teacher' || r === 'faculty') return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || !activeThread) return;

    const other = getOtherParticipant(activeThread);

    if (!other.isBroadcast && !canCommunicate(user.role, other.role)) {
      alert('Communication between these user roles is restricted per university policy.');
      return;
    }

    onSendMessage({
      threadId: activeThread.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId: other.id,
      receiverName: other.name,
      receiverRole: other.role,
      subject: activeThread.subject,
      text: text.trim(),
    });

    setText('');
  };

  const handleDirectStartChatWithUser = (recipient: User) => {
    if (!recipient) return;
    if (!canCommunicate(user.role, recipient.role)) {
      alert(`Communication Policy: ${getCommunicationPolicyMessage(user.role, recipient.role)}`);
      return;
    }
    const cleanCurrentName = cleanUserName(user.name);
    const cleanRecipientName = cleanUserName(recipient.name);

    const matchingThread = allowedThreads.find(
      (t) =>
        (t.senderId === user.id && (t.receiverId === recipient.id || cleanUserName(t.receiverName) === cleanRecipientName)) ||
        (t.receiverId === user.id && (t.senderId === recipient.id || cleanUserName(t.senderName) === cleanRecipientName))
    );

    if (matchingThread) {
      setActiveThreadId(matchingThread.id);
      setNewThreadModal(false);
    } else {
      const newThreadId = `thr_dm_${user.id}_${recipient.id}_${Date.now()}`;
      onSendMessage({
        threadId: newThreadId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        receiverId: recipient.id,
        receiverName: recipient.name,
        receiverRole: recipient.role,
        subject: `Direct Conversation with ${recipient.name}`,
        text: `Hello ${recipient.name}!`,
      });
      setActiveThreadId(newThreadId);
      setNewThreadModal(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartNewThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId || !text.trim()) return;

    const allUsers = getStoredUsers();
    let recipientId = selectedRecipientId;
    let recipientName = '';
    let recipientRole: UserRole = 'admin';

    if (selectedRecipientId.startsWith('ALL_')) {
      if (selectedRecipientId === 'ALL_HOD') {
        recipientId = 'all_hod';
        recipientName = '📢 All HODs';
        recipientRole = 'hod';
      } else if (selectedRecipientId === 'ALL_FACULTY') {
        recipientId = 'all_faculty';
        recipientName = '📢 All Faculty';
        recipientRole = 'teacher';
      } else if (selectedRecipientId === 'ALL_ADMIN') {
        recipientId = 'all_admin';
        recipientName = '📢 All Administrators';
        recipientRole = 'admin';
      } else if (selectedRecipientId === 'ALL_STUDENTS') {
        if (isStudentUser) {
          alert('Direct broadcast to all students is restricted.');
          return;
        }
        recipientId = 'all_students';
        recipientName = '📢 All Students';
        recipientRole = 'student';
      } else if (selectedRecipientId === 'ALL_MEMBERS') {
        recipientId = 'all_members';
        recipientName = '📢 All Campus Members';
        recipientRole = 'admin';
      }
    } else {
      const recipient = allUsers.find((u) => u.id === selectedRecipientId);
      if (!recipient) return;

      if (!canCommunicate(user.role, recipient.role)) {
        alert('Direct student-to-student communication is restricted per university policy.');
        return;
      }
      recipientId = recipient.id;
      recipientName = recipient.name;
      recipientRole = recipient.role;
    }

    const newThreadId = `msg_t_${Date.now()}`;

    onSendMessage({
      threadId: newThreadId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId: recipientId,
      receiverName: recipientName,
      receiverRole: recipientRole,
      subject: subject.trim() || (selectedRecipientId.startsWith('ALL_') ? `Broadcast: ${recipientName}` : 'Academic Consultation'),
      text: text.trim(),
    });

    setActiveThreadId(newThreadId);
    setNewThreadModal(false);
    setText('');
    setSubject('');
    setSelectedRecipientId('');
  };

  const handleViewOtherUserProfile = () => {
    if (!activeThread) return;
    const other = getOtherParticipant(activeThread);

    if (other.isBroadcast) return;

    const allUsers = getStoredUsers();
    const matched = allUsers.find(
      (u) => u.id === other.id || cleanUserName(u.name) === cleanUserName(other.name)
    );

    if (matched) {
      setSelectedUserForProfile(matched);
    } else {
      setSelectedUserForProfile({
        id: other.id,
        name: other.name,
        email: `${cleanUserName(other.name).replace(/\s+/g, '.')}@lokbhartiuniversity.edu.in`,
        role: other.role,
        status: 'active',
        departmentId: 'dept_it',
        departmentName: 'Lokbharati University for Rural Innovation',
      });
    }
  };

  const handleDeleteActiveThread = (threadId: string) => {
    if (onDeleteThread) {
      onDeleteThread(threadId);
    }
    setDeleteConfirmThreadId(null);
    const remaining = allowedThreads.filter((t) => t.id !== threadId);
    if (activeThreadId === threadId) {
      setActiveThreadId(remaining[0]?.id || '');
    }
  };

  // Role count metrics for badges & dropdowns
  const roleCounts = useMemo(() => {
    const allUsers = getStoredUsers().filter((u) => {
      if (u.id === user.id) return false;
      if (cleanUserName(u.name) === cleanUserName(user.name)) return false;
      return canCommunicate(user.role, u.role);
    });

    return {
      all: allUsers.length,
      hod: allUsers.filter((u) => u.role === 'hod').length,
      faculty: allUsers.filter((u) => u.role === 'teacher').length,
      admin: allUsers.filter((u) => u.role === 'admin').length,
      student: allUsers.filter((u) => u.role === 'student').length,
    };
  }, [user]);

  // Eligible individual recipients filtered by communication matrix
  const eligibleRecipients = useMemo(() => {
    const allUsers = getStoredUsers();
    return allUsers.filter((u) => {
      if (u.id === user.id) return false;
      if (cleanUserName(u.name) === cleanUserName(user.name)) return false;
      if (!canCommunicate(user.role, u.role)) return false;

      // Filter by role chip
      if (contactRoleFilter !== 'all' && u.role !== contactRoleFilter) {
        return false;
      }

      // Filter by contact search query
      if (contactSearchQuery.trim()) {
        return matchUserSmart(u, contactSearchQuery.trim());
      }

      return true;
    });
  }, [user, contactSearchQuery, contactRoleFilter]);

  const isStudentUser = (user.role || '').toLowerCase() === 'student';

  // Quick preset templates for fast inquiry composition
  const PRESET_TOPICS = [
    { title: 'Project Guidance', subject: 'Inquiry on Cloud Architecture Final Project Scope', text: 'Respected Sir/Maam, could you please provide guidance regarding the implementation scope and evaluation rubrics for our semester project?' },
    { title: 'Office Hours', subject: 'Request for Office Hour Consultation', text: 'Good day. I would like to schedule a 15-minute consultation during your upcoming office hours to discuss academic coursework doubts.' },
    { title: 'Exam Clarification', subject: 'Clarification on Mid-Semester Examination Syllabus', text: 'Respected Faculty, could you please clarify the specific chapters and practical case studies included in the upcoming mid-semester assessment?' },
    { title: 'Lab Review', subject: 'Laboratory Practical Assessment Verification', text: 'Hello Sir, I have completed the assigned laboratory practical exercises. When would be a convenient time for notebook verification?' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Campus Private Messaging
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Lock className="w-3 h-3" />
                  1-to-1 Private & Isolated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isStudentUser
                  ? 'Confidential direct communication channel with Faculty, HODs, and Administration (Student-to-student chat restricted)'
                  : 'Confidential 1-to-1 messaging between Faculty, HODs, Administrators, and Students'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Role RBAC Privacy Active</span>
          </div>

          <button
            onClick={() => {
              setSelectedRecipientId('');
              setSubject('');
              setText('');
              setNewThreadModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
            id="new-message-thread-btn"
          >
            <Plus className="w-4 h-4" /> Start New Private Thread
          </button>
        </div>
      </div>

      {/* Main Messaging Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Sidebar: Threads List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-950/40">
          {/* Search bar inside conversations */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                My Conversations ({allowedThreads.length})
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> E2E Isolated
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={threadSearchQuery}
                onChange={(e) => setThreadSearchQuery(e.target.value)}
                placeholder="Search chats, contacts..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[520px]">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-14 px-4 text-xs text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                  <Lock className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {threadSearchQuery ? 'No matching conversations' : 'No active conversations'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {threadSearchQuery
                    ? 'Try adjusting your search keywords.'
                    : 'Click "Start New Private Thread" to begin a confidential 1-to-1 conversation with a professor or HOD.'}
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const other = getOtherParticipant(t);
                const isSelected = t.id === (activeThread?.id || activeThreadId);
                const lastMsg = t.messages[t.messages.length - 1];
                const isBroadcast = isBroadcastThread(t);

                const roleBadgeColor = getRoleBadgeStyle(other.role);

                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all relative border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-white text-emerald-700' : isBroadcast ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                          {isBroadcast ? <Users className="w-3.5 h-3.5" /> : other.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-xs truncate">{other.name}</span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full border shrink-0 ${
                          isSelected ? 'bg-white/20 text-white border-white/30' : roleBadgeColor
                        }`}
                      >
                        {isBroadcast ? 'ALL ' + other.role : other.role}
                      </span>
                    </div>

                    <p className={`text-xs font-medium truncate mt-1.5 ${isSelected ? 'text-emerald-50 font-semibold' : 'text-slate-900 dark:text-slate-100'}`}>
                      {t.subject || 'Academic Query'}
                    </p>

                    {lastMsg && (
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-emerald-100/90' : 'text-slate-500 dark:text-slate-400'}`}>
                        {lastMsg.senderId === user.id ? 'You: ' : `${lastMsg.senderName}: `}{lastMsg.text}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                      <span className={isSelected ? 'text-emerald-100' : 'text-slate-400'}>
                        {lastMsg ? lastMsg.timestamp : 'Recent'}
                      </span>
                      <span className={`flex items-center gap-1 ${isSelected ? 'text-emerald-100' : isBroadcast ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isBroadcast ? (
                          <>
                            <Users className="w-2.5 h-2.5" /> Broadcast
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5" /> Private
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread Chat View (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between p-6 bg-white dark:bg-slate-900">
          {activeThread ? (
            <>
              {/* Thread Header with Privacy Guarantee */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {activeThread.subject}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                      {isBroadcastThread(activeThread) ? (
                        <>
                          <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                            <Users className="w-3.5 h-3.5" /> Official Broadcast Channel to:
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {getOtherParticipant(activeThread).name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold">
                            Role Channel
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Direct 1-to-1 conversation with:</span>
                          <button
                            onClick={handleViewOtherUserProfile}
                            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            title="View user details"
                          >
                            {getOtherParticipant(activeThread).name}
                            <Eye className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {getOtherParticipant(activeThread).role}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isBroadcastThread(activeThread) && (
                      <button
                        onClick={handleViewOtherUserProfile}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-emerald-500" /> Profile
                      </button>
                    )}
                    {onDeleteThread && (
                      <button
                        onClick={() => setDeleteConfirmThreadId(activeThread.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete conversation from your account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Privacy or Broadcast Badge */}
                {isBroadcastThread(activeThread) ? (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        <strong>Group Broadcast Channel:</strong> Messages are transmitted to all members in{' '}
                        <strong>{getOtherParticipant(activeThread).name}</strong>.
                      </span>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                      <ShieldCheck className="w-3 h-3" /> Broadcast Active
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        <strong>Confidential 1-to-1 Channel:</strong> Messages visible only to{' '}
                        <strong>{user.name}</strong> and{' '}
                        <strong>{getOtherParticipant(activeThread).name}</strong>.
                      </span>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3 h-3" /> Strict Privacy
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto py-5 space-y-4 max-h-[380px] pr-2">
                {activeThread.messages.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Direct Channel with {getOtherParticipant(activeThread).name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                        This is the beginning of your confidential 1-to-1 conversation. Type a message below to start chatting.
                      </p>
                    </div>
                  </div>
                ) : (
                  activeThread.messages.map((m) => {
                    const isMe =
                      m.senderId === user.id ||
                      cleanUserName(m.senderName) === cleanUserName(user.name);

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-full min-w-0 ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {isMe ? 'You' : m.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400">• {m.timestamp}</span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-md md:max-w-lg text-xs leading-relaxed shadow-xs break-words [overflow-wrap:anywhere] min-w-0 ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] select-text">
                            {m.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                          <span className="text-[9px]">Private Channel</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {/* Quick inquiry prompt chips for quick help */}
                {isStudentUser && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Quick Inquiries:
                    </span>
                    {PRESET_TOPICS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setText(p.text)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      required
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Send confidential message to ${getOtherParticipant(activeThread).name}...`}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      id="message-input-field"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className={`p-3 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center transition-all ${
                      text.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                    id="send-message-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-xs text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7 stroke-[1.5]" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Select a conversation to view private messages
              </p>
              <p className="text-slate-500 max-w-sm mx-auto">
                All communications are protected by university RBAC security policies and visible only to the active conversation participants.
              </p>
              <button
                onClick={() => setNewThreadModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Start New Private Thread
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start New Thread Modal */}
      {newThreadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Start Private Message Thread
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This communication will remain strictly private and accessible only to you and the recipient.
                  </p>
                </div>
              </div>
            </div>

            {isStudentUser && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>University Communication Policy:</strong> Direct student-to-student messaging is restricted. You can communicate directly and privately with Department HODs, Course Professors, and University Administration.
                </span>
              </div>
            )}

            <form onSubmit={handleStartNewThread} className="space-y-4">
              {/* Recipient Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Select Recipient
                </label>

                {/* Role filter chips */}
                <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setContactRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer shrink-0 transition-colors ${
                      contactRoleFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Contacts ({roleCounts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRoleFilter('hod')}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer shrink-0 transition-colors ${
                      contactRoleFilter === 'hod'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    HODs ({roleCounts.hod})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRoleFilter('teacher')}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer shrink-0 transition-colors ${
                      contactRoleFilter === 'teacher'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Faculty ({roleCounts.faculty})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactRoleFilter('admin')}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer shrink-0 transition-colors ${
                      contactRoleFilter === 'admin'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Administration ({roleCounts.admin})
                  </button>
                  {!isStudentUser && roleCounts.student > 0 && (
                    <button
                      type="button"
                      onClick={() => setContactRoleFilter('student')}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer shrink-0 transition-colors ${
                        contactRoleFilter === 'student'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Students ({roleCounts.student})
                    </button>
                  )}
                </div>

                {/* Contact search box */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder="Search contact by name, designation, department..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <select
                  required
                  id="messaging-recipient-select"
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">
                    Choose Recipient or Broadcast to All...
                  </option>

                  {/* All Contacts view */}
                  {contactRoleFilter === 'all' && (
                    <>
                      <optgroup label="📢 Broadcast to All Groups ('All' Options)">
                        <option value="ALL_HOD">
                          📢 All HODs — Broadcast to all Heads of Department ({roleCounts.hod} available)
                        </option>
                        <option value="ALL_FACULTY">
                          📢 All Faculty — Broadcast to all Professors & Teaching Staff ({roleCounts.faculty} available)
                        </option>
                        <option value="ALL_ADMIN">
                          📢 All Administrators — Broadcast to all University Admin Officers & Provost ({roleCounts.admin} available)
                        </option>
                        {!isStudentUser && roleCounts.student > 0 && (
                          <option value="ALL_STUDENTS">
                            📢 All Students — Broadcast to all Enrolled Students ({roleCounts.student} available)
                          </option>
                        )}
                        <option value="ALL_MEMBERS">
                          📢 All Campus Members — University-Wide Broadcast
                        </option>
                      </optgroup>

                      <optgroup label={`👤 Individual Contacts (${eligibleRecipients.length} available)`}>
                        {eligibleRecipients.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — [{u.role.toUpperCase()}]{u.designation ? ` - ${u.designation}` : ''}{u.departmentName ? ` (${u.departmentName})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}

                  {/* HODs filter */}
                  {contactRoleFilter === 'hod' && (
                    <>
                      <optgroup label="📢 Broadcast Option">
                        <option value="ALL_HOD">
                          📢 All HODs — Broadcast to all Heads of Department ({roleCounts.hod} available)
                        </option>
                      </optgroup>
                      <optgroup label={`👤 Individual Heads of Department (${eligibleRecipients.length} available)`}>
                        {eligibleRecipients.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — [{u.role.toUpperCase()}]{u.designation ? ` - ${u.designation}` : ''}{u.departmentName ? ` (${u.departmentName})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}

                  {/* Faculty filter */}
                  {contactRoleFilter === 'teacher' && (
                    <>
                      <optgroup label="📢 Broadcast Option">
                        <option value="ALL_FACULTY">
                          📢 All Faculty — Broadcast to all Professors & Teaching Staff ({roleCounts.faculty} available)
                        </option>
                      </optgroup>
                      <optgroup label={`👤 Individual Faculty Members (${eligibleRecipients.length} available)`}>
                        {eligibleRecipients.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — [{u.role.toUpperCase()}]{u.designation ? ` - ${u.designation}` : ''}{u.departmentName ? ` (${u.departmentName})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}

                  {/* Admin filter */}
                  {contactRoleFilter === 'admin' && (
                    <>
                      <optgroup label="📢 Broadcast Option">
                        <option value="ALL_ADMIN">
                          📢 All Administrators — Broadcast to all University Admin Officers & Provost ({roleCounts.admin} available)
                        </option>
                      </optgroup>
                      <optgroup label={`👤 Individual Administrators (${eligibleRecipients.length} available)`}>
                        {eligibleRecipients.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — [{u.role.toUpperCase()}]{u.designation ? ` - ${u.designation}` : ''}{u.departmentName ? ` (${u.departmentName})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}

                  {/* Students filter */}
                  {contactRoleFilter === 'student' && (
                    <>
                      <optgroup label="📢 Broadcast Option">
                        <option value="ALL_STUDENTS">
                          📢 All Students — Broadcast to all Enrolled Students ({roleCounts.student} available)
                        </option>
                      </optgroup>
                      <optgroup label={`👤 Individual Students (${eligibleRecipients.length} available)`}>
                        {eligibleRecipients.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — [{u.role.toUpperCase()}]{u.enrollmentNo ? ` (${u.enrollmentNo})` : ''}{u.departmentName ? ` (${u.departmentName})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>

                {/* Broadcast Selection Helper Notice */}
                {selectedRecipientId.startsWith('ALL_') && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2 animate-in fade-in duration-150">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Group Broadcast Mode Active</strong>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        {selectedRecipientId === 'ALL_HOD' && `This message will be broadcast to all ${roleCounts.hod} Heads of Department across all faculties.`}
                        {selectedRecipientId === 'ALL_FACULTY' && `This message will be broadcast to all ${roleCounts.faculty} Teaching Staff and Professors.`}
                        {selectedRecipientId === 'ALL_ADMIN' && `This message will be broadcast to all ${roleCounts.admin} University Administrators and Provost.`}
                        {selectedRecipientId === 'ALL_STUDENTS' && `This message will be broadcast to all ${roleCounts.student} enrolled students.`}
                        {selectedRecipientId === 'ALL_MEMBERS' && `This message will be broadcast to the entire University Campus community.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Final Project Scope & Security Architecture Consultation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                {/* Subject Quick Fill Options */}
                {isStudentUser && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {PRESET_TOPICS.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSubject(p.subject);
                          if (!text) setText(p.text);
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 text-[10px] border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        + {p.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Private Message Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your confidential message..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setNewThreadModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRecipientId || !text.trim()}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    selectedRecipientId && text.trim()
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Start & Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Thread Confirmation Modal */}
      {deleteConfirmThreadId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete from Your Account?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This conversation will be removed only from your personal inbox and account view. The other participant(s) will continue to have their complete chat history intact.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmThreadId(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteActiveThread(deleteConfirmThreadId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserForProfile && (
        <UserProfileModal
          user={selectedUserForProfile}
          currentUser={user}
          onClose={() => setSelectedUserForProfile(null)}
          onSendMessage={(targetUser) => {
            setSelectedUserForProfile(null);
            handleDirectStartChatWithUser(targetUser);
          }}
        />
      )}
    </div>
  );
};
