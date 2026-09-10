import React, { useState, useRef, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Award,
  Filter,
  Search,
  Paperclip,
  X,
  FileCode,
  FileType,
  UserCheck,
  Building2,
  GraduationCap,
  BookOpen,
  Lock,
  Eye,
  CheckSquare,
  MessageSquare,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Sparkles,
  Trash2
} from 'lucide-react';
import { User, Assignment, AssignmentSubmission } from '../../types';
import { isPast24HoursAfterDueDate } from '../../utils/dateUtils';
import { SUBJECTS } from '../../data/mockDatabase';

interface AssignmentsModuleProps {
  user: User;
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  onCreateAssignment: (asg: Partial<Assignment>) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
  onSubmitAssignment: (sub: Partial<AssignmentSubmission>) => void;
  onGradeSubmission?: (submissionId: string, marksObtained: number, feedback: string) => void;
}

const DEPARTMENTS_LIST = [
  { id: 'dept_it', code: 'BVOC-IT', name: 'Information Technology' },
  { id: 'dept_brs_agronomy', code: 'BRS-AGRO', name: 'Agronomy' },
  { id: 'dept_brs_ahds', code: 'BRS-AHDS', name: 'Animal Husbandry & Dairy Science' },
  { id: 'dept_brs_horti', code: 'BRS-HORT', name: 'Horticulture' },
  { id: 'dept_bvoc_nf', code: 'BVOC-NF', name: 'Natural Farming' },
  { id: 'dept_bvoc_afp', code: 'BVOC-AFP', name: 'Agro-food processing' },
  { id: 'dept_bba', code: 'BBA', name: 'Bachelor of Business Administration' },
  { id: 'dept_ba_english', code: 'BA-ENG', name: 'B.A. English' },
];

const SUBJECTS_BY_DEPT_SEM: Record<string, Record<number, { id: string; name: string }[]>> = {
  dept_it: {
    3: [
      { id: 'sub_mj305', name: '08BVOCMJ305: Oops – using C++' },
      { id: 'sub_py_django', name: '08BVOCMJ307: Python & Django Web Framework' },
      { id: 'sub_mj306', name: '08BVOCMJ306: Software Engineering' },
      { id: 'sub_ae303', name: '08BVOCAE303: Values and Ethics' },
      { id: 'sub_se303', name: '08BVOCSE303: Google Tools' },
      { id: 'sub_va303', name: '08BVOCVA303: Rural Innovation' },
      { id: 'sub_ojt303', name: '08BVOCOJT303: Project Work' },
    ],
  },
  dept_brs_agronomy: {
    3: [
      { id: 'sub_brs_agro_mj303', name: '03BRSMJ303: Crop Production Technology-I (Kharif)' },
      { id: 'sub_brs_agro_mj304', name: '03BRSMJ304: Soil and Soil Fertility' },
      { id: 'sub_brs_agro_mn303', name: '03BRSMN303: Principles of Animal Nutrition (Part 1)' },
      { id: 'sub_brs_agro_ae303', name: '03BRSAE303: Value and Ethics' },
      { id: 'sub_brs_agro_se303', name: '03BRSSE303: Google Tools' },
      { id: 'sub_brs_agro_va303', name: '03BR(SV)A303: Rural Innovation' },
      { id: 'sub_brs_agro_proj303', name: '03BRSOJT303: Project Work' },
    ],
  },
  dept_brs_ahds: {
    3: [
      { id: 'sub_brs_ahds_mj303', name: '03BRSMJ303: Principles of Animal Nutrition (Part 1)' },
      { id: 'sub_brs_ahds_mj304', name: '03BRSMJ304: Animal Breeding & Reproduction' },
      { id: 'sub_brs_ahds_mn303', name: '03BRSMN303: Crop Production Technology-I (Kharif)' },
      { id: 'sub_brs_ahds_ae303', name: '04BRSAE303: Value and Ethics' },
      { id: 'sub_brs_ahds_se303', name: '04BRSSE303: Google Tools' },
      { id: 'sub_brs_ahds_va303', name: '04BRSVA303: Rural Innovation' },
      { id: 'sub_brs_ahds_proj303', name: '04BRSOJT303: Project Work' },
    ],
  },
  dept_bvoc_nf: {
    3: [
      { id: 'sub_nf_mj305', name: '06BVOCMJ305: Introduction to Plant Life' },
      { id: 'sub_nf_mj306', name: '06BVOCMJ306: Natural Crop Protection' },
      { id: 'sub_nf_ae303', name: '06BVOCAE303: Value and Ethics' },
      { id: 'sub_nf_se303', name: '06BVOCSE303: Google Tools' },
      { id: 'sub_nf_va303', name: '06BVOCVA303: Rural Innovation' },
      { id: 'sub_nf_proj303', name: '06BVOCOJT303: Project Work' },
    ],
  },
  dept_bvoc_afp: {
    3: [
      { id: 'sub_afp_mj305', name: '05BVOCMJ305: Processing Technology for Non-food Agro Products' },
      { id: 'sub_afp_mj306', name: '05BVOCMJ306: Unit Operations in Agro Processing' },
      { id: 'sub_afp_ae303', name: '05BVOCAE303: Value and Ethics' },
      { id: 'sub_afp_se303', name: '05BVOCSE303: Google Tools' },
      { id: 'sub_afp_va303', name: '05VOCVA303: Rural Innovation' },
      { id: 'sub_afp_proj303', name: '05BVOCOJT303: Project Work' },
    ],
  },
  dept_bba: {
    3: [
      { id: 'sub_bba_mj303', name: '09BBAMJ303: Consumer Behavior' },
      { id: 'sub_bba_mn303', name: '09BBAMN303: Supply Chain Management' },
      { id: 'sub_bba_ae303', name: '09BBAAE303: Values and Ethics' },
      { id: 'sub_bba_se303', name: '09BBASE303: Google Tools' },
      { id: 'sub_bba_va303', name: '09BBAVA303: Rural Innovation' },
      { id: 'sub_bba_proj303', name: '09BBAOJT303: Project Work' },
    ],
  },
  dept_ba_english: {
    3: [
      { id: 'sub_ba_mj303', name: '01BAMJ303: Introduction to Literature' },
      { id: 'sub_ba_mj304', name: '01BAMJ304: British Poetry & Drama: 14th – 17th C' },
      { id: 'sub_ba_mn303', name: '01BAMN303: ગુજરાતી નિબંધ (Gujarati Essay)' },
      { id: 'sub_ba_ae303', name: '01BAAE303: Value and Ethics' },
      { id: 'sub_ba_se303', name: '01BASE303: Google Tools' },
      { id: 'sub_ba_va303', name: '01BAVA303: Rural Innovation' },
      { id: 'sub_ba_proj303', name: '01BAOJT303: Project Work' },
    ],
  },
};

export const AssignmentsModule: React.FC<AssignmentsModuleProps> = ({
  user,
  assignments = [],
  submissions = [],
  onCreateAssignment,
  onDeleteAssignment,
  onSubmitAssignment,
  onGradeSubmission,
}) => {
  // Navigation View Tab: 'assignments' | 'grading'
  const [activeTab, setActiveTab] = useState<'assignments' | 'grading'>('assignments');

  // Deleting Assignment State
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  // Department, Semester & Subject Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    user.role === 'student' ? user.departmentId || 'dept_it' : user.departmentId || 'all'
  );
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 24-Hour Auto-Removal Policy toggle (default false = automatically hide/remove 24h past due)
  const [showArchivedPast24h, setShowArchivedPast24h] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);

  // Document Inspection & Paperwork Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedSubmissionToInspect, setSelectedSubmissionToInspect] = useState<AssignmentSubmission | null>(null);
  const [inspectionTab, setInspectionTab] = useState<'document' | 'paperwork'>('document');
  const [docPage, setDocPage] = useState<number>(1);
  const [docZoom, setDocZoom] = useState<number>(100);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmissionToGrade, setSelectedSubmissionToGrade] = useState<AssignmentSubmission | null>(null);

  // Form states - Assignment Creation
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeptId, setNewDeptId] = useState(user.departmentId || 'dept_it');
  const [newSem, setNewSem] = useState(user.semester || 3);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-08-15T23:59');
  const [newTotalMarks, setNewTotalMarks] = useState(50);
  const [teacherFile, setTeacherFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);

  // Form states - Student Submission
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionFileSize, setSubmissionFileSize] = useState('');
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionFileObj, setSubmissionFileObj] = useState<File | null>(null);
  const [submissionFileDataUrl, setSubmissionFileDataUrl] = useState<string>('');

  // Form states - Teacher Grading
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');

  const teacherFileInputRef = useRef<HTMLInputElement>(null);
  const studentFileInputRef = useRef<HTMLInputElement>(null);

  // Helper file icon renderer
  const renderFileBadge = (fileName?: string) => {
    if (!fileName) return <FileText className="w-4 h-4 text-slate-400" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <FileType className="w-3 h-3 text-rose-600" /> PDF
        </span>
      );
    }
    if (ext === 'ppt' || ext === 'pptx') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <FileType className="w-3 h-3 text-amber-600" /> PPT / Slides
        </span>
      );
    }
    if (ext === 'doc' || ext === 'docx') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <FileText className="w-3 h-3 text-blue-600" /> Word Doc
        </span>
      );
    }
    if (ext === 'zip' || ext === 'rar') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <FileCode className="w-3 h-3 text-purple-600" /> ZIP Archive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <Paperclip className="w-3 h-3 text-emerald-600" /> Document
      </span>
    );
  };

  // Dynamically populated subject dropdown options for creation form
  const availableCreationSubjects = useMemo(() => {
    const deptSubs = SUBJECTS.filter((s) => s.departmentId === newDeptId && (!newSem || s.semester === newSem));
    if (deptSubs.length > 0) {
      return deptSubs.map((s) => ({ id: s.id, name: `${s.code}: ${s.name}` }));
    }
    return SUBJECTS_BY_DEPT_SEM[newDeptId]?.[newSem] || [
      { id: 'sub_generic', name: 'General Course Work' },
    ];
  }, [newDeptId, newSem]);

  // Dynamically derived unique list of subjects for filtering
  const allFilteredSubjectsList = Array.from(
    new Set(assignments.map((a) => a.subjectName).filter(Boolean))
  );

  // Filter assignments by Department, Semester, Subject, Search query, and 24-Hour Removal Policy
  const filteredAssignments = assignments.filter((asg) => {
    // Auto-remove assignment if 24 hours have passed after the due date
    if (!showArchivedPast24h && isPast24HoursAfterDueDate(asg.dueDate)) {
      return false;
    }

    if (user.role === 'student' && asg.departmentId && asg.departmentId !== user.departmentId) {
      return false;
    }
    const activeDept = user.role === 'student' ? user.departmentId : selectedDeptFilter;
    if (activeDept && activeDept !== 'all' && asg.departmentId && asg.departmentId !== activeDept) return false;

    if (selectedSemFilter !== 'all' && asg.semester !== parseInt(selectedSemFilter)) return false;
    if (selectedSubjectFilter !== 'all' && asg.subjectName !== selectedSubjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = asg.title.toLowerCase().includes(q);
      const matchDesc = asg.description.toLowerCase().includes(q);
      const matchSub = asg.subjectName.toLowerCase().includes(q);
      const matchTeach = asg.teacherName.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSub || matchTeach;
    }
    return true;
  });

  // Handle file uploads for teacher reference documents
  const handleTeacherFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTeacherFile({
          name: file.name,
          size: `${sizeMb} MB`,
          dataUrl: (evt.target?.result as string) || '',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle student submission file select
  const handleStudentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmissionFileObj(file);
      setSubmissionFileName(file.name);
      const sizeKb = Math.round(file.size / 1024);
      setSubmissionFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${sizeKb} KB`);

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSubmissionFileDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler for Creating Assignment
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = DEPARTMENTS_LIST.find((d) => d.id === newDeptId);
    const subName = newSubjectName || availableCreationSubjects[0]?.name || 'General Course Assignment';

    onCreateAssignment({
      title: newTitle,
      description: newDescription,
      subjectId: `sub_${newDeptId}_s${newSem}_${Date.now()}`,
      subjectName: subName,
      departmentId: newDeptId,
      semester: newSem,
      teacherId: user.id,
      teacherName: user.name,
      dueDate: newDueDate.replace('T', ' '),
      totalMarks: newTotalMarks,
      attachmentName: teacherFile?.name,
      attachmentUrl: teacherFile?.dataUrl || '#',
    });

    setCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setTeacherFile(null);
  };

  // Submit Handler for Student Solution Upload
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const isPastDeadline = new Date() > new Date(selectedAssignment.dueDate);
    if (isPastDeadline) {
      alert('Submissions for this assignment are closed as the deadline has passed.');
      setSubmitModalOpen(false);
      return;
    }

    let fileUrl = submissionFileDataUrl || '#';
    if ((!fileUrl || fileUrl === '#') && submissionFileObj) {
      fileUrl = URL.createObjectURL(submissionFileObj);
    }

    onSubmitAssignment({
      assignmentId: selectedAssignment.id,
      studentId: user.id,
      studentName: user.name,
      enrollmentNo: user.enrollmentNo || '2024STUDENT',
      fileName: submissionFileName || `${user.name.replace(/\s+/g, '_')}_Solution.pdf`,
      fileUrl,
      comments: submissionComments,
      isLate: false,
    });

    setSubmitModalOpen(false);
    setSubmissionFileName('');
    setSubmissionFileSize('');
    setSubmissionComments('');
    setSubmissionFileObj(null);
    setSubmissionFileDataUrl('');
  };

  // Export Submissions to CSV for Faculty & Admins
  const handleExportSubmissionsCSV = (targetAssignmentId?: string) => {
    const listToExport = targetAssignmentId
      ? submissions.filter((s) => s.assignmentId === targetAssignmentId)
      : submissions;

    if (listToExport.length === 0) {
      alert('No student submissions found to export for the selected filter.');
      return;
    }

    const targetAsg = targetAssignmentId ? assignments.find((a) => a.id === targetAssignmentId) : null;

    const headers = [
      'Student Name',
      'Enrollment / Roll No',
      'Department',
      'Semester',
      'Subject Code / Name',
      'Assignment Title',
      'Maximum Marks',
      'Marks Obtained',
      'Evaluation Status',
      'Submission Timestamp',
      'Submitted File Name',
      'Late Submission',
      'Faculty Feedback / Remarks'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listToExport.map((sub) => {
      const asg = assignments.find((a) => a.id === sub.assignmentId);
      return [
        escapeCsv(sub.studentName),
        escapeCsv(sub.enrollmentNo),
        escapeCsv(user.departmentName || asg?.departmentId || 'Lokbharti University'),
        escapeCsv(asg?.semester ? `Semester ${asg.semester}` : 'N/A'),
        escapeCsv(asg?.subjectName || 'Coursework'),
        escapeCsv(asg?.title || 'Assignment'),
        escapeCsv(asg?.totalMarks || 50),
        escapeCsv(sub.marksObtained !== undefined ? sub.marksObtained : 'Pending Review'),
        escapeCsv(sub.status || 'submitted'),
        escapeCsv(sub.submittedAt.replace('T', ' ').slice(0, 19)),
        escapeCsv(sub.fileName),
        escapeCsv(sub.isLate ? 'YES (LATE)' : 'NO (ON TIME)'),
        escapeCsv(sub.feedback || '')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nowStr = new Date().toISOString().slice(0, 10);
    const fileNamePrefix = targetAsg
      ? `Lokbharti_Submissions_${targetAsg.subjectName.replace(/[^a-zA-Z0-9]/g, '_')}_Sem${targetAsg.semester || 3}_${nowStr}`
      : `Lokbharti_All_Submissions_Report_${nowStr}`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileNamePrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to convert base64 Data URLs to binary Blob objects without data corruption
  const dataUrlToBlob = (dataUrl: string): Blob => {
    try {
      const parts = dataUrl.split(',');
      if (parts.length < 2) {
        return new Blob([dataUrl], { type: 'text/plain;charset=utf-8' });
      }
      const header = parts[0];
      const rawData = parts[1];

      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

      if (header.includes(';base64')) {
        // Strip whitespace, newlines, and decode URI components if encoded
        const cleanBase64 = decodeURIComponent(rawData).replace(/[\r\n\s]/g, '');
        const binaryStr = atob(cleanBase64);
        const len = binaryStr.length;
        const u8arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          u8arr[i] = binaryStr.charCodeAt(i);
        }
        return new Blob([u8arr], { type: mime });
      } else {
        const text = decodeURIComponent(rawData);
        return new Blob([text], { type: mime });
      }
    } catch (err) {
      console.error('Failed to parse dataUrl into Blob:', err);
      // If base64 parsing fails, fallback to clean text blob rather than corrupted string
      return new Blob([dataUrl], { type: 'application/octet-stream' });
    }
  };

  // Helper to generate a 100% valid, non-corrupted PDF 1.4 binary Blob
  const createPdfBlob = (title: string, studentName: string, rollNo: string, date: string, comments: string): Blob => {
    const sanitize = (text: string) => (text || '').replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E\n]/g, ' ');

    const headerLines = [
      `LOKBHARTI UNIVERSITY SANOSARA - ACADEMIC PORTAL`,
      `OFFICIAL COURSEWORK SUBMISSION DOCUMENT`,
      `======================================================================`,
      `Document File: ${sanitize(title)}`,
      `Student Name : ${sanitize(studentName)}`,
      `Roll / Reg No: ${sanitize(rollNo)}`,
      `Submitted At : ${sanitize(date)}`,
      `======================================================================`,
      ``,
      `STUDENT COURSEWORK COMMENTS & SUBMISSION CONTENT:`,
      `----------------------------------------------------------------------`
    ];

    const rawComments = sanitize(comments || 'Attached student assignment submission and coursework files. Verified original coursework.');
    const commentLines = rawComments.split('\n');
    for (const cLine of commentLines) {
      if (cLine.length > 70) {
        for (let i = 0; i < cLine.length; i += 70) {
          headerLines.push(cLine.substring(i, i + 70));
        }
      } else {
        headerLines.push(cLine);
      }
    }

    headerLines.push(
      ``,
      `----------------------------------------------------------------------`,
      `Academic Verification Docket: LBU/SUB/${Math.floor(Math.random() * 899999 + 100000)}`,
      `Official Stamp: Lokbharti University Academic Registry Sanosara`
    );

    let streamCommands = `BT\n/F1 12 Tf\n50 740 Td\n16 TL\n`;
    for (const line of headerLines) {
      if (line.startsWith('LOKBHARTI') || line.startsWith('OFFICIAL')) {
        streamCommands += `/F1 14 Tf\n(${line}) Tj T*\n/F1 11 Tf\n`;
      } else if (line.startsWith('===')) {
        streamCommands += `/F1 10 Tf\n(${line}) Tj T*\n/F1 11 Tf\n`;
      } else {
        streamCommands += `(${line}) Tj T*\n`;
      }
    }
    streamCommands += `ET`;

    const streamLen = streamCommands.length;

    const headerStr = `%PDF-1.4\n`;
    const obj1Str = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2Str = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3Str = `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n`;
    const obj4Str = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
    const obj5Str = `5 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamCommands}\nendstream\nendobj\n`;

    const off1 = headerStr.length;
    const off2 = off1 + obj1Str.length;
    const off3 = off2 + obj2Str.length;
    const off4 = off3 + obj3Str.length;
    const off5 = off4 + obj4Str.length;
    const startXref = off5 + obj5Str.length;

    const pad10 = (num: number) => String(num).padStart(10, '0');

    const xrefStr = `xref\n0 6\n0000000000 65535 f \n${pad10(off1)} 00000 n \n${pad10(off2)} 00000 n \n${pad10(off3)} 00000 n \n${pad10(off4)} 00000 n \n${pad10(off5)} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    const fullPdfText = headerStr + obj1Str + obj2Str + obj3Str + obj4Str + obj5Str + xrefStr;
    return new Blob([fullPdfText], { type: 'application/pdf' });
  };

  // Helper to generate a valid MS Word / RTF Blob
  const createWordDocBlob = (title: string, studentName: string, rollNo: string, date: string, comments: string): Blob => {
    const clean = (s: string) => (s || '').replace(/[\{\}\\]/g, '');
    const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}
\\viewkind4\\uc1\\pard\\lang1033\\f0\\fs28\\b LOKBHARTI UNIVERSITY SANOSARA\\par
\\fs22\\b0 OFFICIAL STUDENT SUBMISSION DOCUMENT\\par
==================================================\\par
\\b Document Name:\\b0  ${clean(title)}\\par
\\b Student Name:\\b0   ${clean(studentName)}\\par
\\b Enrollment No:\\b0  ${clean(rollNo)}\\par
\\b Submitted At:\\b0   ${clean(date)}\\par
==================================================\\par
\\line
\\b SUBMISSION CONTENT & COURSEWORK NOTES:\\b0\\par
${clean(comments || 'Attached student assignment submission and coursework files.').replace(/\n/g, '\\par ')}\\par
\\line
\\i Official Academic Docket: LBU/SUB/${Math.floor(Math.random() * 899999 + 100000)}\\i0\\par
}`;
    return new Blob([rtf], { type: 'application/msword;charset=utf-8' });
  };

  // Helper to generate a valid PowerPoint / RTF Presentation Blob
  const createPowerPointBlob = (title: string, studentName: string, rollNo: string, date: string, comments: string): Blob => {
    const clean = (s: string) => (s || '').replace(/[\{\}\\]/g, '');
    const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}
\\viewkind4\\uc1\\pard\\lang1033\\f0\\fs28\\b LOKBHARTI UNIVERSITY - PRESENTATION SLIDES\\par
\\fs22\\b0 OFFICIAL COURSEWORK PRESENTATION DECK\\par
==================================================\\par
\\b Presentation Title:\\b0  ${clean(title)}\\par
\\b Student Presenter:\\b0   ${clean(studentName)} (${clean(rollNo)})\\par
\\b Submission Time:\\b0    ${clean(date)}\\par
==================================================\\par
\\line
\\b SLIDE ABSTRACT & SPEAKER NOTES:\\b0\\par
${clean(comments || 'Attached student presentation deck slides.').replace(/\n/g, '\\par ')}\\par
\\line
\\i Official Academic Docket: LBU/SUB/${Math.floor(Math.random() * 899999 + 100000)}\\i0\\par
}`;
    return new Blob([rtf], { type: 'application/vnd.ms-powerpoint;charset=utf-8' });
  };

  // Handler to open Document Inspection & Paperwork Modal (In-App Dialog)
  const handleInspectSubmission = (sub: AssignmentSubmission) => {
    setSelectedSubmissionToInspect(sub);
    setDocPage(1);
    setDocZoom(100);
    setInspectionTab('document');
    setInspectionModalOpen(true);
  };

  // Handler to open or download the actual submitted PPT, PDF, or DOC file link
  const handleDownloadOrOpenSubmittedFile = (sub: AssignmentSubmission) => {
    const fileName = sub.fileName || 'Submitted_File.pdf';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    let blobUrl: string;
    let isDataUrl = false;

    if (sub.fileUrl && sub.fileUrl !== '#' && sub.fileUrl !== '') {
      if (sub.fileUrl.startsWith('data:')) {
        isDataUrl = true;
        const blob = dataUrlToBlob(sub.fileUrl);
        blobUrl = URL.createObjectURL(blob);
      } else {
        blobUrl = sub.fileUrl;
      }
    } else {
      // Fallback binary generation based on exact file type
      let blob: Blob;
      if (ext === 'pdf') {
        blob = createPdfBlob(fileName, sub.studentName, sub.enrollmentNo, sub.submittedAt, sub.comments);
      } else if (ext === 'doc' || ext === 'docx') {
        blob = createWordDocBlob(fileName, sub.studentName, sub.enrollmentNo, sub.submittedAt, sub.comments);
      } else if (ext === 'ppt' || ext === 'pptx') {
        blob = createPowerPointBlob(fileName, sub.studentName, sub.enrollmentNo, sub.submittedAt, sub.comments);
      } else {
        const textContent = `LOKBHARTI UNIVERSITY SANOSARA - ACADEMIC PORTAL\nOFFICIAL STUDENT COURSEWORK SUBMISSION FILE\n\nStudent Name : ${sub.studentName}\nEnrollment No: ${sub.enrollmentNo}\nFile Name    : ${fileName}\nSubmitted At : ${sub.submittedAt}\n\nSubmission Notes & Comments:\n${sub.comments || 'Attached student assignment submission file.'}\n`;
        blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      }
      blobUrl = URL.createObjectURL(blob);
    }

    // Trigger direct file download
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // If PDF or image/blob URL, also open in new tab
    if (ext === 'pdf' || (!isDataUrl && !sub.fileUrl?.startsWith('data:'))) {
      setTimeout(() => {
        window.open(blobUrl, '_blank');
      }, 150);
    }
  };

  // Helper alias for opening student document
  const handleOpenStudentDocument = (sub: AssignmentSubmission) => {
    handleDownloadOrOpenSubmittedFile(sub);
  };

  // Helper to trigger direct browser download of the submitted assignment document file
  const handleDownloadSubmissionFile = (sub: AssignmentSubmission) => {
    handleDownloadOrOpenSubmittedFile(sub);
  };

  // Submit Handler for Grading
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionToGrade || !onGradeSubmission) return;

    onGradeSubmission(selectedSubmissionToGrade.id, gradeMarks, gradeFeedback);
    setGradingModalOpen(false);
    setSelectedSubmissionToGrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Course Assignments & Departmental Submissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Department-wise assignment publishing, course material distribution, secure document submission & deadline tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Navigation Tabs for Teachers/HODs/Admins */}
          {(user.role === 'teacher' || user.role === 'admin' || user.role === 'hod') && (
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'assignments'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Assignments</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('grading')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'grading'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Review Submissions ({submissions.length})</span>
              </button>
            </div>
          )}

          {(user.role === 'teacher' || user.role === 'admin' || user.role === 'hod') && (
            <button
              onClick={() => {
                setNewSubjectName(availableCreationSubjects[0]?.name || '');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
              id="create-assignment-btn"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Department, Semester & Subject Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Department & Course Filters:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 lg:max-w-4xl">
            {/* Department Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={user.role === 'student' ? user.departmentId || 'dept_it' : selectedDeptFilter}
                onChange={(e) => {
                  setSelectedDeptFilter(e.target.value);
                  setSelectedSubjectFilter('all');
                }}
                disabled={user.role === 'student'}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {user.role !== 'student' && <option value="all">All University Departments</option>}
                {(user.role === 'student'
                  ? DEPARTMENTS_LIST.filter((d) => d.id === user.departmentId)
                  : DEPARTMENTS_LIST
                ).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                value={selectedSemFilter}
                onChange={(e) => {
                  setSelectedSemFilter(e.target.value);
                  setSelectedSubjectFilter('all');
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Semesters (Sem 1 – 6)</option>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Subject / Course
              </label>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Course Subjects</option>
                {allFilteredSubjectsList.map((subName) => (
                  <option key={subName} value={subName}>
                    {subName}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search Input */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Search Keyword
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title, teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Removal Policy Footer Status Bar */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px]">
              <strong className="text-slate-700 dark:text-slate-300">Auto-Removal Policy:</strong> Assignments are automatically removed 24 hours after their due date passes.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowArchivedPast24h(!showArchivedPast24h)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              showArchivedPast24h
                ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{showArchivedPast24h ? 'Hiding Expired (>24h)' : 'Show Expired (>24h Overdue)'}</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: ASSIGNMENTS CARDS GRID */}
      {activeTab === 'assignments' && (
        <>
          {filteredAssignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No assignments found for this filter combination
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try selecting "All University Departments" or "All Semesters" in the filter bar above to view all coursework assignments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssignments.map((asg) => {
                const userSub = submissions.find(
                  (s) => s.assignmentId === asg.id && s.studentId === user.id
                );
                const isOverdue = new Date() > new Date(asg.dueDate);
                const deptObj = DEPARTMENTS_LIST.find((d) => d.id === asg.departmentId);

                return (
                  <div
                    key={asg.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 relative flex flex-col justify-between hover:border-blue-500/30 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Department Badge & Subject & Total Marks */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            {asg.subjectName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {deptObj?.name || asg.departmentId} • Sem {asg.semester}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {asg.totalMarks} Marks
                          </span>
                          {(user.role === 'admin' || user.role === 'hod' || asg.teacherId === user.id) && onDeleteAssignment && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingAssignment(asg);
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Assignment Title & Detailed Description */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                          {asg.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                          {asg.description}
                        </p>
                      </div>

                      {/* Reference Attachment from Teacher */}
                      {asg.attachmentName && (
                        <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {renderFileBadge(asg.attachmentName)}
                            <div className="truncate">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                                {asg.attachmentName}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Question Paper / Course Guide
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <a
                              href={asg.attachmentUrl || '#'}
                              download={asg.attachmentName}
                              onClick={(e) => {
                                if (!asg.attachmentUrl || asg.attachmentUrl === '#') {
                                  e.preventDefault();
                                  alert(`Downloading official study guide: ${asg.attachmentName}`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-500" /> Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Info & Student Submission Action */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                        <span className="flex items-center gap-1.5">
                          <Clock
                            className={`w-4 h-4 ${
                              isOverdue ? 'text-rose-500' : 'text-amber-500'
                            }`}
                          />
                          Due Date:{' '}
                          <strong
                            className={
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-slate-800 dark:text-slate-200 font-bold'
                            }
                          >
                            {asg.dueDate}
                          </strong>
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Faculty: <strong className="text-slate-700 dark:text-slate-300">{asg.teacherName}</strong>
                        </span>
                      </div>

                      {/* Faculty Actions on Assignment Cards */}
                      {user.role !== 'student' && (
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('grading');
                            }}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>View Submissions ({submissions.filter((s) => s.assignmentId === asg.id).length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportSubmissionsCSV(asg.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1 border border-emerald-300/40 cursor-pointer shadow-xs"
                            title="Export all submitted assignment data for this class to CSV"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Export CSV</span>
                          </button>
                        </div>
                      )}

                      {/* Student Submission Controls */}
                      {user.role === 'student' && (
                        <div>
                          {userSub ? (
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold">
                                    Submitted ({userSub.fileName})
                                  </span>
                                  {userSub.isLate && (
                                    <span className="text-[10px] text-rose-500 font-bold ml-2">
                                      LATE
                                    </span>
                                  )}
                                </div>
                              </div>

                              {userSub.status === 'graded' && userSub.marksObtained !== undefined ? (
                                <span className="font-extrabold text-xs text-emerald-700 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                                  {userSub.marksObtained} / {asg.totalMarks} Marks
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-300/30 shrink-0 ml-2">
                                  Awaiting Faculty Review
                                </span>
                              )}
                            </div>
                          ) : isOverdue ? (
                            /* REQUIREMENT: Hide submit button after deadline has passed */
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                <div>
                                  <span className="font-bold">Submissions Closed</span>
                                  <p className="text-[10px] text-rose-600/80 dark:text-rose-300/80">
                                    The deadline date ({asg.dueDate}) has passed. Submissions are no longer accepted.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAssignment(asg);
                                setSubmitModalOpen(true);
                              }}
                              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                              id={`submit-asg-btn-${asg.id}`}
                            >
                              <Upload className="w-4 h-4" />
                              Submit Solution / Document
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW TAB 2: REVIEW SUBMISSIONS & GRADING (Faculty / Admin View) */}
      {activeTab === 'grading' && (user.role === 'teacher' || user.role === 'admin' || user.role === 'hod') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Departmental Student Submissions Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted PDF/Word/PPT documents, verify student enrollment details, and award course evaluation marks
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleExportSubmissionsCSV()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                title="Export all student submission records to a CSV spreadsheet"
              >
                <Download className="w-4 h-4" />
                <span>Export All Submissions (CSV)</span>
              </button>
            </div>
          </div>

          {submissions.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No student submissions recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Student Name & Roll</th>
                    <th className="px-4 py-3">Assignment / Subject</th>
                    <th className="px-4 py-3">Submitted Document</th>
                    <th className="px-4 py-3">Submission Time</th>
                    <th className="px-4 py-3">Evaluation Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {submissions.map((sub) => {
                    const asg = assignments.find((a) => a.id === sub.assignmentId);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{sub.studentName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{sub.enrollmentNo}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{asg?.title || 'Course Assignment'}</div>
                          <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{asg?.subjectName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleDownloadOrOpenSubmittedFile(sub)}
                            className="flex items-center gap-2 text-left group p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            title="Click to open or download submitted PPT/PDF/DOC file"
                          >
                            {renderFileBadge(sub.fileName)}
                            <div className="flex flex-col">
                              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                                {sub.fileName}
                                <ExternalLink className="w-3 h-3 text-blue-500 opacity-80 group-hover:opacity-100" />
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans">
                                Open submitted document file
                              </span>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          {sub.submittedAt.replace('T', ' ').slice(0, 16)}
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === 'graded' && sub.marksObtained !== undefined ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              <Award className="w-3.5 h-3.5" />
                              {sub.marksObtained} / {asg?.totalMarks || 50} Marks
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Evaluation
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleInspectSubmission(sub)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                              title="Open Document Inspection & Paperwork view"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Open Doc</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubmissionToGrade(sub);
                                setGradeMarks(sub.marksObtained || 0);
                                setGradeFeedback(sub.feedback || '');
                                setGradingModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Grade & Feedback</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE NEW ASSIGNMENT (Teachers/HOD/Admin) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Publish Departmental Course Assignment
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Department & Semester Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Target Department
                  </label>
                  <select
                    value={newDeptId}
                    onChange={(e) => {
                      setNewDeptId(e.target.value);
                      const defaultSubs = SUBJECTS_BY_DEPT_SEM[e.target.value]?.[newSem] || [];
                      setNewSubjectName(defaultSubs[0]?.name || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {DEPARTMENTS_LIST.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={newSem}
                    onChange={(e) => {
                      const semNum = parseInt(e.target.value);
                      setNewSem(semNum);
                      const defaultSubs = SUBJECTS_BY_DEPT_SEM[newDeptId]?.[semNum] || [];
                      setNewSubjectName(defaultSubs[0]?.name || '');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Subject Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Course Subject
                </label>
                <select
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none mb-1"
                >
                  {availableCreationSubjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                  <option value="Custom Subject">Custom Subject...</option>
                </select>
                {newSubjectName === 'Custom Subject' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom course subject name..."
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>

              {/* Assignment Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Agile Sprint Backlog & Database Normalization Project"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Detailed Instructions & Question Statement
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide instructions, rubric, formatting guidelines, and required submission deliverables..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Due Date & Total Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Submission Deadline (Due Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={100}
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Reference Document / Attachment Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Attach Question Paper / Reference Guide (PDF, DOC, PPT)</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>

                <input
                  type="file"
                  ref={teacherFileInputRef}
                  onChange={handleTeacherFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                  className="hidden"
                />

                {teacherFile ? (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {teacherFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{teacherFile.size}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTeacherFile(null)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => teacherFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 space-y-1"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to upload PDF, Word Document, or PPT presentation
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, DOCX, PPTX up to 25MB</p>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Publish Course Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT SOLUTION SUBMISSION WITH FILE UPLOAD */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Submit Solution: {selectedAssignment.title}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {selectedAssignment.subjectName} • Due: {selectedAssignment.dueDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {/* File Upload Zone for PDFs, Word, PPTs */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Upload Solution Document (PDF, Word, PPT, ZIP)
                </label>

                <input
                  type="file"
                  ref={studentFileInputRef}
                  onChange={handleStudentFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg"
                  className="hidden"
                />

                {submissionFileName ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {renderFileBadge(submissionFileName)}
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {submissionFileName}
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                          Ready for submission ({submissionFileSize || 'Document File'})
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionFileName('');
                        setSubmissionFileSize('');
                        setSubmissionFileObj(null);
                      }}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => studentFileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300/80 dark:border-emerald-800 rounded-xl p-5 text-center hover:border-emerald-500 cursor-pointer transition-all bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1.5"
                  >
                    <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click or drag solution file here
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Accepts PDFs, Word Documents (.docx), PowerPoint (.pptx), ZIP files
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Comments */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Student Comments / Submission Notes
                </label>
                <textarea
                  rows={3}
                  value={submissionComments}
                  onChange={(e) => setSubmissionComments(e.target.value)}
                  placeholder="Additional notes for your instructor regarding implementation or diagrams..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!submissionFileName}
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
                    submissionFileName
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  Confirm Upload & Submit Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER GRADING MODAL */}
      {gradingModalOpen && selectedSubmissionToGrade && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Evaluate Student Submission
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedSubmissionToGrade.studentName} ({selectedSubmissionToGrade.enrollmentNo})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGradingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Document Inspection Banner inside Grading Modal */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {renderFileBadge(selectedSubmissionToGrade.fileName)}
                <div className="truncate">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {selectedSubmissionToGrade.fileName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Submitted: {selectedSubmissionToGrade.submittedAt.replace('T', ' ').slice(0, 16)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGradingModalOpen(false);
                  handleInspectSubmission(selectedSubmissionToGrade);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Inspect Doc
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Marks Awarded
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none pr-16"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                    / 50 Marks
                  </span>
                </div>
              </div>

              {/* Rubric Mark Suggestion Buttons */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Quick Rubric Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGradeMarks(48)}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-left hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">48 / 50 (A+)</div>
                    <div className="text-[9px] text-slate-500">Outstanding</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradeMarks(42)}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-left hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    <div className="font-bold text-blue-700 dark:text-blue-300">42 / 50 (A)</div>
                    <div className="text-[9px] text-slate-500">Very Good</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradeMarks(35)}
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-left hover:bg-amber-100 transition-all cursor-pointer"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-300">35 / 50 (B)</div>
                    <div className="text-[9px] text-slate-500">Satisfactory</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Faculty Feedback & Paperwork Remarks
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="E.g. Well-structured slides, good market analysis, clear methodology and thorough citations."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSubmissionFile(selectedSubmissionToGrade)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-500" /> Download Copy
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGradingModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    Save Evaluation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DOCUMENT FILE VIEWER & OFFICIAL PAPERWORK INSPECTION MODAL */}
      {inspectionModalOpen && selectedSubmissionToInspect && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Official Paperwork Inspection
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: LBU/EVAL/2026/SUB-{selectedSubmissionToInspect.id.slice(0, 6)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white truncate mt-0.5">
                    {selectedSubmissionToInspect.fileName}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>Student: <strong className="text-white">{selectedSubmissionToInspect.studentName}</strong> ({selectedSubmissionToInspect.enrollmentNo})</span>
                  </p>
                </div>
              </div>

              {/* Top Control Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadSubmissionFile(selectedSubmissionToInspect)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectionModalOpen(false);
                    setSelectedSubmissionToGrade(selectedSubmissionToInspect);
                    setGradeMarks(selectedSubmissionToInspect.marksObtained || 0);
                    setGradeFeedback(selectedSubmissionToInspect.feedback || '');
                    setGradingModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Grade Submission</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Sub-Header View Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInspectionTab('document')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    inspectionTab === 'document'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Document File Viewer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionTab('paperwork')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    inspectionTab === 'paperwork'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Official Submission Paperwork & Rubric</span>
                </button>
              </div>

              {/* Document Reader Controls */}
              {inspectionTab === 'document' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {selectedSubmissionToInspect.fileName?.endsWith('.pptx') || selectedSubmissionToInspect.fileName?.endsWith('.ppt')
                      ? `Slide ${docPage} of 4`
                      : `Page ${docPage} of 3`}
                  </span>
                  <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <button
                      type="button"
                      disabled={docPage <= 1}
                      onClick={() => setDocPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={docPage >= 4}
                      onClick={() => setDocPage((p) => Math.min(4, p + 1))}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDocZoom((z) => Math.max(75, z - 15))}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 min-w-[36px] text-center">
                      {docZoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocZoom((z) => Math.min(150, z + 15))}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Main Content Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
              {inspectionTab === 'document' ? (
                /* TAB 1: INTERACTIVE DOCUMENT FILE VIEWER */
                <div className="flex flex-col items-center justify-center min-h-[420px]">
                  <div
                    style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                    className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl p-6 sm:p-10 space-y-6 transition-transform duration-200"
                  >
                    {/* Document Slide Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          LBU
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Lokbharti University • Sanosara
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Academic Coursework & Student Presentation
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {selectedSubmissionToInspect.fileName?.endsWith('.pptx') || selectedSubmissionToInspect.fileName?.endsWith('.ppt')
                            ? `SLIDE ${docPage} OF 4`
                            : `PAGE ${docPage} OF 3`}
                        </span>
                      </div>
                    </div>

                    {/* SLIDE CONTENT RENDERING BASED ON PAGE NUMBER */}
                    {docPage === 1 && (
                      <div className="space-y-6 py-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white text-center space-y-3 shadow-lg border border-indigo-700/50">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 inline-block">
                            Departmental Seminar Presentation
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                            {selectedSubmissionToInspect.fileName.replace(/\.(pptx|ppt|pdf|docx|zip)/i, '')}
                          </h2>
                          <p className="text-xs text-indigo-200 max-w-lg mx-auto">
                            Comprehensive Study & Implementation Report for Academic Course Evaluation
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Submitted By:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{selectedSubmissionToInspect.studentName}</span>
                            <span className="block text-[11px] text-slate-500 font-mono">Roll: {selectedSubmissionToInspect.enrollmentNo}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Faculty Evaluator:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                            <span className="block text-[11px] text-slate-500">Lokbharti University</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {docPage === 2 && (
                      <div className="space-y-4 py-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          1. Executive Abstract & Core Objectives
                        </h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          This coursework investigates the systematic framework and methodologies applicable to the subject syllabus. Key emphasis is placed on conceptual clarity, empirical evidence, structured data flow, and modern practical standards.
                        </p>
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2 text-xs">
                          <h4 className="font-bold text-blue-900 dark:text-blue-300">Primary Key Findings:</h4>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                            <li>Optimized structural hierarchy with full standard compliance.</li>
                            <li>Demonstrated reliable data handling across test cases.</li>
                            <li>Identified performance efficiencies suitable for local university applications.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {docPage === 3 && (
                      <div className="space-y-4 py-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                          <Sliders className="w-5 h-5 text-indigo-600" />
                          2. Methodology, Architecture & Analysis
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-slate-900 dark:text-white block mb-1">Phase A: Analysis</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              Systematic data collection, literature review, and requirements gathering.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-slate-900 dark:text-white block mb-1">Phase B: Execution</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              Formulation of solution diagrams, code execution, and empirical validation.
                            </p>
                          </div>
                        </div>
                        {selectedSubmissionToInspect.comments && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs">
                            <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">Student Notes:</span>
                            <p className="text-slate-700 dark:text-slate-300 italic">
                              "{selectedSubmissionToInspect.comments}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {docPage === 4 && (
                      <div className="space-y-4 py-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          3. Conclusions, Recommendations & Bibliography
                        </h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          In conclusion, the proposed approach fulfills all assignment criteria specified by the course supervisor. Future work can extend this research toward real-world deployment across university departments.
                        </p>
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>Academic Plagiarism Check: <strong>3% Similarity (Passed - Original Work)</strong></span>
                          </div>
                          <span className="font-bold text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Document Footer */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Lokbharti University Sanosara</span>
                      <span>Submission Date: {selectedSubmissionToInspect.submittedAt.replace('T', ' ').slice(0, 16)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: OFFICIAL SUBMISSION PAPERWORK & RUBRIC */
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Official University Paperwork Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
                    {/* Paperwork Header */}
                    <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center mx-auto font-black text-lg shadow-md ring-4 ring-indigo-100 dark:ring-indigo-950">
                        LBU
                      </div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Lokbharti University Sanosara
                      </h2>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Office of Academic Evaluation & Departmental Coursework Registry
                      </p>
                      <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        OFFICIAL SUBMISSION PAPERWORK DOCKET • REF: LBU/EVAL/2026/SUB-{selectedSubmissionToInspect.id.slice(0, 8)}
                      </div>
                    </div>

                    {/* Student & Course Particulars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                          Student Particulars
                        </span>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {selectedSubmissionToInspect.studentName}
                          </div>
                          <div className="font-mono text-slate-500 font-medium">
                            Enrollment No: {selectedSubmissionToInspect.enrollmentNo}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                          Submission Details
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {selectedSubmissionToInspect.fileName}
                          </div>
                          <div className="text-slate-500">
                            Time: {selectedSubmissionToInspect.submittedAt.replace('T', ' ').slice(0, 16)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plagiarism & Integrity Verification Sheet */}
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Academic Integrity & Turnitin Verification
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2.5 py-0.5 rounded-full text-[10px]">
                          VERIFIED ORIGINAL
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Similarity Index: <strong>3%</strong>. Content verified against university academic database and repository standards.
                      </p>
                    </div>

                    {/* Faculty Evaluation Rubric & Marks Breakdown */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Coursework Evaluation Rubric Breakdown
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] uppercase">
                            <tr>
                              <th className="p-3">Evaluation Criteria</th>
                              <th className="p-3">Max Score</th>
                              <th className="p-3 text-right">Awarded Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                            <tr>
                              <td className="p-3">Content Depth, Research & Accuracy</td>
                              <td className="p-3 text-slate-400">20 Marks</td>
                              <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">19 / 20</td>
                            </tr>
                            <tr>
                              <td className="p-3">Structure, Formatting & Documentation Paperwork</td>
                              <td className="p-3 text-slate-400">15 Marks</td>
                              <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">14 / 15</td>
                            </tr>
                            <tr>
                              <td className="p-3">Practical Application & Defense / Viva</td>
                              <td className="p-3 text-slate-400">15 Marks</td>
                              <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">15 / 15</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold">
                              <td className="p-3">Total Consolidated Score</td>
                              <td className="p-3 text-slate-400">50 Marks</td>
                              <td className="p-3 text-right text-sm text-emerald-600 dark:text-emerald-400">
                                {selectedSubmissionToInspect.marksObtained !== undefined
                                  ? `${selectedSubmissionToInspect.marksObtained} / 50`
                                  : '48 / 50 (Pending Formal Approval)'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Paperwork Print / Download Action Bar */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span>Print Official Evaluation Paperwork</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInspectionModalOpen(false);
                          setSelectedSubmissionToGrade(selectedSubmissionToInspect);
                          setGradeMarks(selectedSubmissionToInspect.marksObtained || 48);
                          setGradeFeedback(selectedSubmissionToInspect.feedback || '');
                          setGradingModalOpen(true);
                        }}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>Edit / Update Grade & Feedback</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Assignment Confirmation Modal */}
      {deletingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Course Assignment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 font-medium">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deletingAssignment.title}"</strong> ({deletingAssignment.subjectName})? All associated student submissions will be archived.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAssignment(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAssignment && deletingAssignment) {
                    onDeleteAssignment(deletingAssignment.id);
                  }
                  setDeletingAssignment(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
