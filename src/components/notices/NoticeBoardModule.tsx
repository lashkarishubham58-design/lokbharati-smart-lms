import React, { useState, useEffect, useRef } from 'react';
import { BellRing, Plus, Pin, AlertCircle, Calendar, Tag, Sparkles, CheckCheck, Eye, Radio, Zap, Check, Trash2, ArrowDown, GraduationCap, Briefcase, Building2, Home, CreditCard, Award, Megaphone, HelpCircle, FileEdit, Send, BookmarkPlus } from 'lucide-react';
import { User, Notice, NoticeType } from '../../types';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';

export interface NoticeDraft {
  id: string;
  title: string;
  content: string;
  category: NoticeType;
  targetDepartmentId: string;
  isPinned: boolean;
  savedAt: string;
  savedBy: string;
  savedByName: string;
}

export interface NoticeCategoryDef {
  id: NoticeType;
  label: string;
  icon: string;
  badgeStyle: string;
  description?: string;
}

export const NOTICE_CATEGORIES: NoticeCategoryDef[] = [
  { id: 'academic', label: 'Academic', icon: '📚', badgeStyle: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300/50' },
  { id: 'exam', label: 'Examination', icon: '📝', badgeStyle: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300/50' },
  { id: 'admission', label: 'Admission', icon: '🎓', badgeStyle: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300/50' },
  { id: 'scholarship', label: 'Scholarship', icon: '🏆', badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300/50' },
  { id: 'events', label: 'Events & Activities', icon: '🎉', badgeStyle: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300/50' },
  { id: 'placement', label: 'Placement & Career', icon: '💼', badgeStyle: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300/50' },
  { id: 'department', label: 'Department', icon: '🏛️', badgeStyle: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300/50' },
  { id: 'hostel', label: 'Hostel & Student Affairs', icon: '🏠', badgeStyle: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300/50' },
  { id: 'finance', label: 'Fees & Finance', icon: '💳', badgeStyle: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300/50' },
  { id: 'general', label: 'General / Important', icon: '📢', badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300/50' },
  { id: 'other', label: 'Other', icon: '📌', badgeStyle: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300/50' },
];

export interface NoticeDepartmentOption {
  id: string;
  name: string;
  shortName: string;
  group: 'Campus Wide' | 'Academic Departments';
}

export const NOTICE_DEPARTMENTS: NoticeDepartmentOption[] = [
  { id: 'all', name: 'All Departments (University-Wide / Campus-Wide)', shortName: 'All Departments', group: 'Campus Wide' },
  { id: 'dept_it', name: 'Information Technology (B.Voc IT)', shortName: 'Information Technology', group: 'Academic Departments' },
  { id: 'dept_brs_agronomy', name: 'Agronomy (BRS)', shortName: 'Agronomy', group: 'Academic Departments' },
  { id: 'dept_brs_ahds', name: 'Animal Husbandry & Dairy Science (BRS)', shortName: 'Animal Husbandry & Dairy', group: 'Academic Departments' },
  { id: 'dept_brs_horti', name: 'Horticulture (BRS)', shortName: 'Horticulture', group: 'Academic Departments' },
  { id: 'dept_bvoc_nf', name: 'Natural Farming (B.Voc NF)', shortName: 'Natural Farming', group: 'Academic Departments' },
  { id: 'dept_bvoc_afp', name: 'Agro-Food Processing (B.Voc AFP)', shortName: 'Agro-Food Processing', group: 'Academic Departments' },
  { id: 'dept_bba', name: 'Bachelor of Business Administration (BBA)', shortName: 'Business Administration', group: 'Academic Departments' },
  { id: 'dept_ba_english', name: 'Department of English (B.A. English)', shortName: 'Department of English', group: 'Academic Departments' },
];

export function getNoticeCategoryMeta(category: string): NoticeCategoryDef {
  const found = NOTICE_CATEGORIES.find((c) => c.id === category);
  if (found) return found;
  if (category === 'vacancy') {
    return { id: 'placement', label: 'Placement & Career', icon: '💼', badgeStyle: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300/50' };
  }
  if (category === 'urgent') {
    return { id: 'general', label: 'General / Urgent Alert', icon: '🚨', badgeStyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300/50' };
  }
  return { id: 'other', label: category || 'Other', icon: '📌', badgeStyle: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300/50' };
}

interface NoticeBoardModuleProps {
  user: User;
  notices: Notice[];
  readNoticeIds: string[];
  highlightedNoticeId?: string | null;
  onCreateNotice: (notice: Partial<Notice>) => void;
  onDeleteNotice?: (noticeId: string) => void;
  onMarkNoticeAsRead: (noticeId: string) => void;
  onMarkAllNoticesAsRead: () => void;
  onSimulateNotice?: () => void;
}

export const NoticeBoardModule: React.FC<NoticeBoardModuleProps> = ({
  user,
  notices = [],
  readNoticeIds = [],
  highlightedNoticeId,
  onCreateNotice,
  onDeleteNotice,
  onMarkNoticeAsRead,
  onMarkAllNoticesAsRead,
  onSimulateNotice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(highlightedNoticeId || null);

  useEffect(() => {
    if (highlightedNoticeId) {
      setActiveHighlightId(highlightedNoticeId);
      setSelectedCategory('all');
      setSelectedDepartmentFilter('all');

      // Scroll smoothly to notice card after paint
      setTimeout(() => {
        const el = document.getElementById(`notice-card-${highlightedNoticeId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Dismiss highlight pulse after 6 seconds
      const timer = setTimeout(() => {
        setActiveHighlightId(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [highlightedNoticeId]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeType>('general');
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>(() => {
    if (user?.role === 'hod' && user?.departmentId) return user.departmentId;
    return 'all';
  });
  const [isPinned, setIsPinned] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Drafts State
  const [drafts, setDrafts] = useState<NoticeDraft[]>(() => {
    return safeStorageGet<NoticeDraft[]>('lbu_notice_drafts', [
      {
        id: 'draft_sample_1',
        title: 'Draft: Mid-Semester Examination Guidelines & Seating Layout',
        content: 'All faculty members are requested to submit two sets of question papers by August 25. Detailed student seating allotment will be finalized next week.',
        category: 'exam',
        targetDepartmentId: 'all',
        isPinned: false,
        savedAt: '2026-08-18T14:30:00.000Z',
        savedBy: user?.id || 'admin_1',
        savedByName: user?.name || 'Administrator',
      }
    ]);
  });

  const saveDraftsToStorage = (updatedDrafts: NoticeDraft[]) => {
    setDrafts(updatedDrafts);
    safeStorageSet('lbu_notice_drafts', updatedDrafts);
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim()) {
      alert('Please enter at least a title or description before saving as draft.');
      return;
    }

    const draftObj: NoticeDraft = {
      id: activeDraftId || `draft_${Date.now()}`,
      title: title.trim() || 'Untitled Notice Draft',
      content: content.trim(),
      category,
      targetDepartmentId,
      isPinned,
      savedAt: new Date().toISOString(),
      savedBy: user.id,
      savedByName: user.name,
    };

    let updated: NoticeDraft[];
    if (activeDraftId) {
      updated = drafts.map((d) => (d.id === activeDraftId ? draftObj : d));
    } else {
      updated = [draftObj, ...drafts];
    }

    saveDraftsToStorage(updated);
    setCreateModalOpen(false);
    setActiveDraftId(null);
    setTitle('');
    setContent('');
    alert('Notice draft saved successfully! You can review and publish it from the Drafts tab.');
  };

  const handleDeleteDraft = (draftId: string) => {
    if (confirm('Are you sure you want to discard this saved draft?')) {
      const updated = drafts.filter((d) => d.id !== draftId);
      saveDraftsToStorage(updated);
      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }
    }
  };

  const handleResumeDraft = (draft: NoticeDraft) => {
    setActiveDraftId(draft.id);
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category);
    setTargetDepartmentId(draft.targetDepartmentId || 'all');
    setIsPinned(draft.isPinned);
    setCreateModalOpen(true);
  };

  const handleDirectPublishDraft = (draft: NoticeDraft) => {
    const isDepartmentNotice = draft.category === 'department';
    const selectedDept = isDepartmentNotice ? NOTICE_DEPARTMENTS.find((d) => d.id === draft.targetDepartmentId) : null;
    const finalDeptName = isDepartmentNotice 
      ? (draft.targetDepartmentId === 'all' ? 'All Departments' : selectedDept?.shortName || selectedDept?.name || 'Department')
      : undefined;

    onCreateNotice({
      title: draft.title,
      content: draft.content,
      category: draft.category,
      targetAudience: 'students',
      departmentId: isDepartmentNotice && draft.targetDepartmentId !== 'all' ? draft.targetDepartmentId : undefined,
      departmentName: finalDeptName,
      postedBy: user.id,
      postedByName: user.name,
      postedByRole: user.role.toUpperCase(),
      isPinned: draft.isPinned,
    });

    const updated = drafts.filter((d) => d.id !== draft.id);
    saveDraftsToStorage(updated);
    alert('Draft published successfully to the campus notice board!');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isDepartmentNotice = category === 'department';
    const selectedDept = isDepartmentNotice ? NOTICE_DEPARTMENTS.find((d) => d.id === targetDepartmentId) : null;
    const finalDeptName = isDepartmentNotice 
      ? (targetDepartmentId === 'all' ? 'All Departments' : selectedDept?.shortName || selectedDept?.name || 'Department')
      : undefined;

    onCreateNotice({
      title,
      content,
      category,
      targetAudience: 'students',
      departmentId: isDepartmentNotice && targetDepartmentId !== 'all' ? targetDepartmentId : undefined,
      departmentName: finalDeptName,
      postedBy: user.id,
      postedByName: user.name,
      postedByRole: user.role.toUpperCase(),
      isPinned,
    });

    if (activeDraftId) {
      const updated = drafts.filter((d) => d.id !== activeDraftId);
      saveDraftsToStorage(updated);
      setActiveDraftId(null);
    }

    setCreateModalOpen(false);
    setTitle('');
    setContent('');
    setCategory('general');
    setTargetDepartmentId(user?.role === 'hod' && user?.departmentId ? user.departmentId : 'dept_it');
    setIsPinned(false);
  };

  const unreadCount = notices.filter((n) => !readNoticeIds.includes(n.id)).length;

  const filteredNotices = (notices || []).filter((n) => {
    // 1. Category filter
    let matchesCategory = true;
    if (selectedCategory === 'unread') {
      matchesCategory = !readNoticeIds.includes(n.id);
    } else if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'placement') {
      matchesCategory = n.category === 'placement' || (n.category as string) === 'vacancy';
    } else if (selectedCategory === 'general') {
      matchesCategory = n.category === 'general' || (n.category as string) === 'urgent';
    } else {
      matchesCategory = n.category === selectedCategory;
    }

    if (!matchesCategory) return false;

    // 2. Department filter
    if (selectedDepartmentFilter !== 'all') {
      const selectedDeptObj = NOTICE_DEPARTMENTS.find((d) => d.id === selectedDepartmentFilter);
      const deptShort = selectedDeptObj?.shortName.toLowerCase() || '';
      const noticeDept = (n.departmentName || '').toLowerCase();

      const matchesDept =
        n.departmentId === selectedDepartmentFilter ||
        (deptShort && noticeDept.includes(deptShort)) ||
        noticeDept.includes('all departments') ||
        noticeDept.includes('campus-wide');

      if (!matchesDept) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <BellRing className="w-6 h-6" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Official University Notice Board
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20 animate-pulse">
                <Sparkles className="w-3 h-3" />
                {unreadCount} UNREAD {unreadCount === 1 ? 'NOTICE' : 'NOTICES'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
            Official circulars, departmental updates, exam schedules, scholarships, placement drives, and administrative alerts for Lokbharti Gramvidyapith.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter Dropdown */}
          <select
            id="notice-department-filter-select"
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            title="Filter notices by target department"
          >
            <option value="all">🏛️ All Departments & Scope</option>
            <optgroup label="Academic Departments">
              <option value="dept_it">Information Technology (B.Voc IT)</option>
              <option value="dept_brs_agronomy">Agronomy (BRS)</option>
              <option value="dept_brs_ahds">Animal Husbandry & Dairy (BRS)</option>
              <option value="dept_brs_horti">Horticulture (BRS)</option>
              <option value="dept_bvoc_nf">Natural Farming (B.Voc NF)</option>
              <option value="dept_bvoc_afp">Agro-Food Processing (B.Voc AFP)</option>
              <option value="dept_bba">Business Administration (BBA)</option>
              <option value="dept_ba_english">Department of English (B.A. English)</option>
            </optgroup>
          </select>

          {/* Quick Filter Dropdown */}
          <select
            id="notice-category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            title="Filter notices by category"
          >
            <option value="all">All Published ({notices.length})</option>
            <option value="unread">🔥 Unread Notices ({unreadCount})</option>
            {user.role !== 'student' && (
              <option value="drafts">📝 Saved Drafts ({drafts.length})</option>
            )}
            {NOTICE_CATEGORIES.map((c) => {
              const count = notices.filter((n) => {
                if (c.id === 'placement') return n.category === 'placement' || (n.category as string) === 'vacancy';
                if (c.id === 'general') return n.category === 'general' || (n.category as string) === 'urgent';
                return n.category === c.id;
              }).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label} ({count})
                </option>
              );
            })}
          </select>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllNoticesAsRead}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Mark all notices as read"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              Mark All Read
            </button>
          )}

          {/* Test Toast Trigger */}
          {onSimulateNotice && (
            <button
              onClick={onSimulateNotice}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/30 transition-all cursor-pointer"
              title="Trigger a live notice toast notification"
            >
              <Zap className="w-4 h-4 text-indigo-500 animate-bounce" />
              Simulate Notice Toast
            </button>
          )}

          {/* Post Notice Button */}
          {(user.role === 'admin' || user.role === 'hod' || user.role === 'teacher') && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              id="post-notice-btn"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Post Notice
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          All ({notices.length})
        </button>

        {unreadCount > 0 && (
          <button
            onClick={() => setSelectedCategory('unread')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedCategory === 'unread'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            🔥 Unread ({unreadCount})
          </button>
        )}

        {/* Drafts Tab for Faculty & Admins */}
        {user.role !== 'student' && (
          <button
            onClick={() => setSelectedCategory('drafts')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedCategory === 'drafts'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Drafts</span>
            {drafts.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedCategory === 'drafts' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {drafts.length}
              </span>
            )}
          </button>
        )}

        {NOTICE_CATEGORIES.map((c) => {
          const count = notices.filter((n) => {
            if (c.id === 'placement') return n.category === 'placement' || (n.category as string) === 'vacancy';
            if (c.id === 'general') return n.category === 'general' || (n.category as string) === 'urgent';
            return n.category === c.id;
          }).length;
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DRAFTS LIST (When Drafts tab is active) */}
      {selectedCategory === 'drafts' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <BookmarkPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Notice Drafts & Unpublished Announcements ({drafts.length})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Drafts are saved locally and are visible only to faculty and administrators until published.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveDraftId(null);
                setTitle('');
                setContent('');
                setCategory('general');
                setCreateModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Draft</span>
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <BookmarkPlus className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No saved drafts found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When composing a notice, click "Save as Draft" to keep partially written announcements for later review and publishing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const catMeta = getNoticeCategoryMeta(draft.category);
                return (
                  <div
                    key={draft.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300/40 dark:border-amber-700/40 shadow-sm space-y-3 hover:border-amber-400 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <BookmarkPlus className="w-3 h-3 text-amber-500" /> DRAFT
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${catMeta.badgeStyle}`}>
                          <span>{catMeta.icon}</span>
                          <span>{catMeta.label}</span>
                        </span>
                        {draft.isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/50 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Saved: {new Date(draft.savedAt).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {draft.title || 'Untitled Draft'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
                        {draft.content || '(No content written yet)'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-slate-500">
                        Saved by: <strong className="text-slate-700 dark:text-slate-300">{draft.savedByName}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Discard draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResumeDraft(draft)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          title="Open editor to modify this draft"
                        >
                          <FileEdit className="w-3.5 h-3.5 text-blue-500" /> Resume & Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPublishDraft(draft)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                          title="Publish this draft directly to the notice board"
                        >
                          <Send className="w-3.5 h-3.5" /> Publish Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notice List */}
      {selectedCategory !== 'drafts' && (
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <BellRing className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No notices match your selection
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try switching your category filter or check back later for new announcements.
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isRead = readNoticeIds.includes(notice.id);
            const isHighlighted = activeHighlightId === notice.id;
            const catMeta = getNoticeCategoryMeta(notice.category);

            return (
              <div
                key={notice.id}
                id={`notice-card-${notice.id}`}
                onClick={() => {
                  if (!isRead) onMarkNoticeAsRead(notice.id);
                  if (isHighlighted) setActiveHighlightId(null);
                }}
                className={`p-6 rounded-3xl border transition-all space-y-3 relative cursor-pointer group ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-500 shadow-2xl ring-4 ring-amber-500/20 scale-[1.01]'
                    : !isRead
                    ? 'bg-gradient-to-r from-emerald-50/80 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800/60 shadow-md ring-1 ring-emerald-500/20'
                    : notice.isPinned
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-500/30 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Notice Top Meta Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* OPENED FROM NOTIFICATION BADGE */}
                    {isHighlighted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse">
                        <Sparkles className="w-3 h-3" /> OPENED FROM NOTIFICATION
                      </span>
                    )}

                    {/* NEW UNREAD BADGE */}
                    {!isRead && !isHighlighted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 text-white shadow-sm shadow-emerald-500/30 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" /> NEW
                      </span>
                    )}

                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                        <Pin className="w-3 h-3 text-amber-500 fill-current" /> Pinned
                      </span>
                    )}

                    {/* Category Pill - Student Category */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${catMeta.badgeStyle}`}
                      title="Student Notice Category"
                    >
                      <span>{catMeta.icon}</span>
                      <span>{catMeta.label}</span>
                    </span>

                    {/* Addressed Department Badge - Shown when Department category or specific unit is targeted */}
                    {(notice.category === 'department' || (notice.departmentName && !notice.departmentName.includes('All Departments') && !notice.departmentName.includes('Campus-Wide'))) && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
                      >
                        <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>🏛️ {notice.departmentName || 'Department'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{notice.date}</span>

                    {/* Quick Read/Unread Status & Delete Button */}
                    {!isRead ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkNoticeAsRead(notice.id);
                        }}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 cursor-pointer"
                        title="Click to mark notice as read"
                      >
                        <Check className="w-3 h-3" /> Mark Read
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Read
                      </span>
                    )}

                    {(user.role === 'admin' || user.role === 'hod' || notice.postedBy === user.id) && onDeleteNotice && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingNotice(notice);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Notice Posting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Content */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notice.content}
                </p>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div>
                    Posted by:{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {notice.postedByName}
                    </span>{' '}
                    ({notice.postedByRole})
                  </div>
                  {!isRead && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Tap to view & mark read
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Post Notice Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-500" />
                {activeDraftId ? 'Editing Notice Draft' : 'Publish New University Notice'}
              </h3>
              {activeDraftId && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30">
                  Draft Mode
                </span>
              )}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Monsoon Semester Final Assessment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notice Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Complete announcement text..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className={`grid gap-4 ${category === 'department' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Notice Category
                    </label>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      🎓 Applies to Students
                    </span>
                  </div>
                  <select
                    id="new-notice-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer font-medium"
                  >
                    <option value="academic">📚 Academic</option>
                    <option value="exam">📝 Examination</option>
                    <option value="admission">🎓 Admission</option>
                    <option value="scholarship">🏆 Scholarship</option>
                    <option value="events">🎉 Events & Activities</option>
                    <option value="placement">💼 Placement & Career</option>
                    <option value="department">🏛️ Department</option>
                    <option value="hostel">🏠 Hostel & Student Affairs</option>
                    <option value="finance">💳 Fees & Finance</option>
                    <option value="general">📢 General / Important</option>
                    <option value="other">📌 Other</option>
                  </select>
                </div>

                {/* Adjacent Dropdown - Appears ONLY when Department category is selected */}
                {category === 'department' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Addressed Department / Specific Unit
                    </label>
                    <select
                      id="new-notice-department-select"
                      value={targetDepartmentId}
                      onChange={(e) => setTargetDepartmentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer font-medium"
                    >
                      <option value="all">🌐 All Departments (Campus-Wide)</option>
                      <optgroup label="🏛️ Academic Departments">
                        <option value="dept_it">Information Technology (B.Voc IT)</option>
                        <option value="dept_brs_agronomy">Agronomy (BRS)</option>
                        <option value="dept_brs_ahds">Animal Husbandry & Dairy (BRS)</option>
                        <option value="dept_brs_horti">Horticulture (BRS)</option>
                        <option value="dept_bvoc_nf">Natural Farming (B.Voc NF)</option>
                        <option value="dept_bvoc_afp">Agro-Food Processing (B.Voc AFP)</option>
                        <option value="dept_bba">Business Administration (BBA)</option>
                        <option value="dept_ba_english">Department of English (B.A. English)</option>
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  Pin Notice to Top of Notice Board
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setActiveDraftId(null);
                  }}
                  className="px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Save current progress as a draft"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" /> Save as Draft
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Notice Confirmation Modal */}
      {deletingNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Notice Posting</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 font-medium">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deletingNotice.title}"</strong> from the official university notice board?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingNotice(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteNotice && deletingNotice) {
                    onDeleteNotice(deletingNotice.id);
                  }
                  setDeletingNotice(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
