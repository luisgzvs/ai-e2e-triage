'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Test = {
  id: string;
  title: string;
  type: string;
  method: string;
  priority: string;
  criticality: string;
  featureName: string;
  behavior: string;
  steps: string[];
  expectedResult: string;
  script?: string;
};

export default function TestGenerator() {
  const [url, setUrl] = useState('');
  const [featureName, setFeatureName] = useState('');
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCriticality, setFilterCriticality] = useState('All');
  const [filterBehavior, setFilterBehavior] = useState('All');

  const filteredTests = tests.filter(t => {
    if (filterType !== 'All' && t.type.toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterMethod !== 'All' && t.method.toLowerCase() !== filterMethod.toLowerCase()) return false;
    if (filterPriority !== 'All' && t.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (filterCriticality !== 'All' && t.criticality.toLowerCase() !== filterCriticality.toLowerCase()) return false;
    if (filterBehavior !== 'All' && t.behavior.toLowerCase() !== filterBehavior.toLowerCase()) return false;
    return true;
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, featureName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tests');
      }

      setTests(data.tests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(filteredTests, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'tests.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsCSV = () => {
    if (filteredTests.length === 0) return;
    const header = ['ID', 'Feature', 'Title', 'Type', 'Method', 'Priority', 'Criticality', 'Behavior', 'Steps', 'Expected Result', 'Script'];
    const rows = filteredTests.map(t => [
      t.id,
      t.featureName,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.method,
      t.priority,
      t.criticality,
      t.behavior,
      `"${t.steps.join('\\n').replace(/"/g, '""')}"`,
      `"${t.expectedResult.replace(/"/g, '""')}"`,
      `"${(t.script || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'tests.csv');
    linkElement.click();
  };

  const exportAsXLS = () => {
    if (filteredTests.length === 0) return;
    const worksheetData = filteredTests.map(t => ({
      ID: t.id,
      Feature: t.featureName,
      Title: t.title,
      Type: t.type,
      Method: t.method,
      Priority: t.priority,
      Criticality: t.criticality,
      Behavior: t.behavior,
      Steps: t.steps.join('\n'),
      'Expected Result': t.expectedResult,
      Script: t.script || ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tests");
    XLSX.writeFile(workbook, "tests.xlsx");
  };

  const exportAsPDF = () => {
    if (filteredTests.length === 0) return;
    const doc = new jsPDF('landscape');
    doc.text("AI Generated Test Suite", 14, 15);
    
    const header = [['ID', 'Feature', 'Title', 'Type', 'Method', 'Priority', 'Criticality', 'Behavior', 'Steps', 'Expected Result', 'Script']];
    const data = filteredTests.map(t => [
      t.id,
      t.featureName,
      t.title,
      t.type,
      t.method,
      t.priority,
      t.criticality,
      t.behavior,
      t.steps.join('\n'),
      t.expectedResult,
      t.script || ''
    ]);

    autoTable(doc, {
      head: header,
      body: data,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        8: { cellWidth: 35 },
        9: { cellWidth: 35 },
        10: { cellWidth: 40 }
      }
    });
    
    doc.save("tests.pdf");
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high') return <span className="badge badge-failed">High</span>;
    if (p === 'medium') return <span className="badge badge-flaky">Medium</span>;
    return <span className="badge badge-passed">Low</span>;
  };

  const getCriticalityBadge = (criticality: string) => {
    const c = criticality.toLowerCase();
    if (c === 'critical') return <span className="badge badge-failed">Critical</span>;
    if (c === 'major') return <span className="badge badge-flaky">Major</span>;
    return <span className="badge badge-passed" style={{backgroundColor: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.2)'}}>{c}</span>;
  };

  return (
    <>
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#000', borderRadius: '8px', padding: '4px', display: 'flex' }}>
            <img src="/logo.png" alt="Test Generator Logo" width="32" height="32" style={{ objectFit: 'contain' }} />
          </div>
          AI Test Suite Generator
        </div>
      </nav>

      <main className="container">
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="title">Generate E2E Tests</h1>
          <p className="subtitle" style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Analyze web pages using Gemini AI to generate structured manual and automation tests.
          </p>
        </header>

        <section className="card" style={{ marginBottom: '3rem' }}>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Web Page URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/login"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--card-border)',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Feature Name (Optional)</label>
              <input
                type="text"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                placeholder="e.g. Authentication, Checkout"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--card-border)',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
            <button type="submit" className="btn" disabled={loading} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              {loading ? 'Analyzing App & Generating Tests...' : 'Generate Tests'}
            </button>
          </form>
          {error && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius)' }}>
              {error}
            </div>
          )}
        </section>

        {loading && (
          <div className="loading-pulse" style={{ height: '300px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 600 }}>Reading Web Page...</span>
            <span style={{ color: 'var(--muted)' }}>This may take up to 30 seconds as Gemini explores potential test paths and login flows.</span>
          </div>
        )}

        {!loading && tests.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="subtitle" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--success)' }}>●</span> Generated Tests ({filteredTests.length})
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={exportAsPDF} className="btn" style={{ backgroundColor: '#1f2937' }}>Export PDF</button>
                <button onClick={exportAsXLS} className="btn" style={{ backgroundColor: '#1f2937' }}>Export XLS</button>
                <button onClick={exportAsCSV} className="btn" style={{ backgroundColor: '#1f2937' }}>Export CSV</button>
                <button onClick={exportAsJSON} className="btn" style={{ backgroundColor: '#1f2937' }}>Export JSON</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', backgroundColor: '#000', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Type</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', textTransform: 'capitalize' }}>
                  <option value="All">All</option>
                  {Array.from(new Set(tests.map(t => t.type.toLowerCase()))).map(v => <option key={v} value={v} style={{textTransform: 'capitalize'}}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Method</label>
                <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', textTransform: 'capitalize' }}>
                  <option value="All">All</option>
                  {Array.from(new Set(tests.map(t => t.method.toLowerCase()))).map(v => <option key={v} value={v} style={{textTransform: 'capitalize'}}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Priority</label>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', textTransform: 'capitalize' }}>
                  <option value="All">All</option>
                  {Array.from(new Set(tests.map(t => t.priority.toLowerCase()))).map(v => <option key={v} value={v} style={{textTransform: 'capitalize'}}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Criticality</label>
                <select value={filterCriticality} onChange={e => setFilterCriticality(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', textTransform: 'capitalize' }}>
                  <option value="All">All</option>
                  {Array.from(new Set(tests.map(t => t.criticality.toLowerCase()))).map(v => <option key={v} value={v} style={{textTransform: 'capitalize'}}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Path / Behavior</label>
                <select value={filterBehavior} onChange={e => setFilterBehavior(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', textTransform: 'capitalize' }}>
                  <option value="All">All</option>
                  {Array.from(new Set(tests.map(t => t.behavior.toLowerCase()))).map(v => <option key={v} value={v} style={{textTransform: 'capitalize'}}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {filteredTests.map((test) => (
                <div key={test.id} className="card">
                  <div className="card-header" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h3 className="card-title">{test.title}</h3>
                      <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
                        {test.featureName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {getPriorityBadge(test.priority)}
                      {getCriticalityBadge(test.criticality)}
                      {test.behavior && (
                        <span className={`badge ${test.behavior.toLowerCase().includes('negative') ? 'badge-failed' : 'badge-passed'}`} style={{textTransform: 'capitalize'}}>
                          {test.behavior}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
                    <span><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{test.type}</span></span>
                    <span><strong>Method:</strong> <span style={{ textTransform: 'capitalize' }}>{test.method}</span></span>
                  </div>

                  <div style={{ backgroundColor: '#000', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)' }}>
                    <h4 style={{ marginBottom: '0.75rem', color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Steps</h4>
                    <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: '#e5e7eb', fontSize: '0.9rem' }}>
                      {test.steps.map((step, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{step}</li>
                      ))}
                    </ol>

                    <h4 style={{ marginBottom: '0.75rem', color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Result</h4>
                    <p style={{ color: 'var(--success)', fontSize: '0.9rem', backgroundColor: 'var(--success-bg)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {test.expectedResult}
                    </p>
                    {test.script && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.75rem', color: 'var(--muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Script</h4>
                        <pre className="code-block" style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          <code>{test.script}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
