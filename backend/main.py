from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import spacy
import psycopg2
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

try:
    from .auth import CurrentUser
except ImportError:
    from auth import CurrentUser

app = FastAPI(title="Nyvra API")

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=False,
)

DATABASE_URL = os.getenv("DATABASE_URL")


def get_db():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured")
    return psycopg2.connect(DATABASE_URL)


# Load model and features
BASE_DIR = Path(__file__).resolve().parent
model = joblib.load(BASE_DIR / "model" / "model.pkl")
feature_cols = joblib.load(BASE_DIR / "model" / "feature_cols.pkl")

# Load NLP tools
nlp = spacy.load("en_core_web_sm")
vader = SentimentIntensityAnalyzer()

ABSOLUTE_WORDS = [
    "always", "never", "nothing", "everything", "everyone",
    "nobody", "every", "all", "none", "completely", "totally"
]
UNCERTAINTY_WORDS = [
    "maybe", "perhaps", "i guess", "probably", "i think",
    "not sure", "i dont know", "i don't know"
]


class HabitData(BaseModel):
    gender: int = 1
    age: float = 20.0
    profession: int = 11
    academic_pressure: float = 3.0
    work_pressure: float = 2.0
    study_satisfaction: float = 3.0
    sleep_duration: int = 2
    dietary_habits: int = 1
    suicidal_thoughts: int = 0
    work_study_hours: float = 6.0
    financial_stress: float = 2.0
    family_history: int = 0


class FullAnalysis(BaseModel):
    habits: HabitData
    text: str
    save_to_db: bool = False
    entry_date: Optional[str] = None
    entry_time: Optional[str] = None


class HabitSave(BaseModel):
    entry_date: str
    sleep: str
    diet: str
    exercise: str
    stress: str
    social: str
    score: Optional[int] = None
    risk: Optional[str] = None


def analyze_text(text):
    doc = nlp(text.lower())
    words = [token.text for token in doc]

    pronouns = [t.text for t in doc if t.text in ["i", "me", "my", "myself"]]
    pronoun_ratio = len(pronouns) / max(len(words), 1)

    flagged_absolute = [w for w in ABSOLUTE_WORDS if w in text.lower()]
    flagged_uncertainty = [w for w in UNCERTAINTY_WORDS if w in text.lower()]

    sentiment = vader.polarity_scores(text)

    negative_adj = [
        t.text for t in doc
        if t.pos_ == "ADJ" and sentiment["compound"] < -0.2
    ]

    highlights = list(set(flagged_absolute + flagged_uncertainty + negative_adj))[:6]

    text_score = 0
    text_score += min(pronoun_ratio * 100, 30)
    text_score += len(flagged_absolute) * 5
    text_score += len(flagged_uncertainty) * 3
    text_score += max(0, (-sentiment["compound"]) * 40)
    text_score = min(round(text_score, 1), 100)

    emotions = []
    if sentiment["neg"] > 0.3:
        emotions.append("Anxious")
    if sentiment["neg"] > 0.5:
        emotions.append("Overwhelmed")
    if sentiment["compound"] < -0.5:
        emotions.append("Sad")
    if len(flagged_absolute) > 1:
        emotions.append("Stressed")
    if sentiment["pos"] < 0.1:
        emotions.append("Tired")
    if not emotions:
        emotions.append("Neutral")

    return {
        "sentiment": sentiment,
        "pronoun_ratio": round(pronoun_ratio, 3),
        "flagged_words": highlights,
        "text_risk_score": text_score,
        "emotions": emotions[:3],
    }


@app.get("/")
def root():
    return {"message": "Nyvra backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me")
def me(user_id: CurrentUser):
    return {"user_id": user_id}


@app.post("/analyze")
def analyze(data: FullAnalysis, user_id: CurrentUser):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Journal text cannot be empty")

    features = np.array([[
        data.habits.gender,
        data.habits.age,
        data.habits.profession,
        data.habits.academic_pressure,
        data.habits.work_pressure,
        data.habits.study_satisfaction,
        data.habits.sleep_duration,
        data.habits.dietary_habits,
        data.habits.suicidal_thoughts,
        data.habits.work_study_hours,
        data.habits.financial_stress,
        data.habits.family_history,
    ]])

    proba = model.predict_proba(features)[0]
    depression_probability = round(float(proba[1]) * 100, 1)

    text_analysis = analyze_text(data.text)

    model_score = depression_probability
    combined_score = round(0.7 * model_score + 0.3 * text_analysis["text_risk_score"])
    combined_score = min(combined_score, 100)

    if combined_score <= 20:
        risk = "Normal"
    elif combined_score <= 40:
        risk = "Mild Risk"
    elif combined_score <= 60:
        risk = "Moderate Risk"
    elif combined_score <= 75:
        risk = "High Risk"
    else:
        risk = "Severe Risk"

    habit_names = [
        "Academic Pressure", "Work Pressure", "Sleep",
        "Diet", "Financial Stress", "Study Satisfaction",
        "Work Hours", "Family History"
    ]
    habit_values = [
        data.habits.academic_pressure,
        data.habits.work_pressure,
        3 - data.habits.sleep_duration,
        2 - data.habits.dietary_habits,
        data.habits.financial_stress,
        3 - data.habits.study_satisfaction,
        data.habits.work_study_hours / 3,
        data.habits.family_history,
    ]
    factors = sorted(
        zip(habit_names, habit_values),
        key=lambda x: x[1], reverse=True
    )[:4]

    top_factor = factors[0][0] if factors else "stress"
    insights = {
        "Academic Pressure": "Your academic pressure is significantly affecting your mental wellness. Consider breaking tasks into smaller steps.",
        "Work Pressure": "High work pressure is your biggest risk factor. Try scheduling regular breaks during your day.",
        "Sleep": "Poor sleep is heavily impacting your mental health. Even 30 extra minutes of sleep can make a difference.",
        "Diet": "Your dietary habits are affecting your mental wellness. Small improvements in nutrition can improve mood significantly.",
        "Financial Stress": "Financial stress is weighing on your mental health. Speaking to someone you trust about your concerns may help.",
        "Study Satisfaction": "Low study satisfaction is contributing to your risk. Consider speaking to a counsellor about your academic path.",
        "Work Hours": "You may be overworking. Boundaries between study/work and rest time are important for mental wellness.",
        "Family History": "Your family history is a factor worth being aware of. Regular self-monitoring like this is a great step.",
    }
    insight = insights.get(
        top_factor,
        "Keep tracking your habits regularly to better understand your mental wellness patterns."
    )

    if data.save_to_db:
        if not data.entry_date or not data.entry_time:
            raise HTTPException(status_code=400, detail="entry_date and entry_time are required when saving an entry")
        conn = None
        cur = None
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO journal_entries
                (user_id, entry_date, entry_time, text, score, risk, emotions, highlights)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    user_id,
                    data.entry_date,
                    data.entry_time,
                    data.text,
                    combined_score,
                    risk,
                    text_analysis["emotions"],
                    text_analysis["flagged_words"],
                )
            )
            conn.commit()
        except Exception as exc:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail="Unable to save journal entry") from exc
        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    return {
        "score": combined_score,
        "risk": risk,
        "depression_probability": depression_probability,
        "top_factors": [{"name": f[0], "impact": round(f[1], 2)} for f in factors],
        "highlighted_words": text_analysis["flagged_words"],
        "emotions": text_analysis["emotions"],
        "sentiment": text_analysis["sentiment"],
        "insight": insight,
        "recommend_therapist": combined_score >= 60,
    }


@app.post("/save_habits")
def save_habits(data: HabitSave, user_id: CurrentUser):
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO habit_data
            (user_id, entry_date, sleep, diet, exercise, stress, social, score, risk)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                user_id,
                data.entry_date,
                data.sleep,
                data.diet,
                data.exercise,
                data.stress,
                data.social,
                data.score,
                data.risk,
            )
        )
        conn.commit()
        return {"status": "saved"}
    except Exception as exc:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail="Unable to save habit data") from exc
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/journal_entries")
def get_journal_entries(user_id: CurrentUser):
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """SELECT entry_date, entry_time, text, score, risk, emotions, highlights
               FROM journal_entries
               WHERE user_id = %s
               ORDER BY created_at ASC""",
            (user_id,)
        )
        rows = cur.fetchall()
        return {
            "entries": [
                {
                    "entry_date": row[0],
                    "entry_time": row[1],
                    "text": row[2],
                    "score": row[3],
                    "risk": row[4],
                    "emotions": row[5],
                    "highlights": row[6],
                }
                for row in rows
            ]
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to load journal entries") from exc
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.delete("/journal_entries")
def delete_journal_entries(user_id: CurrentUser):
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM journal_entries WHERE user_id = %s", (user_id,))
        deleted = cur.rowcount
        conn.commit()
        return {"status": "deleted", "count": deleted}
    except Exception as exc:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail="Unable to delete journal entries") from exc
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/habit_data")
def get_habit_data(user_id: CurrentUser):
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """SELECT entry_date, sleep, diet, exercise, stress, social, score, risk, created_at
               FROM habit_data
               WHERE user_id = %s
               ORDER BY created_at ASC""",
            (user_id,)
        )
        rows = cur.fetchall()
        return {"habits": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to load habit data") from exc
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()