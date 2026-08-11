# Deploying Steady — GitHub + Firebase + Vercel

This turns the five files in this project into a real, live website at a public URL, with mandatory Google sign-in and each person's data saved to their own account.

**What you need before starting:** a GitHub account, a Google account (used for both Firebase and signing into Vercel), and Git installed on your computer.

**The order matters.** Do these roughly in order — Firebase needs to exist before you can paste its keys into the code, and the code needs to be on GitHub before Vercel can deploy it.

---

## Part 1 — Put the project on GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository. Name it something like `steady-app`. Leave it empty (no README/gitignore) since you already have files.
2. On your computer, put all five files (`index.html`, `manifest.json`, `icon-192.png`, `icon-512.png`, `firestore.rules`) plus this guide and the README into one folder, e.g. `steady-app/`.
3. In that folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/steady-app.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your actual GitHub username. If asked to log in, follow GitHub's prompts (a personal access token or the GitHub CLI login flow both work).
4. Refresh the GitHub page — your files should now be there.

At this point your app is on GitHub but not live anywhere yet, and sign-in doesn't work yet either. That's expected — next up is Firebase.

---

## Part 2 — Set up Firebase (auth + database)

### 2.1 Create the project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in.
2. Click **Add project**, name it (e.g. "steady-app"), and finish the wizard. You can decline Google Analytics.

### 2.2 Register a web app and get your config

1. On the project dashboard, click the **`</>`** (web) icon to register a web app.
2. Give it a nickname like "Steady web". You don't need Firebase Hosting checked — you're using Vercel instead.
3. Firebase shows you a config object:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "steady-app.firebaseapp.com",
     projectId: "steady-app",
     storageBucket: "steady-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
4. Copy this whole object — you'll paste it into `index.html` in Part 3.

### 2.3 Turn on Google sign-in

1. **Build → Authentication → Get started**.
2. Under **Sign-in method**, click **Google**, toggle **Enable**, pick a support email, **Save**.
3. Under **Settings → Authorized domains**, `localhost` is already listed. You'll add your real Vercel domain here in Part 5 — sign-in will not work from that domain until you do.

### 2.4 Turn on Firestore (the database)

1. **Build → Firestore Database → Create database**.
2. Choose **Start in production mode**, pick a location, **Enable**.
3. Go to the **Rules** tab, delete the default rules, and paste in the contents of `firestore.rules` from this project:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
4. Click **Publish**. This is what makes sure people can only ever read or write their own data — nobody can see anyone else's check-ins or journal entries.

---

## Part 3 — Paste your Firebase config into the code

1. Open `index.html` in a text editor and search for `YOUR_API_KEY`. It's inside a `<script type="module">` block, a bit before the closing `</body>`.
2. Replace the whole placeholder `firebaseConfig` object with the real one from Step 2.2.
3. Save the file.

The app already checks whether the key is still the placeholder — once it isn't, the login gate automatically switches from "sign-in isn't connected yet" to the real "Continue with Google" button, and the developer-preview bypass disappears since it's no longer needed.

4. Commit and push this change:
   ```bash
   git add index.html
   git commit -m "Add Firebase config"
   git push
   ```

---

## Part 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in **with your GitHub account** — this is what lets Vercel see your repos.
2. Click **Add New… → Project**.
3. Find `steady-app` in the list of your GitHub repos and click **Import**.
4. Vercel will detect it as a static site (no framework, since it's plain HTML/CSS/JS). You don't need to change any build settings — leave Build Command and Output Directory blank/default.
5. Click **Deploy**. In under a minute you'll get a live URL like `https://steady-app.vercel.app`.

---

## Part 5 — Connect the dots: authorize your Vercel domain

Google sign-in will fail on your live site until Firebase trusts that domain.

1. Copy your Vercel URL (e.g. `steady-app.vercel.app` — no `https://`, just the domain).
2. Back in the Firebase console: **Authentication → Settings → Authorized domains → Add domain**.
3. Paste it in and save.
4. Visit your live Vercel URL. You should see the Steady login screen. Sign in with Google — it should now work for real, and stay working from any device.

If you later add a **custom domain** in Vercel (Project → Settings → Domains), repeat this step for that domain too.

---

## Part 6 — Verify it end to end

- [ ] Visiting the Vercel URL shows the "Continue with Google" login screen — no way to see the app content without it
- [ ] Signing in works and the app unlocks
- [ ] Do something small (log a mood, tick a symptom) — refresh the page. You should still be signed in and the data should still be there
- [ ] Open the same URL in a different browser (or incognito) and sign in with the *same* Google account — your data should show up there too, proving it's coming from Firestore, not just local browser storage
- [ ] Sign out — you should land back on the login screen, no lingering access

---

## Making changes later

Every `git push` to `main` automatically redeploys on Vercel — there's no separate deploy step to remember. Edit `index.html`, commit, push, and the live site updates within about a minute.

```bash
git add .
git commit -m "Describe what changed"
git push
```

---

## Troubleshooting

**"This domain is not authorized" / `auth/unauthorized-domain`**
You deployed or renamed your Vercel URL but didn't add it to Firebase's Authorized domains list (Part 5). Add it and try again.

**Sign-in popup opens and immediately closes, or nothing happens**
Some browsers block popups by default. Try clicking the button again (the second click sometimes succeeds since it's now a direct response to a click), or check your browser's popup-blocked icon in the address bar and allow it for your site.

**"Missing or insufficient permissions" in the browser console**
Your Firestore rules either weren't published (Part 2.4) or don't match what's in `firestore.rules`. Re-check the Rules tab in the Firebase console.

**The login screen still says "Sign-in isn't connected yet" after deploying**
The `firebaseConfig` in `index.html` still has the placeholder values, or you edited a local copy that didn't get pushed to GitHub. Confirm the real values are in the file on GitHub (check the file directly on github.com), and that Vercel redeployed after your last push (check the Deployments tab in Vercel).

**Data doesn't show up on a second device**
Make sure you're signed into the *same* Google account on both. Steady's data is keyed to the Firebase user ID, not the browser.
