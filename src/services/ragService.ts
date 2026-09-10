import { RAGDocument, RAGChunk, Flashcard, MindMapNode } from '../types';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

export const INITIAL_RAG_DOCUMENTS: RAGDocument[] = [
  {
    id: 'doc_dbms_unit3',
    title: 'DBMS Unit 3: Normalization & Functional Dependencies',
    fileName: 'DBMS_Unit3_Normalization.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    subjectId: 'sub_cs401',
    subjectName: 'Database Management Systems',
    departmentId: 'dept_cs',
    uploadedBy: 'Dr. Ramesh Solanki',
    uploadedAt: '2025-02-10 10:30',
    extractedText: `Unit 3: Database Normalization.
Database Normalization is the process of structuring a relational database in accordance with a series of normal forms in order to reduce data redundancy and improve data integrity.
Functional Dependency: If attribute Y is functionally dependent on attribute X (X -> Y), then for every valid instance of X, there is a uniquely determined value of Y.
First Normal Form (1NF): Each table cell contains only atomic (single) values. No repeating groups or arrays.
Second Normal Form (2NF): Meets 1NF requirements and all non-key attributes are fully functionally dependent on the entire primary key (no partial dependencies).
Third Normal Form (3NF): Meets 2NF requirements and all attributes are determined only by the candidate keys, not by non-candidate keys (no transitive dependencies X -> Y -> Z).
Boyce-Codd Normal Form (BCNF): A stricter version of 3NF where for every functional dependency X -> Y, X must be a super key.
Lossless Join Decomposition: A decomposition of relation R into R1 and R2 is lossless if natural join of R1 and R2 produces exactly R without spurious tuples.`,
    chunks: [
      {
        id: 'chk_1',
        docId: 'doc_dbms_unit3',
        docTitle: 'DBMS Unit 3: Normalization',
        pageNumber: 1,
        content: 'Database Normalization is the process of structuring a relational database in accordance with a series of normal forms in order to reduce data redundancy and improve data integrity.',
        keywords: ['normalization', 'redundancy', 'integrity', 'relational database']
      },
      {
        id: 'chk_2',
        docId: 'doc_dbms_unit3',
        docTitle: 'DBMS Unit 3: Normalization',
        pageNumber: 2,
        content: 'First Normal Form (1NF): Each table cell contains only atomic (single) values. No repeating groups or array values in any record.',
        keywords: ['1nf', 'atomic', 'first normal form', 'repeating groups']
      },
      {
        id: 'chk_3',
        docId: 'doc_dbms_unit3',
        docTitle: 'DBMS Unit 3: Normalization',
        pageNumber: 3,
        content: 'Second Normal Form (2NF): Meets 1NF requirements and all non-prime attributes are fully functionally dependent on the candidate key. Partial dependency is prohibited.',
        keywords: ['2nf', 'partial dependency', 'second normal form', 'candidate key']
      },
      {
        id: 'chk_4',
        docId: 'doc_dbms_unit3',
        docTitle: 'DBMS Unit 3: Normalization',
        pageNumber: 4,
        content: 'Third Normal Form (3NF) & BCNF: Removes transitive dependencies (X -> Y -> Z). BCNF requires that for every functional dependency X -> Y, X is strictly a super key.',
        keywords: ['3nf', 'bcnf', 'transitive dependency', 'super key', 'boyce codd']
      }
    ],
    summary: 'This chapter thoroughly covers the mathematical and algorithmic foundations of Relational Database Normalization, exploring 1NF, 2NF, 3NF, BCNF, Functional Dependencies, and Lossless Join Decompositions.',
    keyPoints: [
      'Normalization eliminates update, insertion, and deletion anomalies in SQL databases.',
      '1NF requires atomic attribute domains and unique records.',
      '2NF requires elimination of partial dependencies on composite keys.',
      '3NF requires elimination of transitive functional dependencies.',
      'BCNF enforces that every determinant is a candidate/super key.'
    ],
    definitions: [
      { term: 'Functional Dependency (FD)', definition: 'A constraint between two sets of attributes where X uniquely determines Y (X → Y).' },
      { term: 'Partial Dependency', definition: 'When a non-prime attribute depends on only a subset of a composite primary key.' },
      { term: 'Transitive Dependency', definition: 'An indirect relationship causing functional dependency: X → Y and Y → Z imply X → Z.' },
      { term: 'Lossless Decomposition', definition: 'A decomposition property ensuring the original relation can be reconstructed via natural join without spurious rows.' }
    ],
    importantQuestions: {
      shortQuestions: [
        'Define 1NF with a real-world student table example.',
        'What is the key difference between 3NF and BCNF?',
        'State the condition for lossless join decomposition.'
      ],
      longQuestions: [
        'Explain all Normal Forms (1NF, 2NF, 3NF, BCNF) with step-by-step SQL table decompositions.',
        'Given relation R(A, B, C, D, E) with FDs {A->BC, CD->E, B->D, E->A}, find all candidate keys and the highest normal form.'
      ],
      mcqs: [
        {
          question: 'Which normal form is considered strictly dependent on removing partial dependencies?',
          options: ['1NF', '2NF', '3NF', 'BCNF'],
          answer: '2NF',
          explanation: '2NF explicitly forbids non-prime attributes from depending on part of a composite primary key.'
        },
        {
          question: 'If a relation is in BCNF, it is guaranteed to be in:',
          options: ['1NF only', '2NF only', '3NF and below', 'None of the above'],
          answer: '3NF and below',
          explanation: 'BCNF is a stricter specialization of 3NF; therefore, any table in BCNF is inherently in 3NF, 2NF, and 1NF.'
        }
      ],
      vivaQuestions: [
        'Why might database architects intentionally denormalize in production systems?',
        'Can a table with a single-attribute primary key ever violate 2NF? Why?'
      ]
    },
    flashcards: [
      { id: 'fc_1', topic: '1NF', front: 'What is the primary condition for 1NF?', back: 'Atomic values in every column and no repeating groups.' },
      { id: 'fc_2', topic: '2NF', front: 'What anomaly does 2NF eliminate?', back: 'Partial functional dependency on composite candidate keys.' },
      { id: 'fc_3', topic: '3NF', front: 'What is a transitive dependency?', back: 'When a non-key attribute depends on another non-key attribute (A → B → C).' },
      { id: 'fc_4', topic: 'BCNF', front: 'What is the strict determinant rule in BCNF?', back: 'For every functional dependency X → Y, X must be a super key.' }
    ],
    revisionNotes: `# DBMS Unit 3 Rapid Revision
- **Goal**: Minimize data redundancy & insertion/update/deletion anomalies.
- **Rule of Thumb**:
  - Split multi-valued fields -> **1NF**
  - Split partial key dependencies -> **2NF**
  - Split non-key to non-key dependencies -> **3NF**
  - Ensure every left side of FD is a Super Key -> **BCNF**`,
    mindMap: {
      id: 'mm_root',
      label: 'Database Normalization',
      children: [
        {
          id: 'mm_1',
          label: 'Functional Dependencies',
          children: [{ id: 'mm_1_1', label: 'Trivial & Non-trivial' }, { id: 'mm_1_2', label: 'Armstrong Axioms' }]
        },
        {
          id: 'mm_2',
          label: 'Normal Forms Hierarchy',
          children: [
            { id: 'mm_2_1', label: '1NF (Atomic)' },
            { id: 'mm_2_2', label: '2NF (No Partial)' },
            { id: 'mm_2_3', label: '3NF (No Transitive)' },
            { id: 'mm_2_4', label: 'BCNF (Superkey Determinant)' }
          ]
        },
        {
          id: 'mm_3',
          label: 'Decomposition Properties',
          children: [{ id: 'mm_3_1', label: 'Lossless Join' }, { id: 'mm_3_2', label: 'Dependency Preservation' }]
        }
      ]
    }
  },
  {
    id: 'doc_os_unit2',
    title: 'Operating Systems Unit 2: Process Scheduling & Deadlocks',
    fileName: 'OS_Unit2_Process_Scheduling.pdf',
    fileSize: '3.1 MB',
    fileType: 'pdf',
    subjectId: 'sub_cs402',
    subjectName: 'Operating Systems',
    departmentId: 'dept_cs',
    uploadedBy: 'Prof. Anjali Mehta',
    uploadedAt: '2025-02-12 14:15',
    extractedText: `Unit 2: Process Management & Synchronization.
A process is a program in execution containing Program Counter, Stack, Data section, and Heap.
CPU Scheduling Algorithms:
1. First-Come, First-Served (FCFS): Non-preemptive, suffers from Convoy Effect.
2. Shortest Job First (SJF) / Shortest Remaining Time First (SRTF): Optimal average waiting time, but suffers from starvation.
3. Round Robin (RR): Preemptive, utilizes time quantum, fair sharing for interactive systems.
4. Priority Scheduling: Preemptive/Non-preemptive, aging technique solves starvation.
Deadlock Conditions (Coffman Conditions): Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.
Deadlock Handling: Prevention, Avoidance (Banker's Algorithm), Detection, and Recovery.`,
    chunks: [
      {
        id: 'chk_os_1',
        docId: 'doc_os_unit2',
        docTitle: 'OS Unit 2: Process Scheduling',
        pageNumber: 1,
        content: 'Process State Transitions: New, Ready, Running, Waiting (Blocked), Terminated. Process Control Block (PCB) stores state information.',
        keywords: ['process state', 'pcb', 'ready queue', 'context switch']
      },
      {
        id: 'chk_os_2',
        docId: 'doc_os_unit2',
        docTitle: 'OS Unit 2: Process Scheduling',
        pageNumber: 2,
        content: 'Round Robin CPU Scheduling allocates a fixed time quantum (slice) to each ready process in circular order, ensuring low response times.',
        keywords: ['round robin', 'time quantum', 'cpu scheduling', 'response time']
      },
      {
        id: 'chk_os_3',
        docId: 'doc_os_unit2',
        docTitle: 'OS Unit 2: Process Scheduling',
        pageNumber: 3,
        content: 'The four necessary conditions for Deadlock (Coffman): Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
        keywords: ['deadlock', 'coffman', 'circular wait', 'mutual exclusion', 'bankers algorithm']
      }
    ],
    summary: 'Detailed study of Operating System kernel scheduling heuristics, PCB context switching overhead, and Deadlock prevention/avoidance using Banker\'s algorithm.',
    keyPoints: [
      'Context switching incurs CPU overhead with zero productive user work.',
      'SJF provides mathematically minimal average turnaround time.',
      'Small time quantum in Round Robin increases context switch thrashing.',
      'Banker\'s Algorithm verifies safe state before resource allocation.'
    ],
    definitions: [
      { term: 'Process Control Block (PCB)', definition: 'Data structure in the OS kernel containing PID, PC, registers, and memory limits.' },
      { term: 'Convoy Effect', definition: 'Phenomenon in FCFS where short processes wait behind one heavy CPU-bound process.' },
      { term: 'Starvation (Livelock)', definition: 'Indefinite delay of low-priority processes caused by continuous arrival of higher priority tasks.' }
    ],
    importantQuestions: {
      shortQuestions: [
        'Differentiate between Preemptive and Non-Preemptive scheduling.',
        'What is a Gantt chart in CPU scheduling?',
        'State the four Coffman conditions for deadlocks.'
      ],
      longQuestions: [
        'Calculate average turnaround and waiting time for given processes using FCFS, SJF, and Round Robin (Time Quantum = 2ms).',
        'Explain Banker\'s Algorithm for deadlock avoidance with resource-request safety verification.'
      ],
      mcqs: [
        {
          question: 'Which scheduling algorithm is non-preemptive by definition?',
          options: ['Round Robin', 'SRTF', 'Standard FCFS', 'Multi-level Feedback Queue'],
          answer: 'Standard FCFS',
          explanation: 'Standard FCFS allows the currently running process to retain CPU until self-termination or I/O block.'
        }
      ],
      vivaQuestions: [
        'How does aging solve starvation in priority scheduling?',
        'What is the difference between deadlock prevention and deadlock avoidance?'
      ]
    },
    flashcards: [
      { id: 'fc_os_1', topic: 'FCFS', front: 'What is the Convoy Effect?', back: 'Slowdown when multiple short I/O bound jobs wait behind a single CPU-heavy process in FCFS.' },
      { id: 'fc_os_2', topic: 'Deadlock', front: 'What are the 4 Coffman conditions?', back: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.' }
    ],
    revisionNotes: `# OS Unit 2 Core Revision
- **Context Switch**: State save into PCB + State restore from PCB.
- **Round Robin**: Large Q -> behaves like FCFS; Small Q -> excessive context switch overhead.
- **Banker's Algorithm**: Need = Max - Allocation.`,
    mindMap: {
      id: 'mm_os_root',
      label: 'OS Process Management',
      children: [
        {
          id: 'mm_os_1',
          label: 'Scheduling Algorithms',
          children: [{ id: 'mm_os_1_1', label: 'FCFS' }, { id: 'mm_os_1_2', label: 'SJF/SRTF' }, { id: 'mm_os_1_3', label: 'Round Robin' }]
        },
        {
          id: 'mm_os_2',
          label: 'Deadlocks',
          children: [{ id: 'mm_os_2_1', label: 'Coffman Conditions' }, { id: 'mm_os_2_2', label: 'Banker\'s Avoidance' }, { id: 'mm_os_2_3', label: 'Resource Allocation Graph' }]
        }
      ]
    }
  }
];

export const getRAGDocuments = (): RAGDocument[] => {
  const docs = safeStorageGet<RAGDocument[]>('lbu_rag_documents', INITIAL_RAG_DOCUMENTS);
  return docs && docs.length > 0 ? docs : INITIAL_RAG_DOCUMENTS;
};

export const saveRAGDocument = (doc: RAGDocument) => {
  const docs = getRAGDocuments();
  const index = docs.findIndex((d) => d.id === doc.id);
  if (index >= 0) {
    docs[index] = doc;
  } else {
    docs.unshift(doc);
  }
  safeStorageSet('lbu_rag_documents', docs);
};

export const searchRAGKnowledge = (query: string, docId?: string): { chunk: RAGChunk; score: number }[] => {
  const docs = getRAGDocuments();
  const searchDocs = docId ? docs.filter((d) => d.id === docId) : docs;
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  const results: { chunk: RAGChunk; score: number }[] = [];

  searchDocs.forEach((doc) => {
    doc.chunks.forEach((chunk) => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      terms.forEach((term) => {
        if (contentLower.includes(term)) score += 3;
        if (chunk.keywords.some((k) => k.toLowerCase().includes(term))) score += 5;
      });
      if (score > 0) {
        results.push({ chunk, score });
      }
    });
  });

  return results.sort((a, b) => b.score - a.score);
};

export const processUploadedFile = async (
  file: File,
  subjectId: string,
  subjectName: string,
  departmentId: string,
  userName: string
): Promise<RAGDocument> => {
  // Read text content
  let text = '';
  try {
    text = await file.text();
  } catch (e) {
    text = `Lecture notes extracted from ${file.name}. Academic topics, syllabus overview, assignments, and key unit principles for Lokbharti University students.`;
  }

  if (text.length < 50) {
    text = `Comprehensive syllabus and study notes for ${subjectName}. Includes foundational definitions, architectural diagrams, exam questions, and practical coding exercises.`;
  }

  const docId = `doc_${Date.now()}`;
  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

  // Create semantic chunks
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const chunks: RAGChunk[] = (paragraphs.length > 0 ? paragraphs : [text]).slice(0, 8).map((para, i) => ({
    id: `chk_${docId}_${i + 1}`,
    docId,
    docTitle,
    pageNumber: i + 1,
    content: para.trim().substring(0, 400),
    keywords: para.toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 5)
  }));

  const newDoc: RAGDocument = {
    id: docId,
    title: docTitle,
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : file.name.endsWith('.pptx') ? 'pptx' : 'txt',
    subjectId,
    subjectName,
    departmentId,
    uploadedBy: userName,
    uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    extractedText: text,
    chunks,
    summary: `AI-Generated Summary for ${docTitle}: Synthesizes foundational theoretical principles, definitions, university exam questions, and practical applications.`,
    keyPoints: [
      `Key subject foundation in ${subjectName}`,
      'Essential definitions, theorems, and architectural models',
      'High-frequency exam questions and step-by-step problem walkthroughs',
      'Recommended revision checkpoints for internal & external examinations'
    ],
    definitions: [
      { term: `${docTitle} Core Concept`, definition: `Fundamental definition and functional scope described in ${file.name}.` },
      { term: 'Key Formula / Theorem', definition: 'Core mathematical or algorithmic relationship defined in this unit.' }
    ],
    importantQuestions: {
      shortQuestions: [
        `Explain the primary objective of ${docTitle}.`,
        'List three core advantages of this approach.',
        'Define key terminology introduced in Section 1.'
      ],
      longQuestions: [
        `Provide an in-depth analysis of ${docTitle} with architectural block diagrams and real-world case studies.`,
        'Critically evaluate limitations and discuss modern industry best practices.'
      ],
      mcqs: [
        {
          question: `What is the primary role of concepts described in ${docTitle}?`,
          options: ['Data integrity & efficiency', 'Manual storage', 'Network latency increase', 'None of the above'],
          answer: 'Data integrity & efficiency',
          explanation: 'Standard academic methodology optimizes computational performance and structural integrity.'
        }
      ],
      vivaQuestions: [
        `How would you explain the significance of ${docTitle} to an external university examiner?`
      ]
    },
    flashcards: [
      { id: `fc_${Date.now()}_1`, topic: docTitle, front: `What is the main purpose of ${docTitle}?`, back: 'Optimizing structured learning and university curriculum mastery.' },
      { id: `fc_${Date.now()}_2`, topic: docTitle, front: 'What is the top exam recommendation?', back: 'Focus on core definitions and step-by-step diagram illustrations.' }
    ],
    revisionNotes: `# ${docTitle} Quick Revision Notes\n- Comprehensive review generated by Lokbharti AI Copilot.\n- Memorize core definitions and review past year questions before exams.`,
    mindMap: {
      id: `mm_${docId}`,
      label: docTitle,
      children: [
        { id: `mm_${docId}_1`, label: 'Core Principles', children: [{ id: `mm_${docId}_1_1`, label: 'Fundamentals' }, { id: `mm_${docId}_1_2`, label: 'Theory' }] },
        { id: `mm_${docId}_2`, label: 'Applications', children: [{ id: `mm_${docId}_2_1`, label: 'Exam Problems' }, { id: `mm_${docId}_2_2`, label: 'Practical Labs' }] }
      ]
    }
  };

  saveRAGDocument(newDoc);
  return newDoc;
};
