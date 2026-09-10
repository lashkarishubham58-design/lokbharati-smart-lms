export type UserRole = 'student' | 'teacher' | 'hod' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  avatar?: string;
  phone?: string;
  semester?: number; // For students
  enrollmentNo?: string; // For students
  employeeId?: string; // For faculty/admin
  designation?: string;
  officeLocation?: string;
  bio?: string;
  qualification?: string;
  address?: string;
  joiningDate?: string;
  password?: string;
  status?: 'active' | 'inactive' | 'deleted';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  degreeCode: 'BRS' | 'B.Voc' | 'BBA' | 'B.A.';
  degreeFullName: string;
  subDepartmentName: string;
  hodName: string;
  studentCount: number;
  facultyCount: number;
  description?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  semester: number;
  credits: number;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:00 AM"
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  departmentId: string;
  semester: number;
  teacherId: string;
  teacherName: string;
  classroom: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  timetableSlotId: string;
  date: string; // YYYY-MM-DD
  departmentId: string;
  semester: number;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classroom: string;
  lectureTime: string;
  isSubmitted: boolean;
  submittedAt?: string;
  studentEntries: {
    studentId: string;
    studentName: string;
    enrollmentNo: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface AttendanceEditRequest {
  id: string;
  attendanceRecordId: string;
  subjectName: string;
  date: string;
  teacherId: string;
  teacherName: string;
  departmentId: string;
  semester: number;
  reason: string;
  requestedChanges: {
    studentId: string;
    studentName: string;
    oldStatus: AttendanceStatus;
    newStatus: AttendanceStatus;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  hodComment?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  departmentId: string;
  semester: number;
  teacherId: string;
  teacherName: string;
  dueDate: string; // YYYY-MM-DD HH:mm
  totalMarks: number;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  submittedAt: string;
  fileUrl?: string;
  fileName?: string;
  comments?: string;
  isLate: boolean;
  marksObtained?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  departmentId: string;
  semester: number;
  teacherId: string;
  durationMinutes: number;
  totalMarks: number;
  questions: QuizQuestion[];
  dueDate: string;
  isPublished: boolean;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completedAt: string;
  timeTakenSeconds: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  departmentId: string;
  semester: number;
  academicYear: string;
  subjects: {
    subjectCode: string;
    subjectName: string;
    credits: number;
    internalMarks: number; // Max 30
    externalMarks: number; // Max 70
    totalMarks: number;    // Max 100
    grade: string;         // A+, A, B+, B, C, F
    gradePoint: number;
  }[];
  sgpa: number;
  cgpa: number;
  remarks: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'ppt' | 'video' | 'link' | 'doc';
  fileUrl: string;
  fileName: string;
  subjectId: string;
  subjectName: string;
  departmentId: string;
  semester: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  downloadCount: number;
}

export type NoticeType =
  | 'academic'
  | 'exam'
  | 'admission'
  | 'scholarship'
  | 'events'
  | 'placement'
  | 'department'
  | 'hostel'
  | 'finance'
  | 'general'
  | 'other'
  | 'urgent'
  | 'vacancy';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeType;
  departmentId?: string;
  departmentName?: string;
  targetAudience?: 'students' | 'faculty' | 'all';
  postedBy: string;
  postedByName: string;
  postedByRole: string;
  date: string;
  isPinned?: boolean;
  isRead?: boolean;
}

export interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'semester' | 'exam' | 'deadline' | 'holiday' | 'event';
  isImportant?: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string; // If specific, or all
  role?: UserRole;
  title: string;
  message: string;
  type: 'assignment' | 'quiz' | 'attendance' | 'notice' | 'result' | 'system' | 'request' | 'message' | 'document' | 'timetable';
  targetTab?: string;
  targetModal?: string;
  targetId?: string;
  link?: string;
  isRead: boolean;
  timestamp: string;
}

export interface MessageThread {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderEmail?: string;
  receiverId: string;
  receiverName: string;
  receiverRole: UserRole;
  receiverEmail?: string;
  subject: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
  }[];
  lastUpdated: string;
  deletedByUserIds?: string[];
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface DeletedStudentRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrollmentNo: string;
  rollNo?: string;
  departmentId: string;
  departmentName: string;
  semester?: number;
  phone?: string;
  deletedAt: string;
  deletedBy: string;
  deletedByRole: UserRole;
  reason: string;
}

export type StudentRequestCategory =
  | 'general_leave'
  | 'medical_leave'
  | 'attendance_correction'
  | 'attendance_shortage'
  | 'exam_permission'
  | 'exam_reschedule'
  | 'assignment_extension'
  | 'on_duty'
  | 'internship_ojt'
  | 'sports_nss_cultural'
  | 'educational_visit'
  | 'late_entry_early_exit'
  | 'hostel_leave_outing'
  | 'certificate_document'
  | 'fee_scholarship'
  | 'other_academic'
  | 'leave'
  | 'medical'
  | 'onduty'
  | 'exam'
  | 'general';

export interface RequestCategoryOption {
  id: StudentRequestCategory;
  label: string;
  description: string;
  defaultRecipient?: 'hod' | 'admin';
}

export const STUDENT_REQUEST_CATEGORIES: RequestCategoryOption[] = [
  {
    id: 'general_leave',
    label: 'General Leave Request',
    description: 'Standard leave of absence for personal, family, or domestic reasons',
    defaultRecipient: 'hod',
  },
  {
    id: 'medical_leave',
    label: 'Medical Leave Request',
    description: 'Medical treatment, sickness, or hospitalization leave exemption',
    defaultRecipient: 'hod',
  },
  {
    id: 'attendance_correction',
    label: 'Attendance Correction Request',
    description: 'Attendance log correction due to technical or biometric mismatch',
    defaultRecipient: 'hod',
  },
  {
    id: 'attendance_shortage',
    label: 'Attendance Shortage / Condone Request',
    description: 'Semester attendance shortage condonation appeal before term end',
    defaultRecipient: 'hod',
  },
  {
    id: 'exam_permission',
    label: 'Exam / Test Permission',
    description: 'Special permission for unit tests, mid-terms, or practical exams',
    defaultRecipient: 'hod',
  },
  {
    id: 'exam_reschedule',
    label: 'Exam Rescheduling Request',
    description: 'Exam rescheduling petition due to valid conflicting emergency',
    defaultRecipient: 'hod',
  },
  {
    id: 'assignment_extension',
    label: 'Assignment Extension Request',
    description: 'Extension request for lab work, project submission, or course assignments',
    defaultRecipient: 'hod',
  },
  {
    id: 'on_duty',
    label: 'On-Duty (OD) Permission',
    description: 'Official academic on-duty attendance exemption for official representation',
    defaultRecipient: 'hod',
  },
  {
    id: 'internship_ojt',
    label: 'Internship / OJT Permission',
    description: 'No-Objection Certificate & permission for off-campus industry internship',
    defaultRecipient: 'hod',
  },
  {
    id: 'sports_nss_cultural',
    label: 'Sports / NSS / Cultural Activity Permission',
    description: 'University sports meet, NSS camp, or youth festival attendance credit',
    defaultRecipient: 'hod',
  },
  {
    id: 'educational_visit',
    label: 'Educational / Industrial Visit Permission',
    description: 'Permission & gate pass for university educational or industrial tour',
    defaultRecipient: 'hod',
  },
  {
    id: 'late_entry_early_exit',
    label: 'Late Entry / Early Exit Permission',
    description: 'Campus gate permission for unavoidable late entry or early departure',
    defaultRecipient: 'admin',
  },
  {
    id: 'hostel_leave_outing',
    label: 'Hostel Leave / Outing Permission',
    description: 'Hostel warden outpass, weekend home visit, or night-out permission',
    defaultRecipient: 'admin',
  },
  {
    id: 'certificate_document',
    label: 'Certificate / Document Request',
    description: 'Bonafide certificate, medium of instruction, recommendation or transcript',
    defaultRecipient: 'admin',
  },
  {
    id: 'fee_scholarship',
    label: 'Fee / Scholarship Request',
    description: 'Tuition fee installment, concession, scholarship verification petition',
    defaultRecipient: 'admin',
  },
  {
    id: 'other_academic',
    label: 'Other Academic Request',
    description: 'Other institutional academic or administrative petitions',
    defaultRecipient: 'hod',
  },
];

export function formatRequestCategory(type?: string): string {
  if (!type) return 'General Leave Request';
  const t = type.toLowerCase().trim();
  const match = STUDENT_REQUEST_CATEGORIES.find((c) => c.id === t);
  if (match) return match.label;

  if (t === 'leave') return 'General Leave Request';
  if (t === 'medical') return 'Medical Leave Request';
  if (t === 'onduty') return 'On-Duty (OD) Permission';
  if (t === 'exam') return 'Exam / Test Permission';
  if (t === 'general') return 'Certificate / Document Request';

  return t
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  departmentId?: string;
  departmentName?: string;
  semester: number;
  recipientRole: 'hod' | 'admin';
  requestType: StudentRequestCategory;
  subject: string;
  reason: string;
  startDate: string;
  endDate: string;
  days?: string;
  attachment?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedAt?: number;
  reviewedBy?: string;
  reviewComment?: string;
  isCleared?: boolean;
  clearedAt?: number;
}

// ==================== AI COPILOT & MULTI-AGENT TYPES ====================

export type AIAgentType =
  | 'master'
  | 'attendance'
  | 'notes'
  | 'exam'
  | 'coding'
  | 'erp'
  | 'leave'
  | 'study_plan'
  | 'notification';

export interface AICitation {
  title: string;
  page?: number;
  snippet?: string;
  sourceDocId?: string;
}

export interface AIToolExecution {
  toolName: string;
  status: 'executing' | 'success' | 'failed';
  input?: any;
  result?: any;
}

export interface AICopilotMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  agentType?: AIAgentType;
  text: string;
  timestamp: string;
  citations?: AICitation[];
  toolExecutions?: AIToolExecution[];
  codeBlock?: {
    language: string;
    code: string;
    explanation?: string;
  };
  structuredData?: any;
  suggestedPrompts?: string[];
  feedback?: 'like' | 'dislike' | null;
}

export interface AICopilotConversation {
  id: string;
  title: string;
  userId: string;
  agentType: AIAgentType;
  messages: AICopilotMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIMemoryProfile {
  studentId: string;
  weakTopics: { topic: string; subject: string; errorCount: number }[];
  strongTopics: { topic: string; subject: string; score: number }[];
  learningPreferences: string[];
  recentQuizScores: { quizTitle: string; percentage: number; date: string }[];
  attendanceAlertAcknowledged?: boolean;
  examReadinessEstimate?: number;
}

// ==================== RAG & DOCUMENT INTELLIGENCE ====================

export interface RAGChunk {
  id: string;
  docId: string;
  docTitle: string;
  pageNumber: number;
  content: string;
  keywords: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface RAGDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'image';
  subjectId: string;
  subjectName: string;
  departmentId: string;
  uploadedBy: string;
  uploadedAt: string;
  extractedText: string;
  chunks: RAGChunk[];
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  importantQuestions: {
    shortQuestions: string[];
    longQuestions: string[];
    mcqs: { question: string; options: string[]; answer: string; explanation: string }[];
    vivaQuestions: string[];
  };
  flashcards: Flashcard[];
  revisionNotes: string;
  mindMap: MindMapNode;
}

// ==================== EXAM PREP & AI QUIZ ENGINE ====================

export type ExamDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ExamQuestionType = 'mcq' | 'true_false' | 'fill_blanks' | 'short_answer' | 'long_answer' | 'coding' | 'viva';

export interface ExamPrepQuestion {
  id: string;
  type: ExamQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  topic: string;
  unit: string;
  marks: number;
}

export interface ExamReport {
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  strongTopics: string[];
  weakTopics: string[];
  topicBreakdown: { topic: string; score: number; maxScore: number }[];
  recommendedRevision: string[];
  examReadinessPercentage: number;
  aiFeedback: string;
}

export interface ExamPrepSession {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  unit: string;
  difficulty: ExamDifficulty;
  questionTypes: ExamQuestionType[];
  questions: ExamPrepQuestion[];
  userAnswers: Record<string, string | number>;
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  report?: ExamReport;
}

// ==================== CODING TUTOR ====================

export type CodingLanguage = 'cpp' | 'python' | 'javascript' | 'html_css' | 'sql' | 'react' | 'nodejs';

export interface CodeAnalysisResult {
  explanation?: string[];
  syntaxErrors?: string[];
  logicalIssues?: string[];
  optimizations?: string[];
  improvedCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  bestPractices?: string[];
}

// ==================== SMART STUDY PLANNER ====================

export interface StudyPlanDay {
  dayNumber: number;
  date: string;
  focusSubject: string;
  topic: string;
  targetDurationMinutes: number;
  goals: string[];
  practiceQuestionsCount: number;
  isCompleted: boolean;
  notes?: string;
}

export interface SmartStudyPlan {
  id: string;
  studentId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  targetExamDate: string;
  totalDays: number;
  dailyPlans: StudyPlanDay[];
  createdAt: string;
  progressPercentage: number;
}

// ==================== SMART LEAVE WORKFLOW ====================

export type LeaveApprovalState = 'approved' | 'pending' | 'rejected' | 'not_started';

export interface LeaveWorkflowStage {
  role: 'hod' | 'hostel_head' | 'registrar';
  title: string;
  approverName?: string;
  status: LeaveApprovalState;
  updatedAt?: string;
  comment?: string;
}

export interface SmartLeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  departmentId: string;
  departmentName: string;
  semester: number;
  leaveType: 'academic' | 'medical' | 'hostel_outpass' | 'family_emergency' | 'sports_cultural';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  submittedAt: string;
  overallStatus: 'approved' | 'pending' | 'rejected' | 'cancelled';
  stages: {
    hod: LeaveWorkflowStage;
    hostel: LeaveWorkflowStage;
    registrar: LeaveWorkflowStage;
  };
}


