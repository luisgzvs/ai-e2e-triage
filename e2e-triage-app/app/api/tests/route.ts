import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDb } from '../db';

export async function GET() {
  try {
    const resultsPath = path.resolve(process.cwd(), '../e2e-tests/test-results/results.json');
    const stepsPath = path.resolve(process.cwd(), '../e2e-tests/test-results/steps.json');
    
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json({ tests: [] });
    }

    const rawData = fs.readFileSync(resultsPath, 'utf8');
    const data = JSON.parse(rawData);
    
    let stepsData: Record<string, any[]> = {};
    if (fs.existsSync(stepsPath)) {
      stepsData = JSON.parse(fs.readFileSync(stepsPath, 'utf8'));
    }

    const db = getDb();
    const tests: any[] = [];

    // Traverse Playwright JSON structure
    const processSuites = (suites: any[], parentTitle = '') => {
      if (!suites) return;
      for (const suite of suites) {
        const currentTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
        
        if (suite.specs) {
          for (const spec of suite.specs) {
            const fullTitle = `${currentTitle} > ${spec.title}`;
            
            for (const test of spec.tests) {
              const projectName = test.projectName;
              const result = test.results[0]; // Just take the first result for simplicity
              
              if (result) {
                const attachments = result.attachments?.map((att: any) => ({
                  name: att.name,
                  path: att.path,
                  contentType: att.contentType
                })) || [];

                const stripAnsi = (str: string) => str ? str.replace(/\x1b\[[0-9;]*m/g, '') : null;

                const testId = Buffer.from(`${fullTitle}-${projectName}`).toString('hex');
                
                tests.push({
                  id: testId,
                  title: fullTitle,
                  projectName: projectName,
                  status: result.status, // 'passed', 'failed', 'flaky', 'skipped'
                  duration: result.duration,
                  error: stripAnsi(result.error?.message),
                  snippet: stripAnsi(result.error?.snippet),
                  environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Staging',
                  user: process.env.USER || 'luis.gonzalez',
                  attachments,
                  startTime: result.startTime,
                  aiAnalysis: db.analyses[testId] || null,
                  stepsTree: stepsData[testId] || null
                });
              }
            }
          }
        }
        
        processSuites(suite.suites, currentTitle);
      }
    };

    processSuites(data.suites);

    // Log run if it's new
    if (data.stats && data.stats.startTime) {
      const isNewRun = !db.runs.find(r => r.timestamp === data.stats.startTime);
      if (isNewRun) {
        db.runs.push({
          timestamp: data.stats.startTime,
          total: data.stats.expected + data.stats.unexpected + data.stats.flaky,
          passed: data.stats.expected,
          failed: data.stats.unexpected
        });
        // We need to import saveDb for this or just call a helper.
        // I will use fs.writeFileSync since it's an API route and we already have getDb.
        const DB_PATH = path.resolve(process.cwd(), 'data/db.json');
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      }
    }

    return NextResponse.json({ tests });
  } catch (error: any) {
    console.error('Error parsing results:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
