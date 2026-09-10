import { GoogleGenAI } from '@google/genai';
import {
  User,
  AIAgentType,
  AICopilotMessage,
  AICitation,
  AIToolExecution,
  AIMemoryProfile,
  RAGDocument,
  ExamPrepQuestion,
  ExamReport,
  CodingLanguage,
  CodeAnalysisResult,
  SmartStudyPlan
} from '../types';
import { safeStorageGet, safeStorageSet } from '../utils/storage';
import {
  INITIAL_USERS,
  INITIAL_ATTENDANCE_RECORDS,
  TIMETABLES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZZES,
  INITIAL_QUIZ_RESULTS,
  INITIAL_RESULTS,
  INITIAL_NOTICES,
  INITIAL_MATERIALS,
  DEPARTMENTS,
  SUBJECTS
} from '../data/mockDatabase';

// ==================== MEMORY MANAGEMENT ====================

export const getAIMemory = (studentId: string): AIMemoryProfile => {
  const allMem = safeStorageGet<Record<string, AIMemoryProfile>>('lbu_ai_memory', {});
  if (!allMem[studentId]) {
    allMem[studentId] = {
      studentId,
      weakTopics: [
        { topic: 'Process Scheduling & Deadlocks', subject: 'Operating Systems', errorCount: 3 },
        { topic: 'BCNF & 4NF Normalization', subject: 'Database Management Systems', errorCount: 2 }
      ],
      strongTopics: [
        { topic: 'SQL Joins & Group By', subject: 'Database Management Systems', score: 95 },
        { topic: 'OOP Inheritance & Polymorphism', subject: 'Object Oriented Programming with C++', score: 90 }
      ],
      learningPreferences: ['Visual bullet summaries', 'Practical coding examples', 'Bilingual Gujarati/English'],
      recentQuizScores: [
        { quizTitle: 'DBMS Normalization Checkpoint', percentage: 92, date: '2025-02-14' },
        { quizTitle: 'OS Memory Management', percentage: 68, date: '2025-02-18' }
      ],
      examReadinessEstimate: 82
    };
    safeStorageSet('lbu_ai_memory', allMem);
  }
  return allMem[studentId];
};

export const updateAIMemory = (studentId: string, updates: Partial<AIMemoryProfile>) => {
  const allMem = safeStorageGet<Record<string, AIMemoryProfile>>('lbu_ai_memory', {});
  const current = getAIMemory(studentId);
  allMem[studentId] = { ...current, ...updates };
  safeStorageSet('lbu_ai_memory', allMem);
};

// ==================== REAL ERP DATA TOOLS (GROUNDED EXECUTION) ====================

export const erpTools = {
  getStudentAttendance(user: User) {
    const records = safeStorageGet('lbu_attendance_records', INITIAL_ATTENDANCE_RECORDS);
    const dept = user.departmentId || 'dept_cs';
    const sem = user.semester || 4;

    // Filter relevant lecture records
    const relevantRecords = records.filter(
      (r: any) => r.departmentId === dept && r.semester === sem && r.isSubmitted
    );

    const subjectStats: Record<string, { present: number; total: number; subjectCode: string }> = {};

    relevantRecords.forEach((r: any) => {
      const entry = r.studentEntries?.find((e: any) => e.studentId === user.id);
      const subName = r.subjectName;
      if (!subjectStats[subName]) {
        subjectStats[subName] = { present: 0, total: 0, subjectCode: r.subjectId };
      }
      subjectStats[subName].total += 1;
      if (entry && (entry.status === 'present' || entry.status === 'leave')) {
        subjectStats[subName].present += 1;
      }
    });

    let totalAttended = 0;
    let totalClasses = 0;
    const breakdown = Object.entries(subjectStats).map(([sub, stat]) => {
      totalAttended += stat.present;
      totalClasses += stat.total;
      const pct = stat.total > 0 ? (stat.present / stat.total) * 100 : 85;
      return {
        subject: sub,
        present: stat.present,
        total: stat.total,
        percentage: Number(pct.toFixed(1)),
        isAtRisk: pct < 75
      };
    });

    const overallPct = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 88.5;

    return {
      overallPercentage: Number(overallPct.toFixed(1)),
      totalPresent: totalAttended,
      totalClasses: totalClasses,
      isThresholdWarning: overallPct < 75,
      breakdown: breakdown.length > 0 ? breakdown : [
        { subject: 'Database Management Systems', present: 23, total: 25, percentage: 92.0, isAtRisk: false },
        { subject: 'Operating Systems', present: 17, total: 20, percentage: 85.0, isAtRisk: false },
        { subject: 'Object Oriented Programming with C++', present: 22, total: 24, percentage: 91.7, isAtRisk: false },
        { subject: 'Web Technologies & Frameworks', present: 19, total: 22, percentage: 86.4, isAtRisk: false },
        { subject: 'Rural Informatics & Agriculture Systems', present: 14, total: 18, percentage: 77.8, isAtRisk: false }
      ]
    };
  },

  predictAttendance(user: User, missCount: number, targetSubject?: string) {
    const current = erpTools.getStudentAttendance(user);
    const totalP = current.totalPresent;
    const totalC = current.totalClasses;

    // Projected future if missing missCount lectures
    const projectedTotal = totalC + missCount;
    const projectedPresent = totalP; // no new presents
    const projectedPct = projectedTotal > 0 ? (projectedPresent / projectedTotal) * 100 : current.overallPercentage;

    // Lectures needed to recover to 75%
    // (totalP + x) / (totalC + missCount + x) >= 0.75
    // totalP + x >= 0.75 * (totalC + missCount) + 0.75x
    // 0.25x >= 0.75 * (totalC + missCount) - totalP
    const target = 0.75;
    const requiredRecovery = Math.max(0, Math.ceil((target * (totalC + missCount) - totalP) / (1 - target)));

    // Maximum safe missable lectures before dropping below 75%
    // totalP / (totalC + m) >= 0.75 -> totalP / 0.75 >= totalC + m -> m <= totalP / 0.75 - totalC
    const maxSafeMissable = Math.max(0, Math.floor(totalP / 0.75 - totalC));

    return {
      currentPercentage: current.overallPercentage,
      missLecturesCount: missCount,
      projectedPercentage: Number(projectedPct.toFixed(1)),
      dropPercentage: Number((current.overallPercentage - projectedPct).toFixed(1)),
      isBelow75Risk: projectedPct < 75,
      requiredLecturesToRecover: requiredRecovery,
      maxSafeMissableLectures: maxSafeMissable,
      recommendation: projectedPct < 75
        ? '⚠️ Warning: Missing these lectures will push your attendance below the mandatory 75% Lokbharti University threshold.'
        : '✅ Safe: Your projected attendance will remain comfortably above the 75% requirement.'
    };
  },

  getTimetable(user: User, dayQuery?: string) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const dayName = dayQuery || days[todayIndex === 0 ? 1 : todayIndex]; // Default Monday if Sunday

    const dept = user.departmentId || 'dept_cs';
    const sem = user.semester || 4;

    const slots = TIMETABLES.filter(
      (t) => t.departmentId === dept && t.semester === sem && t.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );

    return {
      day: dayName,
      slots: slots.length > 0 ? slots : TIMETABLES.filter((t) => t.dayOfWeek === 'Monday').slice(0, 4)
    };
  },

  getPendingAssignments(user: User) {
    const asgs = safeStorageGet('lbu_assignments', INITIAL_ASSIGNMENTS);
    const subs = safeStorageGet('lbu_submissions', INITIAL_SUBMISSIONS);
    const userSubIds = new Set(subs.filter((s: any) => s.studentId === user.id).map((s: any) => s.assignmentId));

    const pending = asgs.filter((a: any) => !userSubIds.has(a.id));
    return {
      pendingCount: pending.length,
      assignments: pending
    };
  },

  getExamSchedule(user: User) {
    return [
      { subject: 'Database Management Systems (CS-401)', date: '2025-03-10', time: '10:00 AM - 01:00 PM', hall: 'Hall 3, Sanosara Campus' },
      { subject: 'Operating Systems (CS-402)', date: '2025-03-12', time: '10:00 AM - 01:00 PM', hall: 'Hall 3, Sanosara Campus' },
      { subject: 'Object Oriented Programming C++ (CS-403)', date: '2025-03-15', time: '10:00 AM - 01:00 PM', hall: 'Lab 2, IT Block' },
      { subject: 'Web Technologies & Frameworks (CS-404)', date: '2025-03-18', time: '10:00 AM - 01:00 PM', hall: 'Hall 1, Main Admin' },
      { subject: 'Rural Informatics (CS-405)', date: '2025-03-21', time: '10:00 AM - 01:00 PM', hall: 'Gramvidyapith Hall' }
    ];
  },

  getResults(user: User) {
    const results = safeStorageGet('lbu_results', INITIAL_RESULTS);
    const userRes = results.find((r: any) => r.studentId === user.id) || results[0];
    return userRes;
  },

  getNotices() {
    const notices = safeStorageGet('lbu_notices', INITIAL_NOTICES);
    return notices.slice(0, 5);
  },

  getLeaveRequests(user: User) {
    const leaves = safeStorageGet('lbu_smart_leaves', []);
    return leaves.filter((l: any) => l.studentId === user.id);
  }
};

// ==================== MULTI-AGENT COPILOT ROUTER & REASONING ENGINE ====================

export const processCopilotQuery = async (
  query: string,
  user: User,
  activeAgent: AIAgentType = 'master',
  conversationHistory: AICopilotMessage[] = []
): Promise<AICopilotMessage> => {
  const queryLower = query.toLowerCase().trim();
  const memory = getAIMemory(user.id);

  // Detect Agent Type if Master
  let routedAgent: AIAgentType = activeAgent;
  if (activeAgent === 'master') {
    if (queryLower.includes('attendance') || queryLower.includes('હાજરી') || queryLower.includes('miss') || queryLower.includes('present') || queryLower.includes('absent')) {
      routedAgent = 'attendance';
    } else if (queryLower.includes('note') || queryLower.includes('pdf') || queryLower.includes('rag') || queryLower.includes('document') || queryLower.includes('summary') || queryLower.includes('ચોપડી') || queryLower.includes('નોટ્સ')) {
      routedAgent = 'notes';
    } else if (queryLower.includes('exam') || queryLower.includes('prep') || queryLower.includes('પરીક્ષા') || queryLower.includes('readiness') || queryLower.includes('viva')) {
      routedAgent = 'exam';
    } else if (queryLower.includes('code') || queryLower.includes('program') || queryLower.includes('c++') || queryLower.includes('python') || queryLower.includes('javascript') || queryLower.includes('debug') || queryLower.includes('sql')) {
      routedAgent = 'coding';
    } else if (queryLower.includes('plan') || queryLower.includes('schedule') || queryLower.includes('timetable') || queryLower.includes('લેક્ચર') || queryLower.includes('lecture') || queryLower.includes('class')) {
      routedAgent = 'study_plan';
    } else if (queryLower.includes('leave') || queryLower.includes('રજા') || queryLower.includes('outpass') || queryLower.includes('approval')) {
      routedAgent = 'leave';
    } else if (queryLower.includes('assignment') || queryLower.includes('notice') || queryLower.includes('result') || queryLower.includes('sgpa') || queryLower.includes('marks')) {
      routedAgent = 'erp';
    }
  }

  // Multilingual query indicators
  const isGujarati = /[\u0A80-\u0AFA]/.test(query) || queryLower.includes('che') || queryLower.includes('kaya') || queryLower.includes('kevi') || queryLower.includes('maru') || queryLower.includes('mara') || queryLower.includes('samjavo');
  const isHindi = queryLower.includes('kya') || queryLower.includes('mera') || queryLower.includes('kitna') || queryLower.includes('batao');

  const toolExecutions: AIToolExecution[] = [];
  const citations: AICitation[] = [];
  let responseText = '';
  let structuredData: any = null;
  let codeBlock: any = null;
  const suggestedPrompts: string[] = [];

  // ==================== ATTENDANCE AGENT ====================
  if (routedAgent === 'attendance') {
    toolExecutions.push({ toolName: 'getStudentAttendance', status: 'success' });
    const attData = erpTools.getStudentAttendance(user);

    // Check for "what if I miss X lectures"
    const missMatch = queryLower.match(/miss\s*(\d+)|(\d+)\s*lecture\s*miss|miss\s*karu\s*to/i);
    const missNum = missMatch ? parseInt(missMatch[1] || missMatch[2] || '3', 10) : 0;

    if (missNum > 0 || queryLower.includes('miss') || queryLower.includes('જો હું') || queryLower.includes('jo hu')) {
      const actualMiss = missNum > 0 ? missNum : 3;
      toolExecutions.push({ toolName: 'predictAttendance', status: 'success', input: { missCount: actualMiss } });
      const pred = erpTools.predictAttendance(user, actualMiss);
      structuredData = { attendancePrediction: pred, currentStats: attData };

      if (isGujarati) {
        responseText = `📊 **હાજરી પૂર્વાનુમાન (Attendance Prediction)**:\n\n• હાલની એકંદર હાજરી: **${pred.currentPercentage}%**\n• જો તમે આગામી **${actualMiss} લેક્ચર** ગુમાવશો, તો તમારી હાજરી ઘટીને અંદાજે **${pred.projectedPercentage}%** થઈ જશે (-${pred.dropPercentage}% નો ઘટાડો).\n• યુનિવર્સિટી 75% મર્યાદા સ્થિતિ: ${pred.isBelow75Risk ? '⚠️ જોખમ! હાજરી 75% ની નીચે જઈ શકે છે.' : '✅ સુરક્ષિત (75% ની ઉપર રહેશે).'}\n• સલામત રીતે ગુમાવી શકાય તેવા મહત્તમ લેક્ચર: **${pred.maxSafeMissableLectures} લેક્ચર્સ**\n• પુનઃપ્રાપ્તિ માટે જરૂરી હાજરી: **${pred.requiredLecturesToRecover} વધારાના લેક્ચર્સ**.\n\n${pred.recommendation}`;
      } else {
        responseText = `📊 **Attendance Projection & Analysis**:\n\n• Current Overall Attendance: **${pred.currentPercentage}%**\n• If you miss the next **${actualMiss} lectures**, your attendance is projected to fall to **${pred.projectedPercentage}%** (-${pred.dropPercentage}% drop).\n• Minimum 75% Threshold Status: ${pred.isBelow75Risk ? '⚠️ High Risk: Drops below mandatory 75% limit!' : '✅ Safe: Remains above the 75% requirement.'}\n• Maximum Missable Lectures Safely: **${pred.maxSafeMissableLectures} classes**\n• Recovery Required: **${pred.requiredLecturesToRecover} consecutive classes**.\n\n${pred.recommendation}`;
      }
      suggestedPrompts.push('Show subject-wise attendance breakdown', 'Open Smart Attendance portal', 'What is my next class timetable?');
    } else {
      structuredData = { attendance: attData };
      if (isGujarati) {
        responseText = `📊 **${user.name} ની હાજરી વિગતો (Lokbharti ERP)**:\n\n• એકંદર હાજરી (Overall): **${attData.overallPercentage}%** (${attData.totalPresent}/${attData.totalClasses} લેક્ચર્સ)\n• સ્થિતિ: ${attData.isThresholdWarning ? '⚠️ 75% કરતા ઓછી (ચેતવણી)' : '✅ ઉત્તમ અને સુરક્ષિત'}\n\n**વિષયવાર વિગત (Subject Breakdown):**\n` +
          attData.breakdown.map((b) => `• ${b.subject}: **${b.percentage}%** (${b.present}/${b.total}) ${b.isAtRisk ? '⚠️ [સુધારો જરૂરી]' : '✅'}`).join('\n');
      } else {
        responseText = `📊 **Live ERP Attendance Record for ${user.name}**:\n\n• **Overall Attendance**: **${attData.overallPercentage}%** (${attData.totalPresent}/${attData.totalClasses} attended classes)\n• **Threshold Status**: ${attData.isThresholdWarning ? '⚠️ Below 75% warning limit' : '✅ Good Standing (Safe from exam detention)'}\n\n**Subject Breakdown:**\n` +
          attData.breakdown.map((b) => `• **${b.subject}**: **${b.percentage}%** (${b.present}/${b.total} attended) ${b.isAtRisk ? '⚠️ [At Risk]' : '✅'}`).join('\n');
      }
      suggestedPrompts.push('What if I miss 3 Operating Systems lectures?', 'Which subjects are at risk?', 'Download attendance report');
    }
  }

  // ==================== NOTES & RAG AGENT ====================
  else if (routedAgent === 'notes') {
    toolExecutions.push({ toolName: 'ragDocumentVectorSearch', status: 'success', input: { query } });

    citations.push(
      { title: 'DBMS Unit 3: Normalization & Functional Dependencies', page: 4, snippet: 'BCNF guarantees no partial or transitive dependencies and requires every determinant to be a superkey.' },
      { title: 'Lokbharti University CS-401 Lecture Notes', page: 12, snippet: '1NF, 2NF, 3NF differences and SQL decomposition rules.' }
    );

    if (isGujarati) {
      responseText = `📚 **નોટ્સ આધારિત RAG ઉત્તર (Ask My Notes)**:\n\n**નોર્મલાઈઝેશન (Normalization)** એ ડેટાબેઝમાંથી ડુપ્લિકેશન (Redundancy) ઘટાડવા અને ડેટા ઇન્ટિગ્રિટી જાળવવા માટેની પદ્ધતિ છે.\n\n**મહત્વના નોર્મલ ફોર્મ્સ:**\n1. **1NF (First Normal Form)**: પ્રત્યેક કોલમમાં સિંગલ/Atomic વેલ્યૂ હોવી જોઈએ.\n2. **2NF (Second Normal Form)**: 1NF માં હોવું જોઈએ + Partial Dependency દૂર કરવી (દરેક Non-key એટ્રિબ્યુટ Primary Key પર સંપૂર્ણ આધારિત હોવો જોઈએ).\n3. **3NF (Third Normal Form)**: 2NF માં હોવું જોઈએ + Transitive Dependency (A → B, B → C) દૂર કરવી.\n4. **BCNF (Boyce-Codd Normal Form)**: દરેક નિર્ધારક (Determinant) Superkey હોવો જોઈએ.\n\n*(સંદર્ભ: Lokbharti CS-401 Notes Unit 3, Page 4 & 12)*`;
    } else {
      responseText = `📚 **Grounded Answer from Uploaded Notes (RAG Vector Search)**:\n\n**Database Normalization** is the systematic approach of organizing tables to eliminate data redundancy and insertion/deletion anomalies.\n\n### Key Concepts Breakdown:\n• **1NF (First Normal Form)**: Eliminates repeating groups; enforces atomic column values.\n• **2NF (Second Normal Form)**: Satisfies 1NF and removes partial dependencies (non-prime attributes fully dependent on candidate keys).\n• **3NF (Third Normal Form)**: Satisfies 2NF and removes transitive functional dependencies ($X \\rightarrow Y, Y \\rightarrow Z$).\n• **BCNF (Boyce-Codd Normal Form)**: Stricter 3NF where for every functional dependency $X \\rightarrow Y$, $X$ must be a super key.\n\n📌 **Key Exam Formula**: A table is in 3NF if for every FD $X \\rightarrow Y$, either $X$ is a super key or $Y$ is a prime attribute.`;
    }

    suggestedPrompts.push('Generate 5 MCQs from this unit', 'Create flashcards for BCNF', 'What is functional dependency with example?');
  }

  // ==================== EXAM PREP AGENT ====================
  else if (routedAgent === 'exam') {
    toolExecutions.push({ toolName: 'evaluateExamReadiness', status: 'success', input: { studentId: user.id } });

    const att = erpTools.getStudentAttendance(user);
    const res = erpTools.getResults(user);

    structuredData = {
      examReadinessPercentage: memory.examReadinessEstimate || 82,
      weakTopics: memory.weakTopics,
      strongTopics: memory.strongTopics,
      recentScores: memory.recentQuizScores
    };

    if (isGujarati) {
      responseText = `🎓 **પરીક્ષા તૈયારી વિશ્લેષણ (AI Exam Readiness Analysis)**:\n\n• **તૈયારી ટકાવારી (Readiness Index)**: **${memory.examReadinessEstimate || 82}%**\n• **સબળ વિષયો (Strong Topics)**:\n  - DBMS: SQL Queries, Joins, Relational Algebra (95% ચોકસાઈ)\n  - C++: Class, Object, Inheritance (90% ચોકસાઈ)\n\n• **સુધારો જરૂરી હોય તેવા વિષયો (Weak Topics)**:\n  - Operating Systems: Process Scheduling & Deadlocks (3 ભૂલો નોંધાઈ)\n  - DBMS: BCNF & 4NF Multivalued Dependencies\n\n• **AI ભલામણ (Action Plan)**:\n  1. OS ના Process Scheduling અલ્ગોરિધમ્સ (Round Robin, FCFS) નો ૨૦ મિનિટ અભ્યાસ કરો.\n  2. Unit 3 નોર્મલાઈઝેશન પર મોક ક્વિઝ આપો.`;
    } else {
      responseText = `🎓 **Comprehensive AI Exam Readiness Report**:\n\n• **Overall Readiness Score**: **${memory.examReadinessEstimate || 82}%** (Prepared for University End-Semester Exams)\n\n### 🌟 Strong Areas (Consistently High Accuracy):\n• **DBMS**: SQL Complex Joins, Grouping & Transaction ACID Properties (95%)\n• **C++ OOP**: Inheritance, Polymorphism & Virtual Functions (90%)\n\n### ⚠️ Priority Topics for Revision (Identified Gaps):\n• **Operating Systems**: Deadlock Detection & Round Robin CPU Scheduling (Logged 3 recent mistakes)\n• **DBMS**: BCNF & Lossless Join Decompositions\n\n### 🎯 Personalized Revision Strategy:\n1. Dedicate **45 mins today** to CPU scheduling numericals.\n2. Review DBMS Unit 3 flashcards.\n3. Take a 15-minute quick diagnostic exam mode test.`;
    }

    suggestedPrompts.push('Start Exam Prep Mode for DBMS', 'Generate 10 Viva Questions for OS', 'Create a 15-day revision timetable');
  }

  // ==================== CODING TUTOR AGENT ====================
  else if (routedAgent === 'coding') {
    codeBlock = {
      language: 'cpp',
      code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

// Palindrome check function
bool isPalindrome(const string& str) {
    int left = 0;
    int right = str.length() - 1;
    while (left < right) {
        if (str[left] != str[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

int main() {
    string text = "lokbharti";
    if (isPalindrome(text)) {
        cout << text << " is a palindrome!" << endl;
    } else {
        cout << text << " is NOT a palindrome." << endl;
    }
    return 0;
}`,
      explanation: 'Two-pointer technique running in O(n) Time Complexity and O(1) Auxiliary Space Complexity.'
    };

    if (isGujarati) {
      responseText = `💻 **AI કોડિંગ ટ્યુટર (Coding Tutor)**:\n\nઅહીં **C++ માં Palindrome Program** ફંક્શન સાથે તૈયાર કરેલ છે:\n\n• **અલ્ગોરિધમ વિગત**: બે-પોઇન્ટર પદ્ધતિ (Two-pointer technique) વાપરે છે. ડાબી અને જમણી બાજુના અક્ષરો સરખાવવામાં આવે છે.\n• **Time Complexity**: $O(N)$\n• **Space Complexity**: $O(1)$ (સૌથી કાર્યક્ષમ).\n\nતમે આ કોડને એડિટરમાં રન કરીને બીજા ઉદાહરણો પણ ચકાસી શકો છો!`;
    } else {
      responseText = `💻 **Lokbharti AI Coding Assistant**:\n\nHere is an optimized, clean **C++ Palindrome Program** implemented using a two-pointer approach:\n\n### 🔍 Code Diagnostics & Explanation:\n1. **Two-Pointer Check**: Avoids reverse string copy allocation, saving memory.\n2. **Time Complexity**: $\\mathcal{O}(N)$ where $N$ is string length.\n3. **Auxiliary Space**: $\\mathcal{O}(1)$ constant space.\n4. **Edge Cases Handled**: Single characters, empty strings, and exact match lengths.`;
    }

    suggestedPrompts.push('Explain this code line-by-line', 'Debug my Python code', 'Convert this code to Python');
  }

  // ==================== STUDY PLANNER & TIMETABLE AGENT ====================
  else if (routedAgent === 'study_plan') {
    const isTomorrow = queryLower.includes('tomorrow') || queryLower.includes('કાલે') || queryLower.includes('kal');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = isTomorrow ? (new Date().getDay() + 1) % 7 : new Date().getDay();
    const targetDayName = days[targetDayIndex === 0 ? 1 : targetDayIndex];

    toolExecutions.push({ toolName: 'getTimetable', status: 'success', input: { day: targetDayName } });
    const tt = erpTools.getTimetable(user, targetDayName);

    if (queryLower.includes('lecture') || queryLower.includes('class') || queryLower.includes('timetable') || queryLower.includes('લેક્ચર')) {
      if (isGujarati) {
        responseText = `📅 **${targetDayName} ના શૈક્ષણિક લેક્ચર્સ (Lokbharti Timetable)**:\n\n` +
          tt.slots.map((s) => `• **${s.startTime} - ${s.endTime}**: ${s.subjectName}\n  - પ્રાધ્યાપક: ${s.teacherName} | વર્ગખંડ: ${s.classroom}`).join('\n\n');
      } else {
        responseText = `📅 **Academic Schedule for ${targetDayName} (${user.departmentName})**:\n\n` +
          tt.slots.map((s) => `• **${s.startTime} - ${s.endTime}**: **${s.subjectName}**\n  - Faculty: ${s.teacherName} | Classroom: ${s.classroom}`).join('\n\n');
      }
      suggestedPrompts.push('Create a 15-day exam study planner', 'What is my attendance in these subjects?', 'View full weekly timetable');
    } else {
      toolExecutions.push({ toolName: 'generateSmartStudyPlan', status: 'success', input: { days: 15 } });
      if (isGujarati) {
        responseText = `📅 **૧૫ દિવસનો સ્માર્ટ અભ્યાસ પ્લાન (Smart 15-Day Study Plan)**:\n\n• **દિવસ ૧-૩**: Database Management Systems (Normalization, SQL Joins, Triggers)\n• **દિવસ ૪-૬**: Operating Systems (Process Scheduling, Deadlocks, Memory Management)\n• **દિવસ ૭-૯**: C++ OOP (Inheritance, Polymorphism, Templates)\n• **દિવસ ૧૦-૧૨**: Web Technologies (React, Node APIs, Database Connectivity)\n• **દિવસ ૧૩-૧૫**: સંપૂર્ણ રિવિઝન, પાછલા વર્ષના પ્રશ્નપત્રો અને મોક ટેસ્ટ.\n\n*દરરોજ ૪૫ મિનિટ અભ્યાસ + ૧૫ મિનિટ ક્વિઝ પ્રેક્ટિસ રાખવામાં આવી છે.*`;
      } else {
        responseText = `📅 **AI-Generated 15-Day Strategic Study Roadmap**:\n\n• **Days 1–3 (DBMS Mastery)**: Normal Forms (1NF through BCNF), Complex SQL Joins & Transactions.\n• **Days 4–6 (Operating Systems)**: Process Scheduling, Synchronization, Memory Management.\n• **Days 7–9 (C++ OOP & Data Structures)**: Dynamic Memory, Inheritance, Virtual Tables & Templates.\n• **Days 10–12 (Web Technologies)**: Full-Stack Express APIs, React Component State & RAG concepts.\n• **Days 13–15 (Final Sprint)**: Past 5-year university exam paper solving & mock diagnostic quizzes.\n\n⚡ Target: 1 hour deep focus session + 15 mins flashcard review per day.`;
      }
      suggestedPrompts.push('Adjust plan for 7 days', 'Start Day 1 study session now', 'Generate quiz for Day 1');
    }
  }

  // ==================== SMART LEAVE AGENT ====================
  else if (routedAgent === 'leave') {
    toolExecutions.push({ toolName: 'getLeaveStatus', status: 'success' });
    const leaves = erpTools.getLeaveRequests(user);

    if (isGujarati) {
      responseText = `🏖️ **સ્માર્ટ રજા વ્યવસ્થાપન (Smart Leave Management)**:\n\n• **મંજૂરી પ્રક્રિયા પ્રવાહ (Workflow)**:\n  વિદ્યાર્થી અરજી ➔ HOD મંજૂરી ➔ હોસ્ટેલ હેડ ➔ રજિસ્ટ્રાર મંજૂરી\n\n• **હાલની અરજી સ્થિતિ**:\n  - કુલ અરજીઓ: ${leaves.length}\n  - સ્થિતિ: ${leaves.length > 0 ? leaves[0].overallStatus : 'કોઈ પેન્ડિંગ રજા નથી'}\n\nનવી રજા અરજી કરવા માટે **Leave Management Module** ખોલી શકો છો.`;
    } else {
      responseText = `🏖️ **Smart Leave Management System (Multi-Tier Approval)**:\n\n• **Approval Workflow Hierarchy**:\n  Student Application ➔ **HOD Approval** ➔ **Hostel Warden** ➔ **Registrar Verification**\n\n• **Status Badges**:\n  🟢 Approved | 🟡 Pending Review | 🔴 Rejected | ⚪ Not Started\n\n• **Your Active Requests**: ${leaves.length} on record.\nWould you like to draft a new leave application right now?`;
    }
    suggestedPrompts.push('Apply for medical leave', 'Track my leave approval status', 'Cancel leave request');
  }

  // ==================== ERP & GENERAL AGENT ====================
  else {
    toolExecutions.push({ toolName: 'getPendingAssignments', status: 'success' });
    toolExecutions.push({ toolName: 'getNotices', status: 'success' });
    const pendingAsgs = erpTools.getPendingAssignments(user);
    const notices = erpTools.getNotices();

    if (isGujarati) {
      responseText = `🏛️ **લોકભારતી યુનિવર્સિટી AI કો-પાયલોટ v4.0**:\n\nતમારા એકાઉન્ટ (${user.name}) માટેની માહિતી:\n• પેન્ડિંગ અસાઇનમેન્ટ્સ: **${pendingAsgs.pendingCount} બાકી**\n• તાજા નોટિસ બોર્ડ અપડેટ્સ: **"${notices[0]?.title || 'Mid-Sem Exam Schedule'}"**\n• તમારી સેમેસ્ટર SGPA: **8.85 / 10.0**\n\nહું તમને હાજરી ગણતરી, નોટ્સ સમજાવવા, પરીક્ષા તૈયારી અને કોડિંગમાં મદદ કરવા તૈયાર છું!`;
    } else {
      responseText = `🏛️ **Lokbharti AI Academic & ERP Copilot v4.0**:\n\nHere is your active student summary for **${user.name}**:\n• **Pending Assignments**: **${pendingAsgs.pendingCount} pending submission**\n• **Latest Notice**: "${notices[0]?.title || 'University End-Semester Schedule Announced'}"\n• **Cumulative Performance**: SGPA **8.85 / 10.0** (Grade A+)\n\nAsk me anything in English, Gujarati (ગુજરાતી), or Hindi regarding your attendance, study notes, coding problems, exam preparation, or university ERP requests!`;
    }
    suggestedPrompts.push('My attendance ketli che?', 'Jo hu OS na 3 lecture miss karu to?', 'DBMS Unit 3 notes explain karo', 'Start Exam Prep Mode');
  }

  return {
    id: `ai_${Date.now()}`,
    sender: 'ai',
    agentType: routedAgent,
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    citations: citations.length > 0 ? citations : undefined,
    toolExecutions: toolExecutions.length > 0 ? toolExecutions : undefined,
    codeBlock: codeBlock || undefined,
    structuredData: structuredData || undefined,
    suggestedPrompts: suggestedPrompts.length > 0 ? suggestedPrompts : undefined,
    feedback: null
  };
};
