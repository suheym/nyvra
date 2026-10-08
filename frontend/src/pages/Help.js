import React, { useState } from 'react';
import { UserButton } from '@clerk/react';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    id: 'faq-1',
    question: 'How does Nyvra work?',
    answer:
      'Nyvra combines your daily habit information with journal-based analysis to provide wellness insights and trends. The system looks at patterns in the information you provide, but its results are intended for self-reflection and awareness — not medical diagnosis.'
  },
  {
    id: 'faq-score-calculated',
    question: 'How is my score calculated?',
    answer:
      'Nyvra combines information from your habits and journal to generate a wellness indicator. The current analysis uses model-based signals together with journal text analysis. The result is intended to help you notice patterns and reflect on your wellbeing, not to provide a clinical assessment.'
  },
  {
    id: 'faq-2',
    question: 'How long should I use Nyvra?',
    answer:
      "There isn't a specific number of days required. Regular check-ins over multiple days can provide more useful personal context and make it easier to notice patterns and trends than relying on a single entry."
  },
  {
    id: 'faq-3',
    question: 'What does my Mental Wellness Index mean?',
    answer:
      'Your Mental Wellness Index is a wellness indicator based on the information you provide. It is not a diagnosis.',
    ranges: [
      { range: '0–20', label: 'Normal' },
      { range: '21–40', label: 'Mild Risk' },
      { range: '41–60', label: 'Moderate Risk' },
      { range: '61–75', label: 'High Risk' },
      { range: '76–100', label: 'Severe Risk' }
    ],
    footnote:
      'These ranges are indicator tiers used within Nyvra to highlight trends in your inputs, not clinical determinations.'
  },
  {
    id: 'faq-4',
    question: 'Why can my score change?',
    answer:
      'Your score can change because your habits, journal content, emotions, and other information can change from day to day. A single score does not tell the whole story, so looking at trends over time can provide more useful context.'
  },
  {
    id: 'faq-score-match-feeling',
    question: "Why doesn't my score always match how I feel?",
    answer:
      'Your score is based on the information available to Nyvra, so it may not always perfectly reflect how you feel. Your own experience and judgment are important. Use the score as one piece of information rather than a definitive description of your wellbeing.'
  },
  {
    id: 'faq-5',
    question: 'What should I write in my journal?',
    answer:
      'Write naturally about your day, thoughts, feelings, experiences, or anything you want to reflect on. There is no required format. You do not need to use specific words to influence your result.'
  },
  {
    id: 'faq-6',
    question: 'Is Nyvra a medical diagnosis?',
    answer:
      'No. Nyvra is an emotional awareness and self-reflection companion. Its wellness scores and insights are not medical diagnoses and should not replace assessment or care from a qualified professional.'
  },
  {
    id: 'faq-7',
    question: 'How is my data handled?',
    answer:
      "Your Nyvra account uses Clerk for authentication. Your journal and habit data are associated with your authenticated account, and Nyvra's backend checks your account before returning or modifying your data. This helps prevent one user from accessing another user's journal or habit information."
  },
  {
    id: 'faq-8',
    question: 'Can I delete my journal entries?',
    answer:
      'Yes. You can use the Clear All option on the Journal page to remove your saved journal entries from Nyvra. Your recent journal trend will also reset until new entries are created.'
  },
  {
    id: 'faq-9',
    question: 'When should I consider professional support?',
    answer:
      'If your thoughts, feelings, or daily experiences are causing significant distress or making it difficult to function, consider speaking with a qualified mental health professional or someone you trust. Nyvra is a self-reflection tool and is not a substitute for professional care.'
  },
  {
    id: 'faq-10',
    question: 'What should I do in an emergency or crisis?',
    answer:
      'If you feel that you may hurt yourself or someone else, or you are in immediate danger, seek urgent help from local emergency services or a crisis service in your area, and consider reaching out to someone you trust. Nyvra is not an emergency service.'
  }
];

function Help() {
  const [openFaqId, setOpenFaqId] = useState(null);
  const navigate = useNavigate();

  const handleToggleFaq = (id) => {
    setOpenFaqId((current) => (current === id ? null : id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate(-1)}
              aria-label="Go back"
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            <div
              style={styles.logoRow}
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
            >
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
        </header>

        {/* Page Title Section */}
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Help & FAQs</h1>
          <p style={styles.subtitle}>
            Learn how Nyvra works, understand your wellness insights, and get the
            most from your experience.
          </p>
        </div>

        {/* Intro Card */}
        <div style={styles.introCard}>
          <div style={styles.introHeader}>
            <span style={{ fontSize: '18px' }}>🌱</span>
            <h2 style={styles.introTitle}>How to get the most from Nyvra</h2>
          </div>
          <ul style={styles.introList}>
            <li style={styles.introListItem}>
              <strong>Check in regularly:</strong> Consistent check-ins over
              multiple days can provide a clearer picture of your personal
              patterns and trends than relying on a single day.
            </li>
            <li style={styles.introListItem}>
              <strong>Track honestly:</strong> Record your sleep, diet, stress,
              social connection, and work or study hours as they truly happen.
            </li>
            <li style={styles.introListItem}>
              <strong>Journal naturally:</strong> Write openly about your
              experiences and feelings — there is no &quot;right&quot; or
              prescribed format.
            </li>
            <li style={styles.introListItem}>
              <strong>Focus on trends:</strong> Reviewing patterns across
              several check-ins provides more meaningful personal context.
            </li>
            <li style={styles.introListItem}>
              <strong>No required timeframe:</strong> There is no specific
              number of days required to use Nyvra; use it at whatever cadence
              supports your reflection best.
            </li>
          </ul>
        </div>

        {/* FAQs Section */}
        <div style={styles.faqSection}>
          <div style={styles.faqList}>
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const contentId = `${faq.id}-content`;

              return (
                <div key={faq.id} style={styles.faqCard}>
                  <button
                    type="button"
                    style={styles.faqButton}
                    onClick={() => handleToggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                  >
                    <span style={styles.faqQuestionText}>{faq.question}</span>
                    <span
                      style={{
                        ...styles.chevron,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div id={contentId} style={styles.faqAnswerContainer}>
                      <p style={styles.faqAnswerText}>{faq.answer}</p>

                      {faq.ranges && (
                        <div style={styles.rangesBlock}>
                          <div style={styles.rangesList}>
                            {faq.ranges.map((item) => (
                              <div key={item.range} style={styles.rangeRow}>
                                <span style={styles.rangeNumbers}>
                                  {item.range}:
                                </span>
                                <span style={styles.rangeLabel}>
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                          {faq.footnote && (
                            <p style={styles.rangeFootnote}>{faq.footnote}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Note Card */}
        <div style={styles.safetyCard}>
          <div style={styles.safetyHeader}>
            <span style={{ fontSize: '18px' }}>🛡️</span>
            <h2 style={styles.safetyTitle}>Important safety note</h2>
          </div>
          <p style={styles.safetyText}>
            Nyvra is designed for self-reflection and emotional awareness. It does
            not diagnose mental health conditions or replace professional care.
            If you are experiencing a crisis or immediate danger, seek
            appropriate emergency or crisis support in your area.
          </p>
        </div>
      </div>
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
    overflowY: 'auto'
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
    background: '#ffffff',
    borderBottom: '1px solid #eeeef3'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  backButton: {
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

  /* Intro Card */
  introCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '18px 20px',
    margin: '12px 16px',
    border: '1px solid #eeeef3',
    boxShadow: '0 3px 14px rgba(35, 30, 70, 0.04)'
  },

  introHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },

  introTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#25283a',
    margin: 0
  },

  introList: {
    margin: 0,
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  introListItem: {
    fontSize: '12px',
    color: '#555b6e',
    lineHeight: '1.5'
  },

  /* FAQs Section */
  faqSection: {
    margin: '12px 0'
  },

  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '0 16px'
  },

  faqCard: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #eeeef3',
    boxShadow: '0 2px 10px rgba(35, 30, 70, 0.03)',
    overflow: 'hidden'
  },

  faqButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px'
  },

  faqQuestionText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#25283a',
    lineHeight: '1.4',
    flex: 1
  },

  chevron: {
    fontSize: '14px',
    color: '#5B3FD1',
    fontWeight: '700',
    transition: 'transform 0.2s ease',
    flexShrink: 0
  },

  faqAnswerContainer: {
    padding: '0 18px 16px',
    borderTop: '1px solid #f8f8fc'
  },

  faqAnswerText: {
    fontSize: '13px',
    color: '#555b6e',
    lineHeight: '1.55',
    margin: '12px 0 0 0'
  },

  rangesBlock: {
    marginTop: '10px',
    padding: '10px 12px',
    background: '#fbfaff',
    borderRadius: '10px',
    border: '1px solid #e7e2ff'
  },

  rangesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  rangeRow: {
    display: 'flex',
    gap: '6px',
    fontSize: '12px',
    lineHeight: '1.4'
  },

  rangeNumbers: {
    fontWeight: '700',
    color: '#5B3FD1',
    minWidth: '55px'
  },

  rangeLabel: {
    color: '#25283a',
    fontWeight: '500'
  },

  rangeFootnote: {
    fontSize: '11px',
    color: '#858a99',
    lineHeight: '1.4',
    margin: '8px 0 0 0'
  },

  /* Safety Note Card */
  safetyCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '16px 18px',
    margin: '14px 16px 0',
    border: '1px solid #eeeef3',
    boxShadow: '0 3px 14px rgba(35, 30, 70, 0.04)'
  },

  safetyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },

  safetyTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#25283a',
    margin: 0
  },

  safetyText: {
    fontSize: '11px',
    color: '#555b6e',
    lineHeight: '1.45',
    margin: 0
  }
};

export default Help;