# Steady

A companion for anxious moments — pick what you're feeling, get matched coping techniques, and walk through them step by step: guided breathing, 5-4-3-2-1 grounding, progressive muscle relaxation, a body scan, journaling, thought reframing, movement breaks, and generated calming background music, all with optional spoken (voice) guidance.

Signing in with a Google account is required — it's how your check-ins, mood log, streak, badges, and reframes are saved to your account via Firebase, so they follow you across devices.

## Files in this project

| File | What it's for |
|---|---|
| `index.html` | The entire app — markup, styles, and logic in one file. This is the only file that runs. |
| `manifest.json` | Lets phones "install" Steady to the home screen like an app. |
| `icon-192.png`, `icon-512.png` | App icons referenced by the manifest. |
| `firestore.rules` | The Firestore security rules to paste into your Firebase project — restricts each account to reading/writing only its own data. |
| `DEPLOYMENT.md` | Full step-by-step guide: Firebase project setup, GitHub, and deploying to Vercel. **Start here.** |

## Quick local preview (no sign-in yet)

You don't need Firebase set up to look at the app locally — it'll show a "sign-in isn't connected yet" screen with a **developer preview** bypass link so you can still click around:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Real sign-in (and therefore real deployment) requires the steps in `DEPLOYMENT.md`.

## What this isn't

Steady is a self-help tool, not a diagnosis, treatment, or replacement for a therapist or doctor. If you're building on this for other people, keep that framing intact somewhere visible in the app (it's currently in the footer).
