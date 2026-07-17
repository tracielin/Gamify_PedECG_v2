import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, updateDoc, increment, arrayUnion,
  serverTimestamp, collection, addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export const LEVEL_ID = "level1";
export const TOTAL_QUESTIONS = 6;
export const POINTS_TO_PASS = 5;
export const MAX_QUESTIONS = 6;

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
export async function initLevelState(uid) {
  const ref = levelDocRef(uid);
  const snap = await getDoc(ref);
  const attempt = snap.exists() ? (snap.data().attempt || 0) + 1 : 1;
  await setDoc(ref, {
    score: 0,
    answeredQuestions: [],
    status: "in-progress",
    attempt,
    updatedAt: serverTimestamp()
  });
  return ref;
}

export async function getLevelState(uid) {
  const snap = await getDoc(levelDocRef(uid));
  return snap.exists() ? snap.data() : null;
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

// Records one answer: updates score, marks the question as answered,
// and appends a history entry. Returns the point delta and new score.
export async function recordAnswer(uid, questionId, isCorrect, confidence) {
  const ref = levelDocRef(uid);
  const delta = scoreDelta(isCorrect, confidence);
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
    isCorrect,
    confidence,
    delta,
    scoreAfter: newScore,
    timestamp: serverTimestamp()
  });

  return { delta, newScore };
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
  const answered = data.answeredQuestions || [];

  if (score >= POINTS_TO_PASS) {
    await updateDoc(ref, { status: "complete", completedAt: serverTimestamp() });
    return "complete.html";
  }

  if (answered.length >= MAX_QUESTIONS) {
    await updateDoc(ref, { status: "failed", failedAt: serverTimestamp() });
    await addDoc(collection(ref, "failures"), {
      finalScore: score,
      answeredQuestions: answered,
      timestamp: serverTimestamp()
    });
    return "failed.html";
  }

  const remaining = [];
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    if (!answered.includes(i)) remaining.push(i);
  }
  const nextId = remaining[Math.floor(Math.random() * remaining.length)];
  return `question${nextId}.html`;
}

// Picks the first question of a fresh attempt uniformly at random.
export function pickRandomFirstQuestion() {
  const id = Math.floor(Math.random() * TOTAL_QUESTIONS) + 1;
  return `question${id}.html`;
}

export { auth, signOut };
