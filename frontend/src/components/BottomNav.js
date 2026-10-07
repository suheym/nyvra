import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function HomeIcon({ active }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function JournalIcon({ active }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v18H7.5A2.5 2.5 0 0 0 5 22V4.5Z" />
      <path d="M5 4.5V20" />
      <path d="M9 7h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

function TherapistsIcon({ active }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20c.5-3.5 2.3-5.5 5.5-5.5s5 2 5.5 5.5" />
      <path d="M14 15c3-.8 5.5 1 6.5 4.5" />
    </svg>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      label: 'Home',
      path: '/',
      icon: HomeIcon
    },
    {
      label: 'Journal',
      path: '/journal',
      icon: JournalIcon
    },
    {
      label: 'Therapists',
      path: '/therapists',
      icon: TherapistsIcon
    }
  ];

  return (
    <nav style={styles.container} aria-label="Primary navigation">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;

        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            style={{
              ...styles.tab,
              color: isActive ? '#5B3FD1' : '#7B8494'
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <span style={styles.icon}>
              <Icon active={isActive} />
            </span>

            <span
              style={{
                ...styles.label,
                fontWeight: isActive ? '700' : '500'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    height: '68px',
    background: '#ffffff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #E9EAF0',
    boxShadow: '0 -2px 12px rgba(25, 30, 50, 0.04)',
    zIndex: 1000,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },

  tab: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    minWidth: '82px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '6px 10px',
  },

  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '23px',
  },

  label: {
    fontSize: '11px',
    lineHeight: '1',
  }
};

export default BottomNav;