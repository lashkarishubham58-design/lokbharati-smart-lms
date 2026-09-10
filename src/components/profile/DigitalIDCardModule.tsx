import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Download,
  Share2,
  ShieldCheck,
  Building2,
  Phone,
  Droplet,
  CheckCircle2,
  Sparkles,
  Printer
} from 'lucide-react';
import { User } from '../../types';
import { LOKBHARTI_LOGO } from '../../assets/logo';
import { ProfilePhotoViewerModal } from './ProfilePhotoViewerModal';
import { UserAvatar } from '../common/UserAvatar';

interface DigitalIDCardModuleProps {
  user: User;
}

export const DigitalIDCardModule: React.FC<DigitalIDCardModuleProps> = ({ user }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Smart NFC & Digital ID</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Lokbharti University Official Digital ID Card
          </h1>
          <p className="text-xs text-slate-500">
            Valid for Campus Gate Access, Library Circulation, Canteen Payments, and Semester Exams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCardFlipped(!cardFlipped)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
          >
            Flip Card ({cardFlipped ? 'Front' : 'Back'})
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID</span>
          </button>
        </div>
      </div>

      {/* ID Card Display Container */}
      <div className="flex justify-center py-6">
        <div
          className={`w-[360px] sm:w-[420px] h-[250px] sm:h-[280px] rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 transform hover:scale-[1.02] border border-white/20 text-white ${
            cardFlipped
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'
              : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900'
          }`}
        >
          {/* Background Decorative Ripples */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />

          {!cardFlipped ? (
            /* FRONT OF CARD */
            <div className="h-full flex flex-col justify-between relative z-10">
              {/* Top Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white/30">
                    <img
                      src={LOKBHARTI_LOGO}
                      alt="Lokbharti Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs tracking-wide uppercase text-white">
                      Lokbharti Gramvidyapith
                    </div>
                    <div className="text-[9px] text-emerald-200">
                      University ERP Digital Pass • Sanosara
                    </div>
                  </div>
                </div>

                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  {user.role}
                </span>
              </div>

              {/* Body */}
              <div className="flex items-center gap-4 my-auto">
                <div
                  id="id-card-avatar-container"
                  className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
                  onClick={() => setShowPhotoViewer(true)}
                  title="Click to view full profile photo"
                >
                  <UserAvatar
                    name={user.name}
                    avatar={user.avatar}
                    role={user.role}
                    size="custom"
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl ring-2 ring-amber-400/80 shadow-md group-hover:brightness-105 transition-all text-2xl font-black"
                  />
                  <ShieldCheck className="w-5 h-5 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full" />
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight truncate">
                    {user.name}
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-medium">
                    {user.departmentName || 'Computer Science & Engineering'}
                  </p>
                  <div className="text-[10px] font-mono text-amber-300 bg-black/30 px-2 py-0.5 rounded inline-block">
                    ID: {user.enrollmentNo || user.employeeId || '2024CS1002'}
                  </div>
                  {user.semester && (
                    <div className="text-[10px] text-slate-300 font-semibold">
                      Semester {user.semester} • Batch 2024-2028
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                <div className="text-[9px] text-slate-300 font-mono">
                  BLOOD: <span className="font-bold text-amber-300">O +ve</span> • EXP: 07/2028
                </div>

                <button
                  onClick={() => setShowQRModal(true)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                  title="Scan Digital QR Code"
                >
                  <QrCode className="w-5 h-5 text-amber-300" />
                </button>
              </div>
            </div>
          ) : (
            /* BACK OF CARD */
            <div className="h-full flex flex-col justify-between relative z-10 text-xs">
              <div className="border-b border-white/10 pb-2">
                <div className="text-[10px] font-bold text-amber-300 uppercase">
                  Emergency & University Access
                </div>
                <div className="text-[10px] text-slate-300">
                  This card is property of Lokbharti University, Sanosara.
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px] text-slate-200 my-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Official Email:</span>
                  <span className="font-bold">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Campus Security Helpline:</span>
                  <span className="font-bold text-emerald-300">+91 2846 282222</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Contact:</span>
                  <span className="font-bold text-amber-300">+91 98250 11223</span>
                </div>
              </div>

              {/* Barcode Simulator */}
              <div className="bg-white/90 p-2 rounded-xl text-center">
                <div className="h-6 w-full bg-repeat-x bg-[linear-gradient(90deg,#000_2px,transparent_2px,#000_4px,transparent_6px,#000_10px)]" />
                <div className="text-[9px] font-mono font-bold text-slate-900 mt-0.5">
                  LBU*2024*{user.id.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">NFC Gate Entry</h4>
          <p className="text-[11px] text-slate-500">Tap phone against campus automated RFID turnstiles.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <QrCode className="w-6 h-6 text-amber-500 mx-auto" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Exam Verification</h4>
          <p className="text-[11px] text-slate-500">Scan QR Code at hall invigilator desk to confirm seat.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <Building2 className="w-6 h-6 text-indigo-500 mx-auto" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Library Checkout</h4>
          <p className="text-[11px] text-slate-500">Issue books instantly at central library RFID desk.</p>
        </div>
      </div>

      {/* QR Code Verification Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Official Verification Token
            </h3>

            {/* Generated QR visual */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-inner w-48 h-48 mx-auto flex items-center justify-center relative">
              <QrCode className="w-40 h-40 text-slate-900" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-md">
                  LBU
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="font-mono text-[11px]">Token: {user.id}_VERIFIED_2026</p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* ID Card Photo Fullscreen Viewer */}
      <ProfilePhotoViewerModal
        isOpen={showPhotoViewer}
        onClose={() => setShowPhotoViewer(false)}
        photoUrl={user.avatar || ''}
        userName={user.name}
        userRole={user.role}
        designation={user.designation}
        departmentName={user.departmentName}
        idNumber={user.enrollmentNo || user.employeeId}
      />
    </div>
  );
};
