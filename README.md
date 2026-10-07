# Nyvra

> **A full-stack mental wellness platform combining journaling, lifestyle assessments, NLP, computational psycholinguistics, and machine learning to deliver personalized wellness insights and trends.**

Nyvra is a mental wellness companion designed to help users better understand patterns in their emotional well-being through **daily journaling, lifestyle and habit tracking, language-based analysis, and machine-learning-assisted wellness insights**.

Rather than treating mental wellness as a single measurement, Nyvra combines structured lifestyle information with signals extracted from journal language to produce a **Mental Wellness Index**, visualize changes over time, and provide supportive, non-clinical insights.

Nyvra is designed as a **wellness-support tool, not a medical diagnostic system**.

---

## ✨ Why Nyvra?

Mental well-being is influenced by more than one dimension of daily life.

Sleep, stress, work or study pressure, satisfaction, habits, and the way people express themselves through language can all provide useful context when viewed together.

Nyvra explores this idea through a hybrid pipeline:

```text
Lifestyle & Habit Data
        │
        ▼
   XGBoost Model
        │
        │
        ├──────────────┐
        │              │
        ▼              ▼
 Journal Text     NLP / Computational
                  Psycholinguistic Analysis
                        │
                        ▼
                 Sentiment & Emotion
                        │
                        ▼
                 Text Analysis Score
        │              │
        └───────┬──────┘
                ▼
       Combined Wellness Score
                │
                ▼
       Mental Wellness Index
                │
        ┌───────┴────────┐
        ▼                ▼
   Trends & Insights   Support Resources