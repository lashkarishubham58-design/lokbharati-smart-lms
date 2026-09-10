import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  MapPin,
  ShieldCheck,
  Check,
  UserX,
  Mail,
  KeyRound,
  Send,
  Sparkles
} from 'lucide-react';
import { User } from '../../types';
import { DEPARTMENTS, softDeleteUserAccount, saveUserProfileOverride } from '../../data/mockDatabase';
import { getActiveUserPassword } from '../../data/credentials';
import { safeStorageGet } from '../../utils/storage';
import { mockOtpService } from '../../services/mockOtpService';
import { ProfilePhotoViewerModal } from './ProfilePhotoViewerModal';
import { UserAvatar } from '../common/UserAvatar';
import { getResolvedAvatar, generateAlphabetAvatar } from '../../utils/avatarUtils';

interface ProfileModuleProps {
  user: User;
  onUpdatePassword?: (newPassword: string, otp?: string, targetEmail?: string) => { success: boolean; error?: string } | void;
  onUpdateProfile?: (updated: Partial<User>) => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  user,
  onUpdatePassword,
  onUpdateProfile,
}) => {
  const isStudent = user.role?.toLowerCase() === 'student';

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [useOtpVerification, setUseOtpVerification] = useState(false);
  const [profileOtp, setProfileOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Editable Profile Form Fields
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '+91 98250 11223');
  const [designation, setDesignation] = useState(
    user.designation || (isStudent ? 'Student' : 'Academic Director')
  );
  const [departmentId, setDepartmentId] = useState(user.departmentId || DEPARTMENTS[0]?.id || 'dept_it');
  const [avatar, setAvatar] = useState(() => getResolvedAvatar(user));
  const [officeLocation, setOfficeLocation] = useState(user.officeLocation || 'Admin Block, Ground Floor, Room 102');
  const [qualification, setQualification] = useState(user.qualification || '');
  const [address, setAddress] = useState(user.address || '');
  const [bio, setBio] = useState(user.bio || '');

  // Sync state whenever user prop updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '+91 98250 11223');
      setDesignation(user.designation || (isStudent ? 'Student' : 'Academic Director'));
      setDepartmentId(user.departmentId || DEPARTMENTS[0]?.id || 'dept_it');
      setAvatar(getResolvedAvatar(user));
      if (user.officeLocation) setOfficeLocation(user.officeLocation);
      if (user.qualification) setQualification(user.qualification);
      if (user.address) setAddress(user.address);
      setBio(user.bio || '');
    }
  }, [user, isStudent]);

  // Full-Size Profile Photo Viewer Modal State & Long-Press Handling
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const startPress = () => {
    setIsPressing(true);
    isLongPressTriggeredRef.current = false;
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setPhotoViewerOpen(true);
      setIsPressing(false);
    }, 380);
  };

  const cancelPress = () => {
    setIsPressing(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Open photo viewer on click/tap
    setPhotoViewerOpen(true);
    isLongPressTriggeredRef.current = false;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const finalName = isStudent ? (user.name || name.trim()) : name.trim();
    const finalEmail = isStudent ? (user.email || email.trim()) : email.trim();
    const finalDesignation = isStudent ? (user.designation || 'Student') : designation.trim();

    if (!finalName) {
      setProfileError('Full Name cannot be empty.');
      return;
    }

    if (!finalEmail || !finalEmail.includes('@')) {
      setProfileError('Please enter a valid university email address.');
      return;
    }

    const selectedDept = DEPARTMENTS.find((d) => d.id === departmentId);
    const deptName = selectedDept ? selectedDept.name : user.departmentName;
    const lockedAvatar = generateAlphabetAvatar(finalName, user.role);

    const updatedData: Partial<User> = {
      name: finalName,
      email: finalEmail,
      phone: phone.trim(),
      designation: finalDesignation,
      departmentId,
      departmentName: deptName,
      avatar: lockedAvatar,
      officeLocation: officeLocation.trim(),
      qualification: qualification.trim(),
      address: address.trim(),
      bio: bio.trim(),
    };

    setAvatar(lockedAvatar);

    // Write directly to database storage
    saveUserProfileOverride(user.id, user.email, updatedData);

    if (onUpdateProfile) {
      onUpdateProfile(updatedData);
    }

    setIsEditingProfile(false);
    setProfileSuccess('Your profile details have been successfully updated in database!');
    setTimeout(() => setProfileSuccess(''), 5000);
  };

  const handleSendProfileOtp = async () => {
    setIsSendingOtp(true);
    setPasswordError('');
    setOtpSentMessage('');
    try {
      const res = await mockOtpService.requestPasswordResetOtp(user.email);
      setOtpSentMessage(res.message || `A 6-digit OTP code has been dispatched to ${user.email}.`);
      setUseOtpVerification(true);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to dispatch email verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Check old password against current active password
    const currentActivePassword = getActiveUserPassword(user);

    if (!oldPassword || oldPassword !== currentActivePassword) {
      setPasswordError('Current password is incorrect.');
      return;
    }

    // Check minimum length
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    // Check match
    if (newPassword !== confirmPassword) {
      setPasswordError(
        `New password (${newPassword.length} chars) and Confirm password (${confirmPassword.length} chars) do not match.`
      );
      return;
    }

    // If OTP verification was requested, verify OTP
    if (useOtpVerification) {
      if (!profileOtp || profileOtp.trim().length !== 6) {
        setPasswordError('Please enter the 6-digit verification code sent to your email.');
        return;
      }
      const verifyRes = mockOtpService.verifyOtp(user.email, profileOtp.trim());
      if (!verifyRes.success) {
        setPasswordError(verifyRes.error || 'Invalid or expired OTP verification code.');
        return;
      }
    }

    // Update password with verification step
    if (onUpdatePassword) {
      const res = onUpdatePassword(newPassword, profileOtp ? profileOtp.trim() : undefined, user.email);
      if (res && !res.success) {
        setPasswordError(res.error || 'Failed to update password.');
        return;
      }
    }

    setPasswordSuccess('Password updated successfully! Your new credentials are active.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setProfileOtp('');
    setOtpSentMessage('');
    setUseOtpVerification(false);
    setTimeout(() => setPasswordSuccess(''), 5000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Permanent Alphabet Avatar Display */}
            <div
              id="profile-avatar-container"
              className={`relative group cursor-pointer select-none transition-all duration-200 ${
                isPressing ? 'scale-95 brightness-90' : 'hover:scale-[1.02]'
              }`}
              onClick={handleAvatarClick}
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onTouchCancel={cancelPress}
              title="Click or press and hold to view full profile details"
            >
              <UserAvatar
                id="profile-avatar-img"
                name={name || user.name}
                avatar={avatar}
                role={user.role}
                size="2xl"
                className="w-24 h-24 ring-4 ring-purple-500/20 shadow-md group-hover:brightness-95"
              />
              <div
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-slate-900/90 text-white shadow-md border border-slate-700/80 z-10"
                title="Institutional Permanent Avatar (Role-Based)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {user.role}
                </span>
              </div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {user.designation || (isStudent ? 'Student' : 'System Administrator')}
              </p>
              <p className="text-xs text-slate-500">{user.departmentName || 'University Administration'}</p>
            </div>
          </div>

          {/* Edit Profile Toggle Button */}
          <button
            onClick={() => {
              setIsEditingProfile(!isEditingProfile);
              setProfileError('');
              setProfileSuccess('');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
              isEditingProfile
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
            }`}
          >
            {isEditingProfile ? (
              <>
                <X className="w-4 h-4" /> Cancel Edit
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" /> Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Edit Success/Error Alerts */}
      {profileSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {/* Main Profile Form / Details View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information (Editable or Read-only View) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-600" /> Administrative Profile Information
            </h3>
            {isEditingProfile && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                Editing Mode Active
              </span>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Permanent Institutional Avatar Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={name || user.name}
                    avatar={avatar}
                    role={user.role}
                    size="lg"
                    className="w-12 h-12 ring-2 ring-purple-500/30 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                      <span>Institutional Alphabet Avatar</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                        Permanent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Standardized role-based gradient format. Automatically preserved in database.
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 shrink-0" title="Avatar is permanent and immutable">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  {isStudent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Read-only (Student record)
                    </span>
                  )}
                </div>
                {isStudent ? (
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={name}
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed select-none font-medium"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Official Email *
                    </label>
                    {isStudent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                  {isStudent ? (
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed select-none font-mono"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  ) : (
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Designation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Designation / Title
                  </label>
                  {isStudent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Fixed (Student)
                    </span>
                  )}
                </div>
                {isStudent ? (
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value="Student"
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed select-none font-medium"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. System Administrator"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                )}
              </div>

              {/* Office Location & Qualification - Only for faculty and admin staff */}
              {!isStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Office Location
                    </label>
                    <input
                      type="text"
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. Ph. D."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official / Campus Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Lokbharati University for Rural Innovation, Sanosara."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isStudent ? 'Student Bio / Summary' : 'Administrative Summary / Bio'}
                  </label>
                  {bio ? (
                    <button
                      type="button"
                      onClick={() => setBio('')}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-1"
                      title="Clear Administrative Summary / Bio"
                    >
                      <X className="w-3 h-3" /> Remove Bio
                    </button>
                  ) : null}
                </div>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={isStudent ? 'Enter student bio/summary...' : 'Enter administrative summary/bio...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="min-w-0">
                  <span className="text-slate-400 block font-semibold text-[11px]">Official Email</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white block truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block font-semibold text-[11px]">Phone Number</span>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    {user.phone || '+91 98250 11223'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="min-w-0">
                  <span className="text-slate-400 block font-semibold text-[11px]">
                    {isStudent ? 'Role / Status' : 'Designation'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white block truncate" title={user.designation || (isStudent ? 'Student' : 'System Administrator')}>
                    {user.designation || (isStudent ? 'Enrolled Student' : 'System Administrator')}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block font-semibold text-[11px]">
                    {isStudent ? 'Enrollment No / ID' : 'Employee / Admin ID'}
                  </span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 block truncate">
                    {user.enrollmentNo || user.employeeId || (isStudent ? 'LBU-STU-2024-001' : 'LBU-ADMIN-001')}
                  </span>
                </div>
              </div>

              {/* Qualification & Office Location - Only shown for non-students */}
              {!isStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="min-w-0 space-y-1">
                    <span className="text-slate-400 block font-semibold text-[11px]">Academic Qualification</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {user.qualification || qualification || 'Ph. D.'}
                    </span>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <span className="text-slate-400 block font-semibold text-[11px]">Office Room Location</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{officeLocation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {(user.address || address) && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <span className="text-slate-400 block font-semibold text-[11px]">Official Campus Address</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {user.address || address}
                  </p>
                </div>
              )}

              {bio && bio.trim() ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <span className="text-slate-400 block font-semibold text-[11px]">
                    {isStudent ? 'Student Summary' : 'Administrative Summary'}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-xs">{bio}</p>
                </div>
              ) : null}

              {!isStudent && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Account has full system-wide administrative access & auditing rights.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 id="profile-change-password-heading" className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Lock className="w-4 h-4" />
              </div>
              <span>Change Password</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              Active Security
            </span>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showOld ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Optional/Enforced 2FA Email OTP Verification */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>Email OTP Verification</span>
                </label>
                <button
                  type="button"
                  onClick={handleSendProfileOtp}
                  disabled={isSendingOtp}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingOtp ? 'Sending...' : 'Send OTP to Email'}</span>
                </button>
              </div>

              {otpSentMessage && (
                <div className="mb-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{otpSentMessage}</span>
                </div>
              )}

              {useOtpVerification && (
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={profileOtp}
                    onChange={(e) => setProfileOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-Digit Email OTP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700/60 text-xs font-mono tracking-widest text-center text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-center">
                    Simulated email dispatched to {user.email} (check notifications or top banner)
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
            >
              Update Security Password
            </button>
          </form>
        </div>
      </div>

      {/* Full-Size Profile Photo Viewer Modal (Triggered on Long-Press / Photo Click) */}
      <ProfilePhotoViewerModal
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        photoUrl={avatar}
        userName={name || user.name}
        userRole={user.role}
        designation={designation || user.designation}
        departmentName={user.departmentName}
        idNumber={user.enrollmentNo || user.employeeId}
      />
    </div>
  );
};

