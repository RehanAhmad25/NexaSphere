import React, { useState } from 'react';
import { buildUrl, getAiApiBase } from '../../utils/runtimeConfig';

export default function AiMentor() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const reviewUrl = buildUrl(getAiApiBase(), '/ai/review');
      if (!reviewUrl) {
        throw new Error('AI review service is not configured');
      }

      const res = await fetch(reviewUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      if (!res.ok) throw new Error('AI failed to respond');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Failed to connect to AI Mentor. Try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-mentor" style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--b2)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🤖 AI Mentor & Code Reviewer
      </h3>
      <p style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>Submit your code for an AI review, score, and mock interview question.</p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <select 
          value={language} 
          onChange={e => setLanguage(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--t1)', border: '1px solid var(--b2)', padding: '8px', borderRadius: '8px', outline: 'none' }}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="react">React</option>
        </select>
      </div>

      <textarea 
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Paste your code here..."
        style={{
          width: '100%', height: '150px', background: 'rgba(0,0,0,0.3)', color: '#00ffcc', 
          border: '1px solid var(--b2)', borderRadius: '8px', padding: '12px', 
          fontFamily: 'monospace', resize: 'vertical', outline: 'none'
        }}
      />

      <button 
        onClick={handleSubmit} 
        disabled={loading || !code.trim()}
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start', padding: '8px 24px', opacity: (loading || !code.trim()) ? 0.5 : 1 }}
      >
        {loading ? 'Reviewing...' : 'Get AI Review'}
      </button>

      {result && !result.error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--c1-50)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: 'var(--c1)' }}>Review Results</h4>
            <span style={{ background: 'var(--c1)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
              Score: {result.score}/10
            </span>
          </div>
          <p style={{ color: 'var(--t1)', marginBottom: '12px', fontSize: '0.95rem', lineHeight: '1.5' }}>{result.overview}</p>
          
          <h5 style={{ color: 'var(--t2)', marginBottom: '8px' }}>Actionable Suggestions:</h5>
          <ul style={{ color: 'var(--t1)', paddingLeft: '20px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {result.suggestions && result.suggestions.map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s}</li>)}
          </ul>

          <div style={{ background: 'rgba(204,17,17,0.1)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--c1)' }}>
            <h5 style={{ color: 'var(--c1)', marginBottom: '4px' }}>Mock Interview Question:</h5>
            <p style={{ color: 'var(--t1)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{result.interview_question}"</p>
          </div>
        </div>
      )}

      {result && result.error && (
        <div style={{ color: 'red', marginTop: '12px' }}>{result.error}</div>
      )}
    </div>
  );
}
