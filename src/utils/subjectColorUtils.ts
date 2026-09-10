export interface SubjectBadgeStyle {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  ring: string;
  accentHex: string;
}

export function getSubjectBadgeStyle(subjectCode: string = '', subjectName: string = ''): SubjectBadgeStyle {
  const code = (subjectCode || subjectName).trim().toUpperCase();

  if (code.includes('401') || code.includes('DSA') || code.includes('OOPS') || code.includes('MJ305')) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-700',
      badgeBg: 'bg-emerald-500 text-slate-950 font-black',
      badgeText: 'text-emerald-400',
      ring: 'ring-emerald-400',
      accentHex: '#10b981',
    };
  }
  if (code.includes('402') || code.includes('DBMS') || code.includes('DATABASE') || code.includes('MJ306')) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-900 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-700',
      badgeBg: 'bg-blue-500 text-white font-black',
      badgeText: 'text-blue-400',
      ring: 'ring-blue-400',
      accentHex: '#3b82f6',
    };
  }
  if (code.includes('403') || code.includes('WEB') || code.includes('ENGINEERING') || code.includes('AE303')) {
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-900 dark:text-purple-200',
      border: 'border-purple-300 dark:border-purple-700',
      badgeBg: 'bg-purple-500 text-white font-black',
      badgeText: 'text-purple-400',
      ring: 'ring-purple-400',
      accentHex: '#a855f7',
    };
  }
  if (code.includes('404') || code.includes('SOFTWARE') || code.includes('SYS') || code.includes('SE303')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-900 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-700',
      badgeBg: 'bg-amber-500 text-slate-950 font-black',
      badgeText: 'text-amber-400',
      ring: 'ring-amber-400',
      accentHex: '#f59e0b',
    };
  }
  if (code.includes('405') || code.includes('NETWORKS') || code.includes('CYBER') || code.includes('VA303') || code.includes('BBAVA')) {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-900 dark:text-rose-200',
      border: 'border-rose-300 dark:border-rose-700',
      badgeBg: 'bg-rose-500 text-white font-black',
      badgeText: 'text-rose-400',
      ring: 'ring-rose-400',
      accentHex: '#f43f5e',
    };
  }
  if (code.includes('INTERNSHIP') || code.includes('OJT') || code.includes('OJT303') || code.includes('PROJECT')) {
    return {
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      text: 'text-cyan-900 dark:text-cyan-200',
      border: 'border-cyan-300 dark:border-cyan-700',
      badgeBg: 'bg-cyan-500 text-slate-950 font-black',
      badgeText: 'text-cyan-400',
      ring: 'ring-cyan-400',
      accentHex: '#06b6d4',
    };
  }
  if (code.includes('BBAMJ') || code.includes('MJ303') || code.includes('CONSUMER')) {
    return {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-900 dark:text-indigo-200',
      border: 'border-indigo-300 dark:border-indigo-700',
      badgeBg: 'bg-indigo-600 text-white font-black',
      badgeText: 'text-indigo-400',
      ring: 'ring-indigo-400',
      accentHex: '#4f46e5',
    };
  }
  if (code.includes('BBAMN') || code.includes('MN303') || code.includes('SUPPLY CHAIN')) {
    return {
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      text: 'text-teal-900 dark:text-teal-200',
      border: 'border-teal-300 dark:border-teal-700',
      badgeBg: 'bg-teal-600 text-white font-black',
      badgeText: 'text-teal-400',
      ring: 'ring-teal-400',
      accentHex: '#0d9488',
    };
  }
  if (code.includes('SPORTS')) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-700',
      badgeBg: 'bg-emerald-600 text-white font-black',
      badgeText: 'text-emerald-400',
      ring: 'ring-emerald-400',
      accentHex: '#059669',
    };
  }
  if (code.includes('DEPACT') || code.includes('ACTIVITY') || code.includes('YAGNARTH') || code.includes('ANUBANDH')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-900 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-700',
      badgeBg: 'bg-amber-500 text-slate-950 font-black',
      badgeText: 'text-amber-400',
      ring: 'ring-amber-400',
      accentHex: '#d97706',
    };
  }

  const PALETTES: SubjectBadgeStyle[] = [
    {
      bg: 'bg-teal-50 dark:bg-teal-950/60',
      text: 'text-teal-900 dark:text-teal-200',
      border: 'border-teal-300 dark:border-teal-700',
      badgeBg: 'bg-teal-500 text-slate-950 font-black',
      badgeText: 'text-teal-400',
      ring: 'ring-teal-400',
      accentHex: '#14b8a6',
    },
    {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-900 dark:text-indigo-200',
      border: 'border-indigo-300 dark:border-indigo-700',
      badgeBg: 'bg-indigo-500 text-white font-black',
      badgeText: 'text-indigo-400',
      ring: 'ring-indigo-400',
      accentHex: '#6366f1',
    },
    {
      bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60',
      text: 'text-fuchsia-900 dark:text-fuchsia-200',
      border: 'border-fuchsia-300 dark:border-fuchsia-700',
      badgeBg: 'bg-fuchsia-500 text-white font-black',
      badgeText: 'text-fuchsia-400',
      ring: 'ring-fuchsia-400',
      accentHex: '#d946ef',
    },
    {
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      text: 'text-orange-900 dark:text-orange-200',
      border: 'border-orange-300 dark:border-orange-700',
      badgeBg: 'bg-orange-500 text-slate-950 font-black',
      badgeText: 'text-orange-400',
      ring: 'ring-orange-400',
      accentHex: '#f97316',
    },
  ];

  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}
