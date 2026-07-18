# Pediatric ECG Challenge - Level 1

A 6-question branching quiz game. Answers and confidence ratings are scored
and stored in Firebase (Firestore), with Google Sign-In for identifying
users (Firebase Auth).

## How it works

- **Question pool**: 6 unique questions (`question1.html` ... `question6.html`).
  Each level attempt shows questions in a random order (no repeats within
  an attempt, since the pool size equals the max questions shown).
- **Scoring**: correct+low confidence = +1, correct+high confidence = +2,
  incorrect+low confidence = 0, incorrect+high confidence = -2.
- **Explanations**: each question has 3 explanation pages
  (`explanationN_correct.html`, `explanationN_incorrect_unsure.html`,
  `explanationN_incorrect_confident.html`), shown on a separate page after
  submitting so the correct answer never appears on the question page
  itself. The "confidently wrong" version includes a fuller, more
  didactic explanation.
- **Completion check**: happens after every single answer, not just at a
  fixed question count. As soon as score >= 5, the user is sent to
  `complete.html`, even if that happens on question 2 or 3. If the user
  reaches 6 answered questions without hitting 5 points, they're sent to
  `failed.html` and the failure is recorded in Firestore.
- **Retry**: `failed.html` lets the user retry (resets score/progress and
  starts a fresh random question order), view a placeholder didactic page,
  or go to a placeholder main menu.

## Firestore data model

```
users/{uid}/levels/level1                (document)
  score: number
  answeredQuestions: number[]             e.g. [3, 1, 5]
  status: "in-progress" | "complete" | "failed"
  attempt: number                         increments on each retry
  updatedAt / completedAt / failedAt: timestamps

users/{uid}/levels/level1/history/{auto}  (subcollection - one per answer)
  questionId, isCorrect, confidence, delta, scoreAfter, timestamp

users/{uid}/levels/level1/failures/{auto} (subcollection - one per failed attempt)
  finalScore, answeredQuestions, timestamp
```

## Firebase project setup

The included `js/firebase-config.js` reuses the sample project config
(`playground-bdfdb`) that appears in your `playground_login.html` file,
so everything works out of the box for testing. Before using this for
real:

1. **Use your own Firebase project** (recommended) - create one at
   https://console.firebase.google.com, enable **Authentication -> Google**
   sign-in provider, enable **Firestore Database**, and paste your own
   config object into `js/firebase-config.js`.
2. **Add Firestore security rules** so users can only read/write their own
   progress:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Add your local/hosting domain** to Firebase Auth's authorized domains
   list (Authentication -> Settings -> Authorized domains), or Google
   Sign-In's popup will fail.

## Running locally

Because the pages use ES module `<script type="module">` imports, you
can't just double-click the HTML files (browsers block module imports
over the `file://` protocol). Serve the folder with any static server, e.g.:

```bash
cd pedecg-game
python3 -m http.server 8000
```

Then open http://localhost:8000/index.html.

## Editing the questions

All question/answer/explanation content was generated from
`generate.py` (a build-time script - it is not shipped/used at runtime).
To change content, edit the `QUESTIONS` dictionary in `generate.py` and
re-run `python3 generate.py` to regenerate the 24 question/explanation
HTML files, or just hand-edit the individual HTML files directly since
they're fully independent static pages.

## Known simplifications / assumptions made

- Score has no floor - it can go negative.
- The 6 questions are treated as a single fixed pool for "level1"; there's
  no support yet for multiple levels (the main menu page is a placeholder).
- Placeholder pediatric ECG content is approximate for demo purposes -
  verify clinical accuracy before real use.
