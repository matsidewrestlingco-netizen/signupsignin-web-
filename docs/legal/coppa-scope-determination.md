# SignupSignin — COPPA Scope Determination

**Date:** 2026-06-19
**Author:** Daniel Emmons (Matside Wrestling Co.) — drafted via Claude Code
**Issue:** [matsidewrestlingco-netizen/signupsignin-web-#4](https://github.com/matsidewrestlingco-netizen/signupsignin-web-/issues/4)
**Parent epic:** [matsidewrestlingco-netizen/matside-hq#8](https://github.com/matsidewrestlingco-netizen/matside-hq/issues/8) — COPPA Sept 1 review prep
**Framework:** `matside-hq:planning/coppa-six-step-self-audit-v1.md` v1.2 — FTC Six-Step Compliance Plan

---

## Bottom line

**Does SignupSignin collect personal information FROM children under 13? — NO.**

**Recommended COPPA posture: OUT OF SCOPE BY STRUCTURAL EXCLUSION.** Stronger posture than MatPass/MatTime: SignupSignin is a pure adult-self-signup volunteer system. It collects no data ABOUT children either — the user IS the volunteer. No DOB, no age, no grade, no school, no child-data field exists anywhere in the schema or UI. Joins MatPass + MatTime + MatRecruit in the out-of-scope bucket. Bundled Sept 1 attorney review should confirm and document.

---

## Architecture (evidence)

SignupSignin has two roles only: `admin` + `member` (`firestore.rules:23`). There is **no `parent` role and no `child` role.** The `src/pages/parent/` folder is a URL grouping for non-admin volunteers — it is not a data-model concept.

- `firestore.rules:23` — `isOrgMember()` checks `userOrgs[orgId] == 'admin' || == 'member'`. Only two values exist.
- `src/contexts/AuthContext.tsx:21` — `UserProfile.organizations` typed as `Record<string, 'admin' | 'member'>`. No other role values.

## Account creation paths

1. **Sign-up** at `src/pages/SignUp.tsx:26-48` collects email + password + name only. Three OAuth options (email/password, Google, Apple). No age gate, no DOB, no PI other than identity. New user is created with `organizations: {}` (`AuthContext.tsx:78-83`, enforced by `firestore.rules:38-39` `request.resource.data.organizations == {}`).

2. **Becoming an admin** requires creating an organization at `/setup/organization` — the creator becomes admin of that org (`firestore.rules:51-52`).

3. **Becoming a member** of an org happens via direct invitation flow (not audited end-to-end here; not relevant to COPPA scope since members are adult volunteers).

## Data flow — signups

The ONLY user-generated PII in the system flows through the `signups` collection at `organizations/{orgId}/signups/{signupId}`:

- `firestore.rules:97-100` — create rule requires `request.resource.data.userId == request.auth.uid`. **A user can only create a signup for themselves.** No path exists for a parent to create a signup for a child.
- Required fields: `eventId, slotId, userId, userName, userEmail, checkedIn`. **No child name, no birthdate, no grade, no parent-of-record, no minor-data field.**
- `src/pages/parent/EventSignup.tsx:108-130` — confirms the UI flow: `handleSignUp` reads `currentUser` + `userProfile` and creates a signup with the signed-in user's own name + email.
- `firestore.rules:99-100` — required fields explicitly limit signup writes to self-data only.

## Cloud Functions — `functions/src/index.ts`

Four functions; none accept or process child data:

1. `onSignupCreated` (Firestore trigger, line 98) — sends confirmation email to `signup.userEmail` after a signup is created. Adult-to-adult email; no child PII.
2. `sendReminderEmails` (cron every 1 hour, line 180) — sends event reminders. Same adult-to-adult pattern.
3. `sendTestEmail` (callable, line 281) — admin sends test email to verify SMTP. Admin → admin.
4. `sendEventReminderBlast` (callable, line 333) — admin triggers manual reminder broadcast. Adult → adult.

No function creates or modifies user accounts, no function accepts child data, no function exposes PII of any minor.

## Privacy policy — already has Children's Privacy section

`src/pages/PrivacyPolicy.tsx:110-123` (effective 2026-04-03) includes a Children's Privacy section:

> SignupSignIn is not directed at children under the age of 13. We do not knowingly collect personal information directly from children under 13. The platform is intended to be used by adults (such as parents or coaches) who may register on behalf of minors.

**The first two sentences are correct.** The third sentence — "who may register on behalf of minors" — **describes a feature that does not exist in the code.** The signup model is strictly self-only (`firestore.rules:97-100`). No "register on behalf of" flow exists. This is a policy-vs-code drift that should be corrected before Sept 1 attorney review.

## COPPA framework application

Per `matside-hq:planning/coppa-six-step-self-audit-v1.md` line 21–27:
- Data collected FROM children under 13 → COPPA applies.
- Data collected from adults ABOUT children → NOT a COPPA trigger.

SignupSignin: **neither pattern is present.** The system collects adult-self-PII only. The "out of scope by structural exclusion" determination is stronger than MatPass + MatTime — there isn't even the adult-input-about-child pattern to flag for attorney confirmation.

The framework asked three concrete confirmations (`matside-hq:planning/coppa-six-step-self-audit-v1.md:282-285`); all three are answered:

| Confirmation | Result |
|---|---|
| Parent role creates child records? | **No** — there is no parent role and there is no child record. |
| Any path for an under-13 to sign up an account themselves? | **No technical block at SignUp.tsx** (age-blind, same as MatPass/MatRecruit pre-class-year-gate). See gap #3 below. |
| Privacy policy reflects current code accurately? | **Mostly, except the "register on behalf of minors" phrase describes a non-existent feature.** See gap #1 below. |

---

## Pre-Sept-1 gaps

These are surfaced for the attorney review. None are COPPA scope-changers; they're policy/security/hygiene items.

1. **Privacy policy inaccuracy** (`PrivacyPolicy.tsx:115`) — the phrase "such as parents or coaches who may register on behalf of minors" describes a feature that doesn't exist in the code (signup model is strictly self-only via `firestore.rules:97-100`). **Fix:** drop that clause; replace with "The platform is intended to be used by adults — wrestling tournament organizers and the adult volunteers who sign themselves up to help at events." ~5 min markdown edit. Policy-vs-code drift correction; not a COPPA-scope concern but the attorney will spot it.

2. **Org-membership escalation hole** (`firestore.rules:42`) — `allow update: if isOwner(userId)` lets a signed-in user write any role into their own `organizations` map (`organizations.{anyOrgId}: 'admin' | 'member'`). Same pattern as the MatPass C1 finding (matpass-app#5). Not a COPPA issue but Sept-1-attorney-relevant security finding. **Fix:** tighten `users/{userId}` update rule to deny writes to the `organizations` map from the client; force org-membership grants through a Cloud Function with admin credentials. ~30 min rules + Cloud Function update.

3. **Optional self-attestation gate at SignUp.tsx** — same belt-and-suspenders suggestion as MatPass. Add a checkbox "I am 18 or older, or I am accessing SignupSignin as a tournament organizer or adult volunteer." Not strictly required since no under-13 self-input surface exists beyond initial signup (and a child signing up gets empty `organizations: {}` with no path to do anything meaningful), but cheap insurance. ~15 min form addition.

4. **No standalone `/coppa` route or `/terms` page** — the Children's Privacy section is embedded in `/privacy` rather than a dedicated `/coppa` route (MatRecruit ships both; WrestleFA ships `/coppa` as a separate route). Less urgent than MatPass C11 since (a) SignupSignin is in maintenance mode and (b) the COPPA disclosure already exists inline. Consider for a future post-Sept-1 hygiene pass.

5. **Vendor DPAs** — Firebase + Resend on file. Covered by cross-product C4 (matside-hq#10).

6. **Inclusion in cross-product Information Security Program** — covered by C3 (matside-hq#9).

7. **Inclusion in cross-product third-party tracker / persistent-identifier inventory** — covered by C9 (matside-hq#13).

---

## Recommendation for Sept 1 attorney review

**Carry this memo + the policy-text fix into the Sept 1 bundle.** Ask the attorney to confirm three things:

1. SignupSignin's structural exclusion (adult-self-signup-only system with no DOB/age/grade fields anywhere in the schema; no parent-of-child registration mechanism in code) is sufficient for the "no actual knowledge of collecting PI from under-13s" posture under §312.3.
2. The "register on behalf of minors" language drift (gap #1) is OK to drop from the privacy policy without triggering any disclosure obligation, given that the feature was never built.
3. iOS App Store COPPA-adjacent treatment — the SignupSignin mobile app (`signupsignin-app-`) is in the App Store. Does the App Store's age-rating + parental-consent overlays satisfy any Apple-specific COPPA-adjacent requirements, or is there a separate path to confirm?

If all three confirm: **SignupSignin joins MatTime + MatRecruit + MatPass in the "out-of-scope-by-structural-exclusion" bucket.** WrestleFA remains the sole product needing Safe Harbor.
