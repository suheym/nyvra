# Nyvra
> **A full-stack mental wellness platform combining journaling, lifestyle assessments, NLP, computational psycholinguistics, and machine learning to deliver personalized wellness insights and trends.**
Nyvra is a mental wellness companion designed to help users better understand patterns in their emotional well-being through **daily journaling, lifestyle and habit tracking, language-based analysis, and machine-learning-assisted wellness insights**.
Rather than treating mental wellness as a single measurement, Nyvra combines structured lifestyle information with signals extracted from journal language to produce a **Mental Wellness Index**, visualize changes over time, and provide supportive, non-clinical insights.
Nyvra is designed as a **wellness-support tool, not a medical diagnostic system**.
---
## ✨ Why Nyvra?
Mental well-being is influenced by more than one dimension of daily life.
Sleep, stress, work or study pressure, satisfaction, habits, and the way people express themselves through language can all provide useful context when viewed together.
Nyvra explores this idea through a hybrid analysis pipeline:
```text
Lifestyle & Habit Data
        │
        ▼
   XGBoost Model
        │
        │
Journal Text ─────────────────┐
        │                     │
        ▼                     ▼
NLP / Computational      Sentiment &
Psycholinguistic         Emotion Analysis
Analysis                      │
        │                     │
        └──────────┬──────────┘
                   ▼
            Text Analysis Score
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
  ML Model Score        Text Analysis Score
       │                       │
       └───────────┬───────────┘
                   ▼
          70/30 Combined Score
                   │
                   ▼
        Mental Wellness Index
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Trends           Insights &
                      Support Resources
```
The goal is not to diagnose a mental health condition.
Instead, Nyvra provides a structured way to explore personal wellness patterns and encourages users to seek appropriate professional support when needed.
---
## 🧠 Core Features
### Mental Wellness Index
Nyvra produces a combined wellness/risk score using:
- Lifestyle and habit information
- Machine-learning predictions
- Journal-language analysis
- Sentiment signals
- Inferred emotional signals
- Computational psycholinguistic features
The current scoring system combines:
- **70% ML/model score**
- **30% text-analysis score**
Risk ranges currently used by the application are:
| Score | Category |
|---:|---|
| 0–20 | Normal |
| 21–40 | Mild Risk |
| 41–60 | Moderate Risk |
| 61–75 | High Risk |
| 76–100 | Severe Risk |
These categories are intended as **wellness-oriented indicators**, not medical diagnoses.
---
## 🤖 Machine Learning
Nyvra uses an existing **XGBoost machine-learning model** to analyze structured lifestyle information.
The current ML pipeline uses features derived from information such as:
- Sleep duration
- Dietary habits
- Work/study hours
- Academic/work pressure
- Study satisfaction
- Other structured lifestyle inputs used by the application
The trained model is stored in:
```text
backend/model/model.pkl
```
The associated feature configuration is stored in:
```text
backend/model/feature_cols.pkl
```
Training code is maintained in:
```text
backend/model/train.py
```
The current training pipeline uses the project's student depression dataset as its ML training source.
Nyvra does not currently introduce additional external datasets into the production scoring pipeline.
---
## 🔬 Computational Psycholinguistics
One of Nyvra's more distinctive components is its use of **computational psycholinguistic analysis**.
Journal language is examined for linguistic patterns that can provide additional context alongside structured lifestyle information.
The current analysis considers signals including:
- Pronoun usage
- Absolute or black-and-white language
- Uncertainty language
- Negative or affective adjectives
- Sentiment
- Inferred emotions
- Other linguistic patterns implemented by the backend analysis pipeline
This creates a second analytical signal that complements the structured-data machine-learning model.
The intention is not to interpret individual words as diagnoses, but to examine broader patterns in language.
---
## 📝 NLP & Journal Analysis
Nyvra uses natural-language-processing techniques to analyze journal entries.
The backend currently uses:
- **spaCy**
- **VADER sentiment analysis**
- Custom linguistic feature extraction
- Emotion inference implemented within the existing analysis pipeline
The journal workflow includes:
1. User writes a journal entry.
2. The entry is submitted to the backend.
3. NLP and linguistic features are extracted.
4. Sentiment and emotional signals are analyzed.
5. A text-analysis score is generated.
6. The text-analysis score is combined with the ML score.
7. Nyvra returns a wellness-oriented result and supporting insights.
The journal experience also provides:
- Character counting
- Wellness/risk scoring
- Emotion information
- Highlighted language
- Seven-day trends
- Previous journal entries
- Support recommendations
- Safety and responsible-use messaging
Nyvra also includes a Voice interface in the journal area, although full voice recording and transcription are not currently implemented.
---
## ⚖️ Hybrid Scoring
Nyvra intentionally combines two different sources of information.
### Structured Data
Lifestyle and habit information is processed through the existing XGBoost model.
### Unstructured Data
Journal text is analyzed using NLP, computational psycholinguistics, sentiment analysis, and emotion-related signals.
These signals are then combined using the current:
```text
70% ML Model Score
+
30% Text Analysis Score
=
Combined Wellness Score
```
This hybrid design allows Nyvra to consider both:
- **What is happening in a user's lifestyle**
- **How the user expresses themselves through language**
The model architecture and current weighting are intentionally preserved rather than being changed without validation.
---
## 🌿 Habit Tracking
Nyvra allows users to record lifestyle and habit information that can contribute to their wellness analysis.
Current tracked areas include:
- Sleep duration
- Dietary habits
- Work/study hours
- Stress / pressure
- Social-related factors
- Satisfaction-related factors
Habit information can contribute to the Mental Wellness Index and can be viewed alongside journal-derived information.
---
## 📊 Trends & Insights
Nyvra provides visual feedback intended to help users understand changes over time.
The application includes:
- Weekly wellness trends
- Seven-day journal trends
- Habit information
- Wellness insights
- Combined wellness information
- Journal-specific information
- Home dashboard summaries
The goal is to make changes in personal wellness patterns easier to understand rather than presenting users with raw model outputs alone.
---
## 🏠 Home Dashboard
The Home experience provides an overview of the user's current wellness information.
It includes:
- Mental Wellness Index
- Wellness/risk score
- Habit tracking
- Weekly trends
- Wellness insights
- Therapist/support recommendations
- Combined journal and lifestyle information
The Home dashboard also provides an information view explaining the relationship between:
- Combined score
- Journal score
- Habit score
- Individual wellness factors
---
## 📓 Journal
The Journal experience is one of Nyvra's primary features.
Users can:
- Write journal entries
- Analyze entries
- View wellness/risk information
- See emotions
- Review highlighted words
- View seven-day trends
- Review previous entries
- Clear journal history
- Receive support recommendations
Journal data is persisted through the backend and database while also using browser-side storage for application continuity.
Journal deletion is supported through the application.
---
## 👥 Therapist & Support Resources
Nyvra includes a therapist/support resource experience designed to help users find appropriate external support.
The current interface includes:
- Therapist/support listings
- Search
- Filtering
- Online/offline availability
- Language filtering
- Affordability filtering
- Verification indicators
- External resource links
- Safety and ethics messaging
The current therapist/support listings are maintained as application data rather than being provided through a live therapist marketplace.
Nyvra does not replace professional mental-health care.
---
## 🔐 Authentication
Nyvra uses **Clerk** for authentication and session management.
Authentication is intentionally separated from the application's own database.
Clerk handles the user's authentication/session identity while Nyvra stores the stable Clerk user identifier needed to associate application data with the authenticated user.
The backend verifies authenticated requests before allowing access to protected application data.
---
## 🛡️ User Data Ownership & Isolation
Because Nyvra handles sensitive wellness and journal information, user ownership is enforced at the backend level.
Application records include a user identifier associated with the authenticated Clerk account.
Protected data is scoped to the authenticated user.
This applies to application data such as:
- Journal entries
- Habit data
- User-specific wellness information
The backend does not rely on the frontend alone to decide which records a user can access.
This prevents one authenticated user from intentionally requesting another user's application data through normal API access.
---
## 🗄️ Database
Nyvra uses:
- PostgreSQL
- Neon
- psycopg2
Important application tables include:
```text
journal_entries
habit_data
```
User ownership is represented using the authenticated Clerk user ID.
The database is used for persistent application data rather than relying exclusively on browser storage.
---
## 🚀 Deployment
Nyvra is currently deployed using a simple cloud-based full-stack architecture:
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL / Neon
- Authentication: Clerk
The production frontend is available at:
https://nyvra-wellness.vercel.app
The React frontend communicates with the deployed FastAPI backend hosted on Render, while persistent application data is stored in Neon PostgreSQL.
Production environment variables and secrets are managed through the deployment platforms rather than committed to the repository.
This deployment is currently intended as a portfolio/demo deployment while additional production security hardening and operational improvements continue.
---
## 🏗️ Architecture
Nyvra follows a full-stack architecture:
```text
┌──────────────────────────────┐
│           React UI           │
│                              │
│ Home / Journal / Therapists  │
│ Trends / Habits / Auth       │
└──────────────┬───────────────┘
               │
               │ HTTP / API
               ▼
┌──────────────────────────────┐
│           FastAPI            │
│                              │
│ Authentication              │
│ Validation                  │
│ Analysis                    │
│ Persistence                 │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐   ┌─────────────┐
│ PostgreSQL  │   │  ML / NLP   │
│   / Neon    │   │   Pipeline  │
└─────────────┘   └─────────────┘
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
        XGBoost Model        spaCy / VADER
```
Authentication is handled through Clerk.
The frontend communicates with the FastAPI backend through protected API requests.
The backend connects to PostgreSQL/Neon for persistent application data and loads the existing machine-learning model for structured-data analysis.
---
## 🛠️ Technology Stack
### Frontend
- React 19
- Create React App
- React Router
- Axios
- Recharts
- Framer Motion
- CSS
- Responsive mobile-first UI
### Backend
- Python
- FastAPI
- psycopg2
- Joblib
- XGBoost
- spaCy
- VADER
### Database
- PostgreSQL
- Neon
### Authentication
- Clerk
### Machine Learning
- XGBoost
- Joblib
- Existing trained model
- Structured lifestyle/depression-risk dataset
### NLP
- spaCy
- VADER
- Custom linguistic feature analysis
- Emotion-related analysis
---
## 📁 Project Structure
The major project structure includes:
```text
nyvra/
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── model/
│   │   ├── model.pkl
│   │   ├── feature_cols.pkl
│   │   └── train.py
│   ├── data/
│   └── migrations/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
├── README.md
└── ...
```
The exact structure may evolve as development continues.
---
## 🔌 Backend API
The current FastAPI backend provides endpoints including:
```text
GET  /
GET  /health
GET  /me
POST /analyze
POST /save_habits
GET    /journal_entries
DELETE /journal_entries
GET /habit_data
```
Protected endpoints require authentication.
The API is responsible for:
- Authentication enforcement
- Journal analysis
- Wellness scoring
- Habit persistence
- Journal persistence
- User-specific data retrieval
- User-specific data deletion
---
## 🚀 Getting Started
### Requirements
You will need:
- Node.js
- npm
- Python
- PostgreSQL / Neon database
- Clerk application credentials
### Clone the repository
```bash
git clone https://github.com/suheym/nyvra.git
cd nyvra
```
### Backend Setup
Create and activate a Python virtual environment:
```bash
python -m venv .venv
```
Activate the environment according to your operating system.
Install backend dependencies:
```bash
pip install -r requirements.txt
```
Configure the backend environment variables using a local `.env` file.
**Never commit the `.env` file to GitHub.**
### Frontend Setup
Navigate to the frontend:
```bash
cd frontend
npm install
```
Configure the required frontend environment variables.
Then start the React development server:
```bash
npm start
```
Start the FastAPI backend separately using the project's development configuration.
---
## 🔑 Environment Variables
Nyvra uses environment variables for sensitive configuration.
### Frontend
```text
REACT_APP_CLERK_PUBLISHABLE_KEY
```
### Backend
```text
CLERK_SECRET_KEY
CLERK_AUTHORIZED_PARTIES
DATABASE_URL
CORS_ORIGINS
```
Actual secret values must never be placed directly into source code or committed to Git.
Use a local `.env` file for development and secure environment-variable configuration in production.
---
## 🔒 Security & Privacy
Security is particularly important because Nyvra handles sensitive wellness and journal information.
Current security measures include:
- Clerk-managed authentication
- Backend authentication enforcement
- User-specific database ownership
- Backend-level authorization
- Protected journal endpoints
- Protected habit endpoints
- CORS configuration
- Environment-based secret management
- Git ignore rules for secret files
- Database persistence scoped by user identity
- No reliance on the frontend alone for authorization
The project is being developed with privacy and responsible handling of wellness information as core considerations.
### Production Security
Before production deployment, Nyvra should undergo a dedicated security review covering:
- HTTPS
- Production CORS configuration
- Rate limiting
- Request validation
- Request-size limits
- Security headers
- Dependency vulnerability scanning
- Database permissions
- Production error handling
- Logging/privacy controls
- Secret management
- Deployment configuration
- Backup and recovery procedures
No application can be guaranteed to be completely immune to attacks. The objective is to continuously reduce attack surface and protect user data through layered security controls.
---
## ⚠️ Responsible Use
Nyvra is a **wellness-support application**.
It is not intended to:
- Diagnose depression
- Diagnose another mental-health condition
- Replace a therapist, physician, counselor, or other qualified professional
- Provide emergency medical advice
- Determine a user's clinical status
Machine-learning and language-analysis outputs should be interpreted as supportive indicators rather than medical conclusions.
Users experiencing a mental-health emergency should seek appropriate professional or emergency support.
---
## 🧪 Testing & Validation
Nyvra has been tested across multiple application workflows.
Testing has included:
- Backend health checks
- Frontend production builds
- React/Jest tests
- Authentication flows
- Logout behavior
- Protected-route behavior
- Journal persistence
- Journal refresh persistence
- Journal deletion
- Home/journal synchronization
- Habit persistence
- Wellness score updates
- Therapist filtering
- Therapist navigation
- External resource links
- Seven-day trend behavior
- Backend-unavailable UI behavior
- Authorization bearer-token behavior
- User account isolation
- Cross-account data-access testing
Particular attention has been given to verifying that authenticated users cannot access another user's journal or habit data.
---
## 📌 Current Project Status
Nyvra currently has a functional deployed full-stack implementation with:
- React frontend
- FastAPI backend
- PostgreSQL/Neon persistence
- Clerk authentication
- User-specific data ownership
- XGBoost-based structured-data analysis
- NLP and computational psycholinguistic analysis
- Sentiment analysis
- Emotion-related analysis
- Hybrid wellness scoring
- Journal persistence
- Habit tracking
- Trends and insights
- Therapist/support resources
- Responsive application UI
The application is currently being refined toward production readiness.
---
## 🧭 Future Development
Potential future development includes:
- Production deployment
- Production security hardening
- Improved API abuse protection
- More comprehensive automated testing
- Improved observability and monitoring
- Review and improvement of local-storage/database synchronization
- A production therapist/support data source
- Full voice recording and transcription
- Model evaluation and calibration
- Additional ML experiments
- Dataset comparison and validation
- Bias and fairness analysis
- More comprehensive wellness trend analysis
Future machine-learning changes should be validated against the existing model rather than added simply because additional data or complexity is available.
---
## 💡 What Makes Nyvra Technically Interesting?
Nyvra combines several areas of software engineering and applied machine learning in one application.
### Full-Stack Development
The project integrates:
- React
- FastAPI
- PostgreSQL
- Authentication
- API design
- Persistent storage
- Responsive UI
### Machine Learning
The project uses an existing XGBoost model trained on structured lifestyle/student data.
### Computational Psycholinguistics
The application examines language patterns in journal entries, including linguistic and affective signals.
### Natural-Language Processing
Journal analysis combines:
- spaCy
- VADER
- Linguistic features
- Sentiment
- Emotion-related analysis
### Hybrid Reasoning
Rather than relying entirely on a machine-learning prediction or entirely on text sentiment, Nyvra combines structured and unstructured signals.
### Security-Aware Architecture
Authentication and data ownership are enforced at the backend level rather than trusting the frontend alone.
### Product Engineering
The project also addresses:
- Data persistence
- User experience
- Trends
- Error states
- Responsive design
- Support resources
- Responsible-use messaging
This makes Nyvra both a software-engineering project and an applied machine-learning/NLP project.
---
## 🔭 Development Philosophy
Nyvra is being developed as an existing product rather than as a collection of isolated demonstrations.
The development approach prioritizes:
1. Understanding the existing implementation
2. Preserving working functionality
3. Identifying root causes
4. Making targeted changes
5. Testing changes
6. Reviewing security and privacy implications
7. Refining the product incrementally
The goal is to move Nyvra through:
```text
UNDERSTAND
     ↓
   FIX
     ↓
  REFINE
     ↓
   TEST
     ↓
  SECURE
     ↓
  DEPLOY
```
---
## 👤 Author
**Suhaim Sajeed**
Nyvra is an independently developed full-stack project exploring the intersection of:
- Full-stack engineering
- Machine learning
- Natural-language processing
- Computational psycholinguistics
- Data persistence
- Authentication
- Application security
- Mental-wellness technology
---
## 📄 License
No open-source license has currently been selected for this project.
Unless a license is added, the repository should not be assumed to grant permission to copy, modify, distribute, or commercially use the project's code.
---
## ⚠️ Disclaimer
Nyvra is an educational and wellness-oriented software project.
Its outputs are generated using machine-learning and language-analysis techniques and should not be interpreted as medical diagnoses, clinical assessments, or professional medical advice.
The application is designed to support self-reflection and wellness awareness, not to replace qualified mental-health professionals.