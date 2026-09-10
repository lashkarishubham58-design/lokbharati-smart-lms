import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Camera,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  Maximize2,
  Copy,
  Check,
  Building2,
  Award
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { isCustomAvatar } from '../../utils/avatarUtils';

interface ProfilePhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  userName: string;
  userRole?: string;
  designation?: string;
  departmentName?: string;
  idNumber?: string;
  onChangePhoto?: () => void;
}

export const ProfilePhotoViewerModal: React.FC<ProfilePhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  userName,
  userRole = 'Member',
  designation,
  departmentName,
  idNumber,
  onChangePhoto,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setCopiedId(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = photoUrl;
      link.download = `${userName.toLowerCase().replace(/\s+/g, '_')}_lokbharti_profile.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleCopyId = () => {
    if (!idNumber) return;
    try {
      navigator.clipboard.writeText(idNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {
      console.error('Copy ID failed', e);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'admin') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (r === 'hod') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (r === 'teacher' || r === 'faculty') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div
      id="modal-profile-photo-viewer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-profile-photo-viewer-card"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Full Profile Photo Preview</h3>
              <p className="text-xs text-slate-400">High-Resolution Academic Profile View</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-viewer-zoom-out"
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              id="btn-viewer-zoom-in"
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                id="btn-viewer-zoom-reset"
                type="button"
                onClick={handleResetZoom}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 transition-all cursor-pointer border border-slate-700"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              id="btn-viewer-download"
              type="button"
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md"
              title="Download High-Res Photo"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              id="btn-viewer-close"
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-all cursor-pointer ml-1 border border-slate-700"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Photo Container with Crisp Large Display */}
        <div
          className="relative my-5 w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-700/80 shadow-2xl flex items-center justify-center group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isCustomAvatar(photoUrl) ? (
            <img
              src={photoUrl}
              alt={userName}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
              className="w-full h-full object-cover object-top rounded-3xl"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <UserAvatar
                name={userName}
                role={userRole}
                size="custom"
                className="w-48 h-48 sm:w-64 sm:h-64 text-5xl sm:text-6xl rounded-3xl shadow-xl ring-4 ring-white/10"
              />
            </div>
          )}

          {/* Zoom Level Indicator */}
          {zoomLevel !== 1 && photoUrl && (
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30 shadow-lg">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}
        </div>

        {/* User Details Box with Crystal-Clear Contrast */}
        <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-inner">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h4 className="font-black text-lg sm:text-xl text-white truncate">{userName}</h4>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${getRoleBadgeStyle(
                  userRole
                )}`}
              >
                {userRole}
              </span>
            </div>

            {designation && (
              <p className="text-xs sm:text-sm text-amber-300 font-extrabold flex items-center justify-center sm:justify-start gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{designation}</span>
              </p>
            )}

            <p className="text-xs text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{departmentName || 'Lokbharti University for Rural Innovation'}</span>
            </p>

            {idNumber && (
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px] font-bold flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  <span>{idNumber}</span>
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Institutional Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Permanent Institutional Avatar</span>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Click outside or press <strong>Esc</strong> to close preview</span>
          </p>
        </div>
      </div>
    </div>
  );
};
