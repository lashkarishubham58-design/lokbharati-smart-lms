import {
  ExamDifficulty,
  ExamQuestionType,
  ExamPrepQuestion,
  ExamPrepSession,
  ExamReport
} from '../types';
import { updateAIMemory, getAIMemory } from './aiCopilotService';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

export const QUESTION_BANK: Record<string, ExamPrepQuestion[]> = {
  sub_cs401: [
    {
      id: 'q_dbms_1',
      type: 'mcq',
      question: 'Which of the following normal forms guarantees that every determinant in a functional dependency is a superkey?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctAnswer: 'BCNF',
      explanation: 'BCNF (Boyce-Codd Normal Form) strictly enforces that for any FD X -> Y, X must be a superkey of the relation.',
      topic: 'Normalization',
      unit: 'Unit 3: Normalization',
      marks: 2
    },
    {
      id: 'q_dbms_2',
      type: 'true_false',
      question: 'A table with a single-attribute primary key can still violate Second Normal Form (2NF).',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: '2NF addresses partial dependency on composite keys. If a primary key has only one attribute, partial dependency is impossible, so it is automatically in 2NF.',
      topic: 'Normalization',
      unit: 'Unit 3: Normalization',
      marks: 1
    },
    {
      id: 'q_dbms_3',
      type: 'fill_blanks',
      question: 'In relational database design, the ACID property that guarantees all operations of a transaction succeed or none take effect is called ______.',
      correctAnswer: 'Atomicity',
      explanation: 'Atomicity ensures that a transaction is treated as a single, indivisible unit of work.',
      topic: 'Transactions',
      unit: 'Unit 4: Transaction Management',
      marks: 2
    },
    {
      id: 'q_dbms_4',
      type: 'short_answer',
      question: 'What is a Transitive Functional Dependency? Provide a brief formal notation.',
      correctAnswer: 'A transitive dependency occurs when X -> Y and Y -> Z, where Y is not a candidate key and Z is non-prime, implying X -> Z indirectly.',
      explanation: 'Transitive dependencies cause update anomalies and are eliminated in 3NF.',
      topic: 'Functional Dependencies',
      unit: 'Unit 3: Normalization',
      marks: 3
    },
    {
      id: 'q_dbms_5',
      type: 'coding',
      question: 'Write a SQL query to find all students whose overall attendance is greater than 85%, ordered by student name ascending.',
      correctAnswer: 'SELECT student_name, attendance_pct FROM students WHERE attendance_pct > 85 ORDER BY student_name ASC;',
      explanation: 'Utilizes standard SELECT with WHERE clause condition and ORDER BY ascendant sorting.',
      topic: 'SQL Queries',
      unit: 'Unit 2: SQL & Relational Algebra',
      marks: 5
    }
  ],
  sub_cs402: [
    {
      id: 'q_os_1',
      type: 'mcq',
      question: 'Which CPU scheduling algorithm is inherently preemptive and uses a fixed time quantum?',
      options: ['First-Come First-Served', 'Shortest Job First', 'Round Robin', 'Priority Non-Preemptive'],
      correctAnswer: 'Round Robin',
      explanation: 'Round Robin gives each ready process a fixed time quantum in cyclical sequence.',
      topic: 'CPU Scheduling',
      unit: 'Unit 2: Process Scheduling',
      marks: 2
    },
    {
      id: 'q_os_2',
      type: 'true_false',
      question: 'Deadlock avoidance using Banker\'s algorithm requires advance knowledge of the maximum resources each process may request.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'Banker\'s algorithm strictly requires a priori claim of maximum resource allocation per thread/process.',
      topic: 'Deadlocks',
      unit: 'Unit 3: Deadlocks & Synchronization',
      marks: 1
    },
    {
      id: 'q_os_3',
      type: 'short_answer',
      question: 'List the four Coffman conditions necessary for a Deadlock to occur.',
      correctAnswer: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
      explanation: 'If any single one of these four conditions is prevented, a deadlock cannot occur.',
      topic: 'Deadlocks',
      unit: 'Unit 3: Deadlocks & Synchronization',
      marks: 4
    }
  ],
  sub_cs403: [
    {
      id: 'q_cpp_1',
      type: 'mcq',
      question: 'In C++, which keyword is used to achieve runtime polymorphism with base class pointers?',
      options: ['static', 'virtual', 'friend', 'inline'],
      correctAnswer: 'virtual',
      explanation: 'Virtual functions resolved via vtable pointers enable runtime dynamic dispatch in C++.',
      topic: 'OOP Polymorphism',
      unit: 'Unit 3: Classes & Dynamic Binding',
      marks: 2
    },
    {
      id: 'q_cpp_2',
      type: 'coding',
      question: 'Write a C++ class `Student` containing private `id` and `name`, with a constructor and `display()` method.',
      correctAnswer: 'class Student { private: int id; string name; public: Student(int i, string n): id(i), name(n){} void display(){ cout << id << " " << name; } };',
      explanation: 'Standard encapsulated class structure in C++.',
      topic: 'Encapsulation',
      unit: 'Unit 2: Object Oriented Principles',
      marks: 5
    }
  ]
};

export const generateExamSession = (
  studentId: string,
  subjectId: string,
  subjectName: string,
  unit: string,
  difficulty: ExamDifficulty,
  questionTypes: ExamQuestionType[],
  questionCount: number = 5
): ExamPrepSession => {
  const bank = QUESTION_BANK[subjectId] || QUESTION_BANK['sub_cs401'];

  // Filter matching types or fallback to all
  let filtered = bank.filter((q) => questionTypes.includes(q.type));
  if (filtered.length === 0) filtered = bank;

  // Clone and shuffle
  const selectedQuestions = [...filtered].sort(() => Math.random() - 0.5).slice(0, questionCount);

  // If not enough questions, duplicate with variation
  while (selectedQuestions.length < questionCount && bank.length > 0) {
    const q = { ...bank[selectedQuestions.length % bank.length], id: `q_gen_${Date.now()}_${selectedQuestions.length}` };
    selectedQuestions.push(q);
  }

  const session: ExamPrepSession = {
    id: `exam_${Date.now()}`,
    studentId,
    subjectId,
    subjectName,
    unit,
    difficulty,
    questionTypes,
    questions: selectedQuestions,
    userAnswers: {},
    status: 'in_progress',
    startedAt: new Date().toISOString()
  };

  const sessions = safeStorageGet<ExamPrepSession[]>('lbu_exam_sessions', []);
  sessions.unshift(session);
  safeStorageSet('lbu_exam_sessions', sessions);

  return session;
};

export const evaluateExamSession = (
  sessionId: string,
  userAnswers: Record<string, string | number>,
  timeTakenSeconds: number
): ExamReport => {
  const sessions = safeStorageGet<ExamPrepSession[]>('lbu_exam_sessions', []);
  const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
  const session = sessionIndex >= 0 ? sessions[sessionIndex] : null;

  if (!session) {
    throw new Error('Exam session not found');
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;

  const topicScores: Record<string, { earned: number; max: number }> = {};
  const strongTopicsSet = new Set<string>();
  const weakTopicsSet = new Set<string>();

  session.questions.forEach((q) => {
    maxPossibleScore += q.marks;
    if (!topicScores[q.topic]) {
      topicScores[q.topic] = { earned: 0, max: 0 };
    }
    topicScores[q.topic].max += q.marks;

    const userAns = (userAnswers[q.id] || '').toString().trim().toLowerCase();
    const correctAns = q.correctAnswer.toString().trim().toLowerCase();

    let isCorrect = false;
    if (q.type === 'mcq' || q.type === 'true_false') {
      isCorrect = userAns === correctAns;
    } else if (q.type === 'fill_blanks') {
      isCorrect = userAns.includes(correctAns) || correctAns.includes(userAns);
    } else {
      // Partial credit for short/coding questions
      isCorrect = userAns.length > 5;
    }

    if (isCorrect) {
      totalScore += q.marks;
      correctCount += 1;
      topicScores[q.topic].earned += q.marks;
    } else {
      weakTopicsSet.add(q.topic);
    }
  });

  Object.entries(topicScores).forEach(([topic, score]) => {
    if (score.earned / score.max >= 0.7) {
      strongTopicsSet.add(topic);
    } else {
      weakTopicsSet.add(topic);
    }
  });

  const accuracy = session.questions.length > 0 ? (correctCount / session.questions.length) * 100 : 0;
  const readiness = Number(Math.min(100, Math.max(40, (totalScore / maxPossibleScore) * 100)).toFixed(1));

  const report: ExamReport = {
    score: totalScore,
    totalMarks: maxPossibleScore,
    accuracy: Number(accuracy.toFixed(1)),
    timeTakenSeconds,
    strongTopics: Array.from(strongTopicsSet),
    weakTopics: Array.from(weakTopicsSet),
    topicBreakdown: Object.entries(topicScores).map(([topic, sc]) => ({
      topic,
      score: sc.earned,
      maxScore: sc.max
    })),
    recommendedRevision: [
      `Review core theoretical proofs and definitions for ${Array.from(weakTopicsSet)[0] || 'Unit Concepts'}.`,
      'Practice 5 previous year Lokbharti University examination questions.',
      'Test yourself with instant interactive flashcards in the Notes RAG module.'
    ],
    examReadinessPercentage: readiness,
    aiFeedback: readiness >= 80
      ? `Outstanding performance! You demonstrated mastery in ${session.subjectName}. Keep revising weak topics to secure Grade A+.`
      : `Solid attempt! Focus revision on ${Array.from(weakTopicsSet).join(', ') || 'core principles'} to elevate your exam score.`
  };

  session.status = 'completed';
  session.completedAt = new Date().toISOString();
  session.userAnswers = userAnswers;
  session.report = report;
  safeStorageSet('lbu_exam_sessions', sessions);

  // Update AI Memory
  const mem = getAIMemory(session.studentId);
  const newWeak = [...mem.weakTopics];
  Array.from(weakTopicsSet).forEach((wt) => {
    const existing = newWeak.find((w) => w.topic === wt);
    if (existing) existing.errorCount += 1;
    else newWeak.push({ topic: wt, subject: session.subjectName, errorCount: 1 });
  });

  updateAIMemory(session.studentId, {
    weakTopics: newWeak,
    examReadinessEstimate: readiness,
    recentQuizScores: [
      { quizTitle: `${session.subjectName} Exam Prep`, percentage: readiness, date: new Date().toISOString().split('T')[0] },
      ...mem.recentQuizScores.slice(0, 4)
    ]
  });

  return report;
};
