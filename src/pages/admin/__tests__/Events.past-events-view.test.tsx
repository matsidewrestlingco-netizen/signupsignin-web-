import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../contexts/OrgContext', () => ({
  useOrg: vi.fn(),
}));

vi.mock('../../../hooks/useEvents', () => ({
  useEvents: vi.fn(),
}));

vi.mock('../../../hooks/useTemplates', () => ({
  useTemplates: vi.fn(),
}));

vi.mock('../../../hooks/useSlots', () => ({
  useSlots: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock('../../../components/Modal', () => ({
  Modal: () => null,
}));

import { AdminEvents } from '../Events';
import { useOrg } from '../../../contexts/OrgContext';
import { useEvents } from '../../../hooks/useEvents';
import { useTemplates } from '../../../hooks/useTemplates';
import { useSlots } from '../../../hooks/useSlots';

const mockUseOrg = useOrg as ReturnType<typeof vi.fn>;
const mockUseEvents = useEvents as ReturnType<typeof vi.fn>;
const mockUseTemplates = useTemplates as ReturnType<typeof vi.fn>;
const mockUseSlots = useSlots as ReturnType<typeof vi.fn>;

const now = Date.now();
const makeEvent = (id: string, title: string, offsetMs: number) => ({
  id,
  title,
  startTime: new Date(now + offsetMs),
  endTime: undefined,
  location: 'Test Gym',
  description: '',
  isPublic: true,
  showVolunteerNames: false,
  createdAt: new Date(),
});

const DAY = 24 * 60 * 60 * 1000;
const pastEvent1 = makeEvent('past1', 'Winter Tournament', -7 * DAY);   // 7 days ago
const pastEvent2 = makeEvent('past2', 'Fall Festival', -14 * DAY);      // 14 days ago
const upcomingEvent1 = makeEvent('upcoming1', 'Spring Tournament', 7 * DAY);
const upcomingEvent2 = makeEvent('upcoming2', 'State Finals', 14 * DAY);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseOrg.mockReturnValue({ currentOrg: { id: 'org1', name: 'Test Org' } });
  mockUseTemplates.mockReturnValue({ templates: [] });
  mockUseSlots.mockReturnValue({ createSlotForEvent: vi.fn() });
});

describe('AdminEvents — Upcoming/Past toggle', () => {
  it('renders Upcoming and Past toggle buttons', () => {
    mockUseEvents.mockReturnValue({
      events: [upcomingEvent1],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    expect(screen.getByRole('button', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Past' })).toBeInTheDocument();
  });

  it('shows upcoming events by default', () => {
    mockUseEvents.mockReturnValue({
      events: [upcomingEvent1, pastEvent1],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    expect(screen.getByText('Spring Tournament')).toBeInTheDocument();
    expect(screen.queryByText('Winter Tournament')).not.toBeInTheDocument();
  });

  it('shows past events after clicking Past', () => {
    mockUseEvents.mockReturnValue({
      events: [upcomingEvent1, pastEvent1],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    fireEvent.click(screen.getByRole('button', { name: 'Past' }));
    expect(screen.getByText('Winter Tournament')).toBeInTheDocument();
    expect(screen.queryByText('Spring Tournament')).not.toBeInTheDocument();
  });

  it('switches back to upcoming when Upcoming is clicked', () => {
    mockUseEvents.mockReturnValue({
      events: [upcomingEvent1, pastEvent1],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    fireEvent.click(screen.getByRole('button', { name: 'Past' }));
    fireEvent.click(screen.getByRole('button', { name: 'Upcoming' }));
    expect(screen.getByText('Spring Tournament')).toBeInTheDocument();
    expect(screen.queryByText('Winter Tournament')).not.toBeInTheDocument();
  });

  it('shows past events sorted most recent first', () => {
    mockUseEvents.mockReturnValue({
      events: [pastEvent2, pastEvent1], // Firestore might return in any order
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    fireEvent.click(screen.getByRole('button', { name: 'Past' }));
    const titles = screen.getAllByText(/Tournament|Festival/);
    expect(titles[0]).toHaveTextContent('Winter Tournament'); // 7 days ago — more recent
    expect(titles[1]).toHaveTextContent('Fall Festival');     // 14 days ago — older
  });

  it('shows upcoming events sorted soonest first', () => {
    mockUseEvents.mockReturnValue({
      events: [upcomingEvent2, upcomingEvent1], // out of order — State Finals before Spring Tournament
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    const titles = screen.getAllByText(/Tournament|Finals/);
    expect(titles[0]).toHaveTextContent('Spring Tournament'); // 7 days away — sooner
    expect(titles[1]).toHaveTextContent('State Finals');      // 14 days away — later
  });

  it('shows the no-events empty state when there are no events at all', () => {
    mockUseEvents.mockReturnValue({
      events: [],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    expect(screen.getByText('No events yet')).toBeInTheDocument();
  });

  it('shows "No upcoming events" on Upcoming tab when only past events exist', () => {
    mockUseEvents.mockReturnValue({
      events: [pastEvent1],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
  });

  it('shows "No past events yet" on Past tab when only upcoming events exist', () => {
    mockUseEvents.mockReturnValue({
      events: [upcomingEvent1],
      loading: false,
      createEvent: vi.fn(),
    });
    render(<AdminEvents />);
    fireEvent.click(screen.getByRole('button', { name: 'Past' }));
    expect(screen.getByText('No past events yet')).toBeInTheDocument();
  });
});
