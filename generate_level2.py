import os

OUT = os.path.dirname(os.path.abspath(__file__))

LEVEL_ID = "level2"
PAGE_PREFIX = "level2-"
TOTAL_QUESTIONS = 6
POINTS_TO_PASS = 5
MAX_QUESTIONS = 6
SCORE_ANIM_KEY = "pedecgScoreAnimLevel2"
FREETEXT_KEY = "pedecgFreetextLevel2"

ECG_IMAGE_BLOCK = """<div class="ecg-panel">
<img src="images/ecg-placeholder.svg" alt="ECG strip">
<p class="ecg-caption">Placeholder ECG strip - replace with a real strip image.</p>
</div>"""

SIDEBAR_HTML = """<div class="sidebar">
<div class="sidebar-image-slot" id="level-completion-slot">
<img src="images/icon-level-completion.svg" alt="Level completion icon" class="sidebar-image" id="level-completion-icon">
</div>
<div class="progress-track">
<div class="progress-half progress-half-positive">
<div class="progress-fill progress-fill-positive" id="progress-fill-positive"></div>
</div>
<div class="progress-baseline"></div>
<div class="progress-half progress-half-negative">
<div class="progress-fill progress-fill-negative" id="progress-fill-negative"></div>
</div>
<div class="progress-marker" id="progress-marker">
<img src="images/icon-character-progress-marker.svg" alt="Progress character">
</div>
</div>
<p class="progress-label">Level 2 Progress</p>
<div class="sidebar-section sidebar-placeholder">
<p>More metrics &amp; menu coming soon</p>
</div>
</div>"""

SIDEBAR_RIGHT_HTML = """<div class="sidebar sidebar-right">
<button id="ref1-btn" class="btn secondary sidebar-ref-btn" type="button">Normal Ranges</button>
<button id="ref2-btn" class="btn secondary sidebar-ref-btn" type="button">Rhythm Tips</button>
<button id="signout-btn" class="btn secondary sidebar-signout" type="button">Sign out</button>
</div>"""

POPOVER_HTML = """<div class="popover-overlay" id="ref1-overlay">
<div class="popover-box">
<button class="popover-close" id="ref1-close" type="button" aria-label="Close">&times;</button>
<h3>Normal Ranges Reference</h3>
<p>Placeholder reference content - replace with your real quick-reference material (e.g. normal heart rate, PR interval, QRS duration, and QTc ranges by age).</p>
</div>
</div>
<div class="popover-overlay" id="ref2-overlay">
<div class="popover-box">
<button class="popover-close" id="ref2-close" type="button" aria-label="Close">&times;</button>
<h3>Rhythm Recognition Tips</h3>
<p>Placeholder reference content - replace with your real quick tips (e.g. how to distinguish sinus tachycardia from SVT, or Mobitz Type I from Type II).</p>
</div>
</div>"""

SIGNOUT_SCRIPT = """document.getElementById("signout-btn").addEventListener("click", () => {{
  signOut(auth).then(() => {{ window.location.href = "index.html"; }});
}});"""

POPOVER_SCRIPT = """setupPopover("ref1-btn", "ref1-overlay");
setupPopover("ref2-btn", "ref2-overlay");"""

# ---------------------------------------------------------------------------
# CONTENT - placeholder pediatric ECG content, mirroring Level 1's style.
# Edit freely; re-run this script to regenerate the affected HTML files.
# ---------------------------------------------------------------------------

MC_QUESTIONS = {
    1: {
        "text": "Based on the ECG strip shown, upright P waves precede every QRS complex at a regular rate around 150 bpm. What is the most likely rhythm?",
        "choices": ["Sinus tachycardia", "Supraventricular tachycardia (SVT)", "Atrial flutter"],
        "correct": 0,
        "correct_expl": "Correct. A normal P wave before every QRS complex, even at an elevated rate, points to a sinus mechanism rather than SVT or flutter.",
        "unsure_expl": "Not quite. The key clue is the upright P wave preceding every QRS - that's the hallmark of a sinus rhythm, even though the rate is fast.",
        "confident_expl": "A fast rate alone doesn't mean SVT. The single most important discriminator is whether a normal P wave precedes every QRS - here it does, which points to sinus tachycardia rather than SVT (which typically shows an abnormal, retrograde, or absent P wave) or atrial flutter (which shows a sawtooth baseline, not discrete P waves).",
    },
    2: {
        "text": "On the strip shown, the QRS complexes are narrow and machine-regular with no discernible P waves. What does this most likely represent?",
        "choices": ["Sinus arrhythmia", "Supraventricular tachycardia (SVT)", "Ventricular tachycardia"],
        "correct": 1,
        "correct_expl": "Correct. A narrow-complex, perfectly regular rhythm with no visible P waves is the classic pattern for SVT.",
        "unsure_expl": "Not quite. Sinus rhythms normally show visible P waves and some rate variability; the absence of P waves with a machine-regular rate points to SVT instead.",
        "confident_expl": "Sinus arrhythmia would show visible P waves and natural rate variability, which isn't present here. Ventricular tachycardia would show a wide QRS, not narrow. A narrow-complex, machine-regular rhythm without visible P waves is the classic SVT pattern.",
    },
    3: {
        "text": "The rhythm strip shown demonstrates a sawtooth baseline pattern between QRS complexes. What rhythm is this classically associated with?",
        "choices": ["Atrial flutter", "Atrial fibrillation", "First-degree AV block"],
        "correct": 0,
        "correct_expl": "Correct. The sawtooth ('picket fence') baseline pattern between QRS complexes is the classic description of atrial flutter waves.",
        "unsure_expl": "Not quite. Atrial fibrillation shows an irregularly irregular, chaotic baseline rather than a repeating sawtooth pattern - the sawtooth appearance specifically describes flutter waves.",
        "confident_expl": "Atrial fibrillation produces a chaotic, irregularly irregular baseline without a repeating pattern, and first-degree AV block just describes a prolonged but otherwise normal PR interval - neither produces a sawtooth baseline. The repeating sawtooth ('picket fence') pattern between QRS complexes is specifically the textbook description of atrial flutter waves.",
    },
}

FREETEXT_QUESTIONS = {
    4: {
        "text": "Describe the rhythm shown on this ECG strip, including your interpretation of the P waves, PR interval, and QRS morphology.",
        "accepted": ["sinus tachycardia", "sinus tach", "normal p wave", "p wave before every qrs", "elevated heart rate"],
        "wrong": ["svt", "supraventricular tachycardia", "ventricular tachycardia", "v tach", "atrial fibrillation", "afib", "atrial flutter"],
        "gold_standard": "A complete answer should identify a regular rhythm with a normal P wave preceding every QRS complex, a normal PR interval, and note that the elevated rate is consistent with sinus tachycardia rather than a primary atrial or ventricular arrhythmia.",
    },
    5: {
        "text": "What is the most likely underlying diagnosis suggested by a short PR interval and a slurred upstroke into the QRS complex, and why?",
        "accepted": ["wolff-parkinson-white", "wpw", "delta wave", "pre-excitation", "short pr"],
        "wrong": ["first-degree av block", "long pr interval", "normal ecg", "bundle branch block", "mobitz"],
        "gold_standard": "A complete answer should note the short PR interval and slurred upstroke (delta wave) into the QRS complex, and identify Wolff-Parkinson-White (ventricular pre-excitation) as the underlying cause, since an accessory pathway allows early ventricular activation.",
    },
    6: {
        "text": "A rhythm strip shows progressively lengthening PR intervals until a QRS complex is dropped, then the pattern resets. Describe this finding and name the type of block.",
        "accepted": ["mobitz type 1", "mobitz i", "wenckebach", "progressive pr lengthening", "av block"],
        "wrong": ["mobitz type 2", "mobitz ii", "third-degree", "complete heart block", "fixed pr interval"],
        "gold_standard": "A complete answer should describe progressive PR interval lengthening prior to a dropped QRS beat, with the cycle then resetting, and correctly name this as Mobitz Type I (Wenckebach) second-degree AV block.",
    },
}


def esc(s):
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


MC_QUESTION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Level 2 - Question {n}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
""" + SIDEBAR_HTML + """
<div class="content">
<div class="card card-wide">
<p class="score-display" id="score-display"></p>
<div class="gameplay-grid">
""" + ECG_IMAGE_BLOCK + """
<div class="question-panel">
<h2>Question</h2>
<p>{text}</p>
<form id="answer-form">
<div class="choices">
<label><input type="radio" name="choice" value="0" required> {choice0}</label>
<label><input type="radio" name="choice" value="1"> {choice1}</label>
<label><input type="radio" name="choice" value="2"> {choice2}</label>
</div>
<h3>How confident are you in this answer?</h3>
<div class="choices choices-horizontal">
<label><input type="radio" name="confidence" value="low" required> Low confidence</label>
<label><input type="radio" name="confidence" value="high"> High confidence</label>
</div>
<button type="submit" class="btn">Submit answer</button>
</form>
</div>
</div>
</div>
</div>
""" + SIDEBAR_RIGHT_HTML + """
""" + POPOVER_HTML + """
<script type="module">
import {{ requireAuth, getLevelStateFor, recordAnswerFor, explanationPageForLevel, auth, signOut }} from "./js/game.js";
import {{ setProgressBar }} from "./js/sidebar.js";
import {{ setupPopover }} from "./js/popover.js";

""" + SIGNOUT_SCRIPT + """
""" + POPOVER_SCRIPT + """

const LEVEL_ID = "{level_id}";
const PAGE_PREFIX = "{page_prefix}";
const QUESTION_ID = {n};
const CORRECT_INDEX = {correct};
const SCORE_ANIM_KEY = "{score_anim_key}";

requireAuth(async (user) => {{
  const state = await getLevelStateFor(user.uid, LEVEL_ID);
  const score = state ? state.score : 0;
  document.getElementById("score-display").textContent =
    state ? `Current score: ${{state.score}}` : "";
  setProgressBar(score);

  document.getElementById("answer-form").addEventListener("submit", async (e) => {{
    e.preventDefault();
    const choice = parseInt(document.querySelector('input[name="choice"]:checked').value, 10);
    const confidence = document.querySelector('input[name="confidence"]:checked').value;
    const isCorrect = choice === CORRECT_INDEX;
    const {{ delta, newScore }} = await recordAnswerFor(user.uid, LEVEL_ID, QUESTION_ID, isCorrect, confidence);
    sessionStorage.setItem(SCORE_ANIM_KEY, JSON.stringify({{ from: newScore - delta, to: newScore }}));
    window.location.href = explanationPageForLevel(PAGE_PREFIX, QUESTION_ID, isCorrect, confidence);
  }});
}});
</script>
</body>
</html>
"""

MC_EXPLANATION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{heading} - Level 2 Question {n}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
""" + SIDEBAR_HTML + """
<div class="content">
<div class="card card-wide">
<p class="score-display" id="score-display"></p>
<div class="gameplay-grid">
""" + ECG_IMAGE_BLOCK + """
<div class="question-panel">
<h2>{heading}</h2>
<p class="correct-answer">Correct answer: {correct_choice}</p>
<p>{explanation}</p>
<button id="continue-btn" class="btn">Continue</button>
</div>
</div>
</div>
</div>
""" + SIDEBAR_RIGHT_HTML + """
""" + POPOVER_HTML + """
<script type="module">
import {{ requireAuth, getLevelStateFor, determineNextDestinationFor, auth, signOut }} from "./js/game.js";
import {{ setProgressBar, animateProgressBar }} from "./js/sidebar.js";
import {{ setupPopover }} from "./js/popover.js";

""" + SIGNOUT_SCRIPT + """
""" + POPOVER_SCRIPT + """

const LEVEL_CONFIG = {{
  levelId: "{level_id}",
  totalQuestions: {total_questions},
  pointsToPass: {points_to_pass},
  maxQuestions: {max_questions},
  pagePrefix: "{page_prefix}",
}};
const SCORE_ANIM_KEY = "{score_anim_key}";

requireAuth(async (user) => {{
  const state = await getLevelStateFor(user.uid, LEVEL_CONFIG.levelId);
  const score = state ? state.score : 0;
  document.getElementById("score-display").textContent =
    state ? `Current score: ${{state.score}}` : "";

  const animRaw = sessionStorage.getItem(SCORE_ANIM_KEY);
  if (animRaw) {{
    sessionStorage.removeItem(SCORE_ANIM_KEY);
    const {{ from, to }} = JSON.parse(animRaw);
    animateProgressBar(from, to);
  }} else {{
    setProgressBar(score);
  }}

  document.getElementById("continue-btn").addEventListener("click", async () => {{
    const next = await determineNextDestinationFor(user.uid, LEVEL_CONFIG);
    window.location.href = next;
  }});
}});
</script>
</body>
</html>
"""

FREETEXT_QUESTION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Level 2 - Question {n}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
""" + SIDEBAR_HTML + """
<div class="content">
<div class="card card-wide">
<p class="score-display" id="score-display"></p>
<div class="gameplay-grid">
""" + ECG_IMAGE_BLOCK + """
<div class="question-panel">
<h2>Question</h2>
<p>{text}</p>
<form id="answer-form">
<textarea id="freetext-answer" class="freetext-answer" placeholder="Type your answer here..." required></textarea>
<h3>How confident are you in this answer?</h3>
<div class="choices choices-horizontal">
<label><input type="radio" name="confidence" value="low" required> Low confidence</label>
<label><input type="radio" name="confidence" value="high"> High confidence</label>
</div>
<button type="submit" class="btn">Submit answer</button>
</form>
</div>
</div>
</div>
</div>
""" + SIDEBAR_RIGHT_HTML + """
""" + POPOVER_HTML + """
<script type="module">
import {{ requireAuth, getLevelStateFor, auth, signOut }} from "./js/game.js";
import {{ setProgressBar }} from "./js/sidebar.js";
import {{ setupPopover }} from "./js/popover.js";
import {{ gradeFreetext }} from "./js/freetext-grading.js";

""" + SIGNOUT_SCRIPT + """
""" + POPOVER_SCRIPT + """

const LEVEL_ID = "{level_id}";
const QUESTION_ID = {n};
const ACCEPTED_TERMS = {accepted_terms};
const WRONG_TERMS = {wrong_terms};
const FREETEXT_KEY = "{freetext_key}";

requireAuth(async (user) => {{
  const state = await getLevelStateFor(user.uid, LEVEL_ID);
  const score = state ? state.score : 0;
  document.getElementById("score-display").textContent =
    state ? `Current score: ${{state.score}}` : "";
  setProgressBar(score);

  document.getElementById("answer-form").addEventListener("submit", (e) => {{
    e.preventDefault();
    const rawAnswer = document.getElementById("freetext-answer").value;
    const confidence = document.querySelector('input[name="confidence"]:checked').value;
    const {{ predicted, html }} = gradeFreetext(rawAnswer, ACCEPTED_TERMS, WRONG_TERMS);
    sessionStorage.setItem(FREETEXT_KEY, JSON.stringify({{
      questionId: QUESTION_ID, rawAnswer, confidence, predicted, html
    }}));
    window.location.href = "level2-grading{n}.html";
  }});
}});
</script>
</body>
</html>
"""

GRADING_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Review - Level 2 Question {n}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
""" + SIDEBAR_HTML + """
<div class="content">
<div class="card card-wide">
<p class="score-display" id="score-display"></p>
<div class="gameplay-grid">
""" + ECG_IMAGE_BLOCK + """
<div class="question-panel">
<h2>Your answer</h2>
<div class="answer-review" id="answer-review"></div>
<div class="predicted-banner" id="predicted-banner"></div>
<div class="gold-standard-box">
<h3>A complete answer should include:</h3>
<p>{gold_standard}</p>
</div>
<p>How did you actually do?</p>
<div class="verdict-buttons">
<button class="btn" data-delta="1" data-verdict="right-and-complete" type="button">My answer was right and complete (+1 point)</button>
<button class="btn secondary" data-delta="0.5" data-verdict="partially-right" type="button">My answer was partially right (+0.5 point)</button>
<button class="btn secondary" data-delta="0" data-verdict="wrong" type="button">My answer was wrong (0 points)</button>
</div>
</div>
</div>
</div>
</div>
""" + SIDEBAR_RIGHT_HTML + """
""" + POPOVER_HTML + """
<script type="module">
import {{ requireAuth, getLevelStateFor, recordFreetextAnswerFor, determineNextDestinationFor, auth, signOut }} from "./js/game.js";
import {{ setProgressBar }} from "./js/sidebar.js";
import {{ setupPopover }} from "./js/popover.js";

""" + SIGNOUT_SCRIPT + """
""" + POPOVER_SCRIPT + """

const LEVEL_CONFIG = {{
  levelId: "{level_id}",
  totalQuestions: {total_questions},
  pointsToPass: {points_to_pass},
  maxQuestions: {max_questions},
  pagePrefix: "{page_prefix}",
}};
const QUESTION_ID = {n};
const FREETEXT_KEY = "{freetext_key}";

const PREDICTED_LABELS = {{
  correct: "Our system's first-pass guess: this looks CORRECT.",
  incorrect: "Our system's first-pass guess: this looks INCORRECT.",
  unsure: "Our system isn't confident either way - please judge for yourself.",
}};

requireAuth(async (user) => {{
  const state = await getLevelStateFor(user.uid, LEVEL_CONFIG.levelId);
  const score = state ? state.score : 0;
  document.getElementById("score-display").textContent =
    state ? `Current score: ${{state.score}}` : "";
  setProgressBar(score);

  const raw = sessionStorage.getItem(FREETEXT_KEY);
  let data = null;
  try {{
    data = raw ? JSON.parse(raw) : null;
  }} catch (err) {{
    data = null;
  }}
  if (!data || data.questionId !== QUESTION_ID) {{
    data = {{ rawAnswer: "", confidence: "low", predicted: "unsure", html: "<em>No answer was recorded for this question.</em>" }};
  }}
  sessionStorage.removeItem(FREETEXT_KEY);

  document.getElementById("answer-review").innerHTML = data.html || "<em>(no answer entered)</em>";

  const banner = document.getElementById("predicted-banner");
  const predicted = data.predicted || "unsure";
  banner.textContent = PREDICTED_LABELS[predicted] || PREDICTED_LABELS.unsure;
  banner.classList.add(`predicted-${{predicted}}`);

  document.querySelectorAll(".verdict-buttons button").forEach((btn) => {{
    btn.addEventListener("click", async () => {{
      const delta = parseFloat(btn.dataset.delta);
      const verdict = btn.dataset.verdict;
      await recordFreetextAnswerFor(user.uid, LEVEL_CONFIG.levelId, QUESTION_ID, delta, {{
        confidence: data.confidence,
        rawAnswer: data.rawAnswer,
        predicted,
        verdict,
      }});
      const next = await determineNextDestinationFor(user.uid, LEVEL_CONFIG);
      window.location.href = next;
    }});
  }});
}});
</script>
</body>
</html>
"""

MC_OUTCOMES = [
    ("correct", "correct_expl", "Correct!"),
    ("incorrect_unsure", "unsure_expl", "Not quite"),
    ("incorrect_confident", "confident_expl", "Not quite - let's dig into this one"),
]

# ---- Generate MC questions + explanation pages ----
for n, q in MC_QUESTIONS.items():
    with open(os.path.join(OUT, f"level2-question{n}.html"), "w") as f:
        f.write(MC_QUESTION_TEMPLATE.format(
            n=n,
            text=esc(q["text"]),
            choice0=esc(q["choices"][0]),
            choice1=esc(q["choices"][1]),
            choice2=esc(q["choices"][2]),
            correct=q["correct"],
            level_id=LEVEL_ID,
            page_prefix=PAGE_PREFIX,
            score_anim_key=SCORE_ANIM_KEY,
        ))

    correct_choice_text = esc(q["choices"][q["correct"]])
    for suffix, expl_key, heading in MC_OUTCOMES:
        with open(os.path.join(OUT, f"level2-explanation{n}_{suffix}.html"), "w") as f:
            f.write(MC_EXPLANATION_TEMPLATE.format(
                n=n,
                heading=heading,
                correct_choice=correct_choice_text,
                explanation=esc(q[expl_key]),
                level_id=LEVEL_ID,
                total_questions=TOTAL_QUESTIONS,
                points_to_pass=POINTS_TO_PASS,
                max_questions=MAX_QUESTIONS,
                page_prefix=PAGE_PREFIX,
                score_anim_key=SCORE_ANIM_KEY,
            ))

# ---- Generate free-text questions + grading pages ----
for n, q in FREETEXT_QUESTIONS.items():
    with open(os.path.join(OUT, f"level2-question{n}.html"), "w") as f:
        f.write(FREETEXT_QUESTION_TEMPLATE.format(
            n=n,
            text=esc(q["text"]),
            level_id=LEVEL_ID,
            accepted_terms=q["accepted"],
            wrong_terms=q["wrong"],
            freetext_key=FREETEXT_KEY,
        ))

    with open(os.path.join(OUT, f"level2-grading{n}.html"), "w") as f:
        f.write(GRADING_TEMPLATE.format(
            n=n,
            gold_standard=esc(q["gold_standard"]),
            level_id=LEVEL_ID,
            total_questions=TOTAL_QUESTIONS,
            points_to_pass=POINTS_TO_PASS,
            max_questions=MAX_QUESTIONS,
            page_prefix=PAGE_PREFIX,
            freetext_key=FREETEXT_KEY,
        ))

print("Generated", 3 + 9 + 3 + 3, "Level 2 files")
