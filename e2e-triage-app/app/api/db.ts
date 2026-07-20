import fs from 'fs';
import path from 'path';

export type AIAnalysisData = {
  resultText: string;
  isBug: boolean;
  isFlaky: boolean;
  analyzedAt: string;
};

export type DatabaseSchema = {
  analyses: Record<string, AIAnalysisData>; // Keyed by testId
  runs: {
    timestamp: string;
    total: number;
    failed: number;
    passed: number;
  }[];
};

const DB_PATH = path.resolve(process.cwd(), 'data/db.json');

export function getDb(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    // Ensure directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    return { analyses: {}, runs: [] };
  }
  
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { analyses: {}, runs: [] };
  }
}

export function saveDb(data: DatabaseSchema) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function saveAnalysis(testId: string, resultText: string) {
  const db = getDb();
  
  // Determine if bug or flaky based on text content (rudimentary but effective)
  const lowerText = resultText.toLowerCase();
  const isBug = lowerText.includes('bug in the application') || lowerText.includes('application bug') || lowerText.includes('bug found') || lowerText.includes('root cause: application');
  const isFlaky = lowerText.includes('flaky') || lowerText.includes('test issue') || lowerText.includes('broken test');

  db.analyses[testId] = {
    resultText,
    isBug: isBug || (!isFlaky), // Default to bug if not explicitly flaky
    isFlaky,
    analyzedAt: new Date().toISOString()
  };
  saveDb(db);
}

export function logRun(total: number, passed: number, failed: number) {
  const db = getDb();
  db.runs.push({
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed
  });
  saveDb(db);
}
