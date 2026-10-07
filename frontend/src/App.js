import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Show,
  SignInButton,
  SignUpButton,
  useUser,
  useSession,
} from '@clerk/react';

import Home from './pages/Home';
import Journal from './pages/Journal';
import Therapists from './pages/Therapists';
import BottomNav from './components/BottomNav';
import './App.css';

function AuthScreen() {
  return (
    <main style={styles.authPage}>
      <section style={styles.authCard}>
        <div style={styles.logo}>
          🌿 <span>Nyvra</span>
        </div>

        <h1 style={styles.authTitle}>
          A calmer space for your wellbeing.
        </h1>

        <p style={styles.authText}>
          Track your habits, reflect through journaling, and understand your
          wellness patterns privately.
        </p>

        <div style={styles.authActions}>
          <SignUpButton mode="modal">
            <button style={styles.primaryButton}>
              Create account
            </button>
          </SignUpButton>

          <SignInButton mode="modal">
            <button style={styles.secondaryButton}>
              Sign in
            </button>
          </SignInButton>
        </div>

        <p style={styles.disclaimer}>
          Nyvra provides wellness support, not medical diagnosis or emergency
          care.
        </p>
      </section>
    </main>
  );
}

function WelcomeTransition({ children }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!userLoaded || !sessionLoaded || !user || !session) {
      return;
    }

    setShowWelcome(true);

    const timer = window.setTimeout(() => {
      setShowWelcome(false);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [userLoaded, sessionLoaded, user, session]);

  if (showWelcome) {
    const firstName =
      user?.firstName ||
      user?.username ||
      'there';

    return (
      <main style={styles.welcomePage}>
        <div style={styles.welcomeContent}>
          <div style={styles.welcomeLeaf}>
            🌿
          </div>

          <div style={styles.welcomeBrand}>
            Nyvra
          </div>

          <h1 style={styles.welcomeTitle}>
            Welcome back, {firstName}
          </h1>

          <p style={styles.welcomeText}>
            Take a moment for yourself.
          </p>

          <div style={styles.welcomeDots}>
            <span style={styles.dot} />
            <span style={styles.dot} />
            <span style={styles.dot} />
          </div>
        </div>
      </main>
    );
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Show when="signed-out">
          <AuthScreen />
        </Show>

        <Show when="signed-in">
          <WelcomeTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/therapists" element={<Therapists />} />
            </Routes>

            <BottomNav />
          </WelcomeTransition>
        </Show>
      </div>
    </Router>
  );
}

const styles = {
  authPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    background:
      'linear-gradient(180deg, #f7f5ff 0%, #f7f7fb 100%)',
  },

  authCard: {
    width: '100%',
    maxWidth: '390px',
    background: '#fff',
    borderRadius: '24px',
    padding: '32px 24px',
    boxShadow: '0 12px 40px rgba(70, 60, 120, 0.10)',
    textAlign: 'center',
  },

  logo: {
    color: '#6C63FF',
    fontSize: '20px',
    fontWeight: '800',
    marginBottom: '26px',
  },

  authTitle: {
    margin: '0 0 10px',
    color: '#1a1a1a',
    fontSize: '27px',
    lineHeight: 1.2,
  },

  authText: {
    margin: '0 auto 24px',
    color: '#777',
    fontSize: '14px',
    lineHeight: 1.65,
    maxWidth: '320px',
  },

  authActions: {
    display: 'grid',
    gap: '10px',
  },

  primaryButton: {
    width: '100%',
    border: 0,
    borderRadius: '12px',
    padding: '13px 16px',
    background: '#6C63FF',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },

  secondaryButton: {
    width: '100%',
    border: '1px solid #ddd9ff',
    borderRadius: '12px',
    padding: '13px 16px',
    background: '#f7f5ff',
    color: '#5b52dd',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },

  disclaimer: {
    margin: '22px 0 0',
    color: '#999',
    fontSize: '11px',
    lineHeight: 1.5,
  },

  welcomePage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background:
      'linear-gradient(180deg, #f7f5ff 0%, #ffffff 100%)',
    animation: 'nyvraWelcomeFadeIn 0.5s ease-out',
  },

  welcomeContent: {
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
    animation: 'nyvraWelcomeRise 0.7s ease-out',
  },

  welcomeLeaf: {
    width: '72px',
    height: '72px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: '#f0edff',
    fontSize: '32px',
    boxShadow: '0 8px 28px rgba(108, 99, 255, 0.12)',
  },

  welcomeBrand: {
    marginBottom: '22px',
    color: '#6C63FF',
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '0.2px',
  },

  welcomeTitle: {
    margin: 0,
    color: '#171a2b',
    fontSize: '27px',
    lineHeight: 1.25,
    fontWeight: '750',
  },

  welcomeText: {
    margin: '10px 0 0',
    color: '#858895',
    fontSize: '14px',
    lineHeight: 1.5,
  },

  welcomeDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '26px',
  },

  dot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#c7c2ee',
  },
};

export default App;