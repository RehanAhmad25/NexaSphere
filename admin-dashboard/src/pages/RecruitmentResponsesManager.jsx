import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Skeleton } from '../components/Skeleton';
import { AdminIcon } from '../components/AdminIcon';

const COLUMNS = [
  { key: 'fullName',       label: 'Full Name' },
  { key: 'collegeEmail',   label: 'Email' },
  { key: 'whatsapp',       label: 'WhatsApp' },
  { key: 'year',           label: 'Year' },
  { key: 'branch',         label: 'Branch' },
  { key: 'role',           label: 'Role Applied' },
  { key: 'status',         label: 'Status' },
  { key: 'submittedAt',    label: 'Submitted At' },
];

function formatDate(val) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return val;
  }
}

function exportCSV(rows) {
  const header = COLUMNS.map(c => c.label).join(',');
  const body = rows.map(row =>
    COLUMNS.map(c => `"${(row[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recruitment-responses-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RecruitmentResponsesManager() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    api.submissions.getRecruitment()
      .then(data => {
        setResponses(data?.submissions ?? []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load recruitment submissions');
        setLoading(false);
      });
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.submissions.updateRecruitmentStatus(id, newStatus);
      setResponses(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filtered = responses.filter(r =>
    COLUMNS.some(c =>
      (r[c.key] ?? '').toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Recruitment Responses</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search responses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text)', fontSize: 14, minWidth: 200
            }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <AdminIcon name="Download" size={16} /> Export CSV
          </button>
        </div>
      </div>

      {loading && <Skeleton height={44} count={6} />}

      {!loading && error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '20px 24px', color: '#ef4444', textAlign: 'center'
        }}>
          <AdminIcon name="AlertCircle" size={24} />
          <p style={{ marginTop: 8 }}>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          color: 'var(--text-muted)', border: '1px dashed var(--border)',
          borderRadius: 12, marginTop: 8
        }}>
          <AdminIcon name="Inbox" size={40} />
          <p style={{ marginTop: 12, fontSize: 15 }}>
            {search ? 'No responses match your search.' : 'No recruitment responses yet.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--surface-elevated, var(--surface))' }}>
                {COLUMNS.map(c => (
                  <th key={c.key} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase',
                    letterSpacing: '0.05em', borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap'
                  }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  {COLUMNS.map(c => (
                    <td key={c.key} style={{ padding: '12px 16px', color: 'var(--text)', verticalAlign: 'top' }}>
                      {c.key === 'submittedAt' ? formatDate(row[c.key]) : (
                        c.key === 'status' ? (
                          <select 
                            value={row.status || 'applied'} 
                            onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 4, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 12 }}
                          >
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="selected">Selected</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (row[c.key] ?? '—')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
