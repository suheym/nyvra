import React, { useMemo, useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../api';

// Helper to reliably parse stored dates ("7 Oct 2026") and times ("03:42 PM" / "15:42") into a timestamp
function parseDateTimeToTimestamp(dateStr, timeStr) {
  if (!dateStr) return 0;

  const cleanedDate = String(dateStr).trim();
  const cleanedTime = timeStr ? String(timeStr).trim() : '';

  const combined = cleanedTime ? `${cleanedDate} ${cleanedTime}` : cleanedDate;
  const directParse = Date.parse(combined);
  if (!isNaN(directParse)) {
    return directParse;
  }

  const dateParts = cleanedDate.split(/[\s,-]+/);
  if (dateParts.length >= 3) {
    const day = parseInt(dateParts[0], 10);
    const monthStr = dateParts[1].slice(0, 3).toLowerCase();
    const year = parseInt(dateParts[2], 10);

    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const month = monthMap[monthStr] ?? 0;
    let hours = 0;
    let minutes = 0;

    if (cleanedTime) {
      const isPM = /pm/i.test(cleanedTime);
      const isAM = /am/i.test(cleanedTime);
      const timeCleaned = cleanedTime.replace(/[^\d:]/g, '');
      const [hStr, mStr] = timeCleaned.split(':');
      let parsedH = parseInt(hStr || '0', 10);
      minutes = parseInt(mStr || '0', 10);

      if (isPM && parsedH < 12) parsedH += 12;
      if (isAM && parsedH === 12) parsedH = 0;
      hours = parsedH;
    }

    const fallbackDate = new Date(year, month, day, hours, minutes);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.getTime();
    }
  }

  const fallbackDateOnly = Date.parse(cleanedDate);
  return !isNaN(fallbackDateOnly) ? fallbackDateOnly : 0;
}

function Journal() {
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedEntries, setSavedEntries] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('write');
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const api = useMemo(
    () => createApiClient(getToken),
    [getToken]
  );

  useEffect(() => {
    let cancelled = false;

    const loadEntries = async () => {
      try {
        const response = await api.get('/journal_entries');

        if (cancelled) return;

        const formatted = (response.data.entries || []).map(e => ({
          date: e.entry_date,
          time: e.entry_time,
          text: e.text,
          score: e.score,
          risk: e.risk,
          emotions: e.emotions || [],
          highlights: e.highlights || [],
        }));

        setSavedEntries(formatted);
      } catch (err) {
        if (!cancelled) {
          setSavedEntries([]);
        }
      }
    };

    loadEntries();

    return () => {
      cancelled = true;
    };
  }, [api]);

  // Handle Escape key to close the confirmation modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showClearModal && !deleting) {
        setShowClearModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showClearModal, deleting]);

  const chartHeight = 80;
  const chartWidth = 280;

  // Group entries by calendar date, resolving multiple entries by picking the latest by time
  const dailyEntries = useMemo(() => {
    const dayMap = {};

    savedEntries.forEach((e) => {
      if (!e.date) return;
      const dateKey = String(e.date).trim();
      const currentTimestamp = parseDateTimeToTimestamp(dateKey, e.time);

      if (!dayMap[dateKey]) {
        dayMap[dateKey] = {
          dateStr: dateKey,
          score: e.score,
          latestTimestamp: currentTimestamp,
          dayOrderTimestamp: parseDateTimeToTimestamp(dateKey, null)
        };
      } else {
        if (currentTimestamp >= dayMap[dateKey].latestTimestamp) {
          dayMap[dateKey].score = e.score;
          dayMap[dateKey].latestTimestamp = currentTimestamp;
        }
      }
    });

    const sortedDays = Object.values(dayMap).sort((a, b) => {
      return (a.dayOrderTimestamp || a.latestTimestamp) - (b.dayOrderTimestamp || b.latestTimestamp);
    });

    return sortedDays.slice(-7);
  }, [savedEntries]);

  const trendData = dailyEntries.map(d => d.score);

  const trendDays = dailyEntries.map(d => {
    const parts = d.dateStr.split(' ');
    return `${parts[0] || ''} ${parts[1] || ''}`.trim();
  });

  const maxVal = Math.max(...trendData, 1);
  const minVal = Math.min(...trendData, 0);

  const points =
    trendData.length > 1
      ? trendData
          .map((val, i) => {
            const x =
              (i / (trendData.length - 1)) *
              chartWidth;

            const y =
              chartHeight -
              ((val - minVal) /
                (maxVal - minVal + 1)) *
                chartHeight;

            return `${x},${y}`;
          })
          .join(' ')
      : `${chartWidth / 2},${chartHeight / 2}`;

  const averageScore =
    trendData.length > 0
      ? Math.round(
          trendData.reduce(
            (sum, s) => sum + s,
            0
          ) / trendData.length
        )
      : 0;

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      alert('Please write something first.');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();

      const entry_date = now.toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      );

      const entry_time = now.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

      const response = await api.post('/analyze', {
        habits: {
          gender: 1,
          age: 21,
          profession: 11,
          academic_pressure: 3,
          work_pressure: 2,
          study_satisfaction: 3,
          sleep_duration: 2,
          dietary_habits: 1,
          suicidal_thoughts: 0,
          work_study_hours: 6,
          financial_stress: 2,
          family_history: 0,
        },

        text: entry,
        save_to_db: true,
        entry_date: entry_date,
        entry_time: entry_time,
      });

      const data = response.data;

      const newEntry = {
        date: entry_date,
        time: entry_time,
        text: entry,
        score: data.score,
        risk: data.risk,
        emotions: data.emotions || [],
        highlights: data.highlighted_words || [],
      };

      const updated = [
        ...savedEntries,
        newEntry
      ];

      setSavedEntries(updated);
      setEntry('');

      setSaveMessage('✓ Journal entry saved');

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

  const handleConfirmClearAll = async () => {
    setDeleting(true);
    try {
      await api.delete('/journal_entries');
      setSavedEntries([]);
      setShowClearModal(false);
    } catch (err) {
      console.error(err);
      alert('We could not delete your journal entries. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const latestEntry =
    savedEntries.length > 0
      ? savedEntries[savedEntries.length - 1]
      : null;

  const riskColor = (risk) => {
    const map = {
      'Normal': '#4CAF50',
      'Mild Risk': '#8BC34A',
      'Moderate Risk': '#FFA500',
      'High Risk': '#FF5722',
      'Severe Risk': '#F44336'
    };

    return map[risk] || '#FFA500';
  };

  const getRiskFromScore = (score) => {
    if (score <= 20) return 'Normal';
    if (score <= 40) return 'Mild Risk';
    if (score <= 60) return 'Moderate Risk';
    if (score <= 75) return 'High Risk';

    return 'Severe Risk';
  };

  const displayEntry = latestEntry || {
    score: 0,
    risk: 'No entry yet',
    emotions: [],
    highlights: [],
    time: '—',
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* 1. Header (Cohesive with Home) */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              type="button"
              style={styles.menuButton}
              aria-label="Open menu"
            >
              <span style={styles.menuLine} />
              <span style={styles.menuLine} />
              <span style={styles.menuLine} />
            </button>

            <div
              style={styles.logoRow}
              onClick={() => navigate('/')}
            >
              <span style={{ fontSize: '20px' }}>🌿</span>
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

        {/* 2. Title Section */}
        <div style={styles.titleSection}>
          <h2 style={styles.title}>Journaling</h2>
          <p style={styles.subtitle}>
            Write about how your day was. Your entries help us understand your mental wellness better.
          </p>
        </div>

        {/* 3. Date + New Entry Row */}
        <div style={styles.dateRow}>
          <div style={styles.dateBadge}>
            <span style={{ fontSize: '13px' }}>📅</span>
            <span style={styles.dateText}>
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span style={styles.dropdownCaret}>▾</span>
          </div>

          <button
            style={styles.newEntryBtn}
            onClick={() => {
              setActiveTab('write');
              setEntry('');
            }}
          >
            + New Entry
          </button>
        </div>

        {/* 4. Segmented Control Tabs */}
        <div style={styles.tabContainer}>
          <div style={styles.segmentedControl}>
            <button
              type="button"
              style={{
                ...styles.tabButton,
                ...(activeTab === 'write' ? styles.activeTabButton : styles.inactiveTabButton)
              }}
              onClick={() => setActiveTab('write')}
            >
              Write
            </button>
            <button
              type="button"
              style={{
                ...styles.tabButton,
                ...(activeTab === 'voice' ? styles.activeTabButton : styles.inactiveTabButton)
              }}
              onClick={() => setActiveTab('voice')}
            >
              Voice
            </button>
          </div>
        </div>

        {/* 5. Writing Area Card */}
        <div style={styles.card}>
          {activeTab === 'voice' ? (
            <div style={styles.voicePlaceholder}>
              <span style={{ fontSize: '30px', marginBottom: '6px' }}>🎙️</span>
              <p style={styles.voicePlaceholderText}>
                Voice journaling is coming soon.
              </p>
              <button
                type="button"
                style={styles.backToWriteBtn}
                onClick={() => setActiveTab('write')}
              >
                Switch back to Write
              </button>
            </div>
          ) : (
            <>
              <div style={styles.cardHeader}>
                <span style={styles.inputLabel}>
                  How are you feeling today?
                </span>
                <span style={styles.charCount}>
                  {entry.length}/1000
                </span>
              </div>

              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Start writing about your day..."
                maxLength={1000}
                style={styles.textarea}
              />

              {saveMessage && (
                <div style={styles.saveMessage} role="status">
                  {saveMessage}
                </div>
              )}

              {/* 6. Save Button */}
              <button
                style={{
                  ...styles.saveButton,
                  opacity: loading ? 0.7 : 1
                }}
                onClick={handleSaveEntry}
                disabled={loading}
              >
                {loading ? 'Analysing...' : 'Save Entry'}
              </button>
            </>
          )}
        </div>

        {/* 7. Today's Analysis Card */}
        <div style={styles.card}>
          <div style={styles.analysisHeader}>
            <span style={styles.cardTitle}>
              Today's Analysis
            </span>

            <span style={styles.analysisTime}>
              Entry at {displayEntry.time}
            </span>
          </div>

          <div style={styles.analysisRow}>
            <div
              style={{
                ...styles.scoreCircle,
                borderColor: riskColor(displayEntry.risk)
              }}
            >
              <span style={styles.scoreNumber}>
                {displayEntry.score}
              </span>

              <span
                style={{
                  ...styles.scoreRisk,
                  color: riskColor(displayEntry.risk)
                }}
              >
                {displayEntry.risk}
              </span>
            </div>

            <div style={styles.emotionsCol}>
              {/* 8. Emotion Tags */}
              <span style={styles.emotionsLabel}>
                Top Emotions
              </span>

              <div style={styles.emotionTags}>
                {displayEntry.emotions.length > 0 ? (
                  displayEntry.emotions.map((e, j) => (
                    <span key={j} style={styles.emotionTag}>
                      {e}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '11px', color: '#8a8f9f' }}>None detected</span>
                )}
              </div>

              <p style={styles.scoreMsg}>
                {displayEntry.score <= 20
                  ? 'You seem to be doing great today! 🌟'
                  : displayEntry.score <= 40
                  ? "Keep going, you're doing okay. 🌱"
                  : displayEntry.score <= 60
                  ? "Take it easy today. You've got this. 💙"
                  : 'Consider reaching out to someone you trust. 💜'}
              </p>
            </div>
          </div>

          {/* 9. Highlighted Words */}
          {displayEntry.highlights && displayEntry.highlights.length > 0 && (
            <div style={styles.highlightsSection}>
              <span style={styles.highlightsLabel}>
                Highlighted Words
              </span>

              <div style={styles.highlightTags}>
                {displayEntry.highlights.map((word, j) => (
                  <span key={j} style={styles.highlightTag}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 10. 7-Day Trend */}
          <div style={styles.trendSection}>
            <div style={styles.trendHeader}>
              <span style={styles.trendLabel}>
                7-Day Trend
              </span>

              <span style={styles.avgBadge}>
                Avg: {averageScore} — {getRiskFromScore(averageScore)}
              </span>
            </div>

            <div style={styles.svgWrapper}>
              <svg
                width={chartWidth}
                height={chartHeight + 15}
                style={{ overflow: 'visible' }}
              >
                {trendData.length > 1 && (
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#5B3FD1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {trendData.map((val, idx) => {
                  const x =
                    trendData.length > 1
                      ? (idx / (trendData.length - 1)) * chartWidth
                      : chartWidth / 2;

                  const y =
                    chartHeight -
                    ((val - minVal) / (maxVal - minVal + 1)) * chartHeight;

                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#ffffff"
                      stroke="#5B3FD1"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            <div style={styles.trendDays}>
              {trendDays.map((d, i) => (
                <span key={i} style={styles.trendDay}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 11. Therapist Recommendation */}
        {averageScore >= 60 && (
          <div style={styles.therapistRec}>
            <p style={styles.therapistRecText}>
              💜 Based on your recent entries, speaking to a licensed mental health professional may help provide tailored guidance.
            </p>

            <button
              style={styles.therapistRecBtn}
              onClick={() => navigate('/therapists')}
            >
              Find a Therapist
            </button>
          </div>
        )}

        {/* 12. Previous Entries */}
        {savedEntries.length > 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>
                Previous Entries ({savedEntries.length})
              </span>

              <button
                type="button"
                style={styles.clearBtn}
                onClick={() => setShowClearModal(true)}
              >
                Clear All
              </button>
            </div>

            <div style={styles.prevEntriesList}>
              {[...savedEntries]
                .reverse()
                .map((e, i) => (
                  <div key={i} style={styles.prevEntry}>
                    <div style={styles.prevEntryHeader}>
                      <span style={styles.prevDate}>
                        {e.date} {e.time ? `• ${e.time}` : ''}
                      </span>

                      <span
                        style={{
                          ...styles.prevRisk,
                          color: riskColor(e.risk)
                        }}
                      >
                        {e.risk}
                      </span>
                    </div>

                    <p style={styles.prevText}>
                      {e.text.length > 110
                        ? `${e.text.slice(0, 110)}...`
                        : e.text}
                    </p>

                    {e.emotions && e.emotions.length > 0 && (
                      <div style={styles.prevEmotionsRow}>
                        {e.emotions.map((em, j) => (
                          <span key={j} style={styles.prevEmotion}>
                            {em}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 13. Ethics Disclaimer */}
        <div style={styles.ethicsDisclaimer}>
          <p style={styles.ethicsText}>
            🛡️ Nyvra is an emotional awareness companion and self-reflection space, not a medical diagnostic tool. If you are experiencing a crisis, please speak to a professional or someone you trust.
          </p>
        </div>

      </div>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => {
            if (!deleting) setShowClearModal(false);
          }}
        >
          <div
            style={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
          >
            <div style={styles.modalIconContainer}>
              <span style={{ fontSize: '24px' }}>🗑️</span>
            </div>

            <h3 id="clear-modal-title" style={styles.modalTitle}>
              Clear all journal entries?
            </h3>

            <p style={styles.modalBodyText}>
              All of your journal entries will be permanently deleted. This will also reset your 7-Day Trend and average journal score until you create new entries.
            </p>

            <p style={styles.modalSubText}>
              You'll lose your previous journal history and the information used to show your recent wellness trends.
            </p>

            <div style={styles.modalActionsRow}>
              <button
                type="button"
                style={styles.modalCancelBtn}
                onClick={() => setShowClearModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  ...styles.modalClearBtn,
                  opacity: deleting ? 0.7 : 1
                }}
                onClick={handleConfirmClearAll}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0 0 30px 0',
    background: '#f7f7fb',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto',
    position: 'relative'
  },

  wrapper: {
    width: '100%',
    maxWidth: '430px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },

  /* Header */
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

  menuButton: {
    width: '30px',
    height: '30px',
    padding: '5px 3px',
    border: 'none',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer'
  },

  menuLine: {
    display: 'block',
    width: '19px',
    height: '1.8px',
    borderRadius: '2px',
    background: '#303444'
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
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

  /* Title Section */
  titleSection: {
    padding: '20px 20px 10px'
  },

  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#202235',
    lineHeight: '1.25',
    margin: 0
  },

  subtitle: {
    fontSize: '13px',
    color: '#858a99',
    marginTop: '5px',
    lineHeight: '1.5',
    marginBottom: 0
  },

  /* Date & New Entry */
  dateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px 4px'
  },

  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#ffffff',
    border: '1px solid #eeeef3',
    padding: '6px 10px',
    borderRadius: '10px'
  },

  dateText: {
    fontSize: '12px',
    color: '#25283a',
    fontWeight: '600'
  },

  dropdownCaret: {
    fontSize: '11px',
    color: '#858a99',
    marginLeft: '2px'
  },

  newEntryBtn: {
    background: '#5B3FD1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(91, 63, 209, 0.16)'
  },

  /* Segmented Tabs */
  tabContainer: {
    padding: '8px 16px 2px'
  },

  segmentedControl: {
    display: 'flex',
    background: '#fafafc',
    border: '1px solid #eeeef3',
    borderRadius: '12px',
    padding: '3px'
  },

  tabButton: {
    flex: 1,
    padding: '6px 0',
    borderRadius: '9px',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },

  activeTabButton: {
    background: '#ffffff',
    color: '#5B3FD1',
    fontWeight: '700',
    boxShadow: '0 1px 4px rgba(35, 30, 70, 0.06)'
  },

  inactiveTabButton: {
    background: 'transparent',
    color: '#858a99',
    fontWeight: '600'
  },

  /* Card Defaults */
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
    marginBottom: '14px'
  },

  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#25283a'
  },

  inputLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#25283a',
    margin: 0
  },

  textarea: {
    width: '100%',
    minHeight: '110px',
    border: '1px solid #eeeef3',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#25283a',
    resize: 'vertical',
    outline: 'none',
    background: '#fafafc',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    lineHeight: '1.5'
  },

  charCount: {
    fontSize: '11px',
    color: '#858a99',
    fontWeight: '500'
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

  voicePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    textAlign: 'center'
  },

  voicePlaceholderText: {
    fontSize: '13px',
    color: '#858a99',
    margin: '4px 0 14px'
  },

  backToWriteBtn: {
    background: '#f3f0ff',
    color: '#5B3FD1',
    border: '1px solid #e7e2ff',
    padding: '7px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  /* Analysis */
  analysisHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },

  analysisTime: {
    fontSize: '11px',
    color: '#858a99'
  },

  analysisRow: {
    display: 'flex',
    gap: '14px',
    marginBottom: '14px',
    alignItems: 'center'
  },

  scoreCircle: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    borderWidth: '4px',
    borderStyle: 'solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: '#fafafc'
  },

  scoreNumber: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#202235',
    lineHeight: 1
  },

  scoreRisk: {
    fontSize: '9px',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: '2px'
  },

  emotionsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },

  emotionsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#25283a'
  },

  emotionTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },

  emotionTag: {
    fontSize: '11px',
    padding: '3px 9px',
    borderRadius: '10px',
    background: '#f3f0ff',
    color: '#5B3FD1',
    fontWeight: '600',
    border: '1px solid #e7e2ff'
  },

  scoreMsg: {
    fontSize: '12px',
    color: '#555b6e',
    margin: '3px 0 0 0',
    lineHeight: '1.4'
  },

  /* Highlights */
  highlightsSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f1f5'
  },

  highlightsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#25283a'
  },

  highlightTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px'
  },

  highlightTag: {
    fontSize: '11px',
    padding: '3px 9px',
    borderRadius: '10px',
    background: '#fff9f0',
    color: '#c47814',
    border: '1px solid #fae6cb',
    fontWeight: '500'
  },

  /* 7-Day Trend */
  trendSection: {
    marginTop: '14px',
    borderTop: '1px solid #f1f1f5',
    paddingTop: '14px'
  },

  trendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },

  trendLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#25283a'
  },

  avgBadge: {
    fontSize: '11px',
    background: '#f3f0ff',
    color: '#5B3FD1',
    padding: '3px 8px',
    borderRadius: '10px',
    fontWeight: '600',
    border: '1px solid #e7e2ff'
  },

  svgWrapper: {
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden'
  },

  trendDays: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px'
  },

  trendDay: {
    fontSize: '10px',
    color: '#8a8f9f'
  },

  /* Therapist Support */
  therapistRec: {
    margin: '12px 16px',
    background: '#fbf9ff',
    borderRadius: '18px',
    padding: '16px',
    border: '1px solid #e7e2ff',
    boxShadow: '0 3px 14px rgba(91, 63, 209, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  therapistRecText: {
    fontSize: '12px',
    color: '#555b6e',
    lineHeight: '1.5',
    margin: 0
  },

  therapistRecBtn: {
    background: '#5B3FD1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(91, 63, 209, 0.16)'
  },

  /* Previous Entries */
  clearBtn: {
    fontSize: '11px',
    color: '#F44336',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '2px 4px'
  },

  prevEntriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  prevEntry: {
    background: '#fafafc',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid #f1f1f5'
  },

  prevEntryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },

  prevDate: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#858a99'
  },

  prevRisk: {
    fontSize: '10px',
    fontWeight: '700'
  },

  prevText: {
    fontSize: '12px',
    color: '#25283a',
    lineHeight: '1.45',
    margin: '4px 0 6px 0'
  },

  prevEmotionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },

  prevEmotion: {
    fontSize: '10px',
    padding: '2px 7px',
    borderRadius: '8px',
    background: '#f3f0ff',
    color: '#5B3FD1',
    fontWeight: '500'
  },

  /* Disclaimer */
  ethicsDisclaimer: {
    margin: '8px 16px 20px',
    padding: '12px 14px',
    background: '#fffdf6',
    borderRadius: '14px',
    border: '1px solid #f2ead0'
  },

  ethicsText: {
    fontSize: '11px',
    color: '#8c7d50',
    lineHeight: '1.45',
    margin: 0
  },

  /* Confirmation Modal */
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

  modalCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '24px 20px',
    maxWidth: '380px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #eeeef3',
    boxShadow: '0 12px 32px rgba(35, 30, 70, 0.16)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },

  modalIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fff1f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px'
  },

  modalTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#202235',
    margin: '0 0 10px 0',
    lineHeight: '1.3'
  },

  modalBodyText: {
    fontSize: '13px',
    color: '#555b6e',
    lineHeight: '1.5',
    margin: '0 0 8px 0'
  },

  modalSubText: {
    fontSize: '12px',
    color: '#858a99',
    lineHeight: '1.45',
    margin: '0 0 20px 0'
  },

  modalActionsRow: {
    display: 'flex',
    gap: '10px',
    width: '100%'
  },

  modalCancelBtn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: '12px',
    border: '1px solid #eeeef3',
    background: '#fafafc',
    color: '#555b6e',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },

  modalClearBtn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: '12px',
    border: 'none',
    background: '#F44336',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.24)',
    transition: 'opacity 0.2s ease'
  }
};

export default Journal;