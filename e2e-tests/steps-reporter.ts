import type { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class StepsReporter implements Reporter {
  private failedStepsData: Record<string, any[]> = {};

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed' && result.status !== 'skipped') {
      // titlePath() returns ['', 'projectName', 'filename.spec.ts', 'describe block', 'test title']
      // The JSON reporter's suites structure starts at 'filename.spec.ts', so we slice(2)
      const fullTitle = test.titlePath().slice(2).join(' > ');
      const projectName = test.parent.project()?.name || '';
      
      // Match the ID generation logic from our API
      const testId = Buffer.from(`${fullTitle}-${projectName}`).toString('hex');
      
      const extractSteps = (steps: TestStep[]): any[] => {
        return steps.map(s => ({
          title: s.title,
          category: s.category,
          duration: s.duration,
          error: s.error?.message,
          steps: extractSteps(s.steps)
        }));
      };
      
      this.failedStepsData[testId] = extractSteps(result.steps);
    }
  }

  onEnd() {
    const dir = path.resolve(process.cwd(), 'test-results');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'steps.json'), JSON.stringify(this.failedStepsData, null, 2));
  }
}

export default StepsReporter;
