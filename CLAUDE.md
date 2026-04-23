# SignupSignin Web App

React + TypeScript + Vite + Firebase web app for the SignupSignin volunteer management platform.

## Branching Strategy

- `main` — always production-ready; never commit directly
- `feature/<kebab-case-name>` — one branch per roadmap item, cut from `main`, deleted after merge

### Workflow for every feature

1. `git checkout main && git pull`
2. `git checkout -b feature/<name>`
3. Build and test the feature
4. `git checkout main && git merge feature/<name>`
5. `git branch -d feature/<name>`
6. `git tag vX.Y.Z && git push origin main --tags`
7. `firebase deploy`

### Versioning

Semantic versioning (`MAJOR.MINOR.PATCH`):
- PATCH — bug fix or small tweak (e.g. `v1.0.1`)
- MINOR — new roadmap feature (e.g. `v1.1.0`)
- MAJOR — breaking change (e.g. `v2.0.0`)

Web and iOS version numbers are independent.

## Deploy

```bash
firebase deploy
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Firebase (Firestore, Auth, Hosting, Functions)
- Tailwind CSS
