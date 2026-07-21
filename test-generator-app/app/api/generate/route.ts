import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, featureName } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured.' }, { status: 500 });
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Attempt to fetch the URL to get the HTML context
    let htmlContent = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      const pageRes = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const rawText = await pageRes.text();
      // Only keep a reasonable chunk of HTML to avoid token limits, though Gemini has 1M context.
      // We will take up to 200,000 characters to be safe and fast.
      htmlContent = rawText.substring(0, 200000);
    } catch (fetchErr: any) {
      console.warn('Could not fetch HTML directly, will proceed with URL only:', fetchErr.message);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert SDET (Software Development Engineer in Test) and QA Automation engineer.
Your task is to analyze a web page and generate a comprehensive suite of manual and automated End-to-End (E2E) tests.

Here is the information about the web page:
- **URL**: ${url}
- **Feature Name**: ${featureName || 'Determine from context'}
${htmlContent ? `- **HTML Content**: \n\`\`\`html\n${htmlContent}\n\`\`\`` : ''}

**Instructions:**
1. Analyze the application from the URL and HTML context (if provided).
2. EXHAUSTIVELY generate a MASSIVE and highly detailed test suite. Cover the happy path, deep edge cases, performance boundaries, security vulnerabilities, network failures, input validation, state management, and accessibility (sanity, regression, integration, e2e, performance, security).
3. QUALITY IS PARAMOUNT: Your absolute top priority is generating highly detailed, logical, and professional test steps. 'steps' MUST be highly descriptive, containing 5 to 10 clear, actionable instructions. Elaborate on EXACTLY what to click, what data to enter, and what specific states to verify. Do NOT use brief 1-liners.
4. MAXIMIZE VOLUME: While maintaining this exceptional quality, generate as many tests as you possibly can. Ensure your Performance tests are of extremely high quality and include robust 'k6' scripts.
5. CRITICAL: Ensure the JSON response is perfectly valid and fully closed at the end to avoid parsing errors.
6. Determine if the test should be 'manual' or 'automation'.
7. Assign a priority (High, Medium, Low) and criticality (Critical, Major, Minor, Trivial).
8. For Performance tests, include a valid 'k6' load testing script in the 'script' property. For Security tests, you can optionally include a relevant payload, curl command, or script.
6. Ensure the response is a valid JSON object matching the requested schema exactly.

**Output JSON Schema:**
{
  "tests": [
    {
      "id": "T-1",
      "title": "Short descriptive title of the test",
      "type": "e2e | sanity | regression | integration | performance | security",
      "method": "automation | manual",
      "priority": "High | Medium | Low",
      "criticality": "Critical | Major | Minor | Trivial",
      "featureName": "The feature this belongs to (use provided or infer)",
      "behavior": "happy path | negative test",
      "steps": ["Step 1: do something", "Step 2: do something else"],
      "expectedResult": "What should happen",
      "script": "import http from 'k6/http'; ... (only if applicable, otherwise omit this field entirely)"
    }
  ]
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8192,
        temperature: 0.7,
      }
    });

    const responseText = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError: any) {
      console.warn("JSON parsing failed (likely truncated). Attempting basic repair.");
      // Attempt to salvage tests if JSON got truncated
      const lastClosedObject = responseText.lastIndexOf('}');
      if (lastClosedObject !== -1) {
        let repaired = responseText.substring(0, lastClosedObject + 1);
        repaired += ']}';
        try {
          parsed = JSON.parse(repaired);
        } catch (repairError) {
          throw new Error('Failed to parse and repair JSON. The output was corrupted. Try generating again.');
        }
      } else {
        throw new Error('JSON output was entirely malformed: ' + parseError.message);
      }
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error generating tests:', error);
    return NextResponse.json(
      { error: 'Failed to generate tests: ' + error.message },
      { status: 500 }
    );
  }
}
