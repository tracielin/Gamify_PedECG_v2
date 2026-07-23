// A deliberately simple, fully client-side free-text grader. This is NOT
// a general NLP/semantic similarity engine - it normalizes the answer,
// looks for configured "accepted" and "wrong" terms/phrases (tolerating
// typos via edit distance), highlights whatever it found, and produces a
// first-pass predicted verdict. It is designed to be reviewed and
// overridden by the user on the grading page, not trusted blindly - see
// gradeFreetext()'s returned `predicted` value.

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[.,!?;:()'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Allows more typo tolerance for longer words, near-exact match for short
// ones (so "high"/"low"-length words don't fuzzy-match each other).
function fuzzyWordMatch(word, target) {
  if (!word || !target) return false;
  if (word === target) return true;
  const maxDist = target.length <= 4 ? 1 : target.length <= 8 ? 2 : 3;
  return levenshtein(word, target) <= maxDist;
}

// Looks for a (possibly multi-word) phrase inside the answer's word list,
// matching each phrase word against a fuzzy-matched run of answer words.
// Returns the position/length of the first match found, or null.
function phraseMatch(answerWords, phrase) {
  const phraseWords = normalize(phrase).split(" ").filter(Boolean);
  if (phraseWords.length === 0) return null;

  for (let i = 0; i <= answerWords.length - phraseWords.length; i++) {
    let allMatch = true;
    for (let j = 0; j < phraseWords.length; j++) {
      if (!fuzzyWordMatch(answerWords[i + j], phraseWords[j])) {
        allMatch = false;
        break;
      }
    }
    if (allMatch) return { start: i, length: phraseWords.length };
  }
  return null;
}

// Grades a free-text answer against configured accepted/wrong terms.
//   rawAnswer: the user's typed text, exactly as entered
//   acceptedTerms: array of phrases indicating a correct answer
//   wrongTerms: array of phrases indicating a known misconception
//
// Returns:
//   predicted: "correct" | "incorrect" | "unsure"
//   html: the user's original words re-rendered with matched spans
//         highlighted (green = matched an accepted term, red = matched a
//         wrong term), safe to insert with innerHTML
export function gradeFreetext(rawAnswer, acceptedTerms, wrongTerms) {
  const words = rawAnswer.trim().split(/\s+/).filter(Boolean);
  const normWords = words.map(normalize);
  const tags = new Array(words.length).fill(null); // 'accepted' | 'wrong' | null

  let matchedAccepted = false;
  let matchedWrong = false;

  for (const phrase of acceptedTerms) {
    const m = phraseMatch(normWords, phrase);
    if (m) {
      matchedAccepted = true;
      for (let k = 0; k < m.length; k++) tags[m.start + k] = "accepted";
    }
  }

  for (const phrase of wrongTerms) {
    const m = phraseMatch(normWords, phrase);
    if (m) {
      matchedWrong = true;
      for (let k = 0; k < m.length; k++) {
        if (tags[m.start + k] !== "accepted") tags[m.start + k] = "wrong";
      }
    }
  }

  let predicted;
  if (matchedAccepted && !matchedWrong) predicted = "correct";
  else if (matchedWrong && !matchedAccepted) predicted = "incorrect";
  else predicted = "unsure";

  const html = words
    .map((w, i) => {
      const esc = w
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      if (tags[i] === "accepted") return `<span class="match-accepted">${esc}</span>`;
      if (tags[i] === "wrong") return `<span class="match-wrong">${esc}</span>`;
      return esc;
    })
    .join(" ");

  return { predicted, html };
}
