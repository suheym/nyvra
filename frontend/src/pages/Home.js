import React, {
  useMemo,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useAuth, useUser, UserButton } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../api';

function GaugeMeter({ value, risk }) {
  const riskColor = (r) => {
    const map = {
      'Normal': '#4CAF50',
      'Mild Risk': '#8BC34A',
      'Moderate Risk': '#FFA500',
      'High Risk': '#FF5722',
      'Severe Risk': '#F44336',
      'No data yet': '#999',
      'Unavailable': '#999'
    };
    return map[r] || '#FFA500';
  };

  const radius = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * radius;
  const fillLength = (value / 100) * circumference;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '200px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '200px',
          height: '120px',
          overflow: 'hidden'
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient
              id="gaugeGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FF5722" />
              <stop offset="25%" stopColor="#FF9800" />
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="75%" stopColor="#8BC34A" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
          </defs>

          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#eeeeee"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${fillLength} ${circumference}`}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '0',
            right: '0',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '44px',
              fontWeight: '800',
              color: '#1a1a1a',
              lineHeight: 1
            }}
          >
            {value}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#aaa',
              marginTop: '2px'
            }}
          >
            /100
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: '14px',
          fontWeight: '700',
          color: riskColor(risk),
          marginTop: '6px'
        }}
      >
        {risk}
      </div>

      <div
        style={{
          fontSize: '12px',
          color: '#888',
          marginTop: '4px',
          textAlign: 'center',
          lineHeight: '1.5'
        }}
      >
        {value <= 40
          ? "You're doing great, keep it up!"
          : "You're doing okay, but there's room for improvement."}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Helpers for normalizing dates and daily wellness history
// ----------------------------------------------------
function normalizeDateKey(rawDate) {
  if (!rawDate) return '';
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(rawDate).trim();
}

function normalizeHabitEntry(entry) {
  if (Array.isArray(entry)) {
    return {
      date: entry[0],
      sleep: entry[1] || '7-8 hours',
      diet: entry[2] || 'Moderate',
      exercise: String(entry[3] ?? '6'),
      stress: String(entry[4] ?? '2'),
      social: String(entry[5] ?? '3'),
      score: Number(entry[6]),
      risk: entry[7]
    };
  }
  return {
    date: entry.entry_date || entry.date,
    sleep: entry.sleep || '7-8 hours',
    diet: entry.diet || 'Moderate',
    exercise: String(entry.exercise ?? '6'),
    stress: String(entry.stress ?? '2'),
    social: String(entry.social ?? '3'),
    score: Number(entry.score),
    risk: entry.risk
  };
}

function buildDailyWellness(journalEntries, habitEntries) {
  const dailyMap = {};

  habitEntries.forEach((rawHabit) => {
    const habit = normalizeHabitEntry(rawHabit);
    const key = normalizeDateKey(habit.date);
    if (!key) return;
    if (!dailyMap[key]) dailyMap[key] = { dateKey: key };
    if (Number.isFinite(habit.score)) {
      dailyMap[key].habitScore = habit.score;
      dailyMap[key].habitRisk = habit.risk;
      dailyMap[key].habitFactors = {
        sleep: habit.sleep,
        diet: habit.diet,
        exercise: habit.exercise,
        stress: habit.stress,
        social: habit.social
      };
    }
  });

  journalEntries.forEach((journal) => {
    const rawDate = journal.entry_date || journal.date;
    const key = normalizeDateKey(rawDate);
    if (!key) return;
    if (!dailyMap[key]) dailyMap[key] = { dateKey: key };
    const score = Number(journal.score);
    if (Number.isFinite(score)) {
      dailyMap[key].journalScore = score;
      dailyMap[key].journalRisk = journal.risk;
    }
  });

  const dailyHistory = Object.values(dailyMap).map((day) => {
    const hasHabit = Number.isFinite(day.habitScore);
    const hasJournal = Number.isFinite(day.journalScore);
    let finalScore = 0;

    if (hasHabit && hasJournal) {
      finalScore = Math.round((day.habitScore + day.journalScore) / 2);
    } else if (hasHabit) {
      finalScore = Math.round(day.habitScore);
    } else if (hasJournal) {
      finalScore = Math.round(day.journalScore);
    }

    return {
      dateKey: day.dateKey,
      score: finalScore,
      habitScore: hasHabit ? day.habitScore : null,
      habitRisk: day.habitRisk || null,
      habitFactors: day.habitFactors || null,
      journalScore: hasJournal ? day.journalScore : null,
      journalRisk: day.journalRisk || null
    };
  });

  dailyHistory.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return dailyHistory;
}

function Home() {
  const [habits, setHabits] = useState({
    sleep: '7-8 hours',
    diet: 'Moderate',
    exercise: '6',
    stress: '2',
    social: '3'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [weeklyChange, setWeeklyChange] = useState(0);
  const [streak, setStreak] = useState(0);

  // Modal state and detail data
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [breakdownDetails, setBreakdownDetails] = useState(null);

  // Onboarding visibility state: only true when history has loaded and has no entries
  const [showOnboarding, setShowOnboarding] = useState(false);

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const api = useMemo(
    () => createApiClient(getToken),
    [getToken]
  );

  const getRisk = (score) => {
    if (score <= 20) return 'Normal';
    if (score <= 40) return 'Mild Risk';
    if (score <= 60) return 'Moderate Risk';
    if (score <= 75) return 'High Risk';
    return 'Severe Risk';
  };

  const getRiskColor = (risk) => {
    const map = {
      'Normal': '#4CAF50',
      'Mild Risk': '#8BC34A',
      'Moderate Risk': '#FFA500',
      'High Risk': '#FF5722',
      'Severe Risk': '#F44336',
      'No data yet': '#999',
      'Unavailable': '#999'
    };
    return map[risk] || '#FFA500';
  };

  const processWellnessState = useCallback((journalEntries, habitEntries) => {
    setStreak(habitEntries.length);

    const hasStarted = journalEntries.length > 0 || habitEntries.length > 0;
    setShowOnboarding(!hasStarted);

    let latestSavedHabit = null;
    if (habitEntries.length > 0) {
      latestSavedHabit = normalizeHabitEntry(habitEntries[habitEntries.length - 1]);
      setHabits({
        sleep: latestSavedHabit.sleep,
        diet: latestSavedHabit.diet,
        exercise: latestSavedHabit.exercise,
        stress: latestSavedHabit.stress,
        social: latestSavedHabit.social
      });
    }

    const history = buildDailyWellness(journalEntries, habitEntries);

    if (history.length >= 2) {
      setWeeklyChange(
        history[history.length - 1].score -
        history[history.length - 2].score
      );
    } else {
      setWeeklyChange(0);
    }

    if (history.length > 0) {
      const latestDay = history[history.length - 1];
      const latestScore = latestDay.score;
      setResult({
        score: latestScore,
        risk: getRisk(latestScore),
        insight: `Your current wellness index is ${latestScore} across tracked days. Keep recording daily for clearer patterns.`,
        recommend_therapist: latestScore >= 60
      });

      setBreakdownDetails({
        score: latestScore,
        risk: getRisk(latestScore),
        journalScore: latestDay.journalScore,
        journalRisk: latestDay.journalRisk || (latestDay.journalScore !== null ? getRisk(latestDay.journalScore) : null),
        habitScore: latestDay.habitScore,
        habitRisk: latestDay.habitRisk || (latestDay.habitScore !== null ? getRisk(latestDay.habitScore) : null),
        habitFactors: latestDay.habitFactors || (latestSavedHabit ? {
          sleep: latestSavedHabit.sleep,
          diet: latestSavedHabit.diet,
          exercise: latestSavedHabit.exercise,
          stress: latestSavedHabit.stress,
          social: latestSavedHabit.social
        } : null)
      });
    } else {
      setResult({
        score: 0,
        risk: 'No data yet',
        insight:
          'Write your first journal entry or save your daily habits to begin building your wellness history.',
        recommend_therapist: false
      });
      setBreakdownDetails(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        const [journalResponse, habitResponse] = await Promise.all([
          api.get('/journal_entries'),
          api.get('/habit_data')
        ]);

        if (cancelled) return;

        const journalEntries = journalResponse.data.entries || [];
        const habitEntries = habitResponse.data.habits || [];

        processWellnessState(journalEntries, habitEntries);
      } catch (err) {
        if (!cancelled) {
          setShowOnboarding(false);
          setResult({
            score: 0,
            risk: 'Unavailable',
            insight:
              'We could not load your wellness history. Please try again shortly.',
            recommend_therapist: false
          });
          setStreak(0);
          setBreakdownDetails(null);
        }
      }
    };

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [api, processWellnessState]);

  const sleepMap = {
    'Less than 5 hours': 0,
    '5-6 hours': 1,
    '7-8 hours': 2,
    'More than 8 hours': 3
  };

  const dietMap = {
    'Unhealthy': 0,
    'Moderate': 1,
    'Healthy': 2
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const now = new Date();

      const entry_date = now.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const response = await api.post('/analyze', {
        habits: {
          gender: 1,
          age: 21,
          profession: 11,
          academic_pressure: parseFloat(habits.stress),
          work_pressure: 2,
          study_satisfaction: parseFloat(habits.social),
          sleep_duration: sleepMap[habits.sleep] ?? 2,
          dietary_habits: dietMap[habits.diet] ?? 1,
          suicidal_thoughts: 0,
          work_study_hours: parseFloat(habits.exercise) || 6,
          financial_stress: 2,
          family_history: 0
        },
        text: 'I am doing okay today.',
        save_to_db: false
      });

      await api.post('/save_habits', {
        entry_date,
        sleep: habits.sleep,
        diet: habits.diet,
        exercise: habits.exercise,
        stress: habits.stress,
        social: habits.social,
        score: response.data.score,
        risk: response.data.risk
      });

      // Re-fetch both data sources to reconstruct combined daily wellness
      const [journalResponse, habitResponse] = await Promise.all([
        api.get('/journal_entries'),
        api.get('/habit_data')
      ]);

      const journalEntries = journalResponse.data.entries || [];
      const habitEntries = habitResponse.data.habits || [];

      processWellnessState(journalEntries, habitEntries);

      setSaveMessage('✓ Daily check-in saved');

      window.setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
      alert(
        'Could not connect to backend. Make sure it is running.'
      );
    }

    setLoading(false);
  };

  const habitOptions = {
    sleep: [
      'Less than 5 hours',
      '5-6 hours',
      '7-8 hours',
      'More than 8 hours'
    ],
    diet: [
      'Unhealthy',
      'Moderate',
      'Healthy'
    ],
    exercise: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10'
    ],
    stress: [
      '1',
      '2',
      '3',
      '4',
      '5'
    ],
    social: [
      '1',
      '2',
      '3',
      '4',
      '5'
    ]
  };

  const habitList = [
    {
      icon: '🌙',
      label: 'Sleep Duration',
      sub: 'How many hours did you sleep?',
      key: 'sleep'
    },
    {
      icon: '🥗',
      label: 'Dietary Habits',
      sub: 'How was your diet today?',
      key: 'diet'
    },
    {
      icon: '🏃',
      label: 'Work/Study Hours',
      sub: 'How many hours did you work or study?',
      key: 'exercise'
    },
    {
      icon: '😰',
      label: 'Stress',
      sub: 'How much pressure did you feel? (1-5)',
      key: 'stress'
    },
    {
      icon: '👥',
      label: 'Social',
      sub: 'How connected do you feel with others?',
      key: 'social'
    }
  ];

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            type="button"
            style={styles.helpButton}
            aria-label="Help and FAQs"
            onClick={() => navigate('/help')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>

          <div style={styles.logoRow}>
            <img
              src="/nyvra-mark.svg"
              alt="Nyvra"
              style={{
                width: '30px',
                height: '30px',
                objectFit: 'contain'
              }}
            />
            <span style={styles.logoText}>Nyvra</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button
            type="button"
            style={styles.headerIconButton}
            aria-label="Notifications"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>

          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: '36px',
                  height: '36px'
                }
              }
            }}
          />
        </div>
      </div>

      <div style={styles.greeting}>
        <h2 style={styles.greetingText}>
          Hello, {user?.firstName || 'there'} 👋
        </h2>

        <p style={styles.greetingSub}>
          Here's your mental wellness overview for today.
        </p>
      </div>

      {result && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.titleWithInfoRow}>
              <span style={styles.cardTitle}>
                Mental Wellness Index
              </span>
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                style={styles.infoIconButton}
                aria-label="Explain Mental Wellness Index"
              >
                ⓘ
              </button>
            </div>
          </div>

          <div style={styles.indexRow}>
            <GaugeMeter
              value={result.score}
              risk={result.risk}
            />

            <div style={styles.statsColumn}>

              <div style={styles.statItem}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color:
                      weeklyChange >= 0
                        ? '#4CAF50'
                        : '#F44336'
                  }}
                >
                  {weeklyChange >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(weeklyChange)} points
                </span>

                <span style={styles.statLabel}>
                  Trend This Week
                </span>

                <span style={styles.statSub}>
                  vs previous entry
                </span>
              </div>

              <div style={styles.statDivider} />

              <div style={styles.statItem}>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a1a1a'
                  }}
                >
                  📝 {streak} entries
                </span>

                <span style={styles.statLabel}>
                  Habit Entries
                </span>

                <span style={styles.statSub}>
                  Keep it up!
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Getting Started with Nyvra Card (rendered only when no entries exist) */}
      {showOnboarding && (
        <div style={styles.onboardingCard}>
          <div style={styles.onboardingHeader}>
            <h3 style={styles.onboardingTitle}>
              🌱 Getting started with Nyvra
            </h3>
            <p style={styles.onboardingSub}>
              Build a clearer picture of your wellness over time.
            </p>
          </div>

          <div style={styles.stepsContainer}>
            <div style={styles.stepItem}>
              <div style={styles.stepBadge}>1</div>
              <div style={styles.stepContent}>
                <span style={styles.stepTitle}>Track your habits</span>
                <p style={styles.stepDesc}>
                  Check in regularly with your sleep, diet, stress, social connection, and work or study hours.
                </p>
              </div>
            </div>

            <div style={styles.stepItem}>
              <div style={styles.stepBadge}>2</div>
              <div style={styles.stepContent}>
                <span style={styles.stepTitle}>Journal naturally</span>
                <p style={styles.stepDesc}>
                  Write honestly about your day and how you're feeling. There is no right way to journal.
                </p>
              </div>
            </div>

            <div style={styles.stepItem}>
              <div style={styles.stepBadge}>3</div>
              <div style={styles.stepContent}>
                <span style={styles.stepTitle}>Review your trends</span>
                <p style={styles.stepDesc}>
                  Consistent check-ins over time can provide more useful personal context than a single day's result.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.tipDivider} />

          <p style={styles.tipText}>
            <strong style={{ color: '#5B3FD1' }}>Tip:</strong> You don't need to use Nyvra for a specific number of days. Regular check-ins simply give you more information about your personal patterns and trends.
          </p>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>
            Track Your Daily Habits
          </span>

          <span style={styles.todayBadge}>
            Today ▾
          </span>
        </div>

        {habitList.map((item) => (
          <div
            key={item.key}
            style={styles.habitRow}
          >
            <span style={{ fontSize: '22px' }}>
              {item.icon}
            </span>

            <div style={styles.habitText}>
              <span style={styles.habitLabel}>
                {item.label}
              </span>

              <span style={styles.habitSub}>
                {item.sub}
              </span>
            </div>

            <select
              value={habits[item.key]}
              onChange={(e) =>
                setHabits({
                  ...habits,
                  [item.key]: e.target.value
                })
              }
              style={styles.select}
            >
              {habitOptions[item.key].map((opt) => (
                <option key={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        {saveMessage && (
          <div
            style={styles.saveMessage}
            role="status"
          >
            {saveMessage}
          </div>
        )}

        <button
          style={{
            ...styles.saveButton,
            opacity: loading ? 0.7 : 1
          }}
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? 'Analysing...'
            : "Save Today's Data"}
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>
            Insights
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#555',
              lineHeight: '1.6',
              flex: 1
            }}
          >
            {result
              ? result.insight
              : '🌱 Fill in your daily habits above and click Save to get personalised insights.'}
          </p>

          <span style={{ fontSize: '40px' }}>
            🧘‍♀️
          </span>
        </div>
      </div>

      {/* Information Modal */}
      {showInfoModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowInfoModal(false)}
        >
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="How your Mental Wellness Index is calculated"
          >
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>
                How your Mental Wellness Index is calculated
              </span>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                style={styles.modalCloseButton}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {breakdownDetails ? (
              <div style={styles.modalBody}>
                {/* Index Banner */}
                <div style={styles.modalIndexBanner}>
                  <div style={styles.modalIndexHeader}>
                    <span style={styles.modalIndexSubtitle}>Mental Wellness Index</span>
                    <span
                      style={{
                        ...styles.modalRiskBadge,
                        backgroundColor: `${getRiskColor(breakdownDetails.risk)}18`,
                        color: getRiskColor(breakdownDetails.risk)
                      }}
                    >
                      {breakdownDetails.risk}
                    </span>
                  </div>
                  <div style={styles.modalScoreBig}>
                    {breakdownDetails.score} <span style={styles.modalScoreSub}>/ 100</span>
                  </div>
                </div>

                <div style={styles.modalSectionTitle}>Today's breakdown</div>

                {/* Journal Breakdown */}
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownCardHeader}>
                    <span style={styles.breakdownCardName}>📖 Journal</span>
                    {breakdownDetails.journalRisk && (
                      <span
                        style={{
                          ...styles.miniBadge,
                          color: getRiskColor(breakdownDetails.journalRisk)
                        }}
                      >
                        {breakdownDetails.journalRisk}
                      </span>
                    )}
                  </div>
                  <div style={styles.breakdownScoreLine}>
                    {breakdownDetails.journalScore !== null
                      ? `Journal Score: ${breakdownDetails.journalScore} / 100`
                      : 'No journal entry recorded for this day'}
                  </div>
                </div>

                {/* Daily Habits Breakdown */}
                <div style={styles.breakdownCard}>
                  <div style={styles.breakdownCardHeader}>
                    <span style={styles.breakdownCardName}>⚡ Daily Habits</span>
                    {breakdownDetails.habitRisk && (
                      <span
                        style={{
                          ...styles.miniBadge,
                          color: getRiskColor(breakdownDetails.habitRisk)
                        }}
                      >
                        {breakdownDetails.habitRisk}
                      </span>
                    )}
                  </div>
                  <div style={styles.breakdownScoreLine}>
                    {breakdownDetails.habitScore !== null
                      ? `Habit Score: ${breakdownDetails.habitScore} / 100`
                      : 'No habits saved for this day'}
                  </div>

                  {breakdownDetails.habitFactors && (
                    <div style={styles.factorsList}>
                      <span style={styles.factorsHeading}>Habit factors:</span>
                      <ul style={styles.factorsUl}>
                        <li style={styles.factorsLi}>
                          <strong>Sleep Duration:</strong> {breakdownDetails.habitFactors.sleep}
                        </li>
                        <li style={styles.factorsLi}>
                          <strong>Dietary Habits:</strong> {breakdownDetails.habitFactors.diet}
                        </li>
                        <li style={styles.factorsLi}>
                          <strong>Work/Study Hours:</strong> {breakdownDetails.habitFactors.exercise}
                        </li>
                        <li style={styles.factorsLi}>
                          <strong>Stress:</strong> {breakdownDetails.habitFactors.stress}
                        </li>
                        <li style={styles.factorsLi}>
                          <strong>Social:</strong> {breakdownDetails.habitFactors.social}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <p style={styles.modalExplanationText}>
                  Your Mental Wellness Index combines your journal and daily habit scores for the current day.
                </p>
              </div>
            ) : (
              <div style={styles.modalBody}>
                <p style={styles.modalExplanationText}>
                  No entries have been saved yet. Save your daily habits or write a journal entry to see your wellness score breakdown.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              style={styles.modalDoneButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: '0 0 20px 0',
    overflowY: 'auto',
    background: '#f7f7fb',
    minHeight: '100vh',
    position: 'relative'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: '#fff',
    borderBottom: '1px solid #eeeef3'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  helpButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'transparent',
    color: '#555b6e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '50%',
    padding: 0
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#6C63FF'
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  headerIconButton: {
    width: '34px',
    height: '34px',
    border: 'none',
    background: 'transparent',
    color: '#555b6e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0
  },

  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#6C63FF',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px'
  },

  greeting: {
    padding: '20px 20px 10px'
  },

  greetingText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#202235',
    lineHeight: '1.25'
  },

  greetingSub: {
    fontSize: '13px',
    color: '#858a99',
    marginTop: '5px',
    lineHeight: '1.5'
  },

  card: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '20px',
    margin: '12px 16px',
    border: '1px solid #eeeef3',
    boxShadow: '0 3px 14px rgba(35, 30, 70, 0.04)'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  titleWithInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#25283a'
  },

  infoIconButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6C63FF',
    fontSize: '15px',
    fontWeight: '700',
    padding: '2px 4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  todayBadge: {
    fontSize: '13px',
    color: '#6C63FF',
    fontWeight: '500',
    background: '#f0eeff',
    padding: '4px 10px',
    borderRadius: '20px'
  },

  indexRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flex: 1,
    paddingLeft: '14px',
    borderLeft: '1px solid #eeeef3'
  },

  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  statDivider: {
    height: '1px',
    background: '#eeeef3'
  },

  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#25283a'
  },

  statSub: {
    fontSize: '11px',
    color: '#8a8f9f'
  },

  /* Getting Started Card Styles */
  onboardingCard: {
    background: '#f8f7ff',
    borderRadius: '18px',
    padding: '18px 20px',
    margin: '12px 16px',
    border: '1px solid #e7e2ff',
    boxShadow: '0 3px 14px rgba(91, 63, 209, 0.04)'
  },

  onboardingHeader: {
    marginBottom: '14px'
  },

  onboardingTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#25283a',
    margin: '0 0 3px 0'
  },

  onboardingSub: {
    fontSize: '12px',
    color: '#858a99',
    margin: 0,
    lineHeight: '1.4'
  },

  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px'
  },

  stepBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#5B3FD1',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px'
  },

  stepContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  stepTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#25283a'
  },

  stepDesc: {
    fontSize: '12px',
    color: '#555b6e',
    margin: 0,
    lineHeight: '1.45'
  },

  tipDivider: {
    height: '1px',
    background: '#e7e2ff',
    margin: '14px 0 10px 0'
  },

  tipText: {
    fontSize: '11px',
    color: '#717588',
    lineHeight: '1.45',
    margin: 0
  },

  habitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 0',
    borderBottom: '1px solid #f1f1f5'
  },

  habitText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  habitLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#25283a'
  },

  habitSub: {
    fontSize: '12px',
    color: '#8a8f9f'
  },

  select: {
    fontSize: '12px',
    color: '#5B3FD1',
    fontWeight: '600',
    background: '#f3f0ff',
    padding: '7px 10px',
    borderRadius: '10px',
    border: '1px solid #e7e2ff',
    outline: 'none',
    cursor: 'pointer'
  },

  saveMessage: {
    marginTop: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#eef8ef',
    color: '#3f7f45',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'center'
  },

  saveButton: {
    width: '100%',
    padding: '14px',
    background: '#5B3FD1',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(91, 63, 209, 0.18)'
  },

  /* Modal Styles */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 40, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  },

  modalContent: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '22px 20px',
    maxWidth: '390px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #eeeef3',
    boxShadow: '0 12px 32px rgba(35, 30, 70, 0.16)',
    display: 'flex',
    flexDirection: 'column'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px'
  },

  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#202235',
    lineHeight: '1.3'
  },

  modalCloseButton: {
    background: '#f4f4f8',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    color: '#777',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  modalIndexBanner: {
    background: '#f9f9fd',
    border: '1px solid #eeeef3',
    borderRadius: '14px',
    padding: '12px 14px'
  },

  modalIndexHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },

  modalIndexSubtitle: {
    fontSize: '12px',
    color: '#858a99',
    fontWeight: '600'
  },

  modalRiskBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '8px'
  },

  modalScoreBig: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: '1'
  },

  modalScoreSub: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#aaa'
  },

  modalSectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#25283a',
    marginTop: '2px'
  },

  breakdownCard: {
    background: '#fafafc',
    border: '1px solid #eeeef3',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  breakdownCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  breakdownCardName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#25283a'
  },

  miniBadge: {
    fontSize: '11px',
    fontWeight: '700'
  },

  breakdownScoreLine: {
    fontSize: '12px',
    color: '#555',
    fontWeight: '500'
  },

  factorsList: {
    marginTop: '6px',
    borderTop: '1px solid #eeeef3',
    paddingTop: '6px'
  },

  factorsHeading: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6C63FF',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    display: 'block',
    marginBottom: '4px'
  },

  factorsUl: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '12px',
    color: '#555b6e',
    lineHeight: '1.6'
  },

  factorsLi: {
    marginBottom: '2px'
  },

  modalExplanationText: {
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.5',
    margin: '4px 0 0 0'
  },

  modalDoneButton: {
    marginTop: '18px',
    padding: '12px',
    background: '#5B3FD1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 10px rgba(91, 63, 209, 0.18)'
  }
};

export default Home;