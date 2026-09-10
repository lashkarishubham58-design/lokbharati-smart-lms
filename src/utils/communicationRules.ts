import { User, UserRole } from '../types';

/**
 * Validates whether the sender role can communicate with the recipient role.
 *
 * Communication Matrix:
 * - Student -> Teacher: Allowed
 * - Student -> HOD: Allowed
 * - Student -> Admin: Allowed
 * - Teacher -> Student: Allowed
 * - Teacher -> Teacher: Allowed
 * - Teacher -> HOD: Allowed
 * - Teacher -> Admin: Allowed
 * - HOD -> Student: Allowed
 * - HOD -> Teacher: Allowed
 * - HOD -> HOD: Allowed
 * - HOD -> Admin: Allowed
 * - Admin -> Student: Allowed
 * - Admin -> Teacher: Allowed
 * - Admin -> HOD: Allowed
 * - Admin -> Admin: Allowed
 *
 * Important Rule:
 * All roles should be able to communicate with each other, except Student ↔ Student communication.
 * Students should not be able to communicate directly with other students.
 */

export function normalizeRole(role?: string): string {
  if (!role) return 'student';
  const r = role.toLowerCase().trim();
  if (r === 'faculty') return 'teacher';
  return r;
}

export function canCommunicate(
  senderRole?: string,
  recipientRole?: string
): boolean {
  if (!senderRole || !recipientRole) return false;
  const s = normalizeRole(senderRole);
  const r = normalizeRole(recipientRole);

  // Student ↔ Student communication is strictly disallowed
  if (s === 'student' && r === 'student') {
    return false;
  }

  // All other role-to-role communications are fully permitted
  return true;
}

export function getCommunicationPolicyMessage(
  senderRole?: string,
  recipientRole?: string
): string {
  const s = normalizeRole(senderRole);
  const r = normalizeRole(recipientRole);

  if (s === 'student' && r === 'student') {
    return 'Direct student-to-student messaging is restricted by university policy. Students can directly communicate with Faculty, HODs, and Administrators.';
  }

  return 'Authorized communication channel';
}

/**
 * Strips titles, designations, and parentheticals to normalize user names
 * for robust matching across system records (e.g. "Prof. Rishu Raj (HOD)" -> "rishu raj")
 */
export function cleanUserName(name?: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(prof\.|dr\.|mr\.|mrs\.|ms\.|shri)\s+/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates whether the given user is an authentic participant (sender or receiver)
 * of a message thread. Ensures STRICT PRIVATE CHAT ISOLATION:
 * No third party can ever view or access messages between two individuals.
 * Also allows participants in broadcast/group channels to participate.
 */
export function isThreadParticipant(
  thread: {
    senderId: string;
    senderName: string;
    senderEmail?: string;
    receiverId: string;
    receiverName: string;
    receiverRole?: string;
    receiverEmail?: string;
  },
  user?: User | null
): boolean {
  if (!user || !thread) return false;

  const uid = user.id;
  // 1. Direct ID match
  if (thread.senderId === uid || thread.receiverId === uid) {
    return true;
  }

  // 2. Broadcast / Group Recipient matching
  const rId = (thread.receiverId || '').toLowerCase().trim();
  const uRole = normalizeRole(user.role);

  if (rId === 'all_admin' || rId === 'all_admins' || rId === 'all_administration') {
    if (uRole === 'admin') return true;
  }
  if (rId === 'all_hod' || rId === 'all_hods') {
    if (uRole === 'hod') return true;
  }
  if (rId === 'all_teacher' || rId === 'all_teachers' || rId === 'all_faculty') {
    if (uRole === 'teacher') return true;
  }
  if (rId === 'all_student' || rId === 'all_students') {
    if (uRole === 'student') return true;
  }
  if (rId === 'all_members' || rId === 'all_campus') {
    return true;
  }

  const uEmail = (user.email || '').toLowerCase().trim();
  // 3. Direct Email match
  if (uEmail) {
    if (thread.senderEmail && thread.senderEmail.toLowerCase().trim() === uEmail) return true;
    if (thread.receiverEmail && thread.receiverEmail.toLowerCase().trim() === uEmail) return true;
  }

  // 4. Robust normalized name matching
  const uClean = cleanUserName(user.name);
  const sClean = cleanUserName(thread.senderName);
  const rClean = cleanUserName(thread.receiverName);

  if (uClean && (uClean === sClean || uClean === rClean)) {
    return true;
  }

  // Substring token match for multi-part names (e.g. "Shubham Manojbhai Lashkari" & "Shubham Lashkari")
  if (uClean && sClean) {
    if (uClean.includes(sClean) || sClean.includes(uClean)) return true;
  }
  if (uClean && rClean) {
    if (uClean.includes(rClean) || rClean.includes(uClean)) return true;
  }

  return false;
}

/**
 * Checks whether a message thread has been deleted specifically from the given user's account.
 * When a user deletes a thread, it is removed ONLY from that user's view/inbox.
 * The other participant(s) will continue to have full access to the chat history.
 */
export function isThreadDeletedForUser(
  thread: { deletedByUserIds?: string[] },
  user?: User | null
): boolean {
  if (!user || !thread || !thread.deletedByUserIds || !Array.isArray(thread.deletedByUserIds)) {
    return false;
  }
  const uId = user.id;
  const uEmail = (user.email || '').toLowerCase().trim();
  const uClean = cleanUserName(user.name);

  return thread.deletedByUserIds.some((deletedIdentifier) => {
    if (!deletedIdentifier) return false;
    const dTrimmed = deletedIdentifier.trim();
    const dLower = dTrimmed.toLowerCase();
    if (dTrimmed === uId) return true;
    if (uEmail && dLower === uEmail) return true;
    if (uClean && (cleanUserName(dTrimmed) === uClean || dLower === uClean)) return true;
    return false;
  });
}
