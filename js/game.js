import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, increment, arrayUnion,
  serverTimestamp, collection, addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export const LEVEL_ID = "level1";
export const TOTAL_QUESTIONS = 6;
export const POINTS_TO_PASS = 5; // starting target; +1 for every wrong answer
export const MAX_LIVES = 4;

// Redirects to the login page if nobody is signed in; otherwise calls
// onReady(user). Use this at the top of every page except index.html.
export function requireAuth(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      onReady(user);
    }
  });
}

function levelDocRef(uid) {
  return doc(db, "users", uid, "levels", LEVEL_ID);
}

// Resets/creates the per-user level progress document. Called when
// starting the level for the first time and when retrying after a fail.
// Uses merge:true so aggregate stats (timesCompleted, lastCompletedAt)
// survive being reset for a fresh attempt.
export async function initLevelState(uid) {
  const ref = levelDocRef(uid);
  const snap = await getDoc(ref);
  const attempt = snap.exists() ? (snap.data().attempt || 0) + 1 : 1;
  await setDoc(ref, {
    score: 0,
    lives: MAX_LIVES,
    pointsToPass: POINTS_TO_PASS,
    answeredQuestions: [],
    status: "in-progress",
    attempt,
    updatedAt: serverTimestamp(),
    lastAttemptAt: serverTimestamp()
  }, { merge: true });
  // Note: merge:true means fields not listed above (like visitedDidactic)
  // survive a reset/retry untouched.
  return ref;
}

export async function getLevelState(uid) {
  const snap = await getDoc(levelDocRef(uid));
  return snap.exists() ? snap.data() : null;
}

// Marks that the user has opened Level 1's didactic/review page at least
// once. Uses merge:true + setDoc so it works even if the user has never
// started the level yet (no existing level doc). Drives the "Resume
// Didactic" column on the main menu.
export async function markDidacticVisited(uid) {
  const ref = levelDocRef(uid);
  await setDoc(ref, { visitedDidactic: true, updatedAt: serverTimestamp() }, { merge: true });
}

// Scoring rule:
//   correct   + low confidence  = +1
//   correct   + high confidence = +2
//   incorrect + low confidence  =  0
//   incorrect + high confidence = -2
export function scoreDelta(isCorrect, confidence) {
  if (isCorrect && confidence === "low") return 1;
  if (isCorrect && confidence === "high") return 2;
  if (!isCorrect && confidence === "low") return 0;
  return -2;
}

// Level 1 scoring rule (lives-based):
//   correct + low confidence  = +1 point
//   correct + high confidence = +2 points
//   incorrect (any confidence) = 0 points, but costs 1 life and raises
//     the points needed to pass the level by 1
function livesAwareDelta(isCorrect, confidence) {
  if (isCorrect) return confidence === "high" ? 2 : 1;
  return 0;
}

// Records one answer: updates score/lives/pointsToPass, marks the
// question as answered, and appends a history entry. Returns the point
// delta, new score, new lives remaining, and new points-to-pass target.
export async function recordAnswer(uid, questionId, isCorrect, confidence) {
  const ref = levelDocRef(uid);
  const delta = livesAwareDelta(isCorrect, confidence);
  const livesDelta = isCorrect ? 0 : -1;
  const pointsToPassDelta = isCorrect ? 0 : 1;

  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : { score: 0, lives: MAX_LIVES, pointsToPass: POINTS_TO_PASS };
  const newScore = (data.score || 0) + delta;
  const newLives = Math.max(0, (typeof data.lives === "number" ? data.lives : MAX_LIVES) + livesDelta);
  const newPointsToPass = (data.pointsToPass || POINTS_TO_PASS) + pointsToPassDelta;

  await updateDoc(ref, {
    score: increment(delta),
    lives: increment(livesDelta),
    pointsToPass: increment(pointsToPassDelta),
    answeredQuestions: arrayUnion(questionId),
    updatedAt: serverTimestamp()
  });

  await addDoc(collection(ref, "history"), {
    questionId,
    isCorrect,
    confidence,
    delta,
    livesDelta,
    scoreAfter: newScore,
    livesAfter: newLives,
    pointsToPassAfter: newPointsToPass,
    timestamp: serverTimestamp()
  });

  return { delta, newScore, newLives, newPointsToPass };
}

// Which of the 3 explanation pages to show for a given question/outcome.
export function explanationPageFor(questionId, isCorrect, confidence) {
  if (isCorrect) return `explanation${questionId}_correct.html`;
  if (confidence === "low") return `explanation${questionId}_incorrect_unsure.html`;
  return `explanation${questionId}_incorrect_confident.html`;
}

// Call this after the user clicks "Continue" on an explanation page.
// Checks for level completion / failure, otherwise picks the next
// question at random from the ones not yet answered this attempt.
export async function determineNextDestination(uid) {
  const ref = levelDocRef(uid);
  const snap = await getDoc(ref);
  const data = snap.data();
  const score = data.score || 0;
  const lives = typeof data.lives === "number" ? data.lives : MAX_LIVES;
  const pointsToPass = data.pointsToPass || POINTS_TO_PASS;
  let answered = data.answeredQuestions || [];

  if (score >= pointsToPass) {
    await updateDoc(ref, {
      status: "complete",
      completedAt: serverTimestamp(),
      lastCompletedAt: serverTimestamp(),
      timesCompleted: increment(1)
    });
    return "level1-complete.html";
  }

  if (lives <= 0) {
    await updateDoc(ref, { status: "failed", failedAt: serverTimestamp() });
    await addDoc(collection(ref, "failures"), {
      finalScore: score,
      pointsToPass,
      answeredQuestions: answered,
      timestamp: serverTimestamp()
    });
    return "level1-failed.html";
  }

  // The level no longer ends after a fixed number of questions - it only
  // ends by reaching the (rising) points target or running out of lives.
  // Once all 6 written questions have been used in this attempt, reshuffle:
  // start a fresh cycle through all 6, avoiding an immediate repeat of the
  // question the user just answered.
  let remaining = [];
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    if (!answered.includes(i)) remaining.push(i);
  }
  let excludeId = null;
  if (remaining.length === 0) {
    excludeId = answered[answered.length - 1];
    answered = [];
    await updateDoc(ref, { answeredQuestions: [] });
    remaining = [];
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) remaining.push(i);
  }

  let pool = remaining;
  if (excludeId != null && pool.length > 1) {
    pool = pool.filter((id) => id !== excludeId);
  }
  const nextId = pool[Math.floor(Math.random() * pool.length)];
  return `level1-question${nextId}.html`;
}

// Picks the first question of a fresh attempt uniformly at random.
export function pickRandomFirstQuestion() {
  const id = Math.floor(Math.random() * TOTAL_QUESTIONS) + 1;
  return `level1-question${id}.html`;
}

// ---------------------------------------------------------------------
// Generic, level-aware versions of the above, used by Level 2 and any
// future levels. Level 1's pages keep using the level-1-only functions
// above unchanged, so nothing here can affect Level 1's behavior.
// ---------------------------------------------------------------------

function levelDocRefFor(uid, levelId) {
  return doc(db, "users", uid, "levels", levelId);
}

// `config.useLives` opts a level into the lives system (lives + a rising
// pointsToPass target), the same rules Level 1 uses. Omit it (or leave it
// false) for levels that just track a plain score.
export async function initLevelStateFor(uid, levelId, config = {}) {
  const ref = levelDocRefFor(uid, levelId);
  const snap = await getDoc(ref);
  const attempt = snap.exists() ? (snap.data().attempt || 0) + 1 : 1;
  const data = {
    score: 0,
    answeredQuestions: [],
    status: "in-progress",
    attempt,
    updatedAt: serverTimestamp(),
    lastAttemptAt: serverTimestamp()
  };
  if (config.useLives) {
    data.lives = config.maxLives || MAX_LIVES;
    data.pointsToPass = config.pointsToPass || POINTS_TO_PASS;
  }
  await setDoc(ref, data, { merge: true });
  return ref;
}

export async function getLevelStateFor(uid, levelId) {
  const snap = await getDoc(levelDocRefFor(uid, levelId));
  return snap.exists() ? snap.data() : null;
}

// Generic version of markDidacticVisited, for Level 2 and beyond.
export async function markDidacticVisitedFor(uid, levelId) {
  const ref = levelDocRefFor(uid, levelId);
  await setDoc(ref, { visitedDidactic: true, updatedAt: serverTimestamp() }, { merge: true });
}

// Records a multiple-choice answer.
//
// By default this uses the plain confidence-weighted scoring rule
// (scoreDelta above), where a wrong answer can subtract points.
//
// Pass `{ useLives: true }` to instead use Level 1's lives-aware rule
// (livesAwareDelta above): a wrong answer costs 0 points but costs 1
// life and raises the level's pointsToPass target by 1, rather than
// subtracting from the score.
export async function recordAnswerFor(uid, levelId, questionId, isCorrect, confidence, config = {}) {
  const ref = levelDocRefFor(uid, levelId);
  const useLives = !!config.useLives;
  const delta = useLives ? livesAwareDelta(isCorrect, confidence) : scoreDelta(isCorrect, confidence);
  const livesDelta = useLives && !isCorrect ? -1 : 0;
  const pointsToPassDelta = useLives && !isCorrect ? 1 : 0;

  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : { score: 0, lives: MAX_LIVES, pointsToPass: POINTS_TO_PASS };
  const newScore = (data.score || 0) + delta;

  const updatePayload = {
    score: increment(delta),
    answeredQuestions: arrayUnion(questionId),
    updatedAt: serverTimestamp()
  };

  let newLives, newPointsToPass;
  if (useLives) {
    newLives = Math.max(0, (typeof data.lives === "number" ? data.lives : MAX_LIVES) + livesDelta);
    newPointsToPass = (data.pointsToPass || POINTS_TO_PASS) + pointsToPassDelta;
    updatePayload.lives = increment(livesDelta);
    updatePayload.pointsToPass = increment(pointsToPassDelta);
  }

  await updateDoc(ref, updatePayload);

  await addDoc(collection(ref, "history"), {
    questionId,
    questionType: "mc",
    isCorrect,
    confidence,
    delta,
    scoreAfter: newScore,
    ...(useLives ? { livesDelta, livesAfter: newLives, pointsToPassAfter: newPointsToPass } : {}),
    timestamp: serverTimestamp()
  });

  return useLives ? { delta, newScore, newLives, newPointsToPass } : { delta, newScore };
}

// Records a free-text answer. Unlike MC scoring, the point value (delta)
// is chosen directly by the user via the right/partial/wrong buttons on
// the grading page - confidence has NO effect on the score here. The
// confidence rating, the raw answer, and the computer's predicted
// correctness are all still logged for later analysis.
export async function recordFreetextAnswerFor(uid, levelId, questionId, delta, meta) {
  const ref = levelDocRefFor(uid, levelId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : { score: 0 };
  const newScore = (data.score || 0) + delta;

  await updateDoc(ref, {
    score: increment(delta),
    answeredQuestions: arrayUnion(questionId),
    updatedAt: serverTimestamp()
  });

  await addDoc(collection(ref, "history"), {
    questionId,
    questionType: "freetext",
    delta,
    scoreAfter: newScore,
    confidence: meta.confidence,
    rawAnswer: meta.rawAnswer,
    predictedCorrectness: meta.predicted,
    userVerdict: meta.verdict,
    timestamp: serverTimestamp()
  });

  return { delta, newScore };
}

// Which explanation page to show for a given MC question/outcome, under
// an arbitrary page prefix (e.g. "level2-").
export function explanationPageForLevel(pagePrefix, questionId, isCorrect, confidence) {
  if (isCorrect) return `${pagePrefix}explanation${questionId}_correct.html`;
  if (confidence === "low") return `${pagePrefix}explanation${questionId}_incorrect_unsure.html`;
  return `${pagePrefix}explanation${questionId}_incorrect_confident.html`;
}

// Generic completion/failure check + next-question picker, parameterized
// per level. config: { levelId, totalQuestions, pointsToPass,
// maxQuestions, pagePrefix, useLives, maxLives }
//
// When config.useLives is set, pointsToPass is read from Firestore (it
// rises by 1 each time a wrong MC answer is recorded via recordAnswerFor),
// and running out of lives is the ONLY failure condition - there's no cap
// on question attempts. Once every question in the pool has been used in
// this attempt, the pool reshuffles (see below), so the user can keep
// attempting questions for as long as they still have lives left.
//
// For levels that don't use lives, `maxQuestions` is still used as a
// failure condition once that many questions have been answered without
// reaching the target (kept for any level using the plain
// confidence-weighted scoring rule).
export async function determineNextDestinationFor(uid, config) {
  const { levelId, totalQuestions, maxQuestions, pagePrefix, useLives, maxLives } = config;
  const ref = levelDocRefFor(uid, levelId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const score = data.score || 0;
  const pointsToPass = useLives ? (data.pointsToPass || config.pointsToPass) : config.pointsToPass;
  const lives = useLives ? (typeof data.lives === "number" ? data.lives : (maxLives || MAX_LIVES)) : null;
  let answered = data.answeredQuestions || [];

  if (score >= pointsToPass) {
    await updateDoc(ref, {
      status: "complete",
      completedAt: serverTimestamp(),
      lastCompletedAt: serverTimestamp(),
      timesCompleted: increment(1)
    });
    return `${pagePrefix}complete.html`;
  }

  const outOfLives = useLives && lives <= 0;
  const outOfQuestions = !useLives && answered.length >= maxQuestions;
  if (outOfLives || outOfQuestions) {
    await updateDoc(ref, { status: "failed", failedAt: serverTimestamp() });
    await addDoc(collection(ref, "failures"), {
      finalScore: score,
      pointsToPass,
      answeredQuestions: answered,
      timestamp: serverTimestamp()
    });
    return `${pagePrefix}failed.html`;
  }

  // Once all `totalQuestions` have been used in this attempt, reshuffle:
  // start a fresh cycle through all of them, avoiding an immediate repeat
  // of the question the user just answered.
  let remaining = [];
  for (let i = 1; i <= totalQuestions; i++) {
    if (!answered.includes(i)) remaining.push(i);
  }
  let excludeId = null;
  if (remaining.length === 0) {
    excludeId = answered[answered.length - 1];
    answered = [];
    await updateDoc(ref, { answeredQuestions: [] });
    remaining = [];
    for (let i = 1; i <= totalQuestions; i++) remaining.push(i);
  }

  let pool = remaining;
  if (excludeId != null && pool.length > 1) {
    pool = pool.filter((id) => id !== excludeId);
  }
  const nextId = pool[Math.floor(Math.random() * pool.length)];
  return `${pagePrefix}question${nextId}.html`;
}

export function pickRandomFirstQuestionFor(config) {
  const id = Math.floor(Math.random() * config.totalQuestions) + 1;
  return `${config.pagePrefix}question${id}.html`;
}

export { auth, signOut };
