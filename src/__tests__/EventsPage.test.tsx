import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventsPage from '../pages/events/EventsPage';

describe('EventsPage Component', () => {
  const mockEvents = [
    {
      id: 'kss-153',
      name: 'KSS #153 — AI Workshop',
      shortName: 'KSS #153',
      date: 'April 15, 2025',
      description: 'Deep dive into AI concepts',
      status: 'completed',
      icon: '🤖',
      tags: ['AI', 'ML'],
    },
    {
      id: 'kss-154',
      name: 'KSS #154 — Web Dev',
      shortName: 'KSS #154',
      date: 'May 1, 2099',
      description: 'Modern web development',
      status: 'upcoming',
      icon: '🌐',
      tags: ['Web', 'React'],
    },
  ];

  const mockOnBack = vi.fn();
  const mockOnEventClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders events page with title', () => {
    render(
      <EventsPage
        events={mockEvents}
        onBack={mockOnBack}
        onEventClick={mockOnEventClick}
      />
    );
    expect(screen.getByText(/Our Events/i)).toBeInTheDocument();
  });

  it('displays all events in timeline', () => {
    render(
      <EventsPage
        events={mockEvents}
        onBack={mockOnBack}
        onEventClick={mockOnEventClick}
      />
    );
    expect(screen.getByText(/KSS #153 — AI Workshop/i)).toBeInTheDocument();
    expect(screen.getByText(/KSS #154 — Web Dev/i)).toBeInTheDocument();
  });

  it('shows completed and upcoming status badges', () => {
    render(
      <EventsPage
        events={mockEvents}
        onBack={mockOnBack}
        onEventClick={mockOnEventClick}
      />
    );
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/Upcoming/i)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(
      <EventsPage
        events={mockEvents}
        onBack={mockOnBack}
        onEventClick={mockOnEventClick}
      />
    );
    const backBtn = screen.getByText(/← Back/);
    expect(backBtn).toBeInTheDocument();
  });

  it('renders event tags', () => {
    render(
      <EventsPage
        events={mockEvents}
        onBack={mockOnBack}
        onEventClick={mockOnEventClick}
      />
    );
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('ML')).toBeInTheDocument();
    expect(screen.getByText('Web')).toBeInTheDocument();
  });

  it('renders coming soon message', () => {
    render(
      <EventsPage
        events={mockEvents}
        onBack={mockOnBack}
        onEventClick={mockOnEventClick}
      />
    );
    expect(screen.getByText(/More events coming soon/i)).toBeInTheDocument();
  });
});
