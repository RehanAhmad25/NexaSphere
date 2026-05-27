import { useState, useEffect } from 'react';
import { moderationService, MODERATION_CATEGORIES, SEVERITY, REPUTATION } from '../../services/moderationService';

export default function ModerationDashboard() {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [userReputations, setUserReputations] = useState([]);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, blocked: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const flagged = moderationService.getFlaggedContent();
    setFlaggedContent(flagged.filter(f => f.status === selectedTab));
    setStats({
      pending: flagged.filter(f => f.status === 'pending').length,
      reviewed: flagged.filter(f => f.status === 'reviewed').length,
      blocked: flagged.filter(f => f.resolution === 'block').length
    });
    setUserReputations(moderationService.getUserReputationSummary());
  };

  const handleResolve = (flagId, action) => {
    moderationService.resolveFlag(flagId, action);
    loadData();
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#F59E0B',
      medium: '#F97316',
      high: '#EF4444',
      critical: '#991B1B'
    };
    return colors[severity] || '#6B7280';
  };

  return (
    <div style={{ padding: '24px', background: '#0A0A0A', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px' }}>
          Content Moderation Dashboard
        </h1>
        <p style={{ color: '#9CA3AF', marginBottom: '32px' }}>
          Review flagged content and manage user reputations
        </p>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Pending Review</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>{stats.pending}</p>
          </div>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Reviewed</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{stats.reviewed}</p>
          </div>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Blocked Content</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>{stats.blocked}</p>
          </div>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Users Flagged</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8B5CF6' }}>{userReputations.filter(u => u.violations > 0).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #2A2A2A', paddingBottom: '12px' }}>
          <button
            onClick={() => { setSelectedTab('pending'); loadData(); }}
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              background: selectedTab === 'pending' ? '#CC1111' : 'transparent',
              border: selectedTab === 'pending' ? 'none' : '1px solid #2A2A2A',
              color: selectedTab === 'pending' ? 'white' : '#9CA3AF',
              cursor: 'pointer'
            }}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => { setSelectedTab('reviewed'); loadData(); }}
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              background: selectedTab === 'reviewed' ? '#CC1111' : 'transparent',
              border: selectedTab === 'reviewed' ? 'none' : '1px solid #2A2A2A',
              color: selectedTab === 'reviewed' ? 'white' : '#9CA3AF',
              cursor: 'pointer'
            }}
          >
            Reviewed ({stats.reviewed})
          </button>
        </div>

        {/* Flagged Content List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {flaggedContent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#1A1A1A', borderRadius: '16px' }}>
              <p style={{ color: '#6B7280' }}>No flagged content to review</p>
            </div>
          ) : (
            flaggedContent.map(flag => (
              <div key={flag.id} style={{ background: '#1A1A1A', border: `1px solid ${getSeverityColor(flag.severity)}`, borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: getSeverityColor(flag.severity),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {flag.severity?.toUpperCase()}
                      </span>
                      {flag.flags.map((f, i) => (
                        <span key={i} style={{
                          background: '#2A2A2A',
                          color: '#9CA3AF',
                          padding: '4px 12px',
            borderRadius: '20px',
                          fontSize: '11px'
                        }}>
                          {f.type}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: '#FFFFFF', marginBottom: '12px', fontSize: '15px' }}>"{flag.content}"</p>
                    <p style={{ color: '#6B7280', fontSize: '12px' }}>
                      User ID: {flag.userId} • {new Date(flag.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {flag.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleResolve(flag.id, 'warn')}
                        style={{
                          padding: '8px 16px',
                          background: '#F59E0B',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Warn User
                      </button>
                      <button
                        onClick={() => handleResolve(flag.id, 'shadow_ban')}
                        style={{
                          padding: '8px 16px',
                          background: '#8B5CF6',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Shadow Ban
                      </button>
                      <button
                        onClick={() => handleResolve(flag.id, 'block')}
                        style={{
                          padding: '8px 16px',
                          background: '#EF4444',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Block
                      </button>
                    </div>
                  )}
                  {flag.status === 'reviewed' && (
                    <span style={{ color: '#10B981', fontSize: '13px' }}>
                      Resolved: {flag.resolution}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Reputation Table */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '16px' }}>
            User Reputation
          </h2>
          <div style={{ background: '#1A1A1A', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#0F0F0F' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF' }}>User ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF' }}>Reputation</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF' }}>Score</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF' }}>Violations</th>
                </tr>
              </thead>
              <tbody>
                {userReputations.map(user => (
                  <tr key={user.userId} style={{ borderTop: '1px solid #2A2A2A' }}>
                    <td style={{ padding: '12px 16px', color: '#FFFFFF' }}>{user.userId}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: user.level === REPUTATION.TRUSTED ? 'rgba(16,185,129,0.1)' :
                                  user.level === REPUTATION.BANNED ? 'rgba(239,68,68,0.1)' :
                                  'rgba(204,17,17,0.1)',
                        color: user.level === REPUTATION.TRUSTED ? '#10B981' :
                               user.level === REPUTATION.BANNED ? '#EF4444' : '#F59E0B',
                        fontSize: '12px'
                      }}>
                        {user.level}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#FFFFFF' }}>{user.score}</td>
                    <td style={{ padding: '12px 16px', color: '#FFFFFF' }}>{user.violations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}