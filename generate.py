import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# PLACEHOLDER CONTENT — pediatric ECG themed sample questions.
# Edit the text below to swap in real content. Each question has:
#   text          - the question prompt
#   choices       - exactly 3 answer choices (index 0, 1, 2)
#   correct       - index (0/1/2) of the correct choice
#   correct_expl  - shown when the user answers correctly
#   unsure_expl   - shown when incorrect + low confidence (brief, gentle)
#   confident_expl- shown when incorrect + high confidence (fuller, didactic)
# ---------------------------------------------------------------------------
QUESTIONS = {
    1: {
        "text": "A 4-year-old patient's ECG shows a heart rate of 150 bpm with a normal P wave before every QRS complex. What is the most likely rhythm?",
        "choices": [
            "Normal sinus rhythm for this age",
            "Supraventricular tachycardia (SVT)",
            "Sinus bradycardia",
        ],
        "correct": 0,
        "correct_expl": "Correct. Normal heart rate ranges are age-dependent, and 150 bpm with a clearly identifiable P wave before every QRS is consistent with sinus tachycardia or a normal upper-range sinus rhythm for a 4-year-old, not a pathologic arrhythmia.",
        "unsure_expl": "Not quite. The key clue here is the presence of a normal P wave before every QRS complex — that's the hallmark of a sinus mechanism. In young children, normal resting heart rates run higher than in adults, so 150 bpm can still be a normal sinus rhythm for this age.",
        "confident_expl": "This is a common pitfall: a fast rate is mistaken for SVT without checking the P waves first. The single most important discriminator between sinus tachycardia and SVT is P-wave morphology and its relationship to the QRS — SVT typically shows an abnormal, absent, or retrograde P wave, or none at all. Since a normal P wave precedes every QRS here, this points to a sinus mechanism, not SVT. Remember: pediatric normal heart rate ranges are much wider and higher than adult ranges, especially in preschool-age children, so rate alone should never be your only criterion.",
    },
    2: {
        "text": "On a pediatric ECG, you measure a PR interval of 90 ms in a 2-year-old. How should this be interpreted?",
        "choices": [
            "Prolonged PR interval, concerning for first-degree AV block",
            "Normal PR interval for this age",
            "Shortened PR interval, concerning for pre-excitation",
        ],
        "correct": 1,
        "correct_expl": "Correct. Normal PR interval ranges are shorter in young children than in adults, and 90 ms falls within the expected normal range for a 2-year-old.",
        "unsure_expl": "Not quite. PR interval norms scale with age — young children normally have shorter PR intervals than adults, so a value that would look short on an adult ECG can be entirely normal in a toddler.",
        "confident_expl": "It's easy to apply adult PR-interval cutoffs to a pediatric ECG, but normal ranges shift meaningfully with age. In a 2-year-old, 90 ms sits comfortably within the normal reference range — it is neither a first-degree block (which requires prolongation beyond the age-adjusted upper limit) nor pre-excitation (which requires an interval shorter than the age-adjusted lower limit, typically paired with a delta wave). Always check interval norms against an age-specific reference table before flagging an abnormality.",
    },
    3: {
        "text": "A newborn's ECG shows a QRS duration of 100 ms. Is this considered within normal limits for a neonate?",
        "choices": [
            "Yes, this is normal for a neonate",
            "No, this is abnormally prolonged for a neonate",
            "No, this is abnormally short for a neonate",
        ],
        "correct": 1,
        "correct_expl": "Correct. Neonatal QRS durations are normally quite narrow (typically well under 90 ms), so 100 ms represents prolongation and should prompt evaluation for a conduction abnormality.",
        "unsure_expl": "Not quite. Neonates normally have much narrower QRS complexes than older children or adults, so a duration of 100 ms is on the prolonged side for this age group rather than being normal.",
        "confident_expl": "A common mistake is anchoring on adult QRS norms, where 100 ms is unremarkable. Neonatal conduction system properties are different — normal neonatal QRS duration is narrower, so 100 ms represents meaningful prolongation for this age and should raise concern for a conduction abnormality (such as a bundle branch block or ventricular conduction delay) rather than being dismissed as normal.",
    },
    4: {
        "text": "You calculate a corrected QT interval (QTc) of 480 ms in an 8-year-old. What does this finding suggest?",
        "choices": [
            "This is a normal QTc",
            "This is a prolonged QTc, warranting further evaluation",
            "This is a shortened QTc",
        ],
        "correct": 1,
        "correct_expl": "Correct. A QTc of 480 ms exceeds the generally accepted upper limit of normal (roughly 440-460 ms depending on the reference used) and should prompt further evaluation for causes of QT prolongation.",
        "unsure_expl": "Not quite. A QTc around 480 ms is above the typical upper limit of normal for children, which generally falls in the 440-460 ms range, so this value should be flagged as prolonged rather than normal.",
        "confident_expl": "It can be tempting to treat any QTc under 500 ms as reassuring, but the clinically meaningful cutoff for concern is much lower — generally 440-460 ms depending on the reference standard used. A QTc of 480 ms clearly exceeds that threshold and warrants further work-up (medication review, electrolyte check, family history, consideration of congenital long QT syndrome) rather than being written off as normal or borderline.",
    },
    5: {
        "text": "An ECG rhythm strip in an infant shows a regular, narrow-complex tachycardia at 220 bpm with no clearly visible P waves. What is the most likely diagnosis?",
        "choices": [
            "Sinus tachycardia",
            "Supraventricular tachycardia (SVT)",
            "Ventricular tachycardia",
        ],
        "correct": 1,
        "correct_expl": "Correct. A very regular, narrow-complex tachycardia at a rate this high with absent visible P waves is the classic presentation of SVT in infants, in contrast to sinus tachycardia (which usually shows visible P waves and more rate variability).",
        "unsure_expl": "Not quite. The combination of an unusually fast, perfectly regular rate with no visible P waves is atypical for sinus tachycardia, which normally shows some rate variability and clear P waves. This pattern points to SVT instead.",
        "confident_expl": "Sinus tachycardia in infants can occasionally reach high rates, but it almost always shows visible P waves and some beat-to-beat rate variability with the underlying clinical state (fever, agitation, etc). A rate this high (220 bpm) that is machine-regular and lacks visible P waves is a classic SVT pattern, not sinus tachycardia. Ventricular tachycardia, by contrast, would typically show a wide-complex rhythm — since this strip is narrow-complex, VT is far less likely here.",
    },
    6: {
        "text": "On an ECG rhythm strip, you observe a progressively lengthening PR interval across several beats until a QRS complex is dropped, then the pattern restarts. What type of AV block is this?",
        "choices": [
            "Mobitz Type I (Wenckebach)",
            "Mobitz Type II",
            "Third-degree (complete) AV block",
        ],
        "correct": 0,
        "correct_expl": "Correct. Progressive PR prolongation culminating in a dropped beat, with the pattern then resetting, is the defining feature of Mobitz Type I (Wenckebach) second-degree AV block.",
        "unsure_expl": "Not quite. The key distinguishing feature here is that the PR interval gets progressively longer before the dropped beat — that gradual lengthening pattern is specific to Mobitz Type I (Wenckebach), rather than Mobitz Type II or complete block.",
        "confident_expl": "It's easy to see 'a dropped beat' and jump straight to Mobitz Type II, but the two are distinguished by what happens to the PR interval leading up to the drop. Mobitz Type I (Wenckebach) shows progressive PR lengthening before the dropped beat, then the cycle resets. Mobitz Type II shows a constant PR interval right up until the sudden dropped beat, with no progressive lengthening. Third-degree block is different again — there, P waves and QRS complexes are completely dissociated with no conducted beats at all. The progressive-lengthening pattern described here is the textbook signature of Wenckebach.",
    },
}


def esc(s):
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


SIDEBAR_HTML = """<div class="sidebar">
<div class="sidebar-image-slot">
<img src="images/progress-icon-placeholder.svg" alt="Goal marker" class="sidebar-image">
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
<img src="images/progress-marker-placeholder.svg" alt="Progress character">
</div>
</div>
<p class="progress-label">Level 1 Progress</p>
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

# sessionStorage key used to hand off "score before this answer -> score
# after this answer" from a question page to the explanation page it
# navigates to, so the bar can animate from wherever it already was.
SCORE_ANIM_KEY = "pedecgScoreAnim"

SIGNOUT_SCRIPT = """document.getElementById("signout-btn").addEventListener("click", () => {{
  signOut(auth).then(() => {{ window.location.href = "index.html"; }});
}});"""

POPOVER_SCRIPT = """setupPopover("ref1-btn", "ref1-overlay");
setupPopover("ref2-btn", "ref2-overlay");"""

QUESTION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Question {n}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
""" + SIDEBAR_HTML + """
<div class="content">
<div class="card">
<p class="score-display" id="score-display"></p>
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
""" + SIDEBAR_RIGHT_HTML + """
""" + POPOVER_HTML + """
<script type="module">
import {{ requireAuth, getLevelState, recordAnswer, explanationPageFor, auth, signOut }} from "./js/game.js";
import {{ setProgressBar }} from "./js/sidebar.js";
import {{ setupPopover }} from "./js/popover.js";

""" + SIGNOUT_SCRIPT + """
""" + POPOVER_SCRIPT + """

const QUESTION_ID = {n};
const CORRECT_INDEX = {correct};
const SCORE_ANIM_KEY = "{score_anim_key}";

requireAuth(async (user) => {{
  const state = await getLevelState(user.uid);
  const score = state ? state.score : 0;
  document.getElementById("score-display").textContent =
    state ? `Current score: ${{state.score}}` : "";
  setProgressBar(score);

  document.getElementById("answer-form").addEventListener("submit", async (e) => {{
    e.preventDefault();
    const choice = parseInt(document.querySelector('input[name="choice"]:checked').value, 10);
    const confidence = document.querySelector('input[name="confidence"]:checked').value;
    const isCorrect = choice === CORRECT_INDEX;
    const {{ delta, newScore }} = await recordAnswer(user.uid, QUESTION_ID, isCorrect, confidence);
    sessionStorage.setItem(SCORE_ANIM_KEY, JSON.stringify({{ from: newScore - delta, to: newScore }}));
    window.location.href = explanationPageFor(QUESTION_ID, isCorrect, confidence);
  }});
}});
</script>
</body>
</html>
"""

EXPLANATION_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{heading} - Question {n}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
""" + SIDEBAR_HTML + """
<div class="content">
<div class="card">
<p class="score-display" id="score-display"></p>
<h2>{heading}</h2>
<p class="correct-answer">Correct answer: {correct_choice}</p>
<p>{explanation}</p>
<button id="continue-btn" class="btn">Continue</button>
</div>
</div>
""" + SIDEBAR_RIGHT_HTML + """
""" + POPOVER_HTML + """
<script type="module">
import {{ requireAuth, getLevelState, determineNextDestination, auth, signOut }} from "./js/game.js";
import {{ setProgressBar, animateProgressBar }} from "./js/sidebar.js";
import {{ setupPopover }} from "./js/popover.js";

""" + SIGNOUT_SCRIPT + """
""" + POPOVER_SCRIPT + """

const SCORE_ANIM_KEY = "{score_anim_key}";

requireAuth(async (user) => {{
  const state = await getLevelState(user.uid);
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
    const next = await determineNextDestination(user.uid);
    window.location.href = next;
  }});
}});
</script>
</body>
</html>
"""

OUTCOMES = [
    ("correct", "correct_expl", "Correct!"),
    ("incorrect_unsure", "unsure_expl", "Not quite"),
    ("incorrect_confident", "confident_expl", "Not quite - let's dig into this one"),
]

for n, q in QUESTIONS.items():
    with open(os.path.join(OUT, f"question{n}.html"), "w") as f:
        f.write(QUESTION_TEMPLATE.format(
            n=n,
            text=esc(q["text"]),
            choice0=esc(q["choices"][0]),
            choice1=esc(q["choices"][1]),
            choice2=esc(q["choices"][2]),
            correct=q["correct"],
            score_anim_key=SCORE_ANIM_KEY,
        ))

    correct_choice_text = esc(q["choices"][q["correct"]])
    for suffix, expl_key, heading in OUTCOMES:
        with open(os.path.join(OUT, f"explanation{n}_{suffix}.html"), "w") as f:
            f.write(EXPLANATION_TEMPLATE.format(
                n=n,
                heading=heading,
                correct_choice=correct_choice_text,
                explanation=esc(q[expl_key]),
                score_anim_key=SCORE_ANIM_KEY,
            ))

print("Generated", 6 + 18, "files")
