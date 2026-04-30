# Past Events View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Upcoming/Past pill toggle to the admin Events page, replacing the current dual-section layout that shows both at once.

**Architecture:** Single-file change to `src/pages/admin/Events.tsx`. A new `activeTab` state controls which event list renders. Upcoming and past arrays are already computed from the existing `useEvents` hook — only the display logic and sorting change. No Firestore query changes needed.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest + React Testing Library

---

### Task 0: Create feature branch

- [ ] **Step 1: Cut the feature branch from main**

```bash
cd "/Users/danielemmons/Desktop/Matside Software/signupsignin-app"
git checkout main && git pull
git checkout -b feature/past-events-view
```

---

### Task 1: Write failing tests

**Files:**
- Create: `src/pages/admin/__tests__/Events.past-events-view.test.tsx`

- [ ] **Step 1: Create the test file with mocks and fixtures**

```typescript
// src/pages/admin/__tests__/Events.past-events-view.test.tsx
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
```

- [ ] **Step 2: Write the eight test cases**

Append to the same file:

```typescript
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
```

- [ ] **Step 3: Run the tests and confirm they all fail**

```bash
cd "/Users/danielemmons/Desktop/Matside Software/signupsignin-app"
npx vitest run src/pages/admin/__tests__/Events.past-events-view.test.tsx
```

Expected: 8 failing tests. Failures will include "Unable to find role=button name=Upcoming" or similar — the toggle buttons don't exist yet.

- [ ] **Step 4: Commit the failing tests**

```bash
git add src/pages/admin/__tests__/Events.past-events-view.test.tsx
git commit -m "test: add failing tests for Upcoming/Past toggle on admin Events page"
```

---

### Task 2: Implement the toggle

**Files:**
- Modify: `src/pages/admin/Events.tsx`

- [ ] **Step 1: Add `activeTab` state**

In `src/pages/admin/Events.tsx`, add one line immediately after the existing `useState` declarations (around line 18, after `const [showVolunteerNames, setShowVolunteerNames] = useState(false);`):

```typescript
const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
```

- [ ] **Step 2: Add explicit sorting to the event arrays**

Replace lines 101–102 (the two `filter` lines) with:

```typescript
const upcomingEvents = events
  .filter((e) => e.startTime >= new Date())
  .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
const pastEvents = events
  .filter((e) => e.startTime < new Date())
  .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
```

- [ ] **Step 3: Replace the page header with the version that includes the pill toggle**

Replace this block (lines 106–117):

```tsx
<div className="page-header flex justify-between items-start">
  <div>
    <h1 className="page-title">Events</h1>
    <p className="page-subtitle">Manage your organization's events</p>
  </div>
  <button
    onClick={() => setShowCreateModal(true)}
    className="btn-primary"
  >
    Create Event
  </button>
</div>
```

With:

```tsx
<div className="page-header flex justify-between items-start">
  <div>
    <h1 className="page-title">Events</h1>
    <p className="page-subtitle">Manage your organization's events</p>
  </div>
  <div className="flex items-center gap-4">
    <div className="bg-gray-200 rounded-lg p-1 flex">
      <button
        onClick={() => setActiveTab('upcoming')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'upcoming'
            ? 'bg-primary-700 text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Upcoming
      </button>
      <button
        onClick={() => setActiveTab('past')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'past'
            ? 'bg-primary-700 text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Past
      </button>
    </div>
    <button
      onClick={() => setShowCreateModal(true)}
      className="btn-primary"
    >
      Create Event
    </button>
  </div>
</div>
```

- [ ] **Step 4: Replace the content section with tab-aware rendering**

Replace the entire block from `{loading ? (` through the closing `)}` before the `<Modal` (lines 119–167) with:

```tsx
{loading ? (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700"></div>
  </div>
) : events.length === 0 ? (
  <div className="card">
    <div className="card-body text-center py-12">
      <p className="text-gray-500 mb-4">No events yet</p>
      <button
        onClick={() => setShowCreateModal(true)}
        className="btn-primary"
      >
        Create your first event
      </button>
    </div>
  </div>
) : activeTab === 'upcoming' ? (
  upcomingEvents.length === 0 ? (
    <div className="card">
      <div className="card-body text-center py-12">
        <p className="text-gray-500">No upcoming events</p>
      </div>
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {upcomingEvents.map((event) => (
        <Link key={event.id} to={`/admin/events/${event.id}`}>
          <EventCard event={event} />
        </Link>
      ))}
    </div>
  )
) : (
  pastEvents.length === 0 ? (
    <div className="card">
      <div className="card-body text-center py-12">
        <p className="text-gray-500">No past events yet</p>
      </div>
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pastEvents.map((event) => (
        <Link key={event.id} to={`/admin/events/${event.id}`}>
          <EventCard event={event} />
        </Link>
      ))}
    </div>
  )
)}
```

- [ ] **Step 5: Run the tests and confirm they all pass**

```bash
npx vitest run src/pages/admin/__tests__/Events.past-events-view.test.tsx
```

Expected: 8 passing tests.

- [ ] **Step 6: Run the full test suite to check for regressions**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/pages/admin/Events.tsx
git commit -m "feat: add Upcoming/Past pill toggle to admin Events page"
```

---

### Task 3: Merge, tag, and deploy

- [ ] **Step 1: Merge feature branch to main**

```bash
git checkout main
git merge feature/past-events-view
git branch -d feature/past-events-view
```

- [ ] **Step 2: Tag the release**

This is a new roadmap feature → MINOR bump. Current version is `v1.1.0`, so tag `v1.2.0`:

```bash
git tag v1.2.0
git push origin main --tags
```

- [ ] **Step 3: Deploy**

```bash
firebase deploy --only hosting
```

Expected output: `✔ Deploy complete!` with the hosting URL.
