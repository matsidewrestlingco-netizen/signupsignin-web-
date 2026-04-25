# App Store Badge on Landing Page — Design Spec

**Date:** 2026-04-25
**Status:** Approved

---

## Overview

Add an official Apple "Download on the App Store" badge to the signupsignin.com landing page, linking to the app's App Store product page. Placement is a dedicated "Also available on iOS" section below the three feature cards, above the page footer.

---

## Placement

The badge section is inserted between the feature cards grid and the existing `<footer>` in `src/pages/Landing.tsx`. It sits inside the same dark gradient background as the rest of the page, separated from the cards above by a top border and padding.

Layout:
- Centered text label: "Also available on iOS"
- Apple badge as a clickable `<a>` tag, centered below the label
- Trademark notice in small muted text below the badge

The primary web CTAs ("Get Started" / "Log in") remain in the hero section and are unaffected.

---

## Badge Asset

- **Source file:** `Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917.svg` from the official Apple marketing kit (US locale, white lockup)
- **Destination:** `src/assets/app-store-badge-white.svg`
- **Color choice:** White badge. Apple recommends white on dark backgrounds; white is appropriate here since it is the only App Store badge on the page (Apple requires black when multiple platform badges appear together).
- **Import:** Standard Vite asset import (`import appStoreBadge from '../assets/app-store-badge-white.svg'`), consistent with how `susilogo.png` is handled.

---

## Link

- **URL:** `https://apps.apple.com/us/app/signupsignin/id6762022121`
- **Behavior:** Opens in a new tab (`target="_blank" rel="noopener noreferrer"`) so users don't lose their place on the landing page.

---

## Apple Guidelines Compliance

| Requirement | Implementation |
|---|---|
| Minimum height 40px onscreen | Badge rendered at 40px height via `h-10` (Tailwind) |
| Clear space ≥ ¼ badge height | Padding around badge in the section container |
| No modification to badge artwork | SVG used as-is, no color/shape changes |
| One badge per layout | Only one badge on the page |
| Badge in subordinate position | Below hero and feature cards, not competing with primary CTA |
| Trademark credit line | `App Store® is a registered trademark of Apple Inc.` displayed in small muted text below the badge |
| Link to App Store product page | Badge links directly to `apps.apple.com/us/app/signupsignin/id6762022121` |

---

## Roadmap

Add a new entry to the **Completed** table in `docs/ROADMAP.md`:

| Feature | Shipped |
|---|---|
| App Store badge on landing page | Apr 2026 |

---

## Files Changed

| File | Change |
|---|---|
| `src/assets/app-store-badge-white.svg` | New — copied from Apple marketing kit |
| `src/pages/Landing.tsx` | Add "Also available on iOS" section with badge |
| `docs/ROADMAP.md` | Add completed entry for App Store badge |
