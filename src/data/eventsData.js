// ── NexaSphere Events Data ──
// Shown on Home page event section + Events page.
// status: 'completed' | 'upcoming'

export const events = [
  {
    id: 1,
    name: 'KSS #153 — Knowledge Sharing Session',
    shortName: 'KSS #153',
    hasDetailPage: true,
    date: 'March 14, 2025',
    startDate: '2025-03-14T10:00:00',
    endDate: '2025-03-14T12:00:00',
    description:
      "NexaSphere's inaugural Knowledge Sharing Session — an interactive peer-to-peer learning event where members presented on the Impact of AI, fostering curiosity, collaboration, and community building.",
    status: 'completed',
    icon: 'Brain',
    category: 'workshop',
    tags: ['AI', 'Learning', 'Community'],
    location: 'Conference Hall',
    capacity: 50
  },
  {
    id: 2,
    name: 'Workshop: Git & GitHub',
    shortName: 'Git & GitHub',
    date: 'April 24, 2026',
    startDate: '2026-04-24T14:00:00',
    endDate: '2026-04-24T17:00:00',
    description:
      'Version control mastery for every developer. Learn Git from scratch and start contributing to real projects like a pro.',
    status: 'completed',
    icon: 'Wrench',
    category: 'workshop',
    tags: ['Git', 'GitHub', 'Workshop'],
    location: 'Computer Lab, CSE Block',
    capacity: 30
  },
  {
    id: 3,
    name: 'NexaSphere Hackathon 2026',
    shortName: 'Hackathon',
    date: 'June 10-12, 2026',
    startDate: '2026-06-10T09:00:00',
    endDate: '2026-06-12T18:00:00',
    description: '48-hour coding marathon to build innovative solutions for real-world problems. Collaborate with teams, get mentorship, and win exciting prizes.',
    status: 'upcoming',
    icon: 'Code',
    category: 'hackathon',
    tags: ['Hackathon', 'Coding', 'Innovation', 'Prizes'],
    location: 'Main Auditorium',
    capacity: 100
  },
  {
    id: 4,
    name: 'Tech Debate: AI vs Human Intelligence',
    shortName: 'Tech Debate',
    date: 'June 5, 2026',
    startDate: '2026-06-05T15:00:00',
    endDate: '2026-06-05T17:30:00',
    description: 'Structured debate on the future of AI and its impact on human creativity, jobs, and society.',
    status: 'upcoming',
    icon: 'MessageSquare',
    category: 'debate',
    tags: ['Debate', 'AI', 'Critical Thinking'],
    location: 'Seminar Room 203',
    capacity: 40
  },
  {
    id: 5,
    name: 'Open Source Contribution Day',
    shortName: 'Open Source Day',
    date: 'June 15, 2026',
    startDate: '2026-06-15T10:00:00',
    endDate: '2026-06-15T16:00:00',
    description: 'Learn Git workflows, find your first issue, and make your first open source contribution with guidance from mentors.',
    status: 'upcoming',
    icon: 'GitBranch',
    category: 'opensource',
    tags: ['Open Source', 'Git', 'GitHub', 'First PR'],
    location: 'Computer Lab',
    capacity: 35
  },
  {
    id: 6,
    name: 'AI Workshop: Prompt Engineering Masterclass',
    shortName: 'AI Workshop',
    date: 'May 28, 2026',
    startDate: '2026-05-28T11:00:00',
    endDate: '2026-05-28T13:00:00',
    description: 'Master the art of crafting effective prompts for generative AI tools like ChatGPT, Claude, and Gemini.',
    status: 'upcoming',
    icon: 'Sparkles',
    category: 'workshop',
    tags: ['AI', 'Prompt Engineering', 'Generative AI'],
    location: 'Online (Zoom)',
    capacity: 100
  },
  {
    id: 7,
    name: 'Previous Workshop: React Fundamentals',
    shortName: 'React Workshop',
    date: 'May 10, 2026',
    startDate: '2026-05-10T10:00:00',
    endDate: '2026-05-10T13:00:00',
    description: 'Introduction to React.js for beginners covering components, state, and props.',
    status: 'completed',
    icon: 'Code',
    category: 'workshop',
    tags: ['React', 'Frontend', 'Web Development'],
    location: 'Computer Lab',
    capacity: 50
  }
];