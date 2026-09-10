/**
 * Student Name Display Utilities
 * 
 * Enforces privacy and institutional display standard:
 * When a student searches for another student by name, only that student's
 * first name and surname should appear — not their father's name.
 * 
 * This strictly applies to student details (not faculty, HODs, or admin accounts).
 */

/**
 * Formats a student's full name to display only their first name and surname,
 * omitting any patronymic (father's name) or middle names.
 * 
 * Examples:
 * - "Dev Manojbhai Dankhara"        -> "Dev Dankhara"
 * - "Avleshbhai Rasikbhai Vala"     -> "Avleshbhai Vala"
 * - "Devvratsinh Jagdishbhai Chauhan" -> "Devvratsinh Chauhan"
 * - "Jeet Pareshkumar Kotecha"      -> "Jeet Kotecha"
 * - "Shubham Manishbhai Rathod"     -> "Shubham Rathod"
 * - "Akshay Dalsukhbhai Jamod"      -> "Akshay Jamod"
 * - "Bhagirath Nagbhai Faga"        -> "Bhagirath Faga"
 * - "Aarav Patel"                   -> "Aarav Patel"
 * - "Pooja"                         -> "Pooja"
 */
export function formatStudentDisplayName(fullName?: string | null): string {
  if (!fullName || typeof fullName !== 'string') return '';
  const trimmed = fullName.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) {
    return trimmed;
  }

  // Check if first token is a salutation (e.g. Mr., Ms., Miss)
  const firstLower = parts[0].toLowerCase().replace('.', '');
  if (['mr', 'ms', 'miss'].includes(firstLower) && parts.length >= 4) {
    // Return Salutation + Given Name + Surname
    return `${parts[0]} ${parts[1]} ${parts[parts.length - 1]}`;
  }

  // Standard 3-part or multi-part student name:
  // parts[0] = First Name (Given Name)
  // parts[1..N-2] = Father's Name / Patronymic / Middle Name (OMITTED)
  // parts[parts.length - 1] = Surname (Family Name)
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

/**
 * Determines the display name for a target user.
 * Strictly applies father's name omission when:
 * 1. The target is a student (applies strictly to student details)
 * 2. The viewer is a student searching or inspecting another student
 */
export function getTargetUserDisplayName(
  targetUser: { role?: string; name?: string; id?: string } | null | undefined,
  viewerUser?: { role?: string; id?: string } | null | undefined
): string {
  if (!targetUser || !targetUser.name) return '';

  const targetRole = (targetUser.role || '').toLowerCase();
  const isTargetStudent = targetRole === 'student';

  // "this applies strictly to the student's details"
  // Faculty, HODs, Admins retain their full professional names
  if (!isTargetStudent) {
    return targetUser.name;
  }

  const viewerRole = (viewerUser?.role || '').toLowerCase();
  const isViewerStudent = viewerRole === 'student';
  const isSelf = !!(viewerUser?.id && targetUser.id && viewerUser.id === targetUser.id);

  // When a student searches for or views another student:
  if (isViewerStudent && !isSelf) {
    return formatStudentDisplayName(targetUser.name);
  }

  return targetUser.name;
}
