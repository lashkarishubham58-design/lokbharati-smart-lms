import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  MessageSquare,
  Clock,
  CreditCard,
  Building2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ZoomIn,
  Briefcase,
  Lock,
  EyeOff,
  Shield
} from 'lucide-react';
import { User, Subject } from '../../types';
import { DEPARTMENTS, SUBJECTS, TIMETABLES, getStoredUsers } from '../../data/mockDatabase';
import { safeStorageGet } from '../../utils/storage';
import { ProfilePhotoViewerModal } from './ProfilePhotoViewerModal';
import { canCommunicate, getCommunicationPolicyMessage } from '../../utils/communicationRules';
import { formatStudentDisplayName } from '../../utils/studentNameUtils';
import { UserAvatar } from '../common/UserAvatar';
import { getResolvedAvatar, isCustomAvatar } from '../../utils/avatarUtils';

interface UserProfileModalProps {
  isOpen?: boolean;
  onClose: () => void;
  user: User | null;
  currentUser?: User | null;
  onSendMessage?: (recipientUser: User) => void;
  onViewTimetable?: (user: User) => void;
  onViewIDCard?: (user: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen = true,
  onClose,
  user: rawUser,
  currentUser,
  onSendMessage,
  onViewTimetable,
  onViewIDCard,
}) => {
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'contact'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !rawUser) return null;

  // Resolve user with latest storage updates
  const profilesMap = safeStorageGet<Record<string, Partial<User>>>('lbu_user_profiles', {});
  const cleanId = rawUser.id ? rawUser.id.trim() : '';
  const cleanEmail = rawUser.email ? rawUser.email.toLowerCase().trim() : '';
  const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
  const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');
  const empId = rawUser.employeeId ? rawUser.employeeId.trim() : '';

  const profileOverride =
    (cleanId && profilesMap[cleanId]) ||
    (cleanEmail && profilesMap[cleanEmail]) ||
    (normEmail1 && profilesMap[normEmail1]) ||
    (normEmail2 && profilesMap[normEmail2]) ||
    (empId && profilesMap[empId]) ||
    {};

  // Ensure override only applies valid non-empty string properties so original name is never truncated
  const sanitizedOverride: Partial<User> = {};
  for (const [k, v] of Object.entries(profileOverride)) {
    if (v !== undefined && v !== null && (typeof v !== 'string' || v.trim() !== '')) {
      if (k === 'avatar' && typeof v === 'string' && v.includes('images.unsplash.com') && rawUser.avatar) {
        continue;
      }
      (sanitizedOverride as any)[k] = v;
    }
  }

  const user: User = { ...rawUser, ...sanitizedOverride };

  const role = (user.role || 'student').toLowerCase();
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher' || role === 'faculty';
  const isHOD = role === 'hod';
  const isAdmin = role === 'admin';

  const isSelf = currentUser?.id === user.id;
  const isViewerStudent = (currentUser?.role || 'student').toLowerCase() === 'student';
  const isTargetStudent = isStudent;
  const isStudentToStudent = !isSelf && isViewerStudent && isTargetStudent;
  const displayName = isStudentToStudent ? formatStudentDisplayName(user.name) : user.name;
  const isCommunicationPermitted = !isSelf && currentUser ? canCommunicate(currentUser.role, user.role) : !isSelf;
  const policyMessage = currentUser ? getCommunicationPolicyMessage(currentUser.role, user.role) : '';

  const userDept = DEPARTMENTS.find((d) => d.id === user.departmentId || d.name === user.departmentName || d.code === user.departmentId);

  // Find relevant subjects
  const userSubjects = isStudent
    ? SUBJECTS.filter(
        (s) =>
          (!user.departmentId || s.departmentId === user.departmentId) &&
          (!user.semester || s.semester === user.semester)
      )
    : SUBJECTS.filter(
        (s) =>
          TIMETABLES.some((t) => t.subjectId === s.id && t.teacherName.toLowerCase().includes(user.name.toLowerCase())) ||
          (!user.departmentId || s.departmentId === user.departmentId)
      );

  // Find timetable slots
  const userSlots = TIMETABLES.filter((t) => {
    if (isStudent) {
      return (
        (!user.departmentId || t.departmentId === user.departmentId) &&
        (!user.semester || t.semester === user.semester)
      );
    }
    return t.teacherName?.toLowerCase().includes(user.name.toLowerCase());
  });

  const getRoleBadgeStyle = (r: string) => {
    if (r === 'admin') return 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-500/20';
    if (r === 'hod') return 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20';
    if (r === 'teacher' || r === 'faculty') return 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-1 ring-blue-500/20';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20';
  };

  const hasCustomAvatar = isCustomAvatar(user.avatar);
  const avatarUrl = getResolvedAvatar(user);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const idNumber = user.enrollmentNo || user.employeeId || (isStudent ? 'LBU-STU-001' : 'LBU-FAC-100');

  return (
    <div
      id="modal-user-profile-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-user-profile-container"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar - Clean and Non-Clipping */}
        <div className="relative px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${getRoleBadgeStyle(
                user.role
              )}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {user.role === 'hod' ? 'HOD / Department Head' : `${user.role} Profile`}
            </span>
            <span className="text-xs text-slate-300 font-bold hidden sm:inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Lokbharti University Directory
            </span>
          </div>

          <button
            id="btn-close-user-profile-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 shadow-md"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Main User Identity Card - 100% Unclipped, Fully Visible Avatar and Details */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800 relative overflow-hidden shadow-inner flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Profile Avatar Box */}
            <div
              id="user-profile-avatar-clickable"
              className="relative group cursor-pointer shrink-0 rounded-3xl p-1 bg-gradient-to-tr from-emerald-500/40 via-amber-500/30 to-purple-500/40 shadow-2xl"
              onClick={() => setPhotoViewerOpen(true)}
              title="Click to view full profile avatar"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-950 ring-4 ring-slate-900 relative flex items-center justify-center">
                <UserAvatar
                  name={displayName}
                  avatar={avatarUrl}
                  role={user.role}
                  size="custom"
                  className="w-full h-full text-3xl sm:text-4xl rounded-3xl group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover Overlay with Zoom Icon */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-extrabold gap-1 p-1 rounded-3xl">
                  <ZoomIn className="w-5 h-5 text-emerald-400" />
                  <span>View Avatar</span>
                </div>
              </div>

              {/* Verified Shield Badge */}
              <div
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-emerald-500 text-slate-950 rounded-full ring-4 ring-slate-900 shadow-xl flex items-center justify-center"
                title="Official Verified Academic Account"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Name, Designation, and Credentials */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                    {displayName}
                  </h2>
                  <p className="text-sm font-extrabold text-amber-300 dark:text-amber-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{user.designation || (isStudent ? 'Enrolled Student' : 'Assistant Professor & Faculty Member')}</span>
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{user.departmentName || userDept?.name || 'Department of Rural & Applied Sciences'}</span>
                  </p>
                </div>

                {/* Quick Header Actions */}
                <div className="flex items-center gap-2 justify-center sm:justify-end shrink-0 pt-1 sm:pt-0">
                  {!isSelf && (
                    isCommunicationPermitted ? (
                      <button
                        id="btn-user-profile-send-message"
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onSendMessage) {
                            onSendMessage(user);
                          }
                        }}
                        className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/40"
                        title={`Send Direct Campus Message to ${displayName}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Send Message</span>
                      </button>
                    ) : (
                      <div
                        id="badge-student-chat-restricted"
                        className="px-3 py-2 rounded-2xl bg-amber-950/50 border border-amber-800/70 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-help"
                        title="Direct student-to-student chat is restricted per university policy."
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Policy Restricted</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* ID & Attribute Pills */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => copyToClipboard(idNumber, 'id')}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Click to copy ID"
                >
                  <span>{isStudent ? 'ENROLL:' : 'EMP:'} {idNumber}</span>
                  {copiedField === 'id' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isStudent && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono shadow-sm">
                    Semester {user.semester || 3}
                  </span>
                )}

                {user.officeLocation && (
                  <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span>{user.officeLocation.split(',')[0]}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Overview & Bio</span>
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'academics'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subjects & Courses ({userSubjects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Official Contact</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {!isCommunicationPermitted && !isSelf && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">Communication Policy Notice</span>
                    <span>Student-to-student direct messaging is restricted by university policy. For academic coordination, students can directly contact assigned professors, department HODs, or the administrative cell.</span>
                  </div>
                </div>
              )}

              {/* Bio & Intro Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2 shadow-inner">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  About & Background
                </span>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  {user.bio
                    ? (isStudentToStudent ? user.bio.split(user.name).join(displayName) : user.bio)
                    : (isStudent
                      ? `${displayName} is an active student enrolled in ${
                          user.departmentName || 'Lokbharti University'
                        }, specializing in practical applied sciences, coursework projects, and experiential learning.`
                      : `${user.name} is a distinguished faculty member leading academic lectures, student mentorship, and departmental research in ${
                          user.departmentName || 'Lokbharti University'
                        }.`)}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Department Info */}
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    Department Code & Wing
                  </span>
                  <p className="font-mono text-emerald-400 font-black text-sm">
                    {userDept?.code || user.departmentId || 'BVOC-IT'}
                  </p>
                  <p className="text-slate-300 text-xs font-medium">
                    {userDept?.degreeFullName || user.departmentName || 'Bachelor of Vocation (Information Technology)'}
                  </p>
                </div>

                {/* Academic Role / Designation */}
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                    {isStudent ? 'Enrollment Status' : 'Academic Designation'}
                  </span>
                  <p className="text-white font-extrabold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{user.designation || (isStudent ? 'Active & In Good Standing' : 'Assistant Professor & Head')}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {isStudent ? 'Academic Year 2024-25' : 'Faculty of Computer Applications & Technology'}
                  </p>
                </div>

                {/* Educational Qualifications */}
                {user.qualification && (
                  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      Qualifications & Academic Degrees
                    </span>
                    <p className="text-white font-bold text-sm">
                      {user.qualification}
                    </p>
                  </div>
                )}

                {/* Office Location */}
                {user.officeLocation && (
                  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Office / Campus Location
                    </span>
                    <p className="text-white font-bold text-sm">
                      {user.officeLocation}
                    </p>
                  </div>
                )}

                {/* Joining / Membership Date */}
                {user.joiningDate && (
                  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {isStudent ? 'Admission / Enrollment Date' : 'University Appointment Date'}
                    </span>
                    <p className="text-white font-bold text-sm">
                      {user.joiningDate} • Lokbharti Gramvidyapith, Sanosara
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUBJECTS & COURSES */}
          {activeTab === 'academics' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  {isStudent ? 'Enrolled Subject Modules' : 'Assigned Teaching Curriculum & Courses'}
                </span>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-xl border border-purple-500/40">
                  {userSubjects.length} Courses Linked
                </span>
              </div>

              {userSubjects.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 text-center text-xs text-slate-400 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="font-semibold text-slate-300">No active subject modules linked to this profile.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {userSubjects.map((sub) => {
                    const facultyName = TIMETABLES.find((t) => t.subjectId === sub.id)?.teacherName || user.name || 'Faculty Assigned';
                    return (
                      <div
                        key={sub.code}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs hover:border-slate-600 transition-all shadow-xs"
                      >
                        <div className="min-w-0 pr-3 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                              {sub.code}
                            </span>
                            <span className="font-bold text-white text-sm">{sub.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium">
                            Semester {sub.semester} • {sub.credits} Academic Credits • {facultyName}
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono font-bold shrink-0 border border-slate-700">
                          {sub.credits * 2} Hrs/Wk
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT INFORMATION */}
          {activeTab === 'contact' && (
            <div className="space-y-3 text-xs">
              {/* Student-to-Student Privacy Alert */}
              {isStudentToStudent && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/70 flex items-start gap-3 text-amber-200">
                  <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block text-xs mb-1">
                      Student Privacy Protection Policy
                    </span>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      To protect student privacy and ensure digital safety, official email addresses and personal contact numbers of fellow students are hidden. For academic queries or coordination, please contact your course professor, Department HOD, or Class Representative.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Row */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Official University Email</span>
                    {isStudentToStudent ? (
                      <span className="font-mono text-slate-400 font-bold text-xs flex items-center gap-1.5 mt-0.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>••••••••@lokbhartiuniversity.edu.in</span>
                      </span>
                    ) : (
                      <span className="font-mono text-white font-bold text-sm block truncate">{user.email}</span>
                    )}
                  </div>
                </div>
                {!isStudentToStudent && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.email, 'email')}
                      className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`mailto:${user.email}`}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all flex items-center gap-1 shadow-md"
                    >
                      <span>Email</span>
                    </a>
                  </div>
                )}
                {isStudentToStudent && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-slate-500" />
                    <span>Protected</span>
                  </span>
                )}
              </div>

              {/* Phone Row */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Contact Number</span>
                    {isStudentToStudent ? (
                      <span className="font-mono text-slate-400 font-bold text-xs flex items-center gap-1.5 mt-0.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>+91 ••••• •••••</span>
                      </span>
                    ) : (
                      <span className="font-mono text-white font-bold text-sm block truncate">{user.phone || '+91 87892 87630'}</span>
                    )}
                  </div>
                </div>
                {!isStudentToStudent && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(user.phone || '+91 87892 87630', 'phone')}
                      className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`tel:${user.phone || '+918789287630'}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center gap-1 shadow-md"
                    >
                      <span>Call</span>
                    </a>
                  </div>
                )}
                {isStudentToStudent && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-slate-500" />
                    <span>Protected</span>
                  </span>
                )}
              </div>

              {/* In-App University Messaging */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">In-App Campus Messaging</span>
                    <span className="text-white font-bold text-sm block truncate">
                      {isCommunicationPermitted ? 'Direct Portal Chat Active' : 'Restricted (Student ↔ Student)'}
                    </span>
                  </div>
                </div>
                {!isSelf && (
                  isCommunicationPermitted ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onSendMessage) {
                          onSendMessage(user);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-extrabold shrink-0">
                      Policy Restricted
                    </span>
                  )
                )}
              </div>

              {/* Campus Location */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3.5 shadow-xs">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">University Campus</span>
                  <span className="text-white font-bold text-xs sm:text-sm">Lokbharti Gramvidyapith, Sanosara, Bhavnagar, Gujarat - 364230</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Verified Lokbharti University Profile
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all cursor-pointer border border-slate-700 shadow-md"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded High-Resolution Photo Viewer Modal */}
      <ProfilePhotoViewerModal
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        photoUrl={avatarUrl}
        userName={displayName}
        userRole={user.role}
        designation={user.designation}
        departmentName={user.departmentName}
        idNumber={idNumber}
      />
    </div>
  );
};
