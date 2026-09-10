import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Play,
  Clock,
  CheckCircle2,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  BookOpen,
  X,
  Edit3,
  FileText,
  AlertCircle,
  Copy,
  ChevronDown,
  RotateCcw,
  Check,
  Eye,
  Info
} from 'lucide-react';
import { User, Quiz, QuizResult, QuizQuestion } from '../../types';

interface QuizModuleProps {
  user: User;
  quizzes: Quiz[];
  quizResults: QuizResult[];
  onSubmitQuizResult: (res: Partial<QuizResult>) => void;
  activeQuizId?: string;
  onCreateQuiz?: (quiz: Partial<Quiz>) => void;
  onUpdateQuiz?: (quiz: Quiz) => void;
  onToggleQuizStatus?: (id: string) => void;
  onDeleteQuiz?: (id: string) => void;
}

const AVAILABLE_SUBJECTS = [
  'Python & Django Web Framework',
  'Operating System Concepts',
  'Database Management Systems',
  'Object-Oriented Programming (Java)',
  'Oops – using C++',
  'Software Engineering',
  'Computer Networks',
  'Web Engineering & Cloud Architecture',
  'Values and Ethics',
  'Google Tools',
  'Rural Innovation',
  'Design & Analysis of Algorithms',
  'Data Structures & Algorithms',
  'Artificial Intelligence & Machine Learning',
  'Cyber Security & Cryptography'
];

const DEFAULT_STARTER_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which scheduling algorithm provides the minimum average waiting time for a given set of processes?',
    options: [
      'First Come First Served (FCFS)',
      'Shortest Job First (SJF)',
      'Round Robin (RR)',
      'Priority Scheduling'
    ],
    correctAnswer: 1,
    explanation: 'SJF is provably optimal for minimizing average waiting time in batch systems.',
  },
  {
    id: 'q2',
    question: 'What condition is NOT necessary for a deadlock to occur in an operating system?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemption Allowed',
      'Circular Wait'
    ],
    correctAnswer: 2,
    explanation: 'Deadlock requires NO preemption; allowing preemption breaks deadlocks.',
  },
  {
    id: 'q3',
    question: 'Which memory management scheme eliminates external fragmentation completely?',
    options: [
      'Continuous Allocation',
      'Paging',
      'Dynamic Partitioning',
      'Overlays'
    ],
    correctAnswer: 1,
    explanation: 'Paging divides logical memory into equal blocks (pages) and physical memory into frames, removing external fragmentation.',
  }
];

export const QuizModule: React.FC<QuizModuleProps> = ({
  user,
  quizzes = [],
  quizResults = [],
  onSubmitQuizResult,
  activeQuizId,
  onCreateQuiz,
  onUpdateQuiz,
  onToggleQuizStatus,
  onDeleteQuiz,
}) => {
  const isTeacherOrAdmin = user.role === 'teacher' || user.role === 'hod' || user.role === 'admin';
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [showExplanationReview, setShowExplanationReview] = useState(false);

  // List filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Quiz Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [subjectName, setSubjectName] = useState('Operating System Concepts');
  const [semester, setSemester] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalMarks, setTotalMarks] = useState(30);
  const [publishStatus, setPublishStatus] = useState<boolean>(true); // true = published, false = draft
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_STARTER_QUESTIONS);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (activeQuizId) {
      const q = quizzes.find((q) => q.id === activeQuizId);
      if (q) startQuiz(q);
    }
  }, [activeQuizId, quizzes]);

  useEffect(() => {
    if (!currentQuiz || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuiz, isCompleted]);

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setAnswers({});
    setTimeLeftSeconds(quiz.durationMinutes * 60);
    setIsCompleted(false);
    setLastResult(null);
    setShowExplanationReview(false);
  };

  const handleOptionSelect = (questionIdx: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const finishQuiz = () => {
    if (!currentQuiz) return;

    let score = 0;
    const questionsList = currentQuiz.questions || [];
    const marksPerQ = Math.max(1, Math.round(currentQuiz.totalMarks / (questionsList.length || 1)));

    questionsList.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score += marksPerQ;
      }
    });

    const percentage = Math.min(100, Math.round((score / currentQuiz.totalMarks) * 100));

    const resultObj: QuizResult = {
      id: `qres_${Date.now()}`,
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      studentId: user.id,
      studentName: user.name,
      score,
      totalMarks: currentQuiz.totalMarks,
      percentage,
      completedAt: new Date().toISOString(),
      timeTakenSeconds: Math.max(1, currentQuiz.durationMinutes * 60 - timeLeftSeconds),
    };

    onSubmitQuizResult(resultObj);
    setLastResult(resultObj);
    setIsCompleted(true);
  };

  // Open Create Modal in fresh state
  const handleOpenCreateModal = () => {
    setEditingQuizId(null);
    setQuizTitle('');
    setSubjectName('Operating System Concepts');
    setSemester(user.departmentId === 'dept_it' ? 3 : 5);
    setDurationMinutes(15);
    setTotalMarks(30);
    setPublishStatus(true);
    setQuestions([
      {
        id: `q_${Date.now()}_1`,
        question: 'What is the primary function of an operating system kernel?',
        options: [
          'Resource management and hardware abstraction',
          'Compiling user source code into binaries',
          'Designing UI layouts in web browsers',
          'Configuring physical power switches only'
        ],
        correctAnswer: 0,
        explanation: 'The kernel provides core services, CPU scheduling, memory management, and device abstraction.',
      },
      {
        id: `q_${Date.now()}_2`,
        question: 'Which scheduling algorithm can cause process starvation?',
        options: [
          'Round Robin (RR)',
          'First Come First Served (FCFS)',
          'Shortest Job First (SJF) without aging',
          'Fair-share scheduling'
        ],
        correctAnswer: 2,
        explanation: 'SJF can starve longer processes if shorter processes keep arriving continuously.',
      }
    ]);
    setValidationError(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal for an existing Quiz
  const handleOpenEditModal = (quiz: Quiz) => {
    setEditingQuizId(quiz.id);
    setQuizTitle(quiz.title);
    setSubjectName(quiz.subjectName);
    setSemester(quiz.semester || 3);
    setDurationMinutes(quiz.durationMinutes);
    setTotalMarks(quiz.totalMarks);
    setPublishStatus(quiz.isPublished);
    setQuestions(
      quiz.questions && quiz.questions.length > 0
        ? JSON.parse(JSON.stringify(quiz.questions))
        : DEFAULT_STARTER_QUESTIONS
    );
    setValidationError(null);
    setShowCreateModal(true);
  };

  // Question manipulation helpers
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: '',
    };
    setQuestions((prev) => [...prev, newQ]);
    setTotalMarks((prev) => prev + 10);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setValidationError('A quiz must have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setTotalMarks((prev) => Math.max(10, prev - 10));
    setValidationError(null);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const target = questions[idx];
    const duplicated: QuizQuestion = {
      ...target,
      id: `q_${Date.now()}_dup`,
      question: `${target.question} (Copy)`,
      options: [...target.options],
    };
    const newQuestions = [...questions];
    newQuestions.splice(idx + 1, 0, duplicated);
    setQuestions(newQuestions);
    setTotalMarks((prev) => prev + 10);
  };

  const handleUpdateQuestionText = (idx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, question: text } : q))
    );
  };

  const handleUpdateOptionText = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIdx) {
          const newOpts = [...q.options];
          newOpts[optIdx] = val;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleSetCorrectAnswer = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctAnswer: optIdx } : q))
    );
  };

  const handleUpdateExplanation = (qIdx: number, exp: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, explanation: exp } : q))
    );
  };

  const handleAddOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIdx && q.options.length < 6) {
          return { ...q, options: [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`] };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIdx && q.options.length > 2) {
          const newOpts = q.options.filter((_, oI) => oI !== optIdx);
          let newCorrect = q.correctAnswer;
          if (newCorrect >= newOpts.length) newCorrect = newOpts.length - 1;
          return { ...q, options: newOpts, correctAnswer: newCorrect };
        }
        return q;
      })
    );
  };

  // Submit form handler (either publish or draft)
  const handleSaveQuiz = (targetPublishStatus: boolean) => {
    if (!quizTitle.trim()) {
      setValidationError('Please enter a Quiz Title.');
      return;
    }

    // Validate that questions are not empty
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setValidationError(`Question ${i + 1} statement cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setValidationError(`Option ${String.fromCharCode(65 + j)} in Question ${i + 1} cannot be empty.`);
          return;
        }
      }
    }

    const marks = totalMarks > 0 ? totalMarks : questions.length * 10;

    if (editingQuizId) {
      // Update existing quiz
      if (onUpdateQuiz) {
        const existing = quizzes.find((q) => q.id === editingQuizId);
        const updated: Quiz = {
          id: editingQuizId,
          title: quizTitle.trim(),
          subjectId: existing?.subjectId || subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          subjectName,
          departmentId: existing?.departmentId || user.departmentId || 'dept_it',
          semester,
          teacherId: existing?.teacherId || user.id,
          durationMinutes,
          totalMarks: marks,
          questions,
          isPublished: targetPublishStatus,
          dueDate: existing?.dueDate || '2026-08-30 23:59',
          createdAt: existing?.createdAt || new Date().toISOString(),
        };
        onUpdateQuiz(updated);
      }
    } else {
      // Create new quiz
      if (onCreateQuiz) {
        onCreateQuiz({
          title: quizTitle.trim(),
          subjectName,
          subjectId: subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          departmentId: user.departmentId || 'dept_it',
          semester,
          teacherId: user.id,
          durationMinutes,
          totalMarks: marks,
          questions,
          isPublished: targetPublishStatus,
          dueDate: '2026-08-30 23:59',
        });
      }
    }

    setShowCreateModal(false);
    setValidationError(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter quizzes based on role and active filter
  const visibleQuizzes = quizzes.filter((q) => {
    if (!isTeacherOrAdmin && !q.isPublished) return false;
    if (statusFilter === 'published' && !q.isPublished) return false;
    if (statusFilter === 'draft' && q.isPublished) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.subjectName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const publishedCount = quizzes.filter((q) => q.isPublished).length;
  const draftCount = quizzes.filter((q) => !q.isPublished).length;

  return (
    <div className="space-y-6" id="quiz-module-container">
      {/* 1. QUIZ ACTIVE TEST VIEW */}
      {currentQuiz && !isCompleted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 max-w-3xl mx-auto">
          {/* Top Timer Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded">
                  {currentQuiz.subjectName}
                </span>
                {!currentQuiz.isPublished && (
                  <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                    Teacher Preview Mode (Draft)
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {currentQuiz.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-base shadow-xs">
              <Clock className="w-5 h-5 animate-spin" />
              {formatTime(timeLeftSeconds)}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Answered: {Object.keys(answers).length} / {currentQuiz.questions?.length || 0}</span>
            <span>Total Marks: {currentQuiz.totalMarks}</span>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {(currentQuiz.questions || []).map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 pl-9">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[qIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(qIdx, optIdx)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/40'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-500/50'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white text-purple-700 font-extrabold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuiz(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Exit Assessment
            </button>
            <button
              onClick={finishQuiz}
              className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer transition-all"
              id="submit-quiz-assessment-btn"
            >
              Submit Quiz & View Results <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : currentQuiz && isCompleted && lastResult ? (
        /* 2. QUIZ RESULT & REVIEW VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Quiz Completed!
            </h2>
            <p className="text-xs text-slate-500 mt-1">{lastResult.quizTitle}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {lastResult.score} / {lastResult.totalMarks} Marks ({lastResult.percentage}%)
            </div>
            <p className="text-xs text-slate-500">
              Time Taken: {Math.floor(lastResult.timeTakenSeconds / 60)}m {lastResult.timeTakenSeconds % 60}s
            </p>
          </div>

          {/* Explanation review */}
          {showExplanationReview ? (
            <div className="space-y-4 text-left pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase text-slate-500">Answer Key & Explanations</h4>
              {currentQuiz.questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    <p className="font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="text-[11px] space-y-1">
                      <p className={isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                        Your Choice: {userAns !== undefined ? `${String.fromCharCode(65 + userAns)}. ${q.options[userAns]}` : 'Unanswered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          Correct Answer: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-slate-500 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => setShowExplanationReview(true)}
              className="text-xs font-bold text-purple-600 hover:text-purple-500 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Review Questions & Explanations
            </button>
          )}

          <div className="pt-2">
            <button
              onClick={() => setCurrentQuiz(null)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Return to Quizzes Overview
            </button>
          </div>
        </div>
      ) : (
        /* 3. MAIN DASHBOARD OVERVIEW & QUIZ MANAGER */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Interactive Quiz & Assessment Engine
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Author quizzes with custom questions, options, answer keys, draft states, and timed evaluations
              </p>
            </div>

            {isTeacherOrAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
                id="create-new-quiz-button"
              >
                <Plus className="w-4 h-4" />
                Create New Quiz
              </button>
            )}
          </div>

          {/* Teacher Filter Controls */}
          {isTeacherOrAdmin && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  All Quizzes ({quizzes.length})
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'published'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live / Active ({publishedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'draft'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-amber-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Drafts ({draftCount})
                </button>
              </div>

              <input
                type="text"
                placeholder="Search quizzes by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quizzes List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isTeacherOrAdmin ? 'Assessment Quizzes' : 'Available Active Quizzes'} ({visibleQuizzes.length})
                </h3>
              </div>

              {visibleQuizzes.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No quizzes found matching your filter.
                  </p>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Assessment Quiz
                    </button>
                  )}
                </div>
              ) : (
                visibleQuizzes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-purple-300 dark:hover:border-purple-800/60"
                    id={`quiz-card-${q.id}`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase text-purple-700 bg-purple-100 dark:bg-purple-950/80 dark:text-purple-300 px-2.5 py-0.5 rounded">
                          {q.subjectName}
                        </span>
                        {q.semester && (
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded">
                            Sem {q.semester}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            q.isPublished
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${q.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {q.isPublished ? 'Active / Live' : 'Draft (Unpublished)'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{q.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                        <span>📋 {q.questions?.length || 0} Questions</span>
                        <span>⏱️ {q.durationMinutes} Mins</span>
                        <span>🎯 {q.totalMarks} Marks</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {isTeacherOrAdmin && (
                        <>
                          {/* Toggle publish / draft status */}
                          {onToggleQuizStatus && (
                            <button
                              onClick={() => onToggleQuizStatus(q.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                q.isPublished
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:dark:bg-rose-950/30'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                              title={q.isPublished ? 'Click to Set as Draft (Hide from students)' : 'Click to Publish (Make Live for students)'}
                            >
                              {q.isPublished ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                                  <span>Live</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-amber-600" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Edit Quiz */}
                          <button
                            onClick={() => handleOpenEditModal(q)}
                            className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                            title="Edit Questions, Options & Configuration"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Quiz */}
                          {onDeleteQuiz && (
                            <button
                              onClick={() => onDeleteQuiz(q.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Delete Quiz"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {/* Start / Preview button */}
                      <button
                        onClick={() => startQuiz(q)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        id={`start-quiz-btn-${q.id}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> {isTeacherOrAdmin ? 'Preview Quiz' : 'Start Assessment'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Leaderboard & Info */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Top Student Leaderboard
                  </h3>
                </div>

                <div className="space-y-2">
                  {quizResults.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No student scores submitted yet.</p>
                  ) : (
                    quizResults.slice(0, 8).map((res, rank) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 font-bold text-[10px] flex items-center justify-center">
                            #{rank + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {res.studentName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {res.quizTitle}
                            </span>
                          </div>
                        </div>
                        <span className="font-extrabold text-amber-600">{res.score} Marks</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Assessment Guidelines Card */}
              <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                  <Info className="w-4 h-4" />
                  <span>Assessment Guidelines</span>
                </div>
                <ul className="text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 text-[11px]">
                  <li>Quizzes saved as <strong>Draft</strong> remain private for faculty review.</li>
                  <li><strong>Live / Active</strong> quizzes automatically notify enrolled students.</li>
                  <li>Automated timer automatically submits and grades when the clock expires.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE / EDIT ASSESSMENT QUIZ MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingQuizId ? 'Edit Assessment Quiz' : 'Create New Assessment Quiz'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define question statements, multiple choice options, correct answers, and publication status
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Banner */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Quiz Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Unit 3 Test: Virtual Memory, Paging & Scheduling"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Subject / Course <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      {AVAILABLE_SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                      <option value={3}>Semester 3</option>
                      <option value={4}>Semester 4</option>
                      <option value={5}>Semester 5</option>
                      <option value={6}>Semester 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* QUESTIONS & ANSWERS BUILDER */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Questions & Answer Keys</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold">
                        {questions.length} Questions • {totalMarks} Total Marks
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Specify the question text, multiple choices, and select the correct answer key.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                {/* Question Cards List */}
                <div className="space-y-5">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4"
                    >
                      {/* Question Card Top Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                            Q{qIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Question {qIdx + 1} of {questions.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(qIdx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
                            title="Duplicate Question"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Textarea */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Question Statement <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                          placeholder="e.g. Which CPU scheduling algorithm avoids indefinite starvation through dynamic aging?"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none font-medium"
                        />
                      </div>

                      {/* Options & Correct Answer Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                            Answer Choices <span className="text-slate-400 font-normal">(Click the checkmark to set the correct answer)</span>
                          </label>
                          {q.options.length < 5 && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(qIdx)}
                              className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                            >
                              + Add Choice
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {/* Correct Answer Radio Selector */}
                                <button
                                  type="button"
                                  onClick={() => handleSetCorrectAnswer(qIdx, optIdx)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700'
                                  }`}
                                  title="Mark as correct answer"
                                >
                                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 text-center">{String.fromCharCode(65 + optIdx)}</span>}
                                  <span>{isCorrect ? 'Correct' : `Option ${String.fromCharCode(65 + optIdx)}`}</span>
                                </button>

                                {/* Option Input Text */}
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                                  placeholder={`Choice ${String.fromCharCode(65 + optIdx)} text...`}
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
                                />

                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                                    title="Remove this option"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation / Hint Field */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Solution Explanation / Learning Note <span className="text-slate-400 font-normal">(Shown to students upon evaluation)</span>
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                          placeholder="e.g. Priority scheduling with aging gradually increases process priority over time."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Add Question Button */}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Another Question
                </button>
              </div>

              {/* Publication Status Selector Banner */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Publication Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPublishStatus(false)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      !publishStatus
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${!publishStatus ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Save as Draft</p>
                      <p className="text-[10px] text-slate-500">Keep hidden from students; available for faculty preview & edits.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPublishStatus(true)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      publishStatus
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${publishStatus ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Publish Immediately</p>
                      <p className="text-[10px] text-slate-500">Activate assessment right now for all enrolled students.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSaveQuiz(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-200 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300 dark:border-amber-800"
                  id="save-quiz-as-draft-btn"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveQuiz(true)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="publish-quiz-btn"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save & Publish Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
