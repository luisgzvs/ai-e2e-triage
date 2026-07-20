import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveAnalysis } from '../db';

// Initialize the Google Generative AI client
// This expects the GEMINI_API_KEY environment variable to be set
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, testTitle, errorMessage, errorSnippet, codeContext } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API Key is not configured.' },
        { status: 500 }
      );
    }

    if (!testId || !testTitle || !errorMessage) {
      return NextResponse.json(
        { error: 'Missing required fields (testId, testTitle, errorMessage)' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert SDET (Software Development Engineer in Test) and QA Automation engineer using Playwright.
A test just failed. Your goal is to analyze why it failed and provide a solution to fix it.

Here are the details of the failure:
- **Test Title**: ${testTitle}
- **Error Message**: ${errorMessage}
- **Code Snippet**: 
\`\`\`typescript
${errorSnippet}
\`\`\`
${codeContext ? `- **Additional Code Context**: \n\`\`\`typescript\n${codeContext}\n\`\`\`` : ''}

Please analyze the failure and provide your response in the following format (Markdown):

### 1. Root Cause Analysis
Explain concisely why the test failed. Is it a bug in the application, a problem with test performance/timeout, or a broken/flaky test? Explain how confident you are that this is a reproducible bug vs. a test issue.

### 2. Security Implications (if any)
If the failure or the error logs expose sensitive data (e.g., passwords in plain text, tokens, PII), mention it here. If none, just say "No immediate security issues detected."

### 3. Suggested Fix
Provide a suggested code change to fix the test or a prompt to fix the application code. If it's flaky, suggest how to make it robust (e.g., avoiding hard waits, using correct locator assertions).
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Save to the local database
    saveAnalysis(testId, responseText);

    return NextResponse.json({ analysis: responseText });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze test with AI: ' + error.message },
      { status: 500 }
    );
  }
}

