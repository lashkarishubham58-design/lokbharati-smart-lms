import { SmartStudyPlan, StudyPlanDay } from '../types';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

export const generateSmartStudyPlan = (
  studentId: string,
  subjectId: string,
  subjectName: string,
  totalDays: number = 15,
  targetExamDate?: string
): SmartStudyPlan => {
  const examDate = targetExamDate || new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const topicsBySubject: Record<string, string[]> = {
    sub_cs401: [
      'Relational Model & Keys (Candidate, Super, Foreign Keys)',
      'Entity-Relationship Diagrams & Mapping to Tables',
      'First Normal Form (1NF) & Multi-Valued Attributes',
      'Second Normal Form (2NF) & Partial Dependency Removal',
      'Third Normal Form (3NF) & Transitive Dependency Removal',
      'Boyce-Codd Normal Form (BCNF) & Superkey Determinants',
      'Lossless Join & Dependency Preserving Decompositions',
      'SQL Complex Queries (Subqueries, Views, Joins)',
      'Aggregate Functions, GROUP BY, and HAVING Clauses',
      'Transaction ACID Properties & State Transitions',
      'Concurrency Control & Two-Phase Locking (2PL)',
      'Deadlock Prevention & Wait-Die / Wound-Wait Schemes',
      'Database Indexing (B-Tree & B+ Trees)',
      'Past 5-Year Lokbharti Exam Paper Walkthrough',
      'Full Syllabus Mock Diagnostic Exam & Final Flashcard Drill'
    ],
    sub_cs402: [
      'OS Architecture: Monolithic vs Microkernel & System Calls',
      'Process Control Block (PCB) & Context Switching Overhead',
      'First-Come, First-Served (FCFS) & Convoy Effect Numericals',
      'Shortest Job First (SJF) & Shortest Remaining Time (SRTF)',
      'Round Robin (RR) CPU Scheduling & Time Quantum Tradeoffs',
      'Priority Scheduling & Aging Mechanism for Starvation',
      'Process Synchronization: Critical Section & Race Conditions',
      'Peterson\'s Solution & Semaphore Primitives (Wait/Signal)',
      'Classical Problems: Producer-Consumer & Dining Philosophers',
      'Coffman Conditions & Resource Allocation Graphs',
      'Banker\'s Algorithm for Deadlock Avoidance (Safety Test)',
      'Memory Management: Paging, Segmentation & TLB Hit Ratio',
      'Virtual Memory: Page Replacement (FIFO, LRU, Optimal)',
      'File System Organization & Disk Scheduling (SCAN, C-SCAN)',
      'Final Comprehensive Revision & Timed Mock Examination'
    ]
  };

  const topicList = topicsBySubject[subjectId] || topicsBySubject['sub_cs401'];

  const dailyPlans: StudyPlanDay[] = Array.from({ length: totalDays }).map((_, i) => {
    const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const topic = topicList[i % topicList.length];

    return {
      dayNumber: i + 1,
      date: dateStr,
      focusSubject: subjectName,
      topic,
      targetDurationMinutes: 60,
      goals: [
        `Understand core theory and diagram representation for ${topic.split('&')[0]}.`,
        'Solve 5 relevant university practice questions.',
        'Review summary flashcards in Notes RAG mode.'
      ],
      practiceQuestionsCount: 5,
      isCompleted: false,
      notes: ''
    };
  });

  const plan: SmartStudyPlan = {
    id: `plan_${Date.now()}`,
    studentId,
    title: `${subjectName} ${totalDays}-Day Mastery Roadmap`,
    subjectId,
    subjectName,
    targetExamDate: examDate,
    totalDays,
    dailyPlans,
    createdAt: new Date().toISOString(),
    progressPercentage: 0
  };

  const allPlans = safeStorageGet<SmartStudyPlan[]>('lbu_study_plans', []);
  allPlans.unshift(plan);
  safeStorageSet('lbu_study_plans', allPlans);

  return plan;
};

export const getStudentStudyPlans = (studentId: string): SmartStudyPlan[] => {
  const allPlans = safeStorageGet<SmartStudyPlan[]>('lbu_study_plans', []);
  const filtered = allPlans.filter((p) => p.studentId === studentId);
  if (filtered.length === 0) {
    const defaultPlan = generateSmartStudyPlan(studentId, 'sub_cs401', 'Database Management Systems', 15);
    return [defaultPlan];
  }
  return filtered;
};

export const toggleStudyPlanDayCompletion = (planId: string, dayNumber: number): SmartStudyPlan | null => {
  const allPlans = safeStorageGet<SmartStudyPlan[]>('lbu_study_plans', []);
  const plan = allPlans.find((p) => p.id === planId);
  if (!plan) return null;

  const day = plan.dailyPlans.find((d) => d.dayNumber === dayNumber);
  if (day) {
    day.isCompleted = !day.isCompleted;
  }

  const completedCount = plan.dailyPlans.filter((d) => d.isCompleted).length;
  plan.progressPercentage = Number(((completedCount / plan.dailyPlans.length) * 100).toFixed(1));

  safeStorageSet('lbu_study_plans', allPlans);
  return plan;
};
