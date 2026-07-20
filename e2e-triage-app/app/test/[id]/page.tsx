'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

type Attachment = {
  name: string;
  path: string;
  contentType: string;
};

type TestResult = {
  id: string;
  title: string;
  projectName: string;
  status: string;
  duration: number;
  error: string | null;
  snippet: string | null;
  environment: string;
  user: string;
  attachments: Attachment[];
  stepsTree?: any[];
};

function StepNode({ step }: { step: any }) {
  const isFailed = !!step.error;
  return (
    <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', borderLeft: '1px solid var(--border)', position: 'relative' }}>
      <div style={{ position: 'absolute', left: '-6px', top: '4px', color: isFailed ? 'var(--danger)' : '#22c55e' }}>
        {isFailed ? '✗' : '✓'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: isFailed ? 'var(--danger)' : 'inherit' }}>{step.title}</span>
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{step.duration}ms</span>
      </div>
      {step.error && (
        <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)' }}>
          {step.error}
        </div>
      )}
      {step.steps && step.steps.length > 0 && (
        <div style={{ marginTop: '0.25rem' }}>
          {step.steps.map((child: any, i: number) => (
            <StepNode key={i} step={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [test, setTest] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [errorContext, setErrorContext] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tests')
      .then((res) => res.json())
      .then((data) => {
        const found = data.tests?.find((t: any) => t.id === id);
        setTest(found || null);
        setLoading(false);

        // If there's an error-context.md, fetch its text
        const ctxAttachment = found?.attachments?.find((a: any) => a.name === 'error-context');
        if (ctxAttachment) {
          fetch(`/api/media?path=${encodeURIComponent(ctxAttachment.path)}`)
            .then(r => r.text())
            .then(text => {
              // Truncate at "# Test source"
              const truncated = text.split('# Test source')[0].trim();
              setErrorContext(truncated);
            })
            .catch(e => console.error("Could not load error context", e));
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAnalyze = async () => {
    if (!test) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test.id,
          testTitle: test.title,
          errorMessage: test.error,
          errorSnippet: test.snippet,
          codeContext: errorContext // Pass the markdown steps for better analysis
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisError(data.error || 'Failed to analyze');
      }
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-pulse" style={{ height: '200px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container">
        <h1 className="title">Test not found</h1>
        <Link href="/" className="back-link">← Back to Dashboard</Link>
      </div>
    );
  }

  const screenshot = test.attachments.find(a => a.contentType.startsWith('image/'));
  const video = test.attachments.find(a => a.contentType.startsWith('video/'));

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          E2E Triage
        </div>
      </nav>

      <main className="container">
        <Link href="/" className="back-link">
          <svg style={{ marginRight: '0.5rem' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="title" style={{ marginBottom: '0.5rem' }}>{test.title}</h1>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                <span><strong>Project:</strong> {test.projectName}</span>
                <span><strong>Env:</strong> {test.environment}</span>
                <span><strong>User:</strong> {test.user}</span>
                <span><strong>Status:</strong> <span style={{ color: test.status === 'failed' ? 'var(--danger)' : 'inherit'}}>{test.status}</span></span>
                <span><strong>Duration:</strong> {(test.duration / 1000).toFixed(2)}s</span>
              </div>
            </div>
            
            <button 
              className="btn" 
              onClick={handleAnalyze} 
              disabled={analyzing || !!analysisResult}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              {analyzing ? 'Analyzing with AI...' : '✨ Analyze with Gemini'}
            </button>
          </div>

          {analysisError && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)' }}>
              <strong>Error:</strong> {analysisError}
            </div>
          )}

          {analysisResult && (
            <div className="analysis-result">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                ✨ AI Diagnosis
              </h2>
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Show media right at the top so it's obvious! */}
        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
          {video && (
            <section>
              <h2 className="subtitle">Video Recording</h2>
              <div className="media-container">
                <video src={`/api/media?path=${encodeURIComponent(video.path)}`} controls autoPlay muted />
              </div>
            </section>
          )}

          {screenshot && (
            <section>
              <h2 className="subtitle">Screenshot</h2>
              <div className="media-container">
                <img src={`/api/media?path=${encodeURIComponent(screenshot.path)}`} alt="Error Screenshot" />
              </div>
            </section>
          )}
        </div>

        {test.error && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 className="subtitle">Playwright Execution Steps</h2>
            {test.stepsTree && test.stepsTree.length > 0 ? (
              <div className="card" style={{ padding: '1rem', backgroundColor: '#111' }}>
                {test.stepsTree.map((step, i) => (
                  <StepNode key={i} step={step} />
                ))}
              </div>
            ) : test.error.includes('Call log:') ? (
              <div className="code-block" style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--muted)' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {test.error.split('Call log:')[1].trim()}
                </pre>
              </div>
            ) : (
              <p style={{ color: 'var(--muted)' }}>No step logs available.</p>
            )}

            <h2 className="subtitle" style={{ marginTop: '2rem' }}>Error Summary</h2>
            <div className="code-block" style={{ color: '#fca5a5' }}>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {test.error.includes('Call log:') ? test.error.split('Call log:')[0].trim() : test.error}
              </pre>
            </div>
          </section>
        )}

        {errorContext && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 className="subtitle">Playwright Error Context</h2>
            <div className="code-block" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <ReactMarkdown>{errorContext}</ReactMarkdown>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
