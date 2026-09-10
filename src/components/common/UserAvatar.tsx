import React, { useState } from 'react';
import { getInitials, getRoleGradient, isCustomAvatar } from '../../utils/avatarUtils';

export { getInitials, getRoleGradient };

export interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  imgClassName?: string;
  shape?: 'rounded-xl' | 'rounded-2xl' | 'rounded-full';
  id?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-bold',
  xl: 'w-20 h-20 text-2xl font-black',
  '2xl': 'w-24 h-24 text-3xl font-black',
  custom: '',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  role,
  size = 'md',
  className = '',
  imgClassName = '',
  shape = 'rounded-2xl',
  id,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name);
  const gradient = getRoleGradient(role);
  const sizeClass = sizeClasses[size];

  const isValidCustom = isCustomAvatar(avatar) && !imageFailed;

  if (isValidCustom) {
    return (
      <div
        id={id}
        className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${shape} ${sizeClass} ${className}`}
        title={name}
      >
        <img
          src={avatar!}
          alt={name}
          className={`w-full h-full object-cover select-none ${imgClassName}`}
          onError={() => setImageFailed(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Simple clean default avatar with initials and subtle role gradient
  return (
    <div
      id={id}
      className={`inline-flex items-center justify-center bg-gradient-to-br ${gradient} ${shape} shadow-sm select-none shrink-0 font-black tracking-wider ${sizeClass} ${className}`}
      title={name}
    >
      <span className="leading-none select-none">{initials}</span>
    </div>
  );
};
