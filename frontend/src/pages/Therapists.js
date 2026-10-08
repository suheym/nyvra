import React, { useState } from 'react';
import { UserButton } from '@clerk/react';
import { useNavigate } from 'react-router-dom';

const therapists = [
  {
    name: 'iCall – TISS',
    type: 'Online • Multiple Languages',
    desc: 'Free tele-counselling and mental health support by professionals.',
    tags: ['Free', 'Counselling', 'Crisis Support'],
    languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
    color: '#1a1a2e',
    initial: 'iCall',
    verified: true,
    link: 'https://icallhelpline.org',
  },
  {
    name: 'Vandrevala Foundation',
    type: 'Online • English, Hindi',
    desc: 'Confidential emotional support and suicide prevention services.',
    tags: ['Free', 'Emotional Support', 'Crisis Support'],
    languages: ['English', 'Hindi'],
    color: '#e91e8c',
    initial: '♥',
    verified: true,
    link: 'https://www.vandrevalafoundation.com',
  },
  {
    name: 'YourDOST',
    type: 'Online • Multiple Languages',
    desc: 'Talk to psychologists anytime, anywhere.',
    tags: ['Paid', 'Counselling', 'Therapy'],
    languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
    color: '#ff6b35',
    initial: 'YD',
    verified: true,
    link: 'https://yourdost.com',
  },
  {
    name: 'Practo – Therapy',
    type: 'Online & Offline • Multiple Languages',
    desc: 'Book appointments with verified therapists near you.',
    tags: ['Paid', 'Therapy', 'In-person'],
    languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
    color: '#1565c0',
    initial: 'p',
    verified: true,
    link: 'https://practo.com',
  },
];

const filters = ['All', 'Online', 'Offline', 'Malayalam', 'English', 'Affordable'];

function Therapists() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = therapists.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      t.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase())) ||
      t.type.toLowerCase().includes(activeFilter.toLowerCase()) ||
      (activeFilter === 'Malayalam' && t.languages && t.languages.includes('Malayalam')) ||
      (activeFilter === 'English' && t.languages && t.languages.includes('English')) ||
      (activeFilter === 'Affordable' && t.tags.includes('Free'));
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* 1. Header */}
        <header style={styles.header}>
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
                  objectFit: 'contain',
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

        {/* 2. Page Title */}
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Find Your Support</h1>
          <p style={styles.subtitle}>
            Explore support organizations and therapy services. Availability and credentials should be confirmed with each provider.
          </p>
        </div>

        {/* 3. Search + Filter Button */}
        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#858a99"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '8px', flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search therapists or organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            type="button"
            style={styles.filterBtn}
            aria-label="Filter"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555b6e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* 4. Filter Pills */}
        <div style={styles.filterRow}>
          <div style={styles.filterScroll}>
            {filters.map((f) => {
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  style={{
                    ...styles.filterPill,
                    ...(isActive ? styles.activePill : styles.inactivePill)
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Therapist Cards */}
        <div style={styles.cardList}>
          {filtered.length === 0 ? (
            <div style={styles.noResults}>
              <p style={{ margin: 0 }}>No therapists found for this filter.</p>
            </div>
          ) : (
            filtered.map((t, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.cardTop}>
                  {/* 6. Provider Logo */}
                  <div style={{ ...styles.logo, background: t.color }}>
                    <span style={styles.logoInitial}>{t.initial}</span>
                  </div>

                  <div style={styles.info}>
                    <div style={styles.nameRow}>
                      {/* 7. Provider Name */}
                      <span style={styles.name}>{t.name}</span>
                      {t.verified && (
                        <span style={styles.verified}>✓ Verified</span>
                      )}
                    </div>

                    {/* 8. Provider Type */}
                    <span style={styles.type}>{t.type}</span>
                    <p style={styles.desc}>{t.desc}</p>

                    {/* 9. Tags & Languages */}
                    <div style={styles.tagRow}>
                      {t.tags.map((tag, j) => (
                        <span key={j} style={styles.tag}>{tag}</span>
                      ))}
                      {t.languages && t.languages.map((lang, j) => (
                        <span key={`lang-${j}`} style={styles.langTag}>{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 10. View Details Button */}
                <button
                  type="button"
                  style={styles.viewBtn}
                  onClick={() => window.open(t.link, '_blank')}
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* 11. Trust / Safety Card */}
        <div style={styles.trustCard}>
          <div style={styles.trustHeader}>
            <span style={{ fontSize: '18px' }}>🛡️</span>
            <span style={styles.trustTitle}>Trust & Privacy Guarantee</span>
          </div>
          <p style={styles.trustText}>
            Provider information is supplied by Nyvra and should be independently confirmed.
          </p>
          <p style={styles.trustTextSecondary}>
            Nyvra does not share your journal entries with these providers.
          </p>
        </div>

        {/* 12. Ethics Disclaimer */}
        <div style={styles.ethicsDisclaimer}>
          <p style={styles.ethicsText}>
            ⚠ Nyvra is not a medical diagnosis tool. If you are struggling, please speak to a mental health professional or someone you trust.
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

  /* Search + Filter Row */
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px 6px'
  },

  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    border: '1px solid #eeeef3',
    borderRadius: '12px',
    padding: '10px 12px',
    boxShadow: '0 2px 8px rgba(35, 30, 70, 0.02)'
  },

  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: '#25283a',
    fontFamily: 'inherit'
  },

  filterBtn: {
    width: '42px',
    height: '42px',
    background: '#ffffff',
    border: '1px solid #eeeef3',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0
  },

  /* Filter Pills */
  filterRow: {
    padding: '6px 16px 8px',
    overflow: 'hidden'
  },

  filterScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    paddingBottom: '2px'
  },

  filterPill: {
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },

  activePill: {
    background: '#5B3FD1',
    border: '1px solid #5B3FD1',
    color: '#ffffff',
    fontWeight: '600'
  },

  inactivePill: {
    background: '#ffffff',
    border: '1px solid #eeeef3',
    color: '#555b6e',
    fontWeight: '500'
  },

  /* Therapist Cards */
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '4px 0'
  },

  noResults: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#858a99',
    fontSize: '13px'
  },

  card: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '18px',
    margin: '0 16px',
    border: '1px solid #eeeef3',
    boxShadow: '0 3px 14px rgba(35, 30, 70, 0.04)',
    boxSizing: 'border-box'
  },

  cardTop: {
    display: 'flex',
    gap: '14px',
    marginBottom: '12px',
    alignItems: 'flex-start'
  },

  logo: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  logoInitial: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff'
  },

  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },

  nameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },

  name: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#25283a'
  },

  verified: {
    fontSize: '10px',
    color: '#2e7d32',
    fontWeight: '600',
    background: '#eef8ef',
    padding: '2px 7px',
    borderRadius: '8px'
  },

  type: {
    fontSize: '12px',
    color: '#858a99'
  },

  desc: {
    fontSize: '12px',
    color: '#555b6e',
    lineHeight: '1.5',
    margin: '2px 0 0 0'
  },

  tagRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px'
  },

  tag: {
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '9px',
    background: '#f3f0ff',
    color: '#5B3FD1',
    border: '1px solid #e7e2ff',
    fontWeight: '600'
  },

  langTag: {
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '9px',
    background: '#f0f5ff',
    color: '#2b6cb0',
    border: '1px solid #dbeafe',
    fontWeight: '500'
  },

  viewBtn: {
    width: '100%',
    padding: '11px',
    background: '#5B3FD1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(91, 63, 209, 0.16)'
  },

  /* Trust Card */
  trustCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '16px 18px',
    margin: '14px 16px 0',
    border: '1px solid #eeeef3',
    boxShadow: '0 3px 14px rgba(35, 30, 70, 0.04)'
  },

  trustHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },

  trustTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#25283a'
  },

  trustText: {
    fontSize: '11px',
    color: '#555b6e',
    lineHeight: '1.45',
    margin: '0 0 4px 0'
  },

  trustTextSecondary: {
    fontSize: '11px',
    color: '#858a99',
    lineHeight: '1.45',
    margin: 0
  },

  /* Disclaimer */
  ethicsDisclaimer: {
    margin: '12px 16px 20px',
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
  }
};

export default Therapists;