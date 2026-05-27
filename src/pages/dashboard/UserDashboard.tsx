import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Award, 
  TrendingUp, 
  Download, 
  Users,
  MessageSquare,
  FileText,
  Activity,
  Zap,
  ArrowRight,
  BarChart3,
  PieChart,
  ChevronRight
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'event_registration' | 'comment' | 'post' | 'achievement';
  title: string;
  description: string;
  date: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

export default function UserDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState({
    eventsAttended: 0,
    commentsPosted: 0,
    contributionsMade: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [profileCompletion] = useState(65);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setActivities([
        { id: '1', type: 'event_registration', title: 'Tech Symposium 2026', description: 'You registered for Tech Symposium', date: new Date() },
        { id: '2', type: 'comment', title: 'Commented on AI Workshop', description: 'Great insights on AI applications!', date: new Date(Date.now() - 2 * 86400000) },
        { id: '3', type: 'achievement', title: 'First Event Attended', description: 'Earned "First Step" badge', date: new Date(Date.now() - 5 * 86400000) },
      ]);
      setAchievements([
        { id: '1', title: 'First Event', description: 'Attended your first event', icon: '🎯', points: 50 },
        { id: '2', title: 'Active Participant', description: 'Attended 5 events', icon: '🏆', points: 100 },
        { id: '3', title: 'Community Builder', description: 'Posted 10 comments', icon: '💬', points: 75 },
      ]);
      setMetrics({ eventsAttended: 8, commentsPosted: 24, contributionsMade: 12, totalPoints: 450, currentStreak: 5, longestStreak: 12 });
      setLoading(false);
    }, 500);
  }, []);

  const weeklyData = [
    { day: 'Mon', count: 4 }, { day: 'Tue', count: 6 }, { day: 'Wed', count: 3 },
    { day: 'Thu', count: 8 }, { day: 'Fri', count: 5 }, { day: 'Sat', count: 2 }, { day: 'Sun', count: 1 }
  ];
  const maxCount = Math.max(...weeklyData.map(d => d.count));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CC1111] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-[#1F1F1F] bg-[#0F0F0F] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
              <p className="text-gray-400 mt-1">Track your engagement and achievements</p>
            </div>
            <button
              onClick={() => alert('Report exported!')}
              className="flex items-center gap-2 px-4 py-2 bg-[#CC1111] text-white rounded-lg hover:bg-[#AA0E0E] transition-all"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Total Points</span>
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-white">{metrics.totalPoints}</div>
            <div className="text-xs text-green-500 mt-2">↑ 12% from last month</div>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Events Attended</span>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{metrics.eventsAttended}</div>
            <div className="text-xs text-gray-500 mt-2">Lifetime total</div>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Current Streak</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">{metrics.currentStreak} days</div>
            <div className="text-xs text-gray-500 mt-2">Best: {metrics.longestStreak} days</div>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#CC1111]/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Contributions</span>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-white">{metrics.contributionsMade}</div>
            <div className="text-xs text-gray-500 mt-2">Posts + Comments</div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-[#CC1111] rounded-t-lg transition-all hover:bg-[#DD2222]"
                  style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs text-gray-500">{item.day}</span>
                <span className="text-xs text-gray-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Timeline */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
            <div className="p-5 border-b border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
              <p className="text-sm text-gray-500 mt-1">Your recent actions</p>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-[#222222] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.type === 'event_registration' && <Calendar className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'comment' && <MessageSquare className="h-5 w-5 text-green-500" />}
                      {activity.type === 'achievement' && <Award className="h-5 w-5 text-yellow-500" />}
                      {activity.type === 'post' && <FileText className="h-5 w-5 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
            <div className="p-5 border-b border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
              <p className="text-sm text-gray-500 mt-1">Badges earned</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="text-center p-4 bg-[#222222] rounded-xl hover:bg-[#2A2A2A] transition-all">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-medium text-white text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                    <p className="text-xs text-[#CC1111] mt-2">{achievement.points} pts</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
              <p className="text-sm text-gray-500 mt-1">Complete your profile to unlock more features</p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                <div className="bg-[#CC1111] rounded-full h-2 transition-all" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">{profileCompletion}% Complete</p>
            </div>
            <button className="px-4 py-2 border border-[#CC1111] text-[#CC1111] rounded-lg hover:bg-[#CC1111] hover:text-white transition-all text-sm">
              Complete Profile →
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-[#2A2A2A] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-[#CC1111]" />
            <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
              <h4 className="font-medium text-white">🤖 AI Workshop</h4>
              <p className="text-sm text-gray-500 mt-1">Based on your interests</p>
              <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
                Register <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
              <h4 className="font-medium text-white">📝 Complete Profile</h4>
              <p className="text-sm text-gray-500 mt-1">Earn 50 bonus points</p>
              <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
                Complete <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="bg-[#222222] rounded-lg p-4 hover:bg-[#2A2A2A] transition-all">
              <h4 className="font-medium text-white">💡 Share Feedback</h4>
              <p className="text-sm text-gray-500 mt-1">Help us improve</p>
              <button className="mt-3 text-sm text-[#CC1111] font-medium flex items-center gap-1">
                Share <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}