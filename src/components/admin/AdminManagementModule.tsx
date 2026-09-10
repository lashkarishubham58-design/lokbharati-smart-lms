import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Shield,
  GraduationCap,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Mail,
  Phone,
  Briefcase,
  ShieldAlert,
  Award,
  History,
  RotateCcw,
  Archive,
  UserX,
  Clock,
  Eye
} from 'lucide-react';
import { User, UserRole, DeletedStudentRecord } from '../../types';
import {
  INITIAL_USERS,
  DEPARTMENTS,
  INITIAL_DELETED_STUDENTS,
  getStoredUsers,
  saveUserProfileOverride,
  softDeleteUserAccount,
  restoreUserAccount,
  purgeUserAccount
} from '../../data/mockDatabase';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';
import { UserProfileModal } from '../profile/UserProfileModal';
import { UserAvatar } from '../common/UserAvatar';
import { generateAlphabetAvatar } from '../../utils/avatarUtils';
import { AdminTimetableManagementModal } from './AdminTimetableManagementModal';
import { matchUserSmart } from '../../utils/searchMatching';

interface AdminManagementModuleProps {
  currentUser?: User | null;
  onAuditLog?: (action: string, details: string) => void;
  onSendMessageToUser?: (recipient: User) => void;
  onViewTimetable?: (user: User) => void;
  onViewIDCard?: (user: User) => void;
}

export const AdminManagementModule: React.FC<AdminManagementModuleProps> = ({
  currentUser,
  onAuditLog,
  onSendMessageToUser,
  onViewTimetable,
  onViewIDCard
}) => {
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [isTimetableManagerOpen, setIsTimetableManagerOpen] = useState(false);

  // Listen for real-time database user profile updates
  React.useEffect(() => {
    const handleUserUpdated = () => {
      setUsers(getStoredUsers());
    };
    window.addEventListener('lbu_user_updated', handleUserUpdated);
    return () => {
      window.removeEventListener('lbu_user_updated', handleUserUpdated);
    };
  }, []);

  // Save custom added users to LocalStorage with quota protection
  React.useEffect(() => {
    const initialUserIds = new Set(INITIAL_USERS.map((u) => u.id));
    const customUsers = users.filter((u) => !initialUserIds.has(u.id));
    safeStorageSet('lbu_custom_users', customUsers);
  }, [users]);

  // Soft-deleted records list state
  const [deletedRecordsList, setDeletedRecordsList] = useState<DeletedStudentRecord[]>(() => {
    return safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', [...INITIAL_DELETED_STUDENTS]);
  });

  // Purge confirmation modal state (replaces native confirm dialog)
  const [purgingRecord, setPurgingRecord] = useState<DeletedStudentRecord | null>(null);

  // Listen for global database / deleted records updates
  React.useEffect(() => {
    const handleDeletedUpdated = () => {
      const records = safeStorageGet<DeletedStudentRecord[]>('lbu_deleted_students', [...INITIAL_DELETED_STUDENTS]);
      if (Array.isArray(records)) {
        setDeletedRecordsList(records);
      }
    };
    window.addEventListener('lbu_deleted_records_updated', handleDeletedUpdated);
    window.addEventListener('storage', handleDeletedUpdated);
    return () => {
      window.removeEventListener('lbu_deleted_records_updated', handleDeletedUpdated);
      window.removeEventListener('storage', handleDeletedUpdated);
    };
  }, []);

  // Keyboard shortcut to close history modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDeletedHistoryOpen(false);
        setPurgingRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Deletion History Modal State
  const [isDeletedHistoryOpen, setIsDeletedHistoryOpen] = useState(false);
  const [deletedSearchQuery, setDeletedSearchQuery] = useState('');
  const [deletedRoleFilter, setDeletedRoleFilter] = useState('all');

  // Notification Banner State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addRole, setAddRole] = useState<UserRole>('student');
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addDepartmentId, setAddDepartmentId] = useState(DEPARTMENTS[0]?.id || 'dept_it');
  const [addSemester, setAddSemester] = useState<number>(1);
  const [addCustomId, setAddCustomId] = useState('');
  const [addDesignation, setAddDesignation] = useState('');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete Confirmation Modal State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState('');

  // Bulk Delete State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Quick Open Modal with pre-filled role
  const handleOpenAddModal = (role: UserRole) => {
    setAddRole(role);
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddDepartmentId(DEPARTMENTS[0]?.id || 'dept_it');
    setAddSemester(1);
    setAddCustomId('');
    if (role === 'student') setAddDesignation('Undergraduate Student');
    else if (role === 'teacher') setAddDesignation('Assistant Professor');
    else if (role === 'hod') setAddDesignation('Head of Department');
    else setAddDesignation('System Administrator');
    setAddModalOpen(true);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      showToast('error', 'Please provide a valid name and email address.');
      return;
    }

    const selectedDept = DEPARTMENTS.find((d) => d.id === addDepartmentId);
    const deptName = selectedDept ? selectedDept.name : 'Information Technology';

    const generatedEnrollment = addRole === 'student'
      ? (addCustomId.trim() || `2024CS${Math.floor(Math.random() * 8999 + 1000)}`)
      : undefined;

    const generatedEmployeeId = addRole !== 'student'
      ? (addCustomId.trim() || `LBU-FAC-${Math.floor(Math.random() * 899 + 100)}`)
      : undefined;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: addName.trim(),
      email: addEmail.trim(),
      phone: addPhone.trim() || '+91 98250 11000',
      role: addRole,
      departmentId: addDepartmentId,
      departmentName: deptName,
      semester: addRole === 'student' ? addSemester : undefined,
      enrollmentNo: generatedEnrollment,
      employeeId: generatedEmployeeId,
      designation: addDesignation || (addRole === 'student' ? 'Student' : 'Faculty Member'),
      joiningDate: new Date().toISOString().split('T')[0],
      avatar: generateAlphabetAvatar(addName.trim(), addRole),
    };

    const currentCustom = safeStorageGet<User[]>('lbu_custom_users', []);
    safeStorageSet('lbu_custom_users', [newUser, ...currentCustom.filter((u) => u.id !== newUser.id)]);

    setUsers([newUser, ...users]);
    setAddModalOpen(false);

    window.dispatchEvent(new CustomEvent('lbu_user_updated', { detail: { newUser } }));

    const roleTitle = addRole.toUpperCase();
    showToast('success', `Successfully provisioned new ${roleTitle} account for ${newUser.name}.`);
    if (onAuditLog) {
      onAuditLog('CREATE_USER', `Created new ${addRole} account for ${newUser.name} (${newUser.email})`);
    }
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser({ ...u });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const selectedDept = DEPARTMENTS.find((d) => d.id === editingUser.departmentId);
    const updatedUser: User = {
      ...editingUser,
      departmentName: selectedDept ? selectedDept.name : editingUser.departmentName,
      avatar: generateAlphabetAvatar(editingUser.name, editingUser.role),
    };

    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    saveUserProfileOverride(updatedUser.id, updatedUser.email, updatedUser);
    setEditingUser(null);
    showToast('success', `Updated user details for ${updatedUser.name}.`);
    if (onAuditLog) {
      onAuditLog('UPDATE_USER', `Updated user record for ${updatedUser.name} (${updatedUser.id})`);
    }
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    const userName = deletingUser.name;
    const userRole = deletingUser.role.toUpperCase();
    const userId = deletingUser.id;
    const userEmail = deletingUser.email;
    const reason = deleteReasonInput.trim() || 'Administrative user account deletion';

    const activeUser = safeStorageGet<User | null>('lbu_user', null);
    // Soft delete / archive to Deletion History and remove from active database/roster
    const deletedRecord = softDeleteUserAccount(
      deletingUser,
      reason,
      activeUser?.name ? `${activeUser.name} (Admin)` : 'System Administrator',
      'admin'
    );

    setUsers((prev) => prev.filter((u) => u.id !== userId && (!userEmail || u.email !== userEmail)));
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    setDeletedRecordsList((prev) => [deletedRecord, ...prev.filter((r) => r.id !== userId)]);
    setDeletingUser(null);
    setDeleteReasonInput('');

    showToast('success', `Account for "${userName}" (${userRole}) moved to Delete History. Active login access disabled.`);

    if (onAuditLog) {
      onAuditLog('DELETE_USER', `Deleted & archived ${deletingUser.role} record for ${userName} (${userEmail}) to Delete History. Reason: ${reason}`);
    }
  };

  const confirmBulkDeleteUsers = () => {
    if (selectedUserIds.length === 0) return;
    const count = selectedUserIds.length;
    const usersToDelete = users.filter((u) => selectedUserIds.includes(u.id));
    const activeUser = safeStorageGet<User | null>('lbu_user', null);

    const newDeletedRecords: DeletedStudentRecord[] = [];
    usersToDelete.forEach((u) => {
      const rec = softDeleteUserAccount(
        u,
        'Bulk administrative deletion',
        activeUser?.name ? `${activeUser.name} (Admin)` : 'System Administrator',
        'admin'
      );
      newDeletedRecords.push(rec);
    });

    setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
    setDeletedRecordsList((prev) => [...newDeletedRecords, ...prev.filter((r) => !selectedUserIds.includes(r.id))]);
    setSelectedUserIds([]);
    setBulkDeleteModalOpen(false);

    showToast('success', `Bulk action: Successfully removed ${count} user account(s) and saved to Delete History.`);

    if (onAuditLog) {
      onAuditLog('BULK_DELETE_USERS', `Bulk removed ${count} user accounts to Delete History.`);
    }
  };

  const handleRestoreUserRecord = (rec: DeletedStudentRecord) => {
    if (!rec || !rec.id) return;
    const restoredUser = restoreUserAccount(rec.id, rec.email);
    setDeletedRecordsList((prev) => prev.filter((r) => r.id !== rec.id));
    if (restoredUser) {
      setUsers((prev) => [
        restoredUser,
        ...prev.filter(
          (u) =>
            u.id.toLowerCase().trim() !== rec.id.toLowerCase().trim() &&
            (!rec.email || u.email.toLowerCase().trim() !== rec.email.toLowerCase().trim())
        ),
      ]);
    }
    showToast('success', `Restored ${rec.role.toUpperCase()} account for "${rec.name}". Record returned to active roster.`);
    if (onAuditLog) {
      onAuditLog('RESTORE_USER', `Restored ${rec.role} record for ${rec.name} (${rec.email}) back to active roster.`);
    }
  };

  const handlePurgeUserRecord = (rec: DeletedStudentRecord) => {
    setPurgingRecord(rec);
  };

  const confirmPurgeUserRecord = () => {
    if (!purgingRecord) return;
    const rec = purgingRecord;
    purgeUserAccount(rec.id, rec.email);
    setDeletedRecordsList((prev) => prev.filter((r) => r.id !== rec.id));
    setUsers((prev) => prev.filter((u) => u.id !== rec.id && u.email !== rec.email));
    showToast('error', `Permanently purged record for "${rec.name}". Access permanently revoked.`);
    if (onAuditLog) {
      onAuditLog('PURGE_USER', `Permanently purged record for ${rec.name} (${rec.email}). Access revoked.`);
    }
    setPurgingRecord(null);
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Matches across all roles for active search and department filter
  const allRoleMatches = users.filter((u) => {
    const matchesQuery = !search.trim() || matchUserSmart(u, search.trim());
    const matchesDept = deptFilter === 'all' || u.departmentId === deptFilter;
    return matchesQuery && matchesDept;
  });

  // Filtered users for current role filter
  const filteredUsers = allRoleMatches.filter((u) => {
    return roleFilter === 'all' || u.role === roleFilter;
  });

  // Role-specific match counters for active search query
  const searchMatchCounts = {
    all: allRoleMatches.length,
    student: allRoleMatches.filter((u) => u.role === 'student').length,
    teacher: allRoleMatches.filter((u) => u.role === 'teacher').length,
    hod: allRoleMatches.filter((u) => u.role === 'hod').length,
    admin: allRoleMatches.filter((u) => u.role === 'admin').length,
  };

  // KPI Counters (total in database)
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalHODs = users.filter((u) => u.role === 'hod').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  // Other roles that contain matches when current role tab has 0 matches
  const otherMatchingRoles = roleFilter !== 'all' && filteredUsers.length === 0 && search.trim() ? (
    [
      searchMatchCounts.hod > 0 ? { role: 'hod', label: 'HODs', count: searchMatchCounts.hod } : null,
      searchMatchCounts.teacher > 0 ? { role: 'teacher', label: 'Teachers', count: searchMatchCounts.teacher } : null,
      searchMatchCounts.student > 0 ? { role: 'student', label: 'Students', count: searchMatchCounts.student } : null,
      searchMatchCounts.admin > 0 ? { role: 'admin', label: 'Admins', count: searchMatchCounts.admin } : null,
    ].filter(Boolean) as { role: UserRole; label: string; count: number }[]
  ) : [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-900 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              User & Role Management (RBAC)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision, manage, edit, and remove official accounts for Students, Teachers, HODs, and Administrators.
          </p>
        </div>

        {/* Quick Add & Delete Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {users.length > 0 && (
            <button
              onClick={() => {
                if (selectedUserIds.length === users.length) {
                  setSelectedUserIds([]);
                } else {
                  setSelectedUserIds(users.map((u) => u.id));
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="Select or deselect all user accounts"
            >
              <UserX className="w-4 h-4 text-purple-400" />
              <span>{selectedUserIds.length === users.length ? 'Deselect All' : `Select All (${users.length})`}</span>
            </button>
          )}

          {selectedUserIds.length > 0 && (
            <button
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all animate-pulse cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {selectedUserIds.length === users.length ? `Delete ALL Accounts (${users.length})` : `Delete Selected (${selectedUserIds.length})`}
            </button>
          )}

          <button
            onClick={() => handleOpenAddModal('student')}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            + Add Student
          </button>

          <button
            onClick={() => handleOpenAddModal('teacher')}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            + Add Teacher
          </button>

          <button
            onClick={() => handleOpenAddModal('hod')}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4" />
            + Add HOD
          </button>

          <button
            onClick={() => handleOpenAddModal('admin')}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            + Add Admin
          </button>

          <button
            id="btn-admin-manage-timetables"
            type="button"
            onClick={() => setIsTimetableManagerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-purple-400/30 select-none"
            title="Manage, Add, Edit and Delete Timetables for all Departments & Semesters"
          >
            <Clock className="w-4 h-4 text-purple-200" />
            <span>Manage Timetables</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-black">
              All Depts
            </span>
          </button>

          <button
            id="btn-admin-delete-history"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDeletedHistoryOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 select-none"
            title="View History of Deleted Accounts"
          >
            <History className="w-4 h-4 text-rose-400" />
            <span>Delete History</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-mono font-black">
              {deletedRecordsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Click to filter, click active card again to reset to All) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          id="stat-card-admin-students"
          onClick={() => setRoleFilter((prev) => (prev === 'student' ? 'all' : 'student'))}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            roleFilter === 'student'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
          title={roleFilter === 'student' ? 'Click to deselect (Show all roles)' : 'Click to filter Students only'}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Students</span>
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalStudents}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-bold text-emerald-600">Active Enrolled Students</span>
            {roleFilter === 'student' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold">Active</span>
            )}
          </div>
        </div>

        <div
          id="stat-card-admin-teachers"
          onClick={() => setRoleFilter((prev) => (prev === 'teacher' ? 'all' : 'teacher'))}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            roleFilter === 'teacher'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
          title={roleFilter === 'teacher' ? 'Click to deselect (Show all roles)' : 'Click to filter Teachers only'}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Teachers</span>
            <UserCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalTeachers}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-bold text-blue-600">Subject Professors</span>
            {roleFilter === 'teacher' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-extrabold">Active</span>
            )}
          </div>
        </div>

        <div
          id="stat-card-admin-hods"
          onClick={() => setRoleFilter((prev) => (prev === 'hod' ? 'all' : 'hod'))}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            roleFilter === 'hod'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
          title={roleFilter === 'hod' ? 'Click to deselect (Show all roles)' : 'Click to filter HODs only'}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total HODs</span>
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalHODs}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-bold text-amber-600">Department Heads</span>
            {roleFilter === 'hod' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold">Active</span>
            )}
          </div>
        </div>

        <div
          id="stat-card-admin-admins"
          onClick={() => setRoleFilter((prev) => (prev === 'admin' ? 'all' : 'admin'))}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            roleFilter === 'admin'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
          title={roleFilter === 'admin' ? 'Click to deselect (Show all roles)' : 'Click to filter Admins only'}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Admins</span>
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalAdmins}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] font-bold text-purple-600">System Administrators</span>
            {roleFilter === 'admin' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold">Active</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-admin-user-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, role..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>All Roles</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold">
                {search.trim() ? searchMatchCounts.all : users.length}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter((prev) => (prev === 'student' ? 'all' : 'student'))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleFilter === 'student'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Students</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  roleFilter === 'student'
                    ? 'bg-emerald-700 text-white'
                    : searchMatchCounts.student > 0 && search.trim()
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {search.trim() ? searchMatchCounts.student : totalStudents}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter((prev) => (prev === 'teacher' ? 'all' : 'teacher'))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleFilter === 'teacher'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Teachers</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  roleFilter === 'teacher'
                    ? 'bg-blue-700 text-white'
                    : searchMatchCounts.teacher > 0 && search.trim()
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {search.trim() ? searchMatchCounts.teacher : totalTeachers}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter((prev) => (prev === 'hod' ? 'all' : 'hod'))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleFilter === 'hod'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>HODs</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  roleFilter === 'hod'
                    ? 'bg-amber-700 text-white'
                    : searchMatchCounts.hod > 0 && search.trim()
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {search.trim() ? searchMatchCounts.hod : totalHODs}
              </span>
            </button>

            <button
              onClick={() => setRoleFilter((prev) => (prev === 'admin' ? 'all' : 'admin'))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleFilter === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Admins</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  roleFilter === 'admin'
                    ? 'bg-purple-700 text-white'
                    : searchMatchCounts.admin > 0 && search.trim()
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {search.trim() ? searchMatchCounts.admin : totalAdmins}
              </span>
            </button>
          </div>

          {/* Department Filter Dropdown */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cross-Role Search Discovery Callout Banner */}
      {otherMatchingRoles.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
            <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              No {roleFilter === 'admin' ? 'Admins' : roleFilter === 'hod' ? 'HODs' : roleFilter === 'teacher' ? 'Teachers' : 'Students'} found matching <strong>"{search}"</strong>. However, <strong>{allRoleMatches.length} matching {allRoleMatches.length === 1 ? 'account' : 'accounts'}</strong> were found in other roles!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setRoleFilter('all')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              View All {allRoleMatches.length} Results
            </button>
            {otherMatchingRoles.map((om) => (
              <button
                key={om.role}
                onClick={() => setRoleFilter(om.role)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {om.label} ({om.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Users Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredUsers.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching user accounts found
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {search.trim() ? (
                  <>
                    No accounts matched <strong>"{search}"</strong> under the current {roleFilter === 'all' ? 'all-roles' : `"${roleFilter}"`} filter{deptFilter !== 'all' ? ` and selected department` : ''}.
                  </>
                ) : (
                  <>No accounts found in this role or department filter. Click an "+ Add" button above to provision new accounts.</>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {roleFilter !== 'all' && (
                  <button
                    onClick={() => setRoleFilter('all')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Switch to All Roles
                  </button>
                )}
                {deptFilter !== 'all' && (
                  <button
                    onClick={() => setDeptFilter('all')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Clear Department Filter
                  </button>
                )}
                {search.trim() && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-6 w-10">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id))}
                        onChange={() => {
                          const allSelected = filteredUsers.every((u) => selectedUserIds.includes(u.id));
                          if (allSelected) {
                            setSelectedUserIds((prev) => prev.filter((id) => !filteredUsers.some((u) => u.id === id)));
                          } else {
                            const newIds = filteredUsers.map((u) => u.id);
                            setSelectedUserIds((prev) => Array.from(new Set([...prev, ...newIds])));
                          }
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">User / Account Name</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Identifier (ID / Enrollment)</th>
                    <th className="p-3.5">Contact Phone</th>
                    <th className="p-3.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedUserIds.includes(u.id) ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 pl-6">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => toggleSelectUser(u.id)}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      {/* User Name + Avatar */}
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        <div
                          onClick={() => setSelectedUserForProfile(u)}
                          className="flex items-center gap-3 cursor-pointer group/user select-none"
                          title={`Click to view full profile of ${u.name}`}
                        >
                          <div className="relative shrink-0">
                            <UserAvatar
                              name={u.name}
                              avatar={u.avatar}
                              role={u.role}
                              size="md"
                              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 group-hover/user:ring-2 group-hover/user:ring-purple-500 transition-all text-xs"
                            />
                            <div className="absolute inset-0 bg-purple-900/30 rounded-full opacity-0 group-hover/user:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover/user:text-purple-600 dark:group-hover/user:text-purple-400 transition-colors flex items-center gap-1.5">
                              <span>{u.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                              {u.designation || (u.role === 'student' ? `Sem ${u.semester || 1} Student` : 'Faculty Member')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'student'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : u.role === 'teacher'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : u.role === 'hod'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">
                        {u.departmentName || 'Information Technology'}
                      </td>

                      {/* Enrollment / Employee ID */}
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap font-bold">
                        {u.role === 'student' ? u.enrollmentNo || 'N/A' : u.employeeId || 'N/A'}
                      </td>

                      {/* Contact Phone */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{u.phone || '+91 98250 11000'}</div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserForProfile(u)}
                            title="View Full Person Profile"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:text-slate-400 dark:hover:text-emerald-400 transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit User Details"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Remove User Account"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< md) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`p-3.5 transition-colors ${
                    selectedUserIds.includes(u.id) ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => toggleSelectUser(u.id)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer shrink-0 mt-0.5"
                      />
                      <div
                        onClick={() => setSelectedUserForProfile(u)}
                        className="flex items-center gap-2.5 cursor-pointer min-w-0"
                      >
                        <UserAvatar
                          name={u.name}
                          avatar={u.avatar}
                          role={u.role}
                          size="md"
                          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 text-xs"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {u.designation || (u.role === 'student' ? `Sem ${u.semester || 1} Student` : 'Faculty Member')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        u.role === 'student'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : u.role === 'teacher'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : u.role === 'hod'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Dept</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                        {u.departmentName || 'Information Tech'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Identifier</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {u.role === 'student' ? u.enrollmentNo || 'N/A' : u.employeeId || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 pt-1">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      {u.phone || '+91 98250 11000'}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedUserForProfile(u)}
                        title="View Full Person Profile"
                        className="px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        title="Edit User Details"
                        className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        title="Remove User Account"
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Provision New {addRole.toUpperCase()} Account
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    User Role
                  </label>
                  <select
                    value={addRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setAddRole(r);
                      if (r === 'student') setAddDesignation('Undergraduate Student');
                      else if (r === 'teacher') setAddDesignation('Assistant Professor');
                      else if (r === 'hod') setAddDesignation('Head of Department');
                      else setAddDesignation('System Administrator');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="hod">HOD (Head of Department)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={addDepartmentId}
                    onChange={(e) => setAddDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. anand.kumar@lokbhartiuniversity.edu.in"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Conditional Fields: Semester or Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addRole === 'student' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Semester
                    </label>
                    <select
                      value={addSemester}
                      onChange={(e) => setAddSemester(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Designation
                    </label>
                    <input
                      type="text"
                      value={addDesignation}
                      onChange={(e) => setAddDesignation(e.target.value)}
                      placeholder="e.g. Assistant Professor"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {addRole === 'student' ? 'Enrollment No (Optional)' : 'Employee ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={addCustomId}
                    onChange={(e) => setAddCustomId(e.target.value)}
                    placeholder={addRole === 'student' ? 'e.g. 2024CS9901 (Auto if blank)' : 'e.g. LBU-FAC-402 (Auto if blank)'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="+91 98250 xxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md"
                >
                  Create {addRole.toUpperCase()} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit User Account: {editingUser.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={editingUser.departmentId}
                    onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div
          id="modal-delete-user-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeletingUser(null);
              setDeleteReasonInput('');
            }
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Move User to Delete History
                </h3>
                <p className="text-xs text-slate-500">Archive Record & Disable Login Access</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{deletingUser.name}</div>
              <div className="text-slate-500 font-mono">{deletingUser.email}</div>
              <div className="text-slate-500">
                Role: <span className="font-bold uppercase text-purple-600">{deletingUser.role}</span> • Dept: {deletingUser.departmentName}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Removal (Archived in History)
              </label>
              <input
                type="text"
                placeholder="e.g. Administrative removal, Graduation, Resignation"
                value={deleteReasonInput}
                onChange={(e) => setDeleteReasonInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
              <strong>Audit Preservation:</strong> This user will be removed from active rosters and login will be disabled. The record will be saved in <strong className="underline">Delete History</strong> where it can be inspected or restored at any time.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteReasonInput('');
                }}
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-user"
                type="button"
                onClick={confirmDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Move to History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete User Confirmation Modal */}
      {bulkDeleteModalOpen && (
        <div
          id="modal-bulk-delete-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBulkDeleteModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Bulk Move to Delete History
                </h3>
                <p className="text-xs text-slate-500">Archive Selected Accounts to History</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1 text-xs text-rose-900 dark:text-rose-200">
              <div className="font-extrabold">Moving {selectedUserIds.length} user account(s) to Delete History.</div>
              <p className="text-[11px] opacity-90">
                All selected accounts will be removed from active rosters and archived in Delete History for administrative auditing or recovery.
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to proceed with moving these {selectedUserIds.length} accounts to Delete History?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-bulk-delete-users"
                type="button"
                onClick={confirmBulkDeleteUsers}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move {selectedUserIds.length} Users to History</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion History Modal */}
      {isDeletedHistoryOpen && (
        <div
          id="modal-admin-delete-history-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeletedHistoryOpen(false);
          }}
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white p-6 flex items-start justify-between border-b border-rose-900/40 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shrink-0 border border-rose-400/30">
                  <History className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">Deleted Accounts History Log</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 font-extrabold text-xs">
                      {deletedRecordsList.length} Archived Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Official audit archive for removed user accounts (Students, Teachers, HODs, Admins). Review deletion reasons, restore user accounts back to active roster, or permanently purge records.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDeletedHistoryOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Control & Search Bar */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search deleted by name, email, reason..."
                  value={deletedSearchQuery}
                  onChange={(e) => setDeletedSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                />
                {deletedSearchQuery && (
                  <button
                    onClick={() => setDeletedSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={deletedRoleFilter}
                  onChange={(e) => setDeletedRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="text-xs text-slate-500 font-bold hidden md:block">
                  Matching: {
                    deletedRecordsList.filter((rec) => {
                      const query = deletedSearchQuery.toLowerCase().trim();
                      const matchesSearch = !query || rec.name.toLowerCase().includes(query) || rec.email.toLowerCase().includes(query) || rec.reason.toLowerCase().includes(query);
                      const matchesRole = deletedRoleFilter === 'all' || rec.role === deletedRoleFilter;
                      return matchesSearch && matchesRole;
                    }).length
                  } record(s)
                </div>
              </div>
            </div>

            {/* Modal List Area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              {deletedRecordsList.length === 0 ? (
                <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Archive className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No Deleted User Records Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When accounts are removed, they will appear here in Deletion History where they can be restored or permanently purged.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletedRecordsList([...INITIAL_DELETED_STUDENTS]);
                      safeStorageSet('lbu_deleted_students', [...INITIAL_DELETED_STUDENTS]);
                      showToast('info', 'Loaded archived sample audit deletion records.');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Sample Archive Records</span>
                  </button>
                </div>
              ) : (
                deletedRecordsList
                  .filter((rec) => {
                    const query = deletedSearchQuery.toLowerCase().trim();
                    const matchesSearch = !query || rec.name.toLowerCase().includes(query) || rec.email.toLowerCase().includes(query) || rec.reason.toLowerCase().includes(query);
                    const matchesRole = deletedRoleFilter === 'all' || rec.role === deletedRoleFilter;
                    return matchesSearch && matchesRole;
                  })
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-400/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-sm flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-800">
                            <UserX className="w-5 h-5 text-rose-600" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">{rec.name}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 uppercase">
                                {rec.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">
                              {rec.enrollmentNo !== 'N/A' ? `ID: ${rec.enrollmentNo}` : rec.departmentName} • {rec.departmentName}
                            </p>
                          </div>
                        </div>

                        {/* Deletion Audit Callout Box */}
                        <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <span className="text-rose-900 dark:text-rose-300 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-rose-600" />
                              Deleted At: <strong>{rec.deletedAt}</strong>
                            </span>
                            <span className="text-slate-600 dark:text-slate-300 font-bold">
                              Deleted By: <strong className="text-slate-900 dark:text-white">{rec.deletedBy}</strong>
                            </span>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 font-medium italic">
                            "{rec.reason}"
                          </p>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 md:flex-col md:items-end">
                        <button
                          id={`btn-restore-user-${rec.id}`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRestoreUserRecord(rec);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer select-none ring-offset-2 focus:ring-2 focus:ring-emerald-500"
                          title="Restore user account back to active roster"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Restore Account</span>
                        </button>

                        <button
                          id={`btn-purge-user-${rec.id}`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePurgeUserRecord(rec);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-none"
                          title="Permanently purge record from system database"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Purge</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500 font-medium">
                Records remain in Delete History until permanently Purged or Restored.
              </p>
              <button
                onClick={() => setIsDeletedHistoryOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold text-xs shadow-md cursor-pointer"
              >
                Close History Log
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Permanent Purge Confirmation Modal */}
      {purgingRecord && (
        <div
          id="modal-purge-confirmation-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPurgingRecord(null);
          }}
          className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-800">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Permanently Purge Account?
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">Irreversible Action</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p>
                <strong>User:</strong> {purgingRecord.name} ({purgingRecord.email})
              </p>
              <p>
                <strong>Role:</strong> <span className="uppercase font-bold">{purgingRecord.role}</span>
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to <strong>permanently purge</strong> this record? This action cannot be undone and login access for this account will be permanently blocked.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-cancel-purge-user"
                type="button"
                onClick={() => setPurgingRecord(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-purge-user"
                type="button"
                onClick={confirmPurgeUserRecord}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Person Profile Modal (Accessible for Any Selected User) */}
      {selectedUserForProfile && (
        <UserProfileModal
          isOpen={!!selectedUserForProfile}
          onClose={() => setSelectedUserForProfile(null)}
          user={selectedUserForProfile}
          currentUser={currentUser}
          onSendMessage={onSendMessageToUser}
          onViewTimetable={onViewTimetable}
          onViewIDCard={onViewIDCard}
        />
      )}

      {/* Admin Timetable Management Modal */}
      {isTimetableManagerOpen && (
        <AdminTimetableManagementModal
          isOpen={isTimetableManagerOpen}
          onClose={() => setIsTimetableManagerOpen(false)}
          currentUser={currentUser}
          onAuditLog={onAuditLog}
        />
      )}
    </div>
  );
};

