import { User } from '../types/index';
import { DEPARTMENTS } from '../data/mockDatabase';
import { formatStudentDisplayName } from './studentNameUtils';

/**
 * Standard department aliases for smart acronym, degree, and keyword matching.
 */
export const DEPARTMENT_KEYWORD_ALIASES: Record<string, string[]> = {
  dept_it: [
    'it',
    'bvoc-it',
    'bvocit',
    'information technology',
    'info tech',
    'information',
    'technology',
    'bvoc',
    'b.voc',
    'cs',
    'computer',
    'software',
  ],
  dept_bvoc_afp: [
    'afp',
    'agro food',
    'agro-food',
    'agro food processing',
    'bvoc-afp',
    'bvocafp',
    'agro',
    'food processing',
    'food',
    'processing',
    'bvoc',
    'b.voc',
  ],
  dept_bvoc_fpt: [
    'fpt',
    'food processing',
    'food technology',
    'bvoc-fpt',
    'bvocfpt',
    'food',
    'processing',
    'technology',
    'bvoc',
    'b.voc',
  ],
  dept_bvoc_nf: [
    'nf',
    'natural farming',
    'bvoc-nf',
    'bvocnf',
    'natural',
    'farming',
    'zbnf',
    'organic farming',
    'bvoc',
    'b.voc',
  ],
  dept_brs_agronomy: [
    'agronomy',
    'brs-agro',
    'brsagro',
    'agro',
    'brs',
    'crop science',
    'rural studies',
    'agriculture',
  ],
  dept_brs_ahds: [
    'ahds',
    'animal husbandry',
    'dairy science',
    'brs-ahds',
    'brsahds',
    'dairy',
    'animal',
    'husbandry',
    'brs',
    'livestock',
  ],
  dept_brs_horti: [
    'horticulture',
    'horti',
    'brs-hort',
    'brshort',
    'brs',
    'gardening',
    'floriculture',
  ],
  dept_bba: [
    'bba',
    'business administration',
    'business',
    'administration',
    'management',
  ],
  dept_ba_gujarati: [
    'gujarati',
    'ba-guj',
    'baguj',
    'gujarati literature',
    'literature',
    'ba',
  ],
  dept_ba_english: [
    'english',
    'ba-eng',
    'baeng',
    'english studies',
    'ba',
  ],
  dept_ba_history: [
    'history',
    'ba-hist',
    'bahist',
    'archaeology',
    'ba',
  ],
  dept_msw: [
    'msw',
    'social work',
    'rural sociology',
    'sociology',
    'development',
  ],
  dept_mvoc_re: [
    'mvoc',
    'mvoc-ret',
    'mvocret',
    'renewable energy',
    'renewable',
    'energy',
    'solar',
  ],
  dept_msc_agri: [
    'msc',
    'msc-agri',
    'mscagri',
    'organic agriculture',
    'agriculture',
    'organic',
  ],
  dept_mrs_ext: [
    'mrs',
    'mrs-ext',
    'mrsext',
    'extension education',
    'extension',
    'education',
  ],
};

/**
 * Normalizes text to pure lowercase alphanumeric string without whitespace/symbols.
 */
export function normalizeCompact(text?: string | null): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Splits query text into cleaned keyword tokens.
 */
export function extractQueryTokens(query?: string | null): string[] {
  if (!query) return [];
  return query
    .toLowerCase()
    .split(/[\s,_\-./\\|@#+]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Gets all alias terms for a given department ID or name.
 */
export function getDepartmentAliases(deptId?: string, deptName?: string): string[] {
  const aliases = new Set<string>();

  if (deptId) {
    const cleanId = deptId.toLowerCase().trim();
    aliases.add(cleanId);
    if (DEPARTMENT_KEYWORD_ALIASES[cleanId]) {
      DEPARTMENT_KEYWORD_ALIASES[cleanId].forEach((a) => aliases.add(a.toLowerCase()));
    }
  }

  if (deptName) {
    const cleanDeptName = deptName.toLowerCase().trim();
    aliases.add(cleanDeptName);
    extractQueryTokens(cleanDeptName).forEach((t) => aliases.add(t));
  }

  // Check matching in DEPARTMENTS database list
  const matchedDept = DEPARTMENTS.find(
    (d) =>
      (deptId && d.id.toLowerCase() === deptId.toLowerCase()) ||
      (deptName && d.name.toLowerCase() === deptName.toLowerCase()) ||
      (deptId && d.code.toLowerCase() === deptId.toLowerCase())
  );

  if (matchedDept) {
    aliases.add(matchedDept.name.toLowerCase());
    aliases.add(matchedDept.code.toLowerCase());
    aliases.add(matchedDept.code.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (matchedDept.degreeCode) aliases.add(matchedDept.degreeCode.toLowerCase());
    if (matchedDept.degreeFullName) aliases.add(matchedDept.degreeFullName.toLowerCase());
    if (matchedDept.subDepartmentName) aliases.add(matchedDept.subDepartmentName.toLowerCase());
  }

  return Array.from(aliases);
}

/**
 * Structured Search Corpus for a user profile.
 */
export interface UserSearchProfile {
  nameTokens: string[];
  nameSubstrings: string[];
  deptAliases: string[];
  deptTokens: string[];
  idTokens: string[];
  emailTokens: string[];
  roleTokens: string[];
  compactSignatures: string[];
}

/**
 * Builds a structured search profile for a user (Students, Faculty, HODs, Admins).
 */
export function buildUserSearchProfile(user: User | Record<string, any>): UserSearchProfile {
  const uAny = user as Record<string, any>;
  const name = (uAny.name || '').trim();
  const email = (uAny.email || '').trim();
  const enrollmentNo = (uAny.enrollmentNo || uAny.rollNo || '').trim();
  const rollNo = (uAny.rollNo || '').trim();
  const employeeId = (uAny.employeeId || '').trim();
  const role = (uAny.role || '').trim();
  const designation = (uAny.designation || uAny.title || '').trim();
  const departmentId = (uAny.departmentId || '').trim();
  const departmentName = (uAny.departmentName || uAny.department || '').trim();

  // 1. Name Tokens
  const rawNameTokens = extractQueryTokens(name);
  const nameTokens = rawNameTokens.map((t) => t.toLowerCase());

  // Also include root names without suffixes like "bhai", "kumar", "sinh" if present
  const nameSubstrings: string[] = [...nameTokens];
  nameTokens.forEach((tok) => {
    // E.g. "hardikbhai" -> "hardik", "shubhambhai" -> "shubham"
    if (tok.endsWith('bhai') && tok.length > 5) {
      nameSubstrings.push(tok.slice(0, -4));
    } else if (tok.endsWith('kumar') && tok.length > 6) {
      nameSubstrings.push(tok.slice(0, -5));
    } else if (tok.endsWith('sinh') && tok.length > 5) {
      nameSubstrings.push(tok.slice(0, -4));
    }
  });

  const firstName = nameTokens[0] || '';
  const lastName = nameTokens.length > 1 ? nameTokens[nameTokens.length - 1] : '';

  // 2. Department Aliases & Tokens
  const deptAliases = getDepartmentAliases(departmentId, departmentName);
  const deptTokens = Array.from(
    new Set(deptAliases.flatMap((a) => extractQueryTokens(a)))
  );

  // 3. ID Tokens
  const idTokens = [
    enrollmentNo.toLowerCase(),
    rollNo.toLowerCase(),
    employeeId.toLowerCase(),
  ].filter(Boolean);

  // 4. Email username tokens (only before @, do NOT include generic university domain!)
  const emailUsername = email.split('@')[0] || '';
  const emailTokens = extractQueryTokens(emailUsername);

  // 5. Role Tokens
  const roleTokens = [
    role.toLowerCase(),
    ...extractQueryTokens(designation),
    ...(uAny.semester ? [`sem${uAny.semester}`, `semester${uAny.semester}`, `${uAny.semester}`] : []),
  ].filter(Boolean);

  // 6. Build compact signatures for space-less queries (e.g. "hardikit", "ithardik", "shubhamlashkari")
  const compactSigs = new Set<string>();

  const compactName = normalizeCompact(name);
  if (compactName) compactSigs.add(compactName);

  const compactFirst = normalizeCompact(firstName);
  const compactFirstShort = firstName.endsWith('bhai') && firstName.length > 5
    ? normalizeCompact(firstName.slice(0, -4))
    : '';
  const compactLast = normalizeCompact(lastName);

  if (compactFirst) compactSigs.add(compactFirst);
  if (compactFirstShort) compactSigs.add(compactFirstShort);
  if (compactLast) compactSigs.add(compactLast);

  if (compactFirst && compactLast) {
    compactSigs.add(`${compactFirst}${compactLast}`);
    compactSigs.add(`${compactLast}${compactFirst}`);
  }
  if (compactFirstShort && compactLast) {
    compactSigs.add(`${compactFirstShort}${compactLast}`);
    compactSigs.add(`${compactLast}${compactFirstShort}`);
  }

  // Combine name with Department Aliases (e.g. "hardikit", "ithardik", "shubhamit", "shubhamlashkariit")
  deptAliases.forEach((alias) => {
    const compactAlias = normalizeCompact(alias);
    if (!compactAlias) return;

    compactSigs.add(compactAlias);

    const firstNamesToCombine = [compactFirst, compactFirstShort].filter(Boolean);
    firstNamesToCombine.forEach((f) => {
      // "hardikit", "ithardik"
      compactSigs.add(`${f}${compactAlias}`);
      compactSigs.add(`${compactAlias}${f}`);

      // "hardikchauhanit", "ithardikchauhan"
      if (compactLast) {
        compactSigs.add(`${f}${compactLast}${compactAlias}`);
        compactSigs.add(`${compactAlias}${f}${compactLast}`);
      }
    });

    if (compactName) {
      compactSigs.add(`${compactName}${compactAlias}`);
      compactSigs.add(`${compactAlias}${compactName}`);
    }
  });

  // ID compacts
  idTokens.forEach((idTok) => {
    const cId = normalizeCompact(idTok);
    if (cId) {
      compactSigs.add(cId);
      if (compactFirst) compactSigs.add(`${compactFirst}${cId}`);
    }
  });

  return {
    nameTokens,
    nameSubstrings,
    deptAliases,
    deptTokens,
    idTokens,
    emailTokens,
    roleTokens,
    compactSignatures: Array.from(compactSigs),
  };
}

/**
 * Intelligent Smart Matcher for User Profiles.
 * Matches:
 *  - Full name ("Shubham Manojbhai Lashkari")
 *  - First + Last name ("Shubham Lashkari")
 *  - Name + Department in any order ("Hardik IT", "IT Hardik", "Shubham IT", "IT Arpit", "Arpit IT")
 *  - First name only ("Hardik" -> shows both IT and AHDS students)
 *  - Space-insensitive queries ("hardikit", "ithardik", "shubhamlashkari", "shubhamit")
 *  - Enrollment number, employee ID, role, etc.
 */
export function matchUserSmart(user: User | Record<string, any>, query: string): boolean {
  if (!query || !query.trim()) return true;

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = extractQueryTokens(cleanQuery);
  const compactQuery = normalizeCompact(cleanQuery);

  const profile = buildUserSearchProfile(user);

  // 1. Direct consecutive substring match on full name, designation, or IDs
  const directName = (user.name || '').toLowerCase();
  if (directName.includes(cleanQuery)) return true;

  // 1b. Direct match on student display name without father's name (First + Surname, e.g. "Dev Dankhara")
  const studentFormatted = formatStudentDisplayName(user.name || '').toLowerCase();
  if (studentFormatted && studentFormatted.includes(cleanQuery)) return true;

  const directDesignation = ((user as any).designation || '').toLowerCase();
  if (directDesignation && directDesignation.includes(cleanQuery)) return true;

  const uAny = user as Record<string, any>;
  const directEnroll = (uAny.enrollmentNo || uAny.rollNo || uAny.employeeId || '').toLowerCase();
  if (directEnroll && directEnroll.includes(cleanQuery)) return true;

  // 2. Multi-token matching (e.g. 'hardik it', 'it hardik', 'shubham lashkari', 'it arpit', 'rishu raj')
  if (queryTokens.length > 1) {
    return queryTokens.every((token) => {
      const cleanTok = token.toLowerCase().trim();
      const compactTok = normalizeCompact(cleanTok);

      // Short acronym / keyword tokens (e.g. 'it', 'cs', 'ba', 'afp', 'nf', 'brs', 'dr', 'hod', 'adm')
      if (cleanTok.length <= 3) {
        if (profile.deptAliases.some((a) => a.toLowerCase() === cleanTok || normalizeCompact(a) === compactTok)) {
          return true;
        }
        if (profile.nameSubstrings.some((n) => n.startsWith(cleanTok) || n === cleanTok)) {
          return true;
        }
        if (profile.idTokens.some((id) => id.includes(cleanTok))) {
          return true;
        }
        if (profile.roleTokens.some((r) => r === cleanTok || r.startsWith(cleanTok))) {
          return true;
        }
        if (profile.emailTokens.some((e) => e.startsWith(cleanTok) || e === cleanTok)) {
          return true;
        }
        return false;
      }

      // Longer tokens (e.g. 'hardik', 'lashkari', 'information', 'technology', 'vishal', 'bhadani')
      if (profile.nameSubstrings.some((n) => n.startsWith(cleanTok) || n === cleanTok || cleanTok.startsWith(n) || n.includes(cleanTok))) {
        return true;
      }
      if (
        profile.deptAliases.some((a) => a.toLowerCase().includes(cleanTok)) ||
        profile.deptTokens.some((dt) => dt.startsWith(cleanTok) || cleanTok.startsWith(dt))
      ) {
        return true;
      }
      if (profile.idTokens.some((id) => id.includes(cleanTok))) {
        return true;
      }
      if (profile.emailTokens.some((e) => e.includes(cleanTok))) {
        return true;
      }
      if (profile.roleTokens.some((r) => r.includes(cleanTok))) {
        return true;
      }
      return false;
    });
  }

  // 3. Single token (e.g. 'hardik', 'hardikit', 'ithardik', 'shubhamit', 'shubhamlashkari')
  if (queryTokens.length === 1) {
    const singleTok = queryTokens[0];
    const cleanTok = singleTok.toLowerCase().trim();
    const compactTok = normalizeCompact(cleanTok);

    if (cleanTok.length <= 3) {
      if (profile.deptAliases.some((a) => a.toLowerCase() === cleanTok || normalizeCompact(a) === compactTok)) return true;
      if (profile.nameSubstrings.some((n) => n.startsWith(cleanTok) || n === cleanTok)) return true;
      if (profile.idTokens.some((id) => id.includes(cleanTok))) return true;
      if (profile.roleTokens.some((r) => r === cleanTok || r.startsWith(cleanTok))) return true;
      if (profile.emailTokens.some((e) => e.startsWith(cleanTok) || e === cleanTok)) return true;
    } else {
      if (profile.nameSubstrings.some((n) => n.startsWith(cleanTok) || n === cleanTok || n.includes(cleanTok))) return true;
      if (
        profile.deptAliases.some((a) => a.toLowerCase() === cleanTok || normalizeCompact(a) === cleanTok) ||
        profile.deptTokens.some((dt) => dt === cleanTok)
      ) return true;
      if (profile.idTokens.some((id) => id.includes(cleanTok))) return true;
      if (profile.emailTokens.some((e) => e.includes(cleanTok))) return true;
      if (profile.roleTokens.some((r) => r.includes(cleanTok))) return true;
    }

    if (compactQuery.length >= 2) {
      if (profile.compactSignatures.some((cs) => cs === compactQuery || cs.startsWith(compactQuery))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Smart Matcher for General Search Items (Subjects, Notices, Assignments, Materials, Quizzes, Departments).
 */
export function matchItemSmart(fields: (string | undefined | null)[], query: string): boolean {
  if (!query || !query.trim()) return true;

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = extractQueryTokens(cleanQuery);
  const compactQuery = normalizeCompact(cleanQuery);

  const cleanFields = fields.filter((f): f is string => Boolean(f)).map((f) => f.toLowerCase());

  // 1. Direct substring in any field
  if (cleanFields.some((f) => f.includes(cleanQuery))) return true;

  // 2. Multi-token match across fields
  if (queryTokens.length > 0) {
    const allTokensMatch = queryTokens.every((token) =>
      cleanFields.some((f) => f.includes(token))
    );
    if (allTokensMatch) return true;
  }

  // 3. Space-insensitive check
  if (compactQuery.length >= 2) {
    const compactFields = cleanFields.map((f) => normalizeCompact(f));
    if (compactFields.some((cf) => cf.includes(compactQuery))) return true;
  }

  return false;
}
