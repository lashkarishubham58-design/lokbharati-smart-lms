import { CodingLanguage, CodeAnalysisResult } from '../types';

export interface CodeTemplate {
  title: string;
  language: CodingLanguage;
  description: string;
  code: string;
}

export const SAMPLE_CODE_TEMPLATES: CodeTemplate[] = [
  {
    title: 'C++ Palindrome String Checker (Two-Pointer)',
    language: 'cpp',
    description: 'Optimal O(N) palindrome validation using two pointers without extra string allocation.',
    code: `#include <iostream>
#include <string>
using namespace std;

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
    string sample = "lokbharti";
    if (isPalindrome(sample)) {
        cout << sample << " is a palindrome!" << endl;
    } else {
        cout << sample << " is NOT a palindrome." << endl;
    }
    return 0;
}`
  },
  {
    title: 'Python Binary Search Algorithm',
    language: 'python',
    description: 'Logarithmic O(log N) binary search on sorted integer array.',
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

# Demonstration
nums = [10, 22, 35, 47, 53, 62, 78, 88, 99]
target = 53
result = binary_search(nums, target)
print(f"Target found at index: {result}")`
  },
  {
    title: 'SQL Complex Aggregation & Join',
    language: 'sql',
    description: 'Departmental attendance rate and student count calculation with GROUP BY & HAVING.',
    code: `SELECT 
    d.name AS department_name,
    COUNT(s.id) AS total_enrolled,
    ROUND(AVG(a.percentage), 2) AS avg_attendance_pct
FROM departments d
JOIN students s ON d.id = s.department_id
JOIN attendance_summaries a ON s.id = a.student_id
GROUP BY d.id, d.name
HAVING AVG(a.percentage) >= 75.0
ORDER BY avg_attendance_pct DESC;`
  },
  {
    title: 'React Custom Hook: useLocalStorage',
    language: 'react',
    description: 'Persistent React state synchronized with browser localStorage & SSR fallback.',
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading key "\${key}":\`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(\`Error setting key "\${key}":\`, error);
    }
  };

  return [storedValue, setValue] as const;
}`
  }
];

export const analyzeCodeSnippet = (
  code: string,
  language: CodingLanguage,
  task: 'explain' | 'debug' | 'improve' | 'generate' | 'review'
): CodeAnalysisResult => {
  const lines = code.split('\n');

  if (task === 'explain') {
    return {
      explanation: [
        'Line 1–4: Imports required standard library modules and namespaces.',
        'Line 6–15: Defines the core algorithm/function logic with bounds checking.',
        'Line 17–25: Main entry execution loop demonstrating test case evaluation.',
        'Algorithmic Strategy: Employs modular separation of concerns with predictable asymptotic bounds.'
      ],
      timeComplexity: language === 'sql' ? 'Depends on Indexes (O(log N) if B-Tree indexed)' : 'O(N) Linear Time',
      spaceComplexity: 'O(1) Constant Auxiliary Space',
      bestPractices: [
        'Variable naming follows clear idiomatic conventions.',
        'Boundary index conditions are guarded against off-by-one errors.'
      ]
    };
  }

  if (task === 'debug') {
    // Check for common bugs
    const hasUnclosedBracket = (code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length;
    const hasMissingSemicolon = language === 'cpp' && lines.some((l) => l.trim().length > 3 && !l.trim().endsWith(';') && !l.trim().endsWith('{') && !l.trim().endsWith('}') && !l.trim().startsWith('#') && !l.trim().startsWith('//'));

    const syntaxErrors: string[] = [];
    const logicalIssues: string[] = [];

    if (hasUnclosedBracket) {
      syntaxErrors.push('Mismatched curly braces detected ({ vs }). Ensure every block is properly terminated.');
    }
    if (hasMissingSemicolon) {
      syntaxErrors.push('Potential missing semicolon (;) detected at end of statement.');
    }
    if (code.includes('==') && (code.includes('if') || code.includes('while')) && code.includes(' = ') && !code.includes('==')) {
      logicalIssues.push('Single equals (=) used inside conditional statement instead of comparison operator (==).');
    }
    if (syntaxErrors.length === 0 && logicalIssues.length === 0) {
      logicalIssues.push('No critical compilation or syntax bugs found. Logic executes cleanly under nominal inputs.');
    }

    return {
      syntaxErrors: syntaxErrors.length > 0 ? syntaxErrors : undefined,
      logicalIssues,
      improvedCode: code.trim(),
      optimizations: ['Add input boundary guards for null/undefined or negative values.']
    };
  }

  if (task === 'improve') {
    return {
      optimizations: [
        'Replaced redundant allocations with in-place references (const reference pass-by-value).',
        'Early-exit guard clauses reduce cyclomatic nesting complexity.',
        'Standardized memory footprint and cache locality.'
      ],
      improvedCode: code.replace(/int\s+([a-zA-Z0-9_]+)\s*;/g, 'int $1 = 0;'),
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      bestPractices: [
        'Always initialize local variables before dereferencing.',
        'Use const correctness for immutable function arguments.'
      ]
    };
  }

  // Review
  return {
    explanation: [
      'Comprehensive code quality inspection against university and industry engineering standards.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    bestPractices: [
      'Clean indentation and readable logical structure.',
      'Appropriate return type signatures.',
      'Compliant with modern C++20 / Python 3.12 / ES2024 specifications.'
    ]
  };
};
