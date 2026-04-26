# App Store Badge on Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the official Apple "Download on the App Store" badge to the landing page below the feature cards, linking to the SignupSignin App Store listing.

**Architecture:** Copy the official white-lockup SVG badge into `src/assets/`, import it in `Landing.tsx`, and render it inside a new "Also available on iOS" section between the feature cards and the page footer. Update the roadmap to mark the feature complete.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Vitest + React Testing Library

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/assets/app-store-badge-white.svg` | Create (copy) | Official Apple white badge SVG |
| `src/pages/Landing.tsx` | Modify | Add badge section + asset import |
| `src/pages/__tests__/Landing.test.tsx` | Create | Verify badge renders with correct link |
| `docs/ROADMAP.md` | Modify | Add App Store badge to Completed table |

---

### Task 1: Create the feature branch

- [ ] **Step 1: Branch from main**

```bash
git checkout main && git pull
git checkout -b feature/app-store-badge
```

Expected: you are now on branch `feature/app-store-badge`.

---

### Task 2: Copy the badge asset

- [ ] **Step 1: Copy the official white SVG badge into the assets folder**

```bash
cp "/Users/danielemmons/Downloads/Download-on-the-App-Store/US/Download_on_App_Store/White_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917.svg" \
   "/Users/danielemmons/Desktop/Matside Software/signupsignin-app/src/assets/app-store-badge-white.svg"
```

Expected: `src/assets/app-store-badge-white.svg` now exists.

- [ ] **Step 2: Commit the asset**

```bash
git add src/assets/app-store-badge-white.svg
git commit -m "feat: add official Apple App Store badge SVG asset"
```

---

### Task 3: Write the failing test for Landing

- [ ] **Step 1: Create `src/pages/__tests__/Landing.test.tsx`**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock('../../assets/app-store-badge-white.svg', () => ({ default: 'app-store-badge-white.svg' }));
vi.mock('../../assets/susilogo.png', () => ({ default: 'susilogo.png' }));

import { Landing } from '../Landing';
import { useAuth } from '../../contexts/AuthContext';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ currentUser: null, userProfile: null });
});

describe('Landing', () => {
  it('renders the App Store badge with correct link and target', () => {
    render(<Landing />);
    const badge = screen.getByAltText('Download on the App Store');
    expect(badge).toBeInTheDocument();
    const link = badge.closest('a');
    expect(link).toHaveAttribute('href', 'https://apps.apple.com/us/app/signupsignin/id6762022121');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Apple trademark notice', () => {
    render(<Landing />);
    expect(
      screen.getByText(/App Store® is a registered trademark of Apple Inc\./)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
cd "/Users/danielemmons/Desktop/Matside Software/signupsignin-app"
npm test -- --reporter=verbose src/pages/__tests__/Landing.test.tsx
```

Expected: FAIL — `Unable to find an element with the alt text: Download on the App Store`

---

### Task 4: Implement the badge section in Landing.tsx

- [ ] **Step 1: Open `src/pages/Landing.tsx` and add the asset import**

At the top of the file, after the existing `import logo from '../assets/susilogo.png';` line, add:

```tsx
import appStoreBadge from '../assets/app-store-badge-white.svg';
```

- [ ] **Step 2: Add the "Also available on iOS" section**

Inside `<main className="py-20">`, after the closing `</div>` of the feature cards grid (the `mt-20 grid md:grid-cols-3 ...` div) and before `</main>`, add:

```tsx
<div className="mt-16 pt-10 border-t border-primary-600 text-center">
  <p className="text-primary-200 text-sm mb-4">Also available on iOS</p>
  <a
    href="https://apps.apple.com/us/app/signupsignin/id6762022121"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block"
  >
    <img
      src={appStoreBadge}
      alt="Download on the App Store"
      className="h-10"
    />
  </a>
  <p className="mt-3 text-xs text-primary-400">
    App Store® is a registered trademark of Apple Inc.
  </p>
</div>
```

The full updated `<main>` block should look like this:

```tsx
<main className="py-20">
  <div className="text-center">
    <img src={logo} alt="SignupSignin" className="h-20 w-auto mx-auto mb-8" />
    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
      Volunteer Event Signups
      <br />
      <span className="text-primary-200">Made Simple</span>
    </h1>
    <p className="mt-6 max-w-2xl mx-auto text-xl text-primary-100">
      Manage volunteer signups, track attendance, and generate reports
      for your organization's events. Easy for admins, simple for
      volunteers.
    </p>
    <div className="mt-10 flex justify-center gap-4">
      {currentUser ? (
        <Link
          to={userProfile?.organizations && Object.keys(userProfile.organizations).length > 0 ? '/admin' : '/parent'}
          className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 text-lg"
        >
          Go to Dashboard
        </Link>
      ) : (
        <>
          <Link
            to="/signup"
            className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 text-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="btn border-2 border-white text-white hover:bg-primary-600 px-8 py-3 text-lg"
          >
            Log in
          </Link>
        </>
      )}
    </div>
  </div>

  <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
      <div className="text-3xl mb-4">📅</div>
      <h3 className="text-xl font-semibold mb-2">Create Events</h3>
      <p className="text-primary-100">
        Set up events with multiple volunteer slots, time slots, and
        capacity limits.
      </p>
    </div>
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
      <div className="text-3xl mb-4">✅</div>
      <h3 className="text-xl font-semibold mb-2">Easy Check-in</h3>
      <p className="text-primary-100">
        Volunteers can self check-in or admins can mark attendance with
        one click.
      </p>
    </div>
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
      <div className="text-3xl mb-4">📊</div>
      <h3 className="text-xl font-semibold mb-2">Reports & Export</h3>
      <p className="text-primary-100">
        Generate detailed reports and export data to CSV for your
        records.
      </p>
    </div>
  </div>

  <div className="mt-16 pt-10 border-t border-primary-600 text-center">
    <p className="text-primary-200 text-sm mb-4">Also available on iOS</p>
    <a
      href="https://apps.apple.com/us/app/signupsignin/id6762022121"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      <img
        src={appStoreBadge}
        alt="Download on the App Store"
        className="h-10"
      />
    </a>
    <p className="mt-3 text-xs text-primary-400">
      App Store® is a registered trademark of Apple Inc.
    </p>
  </div>
</main>
```

- [ ] **Step 3: Run the tests and confirm they pass**

```bash
npm test -- --reporter=verbose src/pages/__tests__/Landing.test.tsx
```

Expected: PASS — both tests green.

- [ ] **Step 4: Run the full test suite to check for regressions**

```bash
npm test
```

Expected: all existing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Landing.tsx src/pages/__tests__/Landing.test.tsx
git commit -m "feat: add App Store badge to landing page below feature cards"
```

---

### Task 5: Update the roadmap

- [ ] **Step 1: Open `docs/ROADMAP.md` and add a new row to the Completed table**

Find the `## Completed` section. Add the following row at the top of the table body (most recent first):

```markdown
| App Store badge on landing page | Apr 2026 |
```

The completed table should look like:

```markdown
## Completed

| Feature | Shipped |
|---------|---------|
| App Store badge on landing page | Apr 2026 |
| Day-of Roster (check-in) | Mar 2026 |
| Email confirmations & reminders | Apr 2026 |
| Viral loop (org discovery) | Apr 2026 |
| Privacy Policy page | Apr 2026 |
| Support page | Apr 2026 |
| iOS app (Phase 1–4) | Apr 2026 |
| Volunteer names on signup page | Apr 2026 |
```

- [ ] **Step 2: Commit**

```bash
git add docs/ROADMAP.md
git commit -m "docs: mark App Store badge as complete in roadmap"
```

---

### Task 6: Build verification

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected: build completes with no errors. The SVG asset will be included and fingerprinted in `dist/`.

- [ ] **Step 2: Preview locally**

```bash
npm run preview
```

Open the URL printed in the terminal (typically `http://localhost:4173`). Verify:
- The "Also available on iOS" label appears below the three feature cards
- The white App Store badge renders (not broken image)
- Clicking the badge opens `https://apps.apple.com/us/app/signupsignin/id6762022121` in a new tab
- The trademark notice "App Store® is a registered trademark of Apple Inc." appears below the badge
- The existing "Get Started" and "Log in" buttons still work correctly

---

### Task 7: Merge, tag, and deploy

- [ ] **Step 1: Merge feature branch into main**

```bash
git checkout main
git merge feature/app-store-badge
git branch -d feature/app-store-badge
```

- [ ] **Step 2: Tag the release**

This is a new feature, so it's a MINOR version bump: `v1.0.0` → `v1.1.0`.

```bash
git tag v1.1.0
git push origin main --tags
```

- [ ] **Step 3: Deploy to Firebase Hosting**

```bash
firebase deploy
```

Expected: deploy succeeds and `https://signupsignin.com` shows the badge.
