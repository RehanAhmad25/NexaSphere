// src/components/gamification/GamificationDashboard.jsx
import { useState, useEffect } from 'react';
import { gamificationService, LEVEL_THRESHOLDS, ACHIEVEMENTS } from '../../services/gamification/gamificationService';
import { DynamicIcon } from '../../shared/Icons';

export default function GamificationDashboard() {
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUserStats(gamificationService.getUserStats());
    setLeaderboard(gamificationService.getLeaderboard());
  };

  const handleAction = (action) => {
    const result = gamificationService.trackAction(action);
    loadData();
    if (result.newAchievements.length > 0) {
      alert(`🎉 Achievement Unlocked: ${result.newAchievements[0].title}! +${result.xpEarned} XP`);
    }
  };

  if (!userStats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid #CC1111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ color: '#9CA3AF', marginTop: '16px' }}>Loading gamification data...</p>
      </div>
    );
  }

  const xpProgress = (userStats.xp / userStats.nextLevelXP) * 100;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px' }}>
          Gamification Hub
        </h1>
        <p style={{ color: '#9CA3AF' }}>Earn XP, unlock achievements, and climb the leaderboard</p>
      </div>

      {/* XP Card */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '48px' }}>🏆</div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>Level {userStats.level} {userStats.title}</h2>
                <p style={{ color: '#9CA3AF' }}>{userStats.xp} / {userStats.nextLevelXP} XP</p>
              </div>
            </div>
            <div style={{ width: '300px', background: '#2A2A2A', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${xpProgress}%`, background: '#CC1111', height: '100%', transition: 'width 0.5s' }} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>Total XP Earned</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#CC1111' }}>{userStats.xp}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF' }}>{userStats.stats.events_attended}</p>
          <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Events Attended</p>
        </div>
        <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF' }}>{userStats.stats.current_streak}</p>
          <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Day Streak 🔥</p>
        </div>
        <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF' }}>{userStats.stats.comments}</p>
          <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Comments</p>
        </div>
        <div style={{ background: '#1A1A1A', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFFFFF' }}>{userStats.badges.length}</p>
          <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Badges Earned</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #2A2A2A', paddingBottom: '12px' }}>
        <button onClick={() => setActiveTab('overview')} style={{ padding: '8px 20px', borderRadius: '100px', background: activeTab === 'overview' ? '#CC1111' : 'transparent', border: 'none', color: activeTab === 'overview' ? 'white' : '#9CA3AF', cursor: 'pointer' }}>Overview</button>
        <button onClick={() => setActiveTab('badges')} style={{ padding: '8px 20px', borderRadius: '100px', background: activeTab === 'badges' ? '#CC1111' : 'transparent', border: 'none', color: activeTab === 'badges' ? 'white' : '#9CA3AF', cursor: 'pointer' }}>Badges</button>
        <button onClick={() => setActiveTab('leaderboard')} style={{ padding: '8px 20px', borderRadius: '100px', background: activeTab === 'leaderboard' ? '#CC1111' : 'transparent', border: 'none', color: activeTab === 'leaderboard' ? 'white' : '#9CA3AF', cursor: 'pointer' }}>Leaderboard</button>
        <button onClick={() => setActiveTab('actions')} style={{ padding: '8px 20px', borderRadius: '100px', background: activeTab === 'actions' ? '#CC1111' : 'transparent', border: 'none', color: activeTab === 'actions' ? 'white' : '#9CA3AF', cursor: 'pointer' }}>Earn XP</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h3 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Recent Achievements</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {userStats.achievements.slice(-5).reverse().map(ach => (
              <div key={ach.id} style={{ background: '#1A1A1A', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '32px' }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{ach.title}</div>
                  <div style={{ fontSize: '13px', color: '#9CA3AF' }}>{ach.description}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>{new Date(ach.unlockedAt).toLocaleDateString()}</div>
              </div>
            ))}
            {userStats.achievements.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#1A1A1A', borderRadius: '12px' }}>
                <p style={{ color: '#6B7280' }}>No achievements yet. Start earning XP!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {userStats.badges.map(badge => (
            <div key={badge.id} style={{ background: '#1A1A1A', borderRadius: '16px', padding: '20px', textAlign: 'center', border: `1px solid ${gamificationService.getTierColor(badge.tier)}` }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{badge.icon}</div>
              <div style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{badge.title}</div>
              <div style={{ fontSize: '11px', color: gamificationService.getTierColor(badge.tier), marginTop: '4px' }}>{badge.tier.toUpperCase()}</div>
            </div>
          ))}
          {userStats.badges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: '#1A1A1A', borderRadius: '12px', gridColumn: '1/-1' }}>
              <p style={{ color: '#6B7280' }}>No badges yet. Complete achievements to earn badges!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div style={{ background: '#1A1A1A', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#0F0F0F' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF' }}>Rank</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#9CA3AF' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#9CA3AF' }}>Level</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#9CA3AF' }}>XP</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(user => (
                <tr key={user.rank} style={{ borderTop: '1px solid #2A2A2A' }}>
                  <td style={{ padding: '12px 16px', color: '#FFFFFF', fontWeight: 'bold' }}>#{user.rank}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{user.avatar}</span>
                      <span style={{ color: '#FFFFFF' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#FFFFFF' }}>{user.level}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#CC1111', fontWeight: 'bold' }}>{user.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'actions' && (
        <div>
          <h3 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Earn XP by taking actions</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <button onClick={() => handleAction('EVENT_ATTENDANCE')} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ color: '#FFFFFF' }}>🎉 Attend an Event</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>+50 XP</span>
            </button>
            <button onClick={() => handleAction('COMMENT_POSTED')} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ color: '#FFFFFF' }}>💬 Post a Comment</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>+5 XP</span>
            </button>
            <button onClick={() => handleAction('CONTENT_CREATION')} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ color: '#FFFFFF' }}>📝 Create Content</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>+30 XP</span>
            </button>
            <button onClick={() => handleAction('REFERRAL')} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ color: '#FFFFFF' }}>🤝 Refer a Friend</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>+100 XP</span>
            </button>
            <button onClick={() => handleAction('FEEDBACK_GIVEN')} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ color: '#FFFFFF' }}>📋 Give Feedback</span>
              <span style={{ color: '#10B981', fontWeight: 'bold' }}>+10 XP</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {userStats.notifications.length > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          {userStats.notifications.slice(-3).map((notif, idx) => (
            <div key={idx} style={{ background: '#1A1A1A', border: `1px solid ${notif.type === 'achievement' ? '#10B981' : '#CC1111'}`, borderRadius: '12px', padding: '12px 20px', marginTop: '8px', maxWidth: '300px' }}>
              <p style={{ color: '#FFFFFF', fontSize: '13px' }}>{notif.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}