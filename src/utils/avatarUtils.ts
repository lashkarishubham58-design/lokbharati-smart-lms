/**
 * Central avatar utility functions for Lokbharti University ERP.
 * Standardizes permanent alphabet-based avatars stored directly in the database
 * with distinct role-based color gradients (Admin, HOD, Teacher, Student).
 * Ensures profile avatars cannot be altered and remain permanently consistent.
 */

export interface RoleColorTheme {
  start: string;
  end: string;
  text: string;
  ring: string;
  label: string;
  gradientClass: string;
}

export const ROLE_COLOR_THEMES: Record<string, RoleColorTheme> = {
  admin: {
    start: '#7e22ce',
    end: '#4338ca',
    text: '#ffffff',
    ring: '#c084fc',
    label: 'University Administration',
    gradientClass: 'from-purple-600 to-indigo-700 text-white border border-purple-400/20',
  },
  hod: {
    start: '#1d4ed8',
    end: '#0e7490',
    text: '#ffffff',
    ring: '#38bdf8',
    label: 'Head of Department',
    gradientClass: 'from-blue-600 to-cyan-700 text-white border border-cyan-400/20',
  },
  teacher: {
    start: '#047857',
    end: '#0f766e',
    text: '#ffffff',
    ring: '#34d399',
    label: 'Faculty Member',
    gradientClass: 'from-emerald-600 to-teal-700 text-white border border-emerald-400/20',
  },
  student: {
    start: '#d97706',
    end: '#c2410c',
    text: '#ffffff',
    ring: '#fbbf24',
    label: 'Enrolled Student',
    gradientClass: 'from-amber-600 to-orange-700 text-white border border-amber-400/20',
  },
  default: {
    start: '#475569',
    end: '#1e293b',
    text: '#ffffff',
    ring: '#94a3b8',
    label: 'University Member',
    gradientClass: 'from-slate-600 to-slate-800 text-white border border-slate-500/20',
  },
};

/**
 * Extracts clean uppercase initials from a person's name,
 * filtering out academic/honorific prefixes, suffixes, parentheses, and role tags.
 * Example: "Mr. Rishu Raj (HOD)" -> "RR"
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'U';

  // 1. If it's an email address, extract name part before @
  let clean = name.trim();
  if (clean.includes('@')) {
    clean = clean.split('@')[0].replace(/[._-]/g, ' ');
  }

  // 2. Remove all content inside parentheses, brackets, or braces e.g., (HOD), [Admin], {Dean}
  clean = clean.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ');

  // 3. Remove common honorifics, titles, and designations (case-insensitive)
  const honorifics = [
    'dr\\.', 'dr', 'prof\\.', 'prof', 'mr\\.', 'mr', 'ms\\.', 'ms', 'mrs\\.', 'mrs',
    'miss\\.', 'miss', 'hon\\.', 'hon', 'shri\\.', 'shri', 'smt\\.', 'smt',
    'er\\.', 'er', 'ca\\.', 'ca', 'adv\\.', 'adv', 'hod\\.', 'hod', 'dean\\.', 'dean',
    'principal\\.', 'principal', 'head\\.', 'head', 'sir', 'madam', 'col\\.', 'col',
    'lt\\.', 'lt', 'asst\\.', 'asst', 'assoc\\.', 'assoc'
  ];

  const honorificRegex = new RegExp(`\\b(${honorifics.join('|')})\\b`, 'gi');
  clean = clean.replace(honorificRegex, ' ');

  // 4. Remove non-alphabetical characters except spaces
  clean = clean.replace(/[^a-zA-Z\s]/g, ' ').trim();

  // 5. Split into words
  const words = clean.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    // Fallback: extract any letters from original name
    const rawLetters = name.replace(/[^a-zA-Z]/g, '');
    if (rawLetters.length >= 2) return rawLetters.substring(0, 2).toUpperCase();
    if (rawLetters.length === 1) return rawLetters.toUpperCase();
    return 'U';
  }

  if (words.length === 1) {
    const single = words[0];
    return single.length >= 2 ? single.substring(0, 2).toUpperCase() : single.toUpperCase();
  }

  // Two or more words: take first letter of first word and first letter of last word
  const firstLetter = words[0][0];
  const secondLetter = words[words.length - 1][0];
  return (firstLetter + secondLetter).toUpperCase();
};

/**
 * Returns Tailwind gradient classes based on user role
 */
export const getRoleGradient = (role?: string): string => {
  const normalized = (role || '').toLowerCase();
  return ROLE_COLOR_THEMES[normalized]?.gradientClass || ROLE_COLOR_THEMES.default.gradientClass;
};

/**
 * Generates an official, permanent SVG Data URI for an alphabet-based avatar
 * with distinct role-based color gradients. Stored permanently in database records.
 */
export const generateAlphabetAvatar = (name: string, role?: string): string => {
  const initials = getInitials(name);
  const normalized = (role || '').toLowerCase();
  const theme = ROLE_COLOR_THEMES[normalized] || ROLE_COLOR_THEMES.default;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="roleGrad_${normalized}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.start}" />
      <stop offset="100%" stop-color="${theme.end}" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="32" fill="url(#roleGrad_${normalized})" />
  <rect width="124" height="124" x="2" y="2" rx="30" fill="none" stroke="${theme.ring}" stroke-width="2" stroke-opacity="0.3" />
  <text x="50%" y="54%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="48" font-weight="900" fill="${theme.text}" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${initials}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Returns true if an avatar string is a valid custom or uploaded user photo (not SVG alphabet avatar or stock placeholder)
 */
export const isCustomAvatar = (avatar?: string | null): boolean => {
  if (!avatar || typeof avatar !== 'string') return false;
  const clean = avatar.trim();
  if (!clean) return false;

  // Filter out external placeholder stock URLs
  if (clean.includes('images.unsplash.com')) return false;

  // Filter out auto-generated SVG alphabet avatars so UserAvatar can dynamically render crisp, up-to-date initials
  if (clean.startsWith('data:image/svg+xml')) return false;

  return true;
};

/**
 * Returns the permanently stored or generated alphabet avatar
 */
export const getResolvedAvatar = (user?: { name?: string; role?: string; avatar?: string | null } | null): string => {
  if (!user) return generateAlphabetAvatar('University User', 'default');
  if (user.avatar && isCustomAvatar(user.avatar)) {
    return user.avatar.trim();
  }
  return generateAlphabetAvatar(user.name || 'User', user.role || 'default');
};
