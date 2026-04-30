# Web Past Events View
**Date:** 2026-04-20
**Roadmap Item:** #1 — Past Events View
**Estimated Effort:** 6 hrs
**Platform:** Web (React / TypeScript)

---

## Context

Admins have no way to view completed events and their signup history on the web. All historical data already exists in Firestore — the events list just doesn't surface past events. This spec adds an Upcoming/Past toggle to the existing admin events page.

---

## Design

### Toggle
An **Upcoming / Past** pill/segmented control is added at the top of the admin events list page, inline with the page header alongside the Create Event button, defaulting to **Upcoming** on load.

- **Upcoming** — events where `startTime >= now`, sorted soonest first (current behavior)
- **Past** — events where `startTime < now`, sorted most recent first

**Visual style:** Dark navy active pill (`bg-primary-700 text-white`) on a light gray container (`bg-gray-200`), `rounded-lg` container with `rounded-md` pills. Inactive option is unstyled text (`text-gray-500`). This is a new pattern for the app — no existing segmented controls to match against.

### Filtering
Client-side — the existing Firestore query is unchanged. Events are split into upcoming/past arrays in memory using the current timestamp at render time.

### Past Event Detail
Clicking a past event opens the existing event detail page unchanged. The full signup roster, slot fill counts, and attendance data are already available there — no new views needed.

### Empty States
- **No events at all** (`events.length === 0`): existing "No events yet / Create your first event" card, shown regardless of active tab.
- **Upcoming tab, no upcoming events** (but past events exist): *"No upcoming events"* message.
- **Past tab, no past events**: *"No past events yet"* message.

---

## Implementation Notes

- File to modify: `src/pages/admin/Events.tsx`
- Use a `useState` hook for the selected tab (`'upcoming' | 'past'`)
- Split events array at render time by comparing `event.startTime` to `Date.now()`
- Past events sorted descending (most recent first)
- Toggle is a pill/segmented control: `bg-gray-200 rounded-lg p-1` container, active pill uses `bg-primary-700 text-white rounded-md`, inactive uses `text-gray-500`

---

## Out of Scope

- Server-side query changes (client-side filtering is sufficient at current scale)
- Any changes to the event detail page
- Archiving or deleting past events

---

## Success Criteria

- Admin events page shows an Upcoming/Past toggle
- Upcoming is selected by default
- Past tab shows completed events sorted most recent first
- Clicking a past event opens the existing event detail with full signup history
- Empty state shown when no past events exist
