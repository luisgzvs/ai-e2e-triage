'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

type TestResult = {
  id: string;
  title: string;
  projectName: string;
  status: string;
  duration: number;
  aiAnalysis?: any;
};

type HistoryData = {
  runs: any[];
  aiStats: { totalAnalyzed: number; totalBugs: number; totalFlaky: number; };
};

export default function Dashboard() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tests').then(res => res.json()),
      fetch('/api/history').then(res => res.json())
    ]).then(([testsData, historyData]) => {
      setTests(testsData.tests || []);
      setHistory(historyData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const failedTests = tests.filter((t) => t.status === 'failed' || t.status === 'unexpected');
  const otherTests = tests.filter((t) => t.status !== 'failed' && t.status !== 'unexpected');

  const pieData = history?.aiStats?.totalAnalyzed ? [
    { name: 'Application Bugs', value: history.aiStats.totalBugs, color: '#ef4444' }, // Red
    { name: 'Flaky/Test Issues', value: history.aiStats.totalFlaky, color: '#eab308' }, // Yellow
    { name: 'Unknown/Other', value: history.aiStats.totalAnalyzed - history.aiStats.totalBugs - history.aiStats.totalFlaky, color: '#6b7280' } // Gray
  ].filter(d => d.value > 0) : [];

  const runHistoryData = history?.runs?.map((r, i) => ({
    name: `Run ${i + 1}`,
    passed: r.passed,
    failed: r.failed,
  })) || [];

  return (
    <>
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#000', borderRadius: '8px', padding: '4px', display: 'flex' }}>
            <img src="/logo.png" alt="AI E2E Triage Logo" width="32" height="32" style={{ objectFit: 'contain' }} />
          </div>
          AI E2E Triage Report
        </div>
        <div>
          <a href="http://localhost:9323" target="_blank" rel="noreferrer" className="btn" style={{ fontSize: '0.85rem' }}>
            View Playwright Report ↗
          </a>
        </div>
      </nav>

      <main className="container">
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="title">Test Runs Dashboard</h1>
          <p className="subtitle" style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Analyze and fix failing end-to-end tests with AI.
          </p>
        </header>

        {loading ? (
          <div className="loading-pulse" style={{ height: '200px', backgroundColor: 'var(--card-bg)', borderRadius: '8px' }}></div>
        ) : (
          <>
            <div className="grid grid-cols-2" style={{ marginBottom: '3rem', gap: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', height: '300px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Test Run History</h3>
                {runHistoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={runHistoryData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                      <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={3} />
                      <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={3} />
                      <CartesianGrid stroke="#374151" strokeDasharray="5 5" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: 'var(--muted)', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    No run history available. Run 'npm run triage' to generate history.
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '1.5rem', height: '300px' }}>
                <h3 style={{ marginBottom: '1rem' }}>AI Bugs Found vs Flaky</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: 'var(--muted)', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    No AI analysis performed yet. Click a failed test and analyze it!
                  </div>
                )}
              </div>
            </div>

            <section style={{ marginBottom: '3rem' }}>
              <h2 className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--danger)' }}>●</span> Action Required ({failedTests.length})
              </h2>
              {failedTests.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No failing tests! 🎉</p>
              ) : (
                <div className="grid grid-cols-1">
                  {failedTests.map((test) => (
                    <Link href={`/test/${encodeURIComponent(test.id)}`} key={test.id} className="card clickable">
                      <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <h3 className="card-title">{test.title}</h3>
                          {test.aiAnalysis && test.aiAnalysis.isBug && <span className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>🧠 Real Bug</span>}
                          {test.aiAnalysis && test.aiAnalysis.isFlaky && <span className="badge badge-flaky">🧠 Flaky Test</span>}
                        </div>
                        <span className="badge badge-failed">Failed</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                        <span><strong>Project:</strong> {test.projectName}</span>
                        <span><strong>Duration:</strong> {(test.duration / 1000).toFixed(2)}s</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="subtitle" style={{ color: 'var(--muted)' }}>Other Tests ({otherTests.length})</h2>
              <div className="grid grid-cols-2" style={{ opacity: 0.7 }}>
                {otherTests.map((test) => (
                  <div key={test.id} className="card" style={{ padding: '1rem' }}>
                    <div className="card-header" style={{ marginBottom: '0.5rem' }}>
                      <h3 className="card-title" style={{ fontSize: '0.9rem' }}>{test.title}</h3>
                      <span className={`badge ${test.status === 'passed' || test.status === 'expected' ? 'badge-passed' : 'badge-flaky'}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
