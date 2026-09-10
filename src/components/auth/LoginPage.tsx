import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Check
} from 'lucide-react';
import { UserRole } from '../../types';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { unpurgeOrReactivateAccount, getStoredUsers, saveUserProfileOverride } from '../../data/mockDatabase';
import {
  findUserCredential,
  getActiveUserPassword,
  saveActiveUserPassword,
  cleanIdentifier,
  normalizeEmailDomain,
  AUTH_CREDENTIALS
} from '../../data/credentials';
import { useLoading } from '../../context/LoadingContext';
import { safeStorageGet, safeStorageSet } from '../../utils/storage';
import { mockOtpService } from '../../services/mockOtpService';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { withLoading } = useLoading();
  const [email, setEmail] = useState('shubham.lashkari@lokbhartiuniversity.edu.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [personalRecoveryEmail, setPersonalRecoveryEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'otp' | 'reset' | 'success'>('request');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isResettingPass, setIsResettingPass] = useState<boolean>(false);
  const [showWebmailDrawer, setShowWebmailDrawer] = useState<boolean>(false);
  const [webmailDeliveries, setWebmailDeliveries] = useState<Array<{ id: string; subject: string; time: string; code: string; email: string }>>([]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoginError(null);

    const trimmedEmail = email.trim();
    // Strict Lowercase Check: If email address contains capital letters, reject and show error
    if (trimmedEmail.includes('@') && /[A-Z]/.test(trimmedEmail)) {
      setLoginError("Invalid Email Case: University email address must be in lowercase only. Capital letters are not allowed (e.g., 'shubham.lashkari@lokbhartiuniversity.edu.in').");
      return;
    }

    setIsSubmitting(true);
    try {
      await withLoading(async () => {
        // Small delay for smooth authentication flow
        await new Promise((resolve) => setTimeout(resolve, 350));
        onLogin(email, password);
      }, 'Authenticating & Loading Academic Portal...');
    } catch (err: any) {
      setLoginError(err.message || 'Access Denied: Incorrect credentials provided.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setForgotEmail(email || '');
    setPersonalRecoveryEmail('');
    setForgotStep('request');
    setForgotError(null);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setEnteredOtp('');
    setOtpSentNotice(null);
    setIsOtpVerified(false);
    setShowWebmailDrawer(false);
    setForgotPasswordOpen(true);
  };

  const requestEmailOtp = async (targetEmail: string, recoveryEmail?: string) => {
    setIsSendingOtp(true);
    setForgotError(null);
    try {
      // Find registered user account (handles uppercase, typos, ID numbers)
      const users = getStoredUsers();
      const match = findUserCredential(targetEmail, users);
      const effectiveEmail = match.matchedUser?.email || match.credential?.email || targetEmail;

      // Trigger mock OTP service email simulation
      const result = await mockOtpService.requestPasswordResetOtp(effectiveEmail, recoveryEmail);

      setEnteredOtp('');
      setIsOtpVerified(false);
      setResendCooldown(60);
      setOtpSentNotice(result.message || `A 6-digit verification code has been sent to your email inbox.`);
      setForgotStep('otp');

      // Update webmail deliveries log
      const allMails = mockOtpService.getSimulatedEmails(effectiveEmail);
      setWebmailDeliveries(
        allMails.map((m) => ({
          id: m.id,
          subject: m.subject,
          time: m.timestamp,
          code: m.otp,
          email: m.to,
        }))
      );
    } catch (err: any) {
      setForgotError(err.message || 'Unable to dispatch OTP. Please check your email.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleForgotVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const cleanForgot = forgotEmail.trim();
    if (cleanForgot.includes('@') && /[A-Z]/.test(cleanForgot)) {
      setForgotError("Invalid Email Case: University email address must be in lowercase only without capital letters (e.g., 'shubham.lashkari@lokbhartiuniversity.edu.in').");
      return;
    }
    const users = getStoredUsers();
    const match = findUserCredential(forgotEmail, users);
    const resolvedTarget = match.matchedUser?.email || match.credential?.email || forgotEmail;
    await requestEmailOtp(resolvedTarget, personalRecoveryEmail);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanInput = enteredOtp.replace(/\D/g, '').trim();
    if (cleanInput.length !== 6) {
      setForgotError('Please enter the 6-digit code received in your email.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const users = getStoredUsers();
      const match = findUserCredential(forgotEmail, users);
      const targetEmail = match.matchedUser?.email || match.credential?.email || forgotEmail;

      let verified = false;
      let lastErrorMessage = '';

      // 1. Check local OTP service
      const verifyRes = mockOtpService.verifyOtp(targetEmail, cleanInput);
      if (verifyRes.success) {
        verified = true;
      } else {
        lastErrorMessage = verifyRes.error || '';
      }

      // 2. Also verify against backend server endpoint if not yet verified
      if (!verified) {
        try {
          const resp = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, otp: cleanInput }),
          });
          const data = await resp.json();
          if (resp.ok && data.success) {
            verified = true;
            mockOtpService.markEmailVerified(targetEmail, true);
          } else if (data.error) {
            lastErrorMessage = data.error;
          }
        } catch {
          // ignore network failure if offline
        }
      }

      if (!verified) {
        throw new Error(lastErrorMessage || 'Invalid or expired OTP code.');
      }

      setIsOtpVerified(true);
      setForgotError(null);
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError(err.message || 'OTP verification failed. Please check your email.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    handleForgotVerifyEmail({ preventDefault: () => {} } as React.FormEvent);
  };

  const fetchWebmailInbox = async () => {
    try {
      const users = getStoredUsers();
      const match = findUserCredential(forgotEmail, users);
      const targetEmail = match.matchedUser?.email || match.credential?.email || forgotEmail;

      const localMails = mockOtpService.getSimulatedEmails(targetEmail);
      const localFormatted = localMails.map((m) => ({
        id: m.id,
        subject: m.subject,
        time: m.timestamp,
        code: m.otp,
        email: m.to,
      }));

      try {
        const res = await fetch(`/api/auth/email-inbox?email=${encodeURIComponent(targetEmail)}`);
        const data = await res.json();
        if (data.deliveries && Array.isArray(data.deliveries) && data.deliveries.length > 0) {
          // Merge local and server deliveries avoiding duplicates
          const seen = new Set<string>();
          const merged: Array<{ id: string; email: string; subject: string; time: string; code: string }> = [];
          for (const item of [...localFormatted, ...data.deliveries]) {
            const key = `${item.code}_${item.email}`;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }
          setWebmailDeliveries(merged);
          return;
        }
      } catch {
        // use local
      }

      setWebmailDeliveries(localFormatted);
    } catch (e) {
      // fallback
    }
  };

  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!isOtpVerified) {
      setForgotError('Email OTP verification is required before setting a new password.');
      setForgotStep('otp');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New password and confirm password do not match.');
      return;
    }

    setIsResettingPass(true);
    try {
      const users = getStoredUsers();
      const match = findUserCredential(forgotEmail, users);
      const targetEmail = match.matchedUser?.email || match.credential?.email || forgotEmail;
      const cleanEmail = targetEmail.toLowerCase().trim();
      const normEmail1 = cleanEmail.replace('lokbharatiuniversity', 'lokbhartiuniversity');
      const normEmail2 = cleanEmail.replace('lokbhartiuniversity', 'lokbharatiuniversity');
      const rawForgot = forgotEmail.toLowerCase().trim();
      const cleanId = cleanIdentifier(rawForgot);

      // 1. Immediately persist to client credentials engine and storage
      saveActiveUserPassword(cleanEmail, forgotNewPassword);
      saveActiveUserPassword(normEmail1, forgotNewPassword);
      saveActiveUserPassword(normEmail2, forgotNewPassword);
      saveActiveUserPassword(rawForgot, forgotNewPassword);
      saveActiveUserPassword(cleanId, forgotNewPassword);

      if (match.matchedUser?.id) {
        saveActiveUserPassword(match.matchedUser.id, forgotNewPassword);
      }
      if (match.matchedUser?.enrollmentNo) {
        saveActiveUserPassword(match.matchedUser.enrollmentNo, forgotNewPassword);
      }
      if (match.credential?.id) {
        saveActiveUserPassword(match.credential.id, forgotNewPassword);
      }

      // 2. Direct storage map update
      const passMap = safeStorageGet<Record<string, string>>('lbu_user_passwords', {});
      passMap[cleanEmail] = forgotNewPassword;
      passMap[normEmail1] = forgotNewPassword;
      passMap[normEmail2] = forgotNewPassword;
      passMap[rawForgot] = forgotNewPassword;
      passMap[cleanId] = forgotNewPassword;
      if (match.matchedUser?.id) passMap[match.matchedUser.id.trim()] = forgotNewPassword;
      if (match.matchedUser?.enrollmentNo) passMap[match.matchedUser.enrollmentNo.trim()] = forgotNewPassword;
      safeStorageSet('lbu_user_passwords', passMap);

      // 3. Save profile override
      saveUserProfileOverride(match.matchedUser?.id || match.credential?.id || cleanId, targetEmail, {
        password: forgotNewPassword,
      });

      // 4. Also notify server endpoint (graceful, non-blocking failure)
      try {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: targetEmail,
            otp: enteredOtp.replace(/\D/g, '').trim(),
            newPassword: forgotNewPassword,
          }),
        });
      } catch (serverErr) {
        console.warn('Server password sync optional notice:', serverErr);
      }

      // 5. Broadcast global state change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lbu_user_updated'));
      }

      // 6. Auto-fill login fields with the newly set active password
      setEmail(targetEmail);
      setPassword(forgotNewPassword);
      setResetSuccessMsg(`Password for ${targetEmail} has been securely updated!`);
      setForgotStep('success');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setIsResettingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* University Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-1.5 shadow-2xl shadow-emerald-500/30 mb-4 ring-4 ring-emerald-500/20 overflow-hidden">
            <img
              src={LOKBHARTI_LOGO}
              alt="Lokbharti University Seal"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lokbharti University
          </h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-1">
            Smart LMS & Mini ERP System
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Sanosara, Bhavnagar, Gujarat • Accredited Grade A+
          </p>
        </div>

        {/* Main Glassmorphic Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn" id="login-error-alert">
              <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-200">Login Error</p>
                <p className="text-[11px] text-rose-300/90 mt-0.5">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Official Email or University ID
                </label>
                <span className="text-[10px] text-amber-400 font-medium">
                  Lowercase Only (a-z)
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="e.g. shubham.lashkari@lokbhartiuniversity.edu.in or 25221103010"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-white placeholder-slate-600 transition-all font-sans"
                  id="login-email-input"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Email address must be in lowercase only. Capital letters (A-Z) will show an error.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded cursor-pointer"
                  id="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-white placeholder-slate-600 transition-all"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  id="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              id="login-submit-btn"
            >
              {isSubmitting ? (
                <span>Authenticating & Detecting Role...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice Footer */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured with JWT Token Authentication & Role-Based Access Control</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reset University Password</h3>
                  <p className="text-[11px] text-slate-400">
                    {forgotStep === 'request' && 'Step 1: Enter Official Email'}
                    {forgotStep === 'otp' && 'Step 2: Verify Email OTP'}
                    {forgotStep === 'reset' && 'Step 3: Create New Password'}
                    {forgotStep === 'success' && 'Password Activated'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${forgotStep === 'request' ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-slate-700'}`} />
                <span className={`w-2 h-2 rounded-full ${forgotStep === 'otp' ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : forgotStep === 'reset' || forgotStep === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                <span className={`w-2 h-2 rounded-full ${forgotStep === 'reset' ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : forgotStep === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'request' && (
              <form onSubmit={handleForgotVerifyEmail} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter your official university email address. We will dispatch a secure 6-digit verification OTP to your email inbox to confirm identity.
                </p>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Official University Email or ID</label>
                    <span className="text-[10px] text-emerald-400">Typo & Capital Tolerant</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="Shubham.Lashkari@lokbhartiuniversity.edu.in or 25221103010"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Personal / Recovery Email (Optional)</label>
                    <span className="text-[10px] text-slate-500">For direct inbox delivery</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={personalRecoveryEmail}
                      onChange={(e) => setPersonalRecoveryEmail(e.target.value)}
                      placeholder="lashkarishubham58@gmail.com (Optional)"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setForgotError(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Email OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Account:</span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-400 truncate max-w-[200px]">{forgotEmail}</span>
                  </div>
                  {personalRecoveryEmail && (
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-1">
                      <span className="text-[11px] text-slate-400">Sent to:</span>
                      <span className="text-[11px] font-mono text-slate-300 truncate max-w-[200px]">{personalRecoveryEmail}</span>
                    </div>
                  )}
                </div>

                {/* Email Dispatch Notice */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-200">OTP Sent via Email</p>
                    <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                      A 6-digit verification code has been dispatched to your email inbox. Please check your inbox or spam folder and enter the OTP below.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter 6-Digit Email OTP</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value.replace(/\D/g, ''));
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="• • • • • •"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-base tracking-[0.4em] font-mono font-bold text-center text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Didn't receive email?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSendingOtp}
                    onClick={handleResendOtp}
                    className={`inline-flex items-center gap-1 font-semibold ${
                      resendCooldown > 0 || isSendingOtp ? 'text-slate-600 cursor-not-allowed' : 'text-emerald-400 hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email OTP'}</span>
                  </button>
                </div>

                {/* Sandbox delivery inspector for testing */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await fetchWebmailInbox();
                      setShowWebmailDrawer(!showWebmailDrawer);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-400 underline transition-colors"
                  >
                    {showWebmailDrawer ? 'Hide Outbound Mail Log' : 'Check Sandbox Email Delivery Log (Preview)'}
                  </button>

                  {showWebmailDrawer && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 max-h-36 overflow-y-auto">
                      <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider">Outbound University Mail Queue:</div>
                      {webmailDeliveries.length === 0 ? (
                        <p className="text-[10px] text-slate-500">No outbound deliveries recorded yet.</p>
                      ) : (
                        webmailDeliveries.map((item) => (
                          <div key={item.id} className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-[10px]">
                            <div className="flex justify-between text-slate-300 font-mono">
                              <span>To: {item.email}</span>
                              <span className="text-slate-500">{item.time}</span>
                            </div>
                            <div className="text-emerald-400 font-mono mt-0.5">Code: {item.code}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setForgotError(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                  >
                    Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleDirectPasswordReset} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">{forgotEmail}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Email Verified</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      if (forgotError) setForgotError(null);
                    }}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => {
                      setForgotConfirmPassword(e.target.value);
                      if (forgotError) setForgotError(null);
                    }}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('otp')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPass}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isResettingPass ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-sm text-white">Password Updated Successfully!</p>
                <p className="text-[11px] text-slate-400">
                  {resetSuccessMsg || `Your new credentials have been activated for ${forgotEmail}.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotStep('request');
                    setForgotError(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
